import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Loader2, Layers, Tag as TagIcon, Pencil, Trash2, Check,
  AlertTriangle, Search, Package,
} from 'lucide-react';
import { platformService } from '../../services/platformService';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

/**
 * Category & tag curation for the equipment catalog.
 *
 * Categories and tags are stored on the equipment rows themselves rather than in a
 * lookup table, so "renaming a category" means rewriting every asset filed under it.
 * Both operations therefore run server-side and this modal reloads its data after each.
 *
 * Renaming onto an existing name merges the two. Deleting a category requires a
 * replacement — equipment is never left uncategorized.
 *
 * props: open, onClose, onChanged (called after any mutation so the caller can refresh)
 */
const CategoryManagerModal = ({ open, onClose, onChanged }) => {
  const toast = useToast();

  const [tab, setTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');

  // Inline rename editor — { kind: 'category' | 'tag', original, value }
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete flows
  const [deleteCategory, setDeleteCategory] = useState(null); // stats row
  const [reassignTo, setReassignTo] = useState('');
  const [deleteTag, setDeleteTag] = useState(null); // tag string
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tagsRes] = await Promise.allSettled([
        platformService.getCategoryStats(),
        platformService.getTags(),
      ]);
      if (statsRes.status === 'fulfilled') setCategories(statsRes.value || []);
      if (tagsRes.status === 'fulfilled') setTags(tagsRes.value || []);
      if (statsRes.status === 'rejected') {
        toast.error('Failed to load the category taxonomy');
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      load();
      setSearch('');
      setEditing(null);
      setTab('categories');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  }, [categories, search]);

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? tags.filter((t) => t.includes(q)) : tags;
  }, [tags, search]);

  const totalAssets = useMemo(
    () => categories.reduce((sum, c) => sum + (c.equipmentCount || 0), 0),
    [categories]
  );

  // ---------- Rename / merge ----------
  const commitRename = async () => {
    if (!editing) return;
    const target = editing.value.trim();
    if (!target) {
      toast.error('Name cannot be empty');
      return;
    }
    if (target.toLowerCase() === editing.original.toLowerCase()) {
      setEditing(null);
      return;
    }

    setSaving(true);
    try {
      const res = editing.kind === 'category'
        ? await platformService.renameCategory(editing.original, target)
        : await platformService.renameTag(editing.original, target);
      toast.success(res?.message || 'Renamed');
      setEditing(null);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rename failed');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete ----------
  const openCategoryDelete = (row) => {
    setDeleteCategory(row);
    // Default the replacement to the largest other category
    const fallback = categories.find(
      (c) => c.name.toLowerCase() !== row.name.toLowerCase()
    );
    setReassignTo(fallback?.name || '');
  };

  const confirmCategoryDelete = async () => {
    if (!deleteCategory) return;
    if (deleteCategory.equipmentCount > 0 && !reassignTo) {
      toast.error('Pick a category to move the equipment into');
      return;
    }
    setDeleting(true);
    try {
      const res = await platformService.deleteCategory(deleteCategory.name, reassignTo);
      toast.success(res?.message || 'Category removed');
      setDeleteCategory(null);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove category');
    } finally {
      setDeleting(false);
    }
  };

  const confirmTagDelete = async () => {
    if (!deleteTag) return;
    setDeleting(true);
    try {
      const res = await platformService.deleteTag(deleteTag);
      toast.success(res?.message || 'Tag removed');
      setDeleteTag(null);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove tag');
    } finally {
      setDeleting(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10';

  const tabCls = (active) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
      active
        ? 'bg-primary text-white shadow'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={saving ? undefined : onClose}
              className="fixed inset-0 z-[70] bg-black"
            />
            <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 18 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-2xl max-h-[85vh] flex flex-col pointer-events-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0 flex items-center gap-2">
                      <span className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-lg text-primary border border-primary/20">
                        <Layers className="h-4 w-4" />
                      </span>
                      Manage Categories &amp; Tags
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Rename to merge, or retire a category by moving its assets elsewhere.
                      Changes apply across all {totalAssets} catalogued asset(s).
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Tabs + search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 pt-4">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setTab('categories'); setEditing(null); }} className={tabCls(tab === 'categories')}>
                      <Layers className="h-3.5 w-3.5" /> Categories ({categories.length})
                    </button>
                    <button onClick={() => { setTab('tags'); setEditing(null); }} className={tabCls(tab === 'tags')}>
                      <TagIcon className="h-3.5 w-3.5" /> Tags ({tags.length})
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={tab === 'categories' ? 'Find a category…' : 'Find a tag…'}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {loading ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : tab === 'categories' ? (
                    filteredCategories.length === 0 ? (
                      <p className="py-12 text-center text-xs font-semibold text-slate-400">
                        No categories match "{search}".
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {filteredCategories.map((row) => {
                          const isEditing = editing?.kind === 'category' && editing.original === row.name;
                          return (
                            <li
                              key={row.name}
                              className="flex items-center gap-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 px-3.5 py-2.5 hover:border-primary/30 transition-colors"
                            >
                              {isEditing ? (
                                <>
                                  <input
                                    autoFocus
                                    value={editing.value}
                                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') commitRename();
                                      if (e.key === 'Escape') setEditing(null);
                                    }}
                                    className={inputCls}
                                  />
                                  <button
                                    onClick={commitRename}
                                    disabled={saving}
                                    title="Save"
                                    className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 disabled:opacity-50 cursor-pointer"
                                  >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => setEditing(null)}
                                    disabled={saving}
                                    title="Cancel"
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                      {row.name}
                                      {row.seeded && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                                          built-in
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                    <Package className="h-3 w-3" />
                                    {row.equipmentCount}
                                  </span>
                                  <button
                                    onClick={() => setEditing({ kind: 'category', original: row.name, value: row.name })}
                                    title="Rename or merge"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openCategoryDelete(row)}
                                    disabled={row.equipmentCount === 0 && row.seeded}
                                    title={
                                      row.equipmentCount === 0 && row.seeded
                                        ? 'Built-in category with no assets — nothing to remove'
                                        : 'Retire category'
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )
                  ) : filteredTags.length === 0 ? (
                    <p className="py-12 text-center text-xs font-semibold text-slate-400">
                      {tags.length === 0 ? 'No tags in use yet.' : `No tags match "${search}".`}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {filteredTags.map((t) => {
                        const isEditing = editing?.kind === 'tag' && editing.original === t;
                        return (
                          <li
                            key={t}
                            className="flex items-center gap-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 px-3.5 py-2.5 hover:border-primary/30 transition-colors"
                          >
                            {isEditing ? (
                              <>
                                <input
                                  autoFocus
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitRename();
                                    if (e.key === 'Escape') setEditing(null);
                                  }}
                                  className={inputCls}
                                />
                                <button
                                  onClick={commitRename}
                                  disabled={saving}
                                  title="Save"
                                  className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 disabled:opacity-50 cursor-pointer"
                                >
                                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => setEditing(null)}
                                  disabled={saving}
                                  title="Cancel"
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 min-w-0">
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary">
                                    {t}
                                  </span>
                                </span>
                                <button
                                  onClick={() => setEditing({ kind: 'tag', original: t, value: t })}
                                  title="Rename or merge"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTag(t)}
                                  title="Remove tag from every asset"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Category delete — needs a destination for the orphaned assets */}
      <AnimatePresence>
        {deleteCategory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={deleting ? undefined : () => setDeleteCategory(null)}
              className="fixed inset-0 z-[80] bg-black"
            />
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-sm p-6 pointer-events-auto"
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 border bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertTriangle className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0">
                  Retire "{deleteCategory.name}"?
                </h3>
                {deleteCategory.equipmentCount > 0 ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {deleteCategory.equipmentCount} asset(s) are filed under this category and must
                      be moved. Pick their new category:
                    </p>
                    <select
                      value={reassignTo}
                      onChange={(e) => setReassignTo(e.target.value)}
                      className={`${inputCls} mt-3 cursor-pointer`}
                    >
                      <option value="">Select a category…</option>
                      {categories
                        .filter((c) => c.name.toLowerCase() !== deleteCategory.name.toLowerCase())
                        .map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.equipmentCount})
                          </option>
                        ))}
                    </select>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    No assets use this category, so it will simply stop being offered.
                  </p>
                )}
                <div className="flex gap-2.5 mt-6">
                  <button
                    onClick={() => setDeleteCategory(null)}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCategoryDelete}
                    disabled={deleting || (deleteCategory.equipmentCount > 0 && !reassignTo)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Retire Category
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Tag delete */}
      <ConfirmDialog
        open={!!deleteTag}
        danger
        title={`Remove tag "${deleteTag}"?`}
        message="The tag will be stripped from every asset that carries it. Equipment records themselves are not affected."
        confirmLabel="Remove Tag"
        loading={deleting}
        onConfirm={confirmTagDelete}
        onCancel={() => setDeleteTag(null)}
      />
    </>
  );
};

export default CategoryManagerModal;

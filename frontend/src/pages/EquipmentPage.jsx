import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { platformService, fileUrl } from '../services/platformService';
import { can } from '../utils/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, Eye, RefreshCw, Download,
  ChevronLeft, ChevronRight, SlidersHorizontal, Package,
  ImageIcon, MoreVertical, Repeat, Tag as TagIcon, Layers
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StatusBadge, { ALL_STATUSES, STATUS_CONFIG } from '../components/equipment/StatusBadge';
import EquipmentFormModal from '../components/equipment/EquipmentFormModal';
import CategoryManagerModal from '../components/equipment/CategoryManagerModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

const EquipmentPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // RBAC
  const canAdd = can(user, 'addEquipment');
  const canEdit = can(user, 'editEquipment');
  const canDelete = can(user, 'deleteEquipment');
  const canChangeStatus = can(user, 'changeStatus');
  const canManageCategories = can(user, 'manageCategories');

  // Data
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', labId: '', departmentId: '', status: '', manufacturer: '', tag: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 8;

  // Modals
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', equipment: null });
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null); // { equipment, newStatus }
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusMenuFor, setStatusMenuFor] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catsRes, labsRes, deptsRes, mansRes, tagsRes] = await Promise.allSettled([
        platformService.getCategories(),
        platformService.getLabs(),
        platformService.getDepartments(),
        platformService.getManufacturers(),
        platformService.getTags(),
      ]);
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || []);
      if (labsRes.status === 'fulfilled') setLabs(labsRes.value || []);
      if (deptsRes.status === 'fulfilled') setDepartments(deptsRes.value || []);
      if (mansRes.status === 'fulfilled') setManufacturers(mansRes.value || []);
      if (tagsRes.status === 'fulfilled') setTagOptions(tagsRes.value || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch || undefined,
        category: filters.category || undefined,
        labId: filters.labId || undefined,
        departmentId: filters.departmentId || undefined,
        status: filters.status || undefined,
        manufacturer: filters.manufacturer || undefined,
        tag: filters.tag || undefined,
        page,
        size: pageSize,
      };
      const res = await platformService.getEquipment(params);
      setEquipmentList(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load equipment list. Ensure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(0);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ---------- Actions ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await platformService.deleteEquipment(deleteTarget.equipmentId);
      toast.success(`${deleteTarget.equipmentName} deleted`);
      setDeleteTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete equipment');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setStatusChanging(true);
    try {
      await platformService.changeEquipmentStatus(statusTarget.equipment.equipmentId, statusTarget.newStatus);
      toast.success(`Status changed to ${STATUS_CONFIG[statusTarget.newStatus].label}`);
      setStatusTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    } finally {
      setStatusChanging(false);
    }
  };

  const exportCsv = () => {
    if (!equipmentList.length) {
      toast.info('Nothing to export on this page');
      return;
    }
    const headers = ['Name', 'Code', 'Category', 'Department', 'Laboratory', 'Manufacturer', 'Model', 'Serial Number', 'Status', 'Location', 'Last Updated'];
    const rows = equipmentList.map((e) => [
      e.equipmentName, e.equipmentCode, e.category, e.departmentName, e.labName,
      e.manufacturer || '', e.model || '', e.serialNumber || '',
      STATUS_CONFIG[e.status]?.label || e.status, e.currentLocation || '',
      e.updatedAt ? new Date(e.updatedAt).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `equipment-inventory-page${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('CSV exported');
  };

  const selectCls =
    'px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 cursor-pointer';

  return (
    <PageTransition>
      <div className="space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white my-0 font-heading flex items-center gap-2.5">
              <span className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
                <Package className="h-5 w-5" />
              </span>
              Equipment Inventory
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
              {totalItems} assets registered · {canAdd ? 'Full management access' : 'View-only access'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchEquipment(); fetchMetadata(); }}
              title="Refresh"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            {canManageCategories && (
              <button
                onClick={() => setCategoryManagerOpen(true)}
                title="Rename, merge or retire categories and tags"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" /> Categories
              </button>
            )}
            {canAdd && (
              <button
                onClick={() => setFormModal({ open: true, mode: 'add', equipment: null })}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Equipment
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: search + filters */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, serial number, category or model..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary/40 text-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={selectCls}>
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={filters.departmentId} onChange={(e) => setFilter('departmentId', e.target.value)} className={selectCls}>
                    <option value="">All Departments</option>
                    {departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
                  </select>
                  <select value={filters.labId} onChange={(e) => setFilter('labId', e.target.value)} className={selectCls}>
                    <option value="">All Laboratories</option>
                    {labs.map((l) => <option key={l.labId} value={l.labId}>{l.name}</option>)}
                  </select>
                  <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={selectCls}>
                    <option value="">All Statuses</option>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                  <select value={filters.manufacturer} onChange={(e) => setFilter('manufacturer', e.target.value)} className={selectCls}>
                    <option value="">All Manufacturers</option>
                    {manufacturers.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={filters.tag} onChange={(e) => setFilter('tag', e.target.value)} className={selectCls}>
                    <option value="">All Tags</option>
                    {tagOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setFilters({ category: '', labId: '', departmentId: '', status: '', manufacturer: '', tag: '' }); setPage(0); }}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 px-2 cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Quick tag chips — one click narrows the catalog to a tag */}
                {tagOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                      <TagIcon className="inline h-3 w-3 mr-1" />Tags
                    </span>
                    {tagOptions.slice(0, 14).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter('tag', filters.tag === t ? '' : t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          filters.tag === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-100/60 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-transparent hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Equipment Table */}
        <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="px-4 py-3.5 font-extrabold">Equipment</th>
                  <th className="px-4 py-3.5 font-extrabold hidden md:table-cell">Category</th>
                  <th className="px-4 py-3.5 font-extrabold hidden lg:table-cell">Department / Lab</th>
                  <th className="px-4 py-3.5 font-extrabold hidden xl:table-cell">Manufacturer</th>
                  <th className="px-4 py-3.5 font-extrabold hidden xl:table-cell">Serial No.</th>
                  <th className="px-4 py-3.5 font-extrabold">Status</th>
                  <th className="px-4 py-3.5 font-extrabold hidden lg:table-cell">Updated</th>
                  <th className="px-4 py-3.5 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/40">
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="h-10 w-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
                            <div className="h-2.5 w-1/4 rounded bg-slate-200/50 dark:bg-slate-800/50" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : equipmentList.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      {/* Empty state */}
                      <div className="py-16 text-center">
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                          <Package className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No equipment found</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {activeFilterCount > 0 || debouncedSearch
                            ? 'Try adjusting your search or filters.'
                            : canAdd ? 'Add your first equipment to get started.' : 'No assets registered yet.'}
                        </p>
                        {canAdd && !debouncedSearch && activeFilterCount === 0 && (
                          <button
                            onClick={() => setFormModal({ open: true, mode: 'add', equipment: null })}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Equipment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  equipmentList.map((eq) => (
                    <tr
                      key={eq.equipmentId}
                      className="hover:bg-slate-100/40 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      {/* Equipment: image + name + code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center overflow-hidden shrink-0">
                            {eq.primaryImageUrl ? (
                              <img
                                src={fileUrl(eq.primaryImageUrl)}
                                alt={eq.equipmentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4.5 w-4.5 text-slate-300 dark:text-slate-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => navigate(`/dashboard/equipment/${eq.equipmentId}`)}
                              className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors truncate block max-w-[180px] text-left cursor-pointer"
                            >
                              {eq.equipmentName}
                            </button>
                            <p className="text-[10px] text-slate-400 font-mono">{eq.equipmentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                          {eq.category}
                        </span>
                        {eq.tags && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-[170px]">
                            {eq.tags.split(',').filter(Boolean).slice(0, 3).map((t) => (
                              <button
                                key={t}
                                onClick={() => { setFilter('tag', t); setShowFilters(true); }}
                                title={`Filter by tag "${t}"`}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {t}
                              </button>
                            ))}
                            {eq.tags.split(',').filter(Boolean).length > 3 && (
                              <span className="text-[9px] font-bold text-slate-400 self-center">
                                +{eq.tags.split(',').filter(Boolean).length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{eq.departmentName}</p>
                        <p className="text-[10px] text-slate-400">{eq.labName}</p>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{eq.manufacturer || '—'}</p>
                        <p className="text-[10px] text-slate-400">{eq.model || ''}</p>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{eq.serialNumber || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={eq.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-[10px] text-slate-400">
                          {eq.updatedAt ? new Date(eq.updatedAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/equipment/${eq.equipmentId}`)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {canChangeStatus && (
                            <div className="relative">
                              <button
                                onClick={() => setStatusMenuFor(statusMenuFor === eq.equipmentId ? null : eq.equipmentId)}
                                title="Change Status"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              >
                                <Repeat className="h-3.5 w-3.5" />
                              </button>
                              <AnimatePresence>
                                {statusMenuFor === eq.equipmentId && (
                                  <>
                                    <div className="fixed inset-0 z-20" onClick={() => setStatusMenuFor(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                      className="absolute right-0 mt-1.5 w-44 glass-card dark:glass-card-dark rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 z-30 p-1.5"
                                    >
                                      {ALL_STATUSES.filter((s) => s !== eq.status).map((s) => (
                                        <button
                                          key={s}
                                          onClick={() => {
                                            setStatusMenuFor(null);
                                            setStatusTarget({ equipment: eq, newStatus: s });
                                          }}
                                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                        >
                                          <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                          {STATUS_CONFIG[s].label}
                                        </button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => setFormModal({ open: true, mode: 'edit', equipment: eq })}
                              title="Edit"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(eq)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/40 dark:border-slate-800/40">
              <p className="text-[10px] text-slate-400 font-semibold">
                Page {page + 1} of {totalPages} · {totalItems} items
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add / Edit modal */}
        <EquipmentFormModal
          open={formModal.open}
          mode={formModal.mode}
          equipment={formModal.equipment}
          user={user}
          categories={categories}
          labs={labs}
          departments={departments}
          onClose={() => setFormModal((m) => ({ ...m, open: false }))}
          onSaved={() => { fetchEquipment(); fetchMetadata(); }}
        />

        {/* Category & tag curation */}
        <CategoryManagerModal
          open={categoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
          onChanged={() => {
            // A rename/merge rewrites assets, so the filter vocabularies are stale —
            // and any selected category/tag may no longer exist, which would leave
            // the table looking empty rather than changed
            setFilters((f) => ({ ...f, category: '', tag: '' }));
            setPage(0);
            fetchEquipment();
            fetchMetadata();
          }}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          danger
          title="Delete Equipment?"
          message={`"${deleteTarget?.equipmentName}" (${deleteTarget?.equipmentCode}) and all its images, documents and history will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        {/* Status change confirmation */}
        <ConfirmDialog
          open={!!statusTarget}
          title="Change Equipment Status?"
          message={
            statusTarget
              ? `Change "${statusTarget.equipment.equipmentName}" from ${STATUS_CONFIG[statusTarget.equipment.status]?.label} to ${STATUS_CONFIG[statusTarget.newStatus]?.label}?`
              : ''
          }
          confirmLabel="Change Status"
          loading={statusChanging}
          onConfirm={handleStatusChange}
          onCancel={() => setStatusTarget(null)}
        />
      </div>
    </PageTransition>
  );
};

export default EquipmentPage;

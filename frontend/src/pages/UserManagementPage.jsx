import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Shield, Loader2, AlertTriangle, CheckCircle,
  UserCheck, UserX, X, Save,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ALL_ROLES = [
  'SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER',
  'LAB_TECHNICIAN', 'RESEARCHER', 'STUDENT',
];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banner, setBanner] = useState(null); // { type, text }

  // Role edit modal
  const [editUser, setEditUser] = useState(null);
  const [editRoles, setEditRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers(search, roleFilter);
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300); // debounce search
    return () => clearTimeout(t);
  }, [loadUsers]);

  const showBanner = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3500);
  };

  const openRoleEditor = (u) => {
    setEditUser(u);
    setEditRoles(Array.from(u.roles || []));
  };

  const toggleRole = (role) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (editRoles.length === 0) {
      showBanner('error', 'A user must have at least one role');
      return;
    }
    setSaving(true);
    try {
      const updated = await userService.updateUserRoles(editUser.userId, editRoles);
      setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)));
      showBanner('success', `Roles updated for ${updated.username}`);
      setEditUser(null);
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      const updated = await userService.setUserActive(u.userId, !u.active);
      setUsers((prev) => prev.map((x) => (x.userId === updated.userId ? updated : x)));
      showBanner('success', `${updated.username} ${updated.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> User Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage platform users, assign roles, and control account access.
            </p>
          </div>
        </div>

        {banner && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {banner.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {banner.text}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or email…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 pl-9 pr-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-700/60 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Institution / Dept</th>
                    <th className="px-4 py-3 font-semibold">Roles</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId} className="border-b border-slate-100/60 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-white">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">@{u.username}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div>{u.email}</div>
                        {u.phone && <div className="text-xs text-slate-500 dark:text-slate-400">{u.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div>{u.institution || '—'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{u.department || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(u.roles || []).map((r) => (
                            <span key={r} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
                              {r.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          u.active
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-slate-400/10 text-slate-500'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openRoleEditor(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Shield className="h-3.5 w-3.5" /> Roles
                          </button>
                          <button onClick={() => toggleActive(u)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                              u.active
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'}`}>
                            {u.active ? <><UserX className="h-3.5 w-3.5" /> Deactivate</> : <><UserCheck className="h-3.5 w-3.5" /> Activate</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role edit modal */}
      <AnimatePresence>
        {editUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
              onClick={() => !saving && setEditUser(null)}
              className="fixed inset-0 z-[80] bg-black" />
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-md p-6 pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-primary" /> Edit Roles — @{editUser.username}
                  </h3>
                  <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {ALL_ROLES.map((r) => (
                    <label key={r} className="flex items-center gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <input type="checkbox" checked={editRoles.includes(r)} onChange={() => toggleRole(r)}
                        className="h-4 w-4 rounded accent-primary" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
                <button onClick={saveRoles} disabled={saving}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Roles
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default UserManagementPage;

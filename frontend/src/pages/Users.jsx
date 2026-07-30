import { useState, useEffect } from 'react';
import {
  MdPeople, MdSearch, MdFilterList, MdCheckCircle, MdBlock,
  MdExpandMore, MdAdminPanelSettings, MdEmail, MdBusiness
} from 'react-icons/md';
import { userService } from '../services/services';

const ROLE_COLOR = {
  SYSTEM_ADMIN:    'bg-red-100 text-red-700 border-red-200 font-bold',
  INSTITUTION_ADMIN: 'bg-amber-100 text-amber-800 border-amber-200 font-bold',
  LAB_MANAGER:     'bg-teal-100 text-teal-800 border-teal-200 font-bold',
  LAB_TECHNICIAN:  'bg-yellow-100 text-yellow-800 border-yellow-200 font-bold',
  RESEARCHER:      'bg-purple-100 text-purple-700 border-purple-200 font-bold',
};

const STATUS_COLOR = {
  ACTIVE:    'text-emerald-700 bg-emerald-100 border-emerald-200 font-bold',
  INACTIVE:  'text-slate-700 bg-slate-100 border-slate-200 font-bold',
  SUSPENDED: 'text-rose-700 bg-rose-100 border-rose-200 font-bold',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    userService.getAll()
      .then(r => setUsers(r.data?.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await userService.updateStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = users.filter(u => {
    const name = `${u.firstName} ${u.lastName} ${u.email} ${u.institutionName || ''}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole = !roleFilter || u.roles?.includes(roleFilter);
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold
          ${toast.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Manage registered platform accounts and role permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <MdPeople className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-2xl tracking-tight">{stats.total}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Registered Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <MdCheckCircle className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-2xl tracking-tight">{stats.active}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <MdBlock className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-2xl tracking-tight">{stats.suspended}</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Suspended Accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-60">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or institution..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <MdAdminPanelSettings className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10" />
          <MdExpandMore className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
            <option value="">All Roles</option>
            {['SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN','RESEARCHER'].map(r => (
              <option key={r} value={r} className="bg-white text-slate-900">{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10" />
          <MdExpandMore className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="ACTIVE" className="bg-white text-slate-900">Active</option>
            <option value="SUSPENDED" className="bg-white text-slate-900">Suspended</option>
            <option value="INACTIVE" className="bg-white text-slate-900">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Loading platform users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-slate-700 text-xs font-black px-6 py-4 uppercase tracking-wider">User Profile</th>
                <th className="text-slate-700 text-xs font-black px-6 py-4 uppercase tracking-wider hidden sm:table-cell">Assigned Roles</th>
                <th className="text-slate-700 text-xs font-black px-6 py-4 uppercase tracking-wider hidden md:table-cell">Institution / Dept</th>
                <th className="text-slate-700 text-xs font-black px-6 py-4 uppercase tracking-wider">Account Status</th>
                <th className="text-slate-700 text-xs font-black px-6 py-4 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white font-black text-sm">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 text-sm font-bold truncate">{u.firstName} {u.lastName}</p>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium mt-0.5">
                          <MdEmail className="text-sm flex-shrink-0 text-slate-400" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles?.map(r => (
                        <span key={r} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${ROLE_COLOR[r] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {u.institutionName && (
                        <div className="flex items-center gap-1.5 text-slate-900 text-xs font-bold truncate">
                          <MdBusiness className="text-slate-400 text-sm flex-shrink-0" />
                          <span className="truncate">{u.institutionName}</span>
                        </div>
                      )}
                      <p className="text-slate-600 text-xs font-medium truncate">
                        {u.departmentName || <span className="text-slate-400">—</span>}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${STATUS_COLOR[u.status] || STATUS_COLOR.INACTIVE}`}>
                      {u.status || 'ACTIVE'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(u)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm
                        ${u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      {u.status === 'ACTIVE' ? <><MdBlock className="text-sm" /> Suspend</> : <><MdCheckCircle className="text-sm" /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-semibold">No users match the search criteria</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

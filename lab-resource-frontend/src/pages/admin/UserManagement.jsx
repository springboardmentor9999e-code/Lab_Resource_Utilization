import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, UserCheck, UserX, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { userManagementApi, institutionApi, departmentApi } from '../../api/api';
import useConfirm from '../../hooks/useConfirm';

const ROLES = ['RESEARCHER', 'STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'];

const roleColors = {
  RESEARCHER: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-purple-100 text-purple-700',
  LAB_TECHNICIAN: 'bg-orange-100 text-orange-700',
  LAB_MANAGER: 'bg-green-100 text-green-700',
  DEPARTMENT_HEAD: 'bg-yellow-100 text-yellow-700',
  INSTITUTION_ADMIN: 'bg-red-100 text-red-700',
  SYSTEM_ADMIN: 'bg-gray-800 text-white',
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'RESEARCHER', institutionId: '', departmentId: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const { confirm, confirmModal } = useConfirm();

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => { const res = await institutionApi.getAll(); return res.data; },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', form.institutionId],
    queryFn: async () => { const res = await departmentApi.getByInstitution(form.institutionId); return res.data; },
    enabled: !!form.institutionId,
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = { page, size: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter === 'active';
      const res = await userManagementApi.getAll(params);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => userManagementApi.create(data),
    onSuccess: () => { toast.success('User created'); queryClient.invalidateQueries(['admin-users']); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userManagementApi.update(id, data),
    onSuccess: () => { toast.success('User updated'); queryClient.invalidateQueries(['admin-users']); setModal(null); resetForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userManagementApi.delete(id),
    onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete user'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => userManagementApi.toggleStatus(id),
    onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userManagementApi.changeRole(id, { role }),
    onSuccess: () => { toast.success('Role changed'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change role'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => userManagementApi.resetPassword(id, { newPassword }),
    onSuccess: () => { toast.success('Password reset successfully'); setResetModal(null); setResetPassword(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reset password'),
  });

  const resetForm = () => setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'RESEARCHER', institutionId: '', departmentId: '' });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name, and email are required');
      return;
    }
    if (modal === 'create' && !form.password) {
      toast.error('Password is required');
      return;
    }
    const payload = { ...form };
    if (payload.institutionId) payload.institutionId = parseInt(payload.institutionId);
    if (payload.departmentId) payload.departmentId = parseInt(payload.departmentId);
    if (modal === 'create') {
      createMutation.mutate(payload);
    } else {
      const { password, ...updateData } = payload;
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    }
  };

  const users = userData?.users || [];
  const totalPages = userData?.totalPages || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => { resetForm(); setModal('create'); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input className="input-field flex-1" placeholder="Search by name or email..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="input-field" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="input-field" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Institution</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-sm">{user.firstName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${roleColors[user.role] || 'bg-gray-100'}`}
                          value={user.role}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if (await confirm({ title: 'Change Role', message: `Change role from ${user.role} to ${newRole}?`, confirmText: 'Change', variant: 'warning' })) {
                              changeRoleMutation.mutate({ id: user.id, role: newRole });
                            }
                          }}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.institutionName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatusMutation.mutate(user.id)}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status ? <><UserCheck size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => {
                            setForm({
                              firstName: user.firstName, lastName: user.lastName, email: user.email,
                              phone: user.phone || '', password: '', role: user.role,
                              institutionId: user.institutionId || '', departmentId: user.departmentId || '',
                            });
                            setEditingUser(user);
                            setModal('edit');
                          }} className="p-1.5 hover:bg-gray-200 rounded" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => { setResetModal(user); setResetPassword(''); }}
                            className="p-1.5 hover:bg-yellow-100 rounded text-yellow-600" title="Reset Password">
                            <KeyRound size={14} />
                          </button>
                          <button onClick={async () => {
                            if (await confirm({ title: 'Delete User', message: 'Are you sure you want to delete this user? This cannot be undone.', confirmText: 'Delete', variant: 'danger' })) {
                              deleteMutation.mutate(user.id);
                            }
                          }} className="p-1.5 hover:bg-red-100 rounded text-red-600" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">Reset password for <strong>{resetModal.fullName}</strong> ({resetModal.email})</p>
            <input className="input-field w-full mb-4" type="password" placeholder="New password (min 6 chars)"
              value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setResetModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => {
                if (!resetPassword || resetPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
                resetPasswordMutation.mutate({ id: resetModal.id, newPassword: resetPassword });
              }} className="btn-primary" disabled={resetPasswordMutation.isPending}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{modal === 'create' ? 'Add User' : 'Edit User'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {modal === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input className="input-field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select className="input-field" value={form.institutionId} onChange={(e) => setForm({ ...form, institutionId: e.target.value, departmentId: '' })}>
                  <option value="">None</option>
                  {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.institutionName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="input-field" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                  <option value="">None</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.departmentName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}>
                {modal === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {confirmModal}
    </div>
  );
}

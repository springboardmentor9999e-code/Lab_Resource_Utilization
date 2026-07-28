import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, ChevronRight, Edit2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { roleManagementApi } from '../../api/api';
import toast from 'react-hot-toast';

const roleColors = {
  RESEARCHER: 'bg-blue-50 border-blue-200 text-blue-700',
  STUDENT: 'bg-purple-50 border-purple-200 text-purple-700',
  LAB_TECHNICIAN: 'bg-orange-50 border-orange-200 text-orange-700',
  LAB_MANAGER: 'bg-green-50 border-green-200 text-green-700',
  DEPARTMENT_HEAD: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  INSTITUTION_ADMIN: 'bg-red-50 border-red-200 text-red-700',
  SYSTEM_ADMIN: 'bg-gray-50 border-gray-800 text-gray-800',
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => { const res = await roleManagementApi.getAll(); return res.data; },
  });

  const { data: roleUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-role-users', selectedRole],
    queryFn: async () => { const res = await roleManagementApi.getUsersByRole(selectedRole); return res.data; },
    enabled: !!selectedRole,
  });

  const updateMutation = useMutation({
    mutationFn: ({ role, data }) => roleManagementApi.updateRoleConfig(role, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-roles']);
      toast.success('Role updated successfully');
      setEditingRole(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  const handleEditStart = (role) => {
    setEditingRole(role.roleName);
    setEditDescription(role.description || '');
  };

  const handleEditSave = () => {
    updateMutation.mutate({ role: editingRole, data: { description: editDescription } });
  };

  const handleEditCancel = () => {
    setEditingRole(null);
    setEditDescription('');
  };

  const handleToggleEnabled = (role) => {
    updateMutation.mutate({ role: role.roleName, data: { enabled: !role.enabled } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <p className="text-gray-600 mt-1">Manage role descriptions and status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {roles.map((role) => (
          <div
            key={role.roleName}
            className={`card transition-all hover:shadow-md border-2 ${
              selectedRole === role.roleName ? 'border-primary-500' : 'border-transparent'
            } ${!role.enabled ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${roleColors[role.roleName] || 'bg-gray-100'}`}>
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{role.roleName.replace(/_/g, ' ')}</h3>
                  {!role.enabled && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Disabled
                    </span>
                  )}
                </div>
                {editingRole === role.roleName ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input-field text-xs w-full"
                      placeholder="Role description"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleEditSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                      >
                        <Check size={14} /> Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">{role.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{role.userCount} users</span>
              </div>
              <div className="flex items-center gap-2">
                {editingRole !== role.roleName && (
                  <button
                    onClick={() => handleEditStart(role)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Edit description"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleToggleEnabled(role)}
                  disabled={updateMutation.isPending}
                  className={`p-1 transition-colors ${role.enabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'}`}
                  title={role.enabled ? 'Disable role' : 'Enable role'}
                >
                  {role.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            </div>
            
            <div 
              onClick={() => setSelectedRole(selectedRole === role.roleName ? null : role.roleName)}
              className="mt-3 pt-3 border-t cursor-pointer hover:bg-gray-50 rounded-b-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">View users</span>
                <ChevronRight size={14} className={`text-gray-400 transition-transform ${selectedRole === role.roleName ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users in Selected Role */}
      {selectedRole && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Users with role: {selectedRole.replace(/_/g, ' ')}
            </h3>
            <button onClick={() => setSelectedRole(null)} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : roleUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No users with this role</p>
          ) : (
            <div className="space-y-2">
              {roleUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">{u.firstName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.fullName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

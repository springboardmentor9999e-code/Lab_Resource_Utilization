import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { institutionApi, departmentApi, userManagementApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionManagement() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [instModal, setInstModal] = useState(null); // null | 'create' | 'edit'
  const [instForm, setInstForm] = useState({ institutionCode: '', institutionName: '', email: '', phone: '', address: '', city: '', state: '', country: '' });
  const [deptModal, setDeptModal] = useState(null); // null | 'create' | 'edit'
  const [deptForm, setDeptForm] = useState({ departmentName: '', hodId: '' });

  const { data: institutions = [], isLoading: loadingInst } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await institutionApi.getAll();
      return res.data;
    },
  });

  const { data: departments = [], isLoading: loadingDept } = useQuery({
    queryKey: ['departments', selectedInstitution],
    queryFn: async () => {
      const res = await departmentApi.getByInstitution(selectedInstitution);
      return res.data;
    },
    enabled: !!selectedInstitution,
  });

  const { data: hodUsers = [] } = useQuery({
    queryKey: ['hod-users', selectedInstitution],
    queryFn: async () => {
      const res = await userManagementApi.getAll({ institutionId: selectedInstitution, role: 'DEPARTMENT_HEAD', size: 100 });
      return res.data?.users || res.data?.content || [];
    },
    enabled: !!selectedInstitution && !!deptModal,
  });

  // Institution mutations
  const createInstMutation = useMutation({
    mutationFn: (data) => institutionApi.create(data),
    onSuccess: () => {
      toast.success('Institution created');
      queryClient.invalidateQueries(['institutions']);
      setInstModal(null);
      resetInstForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create institution'),
  });

  const updateInstMutation = useMutation({
    mutationFn: ({ id, data }) => institutionApi.update(id, data),
    onSuccess: () => {
      toast.success('Institution updated');
      queryClient.invalidateQueries(['institutions']);
      setInstModal(null);
      resetInstForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update institution'),
  });

  const deleteInstMutation = useMutation({
    mutationFn: (id) => institutionApi.delete(id),
    onSuccess: () => {
      toast.success('Institution deleted');
      queryClient.invalidateQueries(['institutions']);
      setSelectedInstitution(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete institution'),
  });

  // Department mutations
  const createDeptMutation = useMutation({
    mutationFn: (data) => departmentApi.create(data),
    onSuccess: () => {
      toast.success('Department created');
      queryClient.invalidateQueries(['departments', selectedInstitution]);
      setDeptModal(null);
      resetDeptForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create department'),
  });

  const updateDeptMutation = useMutation({
    mutationFn: ({ id, data }) => departmentApi.update(id, data),
    onSuccess: () => {
      toast.success('Department updated');
      queryClient.invalidateQueries(['departments', selectedInstitution]);
      setDeptModal(null);
      resetDeptForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update department'),
  });

  const deleteDeptMutation = useMutation({
    mutationFn: (id) => departmentApi.delete(id),
    onSuccess: () => {
      toast.success('Department deleted');
      queryClient.invalidateQueries(['departments', selectedInstitution]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete department'),
  });

  const resetInstForm = () => setInstForm({ institutionCode: '', institutionName: '', email: '', phone: '', address: '', city: '', state: '', country: '' });
  const resetDeptForm = () => setDeptForm({ departmentName: '', hodId: '' });

  const handleInstSubmit = () => {
    if (!instForm.institutionCode || !instForm.institutionName) {
      toast.error('Code and Name are required');
      return;
    }
    if (instModal === 'create') {
      createInstMutation.mutate(instForm);
    } else {
      updateInstMutation.mutate({ id: selectedInstitution, data: instForm });
    }
  };

  const handleDeptSubmit = () => {
    if (!deptForm.departmentName) {
      toast.error('Department name is required');
      return;
    }
    const payload = {
      ...deptForm,
      institution: { id: selectedInstitution },
      hodId: deptForm.hodId ? parseInt(deptForm.hodId) : null,
    };
    if (deptModal === 'create') {
      createDeptMutation.mutate(payload);
    } else {
      updateDeptMutation.mutate({ id: deptForm.id, data: payload });
    }
  };

  if (loadingInst) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Institution Management</h1>

      {/* Institutions */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Institutions</h3>
          {isAdmin && (
            <button
              onClick={() => { resetInstForm(); setInstModal('create'); }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Institution
            </button>
          )}
        </div>
        {institutions.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No institutions found</p>
        ) : (
          <div className="space-y-3">
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedInstitution === inst.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedInstitution(inst.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <Building2 size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{inst.institutionName}</p>
                      <p className="text-sm text-gray-500">{inst.institutionCode} | {inst.city || 'N/A'}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setInstForm({
                            institutionCode: inst.institutionCode,
                            institutionName: inst.institutionName,
                            email: inst.email || '',
                            phone: inst.phone || '',
                            address: inst.address || '',
                            city: inst.city || '',
                            state: inst.state || '',
                            country: inst.country || '',
                          });
                          setInstModal('edit');
                        }}
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this institution?')) {
                            deleteInstMutation.mutate(inst.id);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Departments */}
      {selectedInstitution && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Departments</h3>
            {isAdmin && (
              <button
                onClick={() => { resetDeptForm(); setDeptModal('create'); }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Add Department
              </button>
            )}
          </div>
          {loadingDept ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : departments.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No departments found</p>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{dept.departmentName}</p>
                    <p className="text-sm text-gray-500">
                      HOD: {dept.hodName || 'Not Assigned'}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDeptForm({
                            id: dept.id,
                            departmentName: dept.departmentName,
                            hodId: dept.hodId?.toString() || '',
                          });
                          setDeptModal('edit');
                        }}
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this department?')) {
                            deleteDeptMutation.mutate(dept.id);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Institution Modal */}
      {instModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {instModal === 'create' ? 'Add Institution' : 'Edit Institution'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input className="input-field" value={instForm.institutionCode}
                  onChange={(e) => setInstForm({ ...instForm, institutionCode: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className="input-field" value={instForm.institutionName}
                  onChange={(e) => setInstForm({ ...instForm, institutionName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input-field" value={instForm.email}
                  onChange={(e) => setInstForm({ ...instForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input-field" value={instForm.phone}
                  onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input className="input-field" value={instForm.address}
                  onChange={(e) => setInstForm({ ...instForm, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input className="input-field" value={instForm.city}
                  onChange={(e) => setInstForm({ ...instForm, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input className="input-field" value={instForm.state}
                  onChange={(e) => setInstForm({ ...instForm, state: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setInstModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleInstSubmit} className="btn-primary"
                disabled={createInstMutation.isLoading || updateInstMutation.isLoading}>
                {instModal === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {deptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {deptModal === 'create' ? 'Add Department' : 'Edit Department'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input className="input-field" value={deptForm.departmentName}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department (HOD)</label>
                <select className="input-field" value={deptForm.hodId}
                  onChange={(e) => setDeptForm({ ...deptForm, hodId: e.target.value })}>
                  <option value="">-- No HOD Assigned --</option>
                  {hodUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                  ))}
                </select>
                {hodUsers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No DEPARTMENT_HEAD users found in this institution</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeptModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDeptSubmit} className="btn-primary"
                disabled={createDeptMutation.isLoading || updateDeptMutation.isLoading}>
                {deptModal === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

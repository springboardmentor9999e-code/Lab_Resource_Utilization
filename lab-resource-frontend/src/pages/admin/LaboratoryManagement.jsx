import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Beaker, Plus, Edit2, Trash2, X, Building2, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { laboratoryApi, institutionApi, departmentApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function LaboratoryManagement() {
  const queryClient = useQueryClient();
  const { isAdmin, isInstitutionAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [formData, setFormData] = useState({
    laboratoryName: '',
    location: '',
    departmentId: '',
    labManagerId: '',
  });

  const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => { const res = await institutionApi.getAll(); return res.data; },
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments', selectedInstitution],
    queryFn: async () => { 
      const res = await departmentApi.getByInstitution(selectedInstitution); 
      return res.data; 
    },
    enabled: !!selectedInstitution,
  });

  const { data: laboratories = [], isLoading } = useQuery({
    queryKey: ['laboratories', selectedDepartment],
    queryFn: async () => { 
      if (!selectedDepartment) return [];
      const res = await laboratoryApi.getByDepartment(selectedDepartment); 
      return res.data; 
    },
    enabled: !!selectedDepartment,
  });

  const createMutation = useMutation({
    mutationFn: (data) => laboratoryApi.create(data),
    onSuccess: () => {
      toast.success('Laboratory created');
      queryClient.invalidateQueries(['laboratories']);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create laboratory'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => laboratoryApi.update(id, data),
    onSuccess: () => {
      toast.success('Laboratory updated');
      queryClient.invalidateQueries(['laboratories']);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update laboratory'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => laboratoryApi.delete(id),
    onSuccess: () => {
      toast.success('Laboratory deleted');
      queryClient.invalidateQueries(['laboratories']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete laboratory'),
  });

  const resetForm = () => {
    setFormData({
      laboratoryName: '',
      location: '',
      departmentId: selectedDepartment,
      labManagerId: '',
    });
    setEditingId(null);
  };

  const handleEdit = (lab) => {
    setFormData({
      laboratoryName: lab.laboratoryName,
      location: lab.location || '',
      departmentId: lab.departmentId,
      labManagerId: lab.labManagerId || '',
    });
    setEditingId(lab.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.laboratoryName) {
      toast.error('Laboratory name is required');
      return;
    }

    const data = {
      ...formData,
      departmentId: selectedDepartment,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this laboratory? This will affect all equipment in this lab.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading || loadingInstitutions) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laboratory Management</h1>
          <p className="text-gray-600 mt-1">Manage laboratories within departments</p>
        </div>
        {isAdmin && selectedDepartment && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Laboratory
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              className="input-field"
              value={selectedInstitution}
              onChange={(e) => {
                setSelectedInstitution(e.target.value);
                setSelectedDepartment('');
              }}
            >
              <option value="">Select institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="input-field"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={!selectedInstitution}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Laboratories List */}
      {!selectedDepartment ? (
        <div className="card text-center py-12">
          <Beaker size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Please select an institution and department to view laboratories</p>
        </div>
      ) : laboratories.length === 0 ? (
        <div className="card text-center py-12">
          <Beaker size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No laboratories found in this department</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laboratories.map((lab) => (
            <div key={lab.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-xl">
                    <Beaker size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{lab.laboratoryName}</h3>
                    {lab.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={10} /> {lab.location}
                      </p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(lab)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(lab.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {lab.labManagerName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} />
                    <span>Manager: {lab.labManagerName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={14} />
                  <span>Status: {lab.status ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Laboratory' : 'New Laboratory'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.laboratoryName}
                  onChange={(e) => setFormData({ ...formData, laboratoryName: e.target.value })}
                  placeholder="e.g., CNC Lab"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A, Room 101"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

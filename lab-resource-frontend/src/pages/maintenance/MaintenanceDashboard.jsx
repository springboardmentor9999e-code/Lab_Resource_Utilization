import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Wrench, Clock, CheckCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { maintenanceApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  'CREATED': { color: 'badge-warning', label: 'Created' },
  'ASSIGNED': { color: 'badge-info', label: 'Assigned' },
  'ACCEPTED': { color: 'badge-info', label: 'Accepted' },
  'IN_PROGRESS': { color: 'badge-info', label: 'In Progress' },
  'WAITING_FOR_PARTS': { color: 'badge-warning', label: 'Waiting for Parts' },
  'UNDER_INSPECTION': { color: 'badge-warning', label: 'Under Inspection' },
  'COMPLETED': { color: 'badge-success', label: 'Completed' },
  'CANCELLED': { color: 'badge-danger', label: 'Cancelled' },
};

const priorityConfig = {
  'HIGH': 'text-red-600',
  'MEDIUM': 'text-yellow-600',
  'LOW': 'text-green-600',
};

export default function MaintenanceDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManageWorkOrders = user?.role === 'LAB_MANAGER' || user?.role === 'LAB_TECHNICIAN';
  const canDeleteWorkOrders = user?.role === 'LAB_MANAGER';
  const [searchParams] = useSearchParams();
  const equipmentIdFromUrl = searchParams.get('equipmentId');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    equipmentId: '',
    maintenanceType: 'PREVENTIVE',
    priority: 'MEDIUM',
    description: '',
    scheduledDate: '',
  });

  useEffect(() => {
    if (equipmentIdFromUrl) {
      setCreateForm(prev => ({ ...prev, equipmentId: equipmentIdFromUrl }));
      setShowCreateForm(true);
    }
  }, [equipmentIdFromUrl]);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['workOrders'],
    queryFn: async () => {
      const res = await maintenanceApi.getWorkOrders();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => maintenanceApi.createWorkOrder({
      equipment: { id: parseInt(data.equipmentId) },
      maintenanceType: data.maintenanceType,
      priority: data.priority,
      description: data.description,
      scheduledDate: data.scheduledDate || null,
    }),
    onSuccess: () => {
      toast.success('Work order created');
      queryClient.invalidateQueries(['workOrders']);
      queryClient.invalidateQueries(['equipment']);
      queryClient.invalidateQueries(['myBookings']);
      setShowCreateForm(false);
      setCreateForm({ equipmentId: '', maintenanceType: 'PREVENTIVE', priority: 'MEDIUM', description: '', scheduledDate: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create work order'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => maintenanceApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['workOrders']);
      queryClient.invalidateQueries(['equipment']);
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => maintenanceApi.deleteWorkOrder(id),
    onSuccess: () => {
      toast.success('Work order deleted');
      queryClient.invalidateQueries(['workOrders']);
      queryClient.invalidateQueries(['equipment']);
      queryClient.invalidateQueries(['myBookings']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete work order'),
  });

  // Compute stats
  const activeCount = workOrders.filter(w =>
    w.status !== 'COMPLETED' && w.status !== 'CANCELLED'
  ).length;
  const completedCount = workOrders.filter(w => w.status === 'COMPLETED').length;
  const createdCount = workOrders.filter(w => w.status === 'CREATED').length;

  const stats = [
    { label: 'Active Work Orders', value: activeCount, icon: Wrench, color: 'bg-blue-100 text-blue-700' },
    { label: 'Awaiting Assignment', value: createdCount, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Dashboard</h1>
        {canManageWorkOrders && (
          <button onClick={() => setShowCreateForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Work Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Work Orders</h3>
        {workOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No work orders yet</p>
        ) : (
          <div className="space-y-4">
            {workOrders.map((order) => {
              const config = statusConfig[order.status] || { color: 'badge-info', label: order.status };
              return (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">#{order.id} - {order.equipmentName || 'Equipment'}</p>
                      <span className={config.color}>{config.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.maintenanceType} | Priority: <span className={priorityConfig[order.priority] || ''}>{order.priority}</span>
                      {order.scheduledDate && ` | Scheduled: ${order.scheduledDate}`}
                    </p>
                    {order.description && (
                      <p className="text-xs text-gray-400 mt-1">{order.description}</p>
                    )}
                    {order.assignedToName && (
                      <p className="text-xs text-gray-400">Assigned to: {order.assignedToName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageWorkOrders && order.status === 'CREATED' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'IN_PROGRESS' })}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Start
                      </button>
                    )}
                    {canManageWorkOrders && (order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED') && (
                      <button
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'COMPLETED' })}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Complete
                      </button>
                    )}
                    {canDeleteWorkOrders && (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this work order? Equipment status will revert to Available.')) {
                          deleteMutation.mutate(order.id);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Work Order Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Work Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment ID *</label>
                <input type="number" className="input-field" value={createForm.equipmentId}
                  onChange={(e) => setCreateForm({ ...createForm, equipmentId: e.target.value })}
                  placeholder="Enter equipment ID"
                  disabled={!!equipmentIdFromUrl} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select className="input-field" value={createForm.maintenanceType}
                  onChange={(e) => setCreateForm({ ...createForm, maintenanceType: e.target.value })}>
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="CALIBRATION">Calibration</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="input-field" value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input type="date" className="input-field" value={createForm.scheduledDate}
                  onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={3} value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMutation.mutate(createForm)} className="btn-primary"
                disabled={createMutation.isLoading || !createForm.equipmentId}>
                {createMutation.isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

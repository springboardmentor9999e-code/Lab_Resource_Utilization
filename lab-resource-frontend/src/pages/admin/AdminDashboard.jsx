import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Building2, Cpu, Calendar, Wrench, Activity, Clock, AlertTriangle, Shield, CheckCircle, XCircle, TrendingUp, DollarSign, Share2, AlertCircle, Server } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminDashboardApi, bookingApi, costApi, systemMonitorApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const formatUptime = (ms) => {
  if (!ms) return 'N/A';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';

  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => { const res = await adminDashboardApi.getStats(); return res.data; },
  });

  const { data: recentActivity = [], isError: activityError, error: activityErr } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => { const res = await adminDashboardApi.getRecentActivity(); return res.data; },
    enabled: isSystemAdmin,
  });

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async () => { const res = await bookingApi.getPendingApprovals(); return res.data; },
  });

  const { data: utilization, isLoading: utilizationLoading } = useQuery({
    queryKey: ['utilization-intelligence'],
    queryFn: async () => { const res = await costApi.getUtilization(); return res.data; },
  });

  const { data: lifecycle, isLoading: lifecycleLoading } = useQuery({
    queryKey: ['equipment-lifecycle'],
    queryFn: async () => { const res = await costApi.getLifecycle(); return res.data; },
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => { const res = await systemMonitorApi.getHealth(); return res.data; },
    refetchInterval: 30000,
    enabled: isSystemAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }) => bookingApi.approve(id, { remarks: 'Approved' }),
    onSuccess: () => {
      toast.success('Booking approved');
      queryClient.invalidateQueries(['pendingApprovals']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id }) => bookingApi.reject(id, { remarks: 'Rejected' }),
    onSuccess: () => {
      toast.success('Booking rejected');
      queryClient.invalidateQueries(['pendingApprovals']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject'),
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{isSystemAdmin ? 'System Admin Dashboard' : 'Institution Admin Dashboard'}</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={18} />
            <span className="font-semibold">Failed to load dashboard data</span>
          </div>
          <p className="text-sm text-red-600">
            {statsErr?.response?.data?.message || statsErr?.message || 'An unexpected error occurred. Check your network connection and try again.'}
          </p>
          {statsErr?.response?.status === 403 && (
            <p className="text-sm text-red-600 mt-2">
              You do not have permission to access this resource. Ensure you are logged in with appropriate privileges.
            </p>
          )}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-100 text-blue-700', link: '/admin/users' },
    { label: 'Institutions', value: stats?.totalInstitutions || 0, icon: Building2, color: 'bg-green-100 text-green-700', link: '/institutions' },
    { label: 'Equipment', value: stats?.totalEquipment || 0, icon: Cpu, color: 'bg-purple-100 text-purple-700', link: '/equipment' },
    { label: 'Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'bg-yellow-100 text-yellow-700', link: '/bookings' },
    { label: 'Work Orders', value: stats?.totalWorkOrders || 0, icon: Wrench, color: 'bg-orange-100 text-orange-700', link: '/maintenance' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: Activity, color: 'bg-teal-100 text-teal-700', link: '/admin/users' },
  ];

  const usersByRole = stats?.usersByRole || {};
  const roleEntries = Object.entries(usersByRole).filter(([_, count]) => count > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{isSystemAdmin ? 'System Admin Dashboard' : 'Institution Admin Dashboard'}</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.fullName}. {isSystemAdmin ? 'System-wide overview.' : 'Organization-wide overview.'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link || '#'}
            onClick={(e) => { if (stat.link) { e.preventDefault(); navigate(stat.link); } }}
            className="card flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
            <Link to="/bookings/approvals" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          {pendingBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No pending approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.equipmentName || 'Equipment'}</p>
                    <p className="text-sm text-gray-500">
                      {booking.userFullName} - {booking.bookingDate}
                    </p>
                    {booking.userRole && (
                      <p className="text-xs text-gray-400">{booking.userRole.replace(/_/g, ' ')}</p>
                    )}
                    {booking.userInstitutionName && (
                      <p className="text-xs text-gray-400">{booking.userInstitutionName}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => approveMutation.mutate({ id: booking.id })}
                      className="p-1.5 hover:bg-green-100 rounded text-green-600"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ id: booking.id })}
                      className="p-1.5 hover:bg-red-100 rounded text-red-600"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users by Role */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Users by Role</h3>
          {roleEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No user data</p>
          ) : (
            <div className="space-y-3">
              {roleEntries.map(([role, count]) => {
                const percentage = stats?.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-36">{role.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary-500" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/admin/users" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
            Manage Users
          </Link>
        </div>

        {/* Equipment Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Status</h3>
          {stats?.equipmentByStatus ? (
            <div className="space-y-3">
              {Object.entries(stats.equipmentByStatus).map(([status, count]) => {
                const percentage = stats.totalEquipment > 0 ? Math.round((count / stats.totalEquipment) * 100) : 0;
                const colors = {
                  AVAILABLE: 'bg-green-500', IN_USE: 'bg-blue-500', UNDER_MAINTENANCE: 'bg-orange-500',
                  OUT_OF_SERVICE: 'bg-red-500', RESERVED: 'bg-yellow-500',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-36">{status.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${colors[status] || 'bg-gray-500'}`} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No data</p>
          )}
          <Link to="/equipment" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
            View Equipment
          </Link>
        </div>

        {/* Recent Activity */}
        {isSystemAdmin && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {activityError ? (
            <div className="text-center py-6">
              <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-500">Failed to load activity</p>
              <p className="text-xs text-red-400">{activityErr?.response?.data?.message || activityErr?.message}</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-primary-100 rounded-lg mt-0.5">
                    <Clock size={12} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {log.userFullName || 'System'} - {log.action}
                    </p>
                    <p className="text-xs text-gray-500">{log.module} | {log.entityType || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{log.actionTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/audit-logs" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
            View All Logs
          </Link>
        </div>
        )}
      </div>

      {/* Utilization Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Utilization Intelligence
            </h3>
            <Link to="/admin/utilization" className="text-sm text-primary-600 hover:text-primary-700">Full View</Link>
          </div>
          {utilizationLoading ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
          ) : utilization ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{utilization.overallUtilizationRate || 0}%</p>
                  <p className="text-xs text-blue-600">Overall Utilization</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">{utilization.idleEquipment?.length || 0}</p>
                  <p className="text-xs text-amber-600">Idle Equipment</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{utilization.peakUsage?.peakHour || 'N/A'}</p>
                  <p className="text-xs text-green-600">Peak Hour</p>
                </div>
              </div>
              {utilization.departmentUtilizations?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Department Breakdown</p>
                  <div className="space-y-2">
                    {utilization.departmentUtilizations.slice(0, 4).map((d) => (
                      <div key={d.departmentName} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-28 truncate">{d.departmentName}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${Math.min(100, d.utilizationRate || 0)}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{d.utilizationRate || 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {utilization.idleEquipment?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1">
                    <AlertCircle size={14} /> Idle Equipment Alerts
                  </p>
                  <div className="space-y-1">
                    {utilization.idleEquipment.slice(0, 3).map((e, i) => (
                      <p key={i} className="text-xs text-gray-600">{e.equipmentName || e.name} — {e.idleDays >= 999 ? 'Never used' : `${e.idleDays || 0} days idle`}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No utilization data available</p>
          )}
        </div>

        {/* Equipment Lifecycle */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Cpu size={18} className="text-purple-600" /> Equipment Lifecycle
            </h3>
            <Link to="/admin/costs" className="text-sm text-primary-600 hover:text-primary-700">Full View</Link>
          </div>
          {lifecycleLoading ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
          ) : lifecycle ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-purple-700">${(lifecycle.totalAssetValue || 0).toLocaleString()}</p>
                  <p className="text-xs text-purple-600">Total Asset Value</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-red-700">${(lifecycle.totalMaintenanceCost || 0).toLocaleString()}</p>
                  <p className="text-xs text-red-600">Maintenance Cost</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700">
                    {lifecycle.equipmentLifecycles?.length > 0
                      ? Math.round(lifecycle.equipmentLifecycles.reduce((acc, curr) => acc + (curr.roi || 0), 0) / lifecycle.equipmentLifecycles.length * 10) / 10
                      : 0}%
                  </p>
                  <p className="text-xs text-green-600">Average ROI</p>
                </div>
              </div>
              {lifecycle.equipmentLifecycles?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Equipment Health</p>
                  <div className="space-y-2">
                    {lifecycle.equipmentLifecycles.slice(0, 4).map((e) => (
                      <div key={e.equipmentId || e.equipmentName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600 truncate">{e.equipmentName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            e.condition === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                            e.condition === 'GOOD' ? 'bg-blue-100 text-blue-700' :
                            e.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{e.condition || 'GOOD'}</span>
                          <span className="text-xs text-gray-400">{Math.round((e.ageMonths || 0) / 12 * 10) / 10}y</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lifecycle.procurementRecommendations?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-1">
                    <DollarSign size={14} /> Procurement Recommendations
                  </p>
                  <div className="space-y-1">
                    {lifecycle.procurementRecommendations.slice(0, 3).map((r, i) => (
                      <p key={i} className="text-xs text-gray-600">{r.equipmentName} — {r.reason || r.recommendation} (Est: ${(r.currentCost || 0).toLocaleString()})</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No lifecycle data available</p>
          )}
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Server size={18} className="text-green-600" /> System Health
            </h3>
            <Link to="/admin/system" className="text-sm text-primary-600 hover:text-primary-700">Full View</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-lg font-bold text-green-700">{systemHealth.status || 'UP'}</p>
              <p className="text-xs text-green-600">Status</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-lg font-bold text-blue-700">{formatUptime(systemHealth.uptimeMs)}</p>
              <p className="text-xs text-blue-600">Uptime</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-700">{systemHealth.usedMemoryMB || 0} MB</p>
              <p className="text-xs text-purple-600">Memory Used</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <p className="text-lg font-bold text-amber-700">{systemHealth.availableProcessors || 0} Cores</p>
              <p className="text-xs text-amber-600">CPU Cores</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg text-center">
              <p className="text-lg font-bold text-teal-700">{Math.round(systemHealth.avgResponseTimeMs || 0)} ms</p>
              <p className="text-xs text-teal-600">Avg Latency</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <p className="text-lg font-bold text-red-700">{(systemHealth.apiErrorRate || 0).toFixed(1)}%</p>
              <p className="text-xs text-red-600">Error Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link to="/admin/users" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users size={24} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </Link>
          {isSystemAdmin && (
            <Link to="/admin/roles" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Shield size={24} className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Roles</span>
            </Link>
          )}
          <Link to="/admin/invoices" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <DollarSign size={24} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Invoices</span>
          </Link>
          <Link to="/admin/sharing" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Share2 size={24} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Resource Sharing</span>
          </Link>
          {isSystemAdmin && (
            <Link to="/admin/system" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Activity size={24} className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">System Health</span>
            </Link>
          )}
          <Link to="/reports" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Calendar size={24} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

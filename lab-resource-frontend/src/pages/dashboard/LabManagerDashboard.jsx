import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Calendar, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Megaphone, BarChart3, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { equipmentApi, bookingApi, announcementApi, analyticsApi, costApi } from '../../api/api';

const COLORS = {
  'AVAILABLE': '#22c55e',
  'IN_USE': '#3b82f6',
  'UNDER_MAINTENANCE': '#f97316',
  'RESERVED': '#eab308',
  'OUT_OF_SERVICE': '#ef4444',
  'CALIBRATION_DUE': '#f59e0b',
  'RETIRED': '#6b7280',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function LabManagerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isDeptHead = user?.role === 'DEPARTMENT_HEAD';
  const isInstAdmin = user?.role === 'INSTITUTION_ADMIN';
  const deptId = user?.departmentId;
  const instId = user?.institutionId;

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', { departmentId: deptId, institutionId: instId }],
    queryFn: async () => {
      const params = {};
      if (isDeptHead && deptId) params.departmentId = deptId;
      else if (isInstAdmin && instId) params.institutionId = instId;
      const res = await equipmentApi.getAll(params);
      return res.data.content || [];
    },
  });

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async () => {
      const res = await bookingApi.getPendingApprovals();
      return res.data;
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['activeAnnouncements', { institutionId: instId, departmentId: deptId }],
    queryFn: async () => {
      const params = {};
      if (isDeptHead && deptId) params.departmentId = deptId;
      else if (isInstAdmin && instId) params.institutionId = instId;
      const res = await announcementApi.getActive(params);
      return res.data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res.data;
    },
  });

  const { data: utilizationData } = useQuery({
    queryKey: ['utilization-intelligence'],
    queryFn: async () => {
      const res = await costApi.getUtilization();
      return res.data;
    },
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

  const totalEquipment = equipment.length;
  const availableCount = equipment.filter(e => e.status === 'AVAILABLE').length;
  const inUseCount = equipment.filter(e => e.status === 'IN_USE').length;
  const maintenanceCount = equipment.filter(e => e.status === 'UNDER_MAINTENANCE').length;

  const statusCounts = equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: COLORS[status] || '#6b7280',
  }));

  const noShowRate = analytics?.totalBookings > 0
    ? ((analytics.noShowBookings / analytics.totalBookings) * 100).toFixed(1)
    : 0;

  const utilizationRate = utilizationData?.overallUtilizationRate?.toFixed(1) || analytics?.utilizationRate?.toFixed(1) || 0;

  const hourlyDistribution = utilizationData?.peakUsage?.hourlyDistribution || [];
  const maxHourly = Math.max(...hourlyDistribution.map(h => h.bookingCount || 0), 1);

  const utilizationTrend = analytics?.utilizationTrend || [];

  const stats = [
    { label: 'Total Equipment', value: totalEquipment, icon: Cpu, color: 'bg-blue-100 text-blue-700' },
    { label: 'Available', value: availableCount, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'In Use', value: inUseCount, icon: Calendar, color: 'bg-purple-100 text-purple-700' },
    { label: 'Pending Approvals', value: pendingBookings.length, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Under Maintenance', value: maintenanceCount, icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
    { label: 'Utilization Rate', value: `${utilizationRate}%`, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'No-Show Rate', value: `${noShowRate}%`, icon: Percent, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{isDeptHead ? 'Department Head Dashboard' : isInstAdmin ? 'Institution Admin Dashboard' : 'Lab Manager Dashboard'}</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.fullName}. Here's your {isDeptHead ? 'department' : isInstAdmin ? 'institution' : 'lab'} overview.</p>
      </div>

      {announcements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Announcements</h2>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className={`card border-l-4 ${
                ann.priority === 'CRITICAL' ? 'border-l-red-500 bg-red-50' :
                ann.priority === 'HIGH' ? 'border-l-orange-500 bg-orange-50' :
                ann.priority === 'MEDIUM' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ann.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        ann.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        ann.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{ann.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {ann.announcementType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{ann.content}</p>
                    {ann.expiresAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

        {/* Equipment Status Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Status</h3>
          {equipment.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No equipment data</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Equipment Status Bars */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalEquipment > 0 ? Math.round((count / totalEquipment) * 100) : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-32">{status.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: COLORS[status] || '#6b7280' }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/equipment" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
            View All Equipment
          </Link>
        </div>
      </div>

      {/* Utilization Trend & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Utilization Trend */}
        {utilizationTrend.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilization Trend (6 months)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                  <Bar dataKey="utilizationPercent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Booking Heatmap (Hourly Distribution) */}
        {hourlyDistribution.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                Booking Activity by Hour
              </div>
            </h3>
            <div className="grid grid-cols-12 gap-1">
              {hourlyDistribution.map((h, i) => {
                const intensity = maxHourly > 0 ? (h.bookingCount || 0) / maxHourly : 0;
                const bgColor = intensity === 0 ? 'bg-gray-100'
                  : intensity < 0.25 ? 'bg-indigo-100'
                  : intensity < 0.5 ? 'bg-indigo-200'
                  : intensity < 0.75 ? 'bg-indigo-400'
                  : 'bg-indigo-600';
                return (
                  <div
                    key={i}
                    className={`${bgColor} rounded-sm aspect-square flex items-center justify-center group relative cursor-default`}
                    title={`${String(i).padStart(2, '0')}:00 - ${h.bookingCount || 0} bookings`}
                  >
                    <span className="text-[8px] text-gray-500 group-hover:hidden">{i}</span>
                    <span className="hidden group-hover:block text-[8px] font-medium">{h.bookingCount || 0}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span>Less</span>
              <div className="w-3 h-3 bg-gray-100 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-100 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-200 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-400 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
              <span>More</span>
            </div>
          </div>
        )}
      </div>

      {/* Idle Equipment Alerts */}
      {utilizationData?.idleEquipment?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Idle Equipment Alerts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600 font-medium">Equipment</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Code</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Idle Days</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Department</th>
                </tr>
              </thead>
              <tbody>
                {utilizationData.idleEquipment.slice(0, 5).map((eq, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{eq.name}</td>
                    <td className="py-2 text-gray-500">{eq.code}</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {eq.idleDays} days
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{eq.departmentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/utilization" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
            View Full Utilization Report
          </Link>
        </div>
      )}
    </div>
  );
}

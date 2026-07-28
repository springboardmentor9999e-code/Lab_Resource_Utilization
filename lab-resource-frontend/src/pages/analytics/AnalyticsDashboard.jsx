import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Building2, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { analyticsApi } from '../../api/api';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#eab308', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => { const res = await analyticsApi.getDashboard(); return res.data; },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-danger-600 mb-2">Failed to load analytics data.</p>
        <p className="text-sm text-gray-500">{error.response?.status === 403 ? 'You do not have permission to view analytics.' : 'Please try again later.'}</p>
      </div>
    );
  }

  const equipmentPieData = [
    { name: 'Available', value: analytics?.availableEquipment || 0, color: '#22c55e' },
    { name: 'In Use', value: analytics?.inUseEquipment || 0, color: '#3b82f6' },
    { name: 'Maintenance', value: analytics?.maintenanceEquipment || 0, color: '#f97316' },
  ];

  const bookingPieData = [
    { name: 'Completed', value: analytics?.completedBookings || 0, color: '#22c55e' },
    { name: 'Pending', value: analytics?.pendingBookings || 0, color: '#eab308' },
    { name: 'Cancelled', value: analytics?.cancelledBookings || 0, color: '#ef4444' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Equipment utilization and system analytics</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Total Equipment</p>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalEquipment || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800">{analytics?.totalBookings || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Utilization Rate</p>
          <p className="text-3xl font-bold text-primary-600">{analytics?.utilizationRate || 0}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="text-3xl font-bold text-gray-800">{analytics?.departmentStats?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Equipment Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={equipmentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {equipmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {equipmentPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bookingPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {bookingPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {bookingPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilization Trend */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilization Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.utilizationTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilizationPercent" fill="#3b82f6" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Stats */}
      {analytics?.departmentStats && analytics.departmentStats.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Equipment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Users</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departmentStats.map((dept) => (
                  <tr key={dept.departmentId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{dept.departmentName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{dept.equipmentCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{dept.bookingCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{dept.userCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${dept.utilizationRate}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{dept.utilizationRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

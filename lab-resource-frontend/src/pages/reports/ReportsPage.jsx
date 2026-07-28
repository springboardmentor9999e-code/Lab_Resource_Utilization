import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { FileText, Download, Clock, Plus, FileSpreadsheet, File, FileDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportApi, analyticsApi, costApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const REPORT_TYPES = [
  { value: 'EQUIPMENT_UTILIZATION', label: 'Equipment Utilization Report' },
  { value: 'DEPARTMENT_REPORT', label: 'Department Report' },
  { value: 'MAINTENANCE_REPORT', label: 'Maintenance Report' },
  { value: 'COST_ANALYSIS', label: 'Cost Analysis Report' },
];

const FORMAT_OPTIONS = [
  { value: 'EXCEL', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { value: 'PDF', label: 'PDF (.pdf)', icon: File },
  { value: 'CSV', label: 'CSV (.csv)', icon: FileDown },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const getFormatIcon = (format) => {
  const option = FORMAT_OPTIONS.find(f => f.value === format);
  if (option) {
    const Icon = option.icon;
    return <Icon size={16} />;
  }
  return <FileText size={16} />;
};

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { isManager } = useAuth();
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState('EXCEL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => { const res = await reportApi.getAll(); return res.data; },
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => { const res = await analyticsApi.getDashboard(); return res.data; },
  });

  const { data: utilization } = useQuery({
    queryKey: ['utilization-intelligence'],
    queryFn: async () => { const res = await costApi.getUtilization(); return res.data; },
  });

  const generateMutation = useMutation({
    mutationFn: (data) => reportApi.generate(data),
    onSuccess: () => {
      toast.success('Report generated');
      queryClient.invalidateQueries(['reports']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate report'),
  });

  const handleGenerate = () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }
    generateMutation.mutate({ reportType, format, dateFrom, dateTo });
  };

  const equipmentStatusData = analytics ? [
    { name: 'Available', value: analytics.availableEquipment || 0 },
    { name: 'In Use', value: analytics.inUseEquipment || 0 },
    { name: 'Maintenance', value: analytics.maintenanceEquipment || 0 },
  ] : [];

  const bookingStatusData = analytics ? [
    { name: 'Completed', value: analytics.completedBookings || 0 },
    { name: 'Pending', value: analytics.pendingBookings || 0 },
    { name: 'Cancelled', value: analytics.cancelledBookings || 0 },
  ] : [];

  const utilizationTrend = analytics?.utilizationTrend || [];
  const departmentStats = analytics?.departmentStats || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Visual analytics and report generation</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{analytics?.totalEquipment || 0}</p>
            <p className="text-sm text-gray-500">Total Equipment</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
            <PieChartIcon size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{analytics?.totalBookings || 0}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{analytics?.utilizationRate || 0}%</p>
            <p className="text-sm text-gray-500">Utilization Rate</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            <p className="text-sm text-gray-500">Generated Reports</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Utilization Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilization Trend (6 months)</h3>
          {utilizationTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Legend />
                <Line type="monotone" dataKey="utilizationPercent" stroke="#4f46e5" strokeWidth={2} name="Utilization %" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No trend data</p>
          )}
        </div>

        {/* Equipment Status Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Status Distribution</h3>
          {equipmentStatusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {equipmentStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data</p>
          )}
        </div>

        {/* Department Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Equipment Comparison</h3>
          {departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="departmentName" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="equipmentCount" fill="#3b82f6" name="Equipment" radius={[0, 4, 4, 0]} />
                <Bar dataKey="bookingCount" fill="#10b981" name="Bookings" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data</p>
          )}
        </div>

        {/* Booking Status Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status Distribution</h3>
          {bookingStatusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {bookingStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Equipment Utilization Bar (if available) */}
      {utilization?.equipmentUtilizations?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Utilization Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilization.equipmentUtilizations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="equipmentName" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
              <Bar dataKey="utilizationRate" name="Utilization %">
                {utilization.equipmentUtilizations.map((entry, index) => (
                  <Cell key={index} fill={entry.utilizationRate >= 70 ? '#10b981' : entry.utilizationRate >= 40 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Generate Report */}
      {isManager && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate New Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
              <select className="input-field" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="">Select type</option>
                {REPORT_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
              <select className="input-field" value={format} onChange={(e) => setFormat(e.target.value)}>
                {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input className="input-field" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input className="input-field" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={handleGenerate} className="btn-primary flex items-center gap-2 w-full justify-center"
                disabled={generateMutation.isPending}>
                <Plus size={16} /> {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Reports</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-danger-600 mb-2">Failed to load reports.</p>
            <p className="text-sm text-gray-500">{error.response?.status === 403 ? 'You do not have permission to view reports.' : 'Please try again later.'}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No reports generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-100 rounded-xl">
                    {getFormatIcon(report.format)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{report.fileName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{report.reportType.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-primary-600">{report.format || 'EXCEL'}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {report.generatedAt}</span>
                      <span>by {report.generatedByName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    report.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {report.status}
                  </span>
                  <button
                    className="p-2 hover:bg-gray-200 rounded"
                    title="Download"
                    onClick={() => {
                      reportApi.download(report.id).then((res) => {
                        const url = URL.createObjectURL(new Blob([res.data]));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = report.fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }).catch(() => toast.error('Download failed'));
                    }}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

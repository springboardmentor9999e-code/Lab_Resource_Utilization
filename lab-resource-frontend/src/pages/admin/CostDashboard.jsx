import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, CheckCircle, Clock, AlertTriangle,
  Building2, BarChart3, Filter, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { costApi, institutionApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export default function CostDashboard() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const buildParams = () => {
    const params = {};
    if (institutionFilter) params.institutionId = institutionFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    return params;
  };

  const { data: breakdown, isLoading: breakdownLoading, isError: breakdownError, error: breakdownErr } = useQuery({
    queryKey: ['cost-breakdown', institutionFilter, dateFrom, dateTo],
    queryFn: async () => { const res = await costApi.getBreakdown(buildParams()); return res.data; },
  });

  const { data: monthlyRevenue = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['cost-monthly-revenue', selectedYear],
    queryFn: async () => { const res = await costApi.getMonthlyRevenue(selectedYear); return res.data; },
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => { const res = await institutionApi.getAll(); return res.data; },
  });

  const isLoading = breakdownLoading || monthlyLoading;
  const deptBreakdown = breakdown?.departmentCosts || [];
  const equipBreakdown = breakdown?.equipmentCosts || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (breakdownError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cost & Billing Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={18} />
            <span className="font-semibold">Failed to load cost data</span>
          </div>
          <p className="text-sm text-red-600">
            {breakdownErr?.response?.data?.message || breakdownErr?.message || 'An unexpected error occurred.'}
          </p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(breakdown?.totalRevenue),
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(breakdown?.totalPaid),
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Total Pending',
      value: formatCurrency(breakdown?.totalPending),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Total Overdue',
      value: formatCurrency(breakdown?.totalOverdue),
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-700',
    },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue || 0), 1);

  const sortedDepts = [...deptBreakdown].sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cost & Billing Dashboard</h1>
          <p className="text-gray-600 mt-1">Revenue overview and cost breakdowns</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Institutions</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setInstitutionFilter(''); setDateFrom(''); setDateTo(''); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        {monthlyRevenue.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No revenue data available for {selectedYear}</p>
        ) : (
          <div className="flex items-end gap-2 h-64 px-2">
            {MONTHS.map((month, idx) => {
              const monthData = monthlyRevenue.find((m) => m.month === idx + 1);
              const revenue = monthData?.revenue || 0;
              const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{formatCurrency(revenue)}</span>
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-primary-500 hover:bg-primary-600 rounded-t-md transition-colors"
                      style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: '4px' }}
                      title={`${month}: ${formatCurrency(revenue)}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Cost Breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Department Cost Breakdown</h3>
          </div>
          {sortedDepts.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No department cost data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-medium">Department</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Total Cost</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Cost/Booking</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDepts.map((dept, idx) => (
                    <tr key={dept.departmentId || idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 text-gray-800 font-medium">{dept.departmentName || `Dept ${dept.departmentId}`}</td>
                      <td className="py-2.5 text-right text-gray-800">{formatCurrency(dept.totalCost)}</td>
                      <td className="py-2.5 text-right text-gray-600">{formatCurrency(dept.costPerBooking)}</td>
                      <td className="py-2.5 text-right text-gray-600">{dept.bookingCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Equipment Cost Breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Equipment Cost Breakdown</h3>
          </div>
          {equipBreakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No equipment cost data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-medium">Equipment</th>
                    <th className="text-left py-2 text-gray-600 font-medium">Code</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Total Cost</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Hourly Rate</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {equipBreakdown.map((eq, idx) => (
                    <tr key={eq.equipmentId || idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 text-gray-800 font-medium">{eq.equipmentName || 'Unknown'}</td>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">{eq.equipmentCode || '-'}</td>
                      <td className="py-2.5 text-right text-gray-800">{formatCurrency(eq.totalCost)}</td>
                      <td className="py-2.5 text-right text-gray-600">{formatCurrency(eq.hourlyRate)}</td>
                      <td className="py-2.5 text-right text-gray-600">{eq.bookingCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { MdBarChart, MdDownload, MdRefresh, MdTrendingUp } from 'react-icons/md';
import { dashboardService, bookingService } from '../services/services';

export default function Reports() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardService.getStats(),
      dashboardService.getRecentBookings(),
    ]).then(([s, b]) => {
      if (s.status === 'fulfilled') setStats(s.value.data?.data);
      if (b.status === 'fulfilled') setBookings(b.value.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const STATUS_STYLE = {
    CONFIRMED: 'text-emerald-400 bg-emerald-400/10',
    PENDING:   'text-amber-400 bg-amber-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
    IN_USE:    'text-blue-400 bg-blue-400/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Platform usage summary and booking reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm transition-all">
            <MdRefresh className="text-lg" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Equipment', value: stats?.totalEquipment ?? '—', color: 'purple' },
          { label: 'Active Bookings', value: stats?.activeBookings ?? '—', color: 'blue' },
          { label: 'Pending Requests', value: stats?.pendingRequests ?? '—', color: 'amber' },
          { label: 'Utilization Rate', value: `${stats?.utilizationRate ?? 0}%`, color: 'green' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-white text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <MdBarChart className="text-purple-400 text-xl" />
          <h3 className="text-white font-semibold">Recent Booking Activity</h3>
        </div>
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 border-b border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-400 text-xs font-semibold px-5 py-3 uppercase tracking-wider">Reference</th>
                <th className="text-left text-slate-400 text-xs font-semibold px-5 py-3 uppercase tracking-wider">Equipment</th>
                <th className="text-left text-slate-400 text-xs font-semibold px-5 py-3 uppercase tracking-wider hidden sm:table-cell">User</th>
                <th className="text-left text-slate-400 text-xs font-semibold px-5 py-3 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{b.bookingReference || b.id?.slice(0, 8)}</td>
                  <td className="px-5 py-3 text-white text-sm">{b.equipmentName}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm hidden sm:table-cell">{b.userName}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[b.status] || 'text-slate-400 bg-slate-400/10'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-500">No recent bookings</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

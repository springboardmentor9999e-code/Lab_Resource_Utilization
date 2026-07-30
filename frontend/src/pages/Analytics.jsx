import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MdTrendingUp, MdBarChart, MdPieChart, MdDateRange } from 'react-icons/md';
import { dashboardService } from '../services/services';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }
};

export default function Analytics() {
  const [utilChart, setUtilChart] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardService.getUtilizationChart(),
      dashboardService.getEquipmentStatus(),
      dashboardService.getBookingTrends(),
    ]).then(([u, e, t]) => {
      if (u.status === 'fulfilled') setUtilChart(u.value.data?.data || []);
      if (e.status === 'fulfilled') setStatusDist(e.value.data?.data || []);
      if (t.status === 'fulfilled') setTrendData(t.value.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Platform usage insights and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <MdTrendingUp className="text-purple-400 text-xl" />
            <h3 className="text-white font-semibold">Equipment Utilization Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={utilChart}>
              <defs>
                <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Utilization']} />
              <Area type="monotone" dataKey="utilization" stroke="#8b5cf6" fill="url(#util)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Status Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <MdPieChart className="text-blue-400 text-xl" />
            <h3 className="text-white font-semibold">Equipment Status Distribution</h3>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusDist.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-400 text-xs">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <MdBarChart className="text-green-400 text-xl" />
            <h3 className="text-white font-semibold">Monthly Booking Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 16 }} />
              <Bar dataKey="confirmed" name="Confirmed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

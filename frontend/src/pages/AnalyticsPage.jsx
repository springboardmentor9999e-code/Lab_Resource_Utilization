import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { motion } from 'framer-motion';
import {
  Loader2, AlertTriangle, LayoutDashboard, CalendarCheck, Clock, Hourglass,
  ThumbsUp, TrendingUp, Wrench, FileWarning, Share2, Lightbulb, Package, Users, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import PageTransition from '../components/PageTransition';

const STATUS_COLORS = {
  AVAILABLE: '#10b981', RESERVED: '#f59e0b', IN_USE: '#3b82f6',
  UNDER_MAINTENANCE: '#eab308', OUT_OF_SERVICE: '#ef4444', RETIRED: '#a855f7', LOST: '#64748b',
};

const AnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      setData(await analyticsService.getDashboard(days));
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stat = (Icon, label, value, accent = 'text-primary') => (
    <div className="glass-card dark:glass-card-dark rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 my-0">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 dark:text-white my-0">{value ?? '—'}</p>
      </div>
    </div>
  );

  const sectionTitle = (text) => (
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{text}</h2>
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="h-64 flex flex-col justify-center items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-sm text-slate-500">Building your intelligence dashboard...</span>
        </div>
      </PageTransition>
    );
  }

  if (errorMsg || !data) {
    return (
      <PageTransition>
        <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{errorMsg || 'No data.'}</span>
        </div>
      </PageTransition>
    );
  }

  const { role, common, personal, manager, admin } = data;
  const statusChartData = Object.entries(common?.equipmentStatusCounts || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, key: name }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-3">
              <LayoutDashboard className="h-7 w-7 text-primary" /> Intelligence Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {role === 'ADMIN' ? 'Organization-wide resource intelligence and procurement insights.'
                : role === 'MANAGER' ? 'Department utilization, approvals and maintenance load.'
                : 'Your bookings, waitlists and personalised recommendations.'}
            </p>
          </div>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  days === d ? 'bg-primary text-white border-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Personal block — everyone */}
        <div>
          {sectionTitle('My Activity')}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stat(CalendarCheck, 'Total Bookings', personal?.totalBookings, 'text-primary')}
            {stat(ThumbsUp, 'Completed', personal?.completedBookings, 'text-emerald-500')}
            {stat(Hourglass, 'Active Waitlist', personal?.activeWaitlistEntries, 'text-amber-500')}
            {stat(Clock, 'No-shows', personal?.noShows, 'text-red-500')}
          </div>
        </div>

        {/* Upcoming bookings + recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
            {sectionTitle('Upcoming Bookings')}
            {personal?.upcomingBookings?.length ? (
              <div className="space-y-2">
                {personal.upcomingBookings.map((b) => (
                  <div key={b.bookingId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">{b.equipmentName}</span>
                      <span className="text-slate-400 ml-2">{b.bookingDate} · {b.startTime?.substring(0, 5)}-{b.endTime?.substring(0, 5)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{b.status}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-400 py-4">No upcoming bookings.</p>}
          </div>

          <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
            {sectionTitle('Recommended For You')}
            {personal?.recommendations?.length ? (
              <div className="space-y-2">
                {personal.favouriteCategory && (
                  <p className="text-[11px] text-slate-400 mb-2">Based on your interest in <span className="font-bold text-primary">{personal.favouriteCategory}</span>:</p>
                )}
                {personal.recommendations.map((r) => (
                  <div key={r.equipmentId} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 text-xs">
                    <Package className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-white">{r.equipmentName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{r.equipmentCode}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-400 py-4">Book some equipment to get personalised recommendations.</p>}
          </div>
        </div>

        {/* Equipment availability — everyone */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
          {sectionTitle(`Equipment Availability (${common?.totalEquipment} total)`)}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415522" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manager block */}
        {manager && (
          <div>
            {sectionTitle('Management Overview')}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
              {stat(Clock, 'Pending Approvals', manager.pendingApprovals, 'text-amber-500')}
              {stat(TrendingUp, 'No-show Rate', `${manager.noShowRate}%`, 'text-red-500')}
              {stat(Wrench, 'Open Work Orders', manager.openWorkOrders, 'text-indigo-500')}
              {stat(Activity, 'In Progress', manager.workOrdersInProgress, 'text-blue-500')}
              {stat(FileWarning, 'Overdue Calibrations', manager.overdueCalibrations, 'text-red-500')}
              {stat(Share2, 'Pending Sharing', manager.pendingSharingRequests, 'text-purple-500')}
            </div>
            {manager.highDemandEquipment?.length > 0 && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                {sectionTitle(`High-demand Equipment (last ${days}d)`)}
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={manager.highDemandEquipment} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#33415522" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="equipmentName" tick={{ fontSize: 10 }} width={140} />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin block */}
        {admin && (
          <div>
            {sectionTitle('Organization Intelligence')}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {stat(TrendingUp, 'Overall Utilization', `${admin.overallUtilizationRate}%`, 'text-primary')}
              {stat(Package, 'Idle Equipment', admin.idleEquipmentCount, 'text-red-500')}
              {stat(Users, 'Total Users', admin.totalUsers, 'text-indigo-500')}
              {stat(Share2, 'Approved Shares', admin.sharingCounts?.APPROVED, 'text-emerald-500')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department utilization */}
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                {sectionTitle('Department Utilization')}
                {admin.departmentUtilization && Object.keys(admin.departmentUtilization).length ? (
                  <div className="space-y-3">
                    {Object.entries(admin.departmentUtilization).map(([dept, rate]) => (
                      <div key={dept}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{dept}</span>
                          <span className="text-slate-400">{rate}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(100, rate)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400 py-4">No utilization data.</p>}
              </div>

              {/* Procurement recommendations */}
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50">
                {sectionTitle('Procurement & Reallocation Insights')}
                {admin.procurementRecommendations?.length ? (
                  <div className="space-y-2">
                    {admin.procurementRecommendations.map((rec, i) => (
                      <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${
                        rec.action === 'PROCURE'
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300'
                      }`}>
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400 py-4">Utilization is balanced — no procurement actions suggested.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AnalyticsPage;

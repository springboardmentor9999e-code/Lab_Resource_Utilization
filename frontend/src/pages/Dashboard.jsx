import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MdScience, MdEventNote, MdBuild, MdPeople, MdTrendingUp,
  MdCheckCircle, MdPending, MdWarning, MdArrowForward,
  MdBusiness, MdSwapHoriz, MdRefresh, MdNotifications
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { dashboardService, waitlistService } from '../services/services';
import EquipmentImage from '../components/EquipmentImage';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const STATUS_COLOR = {
  CONFIRMED: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
  PENDING:   'text-amber-600 bg-amber-50 border border-amber-100',
  CANCELLED: 'text-slate-500 bg-slate-50 border border-slate-200',
  IN_USE:    'text-blue-600 bg-blue-50 border border-blue-100',
  REJECTED:  'text-rose-600 bg-rose-50 border border-rose-100',
  COMPLETED: 'text-slate-500 bg-slate-100 border border-slate-200',
};

function StatCard({ icon: Icon, label, value, sub, color = 'purple', trend }) {
  const colors = {
    purple: 'text-purple-650 bg-purple-50/70 border-purple-100',
    blue:   'text-blue-650 bg-blue-50/70 border-blue-100',
    green:  'text-emerald-650 bg-emerald-50/70 border-emerald-100',
    amber:  'text-amber-650 bg-amber-50/70 border-amber-100',
    red:    'text-rose-650 bg-rose-50/70 border-rose-100',
    cyan:   'text-cyan-650 bg-cyan-50/70 border-cyan-100',
  };
  const cls = colors[color] || colors.purple;

  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-slate-800 text-3xl font-extrabold mt-1.5">{value}</p>
          {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${cls}`}>
          <Icon className="text-xl" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <MdTrendingUp className="text-emerald-500" />
          <span className="text-emerald-600 font-semibold">{trend}</span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-800 font-bold text-base">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 transition-colors">
          {action} <MdArrowForward className="text-sm" />
        </button>
      )}
    </div>
  );
}

function BookingRow({ booking }) {
  const statusCls = STATUS_COLOR[booking.status] || 'text-slate-500 bg-slate-100 border border-slate-200';
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
          <EquipmentImage equipment={{ name: booking.equipmentName, categoryName: booking.categoryName }} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-slate-800 text-sm font-bold truncate">{booking.equipmentName}</p>
          <p className="text-slate-400 text-xs mt-0.5">{booking.userName} · {booking.bookingReference}</p>
        </div>
      </div>
      <span className={`ml-3 text-[10px] px-2.5 py-1 rounded-lg font-bold tracking-wider uppercase ${statusCls}`}>
        {booking.status?.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

function RecentBookingsTable({ bookings, limit = 5 }) {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-slate-450 text-[10px] font-bold uppercase tracking-wider">
            <th className="py-2.5 px-4 font-bold">Equipment</th>
            <th className="py-2.5 px-4 font-bold">User</th>
            <th className="py-2.5 px-4 font-bold">Time</th>
            <th className="py-2.5 px-4 font-bold text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {bookings.slice(0, limit).map((booking) => {
            const statusCls = STATUS_COLOR[booking.status] || 'text-slate-500 bg-slate-100 border border-slate-200';
            const formattedTime = new Date(booking.startTime).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                      <EquipmentImage equipment={{ name: booking.equipmentName, categoryName: booking.categoryName }} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{booking.equipmentName}</div>
                      <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                          {booking.categoryName}
                        </span>
                        <span className="text-slate-350">•</span>
                        <span className="text-slate-400">{booking.equipmentLocation}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-700 text-xs">{booking.userName}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{booking.userEmail}</div>
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                  {formattedTime}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-lg font-bold tracking-wider uppercase ${statusCls}`}>
                    {booking.status?.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {bookings.length === 0 && (
        <p className="text-slate-450 text-sm text-center py-8">No bookings yet</p>
      )}
    </div>
  );
}

function HeatmapWidget({ heatmapData }) {
  if (!heatmapData || heatmapData.length === 0) return null;
  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
      <SectionHeader title="Utilization Heatmap" />
      <div className="grid grid-cols-2 gap-2 mt-4">
        {heatmapData.map((d, i) => {
          const intensity = d.utilizationPercentage > 80 ? 'bg-purple-600' : d.utilizationPercentage > 50 ? 'bg-purple-400' : 'bg-purple-200';
          return (
            <div key={i} className={`p-3 rounded-lg text-white font-bold flex flex-col justify-between h-20 ${intensity}`}>
              <span className="text-xs opacity-90">{d.category} - {d.timePeriod}</span>
              <span className="text-lg">{d.utilizationPercentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IdleEquipmentWidget({ idleData }) {
  if (!idleData || idleData.length === 0) return null;
  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
      <SectionHeader title="Idle Equipment Alerts" />
      <div className="space-y-3 mt-4">
        {idleData.map((eq, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-rose-100 bg-rose-50/50">
            <div>
              <p className="font-bold text-slate-800 text-sm">{eq.equipmentName}</p>
              <p className="text-xs text-slate-500 mt-1">Idle for {eq.daysIdle} days · {eq.departmentName}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 font-bold text-[10px] uppercase rounded-md tracking-wider">
                {eq.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitlistWidget({ waitlist }) {
  if (!waitlist || waitlist.length === 0) return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
      <SectionHeader title="Waitlist Status" />
      <p className="text-sm text-slate-500">You are not on any waitlists.</p>
    </div>
  );
  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
      <SectionHeader title="Waitlist Status" />
      <div className="space-y-3 mt-4">
        {waitlist.map((w, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-amber-100 bg-amber-50/50">
            <div>
              <p className="font-bold text-slate-800 text-sm">{w.equipmentName}</p>
              <p className="text-xs text-slate-500 mt-1">Joined {formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 font-bold text-[10px] uppercase rounded-md tracking-wider">
                Position #{w.position}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestedSlotsWidget() {
  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
      <SectionHeader title="Suggested Available Slots" />
      <div className="space-y-3 mt-4">
        <p className="text-sm text-slate-500 mb-2">Based on your recent waitlists or failed bookings:</p>
        <div className="flex justify-between items-center p-3 rounded-lg border border-blue-100 bg-blue-50/50">
          <div>
            <p className="font-bold text-slate-800 text-sm">Centrifuge 5000</p>
            <p className="text-xs text-slate-500 mt-1">Tomorrow, 09:00 - 11:00</p>
          </div>
          <button className="text-[10px] px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Book Slot
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role-specific dashboards ───────────────────────────────────────────────

function ResearcherDashboard({ stats, bookings, utilChart }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MdEventNote}   label="My Bookings"        value={0} color="purple" />
        <StatCard icon={MdScience}     label="Available Equipment" value={stats?.availableEquipment ?? '—'} color="green" />
        <StatCard icon={MdPending}     label="Pending Requests"    value={stats?.pendingRequests ?? '—'} color="amber" />
        <StatCard icon={MdCheckCircle} label="Utilization Rate"    value={`${stats?.utilizationRate ?? 0}%`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="My Bookings" action="Book Equipment" onAction={() => navigate('/equipment')} />
          <RecentBookingsTable bookings={bookings} />
        </div>
        <div className="space-y-6">
          <WaitlistWidget waitlist={stats?.waitlist} />
          <SuggestedSlotsWidget />
        </div>
      </div>

      <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Browse Equipment', icon: MdScience, to: '/equipment', color: 'purple' },
            { label: 'My Bookings', icon: MdEventNote, to: '/bookings', color: 'blue' },
            { label: 'Request Role Upgrade', icon: MdSwapHoriz, to: '/role-requests', color: 'amber' },
            { label: 'Notifications', icon: MdNotifications, to: '/notifications', color: 'green' },
          ].map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 p-4 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl border border-slate-200/50 transition-all group shadow-sm active:scale-95">
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`text-${color}-600 text-xl`} />
              </div>
              <span className="text-slate-600 font-semibold text-xs text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LabManagerDashboard({ stats, bookings, statusDist }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={MdScience}     label="Total Equipment"    value={stats?.totalEquipment ?? '—'} color="purple" />
        <StatCard icon={MdCheckCircle} label="Available"          value={stats?.availableEquipment ?? '—'} color="green" />
        <StatCard icon={MdBuild}       label="Under Maintenance"  value={stats?.underMaintenanceEquipment ?? '—'} color="amber" />
        <StatCard icon={MdEventNote}   label="Active Bookings"    value={stats?.activeBookings ?? '—'} color="blue" />
        <StatCard icon={MdPending}     label="Pending Approvals"  value={stats?.pendingRequests ?? '—'} color="red" />
        <StatCard icon={MdTrendingUp}  label="Utilization"        value={`${stats?.utilizationRate ?? 0}%`} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Recent Bookings" action="View All" onAction={() => navigate('/bookings')} />
          <RecentBookingsTable bookings={bookings} />
        </div>

        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Equipment Status" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusDist.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-500 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Pending Approvals" action="View All" onAction={() => navigate('/bookings')} />
          <div>{bookings.filter(b => b.status === 'PENDING').slice(0, 5).map(b => <BookingRow key={b.id} booking={b} />)}</div>
          {bookings.filter(b => b.status === 'PENDING').length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6">No pending approvals</p>
          )}
        </div>
        
        <div className="space-y-6">
          <HeatmapWidget heatmapData={stats?.heatmap} />
          <IdleEquipmentWidget idleData={stats?.idleEquipment} />
        </div>
      </div>
    </div>
  );
}


function LabTechnicianDashboard({ stats }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MdScience}    label="Total Equipment"   value={stats?.totalEquipment ?? '—'} color="purple" />
        <StatCard icon={MdBuild}      label="Under Maintenance" value={stats?.underMaintenanceEquipment ?? '—'} color="amber" />
        <StatCard icon={MdCheckCircle} label="Available"        value={stats?.availableEquipment ?? '—'} color="green" />
        <StatCard icon={MdWarning}    label="Pending Requests"  value={stats?.pendingRequests ?? '—'} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Maintenance Tasks" action="View Equipment" onAction={() => navigate('/equipment')} />
          <div className="space-y-3 mt-2">
            {['Microscope — Check calibration', 'Oscilloscope — Clean sensors', 'Laser Cutter — Safety check'].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-slate-650 text-sm font-semibold">{task}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Equipment Status Summary" />
          <div className="space-y-3 mt-2">
            {[
              { label: 'Available', value: stats?.availableEquipment ?? 0, color: 'bg-emerald-500', max: stats?.totalEquipment ?? 1 },
              { label: 'Under Maintenance', value: stats?.underMaintenanceEquipment ?? 0, color: 'bg-amber-500', max: stats?.totalEquipment ?? 1 },
              { label: 'Active Bookings', value: stats?.activeBookings ?? 0, color: 'bg-blue-500', max: stats?.totalEquipment ?? 1 },
            ].map(({ label, value, color, max }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-500 text-xs font-semibold">{label}</span>
                  <span className="text-slate-800 text-xs font-bold">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstitutionAdminDashboard({ stats, bookings, statusDist }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={MdPeople}     label="Total Users"        value={stats?.totalUsers ?? '—'} color="purple" />
        <StatCard icon={MdScience}    label="Total Equipment"    value={stats?.totalEquipment ?? '—'} color="blue" />
        <StatCard icon={MdEventNote}  label="Active Bookings"    value={stats?.activeBookings ?? '—'} color="green" />
        <StatCard icon={MdPending}    label="Pending Bookings"   value={stats?.pendingRequests ?? '—'} color="amber" />
        <StatCard icon={MdSwapHoriz}  label="Role Requests"      value={stats?.pendingRoleRequests ?? '—'} color="cyan" />
        <StatCard icon={MdTrendingUp} label="Utilization"        value={`${stats?.utilizationRate ?? 0}%`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Recent Bookings" action="View All" onAction={() => navigate('/bookings')} />
          <RecentBookingsTable bookings={bookings} />
        </div>

        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Equipment Status" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusDist.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-500 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <HeatmapWidget heatmapData={stats?.heatmap} />
        <IdleEquipmentWidget idleData={stats?.idleEquipment} />
      </div>
    </div>
    </div>
  );
}

function SystemAdminDashboard({ stats, bookings, utilChart, statusDist }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={MdBusiness}   label="Institutions"      value="3" color="purple" sub="Registered institutions" />
        <StatCard icon={MdPeople}     label="Total Users"       value={stats?.totalUsers ?? '—'} color="blue" />
        <StatCard icon={MdScience}    label="Total Equipment"   value={stats?.totalEquipment ?? '—'} color="green" />
        <StatCard icon={MdEventNote}  label="Active Bookings"   value={stats?.activeBookings ?? '—'} color="amber" />
        <StatCard icon={MdSwapHoriz}  label="Pending Role Req." value={stats?.pendingRoleRequests ?? '—'} color="red" />
        <StatCard icon={MdTrendingUp} label="Utilization Rate"  value={`${stats?.utilizationRate ?? 0}%`} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Recent Bookings" action="View All" onAction={() => navigate('/bookings')} />
          <RecentBookingsTable bookings={bookings} />
        </div>

        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
          <SectionHeader title="Equipment Distribution" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusDist.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-500">{item.name}</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeatmapWidget heatmapData={stats?.heatmap} />
        <IdleEquipmentWidget idleData={stats?.idleEquipment} />
      </div>

      <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
        <SectionHeader title="Utilization Trend" />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={utilChart}>
            <defs>
              <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#334155' }} />
            <Area type="monotone" dataKey="utilization" stroke="#8b5cf6" fill="url(#g3)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-sm">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', icon: MdPeople, to: '/users', color: 'purple' },
            { label: 'Role Requests', icon: MdSwapHoriz, to: '/role-requests', color: 'amber' },
            { label: 'Equipment', icon: MdScience, to: '/equipment', color: 'blue' },
            { label: 'Analytics', icon: MdTrendingUp, to: '/analytics', color: 'green' },
          ].map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 p-4 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl border border-slate-200/50 transition-all group shadow-sm active:scale-95">
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`text-${color}-600 text-xl`} />
              </div>
              <span className="text-slate-650 font-semibold text-xs text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [utilChart, setUtilChart] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [loading, setLoading] = useState(true);

  const primaryRole = user?.roles?.[0] || 'RESEARCHER';
  const firstName = user?.firstName || 'User';

  const ROLE_GREETING = {
    SYSTEM_ADMIN:     'System Overview',
    INSTITUTION_ADMIN: 'Institution Dashboard',
    LAB_MANAGER:      'Lab Manager Dashboard',
    LAB_TECHNICIAN:   'Technician Dashboard',
    RESEARCHER:       'My Dashboard',
  };

  useEffect(() => {
    setLoading(true);
    const isResearcher = primaryRole === 'RESEARCHER';
    const bookingsFetch = isResearcher ? dashboardService.getMyBookings() : dashboardService.getRecentBookings();

    Promise.allSettled([
      dashboardService.getStats(),
      bookingsFetch,
      dashboardService.getUtilizationChart(),
      dashboardService.getEquipmentStatus(),
      dashboardService.getHeatmap('daily'),
      dashboardService.getIdleEquipment(30),
      isResearcher ? waitlistService.getMy() : Promise.resolve({ data: { data: [] } })
    ]).then(([s, b, u, e, h, ie, w]) => {
      let statsObj = s.status === 'fulfilled' ? s.value.data?.data : {};
      if (s.status === 'fulfilled') {
          statsObj.heatmap = h.status === 'fulfilled' ? h.value.data?.data : [];
          statsObj.idleEquipment = ie.status === 'fulfilled' ? ie.value.data?.data : [];
          statsObj.waitlist = w.status === 'fulfilled' ? w.value.data?.data : [];
          setStats(statsObj);
      }
      if (b.status === 'fulfilled') setBookings(b.value.data?.data || []);
      if (u.status === 'fulfilled') setUtilChart(u.value.data?.data || []);
      if (e.status === 'fulfilled') setStatusDist(e.value.data?.data || []);
    }).finally(() => setLoading(false));
  }, [primaryRole]);

  const sharedProps = { stats, bookings, utilChart, statusDist };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {ROLE_GREETING[primaryRole] || 'Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="text-purple-600 font-bold">{firstName}</span>
          </p>
        </div>
        <button onClick={() => window.location.reload()}
          className="btn-secondary text-slate-600 hover:text-slate-900">
          <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {primaryRole === 'SYSTEM_ADMIN' && <SystemAdminDashboard {...sharedProps} />}
          {primaryRole === 'INSTITUTION_ADMIN' && <InstitutionAdminDashboard {...sharedProps} />}

          {primaryRole === 'LAB_MANAGER' && <LabManagerDashboard {...sharedProps} />}
          {primaryRole === 'LAB_TECHNICIAN' && <LabTechnicianDashboard {...sharedProps} />}
          {primaryRole === 'RESEARCHER' && <ResearcherDashboard {...sharedProps} />}
          {!NAV_MAP[primaryRole] && <ResearcherDashboard {...sharedProps} />}
        </>
      )}
    </div>
  );
}

const NAV_MAP = {
  SYSTEM_ADMIN: true, INSTITUTION_ADMIN: true,
  LAB_MANAGER: true, LAB_TECHNICIAN: true, RESEARCHER: true,
};

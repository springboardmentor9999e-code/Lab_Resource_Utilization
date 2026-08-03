import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Cpu, 
  Users, 
  TrendingUp, 
  History, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { departments, equipment, labs, users, activityLogs, bookings, tickets } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'users' | 'activity' | 'procurement'>('overview');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');

  const totalLabs = labs.length;
  const totalEquipment = equipment.length;
  const totalUsers = users.length;
  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'In Use' || b.status === 'Assigned Slot').length;
  const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  const avgUtilization = Math.round(
    departments.reduce((acc, d) => acc + d.utilizationRate, 0) / (departments.length || 1)
  );

  const filteredLogs = activityLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.category.toLowerCase() === logFilter.toLowerCase();
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.departmentName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Admin KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Departments</p>
            <h3 className="text-2xl font-bold text-white mt-1">{departments.length}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Monitored
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Equipment</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalEquipment}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Across {totalLabs} Active Labs</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Utilization</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{avgUtilization}%</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.2% vs last month
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Bookings</p>
            <h3 className="text-2xl font-bold text-white mt-1">{activeBookings}</h3>
            <p className="text-[11px] text-indigo-400 mt-1">Current & Upcoming</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{openTickets}</h3>
            <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Requires Maintenance
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-slate-700 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          System Overview & Heatmap
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Roster ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Activity Logs & Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'procurement'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Procurement & Sharing Insights
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Department Utilization Heatmap Summary */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Department Equipment Utilization Matrix
                </h2>
                <p className="text-xs text-slate-400">Current utilization vs target capacity per department</p>
              </div>
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
                Live Metrics
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {departments.map(dept => {
                const isHigh = dept.utilizationRate >= 80;
                const isMedium = dept.utilizationRate >= 65 && dept.utilizationRate < 80;
                const barColor = isHigh ? 'bg-indigo-500' : isMedium ? 'bg-blue-500' : 'bg-emerald-500';

                return (
                  <div key={dept.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{dept.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">({dept.code})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{dept.totalEquipment} Equipment</span>
                        <span className="font-bold text-indigo-400 font-mono">{dept.utilizationRate}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${dept.utilizationRate}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>HOD: {dept.hodName}</span>
                      <span>{dept.studentCount} Students · {dept.facultyCount} Faculty</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats & Alerts */}
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                High Priority Alerts
              </h3>

              <div className="space-y-2">
                <div className="p-3 bg-amber-900/20 border border-amber-700/40 rounded-xl text-xs text-amber-200">
                  <span className="font-semibold block mb-0.5">Calibration Overdue</span>
                  Illumina Gene Sequencer (EQ-005) calibration passed due date on July 10, 2026.
                </div>

                <div className="p-3 bg-rose-900/20 border border-rose-700/40 rounded-xl text-xs text-rose-200">
                  <span className="font-semibold block mb-0.5">Degraded Lab Condition</span>
                  RF & Wireless Communication Lab (ECE-L102) flagged as Degraded due to Signal Analyzer fault.
                </div>

                <div className="p-3 bg-indigo-900/20 border border-indigo-700/40 rounded-xl text-xs text-indigo-200">
                  <span className="font-semibold block mb-0.5">High Peak Demand</span>
                  Nvidia H100 AI Cluster (CSE) at 91.4% capacity. Recommend inter-department load balancing.
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 border border-indigo-500/30 rounded-2xl p-5 text-slate-100">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Inter-Department Sharing Policy
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                All high-value lab equipment (&gt;$50,000 purchase cost) must remain cataloged for inter-department reservation during non-peak research hours (18:00 - 08:00).
              </p>
              <div className="text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-indigo-500/20 text-indigo-200 flex items-center justify-between">
                <span>Sharing Enabled Equipment:</span>
                <span className="font-bold font-mono">4 Assets</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => (
            <div key={dept.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                    {dept.code}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{dept.name}</h3>
                  <p className="text-xs text-slate-400">Head: {dept.hodName}</p>
                </div>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {dept.utilizationRate}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Labs</span>
                  <span className="font-bold text-white">{dept.totalLabs} Labs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Equipment</span>
                  <span className="font-bold text-white">{dept.totalEquipment} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Students</span>
                  <span className="font-bold text-white">{dept.studentCount} Users</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Faculty / Tech</span>
                  <span className="font-bold text-white">{dept.facultyCount} / {dept.technicianCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Labs: ECE-L101, ECE-L102</span>
                <span className="text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium">
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">University User Directory</h2>
              <p className="text-xs text-slate-400">Manage all registered staff, technicians, students, and admins</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
                <tr>
                  <th className="p-3">User Name & Title</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-700/30">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        u.role === 'admin' ? 'bg-purple-900/50 text-purple-300 border-purple-700/50' :
                        u.role === 'hod' ? 'bg-blue-900/50 text-blue-300 border-blue-700/50' :
                        u.role === 'staff' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' :
                        u.role === 'lab_technician' ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' :
                        u.role === 'student' ? 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50' :
                        'bg-rose-900/50 text-rose-300 border-rose-700/50'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">{u.departmentName}</td>
                    <td className="p-3">
                      <div className="text-slate-200">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px]">
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Logs */}
      {activeTab === 'activity' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Global System Audit Trail & Activity Logs
              </h2>
              <p className="text-xs text-slate-400">Complete immutable record of all booking, maintenance, and role actions</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Category:</span>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="booking">Booking</option>
                <option value="equipment">Equipment</option>
                <option value="maintenance">Maintenance</option>
                <option value="calibration">Calibration</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-900/70 border border-slate-700/60 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700 uppercase">
                      {log.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{log.details}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>User: <strong className="text-slate-200">{log.userName}</strong> ({log.userRole})</span>
                  <span>·</span>
                  <span>Dept: <strong className="text-slate-200">{log.departmentName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Procurement */}
      {activeTab === 'procurement' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Resource Procurement & Sharing Recommendations
            </h2>
            <p className="text-xs text-slate-400">Data-driven procurement insights based on peak demand and idle equipment analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-900/80 border border-indigo-500/30 rounded-xl space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Recommendation #1 (CSE / AI)</span>
              <h3 className="text-sm font-bold text-white">Expand GPU Compute Capacity</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nvidia H100 Node 01 has reached 91.4% capacity with an average waitlist time of 4.2 days. Procurement of 1 additional GPU server node is recommended for FY2027 budget.
              </p>
              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                Estimated Cost: $180,000 · ROI Impact: High
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-indigo-500/30 rounded-xl space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Recommendation #2 (MECH / ECE)</span>
              <h3 className="text-sm font-bold text-white">Inter-Department Additive Manufacturing Protocol</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formlabs Form 3L 3D Printer in MECH is idle 45% of weekday mornings. Share access with ECE Embedded Systems lab for IoT enclosure fabrication.
              </p>
              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                Cost Saved: $14,500 (Avoids duplicate printer purchase)
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

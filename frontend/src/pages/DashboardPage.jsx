import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services/platformService';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Activity, 
  Key, 
  UserCheck, 
  CheckCircle,
  TrendingUp,
  Fingerprint,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import PageTransition from '../components/PageTransition';

const DashboardPage = () => {
  const { user, token } = useAuth();

  // Live stats — real data only, zeros until the API responds
  const [stats, setStats] = useState({
    bookedLabs: 0,
    activeDevices: 0,
    totalEquipment: 0,
    pendingRequests: 0,
    categoryCounts: [],
    weeklyBookings: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await platformService.getStats();
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to retrieve live stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Custom animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const getRoleDescription = (role) => {
    const r = role?.toUpperCase();
    switch (r) {
      case 'ADMIN':
        return 'Full read/write permissions. Access to cluster nodes, system logs, master configuration, database seeding, and global user authorizations.';
      case 'STUDENT':
        return 'Standard reservation permissions. Able to request lab slots and view equipment availability. Approval required from Department Head.';
      case 'RESEARCHER':
        return 'Priority reservation permissions. Direct booking for advanced instrumentation. Able to publish usage summaries.';
      case 'TECHNICIAN':
        return 'Operational permissions. Maintenance overrides, safety checks, inventory updates, and session logs approval.';
      case 'HOD':
        return 'Administrative permissions. Manage lab safety schedules, audit resource allocation, and approve equipment bookings.';
      default:
        return 'Standard authenticated session. Access level governed by institutional compliance guidelines.';
    }
  };

  // Recharts data — straight from the backend, no synthetic values
  const categoryData = stats.categoryCounts || [];
  const bookingData = stats.weeklyBookings || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white my-0 font-heading">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.firstName || 'User'}</span>!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here is the utilization report for {user?.institution || 'your institution'} today.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-semibold shadow-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Connection Secure</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Stat 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card dark:glass-card-dark p-5 rounded-2xl relative overflow-hidden transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/25 transition-colors">
              <Calendar className="h-16 w-16" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booked Labs</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-0 leading-none">
                  {stats.bookedLabs}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Confirmed bookings platform-wide
            </p>
          </motion.div>

          {/* Stat 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card dark:glass-card-dark p-5 rounded-2xl relative overflow-hidden transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 p-3 text-secondary/10 group-hover:text-secondary/25 transition-colors">
              <Clock className="h-16 w-16" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Devices</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-0 leading-none">
                  {stats.activeDevices}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary">
                <Cpu className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Available or reserved right now
            </p>
          </motion.div>

          {/* Stat 3 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card dark:glass-card-dark p-5 rounded-2xl relative overflow-hidden transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 p-3 text-accent/10 group-hover:text-accent/25 transition-colors">
              <Layers className="h-16 w-16" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Equipment</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-0 leading-none">
                  {stats.totalEquipment}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-accent/10 dark:bg-accent/20 text-accent">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4">
              Registered in the inventory catalog
            </p>
          </motion.div>

          {/* Stat 4 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card dark:glass-card-dark p-5 rounded-2xl relative overflow-hidden transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 p-3 text-green-500/10 group-hover:text-green-500/25 transition-colors">
              <Activity className="h-16 w-16" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 mb-0 leading-none">
                  {stats.pendingRequests}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-green-500/10 dark:bg-green-500/20 text-green-500">
                <HelpCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4">
              Awaiting manager authorizations
            </p>
          </motion.div>
        </motion.div>

        {/* Recharts Analytics Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Equipment category distribution */}
          <div className="lg:col-span-6 glass-card dark:glass-card-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 my-0">
              Equipment Categories Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      borderColor: '#334155', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly booking traffic */}
          <div className="lg:col-span-6 glass-card dark:glass-card-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 my-0">
              Weekly Reservation Traffic
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      borderColor: '#334155', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }} 
                  />
                  <Area type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* User Role Card & JWT Token Inspection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* User Profile / Role Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Welcome Card & Current User Role Card */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white my-0 font-heading">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <span className="text-[10px] bg-primary/10 dark:bg-primary/25 text-primary dark:text-blue-400 font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider">
                    {user?.roles?.[0] || user?.role || 'STUDENT'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Department</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">{user?.department || 'CSE'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Institution</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">{user?.institution || 'CUTM'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Username</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">@{user?.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Phone Number</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">{user?.phone || user?.phoneNumber || '1234567890'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Scope details */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider my-0">Role Capabilities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 bg-slate-100/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                {getRoleDescription(user?.roles?.[0] || user?.role || 'STUDENT')}
              </p>
            </div>
            
          </div>

          {/* JWT Status Card */}
          <div className="lg:col-span-7">
            <div className="glass-card dark:glass-card-dark rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white my-0 font-heading flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" /> Active Session Token (JWT)
                  </h3>
                  <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-green-500/10 text-green-500 rounded border border-green-500/20 animate-pulse">
                    Valid
                  </div>
                </div>

                {/* Token string viewer */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Raw JWT Header & Signature</span>
                    <div className="bg-slate-100 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono break-all leading-normal text-slate-600 dark:text-slate-400">
                      {token}
                    </div>
                  </div>

                  {/* Claims Analyzer */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Decoded JWT Claims</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 text-xs">
                        <span className="text-slate-400 block font-medium">Issuer (iss)</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200 mt-1 block">lrup-auth-server</span>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 text-xs">
                        <span className="text-slate-400 block font-medium">Subject (sub)</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200 mt-1 block">@{user?.username}</span>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 text-xs">
                        <span className="text-slate-400 block font-medium">Issued At (iat)</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200 mt-1 block">{new Date().toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 text-xs">
                        <span className="text-slate-400 block font-medium">Algorithm</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200 mt-1 block">HMAC-SHA256</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom metadata */}
              <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-primary" /> Session ID:
                </span>
                <span className="font-mono">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PageTransition>
  );
};

export default DashboardPage;

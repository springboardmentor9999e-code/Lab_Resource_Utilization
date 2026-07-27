import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Microscope,
  Database,
  Calendar,
  BarChart3,
  Share2,
  Wrench,
  Wallet,
  LineChart,
  FileText,
  CheckCheck,
  Loader2
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admins can manage users & roles; everyone else sees the standard nav
  const userRoles = (user?.roles ? Array.from(user.roles) : [user?.role]).filter(Boolean).map((r) => String(r).toUpperCase());
  const isAdmin = userRoles.includes('SYSTEM_ADMIN') || userRoles.includes('INSTITUTION_ADMIN');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/dashboard/analytics', icon: LineChart },
    { name: 'Equipment Inventory', path: '/dashboard/equipment', icon: Microscope },
    { name: 'Labs', path: '/dashboard/labs', icon: Database },
    { name: 'Bookings', path: '/dashboard/bookings', icon: Calendar },
    { name: 'Utilization', path: '/dashboard/utilization', icon: BarChart3 },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench },
    { name: 'Resource Sharing', path: '/dashboard/sharing', icon: Share2 },
    { name: 'Billing', path: '/dashboard/billing', icon: Wallet },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
    ...(isAdmin ? [{ name: 'User Management', path: '/dashboard/users', icon: Users }] : []),
    { name: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  // Live notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadUnreadCount = React.useCallback(async () => {
    try {
      setUnreadCount(await notificationService.getUnreadCount());
    } catch { /* ignore */ }
  }, []);

  // Poll the unread badge every 60s
  useEffect(() => {
    loadUnreadCount();
    const id = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(id);
  }, [loadUnreadCount]);

  // Load the list when the dropdown opens
  useEffect(() => {
    if (!notificationsOpen) return;
    setNotifLoading(true);
    notificationService.getMy()
      .then((list) => setNotifications(list || []))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [notificationsOpen]);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        await notificationService.markRead(n.notificationId);
        setNotifications((prev) => prev.map((x) =>
          x.notificationId === n.notificationId ? { ...x, read: true } : x));
        loadUnreadCount();
      }
    } catch { /* ignore */ }
    if (n.link) {
      setNotificationsOpen(false);
      navigate(n.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-card dark:glass-card-dark border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ease-in-out`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200/30 dark:border-slate-800/30 gap-2.5">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
            <Microscope className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col select-none"
            >
              <span className="font-heading font-extrabold text-sm tracking-tight leading-none">LabResource</span>
              <span className="text-[9px] text-primary uppercase font-bold tracking-wider mt-0.5">Utilization Suite</span>
            </motion.div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {sidebarOpen && (
                  <span className="ml-3 text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile section in sidebar bottom */}
        <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/30">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold truncate max-w-[110px]">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-40 w-64 glass-card dark:glass-card-dark p-6 flex flex-col justify-between md:hidden border-r border-white/20 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-200/30 dark:border-slate-800/30">
                  <div className="flex items-center gap-2">
                    <Microscope className="h-5 w-5 text-primary" />
                    <span className="font-heading font-extrabold text-sm">LabResource</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-8 space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[9px] text-slate-400">{user?.role}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Frame container */}
      <div className={`flex-1 flex flex-col min-h-screen ${
        sidebarOpen ? 'md:pl-64' : 'md:pl-20'
      } transition-all duration-300 ease-in-out`}>
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 glass-panel dark:glass-panel-dark border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
          
          {/* Left section: Hamburger / Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 truncate hidden xs:block my-0 font-heading">
              Lab Resource Utilization Platform
            </h1>
          </div>

          {/* Right section: Control panel widgets */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 border border-white dark:border-slate-950 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 max-w-sm glass-card dark:glass-card-dark rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-30 p-2"
                    >
                      <div className="px-4 py-2 border-b border-slate-200/30 dark:border-slate-800/30 flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          Alerts {unreadCount > 0 && <span className="text-primary">({unreadCount} new)</span>}
                        </span>
                        {notifications.some((n) => !n.read) && (
                          <button onClick={handleMarkAllRead}
                            className="text-[10px] text-primary font-bold cursor-pointer hover:underline flex items-center gap-1">
                            <CheckCheck className="h-3 w-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-slate-100/50 dark:divide-slate-800/50 max-h-96 overflow-y-auto">
                        {notifLoading ? (
                          <div className="py-8 flex justify-center">
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-8">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.notificationId}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 rounded-xl transition-colors cursor-pointer mt-1 ${
                                n.read ? 'hover:bg-slate-200/35 dark:hover:bg-slate-800/30'
                                  : 'bg-primary/5 hover:bg-primary/10'
                              }`}>
                              <div className="flex justify-between items-start gap-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                  {n.title}
                                </p>
                                <span className="text-[9px] text-slate-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs border border-primary/20">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass-card dark:glass-card-dark rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-30 p-2"
                    >
                      <div className="px-3 py-3 border-b border-slate-200/30 dark:border-slate-800/30 text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 text-[9px] font-bold">
                          {user?.role}
                        </span>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          to="/dashboard/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                        >
                          <User className="h-4 w-4 mr-2 text-slate-400" />
                          My Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/dashboard/users"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-xs text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                          >
                            <Users className="h-4 w-4 mr-2 text-slate-400" />
                            User Management
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-3 py-2 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;

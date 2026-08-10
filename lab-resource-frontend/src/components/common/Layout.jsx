import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Cpu, Calendar, Wrench, Building2,
  Bell, LogOut, Menu, X, FileText, Users, Shield, Activity,
  BarChart3, ClipboardList, User, Megaphone, Settings, Beaker,
  DollarSign, Receipt, CreditCard, Share2, ListOrdered, ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/api';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/equipment', label: 'Equipment', icon: Cpu },
  { path: '/bookings', label: 'Bookings', icon: Calendar },
  { path: '/bookings/my', label: 'My Bookings', icon: Calendar },
  { path: '/bookings/waitlist', label: 'Waitlist', icon: ListOrdered },
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

const managerNavItems = [
  { path: '/bookings/approvals', label: 'Approvals', icon: FileText },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: ClipboardList },
  { path: '/admin/costs', label: 'Cost Dashboard', icon: DollarSign },
  { path: '/admin/sharing', label: 'Resource Sharing', icon: Share2 },
  { path: '/admin/utilization', label: 'Utilization', icon: BarChart3 },
  { path: '/admin/calibration', label: 'Calibration', icon: ShieldCheck },
];

const adminNavItems = [
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/institutions', label: 'Institutions', icon: Building2 },
  { path: '/admin/laboratories', label: 'Laboratories', icon: Beaker },
  { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/admin/budgets', label: 'Budget Management', icon: DollarSign },
  { path: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
];

const systemAdminNavItems = [
  { path: '/admin/roles', label: 'Role Management', icon: Shield },
  { path: '/admin/system', label: 'System Health', icon: Activity },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

const technicianNavItems = [
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/admin/calibration', label: 'Calibration', icon: ShieldCheck },
];

export default function Layout() {
  const { user, logout, isManager, isAdmin, isSystemAdmin, isTechnician, isDepartmentHead } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  let allNavItems = [...navItems];
  if (isTechnician && !isManager) {
    allNavItems = allNavItems.filter(item =>
      item.path !== '/bookings' && item.path !== '/bookings/my' && item.path !== '/bookings/waitlist'
    );
    allNavItems = [...allNavItems, ...technicianNavItems];
  }
  if (isManager) allNavItems = [...allNavItems, ...managerNavItems];
  if (isAdmin) allNavItems = [...allNavItems, ...adminNavItems];
  if (isSystemAdmin) allNavItems = [...allNavItems, ...systemAdminNavItems];

  if (isSystemAdmin) {
    const operationalPaths = ['/bookings/waitlist'];
    allNavItems = allNavItems.filter(item => !operationalPaths.includes(item.path));
  }

  if (isManager && !isDepartmentHead && !isAdmin) {
    allNavItems = allNavItems.filter(item => item.path !== '/admin/costs');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h1 className="text-lg font-bold text-primary-700">LRUP</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {allNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <User size={18} />
            {sidebarOpen && <span>Profile</span>}
          </NavLink>
          <NavLink
            to="/notifications/preferences"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Settings size={18} />
            {sidebarOpen && <span>Notification Settings</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Lab Resource Utilization Platform</h2>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/profile" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-medium text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-gray-500 text-xs">{user?.role?.replace('_', ' ')}</p>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdScience, MdEventNote, MdBuild, MdNotifications,
  MdBarChart, MdAnalytics, MdSettings, MdPeople, MdLogout,
  MdExpandMore, MdAccountCircle, MdAdminPanelSettings,
  MdBusiness, MdSwapHoriz, MdReport, MdHandshake, MdShield
} from 'react-icons/md';

const NAV_BY_ROLE = {
  SYSTEM_ADMIN: [
    { label: 'Dashboard',         to: '/dashboard',         icon: MdDashboard },
    { label: 'Institutions',      to: '/institutions',      icon: MdBusiness },
    { label: 'Partnerships',      to: '/partnerships',      icon: MdHandshake },
    { label: 'Equipment Sharing', to: '/equipment-sharing', icon: MdSwapHoriz },
    { label: 'Users',             to: '/users',             icon: MdPeople },
    { label: 'Role Requests',     to: '/role-requests',     icon: MdSwapHoriz },
    { label: 'Equipment',         to: '/equipment',         icon: MdScience },
    { label: 'Bookings',          to: '/bookings',          icon: MdEventNote },
    { label: 'Analytics',         to: '/analytics',         icon: MdAnalytics },
    { label: 'Audit Logs',        to: '/audit-logs',        icon: MdShield },
    { label: 'Notifications',     to: '/notifications',     icon: MdNotifications },
  ],
  INSTITUTION_ADMIN: [
    { label: 'Dashboard',         to: '/dashboard',         icon: MdDashboard },
    { label: 'Partnerships',      to: '/partnerships',      icon: MdHandshake },
    { label: 'Equipment Sharing', to: '/equipment-sharing', icon: MdSwapHoriz },
    { label: 'Users',             to: '/users',             icon: MdPeople },
    { label: 'Role Requests',     to: '/role-requests',     icon: MdSwapHoriz },
    { label: 'Equipment',         to: '/equipment',         icon: MdScience },
    { label: 'Bookings',          to: '/bookings',          icon: MdEventNote },
    { label: 'Analytics',         to: '/analytics',         icon: MdAnalytics },
    { label: 'Notifications',     to: '/notifications',     icon: MdNotifications },
  ],

  LAB_MANAGER: [
    { label: 'Dashboard',         to: '/dashboard',         icon: MdDashboard },
    { label: 'Equipment',         to: '/equipment',         icon: MdScience },
    { label: 'Equipment Sharing', to: '/equipment-sharing', icon: MdSwapHoriz },
    { label: 'Bookings',          to: '/bookings',          icon: MdEventNote },
    { label: 'Maintenance',       to: '/maintenance',       icon: MdBuild },
    { label: 'Notifications',     to: '/notifications',     icon: MdNotifications },
  ],
  LAB_TECHNICIAN: [
    { label: 'Dashboard',         to: '/dashboard',         icon: MdDashboard },
    { label: 'Equipment',         to: '/equipment',         icon: MdScience },
    { label: 'Pending Bookings',  to: '/bookings',          icon: MdEventNote },
    { label: 'Maintenance',       to: '/maintenance',       icon: MdBuild },
    { label: 'Notifications',     to: '/notifications',     icon: MdNotifications },
  ],
  RESEARCHER: [
    { label: 'Dashboard',         to: '/dashboard',         icon: MdDashboard },
    { label: 'Browse Equipment',   to: '/equipment',         icon: MdScience },
    { label: 'My Bookings',       to: '/bookings',          icon: MdEventNote },
    { label: 'Role Requests',     to: '/role-requests',     icon: MdSwapHoriz },
    { label: 'Notifications',     to: '/notifications',     icon: MdNotifications },
    { label: 'Profile',           to: '/profile',           icon: MdAccountCircle },
  ],
};

const DEFAULT_NAV = [
  { label: 'Dashboard',     to: '/dashboard',     icon: MdDashboard },
  { label: 'Equipment',     to: '/equipment',     icon: MdScience },
  { label: 'Bookings',      to: '/bookings',      icon: MdEventNote },
  { label: 'Notifications', to: '/notifications', icon: MdNotifications },
];

const ROLE_COLORS = {
  SYSTEM_ADMIN:    'from-red-500 to-orange-500',
  INSTITUTION_ADMIN: 'from-orange-500 to-amber-500',
  LAB_MANAGER:     'from-green-500 to-teal-500',
  LAB_TECHNICIAN:  'from-yellow-500 to-lime-500',
  RESEARCHER:      'from-purple-500 to-blue-600',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const primaryRole = user?.roles?.[0] || 'RESEARCHER';
  const navItems = NAV_BY_ROLE[primaryRole] || DEFAULT_NAV;
  const avatarGradient = ROLE_COLORS[primaryRole] || 'from-purple-500 to-blue-600';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = primaryRole.replace(/_/g, ' ');

  return (
    <aside className="fixed top-0 left-0 h-full w-[220px] bg-[#090d22] border-r border-slate-800/40 flex flex-col z-30 select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/40">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
          <MdScience className="text-white text-xl" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">LabHub</div>
          <div className="text-slate-400 text-[10px] leading-tight">Lab Resource Platform</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${avatarGradient} bg-opacity-20 text-[10px] font-semibold text-white uppercase tracking-wider`}>
          <MdAdminPanelSettings className="text-sm" />
          {roleLabel}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to + label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
               ${isActive
                 ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20'
                 : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            <Icon className="text-lg flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors duration-200"
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-slate-400 text-[10px] truncate">{roleLabel}</div>
          </div>
          <MdExpandMore className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {userMenuOpen && (
          <div className="mt-1 bg-white/5 rounded-xl overflow-hidden border border-white/10">
            <NavLink
              to="/profile"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MdAccountCircle className="text-base" />
              Profile
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MdSettings className="text-base" />
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/5"
            >
              <MdLogout className="text-base" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

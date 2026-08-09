import {
  BarChart3,
  Bell,
  CalendarCheck,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Search,
  Users as UsersIcon,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import api from '../api/client.js';
import { canAccessPath, getFirstPermittedPath } from '../auth/permissions.js';
import { clearSession, displayName, formatRole, getStoredUser, saveUser } from '../auth/session.js';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Equipment', path: '/equipment', icon: FlaskConical },
  { label: 'Bookings', path: '/bookings', icon: CalendarCheck },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Users', path: '/users', icon: UsersIcon },
];

const pageTitles = {
  '/': 'Lab operations dashboard',
  '/equipment': 'Equipment inventory',
  '/bookings': 'Booking and scheduling',
  '/maintenance': 'Maintenance and calibration',
  '/analytics': 'Utilization analytics',
  '/users': 'User management',
};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] ?? 'Lab Resource Utilization Platform';
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [draftBooking, setDraftBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const userName = displayName(currentUser);
  const userRole = formatRole(currentUser?.role);
  const visibleNavigation = useMemo(
    () => navigation.filter((item) => canAccessPath(currentUser, item.path)),
    [currentUser],
  );

  useEffect(() => {
    let isMounted = true;

    async function refreshUser() {
      try {
        const response = await api.get('/auth/me');

        if (!isMounted) {
          return;
        }

        saveUser(response.data);
        setCurrentUser(response.data);

        if (!canAccessPath(response.data, location.pathname)) {
          navigate(getFirstPermittedPath(response.data), { replace: true });
        }
      } catch {
        // The API client handles expired sessions globally.
      }
    }

    refreshUser();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  function signOut() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-3">
          <img src="/lab-mark.svg" alt="" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">LRUP</p>
            <h1 className="text-lg font-bold leading-tight">Lab Resources</h1>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {visibleNavigation.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-emerald-950">{userName}</p>
          <p className="mt-1 text-sm text-emerald-800">{userRole}</p>
          <button
            className="focus-ring mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
            onClick={signOut}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <img src="/lab-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">LRUP</p>
                <h1 className="text-base font-bold">Lab Resources</h1>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Central Research Lab</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">{title}</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <span className="sr-only">Search resources</span>
                <input
                  className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search equipment, booking, user"
                  type="search"
                  value={searchQuery}
                />
              </label>

              <button
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                type="button"
                aria-label="View notifications"
                title="View notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              <button
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                type="button"
                aria-label="Sign out"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-slate-200 px-4 py-2 sm:px-6 lg:hidden">
            {visibleNavigation.map((item) => (
              <NavItem key={item.path} item={item} compact />
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet
            context={{
              currentUser,
              draftBooking,
              searchQuery,
              setDraftBooking,
            }}
          />
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, compact = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        [
          'focus-ring inline-flex items-center gap-3 rounded-lg text-sm font-semibold transition',
          compact ? 'h-10 shrink-0 px-3' : 'h-11 w-full px-3',
          isActive
            ? 'bg-slate-950 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

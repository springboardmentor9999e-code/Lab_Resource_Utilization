import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { can, roleLabel } from "../auth/permissions";
import { useNotifications } from "../notifications/NotificationsContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: DialIcon },
  { to: "/equipment", label: "Equipment", icon: FlaskIcon },
  { to: "/bookings", label: "Bookings", icon: CalendarIcon },
  { to: "/sharing-requests", label: "Sharing Requests", icon: ShareIcon },
  { to: "/utilization", label: "Utilization", icon: PulseIcon, requires: "utilization:heatmap" },
  { to: "/maintenance", label: "Maintenance", icon: WrenchIcon, requires: "maintenance:manage" },
  // Visible to full user-managers, plus DEPARTMENT_HEAD's read-only own-institution view.
  { to: "/users", label: "Users", icon: UsersIcon, requires: "users:manage", allowAlso: ["users:viewOwnInstitution"] },
  { to: "/labs", label: "Labs", icon: LabIcon },
  { to: "/institutions", label: "Institutions", icon: BuildingIcon },
  { to: "/role-requests", label: "Role Requests", icon: BadgeIcon, requires: "roleRequests:review" },
  { to: "/billing", label: "Billing", icon: BillingIcon, requires: "billing:view" },
  { to: "/notifications", label: "Notifications", icon: BellIcon },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen flex bg-[var(--color-paper-50)]">
      <aside className="w-64 shrink-0 bg-[var(--color-ink-900)] text-[var(--color-paper-50)] flex flex-col">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="12" stroke="var(--color-brass-500)" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="3.5" fill="var(--color-brass-500)" />
          </svg>
          <span className="font-[var(--font-display)] text-lg tracking-tight">LabShare</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.filter(
            (item) =>
              !item.requires ||
              can(user?.role, item.requires) ||
              (item.allowAlso || []).some((action) => can(user?.role, action))
          ).map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-[var(--color-paper-200)]/80 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.to === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--color-brass-500)] text-[var(--color-ink-900)] text-[11px] font-semibold px-1.5 py-0.5 min-w-[1.25rem] text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/10 mt-2">
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-wide text-[var(--color-brass-400)] mt-0.5">
              {roleLabel(user?.role)}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--color-paper-200)]/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Minimal inline icon set (no external icon dependency needed for the shell)
function DialIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10L10 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function FlaskIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M8 3h4M8.5 3v4.5L4.5 14a1.5 1.5 0 001.3 2.2h8.4a1.5 1.5 0 001.3-2.2l-4-6.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ShareIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.7 9L13.3 5.8M6.7 11l6.6 3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function PulseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M2 10h3l2-5 4 10 2-5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WrenchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M13.5 6.5a3.5 3.5 0 01-4.6 3.3L4 14.7 3.3 14l4.9-4.9a3.5 3.5 0 013.3-4.6L9.8 6.2l1.4 1.4 2.3-2.3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M8 4H4.5a1 1 0 00-1 1v10a1 1 0 001 1H8M13 14l3.5-4-3.5-4M16.5 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="7" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 16c0-2.5 2-4.5 4.5-4.5S11.5 13.5 11.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 11.2c1.9.3 3.5 2 3.5 4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function LabIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M8 3h4M8.5 3v4.5L4.5 14a1.5 1.5 0 001.3 2.2h8.4a1.5 1.5 0 001.3-2.2l-4-6.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BuildingIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="4" y="3" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6.5h1.5M11.5 6.5H13M7 9.5h1.5M11.5 9.5H13M7 12.5h1.5M11.5 12.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BadgeIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 11.5L6.5 17l3.5-2 3.5 2-1-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function BillingIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v8M12.5 8.2c0-.9-1.1-1.7-2.5-1.7s-2.5.6-2.5 1.5.9 1.3 2.5 1.5c1.6.2 2.5.6 2.5 1.5s-1.1 1.5-2.5 1.5-2.5-.8-2.5-1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M10 3.5c-2.2 0-4 1.8-4 4v2.3c0 .5-.2 1-.5 1.4l-.9 1.1c-.4.5 0 1.2.6 1.2h9.6c.6 0 1-.7.6-1.2l-.9-1.1c-.3-.4-.5-.9-.5-1.4V7.5c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.3 15.5a1.8 1.8 0 003.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

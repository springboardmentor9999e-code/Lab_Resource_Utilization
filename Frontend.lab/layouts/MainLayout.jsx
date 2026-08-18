import { NavLink, Outlet } from 'react-router-dom'
import './MainLayout.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/equipment', label: 'Equipment' },
  { to: '/book', label: 'Book Equipment' },
  { to: '/bookings', label: 'Booking History' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/profile', label: 'Profile' },
]

export default function MainLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="logo">Lab Resource</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

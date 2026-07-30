import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import InstitutionRegister from './pages/InstitutionRegister';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import RoleRequests from './pages/RoleRequests';
import Partnerships from './pages/Partnerships';
import EquipmentSharing from './pages/EquipmentSharing';
import AuditLogs from './pages/AuditLogs';
import Institutions from './pages/Institutions';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-institution" element={<InstitutionRegister />} />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes under MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/users" element={<Users />} />
              <Route path="/role-requests" element={<RoleRequests />} />
              <Route path="/partnerships" element={
                <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'INSTITUTION_ADMIN']}>
                  <Partnerships />
                </ProtectedRoute>
              } />
              <Route path="/equipment-sharing" element={
                <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER']}>
                  <EquipmentSharing />
                </ProtectedRoute>
              } />
              <Route path="/institutions" element={<Institutions />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

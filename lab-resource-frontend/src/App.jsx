import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

import Layout from './components/common/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuth2CallbackPage from './pages/auth/OAuth2CallbackPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import ResearcherDashboard from './pages/dashboard/ResearcherDashboard';
import LabManagerDashboard from './pages/dashboard/LabManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import EquipmentDetailPage from './pages/equipment/EquipmentDetailPage';
import EquipmentFormPage from './pages/equipment/EquipmentFormPage';
import BookingCalendarPage from './pages/booking/BookingCalendarPage';
import MyBookingsPage from './pages/booking/MyBookingsPage';
import PendingApprovalsPage from './pages/booking/PendingApprovalsPage';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';
import InstitutionManagement from './pages/admin/InstitutionManagement';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import AuditLogViewer from './pages/admin/AuditLogViewer';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import LaboratoryManagement from './pages/admin/LaboratoryManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import PaymentTracking from './pages/admin/PaymentTracking';
import CostDashboard from './pages/admin/CostDashboard';
import BudgetManagement from './pages/admin/BudgetManagement';
import ResourceSharingDashboard from './pages/admin/ResourceSharingDashboard';
import UtilizationMonitor from './pages/admin/UtilizationMonitor';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import ReportsPage from './pages/reports/ReportsPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationCenter from './pages/notifications/NotificationCenter';
import NotificationPreferences from './pages/notifications/NotificationPreferences';
import CalibrationDashboard from './pages/calibration/CalibrationDashboard';
import WaitlistPage from './pages/booking/WaitlistPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const SystemAdminRoute = ({ children }) => {
  const { isSystemAdmin } = useAuth();
  return isSystemAdmin ? children : <Navigate to="/dashboard" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

const ManagerRoute = ({ children }) => {
  const { isManager } = useAuth();
  return isManager ? children : <Navigate to="/dashboard" />;
};

const MaintenanceRoute = ({ children }) => {
  const { isManager, isTechnician } = useAuth();
  return (isManager || isTechnician) ? children : <Navigate to="/dashboard" />;
};

const NonSystemAdminRoute = ({ children }) => {
  const { isSystemAdmin } = useAuth();
  return isSystemAdmin ? <Navigate to="/dashboard" /> : children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'SYSTEM_ADMIN' || role === 'INSTITUTION_ADMIN') {
    return <AdminDashboard />;
  }
  if (role === 'LAB_MANAGER' || role === 'DEPARTMENT_HEAD') {
    return <LabManagerDashboard />;
  }
  return <ResearcherDashboard />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
            <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
            <Route path="/oauth2/complete-profile" element={<RoleSelectionPage />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardRouter />} />

              <Route path="equipment" element={<EquipmentListPage />} />
              <Route path="equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="equipment/new" element={<ManagerRoute><EquipmentFormPage /></ManagerRoute>} />
              <Route path="equipment/:id/edit" element={<MaintenanceRoute><EquipmentFormPage /></MaintenanceRoute>} />

              <Route path="bookings" element={<BookingCalendarPage />} />
              <Route path="bookings/my" element={<MyBookingsPage />} />
              <Route path="bookings/approvals" element={<ManagerRoute><PendingApprovalsPage /></ManagerRoute>} />
              <Route path="bookings/waitlist" element={<WaitlistPage />} />

              <Route path="maintenance" element={<MaintenanceRoute><MaintenanceDashboard /></MaintenanceRoute>} />

              <Route path="admin/calibration" element={<MaintenanceRoute><CalibrationDashboard /></MaintenanceRoute>} />

              <Route path="institutions" element={<AdminRoute><InstitutionManagement /></AdminRoute>} />
              <Route path="admin/laboratories" element={<AdminRoute><LaboratoryManagement /></AdminRoute>} />

              <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="admin/roles" element={<SystemAdminRoute><RoleManagement /></SystemAdminRoute>} />
              <Route path="admin/audit-logs" element={<SystemAdminRoute><AuditLogViewer /></SystemAdminRoute>} />
              <Route path="admin/system" element={<SystemAdminRoute><SystemMonitoring /></SystemAdminRoute>} />
              <Route path="admin/announcements" element={<AdminRoute><AnnouncementManagement /></AdminRoute>} />
              <Route path="admin/invoices" element={<AdminRoute><InvoiceManagement /></AdminRoute>} />
              <Route path="admin/payments" element={<AdminRoute><PaymentTracking /></AdminRoute>} />
              <Route path="admin/costs" element={<ManagerRoute><CostDashboard /></ManagerRoute>} />
              <Route path="admin/budgets" element={<AdminRoute><BudgetManagement /></AdminRoute>} />
              <Route path="admin/sharing" element={<ManagerRoute><ResourceSharingDashboard /></ManagerRoute>} />
              <Route path="admin/utilization" element={<ManagerRoute><UtilizationMonitor /></ManagerRoute>} />

              <Route path="analytics" element={<ManagerRoute><AnalyticsDashboard /></ManagerRoute>} />
              <Route path="reports" element={<ManagerRoute><ReportsPage /></ManagerRoute>} />

              <Route path="profile" element={<ProfilePage />} />

              <Route path="notifications" element={<NotificationCenter />} />
              <Route path="notifications/preferences" element={<NotificationPreferences />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;

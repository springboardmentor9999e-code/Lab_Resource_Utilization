import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { PermissionRoute } from "./auth/PermissionRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EquipmentPage from "./pages/EquipmentPage";
import BookingsPage from "./pages/BookingsPage";
import SharingRequestsPage from "./pages/SharingRequestsPage";
import UtilizationPage from "./pages/UtilizationPage";
import MaintenancePage from "./pages/MaintenancePage";
import UsersPage from "./pages/UsersPage";
import LabsPage from "./pages/LabsPage";
import InstitutionsPage from "./pages/InstitutionsPage";
import RoleRequestsPage from "./pages/RoleRequestsPage";
import BillingPage from "./pages/BillingPage";
import NotificationsPage from "./pages/NotificationsPage";

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/sharing-requests" element={<SharingRequestsPage />} />
                <Route path="/utilization" element={<UtilizationPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />

                {/* Institutions and Labs: every role has at least Read access per the
                    matrix, so the route itself isn't gated - only the create/edit
                    controls inside each page check can(role, "...manage"). Users is
                    gated to staff roles with some form of user visibility - full
                    admin management, or DEPARTMENT_HEAD's read-only own-institution
                    view - the page itself further narrows what's shown/editable. */}
                <Route element={<PermissionRoute requires="users:manage" allowAlso={["users:viewOwnInstitution"]} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
                <Route path="/labs" element={<LabsPage />} />
                <Route path="/institutions" element={<InstitutionsPage />} />
                <Route element={<PermissionRoute requires="roleRequests:review" />}>
                  <Route path="/role-requests" element={<RoleRequestsPage />} />
                </Route>
                <Route element={<PermissionRoute requires="billing:view" />}>
                  <Route path="/billing" element={<BillingPage />} />
                </Route>
                {/* No permission gate - every role can have notifications, and the
                    backend only ever returns the current user's own regardless. */}
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

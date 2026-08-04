import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Admin/Dashboard";
import Users from "../pages/Admin/Users";
import Laboratories from "../pages/Admin/Laboratories";
import Equipment from "../pages/Admin/Equipment";
import Resources from "../pages/Resources/Resources";
import Bookings from "../pages/Admin/Bookings";
import Maintenance from "../pages/Maintenance/Maintenance";
import Notifications from "../pages/Notifications/Notifications";
import Reports from "../pages/Reports/Reports";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Institution from "../pages/Institutions/Institution";
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import InstitutionLayout from "../layouts/InstitutionLayout";
import StudentDashboard from "../pages/Student/Dashboard";
import InstitutionDashboard from "../pages/Institution/Dashboard";
import InterInstitutionSharing from "../pages/InterInstitutionSharing/InterInstitutionSharing";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route element={
          <ProtectedRoute>
          <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
  path="/users"
  element={
    <RoleProtectedRoute
      allowedRoles={["SYSTEM_ADMIN"]}
    >
      <Users />
    </RoleProtectedRoute>
  }
/>
          <Route path="/laboratories" element={<Laboratories />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/institutions"element={<Institution />}/>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/inter-sharing" element={<InterInstitutionSharing />}/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
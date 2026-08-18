import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Main Dashboard Views
import ResearcherDashboard from "../pages/ResearcherDashboard";
import ManagerDashboardView from "../pages/ManagerDashboard";
import AdminDashboardView from "../pages/AdminDashboard";

// Shared & System Pages
import UnderDevelopment from "../pages/UnderDevelopment";
import NotFound from "../pages/NotFound";
import EquipmentModule from "../pages/EquipmentModule";
import Booking from "../pages/Booking";
import CostDashboard from "../pages/CostDashboard";
import CalibrationPage from "../pages/CalibrationPage";
import EditCalibration from "../components/calibration/EditCalibration";
import AddMaintenance from "../pages/maintenance/AddMaintenance";
import EditMaintenance from "../pages/maintenance/EditMaintenance";
import MaintenanceList from "../pages/maintenance/MaintenanceList";
import MaintenanceDashboard from "../pages/maintenance/MaintenanceDashboard";
import MaintenanceHistory from "../pages/maintenance/MaintenanceHistory";
import SharedSchedule from "../pages/SharedSchedule";

// Student Module Pages
import StudentDashboard from "../pages/student/Dashboard";
import Laboratories from "../pages/Laboratories";
import StudentEquipment from "../pages/student/Equipment";
import StudentEquipmentDetails from "../pages/student/EquipmentDetails";
import BookEquipment from "../pages/student/BookEquipment";
import StudentMyBookings from "../pages/student/MyBookings";
import StudentBookingHistory from "../pages/student/BookingHistory";
import StudentWaitlist from "../pages/student/Waitlist";
import Notifications from "../pages/Notifications";
import StudentProfile from "../pages/student/Profile";

// Lab Technician Module Pages
import TechnicianDashboard from "../pages/technician/Dashboard";
import TechnicianEquipmentManagement from "../pages/technician/EquipmentManagement";
import AddEquipment from "../pages/technician/AddEquipment";
import EditEquipment from "../pages/technician/EditEquipment";
import TechnicianMaintenance from "../pages/technician/Maintenance";
import TechnicianBookingApproval from "../pages/technician/BookingApproval";
import TechnicianReturnEquipment from "../pages/technician/ReturnEquipment";
import TechnicianReports from "../pages/technician/Reports";

// Lab Manager Module Pages
import UtilizationDashboard from "../pages/manager/UtilizationDashboard";
import ManagerWaitlistManagement from "../pages/manager/WaitlistManagement";
import ManagerInventoryAnalytics from "../pages/manager/InventoryAnalytics";
import ManagerBookingAnalytics from "../pages/manager/BookingAnalytics";
import ManagerResourceSharing from "../pages/manager/ManagerResourceSharing";
import ManagerReports from "../pages/manager/Reports";
import ManagerBookingRequests from "../pages/manager/BookingRequests";

// Institution Administrator Module Pages
import InstitutionDashboard from "../pages/institution/Dashboard";
import InstitutionDepartments from "../pages/institution/Departments";
import InstitutionAnalytics from "../pages/institution/Analytics";
import InstitutionReports from "../pages/institution/Reports";

// System Administrator Module Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminRoles from "../pages/admin/Roles";
import AdminSettings from "../pages/admin/Settings";
import AdminLogs from "../pages/admin/Logs";
import AdminEquipment from "../pages/AdminEquipment";
import AdminBookings from "../pages/AdminBookings";
import AdminReports from "../pages/AdminReports";

// Sharing Agreement Pages
import SharingAgreementList from "../pages/SharingAgreement/SharingAgreementList";
import AddSharingAgreement from "../pages/SharingAgreement/AddSharingAgreement";
import EditSharingAgreement from "../pages/SharingAgreement/EditSharingAgreement";

// Resource Sharing Pages
import ResourceSharingRequestList from "../pages/ResourceSharing/ResourceSharingRequestList";
import AddResourceSharingRequest from "../pages/ResourceSharing/AddResourceSharingRequest";
import EditResourceSharingRequest from "../pages/ResourceSharing/EditResourceSharingRequest";

// Resource Share Pages
import ResourceShareList from "../pages/ResourceShare/ResourceShareList";
import AddResourceShare from "../pages/ResourceShare/AddResourceShare";
import EditResourceShare from "../pages/ResourceShare/EditResourceShare";

// External Booking Pages
import ExternalBookingList from "../pages/ExternalBooking/ExternalBookingList";
import AddExternalBooking from "../pages/ExternalBooking/AddExternalBooking";
import EditExternalBooking from "../pages/ExternalBooking/EditExternalBooking";

export default function AppRoutes() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "";
  const normalizedRole = role.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "");

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Authenticated Dashboard Shell Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              normalizedRole === "LABTECHNICIAN" || normalizedRole === "TECHNICIAN" ? (
                <Navigate to="/technician/dashboard" replace />
              ) : normalizedRole === "LABMANAGER" || normalizedRole === "MANAGER" ? (
                <Navigate to="/manager/dashboard" replace />
              ) : normalizedRole === "INSTITUTIONADMINISTRATOR" || normalizedRole === "INSTITUTIONADMIN" || normalizedRole === "INSTITUTION" || normalizedRole === "DEPARTMENTHEAD" || normalizedRole === "HOD" ? (
                <Navigate to="/institution/dashboard" replace />
              ) : normalizedRole === "SYSTEMADMINISTRATOR" || normalizedRole === "SYSTEMADMIN" || normalizedRole === "ADMIN" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : normalizedRole === "RESEARCHER" ? (
                <Navigate to="/researcher/dashboard" replace />
              ) : (
                <Navigate to="/student/dashboard" replace />
              )
            }
          />

          {/* Direct Dashboards */}
          <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
          <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
          <Route path="/manager/dashboard-view" element={<ManagerDashboardView />} />
          <Route path="/admin/dashboard-view" element={<AdminDashboardView />} />

          {/* SHARED AUTHENTICATED ROUTES */}
          <Route path="/equipment" element={<StudentEquipment />} />
          <Route path="/equipment/:id" element={<StudentEquipmentDetails />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/equipment-module" element={<EquipmentModule />} />
          <Route path="/under-development" element={<UnderDevelopment />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/calibration-management" element={<CalibrationPage />} />
          <Route path="/edit-calibration/:id" element={<EditCalibration />} />
          <Route path="/laboratory" element={<Laboratories />} />
          <Route path="/laboratories" element={<Laboratories />} />
          <Route path="/student/laboratories" element={<Laboratories />} />
          <Route path="/cost-dashboard" element={<CostDashboard />} />
          <Route path="/maintenance/add" element={<AddMaintenance />} />
          <Route path="/add-maintenance" element={<AddMaintenance />} />
          <Route path="/maintenance/edit/:id" element={<EditMaintenance />} />
          <Route path="/edit-maintenance/:id" element={<EditMaintenance />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance-list" element={<MaintenanceList />} />
          <Route path="/maintenance-dashboard" element={<MaintenanceDashboard />} />
          <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />
          <Route path="/maintenance/history" element={<MaintenanceHistory />} />
          <Route path="/maintenance-history" element={<MaintenanceHistory />} />
          <Route path="/shared-schedule" element={<SharedSchedule />} />

          {/* Sharing Agreement Routes */}
          <Route path="/sharing-agreements" element={<SharingAgreementList />} />
          <Route path="/sharing-agreements/add" element={<AddSharingAgreement />} />
          <Route path="/sharing-agreements/edit/:id" element={<EditSharingAgreement />} />

          {/* Resource Sharing Request Routes */}
          <Route path="/resource-sharing-requests" element={<ResourceSharingRequestList />} />
          <Route path="/resource-sharing-requests/add" element={<AddResourceSharingRequest />} />
          <Route path="/resource-sharing-requests/edit/:id" element={<EditResourceSharingRequest />} />

          {/* Resource Share Routes */}
          <Route path="/resource-shares" element={<ResourceShareList />} />
          <Route path="/resource-shares/add" element={<AddResourceShare />} />
          <Route path="/resource-shares/edit/:id" element={<EditResourceShare />} />

          {/* External Booking Routes */}
          <Route path="/external-bookings" element={<ExternalBookingList />} />
          <Route path="/external-bookings/add" element={<AddExternalBooking />} />
          <Route path="/external-bookings/edit/:id" element={<EditExternalBooking />} />

          {/* Common Aliases */}
          <Route path="/Equipment" element={<StudentEquipment />} />
          <Route path="/Equipment/:id" element={<StudentEquipmentDetails />} />
          <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/Profile" element={<StudentProfile />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/Bookings" element={<Booking />} />
          <Route path="/Maintenance" element={<TechnicianMaintenance />} />
          <Route path="/Reports" element={<ManagerReports />} />
          <Route path="/Users" element={<AdminUsers />} />
          <Route path="/Roles" element={<AdminRoles />} />
          <Route path="/Settings" element={<AdminSettings />} />
          <Route path="/Logs" element={<AdminLogs />} />

          {/* 1. STUDENT MODULE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Student", "STUDENT", "Researcher", "RESEARCHER"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/equipment" element={<StudentEquipment />} />
            <Route path="/student/equipment/:id" element={<StudentEquipmentDetails />} />
            <Route path="/student/book/:id" element={<BookEquipment />} />
            <Route path="/student/laboratories" element={<Laboratories />} />
            <Route path="/student/bookings" element={<StudentMyBookings />} />
            <Route path="/student/history" element={<StudentBookingHistory />} />
            <Route path="/student/waitlist" element={<StudentWaitlist />} />
            <Route path="/student/notifications" element={<Notifications />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* 2. LAB TECHNICIAN MODULE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Lab Technician", "Technician", "LAB_TECHNICIAN", "TECHNICIAN"]} />}>
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/technician/equipment" element={<TechnicianEquipmentManagement />} />
            <Route path="/technician/equipment/add" element={<AddEquipment />} />
            <Route path="/technician/equipment/edit/:id" element={<EditEquipment />} />
            <Route path="/technician/maintenance" element={<TechnicianMaintenance />} />
            <Route path="/technician/bookings/approve" element={<TechnicianBookingApproval />} />
            <Route path="/technician/equipment/return" element={<TechnicianReturnEquipment />} />
            <Route path="/technician/reports" element={<TechnicianReports />} />
            <Route path="/technician/profile" element={<StudentProfile />} />
          </Route>

          {/* 3. LAB MANAGER MODULE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Lab Manager", "Manager", "LAB_MANAGER", "ROLE_LAB_MANAGER", "ROLE_MANAGER", "Admin", "ADMIN"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboardView />} />
            <Route path="/manager/equipment" element={<TechnicianEquipmentManagement />} />
            <Route path="/manager/bookings" element={<ManagerBookingRequests />} />
            <Route path="/manager/booking-requests" element={<ManagerBookingRequests />} />
            <Route path="/manager/utilization" element={<UtilizationDashboard />} />
            <Route path="/manager/waitlist" element={<ManagerWaitlistManagement />} />
            <Route path="/manager/inventory-analytics" element={<ManagerInventoryAnalytics />} />
            <Route path="/manager/booking-analytics" element={<ManagerBookingAnalytics />} />
            <Route path="/manager/sharing-analytics" element={<ManagerInventoryAnalytics />} />
            <Route path="/manager/resource-sharing" element={<ManagerResourceSharing />} />
            <Route path="/manager/cost-sharing" element={<CostDashboard />} />
            <Route path="/manager/shared-schedule" element={<SharedSchedule />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
            <Route path="/manager/profile" element={<StudentProfile />} />
          </Route>

          {/* 4. INSTITUTION ADMIN MODULE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["HOD", "Department Head", "DEPARTMENT_HEAD", "Institution", "INSTITUTION", "Institution Administrator", "Institution Admin", "INSTITUTION_ADMINISTRATOR", "INSTITUTION_ADMIN"]} />}>
            <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
            <Route path="/institution/departments" element={<InstitutionDepartments />} />
            <Route path="/institution/resource-sharing" element={<ManagerResourceSharing />} />
            <Route path="/institution/cost-analysis" element={<CostDashboard />} />
            <Route path="/institution/analytics" element={<InstitutionAnalytics />} />
            <Route path="/institution/reports" element={<InstitutionReports />} />
            <Route path="/institution/equipment" element={<StudentEquipment />} />
            <Route path="/institution/profile" element={<StudentProfile />} />
          </Route>

          {/* 5. SYSTEM ADMIN MODULE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["System Admin", "Admin", "System Administrator", "SYSTEM_ADMINISTRATOR", "ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardView />} />
            <Route path="/admin/institutions" element={<InstitutionDepartments />} />
            <Route path="/admin/resource-sharing" element={<ResourceShareList />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/equipment" element={<AdminEquipment />} />
            <Route path="/admin/inventory" element={<AdminEquipment />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/profile" element={<StudentProfile />} />
          </Route>

          {/* Shared fallback edit route */}
          <Route path="/equipment/edit/:id" element={<EditEquipment />} />

          {/* Authenticated fallback */}
          <Route path="*" element={<UnderDevelopment />} />
        </Route>
      </Route>

      {/* Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

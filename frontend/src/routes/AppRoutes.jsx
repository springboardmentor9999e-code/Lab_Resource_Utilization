import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages stay eagerly loaded — they are the app's entry point
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

// Dashboard pages are code-split: each becomes its own chunk, fetched on
// first navigation, so the initial bundle stays small
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const EquipmentPage = lazy(() => import('../pages/EquipmentPage'));
const EquipmentDetailsPage = lazy(() => import('../pages/EquipmentDetailsPage'));
const LabPage = lazy(() => import('../pages/LabPage'));
const BookingPage = lazy(() => import('../pages/BookingPage'));
const UtilizationPage = lazy(() => import('../pages/UtilizationPage'));
const SharingPage = lazy(() => import('../pages/SharingPage'));
const MaintenancePage = lazy(() => import('../pages/MaintenancePage'));
const BillingPage = lazy(() => import('../pages/BillingPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));

// Shown while a lazy page chunk downloads
const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Auth routes wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="equipment/:id" element={<EquipmentDetailsPage />} />
        <Route path="labs" element={<LabPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="utilization" element={<UtilizationPage />} />
        <Route path="sharing" element={<SharingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        {/* Admin-only: guarded here as well as in the sidebar, so the URL cannot be typed into */}
        <Route
          path="users"
          element={
            <ProtectedRoute permission="manageUsers">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;

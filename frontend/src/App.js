import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./styles/Layout.css";
import "./styles/theme.css";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Equipment
import Equipment from "./pages/Equipment";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetails from "./pages/EquipmentDetails";
import AddEquipment from "./pages/AddEquipment";
import EditEquipment from "./pages/EditEquipment";
import BrowseEquipment from "./pages/BrowseEquipment";

// Booking
import Booking from "./pages/Booking";
import BookingApproval from "./pages/BookingApproval";
import DepartmentWaitingList from "./pages/DepartmentWaitingList";

// Requests
import RequestAccess from "./pages/RequestAccess";
import PendingRequests from "./pages/PendingRequests";
import MyRequests from "./pages/MyRequests";
import RequestEquipment from "./pages/RequestEquipment";

// Inventory
import Inventory from "./pages/Inventory";

// Reports
import Reports from "./pages/Reports";

// Profile
import Profile from "./pages/Profile";

// Utilization
import Utilization from "./pages/Utilization";
import HeatMap from "./pages/HeatMap";

// Maintenance
import Maintenance from "./pages/Maintenance";
import Calibration from "./pages/Calibration";

// Admin
import RoleRequest from "./pages/RoleRequest";
import AdminPanel from "./pages/AdminPanel";

// Analytics / Billing / Notifications / Settings
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";


function AppLayout() {
    const location = useLocation();

    /*
     * Login and Register are the only pages that should
     * NOT display the application Sidebar/Navbar.
     */
    const hideLayout =
        location.pathname === "/" ||
        location.pathname === "/register";

    return (
        <div className={hideLayout ? "auth-page" : "app"}>

            {/* =====================================================
                SIDEBAR
                IMPORTANT: This is the ONLY Sidebar in the app.
               ===================================================== */}
            {!hideLayout && <Sidebar />}


            <div className={hideLayout ? "" : "main-content"}>

                {/* =================================================
                    NAVBAR
                    IMPORTANT: This is the ONLY Navbar in the app.

                    Search bar
                    Notification
                    Account
                    Theme
                    Menu

                    are all handled by Navbar.js.
                   ================================================= */}
                {!hideLayout && <Navbar />}


                {/* =================================================
                    PAGE CONTENT

                    Individual pages MUST NOT render:
                    <Navbar />
                    <Sidebar />

                    They should contain only their own page content.
                   ================================================= */}
                <main className={hideLayout ? "" : "page-body"}>

                    <Routes>

                        {/* =================================================
                            AUTHENTICATION
                           ================================================= */}

                        <Route
                            path="/"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />


                        {/* =================================================
                            DASHBOARD
                           ================================================= */}

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            EQUIPMENT
                           ================================================= */}

                        <Route
                            path="/equipment"
                            element={
                                <ProtectedRoute>
                                    <Equipment />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/equipment-list"
                            element={
                                <ProtectedRoute>
                                    <EquipmentList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/equipment/:id"
                            element={
                                <ProtectedRoute>
                                    <EquipmentDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/browse-equipment"
                            element={
                                <ProtectedRoute>
                                    <BrowseEquipment />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/equipment/add"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "SYSTEM_ADMINISTRATOR",
                                        "DEPARTMENT_ADMINISTRATOR",
                                        "LAB_TECHNICIAN"
                                    ]}
                                >
                                    <AddEquipment />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/equipment/edit/:id"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "SYSTEM_ADMINISTRATOR",
                                        "DEPARTMENT_ADMINISTRATOR",
                                        "LAB_TECHNICIAN"
                                    ]}
                                >
                                    <EditEquipment />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            BOOKING
                           ================================================= */}

                        <Route
                            path="/booking"
                            element={
                                <ProtectedRoute>
                                    <Booking />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/booking-approval"
                            element={
                                <ProtectedRoute>
                                    <BookingApproval />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/department-waiting-list"
                            element={
                                <ProtectedRoute>
                                    <DepartmentWaitingList />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            RESOURCE SHARING
                           ================================================= */}

                        <Route
                            path="/request-access"
                            element={
                                <ProtectedRoute>
                                    <RequestAccess />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/pending-requests"
                            element={
                                <ProtectedRoute>
                                    <PendingRequests />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/my-requests"
                            element={
                                <ProtectedRoute>
                                    <MyRequests />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/request-equipment"
                            element={
                                <ProtectedRoute>
                                    <RequestEquipment />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            INVENTORY
                           ================================================= */}

                        <Route
                            path="/inventory"
                            element={
                                <ProtectedRoute>
                                    <Inventory />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            REPORTS
                           ================================================= */}

                        <Route
                            path="/reports"
                            element={
                                <ProtectedRoute>
                                    <Reports />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            UTILIZATION
                           ================================================= */}

                        <Route
                            path="/utilization"
                            element={
                                <ProtectedRoute>
                                    <Utilization />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            HEAT MAP
                           ================================================= */}

                        <Route
                            path="/heatmap"
                            element={
                                <ProtectedRoute>
                                    <HeatMap />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            MAINTENANCE
                           ================================================= */}

                        <Route
                            path="/maintenance"
                            element={
                                <ProtectedRoute>
                                    <Maintenance />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            CALIBRATION
                           ================================================= */}

                        <Route
                            path="/calibration"
                            element={
                                <ProtectedRoute>
                                    <Calibration />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            PROFILE
                           ================================================= */}

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            ADMIN
                           ================================================= */}

                        <Route
                            path="/role-request"
                            element={
                                <ProtectedRoute>
                                    <RoleRequest />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "SYSTEM_ADMINISTRATOR",
                                        "DEPARTMENT_ADMINISTRATOR"
                                    ]}
                                >
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            ANALYTICS
                           ================================================= */}

                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute>
                                    <Analytics />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            BILLING & COSTS
                           ================================================= */}

                        <Route
                            path="/billing"
                            element={
                                <ProtectedRoute>
                                    <Billing />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            NOTIFICATIONS
                           ================================================= */}

                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />


                        {/* =================================================
                            SETTINGS
                           ================================================= */}

                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>

                </main>
            </div>
        </div>
    );
}


/*
 * ================================================================
 * MAIN APP
 * ================================================================
 */

export default function App() {
    return <AppLayout />;
}
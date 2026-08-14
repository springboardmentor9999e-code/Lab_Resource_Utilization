import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Equipment from "./pages/Equipment";
import Booking from "./pages/Booking";
import Institution from "./pages/Institution";
import DepartmentList from "./pages/DepartmentList";
import AddDepartment from "./pages/AddDepartment";
import EditDepartment from "./pages/EditDepartment";
import Category from "./pages/Category";
import Utilization from "./pages/Utilization";
import Billing from "./pages/Billing";
import Maintenance from "./pages/Maintenance";
import CalibrationCertification from "./pages/CalibrationCertification";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                   path="/equipment"
                   element={
                        <ProtectedRoute>
                            <Equipment />
                        </ProtectedRoute>
                    }
                />
                <Route
    path="/booking"
    element={
        <ProtectedRoute>
            <Booking />
        </ProtectedRoute>
    }
/>
<Route
    path="/institution"
    element={
        <ProtectedRoute>
            <Institution />
        </ProtectedRoute>
    }
/>
<Route
    path="/department"
    element={
        <ProtectedRoute>
            <DepartmentList />
        </ProtectedRoute>
    }
/>

<Route
    path="/department/add"
    element={
        <ProtectedRoute>
            <AddDepartment />
        </ProtectedRoute>
    }
/>

<Route
    path="/department/edit/:id"
    element={
        <ProtectedRoute>
            <EditDepartment />
        </ProtectedRoute>
    }
/>
<Route
    path="/category"
    element={
        <ProtectedRoute>
            <Category />
        </ProtectedRoute>
    }
/>
<Route
    path="/utilization"
    element={<Utilization />}
/>
<Route path="/billing" element={<Billing />} />
<Route
    path="/maintenance"
    element={<Maintenance />}
/>
<Route
    path="/calibration"
    element={<CalibrationCertification />}
/>
<Route path="/reports" element={<Reports />} />
<Route
    path="/analytics"
    element={
        <ProtectedRoute>
            <Analytics />
        </ProtectedRoute>
    }
/>
<Route
    path="/notifications"
    element={
        <ProtectedRoute>
            <Notifications />
        </ProtectedRoute>
    }
/>
            </Routes>

        </BrowserRouter>

    );

}

export default App;
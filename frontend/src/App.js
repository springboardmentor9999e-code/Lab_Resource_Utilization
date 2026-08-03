import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./components/dashboard/Dashboard";
import AuthPage from "./components/auth/AuthPage";
import InstitutionAdminDashboard from "./components/dashboard/InstitutionAdminDashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import ResearcherDashboard from "./components/dashboard/ResearcherDashboard";
import SystemAdminDashboard from "./components/dashboard/SystemAdminDashboard";
import Laboratories from "./components/laboratory/Laboratories";
import Equipment from "./components/equipment/Equipment";
import MyBookings from "./components/booking/MyBookings";
import Bookings from "./components/booking/Bookings";
import Profile from "./components/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<AuthPage />} />

        {/* Institution Admin Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
        <Route path="/technician-dashboard" element={<InstitutionAdminDashboard />} />
        <Route path="/manager-dashboard" element={<InstitutionAdminDashboard />} />
        <Route path="/department-dashboard" element={<InstitutionAdminDashboard />} />
        <Route path="/institution-dashboard" element={<InstitutionAdminDashboard />} />
        <Route path="/system-dashboard" element={<SystemAdminDashboard />} />
        <Route path="/laboratories" element={<Laboratories />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
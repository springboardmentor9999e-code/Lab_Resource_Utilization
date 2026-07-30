import "../../App.css";

import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Footer from "../Footer";

import StudentDashboard from "./StudentDashboard";
import ResearcherDashboard from "./ResearcherDashboard";
import InstitutionAdminDashboard from "./InstitutionAdminDashboard";
import LabManagerDashboard from "./LabManagerDashboard";
import LabTechnicianDashboard from "./LabTechnicianDashboard";
import SystemAdminDashboard from "./SystemAdminDashboard";

function Dashboard() {

    const role = localStorage.getItem("role");

    switch (role) {

        case "STUDENT":
            return <StudentDashboard />;

        case "RESEARCHER":
            return <ResearcherDashboard />;

        case "LAB_MANAGER":
            return <LabManagerDashboard />;

        case "LAB_TECHNICIAN":
            return <LabTechnicianDashboard />;

        case "INSTITUTION_ADMIN":
            return <InstitutionAdminDashboard />;

        case "SYSTEM_ADMIN":
            return <SystemAdminDashboard />;

        default:
            const fullName = localStorage.getItem("fullName");

            return (
                <div className="app">

                    <Navbar />

                    <div className="dashboard-layout">

                        <Sidebar />

                        <main className="main-content">

                            <h1>Dashboard</h1>

                            <p>Welcome to Lab Resource Utilization Platform</p>

                            <h3>Hello, {fullName}</h3>

                            <p>Role: {role}</p>

                            <div className="cards">

                                <div className="card">
                                    <h3>Total Equipment</h3>
                                    <p>0</p>
                                </div>

                                <div className="card">
                                    <h3>Available</h3>
                                    <p>0</p>
                                </div>

                                <div className="card">
                                    <h3>Booked</h3>
                                    <p>0</p>
                                </div>

                            </div>

                        </main>

                    </div>

                    <Footer />

                </div>
            );
    }

}

export default Dashboard;
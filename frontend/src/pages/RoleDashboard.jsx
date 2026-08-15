import { useAuth } from "../context/AuthContext";

import AdminDashboard from "./Admin/Dashboard";
import StudentDashboard from "./Student/Dashboard";
import DepartmentDashboard from "./Department/Dashboard";
import InstitutionDashboard from "./Institution/Dashboard";

function RoleDashboard() {
    const { role } = useAuth();

    switch (role) {

        case "SYSTEM_ADMIN":
            return <AdminDashboard />;

        case "STUDENT":
        case "FACULTY":
            return <StudentDashboard />;

        case "LAB_ASSISTANT":
        case "DEPARTMENT_HEAD":
            return <DepartmentDashboard />;

        case "INSTITUTE_ADMIN":
            return <InstitutionDashboard />;

        default:
            return (
                <div>
                    <h2>Dashboard</h2>
                    <p>No dashboard available for this role.</p>
                </div>
            );
    }
}

export default RoleDashboard;
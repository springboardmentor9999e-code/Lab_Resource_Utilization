import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("fullName");
        localStorage.removeItem("role");

        navigate("/");
    };

    return (

        <div
            style={{
                width: "250px",
                height: "100vh",
                backgroundColor: "#1E293B",
                color: "white",
                padding: "20px",
                boxSizing: "border-box"
            }}
        >

            <h2>Lab Platform</h2>

            <hr />

            {/* Dashboard */}
            <p
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard")}
            >
                🏠 Dashboard
            </p>

            {/* Institution */}
            {(role === "SYSTEM_ADMIN" || role === "INSTITUTION_ADMIN") && (
                <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/institution")}
                >
                    🏫 Institutions
                </p>
            )}

            {/* Department */}
            {(role === "SYSTEM_ADMIN" ||
              role === "INSTITUTION_ADMIN" ||
              role === "DEPARTMENT_HEAD") && (
                <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/department")}
                >
                    🏢 Departments
                </p>
            )}

            {/* Category */}
{(role === "SYSTEM_ADMIN" || role === "INSTITUTION_ADMIN") && (
    <p
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/category")}
    >
        📂 Categories
    </p>
)}

            {/* Equipment */}
            {(role === "SYSTEM_ADMIN" ||
              role === "INSTITUTION_ADMIN" ||
              role === "LAB_MANAGER") && (
                <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/equipment")}
                >
                    📦 Equipment
                </p>
            )}

            {/* Booking */}
            {(role === "SYSTEM_ADMIN" ||
              role === "RESEARCHER") && (
                <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/booking")}
                >
                    📅 Bookings
                </p>
            )}

            {/* Utilization */}
            {(role === "SYSTEM_ADMIN" ||
              role === "RESEARCHER") && (
                <p
                    style={{ cursor: "pointer" }}
                >
                    📊 Utilization
                </p>
            )}

            {/* Maintenance */}
            {(role === "SYSTEM_ADMIN" ||
              role === "LAB_MANAGER" ||
              role === "LAB_TECHNICIAN") && (
                <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/maintenance")}
                >
                    🔧 Maintenance
                </p>
            )}

            {/* Reports */}
            <p
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/reports")}
            >
                📈 Reports
            </p>

            {/* Logout */}
            <p
                style={{ cursor: "pointer" }}
                onClick={handleLogout}
            >
                🚪 Logout
            </p>

        </div>

    );

}

export default Sidebar;
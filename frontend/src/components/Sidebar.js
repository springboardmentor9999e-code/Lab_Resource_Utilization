import { NavLink, useNavigate } from "react-router-dom";
import {
    FaHome,
    FaUniversity,
    FaLaptop,
    FaClipboardList,
    FaUsers,
    FaUser,
    FaChartBar,
    FaSignOutAlt,
    FaTools,
    FaDollarSign,
    FaShareAlt
} from "react-icons/fa";

import "../App.css";

function Sidebar() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const menus = {

        STUDENT: [
            { name: "Dashboard", path: "/student-dashboard", icon: <FaHome /> },
            { name: "Laboratories", path: "/laboratories", icon: <FaUniversity /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "My Bookings", path: "/my-bookings", icon: <FaClipboardList /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        RESEARCHER: [
            { name: "Dashboard", path: "/researcher-dashboard", icon: <FaHome /> },
            { name: "Laboratories", path: "/laboratories", icon: <FaUniversity /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "My Bookings", path: "/my-bookings", icon: <FaClipboardList /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        LAB_MANAGER: [
            { name: "Dashboard", path: "/manager-dashboard", icon: <FaHome /> },
            { name: "Users", path: "/users", icon: <FaUsers /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "Bookings", path: "/bookings", icon: <FaClipboardList /> },
            { name: "Reports", path: "/reports", icon: <FaChartBar /> },
            { name: "Maintenance", path: "/maintenance", icon: <FaTools /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        LAB_TECHNICIAN: [
            { name: "Dashboard", path: "/technician-dashboard", icon: <FaHome /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "Maintenance", path: "/maintenance", icon: <FaTools /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        DEPARTMENT_HEAD: [
            { name: "Dashboard", path: "/department-dashboard", icon: <FaHome /> },
            { name: "Users", path: "/users", icon: <FaUsers /> },
            { name: "Laboratories", path: "/laboratories", icon: <FaUniversity /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "Reports", path: "/reports", icon: <FaChartBar /> },
            { name: "Maintenance", path: "/maintenance", icon: <FaTools /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        INSTITUTION_ADMIN: [
            { name: "Dashboard", path: "/institution-dashboard", icon: <FaHome /> },
            { name: "Users", path: "/users", icon: <FaUsers /> },
            { name: "Laboratories", path: "/laboratories", icon: <FaUniversity /> },
            { name: "Equipment", path: "/equipment", icon: <FaLaptop /> },
            { name: "Bookings", path: "/bookings", icon: <FaClipboardList /> },
            { name: "Resource Sharing", path: "/resource-sharing", icon: <FaShareAlt /> },
            { name: "Reports", path: "/reports", icon: <FaChartBar /> },
            { name: "Maintenance", path: "/maintenance", icon: <FaTools /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ],

        SYSTEM_ADMIN: [
            { name: "Dashboard", path: "/system-dashboard", icon: <FaHome /> },
            { name: "Institutions", path: "/institutions", icon: <FaUniversity /> },
            { name: "Users", path: "/users", icon: <FaUsers /> },
            { name: "Bookings", path: "/bookings", icon: <FaClipboardList /> },
            { name: "Resource Sharing", path: "/resource-sharing", icon: <FaShareAlt /> },
            { name: "Reports", path: "/reports", icon: <FaChartBar /> },
            { name: "Maintenance", path: "/maintenance", icon: <FaTools /> },
            { name: "Utilization Cost", path: "/utilization-cost", icon: <FaDollarSign /> },
            { name: "Profile", path: "/profile", icon: <FaUser /> }
        ]

    };

    const menu = menus[role] || [];

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">

                <h3>Lab Resource</h3>

            </div>

            {

                menu.map((item, index) => (

                    <NavLink
                        key={index}
                        to={item.path}
                        className="sidebar-link"
                    >

                        <span>{item.icon}</span>

                        <span>{item.name}</span>

                    </NavLink>

                ))

            }

            <button
                className="logout-btn mt-4"
                onClick={logout}
            >
                <FaSignOutAlt /> Logout
            </button>

        </aside>

    );

}

export default Sidebar;
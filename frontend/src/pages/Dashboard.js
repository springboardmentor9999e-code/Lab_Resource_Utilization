import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../services/api";

function DashboardCard({ title, value, color, icon }) {
    return (
        <div
            style={{
                backgroundColor: "white",
                borderLeft: `5px solid ${color}`,
                borderRadius: "10px",
                padding: "12px",
                boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "18px"
                        }}
                    >
                        {title}
                    </h3>

                    <h1
                        style={{
                            marginTop: "10px",
                            marginBottom: "0",
                            fontSize: "30px",
                            color: color
                        }}
                    >
                        {value}
                    </h1>
                </div>

                <div
                    style={{
                        fontSize: "30px"
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}


function Dashboard() {

    const fullName = localStorage.getItem("fullName");

    const firstName = fullName
        ? fullName.split(" ")[0]
        : "User";

    const role = localStorage.getItem("role");

    const userId = localStorage.getItem("Name");


    const [institutionCount, setInstitutionCount] = useState(0);
    const [departmentCount, setDepartmentCount] = useState(0);
    const [equipmentCount, setEquipmentCount] = useState(0);
    const [bookingCount, setBookingCount] = useState(0);
    const [availableCount, setAvailableCount] = useState(0);
    const [inUseCount, setInUseCount] = useState(0);
    const [maintenanceCount, setMaintenanceCount] = useState(0);
    const [researcherCount, setResearcherCount] = useState(0);
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);


    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {

        /*
         * ============================
         * RESEARCHER DASHBOARD
         * ============================
         */

        if (role === "RESEARCHER") {

            // Equipment
            try {

                const response = await api.get("/equipment");

                const equipment = response.data;

                setEquipmentCount(equipment.length);

                setAvailableCount(
                    equipment.filter(
                        e => e.status === "AVAILABLE"
                    ).length
                );

                setInUseCount(
                    equipment.filter(
                        e => e.status === "IN_USE"
                    ).length
                );

            } catch (error) {

                console.log(
                    "Researcher Equipment error:",
                    error
                );

            }


            // My Bookings
            try {

                const response = await api.get("/booking");

                const bookings = response.data;

                const myBookings = bookings.filter(
                    b =>
                        String(b.userId) === String(userId) ||
                        String(b.user?.userId) === String(userId)
                );

                setBookingCount(myBookings.length);

            } catch (error) {

                console.log(
                    "Researcher Booking error:",
                    error
                );

            }

            return;
        }


        /*
         * ============================
         * INSTITUTION ADMIN DASHBOARD
         * ============================
         */

        if (role === "INSTITUTION_ADMIN") {

            // Institution
            try {

                const response = await api.get("/institution");

                setInstitutionCount(response.data.length);

            } catch (error) {

                console.log(
                    "Institution Admin Institution error:",
                    error
                );

            }


            // Departments
            try {

                const response = await api.get("/department");

                setDepartmentCount(response.data.length);

            } catch (error) {

                console.log(
                    "Institution Admin Department error:",
                    error
                );

            }


            // Equipment
            try {

                const response = await api.get("/equipment");

                const equipment = response.data;

                setEquipmentCount(equipment.length);

                setAvailableCount(
                    equipment.filter(
                        e => e.status === "AVAILABLE"
                    ).length
                );

                setInUseCount(
                    equipment.filter(
                        e => e.status === "IN_USE"
                    ).length
                );

                setMaintenanceCount(
                    equipment.filter(
                        e => e.status === "MAINTENANCE"
                    ).length
                );

            } catch (error) {

                console.log(
                    "Institution Admin Equipment error:",
                    error
                );

            }


            // Notifications
            try {

                const response = await api.get("/notifications");

                setNotificationCount(
                    response.data.length
                );

            } catch (error) {

                console.log(
                    "Institution Admin Notification error:",
                    error
                );

            }

            return;
        }

       /*
 * ============================
 * DEPARTMENT HEAD DASHBOARD
 * ============================
 */

if (role === "DEPARTMENT_HEAD") {

    // Department
    try {

        const response = await api.get("/department");

        setDepartmentCount(response.data.length);

    } catch (error) {

        console.log(
            "Department Head Department error:",
            error
        );

    }


    // Notifications
    try {

        const response = await api.get("/notifications");

        setNotificationCount(
            response.data.length
        );

    } catch (error) {

        console.log(
            "Department Head Notification error:",
            error
        );

    }


    return;
}
        /*
         * ============================
         * SYSTEM ADMIN DASHBOARD
         * ============================
         */

        // Institutions
        try {

            const response = await api.get("/institution");

            setInstitutionCount(response.data.length);

        } catch (error) {

            console.log(
                "Institution error:",
                error
            );

        }


        // Departments
        try {

            const response = await api.get("/department");

            setDepartmentCount(response.data.length);

        } catch (error) {

            console.log(
                "Department error:",
                error
            );

        }


        // Equipment
        try {

            const response = await api.get("/equipment");

            const equipment = response.data;

            setEquipmentCount(equipment.length);

            setAvailableCount(
                equipment.filter(
                    e => e.status === "AVAILABLE"
                ).length
            );

            setInUseCount(
                equipment.filter(
                    e => e.status === "IN_USE"
                ).length
            );

            setMaintenanceCount(
                equipment.filter(
                    e => e.status === "MAINTENANCE"
                ).length
            );

        } catch (error) {

            console.log(
                "Equipment error:",
                error
            );

        }


        // Bookings
        try {

            const response = await api.get("/booking");

            const bookings = response.data;

            setBookingCount(bookings.length);

            setWaitlistCount(
                bookings.filter(
                    b => b.status === "WAITLISTED"
                ).length
            );

        } catch (error) {

            console.log(
                "Booking error:",
                error
            );

        }


        // Researchers
        try {

            const response = await api.get("/user");

            setResearcherCount(
                response.data.filter(
                    u =>
                        u.role?.roleName === "RESEARCHER"
                ).length
            );

        } catch (error) {

            console.log(
                "User error:",
                error
            );

        }

    };


    return (

        <div
            style={{
                display: "flex"
            }}
        >

            <Sidebar />


            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>
                    Lab Resource Utilization Platform
                </h1>

                <hr />

                <h2>
                    Dashboard
                </h2>


                {/* Welcome message */}

                <div
                    style={{
                        backgroundColor: "#f8f9fa",
                        padding: "18px 22px",
                        borderRadius: "10px",
                        marginTop: "20px",
                        marginBottom: "25px",
                        borderLeft: "5px solid #1976d2"
                    }}
                >

                    <h2
                        style={{
                            margin: 0,
                            color: "#1976d2"
                        }}
                    >
                        Welcome, {firstName}! 👋
                    </h2>

                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: 0,
                            color: "#555",
                            fontSize: "16px"
                        }}
                    >
                        Welcome to the Lab Resource Utilization Platform.
                        Manage and monitor laboratory resources from one place.
                    </p>

                </div>


                {/* ==================================
                    RESEARCHER DASHBOARD
                ================================== */}

                {role === "RESEARCHER" && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, 1fr)",
                            gap: "18px"
                        }}
                    >

                        <DashboardCard
                            title="Equipments"
                            value={equipmentCount}
                            color="#fb8c00"
                            icon="🖥️"
                        />

                        <DashboardCard
                            title="My Bookings"
                            value={bookingCount}
                            color="#8e24aa"
                            icon="📅"
                        />

                        <DashboardCard
                            title="Available"
                            value={availableCount}
                            color="#2e7d32"
                            icon="✅"
                        />

                        <DashboardCard
                            title="In Use"
                            value={inUseCount}
                            color="#ef006c"
                            icon="🔄"
                        />

                    </div>

                )}


                {/* ==================================
                    INSTITUTION ADMIN DASHBOARD
                ================================== */}

                {role === "INSTITUTION_ADMIN" && (

                    <>

                        <div
                            style={{
                                backgroundColor: "#e3f2fd",
                                padding: "15px 20px",
                                borderRadius: "10px",
                                marginBottom: "20px",
                                borderLeft: "5px solid #1976d2"
                            }}
                        >

                            <h3
                                style={{
                                    margin: 0,
                                    color: "#1976d2"
                                }}
                            >
                                Institution Overview
                            </h3>

                            <p
                                style={{
                                    marginBottom: 0,
                                    color: "#555"
                                }}
                            >
                                Overview of resources and activities
                                belonging to your institution.
                            </p>

                        </div>


                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap: "18px"
                            }}
                        >

                            <DashboardCard
                                title="Institution"
                                value={institutionCount}
                                color="#1976d2"
                                icon="🏢"
                            />

                            <DashboardCard
                                title="Departments"
                                value={departmentCount}
                                color="#a04376"
                                icon="🏫"
                            />

                            <DashboardCard
                                title="Equipments"
                                value={equipmentCount}
                                color="#fb8c00"
                                icon="🖥️"
                            />

                            <DashboardCard
                                title="Available"
                                value={availableCount}
                                color="#2e7d32"
                                icon="✅"
                            />

                            <DashboardCard
                                title="In Use"
                                value={inUseCount}
                                color="#ef006c"
                                icon="🔄"
                            />

                            <DashboardCard
                                title="Maintenance"
                                value={maintenanceCount}
                                color="#d32f2f"
                                icon="🔧"
                            />

                            <DashboardCard
                                title="Notifications"
                                value={notificationCount}
                                color="#00838f"
                                icon="🔔"
                            />

                        </div>

                    </>

                )}
                {/* ==================================
    DEPARTMENT HEAD DASHBOARD
================================== */}

{role === "DEPARTMENT_HEAD" && (

    <>

        <div
            style={{
                backgroundColor: "#e3f2fd",
                padding: "15px 20px",
                borderRadius: "10px",
                marginBottom: "20px",
                borderLeft: "5px solid #1976d2"
            }}
        >

            <h3
                style={{
                    margin: 0,
                    color: "#1976d2"
                }}
            >
                Department Overview
            </h3>

            <p
                style={{
                    marginBottom: 0,
                    color: "#555"
                }}
            >
                Manage and monitor resources and activities
                related to your department.
            </p>

        </div>


        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "18px"
            }}
        >

            <DashboardCard
                title="My Department"
                value={departmentCount}
                color="#a04376"
                icon="🏫"
            />

            <DashboardCard
                title="Notifications"
                value={notificationCount}
                color="#00838f"
                icon="🔔"
            />

        </div>

    </>

)}

                {/* ==================================
                    SYSTEM ADMIN DASHBOARD
                ================================== */}

                {role === "SYSTEM_ADMIN" && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                            gap: "18px"
                        }}
                    >

                        <DashboardCard
                            title="Institutions"
                            value={institutionCount}
                            color="#1976d2"
                            icon="🏢"
                        />

                        <DashboardCard
                            title="Departments"
                            value={departmentCount}
                            color="#a04376"
                            icon="🏫"
                        />

                        <DashboardCard
                            title="Equipments"
                            value={equipmentCount}
                            color="#fb8c00"
                            icon="🖥️"
                        />

                        <DashboardCard
                            title="Bookings"
                            value={bookingCount}
                            color="#8e24aa"
                            icon="📅"
                        />

                        <DashboardCard
                            title="Available"
                            value={availableCount}
                            color="#2e7d32"
                            icon="✅"
                        />

                        <DashboardCard
                            title="In Use"
                            value={inUseCount}
                            color="#ef006c"
                            icon="🔄"
                        />

                        <DashboardCard
                            title="Maintenance"
                            value={maintenanceCount}
                            color="#d32f2f"
                            icon="🔧"
                        />

                        <DashboardCard
                            title="Researchers"
                            value={researcherCount}
                            color="#00838f"
                            icon="👨‍🔬"
                        />

                        <DashboardCard
                            title="Waitlisted"
                            value={waitlistCount}
                            color="#6a1b9a"
                            icon="⏳"
                        />

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dashboard;
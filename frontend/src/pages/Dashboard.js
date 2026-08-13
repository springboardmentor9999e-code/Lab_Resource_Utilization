import React, { useEffect, useMemo, useState } from "react";
import {
    FaFlask,
    FaClipboardCheck,
    FaChartLine,
    FaTools
} from "react-icons/fa";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";
import "../styles/dashboard.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const API_BASE_URL = "http://localhost:8080/api";

function Dashboard() {

    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [maintenance, setMaintenance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    equipmentResponse,
                    bookingsResponse,
                    maintenanceResponse
                ] = await Promise.all([

                    fetch(`${API_BASE_URL}/equipment`),

                    fetch(`${API_BASE_URL}/bookings`),

                    fetch(`${API_BASE_URL}/maintenance`)
                ]);

                if (!equipmentResponse.ok) {
                    throw new Error("Failed to fetch equipment data");
                }

                if (!bookingsResponse.ok) {
                    throw new Error("Failed to fetch booking data");
                }

                if (!maintenanceResponse.ok) {
                    throw new Error("Failed to fetch maintenance data");
                }

                const equipmentData =
                    await equipmentResponse.json();

                const bookingsData =
                    await bookingsResponse.json();

                const maintenanceData =
                    await maintenanceResponse.json();

                setEquipment(
                    Array.isArray(equipmentData)
                        ? equipmentData
                        : []
                );

                setBookings(
                    Array.isArray(bookingsData)
                        ? bookingsData
                        : []
                );

                setMaintenance(
                    Array.isArray(maintenanceData)
                        ? maintenanceData
                        : []
                );

            } catch (err) {

                console.error(
                    "Dashboard data error:",
                    err
                );

                setError(
                    "Unable to load dashboard data from the server."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchDashboardData();

    }, []);


    // =========================================================
    // TODAY'S DATE
    // =========================================================

    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];


    // =========================================================
    // TOTAL EQUIPMENT
    // =========================================================
    // Sum quantity rather than number of database rows.

    const totalEquipment = useMemo(() => {

        return equipment.reduce(
            (total, item) =>
                total + (Number(item.quantity) || 0),
            0
        );

    }, [equipment]);


    // =========================================================
    // TOTAL AVAILABLE EQUIPMENT
    // =========================================================

    const totalAvailableEquipment = useMemo(() => {

        return equipment.reduce(
            (total, item) =>
                total +
                (Number(item.availableQuantity) || 0),
            0
        );

    }, [equipment]);


    // =========================================================
    // UTILIZATION RATE
    // =========================================================

    const utilizationRate = useMemo(() => {

        if (totalEquipment <= 0) {
            return 0;
        }

        const occupied =
            totalEquipment -
            totalAvailableEquipment;

        const utilization =
            (occupied / totalEquipment) * 100;

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(utilization)
            )
        );

    }, [
        totalEquipment,
        totalAvailableEquipment
    ]);


    // =========================================================
    // BOOKINGS TODAY
    // =========================================================

    const bookingsToday = useMemo(() => {

        return bookings.filter((booking) => {

            const status =
                String(booking.status || "")
                    .toUpperCase();

            return (
                booking.bookingDate === todayString &&
                (
                    status === "PENDING" ||
                    status === "APPROVED"
                )
            );

        }).length;

    }, [bookings, todayString]);


    // =========================================================
    // MAINTENANCE DUE
    // =========================================================

    const maintenanceDue = useMemo(() => {

        return maintenance.filter((item) => {

            if (!item.nextDueDate) {
                return false;
            }

            const status =
                String(item.status || "")
                    .toUpperCase();

            // Ignore completed/cancelled maintenance
            if (
                status === "COMPLETED" ||
                status === "CANCELLED"
            ) {
                return false;
            }

            return item.nextDueDate <= todayString;

        }).length;

    }, [maintenance, todayString]);


    // =========================================================
    // CATEGORY DATA
    // =========================================================

    const categoryCounts = useMemo(() => {

        return equipment.reduce(
            (result, item) => {

                const category =
                    item.category || "Other";

                const quantity =
                    Number(item.quantity) || 0;

                result[category] =
                    (result[category] || 0) +
                    quantity;

                return result;

            },
            {}
        );

    }, [equipment]);


    const categoryLabels =
        Object.keys(categoryCounts);


    const categoryValues =
        Object.values(categoryCounts);


    const categoryColors = [
        "#2563EB",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
        "#EC4899",
        "#14B8A6"
    ];


    const categoryData = {

        labels:
            categoryLabels.length
                ? categoryLabels
                : ["No Equipment"],

        datasets: [
            {
                data:
                    categoryValues.length
                        ? categoryValues
                        : [1],

                backgroundColor:
                    categoryLabels.length
                        ? categoryLabels.map(
                            (_, index) =>
                                categoryColors[
                                index %
                                categoryColors.length
                                    ]
                        )
                        : ["#CBD5E1"]
            }
        ]
    };


    // =========================================================
    // EQUIPMENT UTILIZATION DATA
    // =========================================================

    const utilizationByEquipment = useMemo(() => {

        return equipment.map((item) => {

            const equipmentId =
                Number(item.id);

            const relatedBookings =
                bookings.filter((booking) => {

                    const status =
                        String(booking.status || "")
                            .toUpperCase();

                    return (
                        Number(booking.equipmentId) ===
                        equipmentId &&
                        (
                            status === "APPROVED" ||
                            status === "RETURNED"
                        )
                    );

                });

            const quantity =
                Number(item.quantity) || 0;

            const bookingCount =
                relatedBookings.length;

            let utilization = 0;

            if (quantity > 0) {

                utilization =
                    Math.min(
                        100,
                        Math.round(
                            (
                                bookingCount /
                                quantity
                            ) * 100
                        )
                    );

            }

            return {
                name: item.equipmentName,
                utilization
            };

        });

    }, [equipment, bookings]);


    // Limit chart to top 5 equipment

    const topEquipment =
        utilizationByEquipment
            .sort(
                (a, b) =>
                    b.utilization -
                    a.utilization
            )
            .slice(0, 5);


    const utilizationData = {

        labels:
            topEquipment.length
                ? topEquipment.map(
                    item => item.name
                )
                : ["No Equipment"],

        datasets: [
            {
                label: "Utilization %",

                data:
                    topEquipment.length
                        ? topEquipment.map(
                            item =>
                                item.utilization
                        )
                        : [0],

                backgroundColor: [
                    "#2563EB",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6"
                ],

                borderRadius: 8
            }
        ]
    };


    // =========================================================
    // WEEKLY BOOKINGS
    // =========================================================

    const weeklyBookingData = useMemo(() => {

        const days = [];

        for (let i = 6; i >= 0; i--) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );

            const dateString =
                date.toISOString()
                    .split("T")[0];

            const dayName =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

            const count =
                bookings.filter(
                    booking =>
                        booking.bookingDate ===
                        dateString
                ).length;

            days.push({
                dayName,
                count
            });
        }

        return days;

    }, [bookings]);


    const bookingData = {

        labels:
            weeklyBookingData.map(
                item => item.dayName
            ),

        datasets: [
            {
                label: "Bookings",

                data:
                    weeklyBookingData.map(
                        item => item.count
                    ),

                borderColor: "#2563EB",

                backgroundColor:
                    "rgba(147, 197, 253, 0.3)",

                fill: true,

                tension: 0.4
            }
        ]
    };


    // =========================================================
    // RECENT ACTIVITIES
    // =========================================================

    const recentActivities = useMemo(() => {

        const activities = [];

        // Recent bookings

        bookings
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        `${b.bookingDate}T${b.startTime || "00:00"}`
                    ) -
                    new Date(
                        `${a.bookingDate}T${a.startTime || "00:00"}`
                    )
            )
            .slice(0, 3)
            .forEach((booking) => {

                const equipmentItem =
                    equipment.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                booking.equipmentId
                            )
                    );

                const equipmentName =
                    equipmentItem
                        ?.equipmentName ||
                    "Equipment";

                activities.push({
                    text:
                        `${equipmentName} booking - ${booking.status}`,
                    date:
                    booking.bookingDate
                });

            });


        // Recent maintenance

        maintenance
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            )
            .slice(0, 2)
            .forEach((item) => {

                const equipmentItem =
                    equipment.find(
                        equipment =>
                            Number(
                                equipment.id
                            ) ===
                            Number(
                                item.resourceId
                            )
                    );

                const equipmentName =
                    equipmentItem
                        ?.equipmentName ||
                    "Equipment";

                activities.push({
                    text:
                        `${equipmentName} maintenance ${item.status || "scheduled"}`,
                    date:
                        item.maintenanceDate ||
                        item.nextDueDate ||
                        ""
                });

            });


        return activities.slice(0, 5);

    }, [
        bookings,
        maintenance,
        equipment
    ]);


    // =========================================================
    // AI INSIGHTS
    // =========================================================

    const aiInsights = useMemo(() => {

        const insights = [];

        // Utilization insight

        if (utilizationRate >= 80) {

            insights.push(
                `Overall equipment utilization is high at ${utilizationRate}%.`
            );

        } else if (utilizationRate >= 50) {

            insights.push(
                `Overall equipment utilization is moderate at ${utilizationRate}%.`
            );

        } else {

            insights.push(
                `Overall equipment utilization is currently ${utilizationRate}%.`
            );

        }


        // Most booked equipment

        if (topEquipment.length > 0) {

            const mostUsed =
                topEquipment[0];

            insights.push(
                `${mostUsed.name} currently has the highest booking activity.`
            );

        }


        // Maintenance

        if (maintenanceDue > 0) {

            insights.push(
                `${maintenanceDue} maintenance record(s) are currently due.`
            );

        } else {

            insights.push(
                "No maintenance records are currently overdue."
            );

        }


        // Booking insight

        if (bookingsToday > 0) {

            insights.push(
                `${bookingsToday} active booking(s) are scheduled for today.`
            );

        } else {

            insights.push(
                "There are no active bookings scheduled for today."
            );

        }


        // Availability

        if (totalAvailableEquipment > 0) {

            insights.push(
                `${totalAvailableEquipment} equipment unit(s) are currently available.`
            );

        }


        return insights;

    }, [
        utilizationRate,
        topEquipment,
        maintenanceDue,
        bookingsToday,
        totalAvailableEquipment
    ]);


    // =========================================================
    // KPI CARDS
    // =========================================================

    const stats = [

        {
            title: "Total Equipment",

            value:
                loading
                    ? "..."
                    : totalEquipment,

            icon: <FaFlask />,

            color: "#2563EB"
        },

        {
            title: "Bookings Today",

            value:
                loading
                    ? "..."
                    : bookingsToday,

            icon: <FaClipboardCheck />,

            color: "#10B981"
        },

        {
            title: "Utilization Rate",

            value:
                loading
                    ? "..."
                    : `${utilizationRate}%`,

            icon: <FaChartLine />,

            color: "#F59E0B"
        },

        {
            title: "Maintenance Due",

            value:
                loading
                    ? "..."
                    : maintenanceDue,

            icon: <FaTools />,

            color: "#EF4444"
        }

    ];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="dashboard">

            {/* HEADER */}

            <div className="dashboard-header">

                <h1>
                    Dashboard Overview
                </h1>

                <p>
                    Welcome to the AI-Powered Lab Resource
                    Utilization Platform
                </p>

            </div>


            {/* ERROR */}

            {error && (

                <div
                    style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>

            )}


            {/* KPI CARDS */}

            <div className="stats-grid">

                {stats.map(
                    (item, index) => (

                        <div
                            key={index}
                            className="stat-card"
                        >

                            <div
                                className="stat-icon"
                                style={{
                                    background:
                                    item.color
                                }}
                            >
                                {item.icon}
                            </div>

                            <div>

                                <h2>
                                    {item.value}
                                </h2>

                                <p>
                                    {item.title}
                                </p>

                            </div>

                        </div>

                    )
                )}

            </div>


            {/* FIRST ROW */}

            <div className="dashboard-section">


                {/* EQUIPMENT UTILIZATION */}

                <div className="chart-card">

                    <h3>
                        Equipment Utilization
                    </h3>

                    <div
                        style={{
                            height: "260px",
                            position: "relative"
                        }}
                    >

                        <Bar
                            data={utilizationData}
                            options={{
                                responsive: true,

                                maintainAspectRatio:
                                    false,

                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },

                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100
                                    }
                                }
                            }}
                        />

                    </div>

                </div>


                {/* RECENT ACTIVITIES */}

                <div className="chart-card">

                    <h3>
                        Recent Activities
                    </h3>

                    <ul
                        className="activity-list"
                        style={{
                            listStyle: "none",
                            padding: 0
                        }}
                    >

                        {recentActivities.length > 0 ? (

                            recentActivities.map(
                                (activity, index) => (

                                    <li
                                        key={index}
                                        style={{
                                            padding:
                                                "10px 0",

                                            borderBottom:
                                                "1px solid #f1f5f9",

                                            fontSize:
                                                "14px",

                                            color:
                                                "#334155"
                                        }}
                                    >

                                        ✔{" "}
                                        {activity.text}

                                    </li>

                                )
                            )

                        ) : (

                            <li
                                style={{
                                    padding:
                                        "10px 0",

                                    fontSize:
                                        "14px",

                                    color:
                                        "#64748b"
                                }}
                            >
                                No recent activities.
                            </li>

                        )}

                    </ul>

                </div>

            </div>


            {/* SECOND ROW */}

            <div className="dashboard-section">


                {/* WEEKLY BOOKINGS */}

                <div className="chart-card">

                    <h3>
                        Weekly Bookings
                    </h3>

                    <div
                        style={{
                            height: "240px",
                            position: "relative"
                        }}
                    >

                        <Line
                            data={bookingData}
                            options={{
                                responsive: true,

                                maintainAspectRatio:
                                    false,

                                scales: {
                                    y: {
                                        beginAtZero:
                                            true,

                                        ticks: {
                                            precision: 0
                                        }
                                    }
                                }
                            }}
                        />

                    </div>

                </div>


                {/* EQUIPMENT CATEGORIES */}

                <div className="chart-card">

                    <h3>
                        Equipment Categories
                    </h3>

                    <div
                        style={{
                            height: "240px",
                            position: "relative",

                            display:
                                "flex",

                            justifyContent:
                                "center"
                        }}
                    >

                        <Doughnut
                            data={categoryData}
                            options={{
                                responsive: true,

                                maintainAspectRatio:
                                    false
                            }}
                        />

                    </div>

                </div>

            </div>


            {/* AI INSIGHTS */}

            <div className="ai-card">

                <h2>
                    🤖 AI Demand & Optimization Insights
                </h2>

                <ul>

                    {aiInsights.map(
                        (insight, index) => (

                            <li key={index}>
                                {insight}
                            </li>

                        )
                    )}

                </ul>

            </div>

        </div>
    );
}

export default Dashboard;
import React from "react";
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

function Dashboard() {
    // KPI CARDS
    const stats = [
        {
            title: "Total Equipment",
            value: "125",
            icon: <FaFlask />,
            color: "#2563EB"
        },
        {
            title: "Bookings Today",
            value: "42",
            icon: <FaClipboardCheck />,
            color: "#10B981"
        },
        {
            title: "Utilization Rate",
            value: "78%",
            icon: <FaChartLine />,
            color: "#F59E0B"
        },
        {
            title: "Maintenance Due",
            value: "8",
            icon: <FaTools />,
            color: "#EF4444"
        }
    ];

    // BAR CHART
    const utilizationData = {
        labels: [
            "Microscope",
            "Oscilloscope",
            "3D Printer",
            "Spectrometer",
            "CNC Machine"
        ],
        datasets: [
            {
                label: "Utilization %",
                data: [90, 72, 61, 48, 82],
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

    // LINE CHART
    const bookingData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Bookings",
                data: [15, 25, 20, 30, 40, 18, 10],
                borderColor: "#2563EB",
                backgroundColor: "rgba(147, 197, 253, 0.3)",
                fill: true,
                tension: 0.4
            }
        ]
    };

    // DOUGHNUT CHART
    const categoryData = {
        labels: [
            "Electronics",
            "Mechanical",
            "Chemical",
            "Civil",
            "Computer"
        ],
        datasets: [
            {
                data: [25, 18, 22, 14, 21],
                backgroundColor: [
                    "#2563EB",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6"
                ]
            }
        ]
    };

    return (
        <div className="dashboard">
            {/* HEADER */}
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome to the AI-Powered Lab Resource Utilization Platform</p>
            </div>

            {/* KPI CARDS */}
            <div className="stats-grid">
                {stats.map((item, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ background: item.color }}>
                            {item.icon}
                        </div>
                        <div>
                            <h2>{item.value}</h2>
                            <p>{item.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FIRST ROW */}
            <div className="dashboard-section">
                <div className="chart-card">
                    <h3>Equipment Utilization</h3>
                    <div style={{ height: "260px", position: "relative" }}>
                        <Bar
                            data={utilizationData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Recent Activities</h3>
                    <ul className="activity-list" style={{ listStyle: "none", padding: 0 }}>
                        <li style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }}>✔ Microscope booked by Researcher</li>
                        <li style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }}>✔ Spectrometer maintenance completed</li>
                        <li style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }}>✔ New booking request received</li>
                        <li style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" }}>✔ Calibration reminder generated</li>
                        <li style={{ padding: "10px 0", fontSize: "14px", color: "#334155" }}>✔ Equipment returned successfully</li>
                    </ul>
                </div>
            </div>

            {/* SECOND ROW */}
            <div className="dashboard-section">
                <div className="chart-card">
                    <h3>Weekly Bookings</h3>
                    <div style={{ height: "240px", position: "relative" }}>
                        <Line
                            data={bookingData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Equipment Categories</h3>
                    <div style={{ height: "240px", position: "relative", display: "flex", justifyContent: "center" }}>
                        <Doughnut
                            data={categoryData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* AI INSIGHTS */}
            <div className="ai-card">
                <h2>🤖 AI Demand & Optimization Insights</h2>
                <ul>
                    <li>Microscope utilization increased by 18% this week.</li>
                    <li>Spectrometer has been idle for the last 5 days.</li>
                    <li>Monday recorded the highest number of bookings.</li>
                    <li>Calibration is due for the CNC Machine.</li>
                    <li>Average laboratory utilization reached 78%.</li>
                    <li>Mechanical Lab has the highest equipment demand.</li>
                </ul>
            </div>
        </div>
    );
}

export default Dashboard;
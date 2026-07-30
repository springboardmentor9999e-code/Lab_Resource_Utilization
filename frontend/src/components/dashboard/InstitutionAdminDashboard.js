import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaUniversity,
    FaBuilding,
    FaLaptop,
    FaUsers,
    FaClipboardList
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend
} from "chart.js";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

// Register ChartJS elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend
);

function InstitutionAdminDashboard() {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        totalLaboratories: 0,
        totalDepartments: 0,
        totalUsers: 0
    });
    const [pendingUsers, setPendingUsers] = useState([]);
    const [utilizationData, setUtilizationData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Stats
            const statsRes = await axios.get("http://localhost:8080/api/dashboard/stats", { headers });
            setStats(statsRes.data);

            // 2. Fetch Pending Users
            const usersRes = await axios.get("http://localhost:8080/api/admin/pending-users", { headers });
            setPendingUsers(usersRes.data);

            // 3. Fetch Utilization Rate for Chart
            const utilRes = await axios.get("http://localhost:8080/api/dashboard/utilization", { headers });
            setUtilizationData(utilRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error loading admin dashboard", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUserAction = async (userId, action) => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (action === "approve") {
                await axios.put(`http://localhost:8080/api/admin/approve/${userId}`, {}, { headers });
                alert("User approved successfully!");
            } else {
                await axios.put(`http://localhost:8080/api/admin/reject/${userId}`, {}, { headers });
                alert("User registration rejected!");
            }
            fetchData();
        } catch (error) {
            console.error("Error updating user status", error);
            alert("Failed to process action.");
        }
    };

    // Chart configs
    const chartData = {
        labels: utilizationData.map(item => item.name),
        datasets: [
            {
                label: "Utilization Rate (%)",
                data: utilizationData.map(item => item.utilizationRate),
                backgroundColor: "rgba(56, 189, 248, 0.6)",
                borderColor: "rgba(56, 189, 248, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "#f8fafc"
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)"
                },
                ticks: {
                    color: "#94a3b8"
                }
            },
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)"
                },
                ticks: {
                    color: "#94a3b8"
                },
                min: 0,
                max: 100
            }
        }
    };

    return (
        <DashboardLayout title="Institution Admin Dashboard">
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Oversee university facilities, approve staff registrations, and analyze equipment utilization intelligence.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUsers size={42} className="text-primary mb-3" />
                            <h2>{stats.totalUsers}</h2>
                            <p className="mb-0 text-muted">Total Users</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaBuilding size={42} className="text-success mb-3" />
                            <h2>{stats.totalDepartments}</h2>
                            <p className="mb-0 text-muted">Departments</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUniversity size={42} className="text-warning mb-3" />
                            <h2>{stats.totalLaboratories}</h2>
                            <p className="mb-0 text-muted">Laboratories</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-danger mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Equipment Catalog</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col lg={8}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Equipment Utilization Intelligence</h5>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <p className="text-center text-muted mb-0 py-5">Loading chart data...</p>
                            ) : utilizationData.length === 0 ? (
                                <p className="text-center text-muted mb-0 py-5">No data available for display.</p>
                            ) : (
                                <div style={{ minHeight: "260px" }}>
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Quick Operations Workspace</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-around">
                            <Button variant="primary" className="py-2 mb-2">Create Department</Button>
                            <Button variant="success" className="py-2 mb-2">Add Laboratory Center</Button>
                            <Button variant="warning" className="py-2">Generate cost/Billing PDF</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header>
                    <h5 className="mb-0">
                        <FaClipboardList className="me-2 text-warning" />
                        Pending User Registration Requests
                    </h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <p className="text-center text-muted py-3 mb-0">Loading requests...</p>
                    ) : pendingUsers.length === 0 ? (
                        <p className="text-center text-muted py-3 mb-0">No pending staff registrations.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email Address</th>
                                    <th>Phone Number</th>
                                    <th>Role Requested</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <td><strong>{user.fullName}</strong></td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <Badge bg="info">{user.role ? user.role.roleName : "N/A"}</Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleUserAction(user.userId, "approve")}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleUserAction(user.userId, "reject")}
                                            >
                                                Reject
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default InstitutionAdminDashboard;
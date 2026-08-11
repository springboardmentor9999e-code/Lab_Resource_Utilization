import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaUniversity,
    FaBuilding,
    FaLaptop,
    FaUsers,
    FaClipboardList,
    FaDollarSign,
    FaChartLine,
    FaTools,
    FaCheckCircle
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
import ConfirmationModal from "../common/ConfirmationModal";

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
    const [realtimeData, setRealtimeData] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem("role");

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Realtime stats
            const realtimeRes = await axios.get("http://localhost:8080/api/dashboard/realtime", { headers });
            setRealtimeData(realtimeRes.data);

            // 2. Fetch Pending Users if institution admin
            if (role === "INSTITUTION_ADMIN") {
                const usersRes = await axios.get("http://localhost:8080/api/admin/pending-users", { headers });
                // Filter by same institution
                const profileRes = await axios.get("http://localhost:8080/api/profile", { headers });
                const myInstId = profileRes.data.institutionId;
                const filteredPending = usersRes.data.filter(u => u.institutionId === myInstId);
                setPendingUsers(filteredPending);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error loading admin dashboard", error);
            setLoading(false);
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", action: null });

    const triggerConfirm = (title, message, callback) => {
        setConfirmConfig({
            title,
            message,
            action: () => {
                callback();
                setShowConfirm(false);
            }
        });
        setShowConfirm(true);
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const handleUserAction = async (userId, action) => {
        triggerConfirm("Confirm User Registration", `Are you sure you want to ${action} this user registration request?`, async () => {
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
        });
    };

    if (loading || !realtimeData) {
        return (
            <DashboardLayout title={role === "DEPARTMENT_HEAD" ? "Department Head Dashboard" : "Institution Admin Dashboard"}>
                <div className="text-center py-5 text-muted">
                    <h5>Loading dashboard intelligence...</h5>
                </div>
            </DashboardLayout>
        );
    }

    // Chart config for Institution Admin
    const deptCompChartData = {
        labels: (realtimeData.departmentComparison || []).map(item => item.name),
        datasets: [
            {
                label: "Equipment Count",
                data: (realtimeData.departmentComparison || []).map(item => item.value),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    const equipUtilChartData = {
        labels: (realtimeData.equipmentUtilization || []).map(item => item.name),
        datasets: [
            {
                label: "Utilization Rate (%)",
                data: (realtimeData.equipmentUtilization || []).map(item => item.utilization),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    const instWiseChartData = {
        labels: (realtimeData.institutionWiseUtilizationRevenue || []).map(item => item.name),
        datasets: [
            {
                label: "Shared Revenue (₹)",
                data: (realtimeData.institutionWiseUtilizationRevenue || []).map(item => item.value),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    // Chart config for Department Head
    const deptUsageChartData = {
        labels: (realtimeData.monthlyEquipmentUsage || []).map(item => item.name),
        datasets: [
            {
                label: "Usage Hours",
                data: (realtimeData.monthlyEquipmentUsage || []).map(item => item.value),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    if (role === "DEPARTMENT_HEAD") {
        return (
            <DashboardLayout title="Department Head Dashboard">
                <Card className="shadow border-0 mb-4 bg-light">
                    <Card.Body>
                        <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                        <p className="text-muted mb-0">
                            Monitor department resource usage, review active equipment checkouts, and coordinate labs workflow.
                        </p>
                    </Card.Body>
                </Card>

                {/* KPI Cards */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="shadow text-center h-100">
                            <Card.Body>
                                <FaLaptop size={36} className="text-primary mb-2" />
                                <h3>{realtimeData.departmentEquipment}</h3>
                                <p className="mb-0 text-muted small fw-bold">Department Equipment</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow text-center h-100">
                            <Card.Body>
                                <FaBuilding size={36} className="text-success mb-2" />
                                <h3>{realtimeData.departmentLaboratories}</h3>
                                <p className="mb-0 text-muted small fw-bold">Department Laboratories</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow text-center h-100">
                            <Card.Body>
                                <FaChartLine size={36} className="text-info mb-2" />
                                <h3>{realtimeData.departmentUtilization}%</h3>
                                <p className="mb-0 text-muted small fw-bold">Department Utilization</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow text-center h-100">
                            <Card.Body>
                                <FaCheckCircle size={36} className="text-warning mb-2" />
                                <h3>{realtimeData.activeBookings}</h3>
                                <p className="mb-0 text-muted small fw-bold">Active Bookings</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4 mb-4">
                    <Col md={6}>
                        <Card className="shadow h-100">
                            <Card.Body className="d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="fw-bold">Active Issues Checklist</h5>
                                    <p className="text-muted small">Maintanence tickets currently pending or in progress in your department.</p>
                                </div>
                                <h2 className="text-danger fw-bold">{realtimeData.maintenanceOverview} <small className="text-muted h6">Active Issues</small></h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="shadow h-100">
                            <Card.Header className="bg-transparent border-0 py-3">
                                <h5 className="mb-0 fw-bold">Equipment Usage hours (Top 8)</h5>
                            </Card.Header>
                            <Card.Body>
                                {(realtimeData.monthlyEquipmentUsage || []).length === 0 ? (
                                    <p className="text-center text-muted py-4 mb-0">No usage recorded yet.</p>
                                ) : (
                                    <div style={{ width: "100%", height: "200px" }}>
                                        <Bar data={deptUsageChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Institution Admin Dashboard">
            <Card className="shadow border-0 mb-4 bg-light">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Oversee university facilities, approve staff registrations, and analyze equipment utilization intelligence.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaBuilding size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.totalDepartments}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Departments</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaUniversity size={36} className="text-success mb-2" />
                            <h3>{realtimeData.totalLaboratories}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Laboratories</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaLaptop size={36} className="text-warning mb-2" />
                            <h3>{realtimeData.totalEquipment}</h3>
                            <p className="mb-0 text-muted small fw-bold">Equipment Catalog</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaUsers size={36} className="text-info mb-2" />
                            <h3>{realtimeData.totalActiveUsers}</h3>
                            <p className="mb-0 text-muted small fw-bold">Active Staff Directory</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaClipboardList size={36} className="text-warning mb-2" />
                            <h3>{realtimeData.pendingUserApprovals}</h3>
                            <p className="mb-0 text-muted small fw-bold">Pending Registrations</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaCheckCircle size={36} className="text-success mb-2" />
                            <h3>{realtimeData.activeBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Active Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaTools size={36} className="text-danger mb-2" />
                            <h3>{realtimeData.equipmentUnderMaintenance}</h3>
                            <p className="mb-0 text-muted small fw-bold">Faulty / Down Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaDollarSign size={36} className="text-primary mb-2" />
                            <h3>₹{realtimeData.totalUtilizationCost}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Utilization Billing</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Inter-Institute Resource Sharing KPI Metric Grid */}
            <Card className="shadow border-0 mb-4 bg-white">
                <Card.Header className="bg-primary text-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Inter-Institute Resource Sharing Metrics</h5>
                    <Badge bg="light" text="dark">Live Institute Metrics</Badge>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-primary mb-1">{realtimeData.totalOwnedEquipment || realtimeData.totalEquipment || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Total Owned Equipment</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-success mb-1">{realtimeData.totalEquipmentSharedWithOthers || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Shared With Other Institutes</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-info mb-1">{realtimeData.totalEquipmentSharedFromOthers || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Shared From Other Institutes</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-secondary mb-1">{realtimeData.totalActiveSharingRequests || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Total Active Sharing Requests</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-warning mb-1">{realtimeData.pendingRequests || realtimeData.pendingSharingApprovals || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Pending Requests</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} sm={6}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-3">
                                    <h3 className="fw-bold text-success mb-1">{realtimeData.approvedRequests || realtimeData.approvedSharingRequests || 0}</h3>
                                    <p className="mb-0 text-muted small fw-bold">Approved Requests</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="g-3 mt-1">
                        <Col md={4}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-2">
                                    <h5 className="fw-bold text-success mb-0">₹{(realtimeData.externalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h5>
                                    <small className="text-muted">Shared Revenue Generated</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-2">
                                    <h5 className="fw-bold text-secondary mb-0">{(realtimeData.internalEquipmentUsage || 0).toFixed(1)} hrs</h5>
                                    <small className="text-muted">Internal Usage Hours</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                <Card.Body className="py-2">
                                    <h5 className="fw-bold text-primary mb-0">{(realtimeData.externalEquipmentUsage || 0).toFixed(1)} hrs</h5>
                                    <small className="text-muted">External Usage Hours</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="mb-4 g-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100 border-start border-primary border-4 py-4">
                        <Card.Body>
                            <FaChartLine size={42} className="text-primary mb-2" />
                            <h3>{realtimeData.institutionUtilizationPercentage}%</h3>
                            <p className="mb-0 text-muted small fw-bold">Institution Utilization</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={9}>
                    <Row className="g-4">
                        <Col md={6}>
                            <Card className="shadow">
                                <Card.Header className="bg-transparent border-0 py-3">
                                    <h5 className="mb-0 fw-bold">Equipment Count by Department</h5>
                                </Card.Header>
                                <Card.Body>
                                    {(realtimeData.departmentComparison || []).length === 0 ? (
                                        <p className="text-center text-muted py-4 mb-0">No departments recorded.</p>
                                    ) : (
                                        <div style={{ width: "100%", height: "200px" }}>
                                            <Bar data={deptCompChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="shadow">
                                <Card.Header className="bg-transparent border-0 py-3">
                                    <h5 className="mb-0 fw-bold">Revenue by Requesting Institute</h5>
                                </Card.Header>
                                <Card.Body>
                                    {(realtimeData.institutionWiseUtilizationRevenue || []).length === 0 ? (
                                        <p className="text-center text-muted py-4 mb-0">No shared revenue logged yet.</p>
                                    ) : (
                                        <div style={{ width: "100%", height: "200px" }}>
                                            <Bar data={instWiseChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col lg={12}>
                    <Card className="shadow h-100">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Equipment Utilization Percentage Rates</h5>
                        </Card.Header>
                        <Card.Body>
                            {(realtimeData.equipmentUtilization || []).length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No equipment found.</p>
                            ) : (
                                <div style={{ width: "100%", height: "240px" }}>
                                    <Bar data={equipUtilChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                        <FaClipboardList className="me-2 text-warning" />
                        Pending User Registration Requests
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {pendingUsers.length === 0 ? (
                        <p className="text-center text-muted py-4 mb-0">No pending staff registrations.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
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
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button
                                                    variant="success"
                                                    size="sm"
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
            <ConfirmationModal
                show={showConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.action}
                onCancel={() => setShowConfirm(false)}
            />
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
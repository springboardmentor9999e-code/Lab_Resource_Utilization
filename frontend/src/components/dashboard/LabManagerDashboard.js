import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaLaptop,
    FaClipboardList,
    FaUniversity,
    FaTools,
    FaCheckCircle,
    FaChartLine,
    FaCalendarDay
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function LabManagerDashboard() {
    const [realtimeData, setRealtimeData] = useState(null);
    const [pendingBookingsList, setPendingBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Realtime stats
            const realtimeRes = await axios.get("http://localhost:8080/api/dashboard/realtime", { headers });
            setRealtimeData(realtimeRes.data);

            // 2. Fetch pending bookings
            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", { headers });
            const pending = bookingsRes.data.filter(
                b => "Pending Approval".equalsIgnoreCase(b.status) || "Pending".equalsIgnoreCase(b.status)
            );
            setPendingBookingsList(pending);
            setLoading(false);
        } catch (error) {
            console.error("Error loading dashboard data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (booking, action) => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const updatedBooking = { ...booking, status: action };
            
            await axios.put(`http://localhost:8080/api/bookings/${booking.bookingId}`, updatedBooking, { headers });
            
            alert(`Booking successfully ${action}`);
            fetchData();
        } catch (error) {
            console.error("Error updating booking status", error);
            alert("Failed to update booking status.");
        }
    };

    if (loading || !realtimeData) {
        return (
            <DashboardLayout title="Lab Manager Dashboard">
                <div className="text-center py-5 text-muted">
                    <h5>Loading dashboard intelligence...</h5>
                </div>
            </DashboardLayout>
        );
    }

    const chartData = {
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

    return (
        <DashboardLayout title="Lab Manager Dashboard">
            <Card className="shadow border-0 mb-4 bg-light">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Monitor laboratories, manage equipment status, and coordinate reservation approvals.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaLaptop size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.totalEquipment}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaCheckCircle size={36} className="text-success mb-2" />
                            <h3>{realtimeData.availableEquipment}</h3>
                            <p className="mb-0 text-muted small fw-bold">Available Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaClipboardList size={36} className="text-info mb-2" />
                            <h3>{realtimeData.activeBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Active Bookings (In Use)</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaTools size={36} className="text-danger mb-2" />
                            <h3>{realtimeData.equipmentUnderMaintenance}</h3>
                            <p className="mb-0 text-muted small fw-bold">Under Maintenance</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaClipboardList size={36} className="text-warning mb-2" />
                            <h3>{realtimeData.pendingBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Pending Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaChartLine size={36} className="text-info mb-2" />
                            <h3>{realtimeData.utilizationPercentage}%</h3>
                            <p className="mb-0 text-muted small fw-bold">Utilization Percentage</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaCalendarDay size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.todayBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Today's Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={12}>
                    <Card className="shadow">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Equipment Utilization Rate</h5>
                        </Card.Header>
                        <Card.Body>
                            {(realtimeData.equipmentUtilization || []).length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No equipment utilization records available.</p>
                            ) : (
                                <div style={{ width: "100%", height: "260px" }}>
                                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Pending Booking Requests</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {pendingBookingsList.length === 0 ? (
                        <p className="text-center text-muted py-4 mb-0">No pending booking requests found.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>User</th>
                                    <th>Equipment</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Purpose</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingBookingsList.map((b) => (
                                    <tr key={b.bookingId}>
                                        <td>
                                            <strong>{b.user ? b.user.fullName : "N/A"}</strong>
                                            <br />
                                            <small className="text-muted">{b.user ? b.user.email : ""}</small>
                                        </td>
                                        <td>{b.equipment ? b.equipment.equipmentName : "N/A"}</td>
                                        <td>{b.bookingDate}</td>
                                        <td>{b.startTime} - {b.endTime}</td>
                                        <td>{b.purpose || "No purpose provided"}</td>
                                        <td className="text-center">
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleAction(b, "Approved")}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleAction(b, "Rejected")}
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
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default LabManagerDashboard;
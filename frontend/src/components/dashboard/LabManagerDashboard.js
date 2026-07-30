import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaLaptop,
    FaClipboardList,
    FaUniversity,
    FaTools,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

function LabManagerDashboard() {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        pendingBookings: 0,
        totalLaboratories: 0,
        maintenanceEquipment: 0
    });
    const [pendingBookingsList, setPendingBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            
            // Fetch stats
            const statsRes = await axios.get("http://localhost:8080/api/dashboard/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);

            // Fetch pending bookings
            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const updatedBooking = { ...booking, status: action };
            
            await axios.put(`http://localhost:8080/api/bookings/${booking.bookingId}`, updatedBooking, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(`Booking successfully ${action}`);
            fetchData(); // Reload stats and list
        } catch (error) {
            console.error("Error updating booking status", error);
            alert("Failed to update booking status.");
        }
    };

    return (
        <DashboardLayout title="Lab Manager Dashboard">
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Monitor laboratories, manage equipment status, and coordinate reservation approvals.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-primary mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Total Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaClipboardList size={42} className="text-success mb-3" />
                            <h2>{pendingBookingsList.length}</h2>
                            <p className="mb-0 text-muted">Pending Bookings</p>
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
                            <FaTools size={42} className="text-danger mb-3" />
                            <h2>{stats.maintenanceEquipment}</h2>
                            <p className="mb-0 text-muted">Under Maintenance</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Quick Operations</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button variant="primary" className="py-2">Manage Lab Catalog</Button>
                                <Button variant="success" className="py-2">Log Preventive Maintenance</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Equipment Status Summary</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <div className="mb-3 d-flex align-items-center">
                                <FaCheckCircle className="text-success me-3" size={24} />
                                <div>
                                    <h6 className="mb-0">Operational</h6>
                                    <small className="text-muted">{stats.totalEquipment - stats.maintenanceEquipment} units online</small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <FaExclamationTriangle className="text-danger me-3" size={24} />
                                <div>
                                    <h6 className="mb-0">Under Maintenance</h6>
                                    <small className="text-muted">{stats.maintenanceEquipment} units offline</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header>
                    <h5 className="mb-0">Pending Booking Requests</h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <p className="text-center text-muted py-3 mb-0">Loading requests...</p>
                    ) : pendingBookingsList.length === 0 ? (
                        <p className="text-center text-muted py-3 mb-0">No pending booking requests found.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
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
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="me-2"
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
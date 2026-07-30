import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaUniversity,
    FaLaptop,
    FaClipboardList,
    FaClock,
    FaSearch,
    FaArrowRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

function StudentDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalLaboratories: 0,
        totalEquipment: 0,
        myBookings: 0,
        activeBookings: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");
                
                const statsRes = await axios.get(`http://localhost:8080/api/dashboard/stats?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(statsRes.data);

                const bookingsRes = await axios.get("http://localhost:8080/api/bookings", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myBookings = bookingsRes.data.filter(b => b.user && b.user.userId === parseInt(userId));
                setRecentBookings(myBookings.reverse().slice(0, 5)); // Show latest first
            } catch (error) {
                console.error("Error loading dashboard data", error);
            }
        };
        fetchDashboardData();
    }, []);

    const getBadgeBg = (status) => {
        if ("Approved".equalsIgnoreCase(status) || "Confirmed".equalsIgnoreCase(status) || "In Use".equalsIgnoreCase(status)) return "success";
        if ("Waitlisted".equalsIgnoreCase(status) || "Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) return "warning";
        return "danger";
    };

    return (
        <DashboardLayout title="Student Dashboard">
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Browse laboratories, reserve equipment and manage your bookings from one place.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUniversity size={42} className="text-primary mb-3" />
                            <h2>{stats.totalLaboratories}</h2>
                            <p className="mb-0 text-muted">Laboratories</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-success mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaClipboardList size={42} className="text-warning mb-3" />
                            <h2>{stats.myBookings}</h2>
                            <p className="mb-0 text-muted">My Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaClock size={42} className="text-danger mb-3" />
                            <h2>{stats.activeBookings}</h2>
                            <p className="mb-0 text-muted">Active Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <h5>Search Laboratories</h5>
                                <p className="text-muted">Find available laboratories in your institution and explore facilities.</p>
                            </div>
                            <Button variant="primary" className="mt-3 w-100" onClick={() => navigate("/laboratories")}>
                                <FaSearch className="me-2" /> Explore Labs
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <h5>Browse Equipment</h5>
                                <p className="text-muted">Search through real-time inventory and request bookings instantly.</p>
                            </div>
                            <Button variant="success" className="mt-3 w-100" onClick={() => navigate("/equipment")}>
                                <FaArrowRight className="me-2" /> Request Reservation
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header>
                    <h5 className="mb-0">Recent Bookings</h5>
                </Card.Header>
                <Card.Body>
                    {recentBookings.length === 0 ? (
                        <p className="text-center text-muted mb-0 py-3">You have no booking records.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Equipment</th>
                                    <th>Laboratory</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((b) => (
                                    <tr key={b.bookingId}>
                                        <td>{b.equipment ? b.equipment.equipmentName : "N/A"}</td>
                                        <td>{b.equipment && b.equipment.laboratory ? b.equipment.laboratory.labName : "N/A"}</td>
                                        <td>{b.bookingDate}</td>
                                        <td>{b.startTime} - {b.endTime}</td>
                                        <td>
                                            <Badge bg={getBadgeBg(b.status)}>{b.status}</Badge>
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

export default StudentDashboard;
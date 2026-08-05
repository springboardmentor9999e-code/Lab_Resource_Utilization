import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import {
    FaUniversity,
    FaLaptop,
    FaClipboardList,
    FaClock,
    FaSearch,
    FaArrowRight,
    FaDollarSign,
    FaHourglassHalf,
    FaCalendarCheck,
    FaTimesCircle
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ResearcherDashboard() {
    const navigate = useNavigate();
    const [realtimeData, setRealtimeData] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Realtime stats
            const realtimeRes = await axios.get("http://localhost:8080/api/dashboard/realtime", { headers });
            setRealtimeData(realtimeRes.data);

            // 2. Fetch recent bookings
            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", { headers });
            const myBookings = bookingsRes.data.filter(b => b.user && b.user.userId === parseInt(userId));
            setRecentBookings(myBookings.reverse().slice(0, 5)); // Show latest 5

            setLoading(false);
        } catch (error) {
            console.error("Error loading researcher dashboard data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const getBadgeBg = (status) => {
        if ("Approved".equalsIgnoreCase(status) || "Confirmed".equalsIgnoreCase(status) || "In Use".equalsIgnoreCase(status)) return "success";
        if ("Waitlisted".equalsIgnoreCase(status) || "Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) return "warning";
        return "danger";
    };

    if (loading || !realtimeData) {
        return (
            <DashboardLayout title="Researcher Dashboard">
                <div className="text-center py-5 text-muted">
                    <h5>Loading dashboard intelligence...</h5>
                </div>
            </DashboardLayout>
        );
    }

    // Chart Data configs
    const usageChartData = {
        labels: (realtimeData.mostFrequentlyUsed || []).map(item => item.name),
        datasets: [
            {
                label: "Hours Used",
                data: (realtimeData.mostFrequentlyUsed || []).map(item => item.value),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    const statusChartData = {
        labels: ["Active", "Upcoming", "Completed", "Cancelled"],
        datasets: [
            {
                data: [
                    realtimeData.myActiveBookings || 0,
                    realtimeData.myUpcomingBookings || 0,
                    realtimeData.myCompletedBookings || 0,
                    realtimeData.myCancelledBookings || 0
                ],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 99, 132, 0.6)"
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 99, 132, 1)"
                ],
                borderWidth: 1
            }
        ]
    };

    return (
        <DashboardLayout title="Researcher Dashboard">
            <Card className="shadow border-0 mb-4 bg-light">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Access research equipment, monitor schedule bookings, and track project utilization resources.
                    </p>
                </Card.Body>
            </Card>

            {/* KPI Cards Row 1 */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaUniversity size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.totalLaboratories}</h3>
                            <p className="mb-0 text-muted small fw-bold">Laboratories Available</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaLaptop size={36} className="text-success mb-2" />
                            <h3>{realtimeData.totalEquipment}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Equipments</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaClipboardList size={36} className="text-info mb-2" />
                            <h3>{realtimeData.myActiveBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">My Active Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaClock size={36} className="text-warning mb-2" />
                            <h3>{realtimeData.myUpcomingBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Upcoming Reservations</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* KPI Cards Row 2 */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaCalendarCheck size={36} className="text-success mb-2" />
                            <h3>{realtimeData.myCompletedBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Completed Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaTimesCircle size={36} className="text-danger mb-2" />
                            <h3>{realtimeData.myCancelledBookings}</h3>
                            <p className="mb-0 text-muted small fw-bold">Cancelled Bookings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaHourglassHalf size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.totalHoursUsed} hrs</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Usage Hours</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center h-100 bg-light">
                        <Card.Body>
                            <FaDollarSign size={36} className="text-warning mb-2" />
                            <h3>${realtimeData.totalUtilizationCost}</h3>
                            <p className="mb-0 text-muted small fw-bold">Total Billing Cost</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <Card className="shadow h-100">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Frequently Used Equipment (Usage Hours)</h5>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            { (realtimeData.mostFrequentlyUsed || []).length === 0 ? (
                                <p className="text-muted">No usage statistics recorded yet.</p>
                            ) : (
                                <div style={{ width: "100%", height: "240px" }}>
                                    <Bar data={usageChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="shadow h-100">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Booking Status Summary</h5>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div style={{ width: "100%", height: "240px", position: "relative" }}>
                                <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow h-100 border-start border-primary border-4">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <h5 className="fw-bold">Search Laboratories</h5>
                                <p className="text-muted small">Find available laboratories in your institution and explore facilities.</p>
                            </div>
                            <Button variant="outline-primary" className="mt-3 w-100" onClick={() => navigate("/laboratories")}>
                                <FaSearch className="me-2" /> Explore Labs
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow h-100 border-start border-success border-4">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <h5 className="fw-bold">Browse Equipment</h5>
                                <p className="text-muted small">Search through real-time inventory and request bookings instantly.</p>
                            </div>
                            <Button variant="outline-success" className="mt-3 w-100" onClick={() => navigate("/equipment")}>
                                <FaArrowRight className="me-2" /> Request Reservation
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Recent Bookings</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {recentBookings.length === 0 ? (
                        <p className="text-center text-muted mb-0 py-4">You have no booking records.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0 align-middle">
                            <thead className="table-light">
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
                                        <td><strong>{b.equipment ? b.equipment.equipmentName : "N/A"}</strong></td>
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

export default ResearcherDashboard;
import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button, Row, Col } from "react-bootstrap";
import { FaCalendarTimes, FaClock, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [allBookingsList, setAllBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get("http://localhost:8080/api/bookings", { headers });
            setAllBookingsList(response.data);

            const myFiltered = response.data.filter(b => b.user && b.user.userId === parseInt(userId));
            setBookings(myFiltered.reverse());
            setLoading(false);
        } catch (error) {
            console.error("Error loading user bookings", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCancel = async (booking) => {
        if (!window.confirm("Are you sure you want to cancel this booking request?")) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`http://localhost:8080/api/bookings/${booking.bookingId}/cancel`, {}, { headers });
            alert("Booking cancelled successfully.");
            loadData();
        } catch (error) {
            console.error("Error cancelling booking", error);
            alert("Failed to cancel booking.");
        }
    };

    const calculateQueuePosition = (curr, list) => {
        if (curr.status !== "Waitlisted") return null;
        
        // Find other waitlisted items for the same equipment & same date that overlap in time
        const overlaps = list.filter(b => 
            b.status === "Waitlisted" &&
            b.equipment?.id === curr.equipment?.id &&
            b.bookingDate === curr.bookingDate &&
            b.startTime < curr.endTime &&
            b.endTime > curr.startTime
        );
        
        // Sort by bookingId (chronological creation order)
        overlaps.sort((a, b) => a.bookingId - b.bookingId);
        
        const idx = overlaps.findIndex(b => b.bookingId === curr.bookingId);
        return idx !== -1 ? idx + 1 : 1;
    };

    const getBadgeBg = (status) => {
        if ("Confirmed".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status)) return "success";
        if ("Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) return "info";
        if ("In Use".equalsIgnoreCase(status)) return "primary";
        if ("Completed".equalsIgnoreCase(status)) return "secondary";
        if ("Cancelled".equalsIgnoreCase(status) || "Rejected".equalsIgnoreCase(status)) return "danger";
        if ("Waitlisted".equalsIgnoreCase(status)) return "warning";
        return "dark";
    };

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(":");
        const hrs = parseInt(parts[0]) || 0;
        const mins = parseInt(parts[1]) || 0;
        return hrs * 60 + mins;
    };

    const now = new Date();
    const currentDateStr = now.getFullYear() + "-" + 
        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getDate()).padStart(2, '0'); // YYYY-MM-DD
    const currentTimeStr = String(now.getHours()).padStart(2, '0') + ":" + 
        String(now.getMinutes()).padStart(2, '0'); // HH:MM

    const pendingCount = bookings.filter(b => "Pending Approval".equalsIgnoreCase(b.status) || "Pending".equalsIgnoreCase(b.status)).length;
    const activeCount = bookings.filter(b => "In Use".equalsIgnoreCase(b.status)).length;
    const completedCount = bookings.filter(b => "Completed".equalsIgnoreCase(b.status)).length;
    const waitingCount = bookings.filter(b => "Waitlisted".equalsIgnoreCase(b.status)).length;

    const isUpcoming = (b) => {
        const isStatusMatch = "Confirmed".equalsIgnoreCase(b.status) || "Approved".equalsIgnoreCase(b.status);
        if (!isStatusMatch) return false;
        
        if (b.bookingDate > currentDateStr) return true;
        if (b.bookingDate === currentDateStr) {
            return timeToMinutes(b.startTime) > timeToMinutes(currentTimeStr);
        }
        return false;
    };

    const upcomingCount = bookings.filter(isUpcoming).length;

    const displayedBookings = bookings.filter(b => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "PENDING") return "Pending Approval".equalsIgnoreCase(b.status) || "Pending".equalsIgnoreCase(b.status);
        if (statusFilter === "ACTIVE") return "In Use".equalsIgnoreCase(b.status);
        if (statusFilter === "UPCOMING") return isUpcoming(b);
        if (statusFilter === "COMPLETED") return "Completed".equalsIgnoreCase(b.status);
        if (statusFilter === "WAITING") return "Waitlisted".equalsIgnoreCase(b.status);
        if (statusFilter === "CANCELLED") return "Cancelled".equalsIgnoreCase(b.status) || "Rejected".equalsIgnoreCase(b.status) || "No Show".equalsIgnoreCase(b.status);
        return true;
    });

    return (
        <DashboardLayout title="My Booking Reservations">
            <Container fluid className="px-0">
                {/* Stats cards */}
                <Row className="g-3 mb-4">
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "ALL" ? "bg-dark text-white" : "bg-light"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("ALL")}>
                            <h5 className="mb-0 fw-bold">{bookings.length}</h5>
                            <small className={statusFilter === "ALL" ? "text-white-50" : "text-muted"}>All Bookings</small>
                        </Card>
                    </Col>
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "PENDING" ? "bg-info text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("PENDING")}>
                            <h5 className="mb-0 fw-bold">{pendingCount}</h5>
                            <small className={statusFilter === "PENDING" ? "text-white-50" : "text-muted"}>Pending</small>
                        </Card>
                    </Col>
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "UPCOMING" ? "bg-success text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("UPCOMING")}>
                            <h5 className="mb-0 fw-bold">{upcomingCount}</h5>
                            <small className={statusFilter === "UPCOMING" ? "text-white-50" : "text-muted"}>Upcoming</small>
                        </Card>
                    </Col>
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "ACTIVE" ? "bg-primary text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("ACTIVE")}>
                            <h5 className="mb-0 fw-bold">{activeCount}</h5>
                            <small className={statusFilter === "ACTIVE" ? "text-white-50" : "text-muted"}>In Use</small>
                        </Card>
                    </Col>
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "COMPLETED" ? "bg-secondary text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("COMPLETED")}>
                            <h5 className="mb-0 fw-bold">{completedCount}</h5>
                            <small className={statusFilter === "COMPLETED" ? "text-white-50" : "text-muted"}>Completed</small>
                        </Card>
                    </Col>
                    <Col md={2} sm={4}>
                        <Card className={`text-center py-3 border-0 shadow-sm ${statusFilter === "WAITING" ? "bg-warning text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("WAITING")}>
                            <h5 className="mb-0 fw-bold">{waitingCount}</h5>
                            <small className={statusFilter === "WAITING" ? "text-white-50" : "text-muted"}>Queue</small>
                        </Card>
                    </Col>
                </Row>

                <Card className="shadow border-0 mb-4">
                    <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h5 className="mb-0 fw-bold text-secondary">
                                Showing: <span className="text-primary">{statusFilter}</span> Bookings ({displayedBookings.length})
                            </h5>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button variant={statusFilter === "ALL" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("ALL")}>All</Button>
                            <Button variant={statusFilter === "PENDING" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("PENDING")}>Pending</Button>
                            <Button variant={statusFilter === "UPCOMING" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("UPCOMING")}>Upcoming</Button>
                            <Button variant={statusFilter === "ACTIVE" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("ACTIVE")}>In Use</Button>
                            <Button variant={statusFilter === "COMPLETED" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("COMPLETED")}>Completed</Button>
                            <Button variant={statusFilter === "WAITING" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("WAITING")}>Queue</Button>
                            <Button variant={statusFilter === "CANCELLED" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("CANCELLED")}>Cancelled/Other</Button>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="shadow">
                    <Card.Body>
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading your reservations...</h5>
                        ) : displayedBookings.length === 0 ? (
                            <div className="text-center py-5">
                                <FaClipboardList size={50} className="text-muted mb-3" />
                                <h5>No Bookings Match Selected Filters</h5>
                            </div>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Laboratory</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBookings.map((b) => {
                                        const queuePos = calculateQueuePosition(b, allBookingsList);
                                        return (
                                            <tr key={b.bookingId}>
                                                <td><strong>{b.equipment?.equipmentName}</strong></td>
                                                <td>{b.equipment?.laboratory?.labName}</td>
                                                <td>{b.bookingDate}</td>
                                                <td>{b.startTime} - {b.endTime}</td>
                                                <td>{b.duration ? `${b.duration.toFixed(1)} hrs` : "N/A"}</td>
                                                <td>
                                                    <Badge bg={getBadgeBg(b.status)} className="p-2">
                                                        {b.status}
                                                    </Badge>
                                                    {queuePos !== null && (
                                                        <div className="text-warning small fw-bold mt-1">
                                                            <FaClock className="me-1" /> Position in Queue: #{queuePos}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {( "Pending Approval".equalsIgnoreCase(b.status) || 
                                                       "Confirmed".equalsIgnoreCase(b.status) || 
                                                       "Approved".equalsIgnoreCase(b.status) || 
                                                       "Waitlisted".equalsIgnoreCase(b.status) ) && (
                                                         <Button
                                                             variant="outline-danger"
                                                             size="sm"
                                                             onClick={() => handleCancel(b)}
                                                         >
                                                             Cancel
                                                         </Button>
                                                     )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default MyBookings;

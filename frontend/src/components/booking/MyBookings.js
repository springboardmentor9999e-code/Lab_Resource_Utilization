import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button, Row, Col } from "react-bootstrap";
import { FaClock, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";
import ConfirmationModal from "../common/ConfirmationModal";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [allBookingsList, setAllBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Confirmation Modal States
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
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // eslint-disable-next-line no-unused-vars
    const handleCancel = async (booking) => {
        triggerConfirm("Cancel Booking Request", "Are you sure you want to cancel this booking request?", async () => {
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
        });
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

    // Unique status styling helper
    const getStatusColorStyle = (status) => {
        if (!status) return { backgroundColor: "#6c757d", color: "#fff" };
        const s = status.toUpperCase();
        if (s.includes("AVAILABLE") || s === "WORKING") {
            return { backgroundColor: "#28a745", color: "#fff" }; // Green
        }
        if (s.includes("PENDING APPROVAL") || s === "PENDING") {
            return { backgroundColor: "#fd7e14", color: "#fff" }; // Orange
        }
        if (s === "CONFIRMED" || s === "APPROVED") {
            return { backgroundColor: "#007bff", color: "#fff" }; // Blue
        }
        if (s === "BOOKED") {
            return { backgroundColor: "#6f42c1", color: "#fff" }; // Purple
        }
        if (s.includes("IN USE") || s === "ACTIVE") {
            return { backgroundColor: "#17a2b8", color: "#fff" }; // Cyan
        }
        if (s === "COMPLETED") {
            return { backgroundColor: "#1e4620", color: "#fff" }; // Dark Green
        }
        if (s === "CANCELLED" || s === "CANCELED") {
            return { backgroundColor: "#dc3545", color: "#fff" }; // Red
        }
        if (s === "REJECTED") {
            return { backgroundColor: "#8b0000", color: "#fff" }; // Dark Red
        }
        if (s === "EXPIRED") {
            return { backgroundColor: "#6c757d", color: "#fff" }; // Gray
        }
        if (s.includes("UNDER MAINTENANCE") || s === "RESOLVING") {
            return { backgroundColor: "#ffc107", color: "#000" }; // Yellow
        }
        if (s.includes("OUT OF SERVICE")) {
            return { backgroundColor: "#000000", color: "#fff" }; // Black
        }
        if (s === "RETIRED") {
            return { backgroundColor: "#8B4513", color: "#fff" }; // Brown
        }
        return { backgroundColor: "#6c757d", color: "#fff" }; // Default Gray
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

    const availableCount = bookings.filter(b => "Available".equalsIgnoreCase(b.status)).length;
    const bookedCount = bookings.filter(b => "Booked".equalsIgnoreCase(b.status) || "Confirmed".equalsIgnoreCase(b.status) || "Approved".equalsIgnoreCase(b.status)).length;
    const inUseCount = bookings.filter(b => "In Use".equalsIgnoreCase(b.status) || "Active".equalsIgnoreCase(b.status)).length;
    const underMaintCount = bookings.filter(b => "Under Maintenance".equalsIgnoreCase(b.status)).length;
    const completedCount = bookings.filter(b => "Completed".equalsIgnoreCase(b.status)).length;
    const cancelledCount = bookings.filter(b => "Cancelled".equalsIgnoreCase(b.status) || "Rejected".equalsIgnoreCase(b.status)).length;
    const expiredCount = bookings.filter(b => "Expired".equalsIgnoreCase(b.status)).length;

    const displayedBookings = bookings.filter(b => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "Available") return "Available".equalsIgnoreCase(b.status);
        if (statusFilter === "Booked") return "Booked".equalsIgnoreCase(b.status) || "Confirmed".equalsIgnoreCase(b.status) || "Approved".equalsIgnoreCase(b.status);
        if (statusFilter === "In Use") return "In Use".equalsIgnoreCase(b.status) || "Active".equalsIgnoreCase(b.status);
        if (statusFilter === "Under Maintenance") return "Under Maintenance".equalsIgnoreCase(b.status);
        if (statusFilter === "Completed") return "Completed".equalsIgnoreCase(b.status);
        if (statusFilter === "Cancelled") return "Cancelled".equalsIgnoreCase(b.status) || "Rejected".equalsIgnoreCase(b.status);
        if (statusFilter === "Expired") return "Expired".equalsIgnoreCase(b.status);
        return true;
    });

    return (
        <DashboardLayout title="My Booking Reservations">
            <Container fluid className="px-0">
                {/* Stats cards */}
                <Row className="g-2 mb-4">
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "ALL" ? "bg-dark text-white" : "bg-light"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("ALL")}>
                            <h6 className="mb-0 fw-bold">{bookings.length}</h6>
                            <small className={statusFilter === "ALL" ? "text-white-50" : "text-muted"}>All</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Available" ? "bg-success text-white" : "bg-light"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Available")}>
                            <h6 className="mb-0 fw-bold">{availableCount}</h6>
                            <small className={statusFilter === "Available" ? "text-white-50" : "text-muted"}>Available</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Booked" ? "bg-primary text-white" : "bg-light"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Booked")}>
                            <h6 className="mb-0 fw-bold">{bookedCount}</h6>
                            <small className={statusFilter === "Booked" ? "text-white-50" : "text-muted"}>Booked</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "In Use" ? "bg-info text-white" : "bg-light"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("In Use")}>
                            <h6 className="mb-0 fw-bold">{inUseCount}</h6>
                            <small className={statusFilter === "In Use" ? "text-white-50" : "text-muted"}>In Use</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Under Maintenance" ? "bg-warning text-dark" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Under Maintenance")}>
                            <h6 className="mb-0 fw-bold">{underMaintCount}</h6>
                            <small className={statusFilter === "Under Maintenance" ? "text-dark-50" : "text-muted"}>Maintenance</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Completed" ? "bg-secondary text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Completed")}>
                            <h6 className="mb-0 fw-bold">{completedCount}</h6>
                            <small className={statusFilter === "Completed" ? "text-white-50" : "text-muted"}>Completed</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Cancelled" ? "bg-danger text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Cancelled")}>
                            <h6 className="mb-0 fw-bold">{cancelledCount}</h6>
                            <small className={statusFilter === "Cancelled" ? "text-white-50" : "text-muted"}>Cancelled</small>
                        </Card>
                    </Col>
                    <Col md={1.5} className="col-6 col-md-3">
                        <Card className={`text-center py-2 border-0 shadow-sm ${statusFilter === "Expired" ? "bg-dark text-white" : "bg-light text-dark"}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter("Expired")}>
                            <h6 className="mb-0 fw-bold">{expiredCount}</h6>
                            <small className={statusFilter === "Expired" ? "text-white-50" : "text-muted"}>Expired</small>
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
                            <Button variant={statusFilter === "Available" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Available")}>Available</Button>
                            <Button variant={statusFilter === "Booked" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Booked")}>Booked</Button>
                            <Button variant={statusFilter === "In Use" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("In Use")}>In Use</Button>
                            <Button variant={statusFilter === "Under Maintenance" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Under Maintenance")}>Under Maint</Button>
                            <Button variant={statusFilter === "Completed" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Completed")}>Completed</Button>
                            <Button variant={statusFilter === "Cancelled" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Cancelled")}>Cancelled</Button>
                            <Button variant={statusFilter === "Expired" ? "primary" : "outline-primary"} size="sm" onClick={() => setStatusFilter("Expired")}>Expired</Button>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="shadow">
                    <Card.Body>
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading your reservations log...</h5>
                        ) : displayedBookings.length === 0 ? (
                            <div className="text-center py-5">
                                <FaClipboardList size={45} className="text-muted mb-3" />
                                <h5>No Bookings Match Selected Filters</h5>
                            </div>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Booking Date</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Status</th>
                                        <th>Utilization Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBookings.map((b) => {
                                        const queuePos = calculateQueuePosition(b, allBookingsList);
                                        return (
                                            <tr key={b.bookingId}>
                                                <td><strong>{b.equipment?.equipmentName}</strong></td>
                                                <td>{b.bookingDate}</td>
                                                <td>{b.startTime}</td>
                                                <td>{b.endTime}</td>
                                                <td>
                                                    <Badge style={getStatusColorStyle(b.status)} className="p-2">
                                                        {b.status}
                                                    </Badge>
                                                    {queuePos !== null && (
                                                        <div className="text-warning small fw-bold mt-1">
                                                            <FaClock className="me-1" /> Position in Queue: #{queuePos}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="fw-semibold text-success">
                                                    ₹{(b.utilizationCost || 0).toFixed(2)}
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

            {/* Reusable Professional Confirmation Modal */}
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

export default MyBookings;

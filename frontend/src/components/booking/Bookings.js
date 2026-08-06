import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button, Row, Col } from "react-bootstrap";
import { FaCheck, FaTimes, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";
import ConfirmationModal from "../common/ConfirmationModal";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [institutionsMap, setInstitutionsMap] = useState({});
    const role = localStorage.getItem("role");

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

    const loadBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            // Fetch user profile first to get department/institution filters
            const profileRes = await axios.get("http://localhost:8080/api/profile", { headers });
            const userProfile = profileRes.data;

            // Fetch institutions list to build names map
            const instRes = await axios.get("http://localhost:8080/api/institutions", { headers });
            const insts = {};
            instRes.data.forEach(inst => {
                insts[inst.institutionId] = inst.institutionName;
            });
            setInstitutionsMap(insts);

            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", { headers });
            let data = bookingsRes.data;

            // Filter bookings based on user role and department/institution
            if (role === "DEPARTMENT_HEAD" && userProfile.departmentId) {
                data = data.filter(b => b.equipment?.laboratory?.department?.departmentId === Long(userProfile.departmentId));
            } else if (role === "INSTITUTION_ADMIN" && userProfile.institutionId) {
                data = data.filter(b => b.equipment?.laboratory?.department?.institution?.institutionId === Long(userProfile.institutionId));
            } else if (role === "LAB_MANAGER" && userProfile.departmentId) {
                // Lab managers see bookings for their department
                data = data.filter(b => b.equipment?.laboratory?.department?.departmentId === Long(userProfile.departmentId));
            } else if (role === "LAB_TECHNICIAN" && userProfile.departmentId) {
                // Lab technicians see bookings for their department
                data = data.filter(b => b.equipment?.laboratory?.department?.departmentId === Long(userProfile.departmentId));
            }

            setBookings(data);
        } catch (error) {
            console.error("Error loading bookings log:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to safely convert and match numeric IDs
    const Long = (val) => {
        if (!val) return null;
        return typeof val === 'string' ? parseInt(val, 10) : val;
    };

    useEffect(() => {
        loadBookings();
        const intervalId = setInterval(loadBookings, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleAction = async (booking, action) => {
        triggerConfirm("Confirm Booking Status Action", `Are you sure you want to transition this booking to "${action}"?`, async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const updatedBooking = { ...booking, status: action };
                
                await axios.put(`http://localhost:8080/api/bookings/${booking.bookingId}`, updatedBooking, { headers });
                alert(`Booking successfully marked as ${action}`);
                loadBookings();
            } catch (error) {
                console.error("Error updating booking status", error);
                alert(error.response?.data?.message || "Failed to update status.");
            }
        });
    };

    const isAuthority = ["LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);

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
        <DashboardLayout title="Platform Reservation Workspace">
            <Container fluid className="px-0">
                {/* Stats row */}
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
                            <h5 className="text-center text-muted py-5">Loading reservations log...</h5>
                        ) : displayedBookings.length === 0 ? (
                            <div className="text-center py-5">
                                <FaClipboardList size={45} className="text-muted mb-3" />
                                <h5>No Bookings Match Selected Filters</h5>
                            </div>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Requestor</th>
                                        <th>Equipment</th>
                                        <th>Institution</th>
                                        <th>Laboratory</th>
                                        <th>Date & Slot</th>
                                        <th>Duration</th>
                                        <th>Utilization Cost</th>
                                        <th>Status</th>
                                        {isAuthority && <th className="text-center">Approval Workflow Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBookings.map((b) => (
                                        <tr key={b.bookingId}>
                                            <td>
                                                <strong className="text-dark">{b.user?.fullName}</strong>
                                                <br />
                                                <span className="text-muted small">{b.user?.email}</span>
                                            </td>
                                            <td><strong>{b.equipment?.equipmentName}</strong></td>
                                            <td>
                                                <Badge bg="secondary" text="light">
                                                    {b.equipment?.laboratory?.department?.institution?.institutionName || "N/A"}
                                                </Badge>
                                            </td>
                                            <td>{b.equipment?.laboratory?.labName}</td>
                                            <td>
                                                {b.bookingDate}
                                                <br />
                                                <small className="text-muted">{b.startTime} - {b.endTime}</small>
                                            </td>
                                            <td>{b.duration ? `${b.duration.toFixed(1)} hrs` : "N/A"}</td>
                                            <td className="fw-semibold text-success">
                                                ₹{(b.utilizationCost || 0).toFixed(2)}
                                            </td>
                                            <td>
                                                <Badge style={getStatusColorStyle(b.status)} className="p-2">
                                                    {b.status}
                                                </Badge>
                                            </td>
                                            {isAuthority && (
                                                <td className="text-center">
                                                    {("Pending Approval".equalsIgnoreCase(b.status) || "Pending".equalsIgnoreCase(b.status) || "Waitlisted".equalsIgnoreCase(b.status)) ? (
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleAction(b, b.status === "Pending" ? "Approved" : "Confirmed")}
                                                            >
                                                                <FaCheck className="me-1" /> Confirm
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleAction(b, b.status === "Pending" ? "Rejected" : "Cancelled")}
                                                            >
                                                                <FaTimes className="me-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    ) : ("Confirmed".equalsIgnoreCase(b.status) || "Approved".equalsIgnoreCase(b.status) || "Booked".equalsIgnoreCase(b.status)) ? (
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleAction(b, b.status === "Approved" ? "Active" : "In Use")}
                                                            >
                                                                Mark In Use
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleAction(b, "Cancelled")}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : ("In Use".equalsIgnoreCase(b.status) || "Active".equalsIgnoreCase(b.status)) ? (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleAction(b, "Completed")}
                                                        >
                                                            Mark Completed
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted small">{b.status}</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
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

export default Bookings;

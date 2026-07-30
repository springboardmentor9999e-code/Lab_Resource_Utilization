import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button } from "react-bootstrap";
import { FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    const loadBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get("http://localhost:8080/api/bookings", { headers });
            // Show pending items first, then waitlisted, then approved/rejected
            const sorted = response.data.sort((a, b) => {
                if (a.status === "Pending Approval" && b.status !== "Pending Approval") return -1;
                if (a.status !== "Pending Approval" && b.status === "Pending Approval") return 1;
                return b.bookingId - a.bookingId;
            });
            setBookings(sorted);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleAction = async (booking, action) => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const updatedBooking = { ...booking, status: action };
            
            await axios.put(`http://localhost:8080/api/bookings/${booking.bookingId}`, updatedBooking, { headers });
            alert(`Booking successfully ${action}`);
            loadBookings();
        } catch (error) {
            console.error("Error updating booking status", error);
            alert("Failed to update status.");
        }
    };

    const isAuthority = ["LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN", "DEPARTMENT_HEAD"].includes(role);

    const getBadgeBg = (status) => {
        if ("Approved".equalsIgnoreCase(status)) return "success";
        if ("Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) return "info";
        if ("Waitlisted".equalsIgnoreCase(status)) return "warning";
        return "danger";
    };

    return (
        <DashboardLayout title="Platform Reservation Workspace">
            <Container fluid className="px-0">
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            Monitor and approve equipment reservations. Higher authorities can grant access or cancel requests to promote waitlisted items.
                        </p>
                    </Card.Body>
                </Card>

                <Card className="shadow">
                    <Card.Body>
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading reservations log...</h5>
                        ) : bookings.length === 0 ? (
                            <h5 className="text-center text-muted py-5">No bookings logged in the system.</h5>
                        ) : (
                            <Table striped hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Equipment</th>
                                        <th>Laboratory</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Purpose</th>
                                        <th>Status</th>
                                        {isAuthority && <th className="text-center">Approval Decisions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.bookingId}>
                                            <td>
                                                <strong>{b.user?.fullName}</strong>
                                                <br />
                                                <small className="text-muted">{b.user?.email} ({b.user?.role?.roleName})</small>
                                            </td>
                                            <td><strong>{b.equipment?.equipmentName}</strong></td>
                                            <td>{b.equipment?.laboratory?.labName}</td>
                                            <td>{b.bookingDate}</td>
                                            <td>{b.startTime} - {b.endTime}</td>
                                            <td>{b.purpose || "N/A"}</td>
                                            <td>
                                                <Badge bg={getBadgeBg(b.status)} className="p-2">
                                                    {b.status}
                                                </Badge>
                                            </td>
                                            {isAuthority && (
                                                <td className="text-center">
                                                    {("Pending Approval".equalsIgnoreCase(b.status) || "Waitlisted".equalsIgnoreCase(b.status)) ? (
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleAction(b, "Approved")}
                                                            >
                                                                <FaCheck className="me-1" /> Approve
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleAction(b, "Rejected")}
                                                            >
                                                                <FaTimes className="me-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">Decided</span>
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

import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button } from "react-bootstrap";
import { FaCalendarTimes, FaClock } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [allBookingsList, setAllBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking request?")) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`, { headers });
            alert("Booking cancelled successfully.");
            loadData();
        } catch (error) {
            console.error("Error deleting booking", error);
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
        if ("Approved".equalsIgnoreCase(status)) return "success";
        if ("Pending Approval".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) return "info";
        if ("Waitlisted".equalsIgnoreCase(status)) return "warning";
        return "danger";
    };

    return (
        <DashboardLayout title="My Booking Reservations">
            <Container fluid className="px-0">
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            Track the status of your reservation requests. If your booking is waitlisted, you will automatically be promoted to "Pending Approval" once the occupying slots expire or are cancelled.
                        </p>
                    </Card.Body>
                </Card>

                <Card className="shadow">
                    <Card.Body>
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading your reservations...</h5>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-5">
                                <FaCalendarTimes size={50} className="text-muted mb-3" />
                                <h5>No Bookings Found</h5>
                                <p className="text-muted small">You haven't requested any equipment reservations yet.</p>
                            </div>
                        ) : (
                            <Table striped hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Laboratory</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Purpose</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => {
                                        const queuePos = calculateQueuePosition(b, allBookingsList);
                                        return (
                                            <tr key={b.bookingId}>
                                                <td><strong>{b.equipment?.equipmentName}</strong></td>
                                                <td>{b.equipment?.laboratory?.labName}</td>
                                                <td>{b.bookingDate}</td>
                                                <td>{b.startTime} - {b.endTime}</td>
                                                <td>{b.purpose || "N/A"}</td>
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
                                                    {("Pending Approval".equalsIgnoreCase(b.status) || "Waitlisted".equalsIgnoreCase(b.status)) && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleCancel(b.bookingId)}
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

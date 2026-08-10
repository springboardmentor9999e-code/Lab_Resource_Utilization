import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/bookingApproval.css";

function BookingApproval() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/bookings"
            );

            setBookings(response.data || []);
        } catch (error) {
            console.error("Error loading bookings:", error);
        }
    };

    const approveBooking = async (id) => {
        try {
            await axios.put(
                `http://localhost:8080/api/bookings/${id}/approve`
            );

            alert("Booking Approved");

            loadBookings();
        } catch (error) {
            console.error(error);
            alert("Approval Failed");
        }
    };

    const rejectBooking = async (id) => {
        try {
            await axios.put(
                `http://localhost:8080/api/bookings/${id}/cancel`
            );

            alert("Booking Rejected");

            loadBookings();
        } catch (error) {
            console.error(error);
            alert("Operation Failed");
        }
    };

    return (
        <div className="approval-container">

            <h2>Booking Approval</h2>

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Equipment</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                </thead>

                <tbody>
                {bookings.map((booking) => (
                    <tr key={booking.id}>

                        <td>{booking.id}</td>

                        <td>{booking.userId}</td>

                        <td>{booking.equipmentId}</td>

                        <td>{booking.bookingDate}</td>

                        <td>{booking.startTime}</td>

                        <td>{booking.endTime}</td>

                        <td>{booking.status}</td>

                        <td>
                            {booking.status === "PENDING" ? (
                                <>
                                    <button
                                        className="approve-btn"
                                        onClick={() =>
                                            approveBooking(booking.id)
                                        }
                                    >
                                        Approve
                                    </button>

                                    <button
                                        className="reject-btn"
                                        onClick={() =>
                                            rejectBooking(booking.id)
                                        }
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : (
                                booking.status
                            )}
                        </td>

                    </tr>
                ))}
                </tbody>
            </table>

        </div>
    );
}

export default BookingApproval;
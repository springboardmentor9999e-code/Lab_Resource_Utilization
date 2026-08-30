import React from "react";

function BookingPage({
                         styles,
                         bookingList,
                         bookedBy,
                         setBookedBy,
                         bookingDate,
                         setBookingDate,
                         startTime,
                         setStartTime,
                         endTime,
                         setEndTime,
                         purpose,
                         setPurpose,
                         bookingStatus,
                         setBookingStatus,
                         equipmentList,
                         selectedEquipmentId,
                         setSelectedEquipmentId,
                         editingBookingId,
                         saveBooking,
                         editBooking,
                         deleteBooking
                     }) {
    return (
        <div>
            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>Bookings</h1>
                <p style={styles.pageSubtitle}>Manage equipment reservations and approvals</p>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                    {editingBookingId ? "Edit Booking" : "Create New Booking"}
                </h3>
                <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Booked By</label>
                        <input
                            type="text"
                            placeholder="Booked By"
                            value={bookedBy}
                            onChange={(e) => setBookedBy(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Booking Date</label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Purpose</label>
                        <input
                            type="text"
                            placeholder="Purpose"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Status</label>
                        <select
                            value={bookingStatus}
                            onChange={(e) => setBookingStatus(e.target.value)}
                            style={styles.select}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Select Equipment</label>
                        <select
                            value={selectedEquipmentId}
                            onChange={(e) => setSelectedEquipmentId(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">Select Equipment</option>
                            {equipmentList.map((equipment) => (
                                <option key={equipment.id} value={equipment.id}>
                                    {equipment.equipmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={saveBooking} style={styles.primaryButton}>
                    {editingBookingId ? "Update Booking" : "Book Equipment"}
                </button>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Bookings Schedule</h3>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Booked By</th>
                            <th style={styles.th}>Equipment</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Purpose</th>
                            <th style={styles.th}>Status</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookingList.map((booking) => (
                            <tr key={booking.id}>
                                <td style={styles.td}>{booking.id}</td>
                                <td style={styles.td}>{booking.bookedBy}</td>
                                <td style={styles.td}>{booking.equipment?.equipmentName}</td>
                                <td style={styles.td}>{booking.bookingDate}</td>
                                <td style={styles.td}>{booking.startTime} - {booking.endTime}</td>
                                <td style={styles.td}>{booking.purpose}</td>
                                <td style={styles.td}>{booking.status}</td>
                                <td style={{ ...styles.td, textAlign: "right" }}>
                                    <button
                                        onClick={() => editBooking(booking)}
                                        style={styles.actionButtonEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteBooking(booking.id)}
                                        style={styles.actionButtonDelete}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BookingPage;
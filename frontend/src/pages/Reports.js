import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Reports() {

    const [equipmentList, setEquipmentList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [calibrationList, setCalibrationList] = useState([]);
    const [maintenanceList, setMaintenanceList] = useState([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {

        try {

            const equipmentRes = await api.get("/equipment");
            const bookingRes = await api.get("/booking");
            const calibrationRes = await api.get("/calibration");
            const maintenanceRes = await api.get("/maintenance");

            setEquipmentList(equipmentRes.data);
            setBookingList(bookingRes.data);
            setCalibrationList(calibrationRes.data);
            setMaintenanceList(maintenanceRes.data);

        } catch (error) {

            console.log("Reports API Error:", error);

        }

    };


    const completedBookings = bookingList.filter(
        booking => booking.status === "COMPLETED"
    );

    const pendingBookings = bookingList.filter(
        booking => booking.status === "PENDING"
    );

    const approvedBookings = bookingList.filter(
        booking => booking.status === "APPROVED"
    );

    const expiredCalibrations = calibrationList.filter(
        calibration => calibration.status === "EXPIRED"
    );

    const expiringCalibrations = calibrationList.filter(
        calibration => calibration.status === "EXPIRING_SOON"
    );


    const totalRevenue = completedBookings.reduce(
        (sum, booking) =>
            sum + (Number(booking.totalCost) || 0),
        0
    );


    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>Reports</h1>

                <hr />

                <h2>Lab Resource Summary</h2>


                {/* Summary Cards */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, 1fr)",
                        gap: "20px",
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <div style={cardStyle}>
                        <h3>Total Equipment</h3>
                        <p style={numberStyle}>
                            {equipmentList.length}
                        </p>
                    </div>


                    <div style={cardStyle}>
                        <h3>Total Bookings</h3>
                        <p style={numberStyle}>
                            {bookingList.length}
                        </p>
                    </div>


                    <div style={cardStyle}>
                        <h3>Completed Bookings</h3>
                        <p style={numberStyle}>
                            {completedBookings.length}
                        </p>
                    </div>


                    <div style={cardStyle}>
                        <h3>Total Revenue</h3>
                        <p style={numberStyle}>
                            ₹{totalRevenue}
                        </p>
                    </div>

                </div>


                {/* Booking Summary */}

                <div style={sectionStyle}>

                    <h2>Booking Summary</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>Status</th>

                                <th>Number of Bookings</th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>
                                <td>PENDING</td>
                                <td>{pendingBookings.length}</td>
                            </tr>

                            <tr>
                                <td>APPROVED</td>
                                <td>{approvedBookings.length}</td>
                            </tr>

                            <tr>
                                <td>COMPLETED</td>
                                <td>{completedBookings.length}</td>
                            </tr>

                        </tbody>

                    </table>

                </div>


                {/* Equipment Report */}

                <div style={sectionStyle}>

                    <h2>Equipment Report</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Equipment</th>

                                <th>Cost / Hour</th>

                            </tr>

                        </thead>

                        <tbody>

                            {equipmentList.map((equipment) => (

                                <tr key={equipment.equipmentId}>

                                    <td>
                                        {equipment.equipmentId}
                                    </td>

                                    <td>
                                        {equipment.equipmentName}
                                    </td>

                                    <td>
                                        ₹{equipment.costPerHour || 0}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>


                {/* Calibration Report */}

                <div style={sectionStyle}>

                    <h2>Calibration & Certification Report</h2>

                    <p>
                        Total Records:
                        <b> {calibrationList.length}</b>
                    </p>

                    <p>
                        Valid:
                        <b>
                            {" "}
                            {
                                calibrationList.filter(
                                    item => item.status === "VALID"
                                ).length
                            }
                        </b>
                    </p>

                    <p>
                        Expiring Soon:
                        <b>
                            {" "}
                            {expiringCalibrations.length}
                        </b>
                    </p>

                    <p>
                        Expired:
                        <b>
                            {" "}
                            {expiredCalibrations.length}
                        </b>
                    </p>

                </div>


                {/* Maintenance Report */}

                <div style={sectionStyle}>

                    <h2>Maintenance Report</h2>

                    <p>
                        Total Maintenance Records:
                        <b> {maintenanceList.length}</b>
                    </p>

                </div>


                {/* Completed Booking Details */}

                <div style={sectionStyle}>

                    <h2>Completed Booking Details</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>Booking ID</th>

                                <th>Equipment ID</th>

                                <th>Start Time</th>

                                <th>End Time</th>

                                <th>Total Cost</th>

                            </tr>

                        </thead>

                        <tbody>

                            {completedBookings.map((booking) => (

                                <tr key={booking.bookingId}>

                                    <td>
                                        {booking.bookingId}
                                    </td>

                                    <td>
                                        {booking.equipmentId}
                                    </td>

                                    <td>
                                        {booking.startTime}
                                    </td>

                                    <td>
                                        {booking.endTime}
                                    </td>

                                    <td>
                                        ₹{booking.totalCost || 0}
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


const cardStyle = {

    border: "1px solid #ccc",

    borderRadius: "10px",

    padding: "20px",

    textAlign: "center",

    backgroundColor: "#f8fafc"

};


const numberStyle = {

    fontSize: "30px",

    fontWeight: "bold",

    margin: "10px 0"

};


const sectionStyle = {

    border: "1px solid #ccc",

    borderRadius: "10px",

    padding: "20px",

    marginBottom: "25px"

};


export default Reports;
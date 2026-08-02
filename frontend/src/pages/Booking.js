import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Booking() {
    const role = localStorage.getItem("role");
    const [bookingList, setBookingList] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [userList, setUserList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);

    const [booking, setBooking] = useState({
        bookingId: "",
        equipmentId: "",
        startTime: "",
        endTime: "",
        status: "PENDING"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

    try {

        const bookingRes = await api.get("/booking");
        const equipmentRes = await api.get("/equipment");
        const userRes = await api.get("/user");

        console.log("Equipment Response:", equipmentRes.data);

        setBookingList(bookingRes.data);
        setEquipmentList(equipmentRes.data);
        setUserList(userRes.data);

    } catch (error) {
        console.log(error);
    }

};

    const handleChange = (e) => {

        setBooking({
            ...booking,
            [e.target.name]: e.target.value
        });

    };

    const clearForm = () => {

        setBooking({
            bookingId: "",
            userId: "",
            equipmentId: "",
            startTime: "",
            endTime: "",
            status: "PENDING"
        });

        setEditing(false);

    };

    const saveBooking = async () => {

        try {

            if (editing) {

                await api.put(
                    `/booking/${booking.bookingId}`,
                    booking
                );

            } 
            else {

    const response = await api.get(
        `/booking/available/${booking.equipmentId}`
    );

    if (response.data) {

        // Equipment is available

        await api.post("/booking", {
            ...booking,
            status: "PENDING"
        });

    } else {

        // Equipment already booked

        const joinWaitlist = window.confirm(
            "This equipment is currently in use.\n\nDo you want to join the waiting list?"
        );

        if (joinWaitlist) {

            await api.post("/booking", {
                ...booking,
                status: "WAITLISTED"
            });

            alert("Successfully joined the waiting list.");

        }

    }

}

            fetchData();
            clearForm();
            setShowForm(false);

        } catch (error) {

            console.log(error);

        }

    };
const editBooking = (item) => {

    console.log("Edit clicked");

    setBooking({
        bookingId: item.bookingId,
        userId: item.userId,
        equipmentId: item.equipmentId,
        startTime: item.startTime
            ? item.startTime.substring(0,16)
            : "",
        endTime: item.endTime
            ? item.endTime.substring(0,16)
            : "",
        status: item.status
    });

    setEditing(true);
    setShowForm(true);
};

    const deleteBooking = async (id) => {

        if (!window.confirm("Delete this booking?"))
            return;

        await api.delete(`/booking/${id}`);

        fetchData();

    };
        return (
        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ flex: 1, padding: "30px" }}>

                <h1>Booking Management</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <h2>Booking List</h2>

                   {role === "RESEARCHER" && (
    <button
        onClick={() => {
            clearForm();
            setShowForm(true);
        }}
    >
        + Add Booking
    </button>
)}

                </div>

                {showForm && (

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            borderRadius: "10px",
                            marginBottom: "20px"
                        }}
                    >

                        <h3>
                            {editing ? "Edit Booking" : "Add Booking"}
                        </h3>
                      {role === "RESEARCHER" && (
    <>
        <select
            name="equipmentId"
            value={booking.equipmentId}
            onChange={handleChange}
        >
            <option value="">
                Select Equipment
            </option>

            {equipmentList.map((equipment) => (
                <option
                    key={equipment.equipmentId}
                    value={equipment.equipmentId}
                >
                    {equipment.equipmentName}
                </option>
            ))}
        </select>

        <br /><br />

        <label>Start Time</label>
        <br />

        <input
            type="datetime-local"
            name="startTime"
            value={booking.startTime}
            onChange={handleChange}
        />

        <br /><br />

        <label>End Time</label>
        <br />

        <input
            type="datetime-local"
            name="endTime"
            value={booking.endTime}
            onChange={handleChange}
        />

        <br /><br />
    </>
)}

                        
                        {role === "SYSTEM_ADMIN" && (

    <select
        name="status"
        value={booking.status}
        onChange={handleChange}
    >
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="COMPLETED">COMPLETED</option>
    </select>

)}

                        <br /><br />

                
                        <button onClick={saveBooking}>
                            {editing
                                ? "Update Booking"
                                : "Book Equipment"}
                        </button>
                    </div>

                )}

                <table border="1" cellPadding="10" width="100%">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Equipment</th>
                            <th>User</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Status</th>
                             {role === "SYSTEM_ADMIN" && (
            <th>Action</th>
        )}
                        </tr>

                    </thead>

                    <tbody>
                                                {bookingList.map((item) => (

                            <tr key={item.bookingId}>

                                <td>{item.bookingId}</td>

                                <td>
                                    {
                                        equipmentList.find(
                                            e => e.equipmentId === item.equipmentId
                                        )?.equipmentName || "-"
                                    }
                                </td>

                                <td>
                                    {
                                        userList.find(
                                            u => u.userId === item.userId
                                        )?.fullName || "-"
                                    }
                                </td>

                                <td>{item.startTime}</td>

                                <td>{item.endTime}</td>

                                <td>

                                    <span
                                        style={{
                                            backgroundColor:
                                                item.status?.toUpperCase() === "APPROVED"
                                                    ? "green"
                                                    : item.status?.toUpperCase() === "PENDING"
                                                    ? "orange"
                                                    : item.status?.toUpperCase() === "RETURNED"
                                                    ? "blue"
                                                    : item.status?.toUpperCase() === "REJECTED"
                                                    ? "red"
                                                    : "gray",
                                            color: "white",
                                            padding: "5px 10px",
                                            borderRadius: "8px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {item.status}
                                    </span>

                                </td>


                                    {role === "SYSTEM_ADMIN" && (
    <td>
        <button
    onClick={() => {
        console.log("Button Clicked");
        editBooking(item);
    }}
>
    Edit
</button>

        <button onClick={() => deleteBooking(item.bookingId)}>
            Delete
        </button>
    </td>
)}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Booking;
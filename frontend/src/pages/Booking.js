import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Booking() {

    const role =
        localStorage.getItem("role");

    const [bookingList, setBookingList] =
        useState([]);

    const [equipmentList, setEquipmentList] =
        useState([]);

    const [userList, setUserList] =
        useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editing, setEditing] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const [booking, setBooking] = useState({

        bookingId: "",
        userId:"",
        equipmentId: "",
        startTime: "",
        endTime: "",
        status: "PENDING"

    });


    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {

        fetchData();

    }, []);


    const fetchData = async () => {

        setLoading(true);
        setError("");

        try {

            // ----------------------------------------------------
            // BOOKING IS THE MAIN REQUEST
            // ----------------------------------------------------

            const bookingRes =
                await api.get("/booking");

            setBookingList(
                Array.isArray(bookingRes.data)
                    ? bookingRes.data
                    : []
            );


            // ----------------------------------------------------
            // EQUIPMENT
            // ----------------------------------------------------

            try {

                const equipmentRes =
                    await api.get("/equipment");

                setEquipmentList(
                    Array.isArray(equipmentRes.data)
                        ? equipmentRes.data
                        : []
                );

            } catch (equipmentError) {

                console.error(
                    "Equipment loading failed:",
                    equipmentError
                );

                setEquipmentList([]);
            }


            // ----------------------------------------------------
            // USERS
            //
            // User loading failure should NOT hide bookings.
            // ----------------------------------------------------

            try {

                const userRes =
                    await api.get("/user");

                setUserList(
                    Array.isArray(userRes.data)
                        ? userRes.data
                        : []
                );

            } catch (userError) {

                console.warn(
                    "User list could not be loaded:",
                    userError
                );

                setUserList([]);
            }


        } catch (error) {

            console.error(
                "Booking loading error:",
                error
            );


            const status =
                error.response?.status;

            const message =
                error.response?.data;


            if (status === 403) {

                setError(
                    "Access denied. Your login role does not have permission to view bookings."
                );

            } else if (status === 401) {

                setError(
                    "Your login session has expired. Please login again."
                );

            } else if (message) {

                setError(
                    typeof message === "string"
                        ? message
                        : "Unable to load booking data."
                );

            } else {

                setError(
                    "Unable to load booking data."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        setBooking({

            ...booking,

            [e.target.name]:
                e.target.value

        });
    };


    // ============================================================
    // CLEAR FORM
    // ============================================================

    const clearForm = () => {

        setBooking({

            bookingId: "",
            equipmentId: "",
            startTime: "",
            endTime: "",
            status: "PENDING"

        });

        setEditing(false);
    };


    // ============================================================
    // SAVE BOOKING
    // ============================================================

    const saveBooking = async () => {

        try {

            // ----------------------------------------------------
            // EDIT
            // ----------------------------------------------------

            if (editing) {

    const bookingId = booking.bookingId;
    const newStatus = booking.status;

    try {

        const response = await api.put(
            `/booking/${bookingId}/status?status=${newStatus}`
        );

        console.log("Status update response:", response.data);

        // Update UI using the status selected in the dropdown
        setBookingList(prevList =>
            prevList.map(item =>
                Number(item.bookingId) === Number(bookingId)
                    ? {
                        ...item,
                        status: newStatus
                    }
                    : item
            )
        );

        alert(
            `Booking status changed to ${newStatus} successfully.`
        );

        // Close edit form
        clearForm();
        setShowForm(false);

        // IMPORTANT:
        // Do not call fetchData() here.
        return;

    } catch (error) {

        console.error(
            "Booking status update error:",
            error
        );

        alert(
            error.response?.data ||
            "Failed to update booking status."
        );

        return;
    }
}
            // ----------------------------------------------------
            // NEW BOOKING
            // ----------------------------------------------------

            else {

                if (!booking.equipmentId) {

                    alert(
                        "Please select equipment."
                    );

                    return;
                }


                if (!booking.startTime) {

                    alert(
                        "Please select start time."
                    );

                    return;
                }


                if (!booking.endTime) {

                    alert(
                        "Please select end time."
                    );

                    return;
                }


                // ------------------------------------------------
                // Check availability
                // ------------------------------------------------

                const response =
                    await api.get(

                        `/booking/available/${booking.equipmentId}`

                    );


                if (response.data === true) {

                    // --------------------------------------------
                    // Equipment available
                    // --------------------------------------------

                    await api.post(

                        "/booking",

                        {

                            equipmentId:
                                Number(
                                    booking.equipmentId
                                ),

                            startTime:
                                booking.startTime,

                            endTime:
                                booking.endTime,

                            status:
                                "PENDING"

                        }

                    );


                    alert(
                        "Booking request submitted successfully."
                    );

                } else {

                    // --------------------------------------------
                    // Equipment unavailable
                    // --------------------------------------------

                    const joinWaitlist =
                        window.confirm(

                            "This equipment is currently unavailable.\n\n"
                            + "Do you want to join the waiting list?"

                        );


                    if (joinWaitlist) {

                        await api.post(

                            "/booking",

                            {

                                equipmentId:
                                    Number(
                                        booking.equipmentId
                                    ),

                                startTime:
                                    booking.startTime,

                                endTime:
                                    booking.endTime,

                                status:
                                    "WAITLISTED"

                            }

                        );


                        alert(
                            "Successfully joined the waiting list."
                        );

                    } else {

                        return;
                    }
                }
            }


            clearForm();

            setShowForm(false);

            await fetchData();


        } catch (error) {

            console.error(
                "Save booking error:",
                error
            );


            alert(

                error.response?.data ||
                "Failed to save booking."

            );
        }
    };


    // ============================================================
    // EDIT BOOKING
    // ============================================================

    const editBooking = (item) => {

        setBooking({

            bookingId:
                item.bookingId,

            equipmentId:
                item.equipmentId,

            startTime:
                item.startTime
                    ? item.startTime.substring(0, 16)
                    : "",

            endTime:
                item.endTime
                    ? item.endTime.substring(0, 16)
                    : "",

            status:
                item.status

        });


        setEditing(true);

        setShowForm(true);
    };


    // ============================================================
    // UPDATE STATUS
    // ============================================================
const updateBookingStatus = async (id, status) => {

    try {

        const response = await api.put(
            `/booking/${id}/status?status=${status}`
        );

        console.log(
            "Updated booking:",
            response.data
        );

        setBookingList(prevList =>
            prevList.map(item =>
                Number(item.bookingId) === Number(id)
                    ? {
                        ...item,
                        status: status
                    }
                    : item
            )
        );

        alert(
            `Booking ${status.toLowerCase()} successfully.`
        );

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            error.response?.data ||
            "Failed to update booking status."
        );
    }
};
    // ============================================================
    // DELETE BOOKING
    // ============================================================

    const deleteBooking =
        async (id) => {

            if (
                !window.confirm(
                    "Delete this booking?"
                )
            ) {

                return;
            }


            try {

                await api.delete(
                    `/booking/${id}`
                );


                alert(
                    "Booking deleted successfully."
                );


                await fetchData();


            } catch (error) {

                console.error(
                    "Delete booking error:",
                    error
                );


                alert(

                    error.response?.data ||
                    "Failed to delete booking."

                );
            }
        };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDateTime =
        (dateTime) => {

            if (!dateTime) {
                return "-";
            }


            try {

                return new Date(
                    dateTime
                ).toLocaleString();

            } catch {

                return dateTime;
            }
        };


    // ============================================================
    // GET EQUIPMENT NAME
    // ============================================================

    const getEquipmentName =
        (equipmentId) => {

            const equipment =
                equipmentList.find(

                    e =>
                        Number(
                            e.equipmentId
                        ) === Number(
                            equipmentId
                        )

                );


            return equipment
                ?.equipmentName || "-";
        };


    // ============================================================
    // GET USER NAME
    // ============================================================

    const getUserName =
        (userId) => {

            const user =
                userList.find(

                    u =>
                        Number(
                            u.userId
                        ) === Number(
                            userId
                        )

                );


            return user
                ?.fullName || `User #${userId}`;
        };


    // ============================================================
    // STATUS STYLE
    // ============================================================

    const getStatusStyle =
        (status) => {

            const value =
                status?.toUpperCase();


            let backgroundColor =
                "gray";


            if (value === "APPROVED") {

                backgroundColor =
                    "green";

            } else if (
                value === "PENDING"
            ) {

                backgroundColor =
                    "orange";

            } else if (
                value === "REJECTED"
            ) {

                backgroundColor =
                    "red";

            } else if (
                value === "WAITLISTED"
            ) {

                backgroundColor =
                    "purple";

            } else if (
                value === "COMPLETED"
            ) {

                backgroundColor =
                    "blue";
            }


            return {

                backgroundColor:
                    backgroundColor,

                color: "white",

                padding: "5px 10px",

                borderRadius: "8px",

                fontWeight: "bold",

                display: "inline-block"

            };
        };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                style={{
                    display: "flex"
                }}
            >

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h1>
                        Booking Management
                    </h1>

                    <hr />

                    <p>
                        Loading booking data...
                    </p>

                </div>

            </div>

        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div
            style={{
                display: "flex"
            }}
        >

            <Sidebar />


            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>
                    Booking Management
                </h1>

                <hr />


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            backgroundColor: "#fee2e2",
                            border: "1px solid #ef4444",
                            color: "#b91c1c",
                            padding: "15px",
                            borderRadius: "6px",
                            marginBottom: "20px"
                        }}
                    >

                        <strong>
                            Error:
                        </strong>

                        <br />

                        {error}

                    </div>

                )}


                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >

                    <h2>
                        Booking List
                    </h2>


                    {/* ---------------------------------------------
                        RESEARCHER
                    --------------------------------------------- */}

                    {role === "RESEARCHER" && (

                        <button

                            onClick={() => {

                                clearForm();

                                setShowForm(true);

                            }}

                            style={{
                                padding: "10px 15px",
                                cursor: "pointer"
                            }}

                        >

                            + Add Booking

                        </button>

                    )}

                </div>


                {/* =================================================
                    BOOKING FORM
                ================================================= */}

                {showForm && (

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            backgroundColor: "#f8fafc"
                        }}
                    >

                        <h3>

                            {editing
                                ? "Edit Booking"
                                : "Add Booking"}

                        </h3>


                        {/* -----------------------------------------
                            EQUIPMENT
                        ----------------------------------------- */}

                        {role === "RESEARCHER" && (

                            <>

                                <label>
                                    Equipment
                                </label>

                                <br />

                                <select

                                    name="equipmentId"

                                    value={
                                        booking.equipmentId
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    style={{
                                        padding: "8px",
                                        minWidth: "300px"
                                    }}

                                >

                                    <option value="">

                                        Select Equipment

                                    </option>


                                    {equipmentList.map(
                                        (equipment) => (

                                            <option

                                                key={
                                                    equipment.equipmentId
                                                }

                                                value={
                                                    equipment.equipmentId
                                                }

                                            >

                                                {
                                                    equipment.equipmentName
                                                }

                                                {" - "}

                                                {
                                                    equipment.institutionName ||
                                                    "Institution"
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                <br />
                                <br />


                                <label>
                                    Start Time
                                </label>

                                <br />

                                <input

                                    type="datetime-local"

                                    name="startTime"

                                    value={
                                        booking.startTime
                                    }

                                    onChange={
                                        handleChange
                                    }

                                />


                                <br />
                                <br />


                                <label>
                                    End Time
                                </label>

                                <br />

                                <input

                                    type="datetime-local"

                                    name="endTime"

                                    value={
                                        booking.endTime
                                    }

                                    onChange={
                                        handleChange
                                    }

                                />


                                <br />
                                <br />

                            </>

                        )}


                        {/* -----------------------------------------
                            SYSTEM ADMIN STATUS
                        ----------------------------------------- */}

                        {role === "SYSTEM_ADMIN" && (

                            <>

                                <label>
                                    Status
                                </label>

                                <br />

                                <select

                                    name="status"

                                    value={
                                        booking.status
                                    }

                                    onChange={
                                        handleChange
                                    }

                                >

                                    <option value="PENDING">
                                        PENDING
                                    </option>

                                    <option value="APPROVED">
                                        APPROVED
                                    </option>

                                    <option value="REJECTED">
                                        REJECTED
                                    </option>

                                    <option value="COMPLETED">
                                        COMPLETED
                                    </option>

                                </select>

                                <br />
                                <br />

                            </>

                        )}


                        <button
                            onClick={saveBooking}
                            style={{
                                marginRight: "10px",
                                padding: "8px 15px"
                            }}
                        >

                            {editing
                                ? "Update Booking"
                                : "Book Equipment"}

                        </button>


                        <button

                            onClick={() => {

                                clearForm();

                                setShowForm(false);

                            }}

                            style={{
                                padding: "8px 15px"
                            }}

                        >

                            Cancel

                        </button>

                    </div>

                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                <div
                    style={{
                        overflowX: "auto"
                    }}
                >

                    <table

                        border="1"

                        cellPadding="10"

                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}

                    >

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Equipment
                                </th>

                                <th>
                                    User
                                </th>

                                <th>
                                    Start Time
                                </th>

                                <th>
                                    End Time
                                </th>

                                <th>
                                    Status
                                </th>


                                {/* ---------------------------------
                                    ACTION
                                --------------------------------- */}

                                {(role === "SYSTEM_ADMIN" ||
                                    role === "INSTITUTION_ADMIN" ||
                                    role === "DEPARTMENT_HEAD") && (

                                        <th>
                                            Action
                                        </th>

                                    )}

                            </tr>

                        </thead>


                        <tbody>

                            {bookingList.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={
                                            (
                                                role === "SYSTEM_ADMIN" ||
                                                role === "INSTITUTION_ADMIN" ||
                                                role === "DEPARTMENT_HEAD"
                                            )
                                                ? 7
                                                : 6
                                        }

                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}

                                    >

                                        No bookings found.

                                    </td>

                                </tr>

                            ) : (

                                bookingList.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.bookingId
                                            }
                                        >

                                            <td>
                                                {
                                                    item.bookingId
                                                }
                                            </td>


                                            <td>
                                                {
                                                    getEquipmentName(
                                                        item.equipmentId
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    getUserName(
                                                        item.userId
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    formatDateTime(
                                                        item.startTime
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    formatDateTime(
                                                        item.endTime
                                                    )
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    style={
                                                        getStatusStyle(
                                                            item.status
                                                        )
                                                    }
                                                >

                                                    {
                                                        item.status
                                                    }

                                                </span>

                                            </td>


                                            {/* =================================
                                                ACTIONS
                                            ================================= */}

                                            {(role === "SYSTEM_ADMIN" ||
                                                role === "INSTITUTION_ADMIN" ||
                                                role === "DEPARTMENT_HEAD") && (

                                                    <td>


                                                        {/* =========================
                                                            INSTITUTION ADMIN
                                                        ========================= */}

                                                        {role === "INSTITUTION_ADMIN" &&
                                                            item.status === "PENDING" && (

                                                                <>

                                                                    <button

                                                                        onClick={() =>
                                                                            updateBookingStatus(
                                                                                item.bookingId,
                                                                                "APPROVED"
                                                                            )
                                                                        }

                                                                    >

                                                                        Approve

                                                                    </button>


                                                                    <button

                                                                        onClick={() =>
                                                                            updateBookingStatus(
                                                                                item.bookingId,
                                                                                "REJECTED"
                                                                            )
                                                                        }

                                                                        style={{
                                                                            marginLeft: "5px"
                                                                        }}

                                                                    >

                                                                        Reject

                                                                    </button>

                                                                </>

                                                            )}


                                                        {/* =========================
                                                            DEPARTMENT HEAD
                                                        ========================= */}

                                                        {role === "DEPARTMENT_HEAD" &&
                                                            item.status === "PENDING" && (

                                                                <>

                                                                    <button

                                                                        onClick={() =>
                                                                            updateBookingStatus(
                                                                                item.bookingId,
                                                                                "APPROVED"
                                                                            )
                                                                        }

                                                                    >

                                                                        Approve

                                                                    </button>


                                                                    <button

                                                                        onClick={() =>
                                                                            updateBookingStatus(
                                                                                item.bookingId,
                                                                                "REJECTED"
                                                                            )
                                                                        }

                                                                        style={{
                                                                            marginLeft: "5px"
                                                                        }}

                                                                    >

                                                                        Reject

                                                                    </button>

                                                                </>

                                                            )}


                                                        {/* =========================
                                                            SYSTEM ADMIN
                                                        ========================= */}

                                                        {role === "SYSTEM_ADMIN" && (

                                                            <>

                                                                <button

                                                                    onClick={() =>
                                                                        editBooking(
                                                                            item
                                                                        )
                                                                    }

                                                                >

                                                                    Edit

                                                                </button>


                                                                <button

                                                                    onClick={() =>
                                                                        deleteBooking(
                                                                            item.bookingId
                                                                        )
                                                                    }

                                                                    style={{
                                                                        marginLeft: "5px"
                                                                    }}

                                                                >

                                                                    Delete

                                                                </button>

                                                            </>

                                                        )}

                                                    </td>

                                                )}

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );
}

export default Booking;
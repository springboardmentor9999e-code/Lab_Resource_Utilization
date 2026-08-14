import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Utilization() {

    const [bookingList, setBookingList] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        try {

            const bookingRes = await api.get("/booking");
            const equipmentRes = await api.get("/equipment");
            const userRes = await api.get("/user");

            setBookingList(bookingRes.data);
            setEquipmentList(equipmentRes.data);
            setUserList(userRes.data);

        }
        catch (error) {
            console.log(error);
        }

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ flex: 1, padding: "30px" }}>

                <h1>Equipment Utilization Report</h1>

                <hr />

                <h2>Completed Bookings</h2>

                <table
                    border="1"
                    cellPadding="10"
                    width="100%"
                >

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Equipment</th>

                            <th>User</th>

                            <th>Start Time</th>

                            <th>End Time</th>

                            <th>Hours Used</th>

                            <th>Cost / Hour</th>

                            <th>Total Cost</th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            bookingList
                                .filter(
                                    booking =>
                                        booking.status === "COMPLETED"
                                )
                                .map((item) => {

                                    const equipment =
                                        equipmentList.find(
                                            e =>
                                                e.equipmentId === item.equipmentId
                                        );

                                    const user =
                                        userList.find(
                                            u =>
                                                u.userId === item.userId
                                        );

                                    const hoursUsed = (

                                        (
                                            new Date(item.endTime)
                                            -
                                            new Date(item.startTime)

                                        )

                                        /

                                        (1000 * 60 * 60)

                                    ).toFixed(2);

                                    return (

                                        <tr key={item.bookingId}>

                                            <td>

                                                {item.bookingId}

                                            </td>

                                            <td>

                                                {
                                                    equipment
                                                        ?.equipmentName || "-"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    user
                                                        ?.fullName || "-"
                                                }

                                            </td>

                                            <td>

                                                {item.startTime}

                                            </td>

                                            <td>

                                                {item.endTime}

                                            </td>

                                            <td>

                                                {hoursUsed} Hours

                                            </td>

                                            <td>

                                                ₹
                                                {
                                                    equipment
                                                        ?.costPerHour || 0
                                                }

                                            </td>

                                            <td>

                                                ₹
                                                {
                                                    item.totalCost || 0
                                                }

                                            </td>

                                        </tr>

                                    );

                                })

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Utilization;
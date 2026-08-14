import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Notifications() {

    const [notificationList, setNotificationList] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {

        try {

            const response = await api.get("/notifications");

            setNotificationList(response.data);

        } catch (error) {

            console.log(error);

        }

    };


    const markAsRead = async (id) => {

        try {

            await api.put(`/notifications/${id}/read`);

            fetchNotifications();

        } catch (error) {

            console.log(error);

            alert("Failed to mark notification as read.");

        }

    };


    const deleteNotification = async (id) => {

        if (!window.confirm("Delete this notification?")) {
            return;
        }

        try {

            await api.delete(`/notifications/${id}`);

            alert("Notification deleted.");

            fetchNotifications();

        } catch (error) {

            console.log(error);

            alert("Failed to delete notification.");

        }

    };


    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>Notifications</h1>

                <hr />

                <h2>Notification Center</h2>


                {notificationList.length === 0 ? (

                    <p>No notifications available.</p>

                ) : (

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Type</th>

                                <th>Message</th>

                                <th>Status</th>

                                <th>Created At</th>

                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            {notificationList.map((item) => (

                                <tr
                                    key={item.notificationId}
                                    style={{
                                        backgroundColor:
                                            item.isRead
                                                ? "white"
                                                : "#fff7edd2"
                                    }}
                                >

                                    <td>
                                        {item.notificationId}
                                    </td>

                                    <td>
                                        {item.notificationType}
                                    </td>

                                    <td>
                                        {item.message}
                                    </td>

                                    <td>

                                        <span
                                            style={{
                                                backgroundColor:
                                                    item.isRead
                                                        ? "green"
                                                        : "orange",
                                                color: "white",
                                                padding: "5px 10px",
                                                borderRadius: "8px",
                                                fontWeight: "bold"
                                            }}
                                        >

                                            {item.isRead
                                                ? "READ"
                                                : "UNREAD"}

                                        </span>

                                    </td>

                                    <td>
                                        {item.createdAt
                                            ? new Date(
                                                item.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>

                                        {!item.isRead && (

                                            <button
                                                onClick={() =>
                                                    markAsRead(
                                                        item.notificationId
                                                    )
                                                }
                                            >
                                                Mark as Read
                                            </button>

                                        )}


                                        <button
                                            onClick={() =>
                                                deleteNotification(
                                                    item.notificationId
                                                )
                                            }
                                            style={{
                                                marginLeft: "5px"
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

}

export default Notifications;
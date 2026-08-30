import React, { useEffect, useState } from "react";
import axios from "axios";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const fetchNotifications = async () => {
        try {

            const res = await axios.get(
                `http://localhost:8080/api/notifications?role=${role}&email=${email}`
            );

            setNotifications(res.data);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 3000);

        return () => clearInterval(interval);

    }, []);

    const unread = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {

        try {

            await axios.put(
                `http://localhost:8080/api/notifications/${id}/read`
            );

            fetchNotifications();

        } catch (err) {
            console.log(err);
        }

    };

    return (
        <div style={{ position: "relative" }}>

            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "28px",
                    cursor: "pointer",
                    position: "relative"
                }}
            >
                🔔

                {unread > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-8px",
                            background: "red",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px"
                        }}
                    >
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 40,
                        width: "330px",
                        background: "white",
                        border: "1px solid #ddd",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        maxHeight: "400px",
                        overflowY: "auto",
                        zIndex: 9999
                    }}
                >

                    {notifications.length === 0 ? (

                        <p style={{ padding: "15px" }}>
                            No Notifications
                        </p>

                    ) : (

                        notifications.map(notification => (

                            <div
                                key={notification.notificationId}
                                onClick={() => markAsRead(notification.notificationId)}
                                style={{
                                    padding: "12px",
                                    borderBottom: "1px solid #ddd",
                                    backgroundColor: notification.isRead ? "#ffffff" : "#eef6ff",
                                    cursor: "pointer"
                                }}
                            >

                                <strong>{notification.title}</strong>

                                <br />

                                <span>{notification.message}</span>

                                <br />

                                <small>{notification.createdAt}</small>

                            </div>

                        ))

                    )}

                </div>
            )}

        </div>
    );
}

export default NotificationBell;
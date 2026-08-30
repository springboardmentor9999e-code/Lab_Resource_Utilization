import React, { useEffect, useState } from "react";
import axios from "axios";

function MaintenanceNotifications() {

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {

        axios
            .get("http://localhost:8080/api/maintenance/notifications")
            .then((response) => {
                setNotifications(response.data);
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
            });

    }, []);

    return (
        <div
            style={{
                background: "#fff3cd",
                padding: "20px",
                margin: "20px",
                borderRadius: "8px",
                border: "1px solid #ffeeba"
            }}
        >
            <h2>Maintenance Notifications</h2>

            {notifications.length === 0 ? (
                <p>No maintenance notifications.</p>
            ) : (
                notifications.map((item) => (
                    <div
                        key={item.maintenanceId}
                        style={{
                            marginBottom: "15px",
                            padding: "10px",
                            borderBottom: "1px solid #ccc"
                        }}
                    >
                        <p><strong>Equipment ID:</strong> {item.equipment.id}</p>
                        <p><strong>Maintenance Type:</strong> {item.maintenanceType}</p>
                        <p><strong>Next Maintenance:</strong> {item.nextMaintenanceDate}</p>
                        <p><strong>Status:</strong> {item.status}</p>
                        <p><strong>Assigned To:</strong> {item.performedBy}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default MaintenanceNotifications;
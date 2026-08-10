import React, { useEffect, useState } from "react";
import axios from "axios";

function HeatMap() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/dashboard/heatmap")
            .then((res) => {
                setData(res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Heat map error:", err);
                setError("Unable to load equipment utilization data.");
                setLoading(false);
            });
    }, []);

    const getBackgroundColor = (bookingCount) => {
        if (bookingCount > 20) {
            return "#ef4444";
        }

        if (bookingCount > 10) {
            return "#f59e0b";
        }

        return "#22c55e";
    };

    return (
        <div
            style={{
                padding: "30px",
                width: "100%",
                boxSizing: "border-box"
            }}
        >
            <h2 style={{ marginBottom: "25px" }}>
                Equipment Utilization Heat Map
            </h2>

            {loading && (
                <p>Loading equipment utilization...</p>
            )}

            {error && (
                <p style={{ color: "#ef4444" }}>
                    {error}
                </p>
            )}

            {!loading && !error && data.length === 0 && (
                <p>
                    No equipment utilization data available.
                </p>
            )}

            {!loading && !error && data.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px"
                    }}
                >
                    {data.map((item, index) => {
                        const bookingCount =
                            Number(item.bookingCount) || 0;

                        return (
                            <div
                                key={item.equipmentId || index}
                                style={{
                                    padding: "30px",
                                    borderRadius: "10px",
                                    background:
                                        getBackgroundColor(
                                            bookingCount
                                        ),
                                    color: "white",
                                    textAlign: "center",
                                    boxShadow:
                                        "0 4px 10px rgba(0,0,0,0.1)"
                                }}
                            >
                                <h3>
                                    {item.equipmentName ||
                                        "Unknown Equipment"}
                                </h3>

                                <h1>
                                    {bookingCount}
                                </h1>

                                <p>
                                    Bookings
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default HeatMap;
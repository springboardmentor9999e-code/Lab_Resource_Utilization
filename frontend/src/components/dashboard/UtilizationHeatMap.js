import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Spinner } from "react-bootstrap";
import { FaFire, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import axios from "axios";

function UtilizationHeatMap() {
    const [filterType, setFilterType] = useState("weekly");
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHeatmap = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`http://localhost:8080/api/dashboard/heatmap-v2?filterType=${filterType}`, { headers });
            setHeatmapData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch heatmap data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeatmap();
    }, [filterType]);

    const getCellColor = (level) => {
        switch (level) {
            case 3:
                return "#1e3a8a"; // Darker color (High utilization)
            case 2:
                return "#3b82f6"; // Medium color (Moderate utilization)
            case 1:
                return "#93c5fd"; // Lighter color (Low utilization)
            default:
                return "#f3f4f6"; // Empty/lightest (No utilization)
        }
    };

    const getCellTextColor = (level) => {
        return level >= 2 ? "#ffffff" : "#1f2937";
    };

    return (
        <Card className="shadow-sm border-0 mb-4 bg-white">
            <Card.Header className="bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                    <FaFire className="text-danger animate-pulse" /> Equipment Utilization Heat Map
                </h5>
                <div style={{ minWidth: "150px" }}>
                    <Form.Select
                        size="sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-select-sm border-secondary-subtle"
                    >
                        <option value="daily">Daily (Hourly)</option>
                        <option value="weekly">Weekly (Monday - Sunday)</option>
                        <option value="monthly">Monthly (Current Month)</option>
                    </Form.Select>
                </div>
            </Card.Header>

            <Card.Body>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" role="status" size="sm" className="me-2" />
                        <span className="text-muted small">Loading utilization heatmap cells...</span>
                    </div>
                ) : heatmapData ? (
                    <>
                        {/* Heatmap Grid */}
                        <div className="heatmap-container mb-4">
                            <div className="d-flex flex-wrap gap-2 justify-content-center p-3 rounded bg-light border border-light-subtle">
                                {heatmapData.cells && heatmapData.cells.map((cell, index) => (
                                    <div
                                        key={index}
                                        className="heatmap-cell text-center d-flex flex-column align-items-center justify-content-center"
                                        style={{
                                            backgroundColor: getCellColor(cell.level),
                                            color: getCellTextColor(cell.level),
                                            width: filterType === "monthly" ? "42px" : "85px",
                                            height: "50px",
                                            borderRadius: "6px",
                                            fontSize: "0.75rem",
                                            fontWeight: "600",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            cursor: "pointer",
                                            border: "1px solid rgba(0,0,0,0.05)"
                                        }}
                                        title={`${cell.label}: ${cell.value} bookings`}
                                    >
                                        <div style={{ fontSize: "0.65rem", opacity: 0.8, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
                                            {cell.label}
                                        </div>
                                        <div className="mt-1" style={{ fontSize: "0.85rem" }}>
                                            {cell.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="d-flex justify-content-center gap-4 mb-4 flex-wrap small text-muted">
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block rounded-circle" style={{ width: "12px", height: "12px", backgroundColor: "#f3f4f6", border: "1px solid rgba(0,0,0,0.1)" }}></span>
                                <span>No Utilization (0 bookings)</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block rounded-circle" style={{ width: "12px", height: "12px", backgroundColor: "#93c5fd" }}></span>
                                <span>Low</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block rounded-circle" style={{ width: "12px", height: "12px", backgroundColor: "#3b82f6" }}></span>
                                <span>Moderate</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <span className="d-inline-block rounded-circle" style={{ width: "12px", height: "12px", backgroundColor: "#1e3a8a" }}></span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Analytics Metadata */}
                        <Row className="g-3 bg-light p-3 rounded border border-light-subtle">
                            <Col xs={12} sm={6} md={3}>
                                <div className="text-center p-2 border-end border-light-subtle last-border-none">
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Most Used Equipment</div>
                                    <div className="text-primary fw-bold text-truncate" style={{ fontSize: "0.95rem" }} title={heatmapData.mostUsed}>
                                        {heatmapData.mostUsed || "None"}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={3}>
                                <div className="text-center p-2 border-end border-light-subtle last-border-none">
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Least Used Equipment</div>
                                    <div className="text-secondary fw-bold text-truncate" style={{ fontSize: "0.95rem" }} title={heatmapData.leastUsed}>
                                        {heatmapData.leastUsed || "None"}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={3}>
                                <div className="text-center p-2 border-end border-light-subtle last-border-none">
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Peak Utilization Day</div>
                                    <div className="text-danger fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>
                                        {heatmapData.highestDay || "None"}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={3}>
                                <div className="text-center p-2">
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Total Active Bookings</div>
                                    <div className="text-success fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>
                                        {heatmapData.totalBookings || 0}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div className="text-center text-muted py-4 small">
                        No utilization data available for this selection.
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

export default UtilizationHeatMap;

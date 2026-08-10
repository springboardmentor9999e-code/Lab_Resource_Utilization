import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaDollarSign,
    FaFileInvoiceDollar,
    FaCheckCircle,
    FaClock,
    FaPlus,
    FaTimes,
    FaReceipt
} from "react-icons/fa";
import "../styles/dashboard.css";

function Billing() {
    const [billings, setBillings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");

    useEffect(() => {
        fetchBillings();
        fetchBookings();
    }, []);

    const fetchBillings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/billing");
            setBillings(res.data);
        } catch (err) {
            console.error("Error fetching billings:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/bookings");
            setBookings(res.data.filter(b => b.status === "APPROVED"));
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;
        try {
            await axios.post(`http://localhost:8080/api/billing/generate/${selectedBooking}`);
            setShowModal(false);
            setSelectedBooking("");
            fetchBillings();
        } catch (err) {
            console.error("Error generating invoice:", err);
            alert("Failed to generate invoice for selected booking.");
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/billing/${id}/pay`, {
                status: "PAID",
                paymentReference: "PAY-" + Math.floor(100000 + Math.random() * 900000)
            });
            fetchBillings();
        } catch (err) {
            console.error("Error updating payment:", err);
            alert("Failed to update payment status.");
        }
    };

    const totalRevenue = billings
        .filter(b => b.status === "PAID")
        .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    const pendingRevenue = billings
        .filter(b => b.status === "UNPAID")
        .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    const paidInvoices = billings.filter(b => b.status === "PAID").length;
    const unpaidInvoices = billings.filter(b => b.status === "UNPAID").length;

    const filteredBillings = billings.filter(b => {
        if (filterStatus === "ALL") return true;
        return b.status === filterStatus;
    });

    return (
        <div className="dashboard">
            <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>Inter-Institution Billing & Cost Tracking</h1>
                    <p>Manage shared resource invoices, hourly charges, and institutional chargebacks</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "white",
                        border: "none",
                        padding: "12px 22px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 15px rgba(37,99,235,0.3)"
                    }}
                >
                    <FaPlus /> Generate Invoice
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        <FaDollarSign />
                    </div>
                    <div>
                        <h2>${totalRevenue.toFixed(2)}</h2>
                        <p>Collected Revenue</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                        <FaClock />
                    </div>
                    <div>
                        <h2>${pendingRevenue.toFixed(2)}</h2>
                        <p>Pending Chargebacks</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                        <FaCheckCircle />
                    </div>
                    <div>
                        <h2>{paidInvoices}</h2>
                        <p>Paid Invoices</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                        <FaFileInvoiceDollar />
                    </div>
                    <div>
                        <h2>{unpaidInvoices}</h2>
                        <p>Unpaid Invoices</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ margin: "20px 0", display: "flex", gap: "10px" }}>
                {["ALL", "UNPAID", "PAID"].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "20px",
                            border: "1px solid #cbd5e1",
                            background: filterStatus === status ? "#2563eb" : "#f8fafc",
                            color: filterStatus === status ? "white" : "#475569",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "0.2s"
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Billing Table */}
            <div className="chart-card">
                <h3><FaReceipt style={{ marginRight: "10px", color: "#2563eb" }} /> Recent Billing Records & Invoices</h3>
                {loading ? (
                    <p>Loading invoices...</p>
                ) : filteredBillings.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <FaFileInvoiceDollar style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.5 }} />
                        <p>No billing invoices found.</p>
                    </div>
                ) : (
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Equipment</th>
                                <th>User</th>
                                <th>Hours</th>
                                <th>Hourly Rate</th>
                                <th>Total Cost</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBillings.map(item => (
                                <tr key={item.id}>
                                    <td><strong>INV-{1000 + item.id}</strong></td>
                                    <td>{item.equipmentName || `Equipment #${item.equipmentId || '-'}`}</td>
                                    <td>{item.userName || `User #${item.userId || '-'}`}</td>
                                    <td>{item.hoursUsed} hrs</td>
                                    <td>${item.hourlyRate ? item.hourlyRate.toFixed(2) : "50.00"}/hr</td>
                                    <td><strong style={{ color: "#0f172a" }}>${item.totalCost ? item.totalCost.toFixed(2) : "0.00"}</strong></td>
                                    <td>{item.billingDate}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            background: item.status === "PAID" ? "#d1fae5" : "#fee2e2",
                                            color: item.status === "PAID" ? "#065f46" : "#991b1b"
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        {item.status === "UNPAID" && (
                                            <button
                                                onClick={() => handleMarkAsPaid(item.id)}
                                                style={{
                                                    background: "#10b981",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "6px 14px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        {item.status === "PAID" && (
                                            <span style={{ color: "#64748b", fontSize: "12px" }}>
                                                Ref: {item.paymentReference || "N/A"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Invoice Generation */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(15,23,42,0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "20px",
                        width: "100%",
                        maxWidth: "480px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0 }}>Generate Inter-Institution Invoice</h3>
                            <FaTimes style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleGenerateInvoice}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155" }}>Select Approved Booking</label>
                                <select
                                    value={selectedBooking}
                                    onChange={(e) => setSelectedBooking(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "14px"
                                    }}
                                >
                                    <option value="">-- Choose Booking --</option>
                                    {bookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            Booking #{b.id} - Date: {b.bookingDate} ({b.startTime || '09:00'} to {b.endTime || '11:00'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        border: "1px solid #cbd5e1",
                                        background: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: "#2563eb",
                                        color: "white",
                                        fontWeight: "600",
                                        cursor: "pointer"
                                    }}
                                >
                                    Create Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;
import React, { useEffect, useState } from "react";
import {
    getPendingRequests,
    approveRequest,
    rejectRequest
} from "../services/sharingService";

function PendingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPendingRequests();

            const data = response?.data ?? response;

            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading pending requests:", error);
            setError("Failed to load pending requests.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setProcessingId(id);
            setError("");

            await approveRequest(id);

            alert("Request approved successfully.");

            await loadRequests();
        } catch (error) {
            console.error("Error approving request:", error);
            setError("Failed to approve request.");
            alert("Failed to approve request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        try {
            setProcessingId(id);
            setError("");

            await rejectRequest(id);

            alert("Request rejected successfully.");

            await loadRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
            setError("Failed to reject request.");
            alert("Failed to reject request.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                padding: "10px 0 40px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            color: "#0f172a"
                        }}
                    >
                        Pending Requests
                    </h2>

                    <p
                        style={{
                            marginTop: "6px",
                            color: "#64748b"
                        }}
                    >
                        Review and manage resource sharing requests.
                    </p>
                </div>

                <button
                    onClick={loadRequests}
                    style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        background: "#2563eb",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "14px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "22px",
                    boxShadow: "0 4px 15px rgba(15,23,42,0.05)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            color: "#0f172a"
                        }}
                    >
                        Requests Awaiting Approval
                    </h3>

                    <span
                        style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: "700"
                        }}
                    >
                        {requests.length}
                    </span>
                </div>

                {loading ? (
                    <div
                        style={{
                            padding: "50px",
                            textAlign: "center",
                            color: "#64748b"
                        }}
                    >
                        Loading pending requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div
                        style={{
                            padding: "50px",
                            textAlign: "center",
                            color: "#64748b"
                        }}
                    >
                        <h3>No Pending Requests</h3>

                        <p>
                            There are currently no resource sharing requests
                            waiting for approval.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            width: "100%",
                            overflowX: "auto"
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                minWidth: "850px",
                                borderCollapse: "collapse"
                            }}
                        >
                            <thead>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Requester</th>
                                <th style={thStyle}>Resource</th>
                                <th style={thStyle}>Purpose</th>
                                <th style={thStyle}>Start Date</th>
                                <th style={thStyle}>End Date</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {requests.map((request) => {
                                const requestId =
                                    request.id ??
                                    request.requestId;

                                const requester =
                                    request.userName ??
                                    request.requesterName ??
                                    request.username ??
                                    request.userId ??
                                    "-";

                                const resource =
                                    request.resourceName ??
                                    request.equipmentName ??
                                    request.resourceId ??
                                    request.equipmentId ??
                                    "-";

                                const purpose =
                                    request.purpose ??
                                    request.description ??
                                    "-";

                                const startDate =
                                    request.startDate ??
                                    request.requestStartDate ??
                                    "-";

                                const endDate =
                                    request.endDate ??
                                    request.requestEndDate ??
                                    "-";

                                const status =
                                    request.status ?? "PENDING";

                                const isProcessing =
                                    processingId === requestId;

                                return (
                                    <tr key={requestId}>
                                        <td style={tdStyle}>
                                            {requestId}
                                        </td>

                                        <td style={tdStyle}>
                                            {requester}
                                        </td>

                                        <td style={tdStyle}>
                                            {resource}
                                        </td>

                                        <td style={tdStyle}>
                                            {purpose}
                                        </td>

                                        <td style={tdStyle}>
                                            {startDate}
                                        </td>

                                        <td style={tdStyle}>
                                            {endDate}
                                        </td>

                                        <td style={tdStyle}>
                                                <span
                                                    style={{
                                                        background:
                                                            "#fef3c7",
                                                        color:
                                                            "#92400e",
                                                        padding:
                                                            "5px 10px",
                                                        borderRadius:
                                                            "20px",
                                                        fontSize:
                                                            "12px",
                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >
                                                    {status}
                                                </span>
                                        </td>

                                        <td style={tdStyle}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px"
                                                }}
                                            >
                                                <button
                                                    disabled={
                                                        isProcessing
                                                    }
                                                    onClick={() =>
                                                        handleApprove(
                                                            requestId
                                                        )
                                                    }
                                                    style={{
                                                        border: "none",
                                                        borderRadius:
                                                            "8px",
                                                        padding:
                                                            "8px 12px",
                                                        background:
                                                            "#10b981",
                                                        color:
                                                            "#ffffff",
                                                        cursor:
                                                            isProcessing
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        fontWeight:
                                                            "600",
                                                        opacity:
                                                            isProcessing
                                                                ? 0.6
                                                                : 1
                                                    }}
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    disabled={
                                                        isProcessing
                                                    }
                                                    onClick={() =>
                                                        handleReject(
                                                            requestId
                                                        )
                                                    }
                                                    style={{
                                                        border: "none",
                                                        borderRadius:
                                                            "8px",
                                                        padding:
                                                            "8px 12px",
                                                        background:
                                                            "#ef4444",
                                                        color:
                                                            "#ffffff",
                                                        cursor:
                                                            isProcessing
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        fontWeight:
                                                            "600",
                                                        opacity:
                                                            isProcessing
                                                                ? 0.6
                                                                : 1
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle = {
    textAlign: "left",
    padding: "14px",
    background: "#f8fafc",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px"
};

const tdStyle = {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "13px"
};

export default PendingRequests;
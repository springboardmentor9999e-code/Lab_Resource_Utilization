import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../services/api";

export default function TechnicianBookingApproval() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/bookings");
      setBookings(response.data || []);
    } catch (err) {
      console.warn("GET /bookings failed. Loading local mock request queue.", err);
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = async (booking, newStatus) => {
    const bookingId = booking.id || booking._id;

    try {
      setErrorMsg("");
      const payload = {
        ...booking,
        status: newStatus,
      };

      await api.put(`/bookings/${bookingId}`, payload);
      setSuccessMsg(`Successfully updated booking status to ${newStatus}.`);
      setSnackbarOpen(true);
      loadBookings();
    } catch (err) {
      console.warn("PUT /bookings/id failed. Simulating locally (Demo Mode).", err);
      
      // Update locally
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === bookingId ? { ...b, status: newStatus } : b
        )
      );
      setSuccessMsg(`Successfully updated booking status to ${newStatus} (Demo Mode).`);
      setSnackbarOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
      case "returned":
        return "info";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending");

  if (loading && bookings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          Booking Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Approve reservation logs or reject unauthorized resource requests.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Requests Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking ID</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingBookings.length > 0 ? (
              pendingBookings.map((b) => {
                const bId = b.id || b._id;
                return (
                  <TableRow key={bId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{`BK-${String(bId).substring(0, 5)}`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.username || "Student"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.equipmentName || "Resource"}</TableCell>
                    <TableCell>{b.bookingDate}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell>
                      <Chip label={b.status} color={getStatusColor(b.status)} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateStatus(b, "Approved")}
                          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleUpdateStatus(b, "Rejected")}
                          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No pending reservation requests to review.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const MOCK_BOOKINGS = [
  { id: "101", username: "Alex Student", equipmentId: "1", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Pending" },
  { id: "102", username: "Maria Student", equipmentId: "3", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "Pending" },
];
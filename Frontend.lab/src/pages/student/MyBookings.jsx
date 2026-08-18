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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../services/api";

export default function StudentMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const username = localStorage.getItem("username") || "Student";
  const currentUserEmail = localStorage.getItem("email") || "";

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/bookings");
      const list = response.data || [];
      
      // Filter list to only show current student's bookings (checks email or username)
      const filtered = list.filter((b) => {
        const userEmail = b.user?.email || "";
        const uName = b.username || b.user?.name || "";
        return (
          (userEmail && userEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
          uName.toLowerCase() === username.toLowerCase()
        );
      });
      setBookings(filtered);
    } catch (err) {
      console.warn("GET /bookings failed. Loading local mock bookings list.", err);
      const localBookings = JSON.parse(localStorage.getItem("local_bookings") || "[]");
      const combinedMock = [...MOCK_BOOKINGS, ...localBookings];
      setBookings(combinedMock.filter((b) => {
        const uName = b.username || b.user?.name || "";
        return uName.toLowerCase() === username.toLowerCase();
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyBookings();
  }, []);

  const handleCancelClick = (booking) => {
    setCancelTarget(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id || cancelTarget._id;
    const eqName = cancelTarget.equipment?.name || cancelTarget.equipmentName || "Resource";

    try {
      setErrorMsg("");
      await api.delete(`/bookings/${targetId}`);
      setSuccessMsg(`Cancelled booking for ${eqName}.`);
      setSnackbarOpen(true);
      setCancelTarget(null);
      loadMyBookings();
    } catch (err) {
      console.warn("DELETE /bookings failed. Updating status locally (Demo Mode).", err);
      
      // Simulate status change
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === targetId ? { ...b, status: "Cancelled" } : b
        )
      );
      setSuccessMsg(`Cancelled booking for ${eqName} (Demo Mode).`);
      setSnackbarOpen(true);
      setCancelTarget(null);
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
        return "info";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

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
          My Active Bookings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View authorized allocations, pending reservation reviews, or cancel reservation requests.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Bookings Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking ID</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Laboratory</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((b) => {
                const bId = b.id || b._id;
                const bIdStr = String(bId || "");
                const isCancelable =
                  b.status?.toLowerCase() === "pending" ||
                  b.status?.toLowerCase() === "approved" ||
                  b.status?.toLowerCase() === "confirmed";

                return (
                  <TableRow key={bId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{`BK-${bIdStr.substring(0, 5)}`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.equipment?.name || b.equipmentName || "Resource"}</TableCell>
                    <TableCell>{b.equipment?.laboratory?.labName || b.equipment?.laboratory?.name || b.laboratoryName || "Main Facility"}</TableCell>
                    <TableCell>{b.bookingDate}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        color={getStatusColor(b.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isCancelable ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelClick(b)}
                          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                        >
                          Cancel Booking
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          No Actions
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">You have no active reservation requests.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Modal Dialog */}
      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Booking Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the reservation request for{" "}
            <strong>{cancelTarget?.equipment?.name || cancelTarget?.equipmentName || "Resource"}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelTarget(null)} sx={{ fontWeight: 700 }}>
            No, Keep
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained" sx={{ fontWeight: 700 }}>
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: "100%", borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const MOCK_BOOKINGS = [
  { id: "101", username: "Student", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Approved" },
  { id: "102", username: "Student", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "Pending" },
];

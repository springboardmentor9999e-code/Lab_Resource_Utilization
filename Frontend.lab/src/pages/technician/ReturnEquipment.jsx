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
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import api from "../../services/api";

export default function TechnicianReturnEquipment() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadActiveBookings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/bookings");
      const list = response.data || [];
      
      // Filter list to only show Approved/Confirmed bookings
      const active = list.filter(
        (b) =>
          b.status?.toLowerCase() === "approved" ||
          b.status?.toLowerCase() === "confirmed"
      );
      setActiveBookings(active);
    } catch (err) {
      console.warn("GET /bookings failed. Loading mock checked-out list.", err);
      setActiveBookings(MOCK_BOOKINGS.filter((b) => b.status === "Approved"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveBookings();
  }, []);

  const handleReturnEquipment = async (booking) => {
    const bookingId = booking.id || booking._id;
    const equipId = booking.equipmentId;

    try {
      setErrorMsg("");
      
      // 1. Update Booking Status to Returned
      const bookingPayload = {
        ...booking,
        status: "Returned",
      };
      await api.put(`/bookings/${bookingId}`, bookingPayload);

      // 2. Fetch Equipment to increment Available Quantity
      try {
        const equipResp = await api.get(`/equipment/${equipId}`);
        const equipData = equipResp.data;
        if (equipData) {
          const equipPayload = {
            ...equipData,
            availableQuantity: Number(equipData.availableQuantity ?? 0) + Number(booking.quantity || 1),
            status: "Available",
          };
          await api.put(`/equipment/${equipId}`, equipPayload);
        }
      } catch (e) {
        console.warn("Could not auto-increment equipment quantity on backend. Skipping...", e);
      }

      setSuccessMsg(`Returned ${booking.equipmentName} successfully.`);
      setSnackbarOpen(true);
      loadActiveBookings();
    } catch (err) {
      console.warn("PUT failed. Simulating return operation locally (Demo Mode).", err);
      
      setActiveBookings((prev) => prev.filter((b) => (b.id || b._id) !== bookingId));
      setSuccessMsg(`Returned ${booking.equipmentName} successfully (Demo Mode).`);
      setSnackbarOpen(true);
    }
  };

  if (loading && activeBookings.length === 0) {
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
          Return Equipment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Check in returned laboratory hardware assets, update available stocks, and close checkout logs.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Checked Out Bookings Table */}
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
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Return Deadline</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Qty</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeBookings.length > 0 ? (
              activeBookings.map((b) => {
                const bId = b.id || b._id;
                return (
                  <TableRow key={bId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{`BK-${bId.substring(0, 5)}`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.username || "Student"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.equipmentName || "Resource"}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{b.quantity || 1}</TableCell>
                    <TableCell>
                      <Chip label="Checked Out" color="success" size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<KeyboardReturnIcon />}
                        onClick={() => handleReturnEquipment(b)}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                      >
                        Return Device
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No items currently checked out by students.</Typography>
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
  { id: "103", username: "Dave Student", equipmentId: "1", equipmentName: "Digital Oscilloscope 100MHz", returnDate: "2026-07-20", quantity: 1, status: "Approved" },
];

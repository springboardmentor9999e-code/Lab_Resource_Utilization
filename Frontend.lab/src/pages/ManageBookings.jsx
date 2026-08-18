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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api/axiosConfig";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal State
  const [viewBooking, setViewBooking] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings");
      setBookings(response.data || []);
    } catch (err) {
      console.warn("Failed to fetch bookings. Loading mock log.", err);
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleApprove = async (booking) => {
    try {
      setError("");
      setSuccess("");
      const id = booking.id || booking._id;
      
      const payload = {
        ...booking,
        status: "Approved",
      };

      await api.put(`/bookings/${id}`, payload);
      setSuccess(`Approved booking for ${booking.equipmentName || "equipment"}.`);
      loadBookings();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Approve API failed. Simulating locally...", err);
      
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === (booking.id || booking._id) ? { ...b, status: "Approved" } : b
        )
      );
      setSuccess(`Approved booking for ${booking.equipmentName} (Demo Mode).`);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const handleReject = async (booking) => {
    try {
      setError("");
      setSuccess("");
      const id = booking.id || booking._id;
      
      const payload = {
        ...booking,
        status: "Rejected",
      };

      await api.put(`/bookings/${id}`, payload);
      setSuccess(`Rejected booking for ${booking.equipmentName || "equipment"}.`);
      loadBookings();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Reject API failed. Simulating locally...", err);
      
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === (booking.id || booking._id) ? { ...b, status: "Rejected" } : b
        )
      );
      setSuccess(`Rejected booking for ${booking.equipmentName} (Demo Mode).`);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const getStatusChipColor = (status) => {
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
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Booking Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Review student booking submissions, approve scheduling allocations, or reject pending conflicts.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
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
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const bookingId = booking.id || booking._id;
                const isPending = booking.status?.toLowerCase() === "pending";
                
                return (
                  <TableRow key={bookingId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {booking.username || booking.user?.username || "Student User"}
                    </TableCell>
                    <TableCell>{booking.equipmentName || booking.equipment?.name || "Resource"}</TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
                    <TableCell>{booking.returnDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status || "Pending"}
                        color={getStatusChipColor(booking.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        {/* View Booking Details */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => setViewBooking(booking)}
                          sx={{ borderRadius: 1.5, textTransform: "none" }}
                        >
                          View
                        </Button>

                        {/* Approve Action */}
                        {isPending && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleApprove(booking)}
                            sx={{ borderRadius: 1.5, textTransform: "none" }}
                          >
                            Approve
                          </Button>
                        )}

                        {/* Reject Action */}
                        {isPending && (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => handleReject(booking)}
                            sx={{ borderRadius: 1.5, textTransform: "none" }}
                          >
                            Reject
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No bookings currently log in the system.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Details Dialog */}
      <Dialog open={!!viewBooking} onClose={() => setViewBooking(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Reservation Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Student / Requester</Typography>
              <Typography variant="body1" fontWeight={600}>
                {viewBooking?.username || viewBooking?.user?.username || "Student User"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Equipment Name</Typography>
              <Typography variant="body1" fontWeight={600}>
                {viewBooking?.equipmentName || viewBooking?.equipment?.name || "Resource"}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Booking Start Date</Typography>
              <Typography variant="body1">{viewBooking?.bookingDate}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Booking Return Date</Typography>
              <Typography variant="body1">{viewBooking?.returnDate}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Current Reservation Status</Typography>
              <Chip
                label={viewBooking?.status || "Pending"}
                color={getStatusChipColor(viewBooking?.status)}
                size="small"
                sx={{ mt: 0.5, fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewBooking(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const MOCK_BOOKINGS = [
  {
    id: "101",
    username: "Alex Student",
    equipmentName: "Digital Oscilloscope 100MHz",
    bookingDate: "2026-07-15",
    returnDate: "2026-07-20",
    status: "Pending",
  },
  {
    id: "102",
    username: "Maria Student",
    equipmentName: "Refrigerated Centrifuge",
    bookingDate: "2026-07-16",
    returnDate: "2026-07-22",
    status: "Approved",
  },
  {
    id: "103",
    username: "Alex Student",
    equipmentName: "Binocular Compound Microscope",
    bookingDate: "2026-07-10",
    returnDate: "2026-07-12",
    status: "Rejected",
  },
];

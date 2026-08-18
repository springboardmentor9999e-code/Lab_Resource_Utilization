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
  Grid,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import OutboxIcon from "@mui/icons-material/Outbox";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import SearchIcon from "@mui/icons-material/Search";
import api from "../services/api";

export default function AdminBookings() {
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings");
      setBookingsList(response.data || []);
    } catch (err) {
      console.warn("GET /bookings API failed. Loading mock reservation list.", err);
      setBookingsList(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (id, actionEndpoint, successMsg, localStatus) => {
    try {
      setActionLoading(id);
      setError("");
      setSuccess("");
      await api.put(`/bookings/${id}/${actionEndpoint}`);
      setSuccess(successMsg);
      await loadBookings();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setBookingsList((prev) => prev.map((b) => (b.id === id ? { ...b, status: localStatus } : b)));
      setSuccess(`${successMsg} (Demo Mode)`);
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusChip = (status) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "APPROVED":
        return <Chip label="APPROVED" color="primary" size="small" sx={{ fontWeight: 700 }} />;
      case "ISSUED":
        return <Chip label="ISSUED" color="secondary" size="small" sx={{ fontWeight: 700 }} />;
      case "REJECTED":
        return <Chip label="REJECTED" color="error" size="small" sx={{ fontWeight: 700 }} />;
      case "RETURNED":
        return <Chip label="RETURNED" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case "CANCELLED":
        return <Chip label="CANCELLED" color="default" size="small" sx={{ fontWeight: 700 }} />;
      case "PENDING":
      default:
        return <Chip label="PENDING" color="warning" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  const getStudentName = (b) => b.user?.name || b.user?.username || b.username || "Student User";
  const getEquipmentName = (b) => b.equipment?.name || b.equipmentName || "Resource";

  const filteredBookings = bookingsList.filter((b) => {
    const sName = getStudentName(b).toLowerCase();
    const eName = getEquipmentName(b).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(q) || eName.includes(q);

    const bStatus = (b.status || "").toUpperCase();
    const matchesStatus = statusFilter === "All" || bStatus === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  if (loading && bookingsList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          System Booking Register
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor and manage all hardware reservations across the entire system.
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filter Section */}
      <Box sx={{ mb: 3, p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student or equipment name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="ISSUED">ISSUED</MenuItem>
              <MenuItem value="RETURNED">RETURNED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Bookings Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Equipment</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => {
                const bId = b.id;
                const bStatus = (b.status || "PENDING").toUpperCase();
                const isPending = bStatus === "PENDING";
                const isApproved = bStatus === "APPROVED";
                const isIssued = bStatus === "ISSUED";
                const isProcessing = actionLoading === bId;

                return (
                  <TableRow key={bId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{getStudentName(b)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{getEquipmentName(b)}</TableCell>
                    <TableCell>{b.bookingDate}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell align="center">{getStatusChip(b.status)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                        {isPending && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={isProcessing}
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleAction(bId, "approve", "Booking approved", "APPROVED")}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={isProcessing}
                              startIcon={<CancelIcon />}
                              onClick={() => handleAction(bId, "reject", "Booking rejected", "REJECTED")}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              disabled={isProcessing}
                              startIcon={<OutboxIcon />}
                              onClick={() => handleAction(bId, "issue", "Equipment issued", "ISSUED")}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              Issue
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={isProcessing}
                              onClick={() => handleAction(bId, "cancel", "Booking cancelled", "CANCELLED")}
                              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {isIssued && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={isProcessing}
                            startIcon={<AssignmentReturnIcon />}
                            onClick={() => handleAction(bId, "return", "Equipment returned", "RETURNED")}
                            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                          >
                            Mark Returned
                          </Button>
                        )}

                        {!isPending && !isApproved && !isIssued && (
                          <Typography variant="caption" color="text.disabled">Completed</Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No matching bookings logged in the system.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

const MOCK_BOOKINGS = [
  { id: 1, username: "Alex Student", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "PENDING" },
  { id: 2, username: "Maria Student", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "APPROVED" },
];

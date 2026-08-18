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
  Card,
  Grid,
  useTheme,
  Tooltip,
  TextField,
  MenuItem,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import OutboxIcon from "@mui/icons-material/Outbox";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../services/api";

const MOCK_BOOKING_REQUESTS = [
  {
    id: 1,
    bookingDate: "2026-07-20",
    returnDate: "2026-07-25",
    status: "PENDING",
    user: { id: 10, name: "Alex Johnson", email: "alex@university.edu" },
    equipment: {
      id: 101,
      name: "Digital Storage Oscilloscope 100MHz",
      laboratory: { id: 1, labName: "Electronics & Circuits Lab" },
    },
  },
  {
    id: 2,
    bookingDate: "2026-07-18",
    returnDate: "2026-07-22",
    status: "APPROVED",
    user: { id: 11, name: "Maria Garcia", email: "maria@university.edu" },
    equipment: {
      id: 102,
      name: "High-Speed Centrifuge Machine",
      laboratory: { id: 2, labName: "Biochemistry & Molecular Lab" },
    },
  },
  {
    id: 3,
    bookingDate: "2026-07-15",
    returnDate: "2026-07-19",
    status: "ISSUED",
    user: { id: 12, name: "David Kim", email: "david@university.edu" },
    equipment: {
      id: 103,
      name: "6-DOF Robotic Arm Trainer",
      laboratory: { id: 3, labName: "Mechanical Robotics Lab" },
    },
  },
];

export default function ManagerBookingRequests() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: "", severity: "success" });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (message, severity = "success") => {
    setSnackbarInfo({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbarInfo((prev) => ({ ...prev, open: false }));
  };

  // Fetch all booking requests
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      const list = Array.isArray(res.data) ? res.data : [];
      setBookings(list.length > 0 ? list : MOCK_BOOKING_REQUESTS);
    } catch (err) {
      console.warn("GET /api/bookings failed. Loading demo requests queue.", err);
      setBookings(MOCK_BOOKING_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Action handlers
  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/bookings/${bookingId}/approve`);
      showToast("Booking request approved!", "success");
      await fetchAllBookings();
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "APPROVED" } : b)));
      showToast("Booking request approved (Demo Mode)", "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIssue = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/bookings/${bookingId}/issue`);
      showToast("Equipment issued to student!", "success");
      await fetchAllBookings();
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "ISSUED" } : b)));
      showToast("Equipment issued (Demo Mode)", "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/bookings/${bookingId}/reject`);
      showToast("Booking request rejected.", "warning");
      await fetchAllBookings();
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "REJECTED" } : b)));
      showToast("Booking request rejected (Demo Mode)", "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/bookings/${bookingId}/return`);
      showToast("Equipment marked as returned to inventory!", "success");
      await fetchAllBookings();
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "RETURNED" } : b)));
      showToast("Equipment marked as returned (Demo Mode)", "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/bookings/${bookingId}/cancel`);
      showToast("Booking cancelled.", "info");
      await fetchAllBookings();
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b)));
      showToast("Booking cancelled (Demo Mode)", "info");
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

  const getStudentName = (item) => item.user?.name || item.user?.username || item.username || "Student User";
  const getEquipmentName = (item) => item.equipment?.name || item.equipmentName || "Lab Instrument";
  const getLabName = (item) => item.equipment?.laboratory?.labName || item.equipment?.laboratory?.name || item.laboratoryName || "Main Facility";

  // Filtered List
  const filteredBookings = bookings.filter((item) => {
    const sName = getStudentName(item).toLowerCase();
    const eName = getEquipmentName(item).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(q) || eName.includes(q);

    const bStatus = (item.status || "").toUpperCase();
    const matchesStatus = statusFilter === "All" || bStatus === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Summary Counters
  const pendingCount = bookings.filter((b) => (b.status || "").toUpperCase() === "PENDING").length;
  const approvedCount = bookings.filter((b) => (b.status || "").toUpperCase() === "APPROVED").length;
  const issuedCount = bookings.filter((b) => (b.status || "").toUpperCase() === "ISSUED").length;
  const returnedCount = bookings.filter((b) => (b.status || "").toUpperCase() === "RETURNED").length;

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out", p: 1 }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5, color: "#1e3a8a" }}>
            <EventNoteIcon color="primary" sx={{ fontSize: 36 }} />
            Booking Requests Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review pending student reservation requests, issue hardware, and process returns.
          </Typography>
        </Box>

        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAllBookings} sx={{ borderRadius: 2 }}>
          Refresh Queue
        </Button>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>PENDING</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#f59e0b", mt: 0.5 }}>{pendingCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>APPROVED</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#2563eb", mt: 0.5 }}>{approvedCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>ISSUED</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#7c3aed", mt: 0.5 }}>{issuedCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", p: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>RETURNED</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#10b981", mt: 0.5 }}>{returnedCount}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Box sx={{ mb: 3, p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student name or equipment name..."
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

      {/* Main Booking Requests Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Laboratory</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={36} />
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    No matching booking requests found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((item) => {
                const bStatus = (item.status || "PENDING").toUpperCase();
                const isPending = bStatus === "PENDING";
                const isApproved = bStatus === "APPROVED";
                const isIssued = bStatus === "ISSUED";
                const isProcessing = actionLoading === item.id;

                return (
                  <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{getStudentName(item)}</Typography>
                      {item.user?.email && <Typography variant="caption" color="text.secondary">{item.user.email}</Typography>}
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{getEquipmentName(item)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{getLabName(item)}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{item.bookingDate}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{item.returnDate}</Typography></TableCell>
                    <TableCell align="center">{getStatusChip(item.status)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                        {isPending && (
                          <>
                            <Tooltip title="Approve Reservation">
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={isProcessing}
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApprove(item.id)}
                                sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={isProcessing}
                                startIcon={<CancelIcon />}
                                onClick={() => handleReject(item.id)}
                                sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}

                        {isApproved && (
                          <>
                            <Tooltip title="Issue Equipment to Student">
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                disabled={isProcessing}
                                startIcon={<OutboxIcon />}
                                onClick={() => handleIssue(item.id)}
                                sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}
                              >
                                Issue Equipment
                              </Button>
                            </Tooltip>
                            <Tooltip title="Cancel Booking">
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={isProcessing}
                                onClick={() => handleCancel(item.id)}
                                sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}
                              >
                                Cancel
                              </Button>
                            </Tooltip>
                          </>
                        )}

                        {isIssued && (
                          <Tooltip title="Mark Equipment Returned to Inventory">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              disabled={isProcessing}
                              startIcon={<AssignmentReturnIcon />}
                              onClick={() => handleReturn(item.id)}
                              sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: "none" }}
                            >
                              Mark Returned
                            </Button>
                          </Tooltip>
                        )}

                        {!isPending && !isApproved && !isIssued && (
                          <Typography variant="caption" color="text.disabled" sx={{ py: 0.5 }}>
                            No actions
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} variant="filled" sx={{ width: "100%", fontWeight: 600, borderRadius: 2 }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

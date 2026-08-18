import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Business as InstitutionIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutlined as ApprovedIcon,
  Block as CancelledIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAllExternalBookings,
  cancelExternalBooking,
  deleteExternalBooking,
} from "../../services/externalBookingService";

export default function ExternalBookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cancelId, setCancelId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllExternalBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching external bookings:", err);
      setError("Failed to load external bookings.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    try {
      setActionLoadingId(cancelId);
      await cancelExternalBooking(cancelId);
      showToast("External booking cancelled successfully!");
      setCancelId(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoadingId(id);
      await deleteExternalBooking(id);
      showToast("Booking deleted.");
      fetchBookings();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete booking", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusChip = (status) => {
    let color = "default";
    let icon = null;
    const st = (status || "PENDING").toUpperCase();

    if (st === "APPROVED" || st === "ACTIVE") {
      color = "success";
      icon = <ApprovedIcon fontSize="small" />;
    } else if (st === "PENDING") {
      color = "warning";
      icon = <PendingIcon fontSize="small" />;
    } else if (st === "CANCELLED" || st === "REJECTED") {
      color = "error";
      icon = <CancelledIcon fontSize="small" />;
    }

    return <Chip label={st} color={color} icon={icon} size="small" sx={{ fontWeight: 600 }} />;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const instName = b.externalInstitutionName?.toLowerCase() || "";
      const userName = b.externalUserName?.toLowerCase() || "";
      const email = b.externalUserEmail?.toLowerCase() || "";
      const eqName = b.equipment?.name?.toLowerCase() || "";
      const purpose = b.purpose?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        instName.includes(term) ||
        userName.includes(term) ||
        email.includes(term) ||
        eqName.includes(term) ||
        purpose.includes(term);

      const st = (b.status || "PENDING").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || st === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const approved = bookings.filter((b) => b.status === "APPROVED" || b.status === "ACTIVE").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    return { total, pending, approved, cancelled };
  }, [bookings]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}>
            <InstitutionIcon color="primary" fontSize="large" /> External Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage external partner & institution equipment reservations and access logs.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchBookings} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/external-bookings/add")}
            sx={{ fontWeight: 600, boxShadow: 3 }}
          >
            New External Booking
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #1e3a8a" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL EXTERNAL BOOKINGS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #f59e0b" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                PENDING APPROVAL
              </Typography>
              <Typography variant="h4" fontWeight={800} color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #10b981" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                APPROVED BOOKINGS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #ef4444" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                CANCELLED / EXPIRED
              </Typography>
              <Typography variant="h4" fontWeight={800} color="error.main">
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filter Controls */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by institution, contact name, email, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Tabs
              value={statusFilter}
              onChange={(e, val) => setStatusFilter(val)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="ALL" value="ALL" />
              <Tab label="PENDING" value="PENDING" />
              <Tab label="APPROVED" value="APPROVED" />
              <Tab label="CANCELLED" value="CANCELLED" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Loading external bookings...
            </Typography>
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <InstitutionIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No External Bookings Found
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={() => navigate("/external-bookings/add")}
            >
              Add First External Booking
            </Button>
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>External Institution</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Target Equipment</TableCell>
                <TableCell>Booking Schedule</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((b) => {
                const isBusy = actionLoadingId === b.id;
                const status = (b.status || "PENDING").toUpperCase();

                return (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {b.externalInstitutionName || "External Organization"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {b.externalUserName || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.externalUserEmail || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {b.equipment?.name || `Equipment #${b.equipment?.id || "N/A"}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Model: {b.equipment?.model || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Booking: {b.bookingDate || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Return: {b.returnDate || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
                        {b.purpose || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(status)}</TableCell>
                    <TableCell align="right">
                      {isBusy ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {status !== "CANCELLED" && (
                            <Tooltip title="Cancel Booking">
                              <IconButton color="warning" size="small" onClick={() => setCancelId(b.id)}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit / View Details">
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => navigate(`/external-bookings/edit/${b.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" size="small" onClick={() => handleDelete(b.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={Boolean(cancelId)} onClose={() => setCancelId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this external booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelId(null)}>Close</Button>
          <Button onClick={handleCancelConfirm} color="warning" variant="contained">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

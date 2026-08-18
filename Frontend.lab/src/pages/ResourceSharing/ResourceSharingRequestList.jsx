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
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  PlayCircle as ActivateIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutlined as ActiveIcon,
  HighlightOff as RejectedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAllRequests,
  approveRequest,
  activateRequest,
  rejectRequest,
  deleteRequest,
} from "../../services/resourceSharingRequestService";

export default function ResourceSharingRequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllRequests(statusFilter === "ALL" ? null : statusFilter);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load resource sharing requests.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      await approveRequest(id);
      showToast("Resource sharing request approved!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to approve request", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivate = async (id) => {
    try {
      setActionLoadingId(id);
      await activateRequest(id);
      showToast("Resource sharing request activated!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to activate request", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalId) return;
    try {
      setActionLoadingId(rejectModalId);
      await rejectRequest(rejectModalId, rejectReason);
      showToast("Request rejected successfully!");
      setRejectModalId(null);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to reject request", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setActionLoadingId(deleteId);
      await deleteRequest(deleteId);
      showToast("Request deleted successfully!");
      setDeleteId(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete request", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusChip = (status) => {
    let color = "default";
    let icon = null;
    const st = (status || "PENDING").toUpperCase();

    if (st === "ACTIVE") {
      color = "success";
      icon = <ActiveIcon fontSize="small" />;
    } else if (st === "APPROVED") {
      color = "info";
      icon = <ApproveIcon fontSize="small" />;
    } else if (st === "PENDING") {
      color = "warning";
      icon = <PendingIcon fontSize="small" />;
    } else if (st === "REJECTED") {
      color = "error";
      icon = <RejectedIcon fontSize="small" />;
    }

    return <Chip label={st} color={color} icon={icon} size="small" sx={{ fontWeight: 600 }} />;
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const eqName = req.equipment?.name?.toLowerCase() || "";
      const purpose = req.purpose?.toLowerCase() || "";
      const reqLab = req.requestingLaboratory?.name?.toLowerCase() || "";
      const provLab = req.providerLaboratory?.name?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      return (
        eqName.includes(term) ||
        purpose.includes(term) ||
        reqLab.includes(term) ||
        provLab.includes(term)
      );
    });
  }, [requests, searchTerm]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED" || r.status === "ACTIVE").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}>
            <ShareIcon color="primary" fontSize="large" /> Resource Sharing Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Request and manage equipment sharing across partner laboratories.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRequests} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/resource-sharing-requests/add")}
            sx={{ fontWeight: 600, boxShadow: 3 }}
          >
            Create Request
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #1e3a8a" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL REQUESTS
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
                APPROVED / ACTIVE
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
                REJECTED REQUESTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Status Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search equipment, purpose, or lab..."
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
              <Tab label="ACTIVE" value="ACTIVE" />
              <Tab label="REJECTED" value="REJECTED" />
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
              Loading requests...
            </Typography>
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <ShareIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No Resource Sharing Requests Found
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={() => navigate("/resource-sharing-requests/add")}
            >
              New Sharing Request
            </Button>
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Requested Equipment</TableCell>
                <TableCell>Requesting Lab</TableCell>
                <TableCell>Provider Lab</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((req) => {
                const isBusy = actionLoadingId === req.id;
                const status = (req.status || "PENDING").toUpperCase();

                return (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {req.equipment?.name || `Equipment #${req.equipment?.id || "N/A"}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Model: {req.equipment?.model || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {req.requestingLaboratory?.name || `Lab #${req.requestingLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {req.providerLaboratory?.name || `Lab #${req.providerLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                        {req.purpose || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        From: {req.startDate || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        To: {req.endDate || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(status)}</TableCell>
                    <TableCell align="right">
                      {isBusy ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {status === "PENDING" && (
                            <Tooltip title="Approve Request">
                              <IconButton color="success" size="small" onClick={() => handleApprove(req.id)}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {status === "APPROVED" && (
                            <Tooltip title="Activate Request">
                              <IconButton color="primary" size="small" onClick={() => handleActivate(req.id)}>
                                <ActivateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(status === "PENDING" || status === "APPROVED") && (
                            <Tooltip title="Reject Request">
                              <IconButton color="error" size="small" onClick={() => setRejectModalId(req.id)}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit / View">
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => navigate(`/resource-sharing-requests/edit/${req.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" size="small" onClick={() => setDeleteId(req.id)}>
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

      {/* Reject Reason Dialog */}
      <Dialog open={Boolean(rejectModalId)} onClose={() => setRejectModalId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Resource Sharing Request</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this equipment sharing request:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g., Equipment scheduled for emergency maintenance."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectModalId(null)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this resource sharing request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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

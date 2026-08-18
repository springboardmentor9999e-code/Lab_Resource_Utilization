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
  Cancel as TerminateIcon,
  Refresh as RefreshIcon,
  Handshake as HandshakeIcon,
  AssignmentTurnedIn as ActiveIcon,
  HourglassEmpty as PendingIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAllAgreements,
  approveAgreement,
  activateAgreement,
  terminateAgreement,
  deleteAgreement,
} from "../../services/sharingAgreementService";

export default function SharingAgreementList() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchAgreements();
  }, [statusFilter]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllAgreements(statusFilter === "ALL" ? null : statusFilter);
      setAgreements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching agreements:", err);
      setError("Failed to fetch sharing agreements. Please try again.");
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
      await approveAgreement(id);
      showToast("Agreement approved successfully!");
      fetchAgreements();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to approve agreement", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivate = async (id) => {
    try {
      setActionLoadingId(id);
      await activateAgreement(id);
      showToast("Agreement activated successfully!");
      fetchAgreements();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to activate agreement", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTerminate = async (id) => {
    try {
      setActionLoadingId(id);
      await terminateAgreement(id);
      showToast("Agreement terminated successfully!");
      fetchAgreements();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to terminate agreement", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setActionLoadingId(deleteId);
      await deleteAgreement(deleteId);
      showToast("Agreement deleted successfully!");
      setDeleteId(null);
      fetchAgreements();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete agreement", "error");
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
    } else if (st === "REJECTED" || st === "TERMINATED") {
      color = "error";
      icon = <BlockIcon fontSize="small" />;
    }

    return <Chip label={st} color={color} icon={icon} size="small" sx={{ fontWeight: 600 }} />;
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter((ag) => {
      const titleMatch = ag.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const numMatch = ag.agreementNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const providerMatch = ag.providerLaboratory?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const requestingMatch = ag.requestingLaboratory?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || numMatch || providerMatch || requestingMatch;
    });
  }, [agreements, searchTerm]);

  const stats = useMemo(() => {
    const total = agreements.length;
    const active = agreements.filter((a) => a.status === "ACTIVE").length;
    const pending = agreements.filter((a) => a.status === "PENDING").length;
    const terminated = agreements.filter((a) => a.status === "TERMINATED" || a.status === "REJECTED").length;
    return { total, active, pending, terminated };
  }, [agreements]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}>
            <HandshakeIcon color="primary" fontSize="large" /> Sharing Agreements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inter-laboratory collaboration agreements, quota allocations, and lifecycle status.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAgreements}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/sharing-agreements/add")}
            sx={{ fontWeight: 600, boxShadow: 3 }}
          >
            New Agreement
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #1e3a8a" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL AGREEMENTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #10b981" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ACTIVE AGREEMENTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="success.main">
                {stats.active}
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
          <Card sx={{ borderLeft: "4px solid #ef4444" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TERMINATED / REJECTED
              </Typography>
              <Typography variant="h4" fontWeight={800} color="error.main">
                {stats.terminated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Tabs */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, number, or lab..."
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
              <Tab label="TERMINATED" value="TERMINATED" />
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
              Loading agreement records...
            </Typography>
          </Box>
        ) : filteredAgreements.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <HandshakeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No Sharing Agreements Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your search criteria or add a new agreement.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate("/sharing-agreements/add")}
            >
              Create First Agreement
            </Button>
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Agreement Details</TableCell>
                <TableCell>Provider Lab</TableCell>
                <TableCell>Requesting Lab</TableCell>
                <TableCell align="center">Sharing Quota</TableCell>
                <TableCell>Validity Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAgreements.map((agreement) => {
                const isBusy = actionLoadingId === agreement.id;
                const status = (agreement.status || "PENDING").toUpperCase();

                return (
                  <TableRow key={agreement.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {agreement.title || "Untitled Agreement"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        #{agreement.agreementNumber || `AGR-${agreement.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {agreement.providerLaboratory?.name || `Lab #${agreement.providerLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {agreement.requestingLaboratory?.name || `Lab #${agreement.requestingLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${agreement.sharingQuota || 0} shares/mo`}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Start: {agreement.startDate || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        End: {agreement.endDate || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(status)}</TableCell>
                    <TableCell align="right">
                      {isBusy ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {status === "PENDING" && (
                            <Tooltip title="Approve Agreement">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleApprove(agreement.id)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(status === "APPROVED" || status === "PENDING") && (
                            <Tooltip title="Activate Agreement">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleActivate(agreement.id)}
                              >
                                <ActivateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {status === "ACTIVE" && (
                            <Tooltip title="Terminate Agreement">
                              <IconButton
                                color="warning"
                                size="small"
                                onClick={() => handleTerminate(agreement.id)}
                              >
                                <TerminateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit">
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => navigate(`/sharing-agreements/edit/${agreement.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => setDeleteId(agreement.id)}
                            >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sharing agreement? This action cannot be undone.
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

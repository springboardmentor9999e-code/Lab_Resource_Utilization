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
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  TaskAlt as CompleteIcon,
  Refresh as RefreshIcon,
  SwapHoriz as SwapIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutlined as ActiveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAllShares,
  approveShare,
  rejectShare,
  completeShare,
} from "../../services/resourceShareService";

export default function ResourceShareList() {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllShares();
      setShares(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching resource shares:", err);
      setError("Failed to load resource shares.");
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
      await approveShare(id);
      showToast("Resource share approved successfully!");
      fetchShares();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to approve share", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await rejectShare(id);
      showToast("Resource share rejected.");
      fetchShares();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to reject share", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (id) => {
    try {
      setActionLoadingId(id);
      await completeShare(id);
      showToast("Resource share marked as completed!");
      fetchShares();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to complete share", "error");
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
      icon = <ActiveIcon fontSize="small" />;
    } else if (st === "COMPLETED") {
      color = "info";
      icon = <CompleteIcon fontSize="small" />;
    } else if (st === "PENDING") {
      color = "warning";
      icon = <PendingIcon fontSize="small" />;
    } else if (st === "REJECTED") {
      color = "error";
      icon = <RejectIcon fontSize="small" />;
    }

    return <Chip label={st} color={color} icon={icon} size="small" sx={{ fontWeight: 600 }} />;
  };

  const filteredShares = useMemo(() => {
    return shares.filter((sh) => {
      const eqName = sh.equipment?.name?.toLowerCase() || "";
      const sourceLab = sh.sourceLaboratory?.name?.toLowerCase() || "";
      const targetLab = sh.targetLaboratory?.name?.toLowerCase() || "";
      const purpose = sh.purpose?.toLowerCase() || "";
      const user = sh.requestedBy?.username?.toLowerCase() || sh.requestedBy?.email?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        eqName.includes(term) ||
        sourceLab.includes(term) ||
        targetLab.includes(term) ||
        purpose.includes(term) ||
        user.includes(term);

      const st = (sh.status || "PENDING").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || st === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shares, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = shares.length;
    const pending = shares.filter((s) => s.status === "PENDING").length;
    const active = shares.filter((s) => s.status === "APPROVED" || s.status === "ACTIVE").length;
    const completed = shares.filter((s) => s.status === "COMPLETED").length;
    return { total, pending, active, completed };
  }, [shares]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}>
            <SwapIcon color="primary" fontSize="large" /> Resource Shares
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track equipment transfers between source and target laboratories.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchShares} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/resource-shares/add")}
            sx={{ fontWeight: 600, boxShadow: 3 }}
          >
            Share Resource
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #1e3a8a" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL SHARES
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
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #0284c7" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                COMPLETED
              </Typography>
              <Typography variant="h4" fontWeight={800} color="info.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Status Tabs */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search equipment, labs, purpose..."
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
              <Tab label="COMPLETED" value="COMPLETED" />
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
              Loading resource shares...
            </Typography>
          </Box>
        ) : filteredShares.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <SwapIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No Resource Shares Found
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={() => navigate("/resource-shares/add")}
            >
              Share First Resource
            </Button>
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Source Lab</TableCell>
                <TableCell>Target Lab</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Share Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShares.map((sh) => {
                const isBusy = actionLoadingId === sh.id;
                const status = (sh.status || "PENDING").toUpperCase();

                return (
                  <TableRow key={sh.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {sh.equipment?.name || `Equipment #${sh.equipment?.id || "N/A"}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Model: {sh.equipment?.model || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sh.sourceLaboratory?.name || `Lab #${sh.sourceLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sh.targetLaboratory?.name || `Lab #${sh.targetLaboratory?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {sh.requestedBy?.username || sh.requestedBy?.email || `User #${sh.requestedBy?.id || "N/A"}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Start: {sh.startDate || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        End: {sh.endDate || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(status)}</TableCell>
                    <TableCell align="right">
                      {isBusy ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {status === "PENDING" && (
                            <>
                              <Tooltip title="Approve Share">
                                <IconButton color="success" size="small" onClick={() => handleApprove(sh.id)}>
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Share">
                                <IconButton color="error" size="small" onClick={() => handleReject(sh.id)}>
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {(status === "APPROVED" || status === "ACTIVE") && (
                            <Tooltip title="Mark as Completed">
                              <IconButton color="info" size="small" onClick={() => handleComplete(sh.id)}>
                                <CompleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit / Details">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => navigate(`/resource-shares/edit/${sh.id}`)}
                            >
                              <EditIcon fontSize="small" />
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

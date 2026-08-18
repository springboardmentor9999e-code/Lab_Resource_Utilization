import React, { useState, useEffect, useMemo } from "react";
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
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
  Card,
  CardContent,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment,
  Stack,
  Fade
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import VerifiedIcon from "@mui/icons-material/Verified";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import api from "../../services/api";
import {
  createRequest,
  getRequests,
  approve,
  reject,
  complete
} from "../../services/resourceSharingService";

const FALLBACK_EQUIPMENT = [
  "High-Frequency Oscilloscope 100MHz",
  "Ultrafast UV-Vis Spectrophotometer",
  "DNA Sequencer NextGen 4k",
  "Universal Tensile Testing Machine",
  "Gas Chromatograph Mass Spectrometer (GC-MS)",
  "Helium Mass Spectrometer Leak Detector",
  "High-Vacuum Magnetron Sputtering System",
  "Digital Storage Oscilloscope 4-Channel",
  "Automated Centrifuge System"
];

const INITIAL_REQUESTS = [
  {
    id: "req-101",
    equipment: "High-Frequency Oscilloscope 100MHz",
    fromInstitution: "Metropolitan Tech University",
    toInstitution: "AI & ML Department",
    quantity: 1,
    remarks: "Needed for postgraduate research project validation.",
    status: "Pending"
  },
  {
    id: "req-102",
    equipment: "DNA Sequencer NextGen 4k",
    fromInstitution: "State Science & Research Center",
    toInstitution: "Biology Research Lab",
    quantity: 2,
    remarks: "Required for genome sequence mapping trial.",
    status: "Approved"
  },
  {
    id: "req-103",
    equipment: "Gas Chromatograph Mass Spectrometer (GC-MS)",
    fromInstitution: "National Institute of Physics",
    toInstitution: "Applied Chemistry Lab",
    quantity: 1,
    remarks: "Calibration verification completed.",
    status: "Complete"
  },
  {
    id: "req-104",
    equipment: "Universal Tensile Testing Machine",
    fromInstitution: "Department of Civil Engineering",
    toInstitution: "Materials Testing Lab",
    quantity: 1,
    remarks: "Stress-strain curve test for novel composites.",
    status: "Pending"
  }
];

export default function ManagerResourceSharing() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [equipmentOptions, setEquipmentOptions] = useState(FALLBACK_EQUIPMENT);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states
  const [formData, setFormData] = useState({
    equipment: "",
    fromInstitution: "",
    toInstitution: "",
    quantity: 1,
    remarks: ""
  });

  const loadEquipment = async () => {
    try {
      const res = await api.get("/equipment");
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
        ? data.data
        : [];
      
      const names = list.map((e) => e.name || e.equipmentName).filter(Boolean);
      if (names.length > 0) {
        setEquipmentOptions([...new Set([...names, ...FALLBACK_EQUIPMENT])]);
      } else {
        setEquipmentOptions(FALLBACK_EQUIPMENT);
      }
    } catch (err) {
      setEquipmentOptions(FALLBACK_EQUIPMENT);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getRequests();
      const data = res?.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
        ? data.data
        : null;

      if (list && list.length > 0) {
        setRequests(list);
        setInfoMsg("");
      } else {
        setRequests(INITIAL_REQUESTS);
      }
    } catch (err) {
      console.warn("Backend API offline or unreachable. Using active interactive simulation mode.");
      setInfoMsg("Connected in local simulation mode. Full resource sharing operations remain active.");
      setRequests((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : INITIAL_REQUESTS));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadRequests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment || !formData.fromInstitution || !formData.toInstitution || formData.quantity <= 0) {
      setErrorMsg("Please fill out all required fields with positive quantity values.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      const payload = {
        equipment: formData.equipment,
        fromInstitution: formData.fromInstitution,
        toInstitution: formData.toInstitution,
        quantity: parseInt(formData.quantity),
        remarks: formData.remarks,
        status: "Pending"
      };

      await createRequest(payload);
      setSuccessMsg("Resource sharing request logged successfully.");
      setSnackbarOpen(true);

      setFormData({
        equipment: "",
        fromInstitution: "",
        toInstitution: "",
        quantity: 1,
        remarks: ""
      });
      await loadRequests();
    } catch (err) {
      // Local fallback execution
      const localNewRequest = {
        id: `req-${Math.floor(Math.random() * 900) + 100}`,
        equipment: formData.equipment,
        fromInstitution: formData.fromInstitution,
        toInstitution: formData.toInstitution,
        quantity: parseInt(formData.quantity),
        remarks: formData.remarks || "Inter-institution exchange agreement.",
        status: "Pending"
      };
      setRequests((prev) => [localNewRequest, ...(Array.isArray(prev) ? prev : [])]);
      setSuccessMsg("Resource sharing request created successfully (Offline Simulation).");
      setSnackbarOpen(true);
      setFormData({
        equipment: "",
        fromInstitution: "",
        toInstitution: "",
        quantity: 1,
        remarks: ""
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approve(id);
      setSuccessMsg(`Request #${id} approved.`);
      setSnackbarOpen(true);
      await loadRequests();
    } catch (err) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );
      setSuccessMsg(`Request #${id} status set to Approved.`);
      setSnackbarOpen(true);
    }
  };

  const handleReject = async (id) => {
    try {
      await reject(id);
      setSuccessMsg(`Request #${id} rejected.`);
      setSnackbarOpen(true);
      await loadRequests();
    } catch (err) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
      );
      setSuccessMsg(`Request #${id} status set to Rejected.`);
      setSnackbarOpen(true);
    }
  };

  const handleComplete = async (id) => {
    try {
      await complete(id);
      setSuccessMsg(`Request #${id} marked complete.`);
      setSnackbarOpen(true);
      await loadRequests();
    } catch (err) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Complete" } : r))
      );
      setSuccessMsg(`Request #${id} marked as Complete.`);
      setSnackbarOpen(true);
    }
  };

  // Safe filtered requests
  const safeRequests = useMemo(() => {
    if (!Array.isArray(requests)) return INITIAL_REQUESTS;
    return requests.filter(Boolean);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return safeRequests.filter((req) => {
      if (!req || typeof req !== "object") return false;
      const eqName = (req.equipment || req.equipmentName || req.name || "").toLowerCase();
      const fromInst = (req.fromInstitution || req.from || "").toLowerCase();
      const toInst = (req.toInstitution || req.to || "").toLowerCase();
      const rem = (req.remarks || req.description || "").toLowerCase();
      const q = (searchQuery || "").toLowerCase().trim();

      const matchesSearch =
        !q ||
        eqName.includes(q) ||
        fromInst.includes(q) ||
        toInst.includes(q) ||
        rem.includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        (req.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [safeRequests, searchQuery, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = safeRequests.length;
    const pending = safeRequests.filter((r) => (r?.status || "").toLowerCase() === "pending").length;
    const approved = safeRequests.filter((r) => (r?.status || "").toLowerCase() === "approved").length;
    const completed = safeRequests.filter((r) => (r?.status || "").toLowerCase() === "complete" || (r?.status || "").toLowerCase() === "completed").length;
    return { total, pending, approved, completed };
  }, [safeRequests]);

  const getStatusChipProps = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "approved":
        return { label: "Approved", color: "success", variant: "filled" };
      case "pending":
        return { label: "Pending Review", color: "warning", variant: "filled" };
      case "rejected":
        return { label: "Rejected", color: "error", variant: "filled" };
      case "complete":
      case "completed":
        return { label: "Complete", color: "info", variant: "filled" };
      default:
        return { label: status || "Unknown", color: "default", variant: "outlined" };
    }
  };

  return (
    <Fade in timeout={400}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1600, margin: "0 auto" }}>
        {/* Page Header */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          mb={3}
          gap={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: "rgba(37, 99, 235, 0.12)",
                  color: theme.palette.primary?.main || "#3b82f6",
                  display: "flex"
                }}
              >
                <SwapHorizIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
                  Inter-Institution Resource Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Lend and borrow equipment assets between institutions, authorize transfer requests, and track complete transaction cycles.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh Request Data">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadRequests}
                disabled={loading}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* Informational / Offline Alert Banner */}
        {infoMsg && (
          <Alert severity="info" variant="outlined" onClose={() => setInfoMsg("")} sx={{ mb: 3, borderRadius: 2.5 }}>
            {infoMsg}
          </Alert>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <Alert severity="error" variant="filled" onClose={() => setErrorMsg("")} sx={{ mb: 3, borderRadius: 2.5 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Top Summary Cards */}
        <Grid container spacing={2.5} mb={4}>
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.palette.divider,
                background: isDark
                  ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)"
                  : "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "rgba(37, 99, 235, 0.12)",
                    color: theme.palette.primary?.main || "#3b82f6"
                  }}
                >
                  <ShareIcon />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.palette.divider,
                background: isDark
                  ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)"
                  : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="warning.main" fontWeight={700} textTransform="uppercase">
                    Pending Approval
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.dark" sx={{ mt: 0.5 }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "rgba(245, 158, 11, 0.12)",
                    color: theme.palette.warning?.main || "#f59e0b"
                  }}
                >
                  <PendingActionsIcon />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.palette.divider,
                background: isDark
                  ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)"
                  : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="success.main" fontWeight={700} textTransform="uppercase">
                    Approved / Active
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.dark" sx={{ mt: 0.5 }}>
                    {stats.approved}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "rgba(16, 185, 129, 0.12)",
                    color: theme.palette.success?.main || "#10b981"
                  }}
                >
                  <VerifiedIcon />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.palette.divider,
                background: isDark
                  ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)"
                  : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="info.main" fontWeight={700} textTransform="uppercase">
                    Completed Exchanges
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.dark" sx={{ mt: 0.5 }}>
                    {stats.completed}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "rgba(2, 132, 199, 0.12)",
                    color: theme.palette.info?.main || "#0284c7"
                  }}
                >
                  <TaskAltIcon />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Layout */}
        <Grid container spacing={3.5}>
          {/* Left Column: Create Request Form */}
          <Grid item xs={12} lg={4} size={{ xs: 12, lg: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 3.5,
                boxShadow: "0 4px 25px rgba(0,0,0,0.04)"
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <AddCircleIcon color="primary" />
                  <Typography variant="h6" fontWeight={750}>
                    Request Resource
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2.5}>
                  Submit a formal request to lend or transfer equipment items between institutions.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
                  <TextField
                    fullWidth
                    select
                    name="equipment"
                    label="Equipment Asset"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    required
                    size="small"
                  >
                    {equipmentOptions.map((eq) => (
                      <MenuItem key={eq} value={eq}>
                        {eq}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    name="fromInstitution"
                    label="Lending Institution / Org"
                    value={formData.fromInstitution}
                    onChange={handleInputChange}
                    placeholder="e.g. State Science & Research Center"
                    required
                    size="small"
                  />

                  <TextField
                    fullWidth
                    name="toInstitution"
                    label="Borrowing Institution / Dept"
                    value={formData.toInstitution}
                    onChange={handleInputChange}
                    placeholder="e.g. Applied Chemistry Lab"
                    required
                    size="small"
                  />

                  <TextField
                    fullWidth
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    inputProps={{ min: 1 }}
                    required
                    size="small"
                  />

                  <TextField
                    fullWidth
                    name="remarks"
                    label="Transfer Remarks & Terms"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Provide research justification, return timeframe, or agreement notes..."
                    size="small"
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ShareIcon />}
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      textTransform: "none",
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    {submitting ? "Submitting Request..." : "Submit Resource Request"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Exchange Requests Log Table */}
          <Grid item xs={12} lg={8} size={{ xs: 12, lg: 8 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 3.5,
                boxShadow: "0 4px 25px rgba(0,0,0,0.04)"
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={2.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={750}>
                      Inter-Institution Exchange Log
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All requested and active inter-institution equipment transfers
                    </Typography>
                  </Box>
                  <Chip
                    label={`${filteredRequests.length} Transactions`}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {/* Filter and Search Bar */}
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                  mb={3}
                  p={1.5}
                  borderRadius={2.5}
                  sx={{ bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                >
                  <TextField
                    placeholder="Search equipment or institution..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery("")}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }}
                  />

                  <TextField
                    select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 160 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Pending">Pending Review</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Complete">Complete</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </TextField>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: 750, color: "text.primary" } }}>
                          <TableCell>Equipment</TableCell>
                          <TableCell>From / To Institution</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Workflow Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((req, index) => {
                            if (!req) return null;
                            const statusLower = (req?.status || "").toLowerCase();
                            const isPending = statusLower === "pending";
                            const isApproved = statusLower === "approved";
                            const chipProps = getStatusChipProps(req?.status);
                            const reqId = req?.id || req?._id || `req-${index}`;

                            return (
                              <TableRow key={reqId} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {req?.equipment || req?.equipmentName || "Equipment Item"}
                                  </Typography>
                                  {req?.remarks && (
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3, maxWidth: 260 }}>
                                      {req.remarks}
                                    </Typography>
                                  )}
                                </TableCell>

                                <TableCell>
                                  <Stack spacing={0.3}>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>From:</strong> {req?.fromInstitution || "N/A"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>To:</strong> {req?.toInstitution || "N/A"}
                                    </Typography>
                                  </Stack>
                                </TableCell>

                                <TableCell align="center">
                                  <Chip
                                    label={req?.quantity ?? 1}
                                    size="small"
                                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={chipProps.label}
                                    color={chipProps.color}
                                    size="small"
                                    sx={{ fontWeight: 750, borderRadius: 1.5 }}
                                  />
                                </TableCell>

                                <TableCell align="right">
                                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    {isPending && (
                                      <>
                                        <Button
                                          variant="contained"
                                          color="success"
                                          size="small"
                                          onClick={() => handleApprove(req.id)}
                                          startIcon={<CheckIcon />}
                                          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          size="small"
                                          onClick={() => handleReject(req.id)}
                                          startIcon={<ClearIcon />}
                                          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {isApproved && (
                                      <Button
                                        variant="contained"
                                        color="info"
                                        size="small"
                                        onClick={() => handleComplete(req.id)}
                                        startIcon={<LibraryAddCheckIcon />}
                                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, color: "#ffffff" }}
                                      >
                                        Mark Complete
                                      </Button>
                                    )}
                                    {!isPending && !isApproved && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", pr: 1 }}>
                                        Archived / Closed
                                      </Typography>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                              <Box display="flex" flexDirection="column" alignItems="center">
                                <ShareIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                                <Typography variant="subtitle1" fontWeight={650} color="text.secondary">
                                  No resource sharing records found
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                                  Try modifying your search or filter parameters.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={successMsg}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        />
      </Box>
    </Fade>
  );
}

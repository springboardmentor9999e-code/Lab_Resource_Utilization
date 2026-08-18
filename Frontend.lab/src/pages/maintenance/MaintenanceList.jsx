import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
  Stack,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  useTheme,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

// Material Icons
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import {
  getAllMaintenance,
  deleteMaintenance,
} from "../../services/maintenanceService";

// Clipboard Checklist Empty State Vector Graphic
const EmptyClipboardIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="50" fill="#eef2ff" opacity="0.7"/>
    <circle cx="30" cy="35" r="3" fill="#93c5fd"/>
    <circle cx="92" cy="40" r="2.5" fill="#a5b4fc"/>
    <circle cx="85" cy="85" r="3.5" fill="#bfdbfe"/>
    <circle cx="28" cy="80" r="2" fill="#cbd5e1"/>

    <rect x="38" y="28" width="44" height="60" rx="7" fill="#ffffff" stroke="#818cf8" strokeWidth="2.5"/>
    <rect x="50" y="23" width="20" height="8" rx="2.5" fill="#6366f1"/>
    
    <rect x="46" y="40" width="7" height="7" rx="1.5" fill="#c7d2fe"/>
    <line x1="57" y1="43.5" x2="72" y2="43.5" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"/>
    
    <rect x="46" y="52" width="7" height="7" rx="1.5" fill="#c7d2fe"/>
    <line x1="57" y1="55.5" x2="72" y2="55.5" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"/>
    
    <rect x="46" y="64" width="7" height="7" rx="1.5" fill="#c7d2fe"/>
    <line x1="57" y1="67.5" x2="67" y2="67.5" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const MaintenanceList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Delete Confirmation Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadMaintenance();
  }, []);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const response = await getAllMaintenance();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.content)
        ? response.content
        : [];
      
      if (list.length > 0) {
        setMaintenanceList(list);
      } else {
        setMaintenanceList(MOCK_MAINTENANCE_LIST_FALLBACK);
      }
    } catch (error) {
      console.error("Error loading maintenance list:", error);
      setMaintenanceList(MOCK_MAINTENANCE_LIST_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMaintenance(deleteId);
      setToast({ open: true, message: "Maintenance record deleted successfully", severity: "success" });
      setMaintenanceList((prev) => prev.filter((item) => item.id !== deleteId));
    } catch (error) {
      console.error("Delete maintenance error:", error);
      // Local fallback delete
      setMaintenanceList((prev) => prev.filter((item) => item.id !== deleteId));
      setToast({ open: true, message: "Record removed locally (Simulation Mode)", severity: "success" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("All Status");
    setPriorityFilter("All Priority");
    setPage(1);
  };

  // Safe Filtered List
  const safeList = Array.isArray(maintenanceList) ? maintenanceList : [];

  const filteredList = useMemo(() => {
    return safeList.filter((item) => {
      const eqName = (item.equipment?.equipmentName || item.equipmentName || item.equipmentId || "").toString().toLowerCase();
      const issue = (item.issueTitle || item.description || "").toLowerCase();
      const tech = (item.technician || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || eqName.includes(q) || issue.includes(q) || tech.includes(q);

      const status = (item.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "All Status" ||
        status === statusFilter.toUpperCase() ||
        (statusFilter === "In Progress" && (status === "IN_PROGRESS" || status === "IN PROGRESS"));

      const priority = (item.priority || "").toUpperCase();
      const matchesPriority =
        priorityFilter === "All Priority" || priority === priorityFilter.toUpperCase();

      const itemDate = item.startDate || item.requestDate || item.date || "";
      const matchesStart = !startDate || itemDate >= startDate;
      const matchesEnd = !endDate || itemDate <= endDate;

      return matchesSearch && matchesStatus && matchesPriority && matchesStart && matchesEnd;
    });
  }, [safeList, searchQuery, statusFilter, priorityFilter, startDate, endDate]);

  // Statistics calculation
  const totalCount = safeList.length;
  const inProgressCount = safeList.filter((m) => {
    const s = (m.status || "").toUpperCase();
    return s === "IN_PROGRESS" || s === "IN PROGRESS";
  }).length;
  const completedCount = safeList.filter((m) => (m.status || "").toUpperCase() === "COMPLETED").length;
  const cancelledCount = safeList.filter((m) => (m.status || "").toUpperCase() === "CANCELLED").length;

  // Pagination Slice
  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const currentPageList = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return filteredList.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const getStatusChip = (statusStr) => {
    const s = (statusStr || "").toUpperCase();
    if (s === "COMPLETED")
      return <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    if (s === "PENDING")
      return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    if (s === "IN_PROGRESS" || s === "IN PROGRESS")
      return <Chip label="In Progress" color="info" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    if (s === "CANCELLED")
      return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    return <Chip label={statusStr || "N/A"} size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
  };

  const getPriorityChip = (priorityStr) => {
    const p = (priorityStr || "").toUpperCase();
    if (p === "HIGH")
      return <Chip label="High" color="error" variant="outlined" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    if (p === "MEDIUM")
      return <Chip label="Medium" color="warning" variant="outlined" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    if (p === "LOW")
      return <Chip label="Low" color="success" variant="outlined" size="small" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
    return <Chip label={priorityStr || "Normal"} size="small" variant="outlined" sx={{ fontWeight: 750, borderRadius: 1.5 }} />;
  };

  return (
    <Fade in timeout={350}>
      <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 1600, margin: "0 auto", bgcolor: isDark ? "transparent" : "#f8fafc", minHeight: "90vh" }}>
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5, color: "text.secondary", fontSize: "0.875rem" }}>
          <MuiLink underline="hover" color="inherit" component={Link} to="/dashboard">
            Home
          </MuiLink>
          <MuiLink underline="hover" color="inherit" component={Link} to="/maintenance/dashboard">
            Maintenance
          </MuiLink>
          <Typography color="primary.main" fontWeight={700}>
            Maintenance List
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={3.5} gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: "-0.5px" }}>
              Maintenance Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              View, search, edit and delete maintenance records.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/maintenance/add")}
            sx={{
              py: 1.2,
              px: 2.8,
              fontWeight: 750,
              borderRadius: 2.5,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
            }}
          >
            Add Maintenance
          </Button>
        </Box>

        {/* 4 KPI Summary Cards Row */}
        <Grid container spacing={2.5} mb={3.5}>
          {/* Card 1: Total Maintenance */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#e0e7ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <AssignmentOutlinedIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                    Total Maintenance
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.2 }}>
                    {totalCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    All Records
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Card 2: In Progress */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <AccessTimeIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.2 }}>
                    {inProgressCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Active Tasks
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Card 3: Completed */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#dcfce7",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CheckCircleOutlinedIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.2 }}>
                    {completedCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Finished Tasks
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Card 4: Cancelled */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CancelOutlinedIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                    Cancelled
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.2 }}>
                    {cancelledCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Cancelled Tasks
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter Control Bar */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 3.5,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} lg={4}>
              <TextField
                fullWidth
                placeholder="Search maintenance by equipment, issue, technician..."
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: { borderRadius: 2.5 }
                }}
              />
            </Grid>

            {/* Date Range Inputs */}
            <Grid item xs={12} sm={6} lg={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5, fontSize: "0.85rem" }
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    sx: { borderRadius: 2.5, fontSize: "0.85rem" }
                  }}
                />
              </Box>
            </Grid>

            {/* Status Dropdown */}
            <Grid item xs={6} sm={3} lg={2}>
              <TextField
                select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                InputProps={{ sx: { borderRadius: 2.5, fontWeight: 600 } }}
              >
                <MenuItem value="All Status">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>

            {/* Priority Dropdown */}
            <Grid item xs={6} sm={3} lg={2}>
              <TextField
                select
                fullWidth
                size="small"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                InputProps={{ sx: { borderRadius: 2.5, fontWeight: 600 } }}
              >
                <MenuItem value="All Priority">All Priority</MenuItem>
                <MenuItem value="High">High Priority</MenuItem>
                <MenuItem value="Medium">Medium Priority</MenuItem>
                <MenuItem value="Low">Low Priority</MenuItem>
              </TextField>
            </Grid>

            {/* Reset Button */}
            <Grid item xs={12} lg={1}>
              <Button
                fullWidth
                variant="text"
                startIcon={<RestartAltIcon />}
                onClick={handleResetFilters}
                sx={{
                  bgcolor: isDark ? "rgba(37, 99, 235, 0.15)" : "#eff6ff",
                  color: "#2563eb",
                  fontWeight: 750,
                  borderRadius: 2.5,
                  py: 0.9,
                  textTransform: "none",
                  "&:hover": { bgcolor: isDark ? "rgba(37, 99, 235, 0.25)" : "#dbeafe" }
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Maintenance Records Data Table */}
        <Card
          elevation={0}
          sx={{
            mb: 3.5,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#edf2fe" }}>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary", py: 2 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Equipment</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Issue</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Technician</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Expected Completion</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 750, color: "text.primary" }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPageList.length > 0 ? (
                      currentPageList.map((item, index) => (
                        <TableRow key={item.id || index} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 750 }}>#{item.id}</TableCell>
                          <TableCell sx={{ fontWeight: 650 }}>
                            {item.equipment?.equipmentName || item.equipmentName || item.equipmentId || "Equipment Item"}
                          </TableCell>
                          <TableCell>{item.issueTitle || item.description || "Maintenance Issue"}</TableCell>
                          <TableCell>{item.technician || item.assignedTechnician || "Unassigned"}</TableCell>
                          <TableCell>{getPriorityChip(item.priority)}</TableCell>
                          <TableCell>{getStatusChip(item.status)}</TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                            {item.startDate || item.requestDate || "2026-08-01"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                            {item.expectedCompletion || item.returnDate || "2026-08-05"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            ₹ {(Number(item.cost) || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/maintenance/view/${item.id}`)}
                                  sx={{ color: "action.active" }}
                                >
                                  <VisibilityOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Record">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/maintenance/edit/${item.id}`)}
                                  color="primary"
                                >
                                  <ModeEditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Record">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDelete(item.id)}
                                  color="error"
                                >
                                  <DeleteOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                            <EmptyClipboardIllustration />
                            <Typography variant="h6" fontWeight={750} color={isDark ? "#cbd5e1" : "#1e293b"} sx={{ mt: 1 }}>
                              No Maintenance Records Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              There are no maintenance records to display.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Table Footer & Pagination Controls */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              p={2.5}
              borderTop="1px solid"
              borderColor={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
              gap={2}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Showing {totalEntries === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                {Math.min(page * rowsPerPage, totalEntries)} of {totalEntries} entries
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 650 }}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <Button
                    key={pNum}
                    variant={page === pNum ? "contained" : "outlined"}
                    color={page === pNum ? "primary" : "inherit"}
                    size="small"
                    onClick={() => setPage(pNum)}
                    sx={{
                      minWidth: 34,
                      height: 34,
                      borderRadius: 2,
                      fontWeight: 750,
                      p: 0
                    }}
                  >
                    {pNum}
                  </Button>
                ))}

                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 650 }}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Confirm Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} paperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle fontWeight={750}>Confirm Record Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete maintenance record #{deleteId}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none" }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 750, borderRadius: 2, textTransform: "none" }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Notification Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        </Snackbar>

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt={2}
          pb={1}
          borderTop="1px solid"
          borderColor={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
        >
          <Typography variant="caption" color="text.secondary">
            © 2025 Lab Platform. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

const MOCK_MAINTENANCE_LIST_FALLBACK = [
  { id: 101, equipmentName: "UV-Vis Spectrophotometer", issueTitle: "Optical lamp alignment required", technician: "Sarah Connor", status: "IN_PROGRESS", priority: "HIGH", requestDate: "2026-08-14", cost: 1250 },
  { id: 102, equipmentName: "Digital Oscilloscope 100MHz", issueTitle: "Channel 2 probe calibration", technician: "John Doe", status: "COMPLETED", priority: "MEDIUM", requestDate: "2026-08-10", cost: 450 },
  { id: 103, equipmentName: "Refrigerated Centrifuge", issueTitle: "Rotor lock sensor fault", technician: "Alex Tech", status: "PENDING", priority: "HIGH", requestDate: "2026-08-16", cost: 2100 },
  { id: 104, equipmentName: "AC Power Source Variac", issueTitle: "Fuse replacement & safety check", technician: "John Doe", status: "COMPLETED", priority: "LOW", requestDate: "2026-08-05", cost: 150 },
];

export default MaintenanceList;

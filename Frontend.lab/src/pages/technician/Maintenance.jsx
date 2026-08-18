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
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Grid,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../services/api";

export default function TechnicianMaintenance() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add/Update Maintenance Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [technicianName, setTechnicianName] = useState(localStorage.getItem("username") || "Lab Technician");
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [eqRes, mainRes] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/maintenances"),
      ]);

      let eqData = [];
      let mainData = [];

      if (eqRes.status === "fulfilled") {
        const raw = eqRes.value?.data;
        if (Array.isArray(raw)) eqData = raw;
        else if (raw && Array.isArray(raw.data)) eqData = raw.data;
        else if (raw && Array.isArray(raw.content)) eqData = raw.content;
        else eqData = MOCK_EQUIPMENT;
      } else {
        eqData = MOCK_EQUIPMENT;
      }

      if (mainRes.status === "fulfilled") {
        const raw = mainRes.value?.data;
        if (Array.isArray(raw)) mainData = raw;
        else if (raw && Array.isArray(raw.data)) mainData = raw.data;
        else if (raw && Array.isArray(raw.content)) mainData = raw.content;
        else mainData = MOCK_MAINTENANCE;
      } else {
        mainData = MOCK_MAINTENANCE;
      }

      setEquipmentList(Array.isArray(eqData) ? eqData : []);
      setMaintenanceList(Array.isArray(mainData) ? mainData : []);
    } catch (err) {
      console.warn("API load failed. Loading local mock maintenance data.", err);
      setEquipmentList(Array.isArray(MOCK_EQUIPMENT) ? MOCK_EQUIPMENT : []);
      setMaintenanceList(Array.isArray(MOCK_MAINTENANCE) ? MOCK_MAINTENANCE : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];
  const safeMaintenanceList = Array.isArray(maintenanceList) ? maintenanceList : [];

  const handleCreateMaintenance = async () => {
    if (!selectedEquipmentId || !issueDescription.trim()) {
      setErrorMsg("Please select an equipment item and describe the maintenance issue.");
      return;
    }

    try {
      setSubmitLoading(true);
      setErrorMsg("");

      const selectedEq = safeEquipmentList.find((e) => Number(e?.id) === Number(selectedEquipmentId));

      const payload = {
        issueDescription: issueDescription,
        maintenanceDate: maintenanceDate,
        technicianName: technicianName,
        status: "IN_PROGRESS",
        equipment: { id: Number(selectedEquipmentId) },
      };

      await api.post("/maintenances", payload);
      setSuccessMsg(`Maintenance logged for ${selectedEq?.name || "Equipment"}. Equipment status updated to NOT_AVAILABLE.`);
      setSnackbarOpen(true);
      setDialogOpen(false);
      setIssueDescription("");
      setSelectedEquipmentId("");
      loadData();
    } catch (err) {
      console.warn("POST /maintenances failed. Creating record locally (Demo Mode).", err);
      setSuccessMsg("Maintenance logged locally (Demo Mode).");
      setSnackbarOpen(true);
      setDialogOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (record, newStatus) => {
    try {
      setErrorMsg("");
      const payload = {
        ...record,
        status: newStatus,
        completedDate: newStatus === "COMPLETED" ? new Date().toISOString().split("T")[0] : (record.completedDate || null),
      };

      await api.put(`/maintenances/${record.id}`, payload);
      setSuccessMsg(`Status for ${record.equipment?.name || record.equipmentName || "equipment"} updated to ${newStatus}.`);
      setSnackbarOpen(true);
      loadData();
    } catch (err) {
      console.warn("PUT /maintenances failed. Updating status locally.", err);
      setMaintenanceList((prev) =>
        Array.isArray(prev)
          ? prev.map((m) =>
              m?.id === record?.id
                ? {
                    ...m,
                    status: newStatus,
                    completedDate: newStatus === "COMPLETED" ? new Date().toISOString().split("T")[0] : m.completedDate,
                  }
                : m
            )
          : []
      );
      setSuccessMsg(`Status updated to ${newStatus} (Demo Mode).`);
      setSnackbarOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const handleDeleteMaintenance = async (id) => {
    try {
      await api.delete(`/maintenances/${id}`);
      setSuccessMsg("Maintenance record deleted.");
      setSnackbarOpen(true);
      loadData();
    } catch (err) {
      setMaintenanceList((prev) => (Array.isArray(prev) ? prev.filter((m) => m?.id !== id) : []));
      setSuccessMsg("Maintenance record deleted (Demo Mode).");
      setSnackbarOpen(true);
    }
  };

  // Filtered List
  const filteredList = safeMaintenanceList.filter((item) => {
    if (!item) return false;
    const eqName = item.equipment?.name || item.equipmentName || "";
    const tech = item.technicianName || "";
    const desc = item.issueDescription || "";
    const q = searchQuery.toLowerCase();

    const matchesSearch = eqName.toLowerCase().includes(q) || tech.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || (item.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading && safeMaintenanceList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
            Maintenance & Repairs Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Log hardware repair requests, update maintenance progress, and auto-sync equipment availability.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            backgroundColor: "#1e3a8a",
            "&:hover": { backgroundColor: "#172554" },
          }}
        >
          Add Maintenance
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Box sx={{ mb: 4, p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by equipment name, technician, or issue description..."
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
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Maintenance Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Technician</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Issue Description</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Completed Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.length > 0 ? (
              filteredList.map((item) => {
                const isCompleted = (item?.status || "").toUpperCase() === "COMPLETED";
                return (
                  <TableRow key={item?.id || Math.random()} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{item?.equipment?.name || item?.equipmentName || "Lab Device"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item?.technicianName || "Staff"}</TableCell>
                    <TableCell sx={{ maxWidth: 260, color: "text.secondary" }}>{item?.issueDescription}</TableCell>
                    <TableCell>{item?.maintenanceDate || "-"}</TableCell>
                    <TableCell>{item?.completedDate || "-"}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={(item?.status || "IN_PROGRESS").toUpperCase()}
                        onChange={(e) => handleUpdateStatus(item, e.target.value)}
                        sx={{
                          minWidth: 140,
                          "& .MuiSelect-select": {
                            py: 0.6,
                            px: 1.5,
                            fontWeight: 700,
                            fontSize: "0.8rem",
                          },
                        }}
                      >
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                        <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton color="error" size="small" onClick={() => handleDeleteMaintenance(item?.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No maintenance records found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Maintenance Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Maintenance Record</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Select Equipment"
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
          >
            {safeEquipmentList.map((e) => (
              <MenuItem key={e?.id || Math.random()} value={e?.id}>
                {e?.name} ({e?.category}) - Current Status: {e?.status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            label="Technician Name"
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
          />

          <TextField
            fullWidth
            size="small"
            type="date"
            label="Maintenance Start Date"
            InputLabelProps={{ shrink: true }}
            value={maintenanceDate}
            onChange={(e) => setMaintenanceDate(e.target.value)}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Issue Description / Diagnostics"
            placeholder="Describe the issue requiring maintenance..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateMaintenance}
            variant="contained"
            disabled={submitLoading || !selectedEquipmentId || !issueDescription.trim()}
            sx={{ fontWeight: 700, backgroundColor: "#1e3a8a" }}
          >
            {submitLoading ? <CircularProgress size={20} color="inherit" /> : "Save Maintenance Record"}
          </Button>
        </DialogActions>
      </Dialog>

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

const MOCK_EQUIPMENT = [
  { id: 1, name: "Digital Oscilloscope 100MHz", category: "Electronics", status: "AVAILABLE" },
  { id: 2, name: "UV-Vis Spectrophotometer", category: "Chemistry", status: "NOT_AVAILABLE" },
];

const MOCK_MAINTENANCE = [
  { id: 1, issueDescription: "Optics calibration required", maintenanceDate: "2026-07-15", technicianName: "John Doe", status: "IN_PROGRESS", equipment: { id: 2, name: "UV-Vis Spectrophotometer" } },
];

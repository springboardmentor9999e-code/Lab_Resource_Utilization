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
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../api/axiosConfig";

export default function TechnicianEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal States
  const [viewItem, setViewItem] = useState(null);
  const [statusItem, setStatusItem] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("Available");

  const statuses = ["Available", "Booked", "Maintenance", "Unavailable"];

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/equipment");
      setEquipmentList(response.data || []);
    } catch (err) {
      console.warn("Failed to fetch equipment catalog. Loading demo catalog.", err);
      setEquipmentList(MOCK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleUpdateStatusSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      
      const payload = {
        ...statusItem,
        status: updatedStatus,
        availableQuantity: updatedStatus === "Available" ? statusItem.quantity : statusItem.availableQuantity,
      };

      await api.put(`/equipment/${statusItem.id || statusItem._id}`, payload);
      setSuccess(`Updated status of ${statusItem.name} to ${updatedStatus} successfully!`);
      setStatusItem(null);
      loadEquipment();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Update status API failed. Simulating locally (Demo Mode)...", err);
      
      setEquipmentList((prev) =>
        prev.map((item) =>
          (item.id || item._id) === (statusItem.id || statusItem._id)
            ? {
                ...item,
                status: updatedStatus,
                availableQuantity: updatedStatus === "Available" ? item.quantity : item.availableQuantity,
              }
            : item
        )
      );

      setSuccess(`Updated status of ${statusItem.name} to ${updatedStatus} (Demo Mode).`);
      setStatusItem(null);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const handleQuickComplete = async (item) => {
    try {
      setError("");
      setSuccess("");
      
      const payload = {
        ...item,
        status: "Available",
        availableQuantity: item.quantity,
      };

      await api.put(`/equipment/${item.id || item._id}`, payload);
      setSuccess(`Marked maintenance complete for ${item.name}!`);
      loadEquipment();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Quick complete API failed. Simulating locally...", err);
      
      setEquipmentList((prev) =>
        prev.map((eq) =>
          (eq.id || eq._id) === (item.id || item._id)
            ? { ...eq, status: "Available", availableQuantity: eq.quantity }
            : eq
        )
      );

      setSuccess(`Marked maintenance complete for ${item.name} (Demo Mode).`);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "booked":
        return "warning";
      case "maintenance":
      case "under maintenance":
        return "error";
      case "unavailable":
      default:
        return "default";
    }
  };

  if (loading && equipmentList.length === 0) {
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
          Technician Equipment Log
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor laboratory assets, update status details, and manage resource maintenance loops.
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

      {/* Equipment Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipmentList.map((item) => {
              const itemId = item.id || item._id;
              const isMaintenance = item.status?.toLowerCase() === "maintenance" || item.status?.toLowerCase() === "under maintenance";
              
              return (
                <TableRow key={itemId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      {/* View Details */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setViewItem(item)}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        View
                      </Button>

                      {/* Update Status */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<BuildIcon />}
                        onClick={() => {
                          setStatusItem(item);
                          setUpdatedStatus(item.status);
                        }}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        Status
                      </Button>

                      {/* Mark Maintenance Complete */}
                      {isMaintenance && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleQuickComplete(item)}
                          sx={{ borderRadius: 1.5, textTransform: "none" }}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{viewItem?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="text.secondary">Description</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{viewItem?.description || "No description provided."}</Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Category</Typography>
              <Typography variant="body1" fontWeight={600}>{viewItem?.category}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Typography variant="body1" fontWeight={600}>{viewItem?.status}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Total Quantity</Typography>
              <Typography variant="body1">{viewItem?.quantity}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Available Quantity</Typography>
              <Typography variant="body1">{viewItem?.availableQuantity}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewItem(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusItem} onClose={() => setStatusItem(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Update Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Change operational status for <strong>{statusItem?.name}</strong>.
          </Typography>
          <TextField
            fullWidth
            select
            label="Operational Status"
            value={updatedStatus}
            onChange={(e) => setUpdatedStatus(e.target.value)}
            sx={{ mt: 1 }}
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button onClick={() => setStatusItem(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleUpdateStatusSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", description: "Dual-channel oscilloscope.", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", description: "High-precision spectrometer.", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Booked" },
  { id: "3", name: "Refrigerated Centrifuge", description: "High-speed laboratory centrifuge.", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available" },
  { id: "5", name: "AC Power Source Variac", description: "Variable AC power source.", category: "Electronics", quantity: 6, availableQuantity: 4, status: "Maintenance" },
];

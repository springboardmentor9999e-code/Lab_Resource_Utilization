import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Pagination,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../../services/api";

export default function TechnicianEquipmentManagement() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/equipment");
      console.log("Equipment API response:", response.data);

      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        data = response.data.content;
      } else {
        data = [];
      }
      setEquipmentList(data);
    } catch (err) {
      console.warn("GET /equipment failed. Loading local mock catalog.", err);
      setEquipmentList(Array.isArray(MOCK_EQUIPMENT) ? MOCK_EQUIPMENT : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id || deleteTarget._id;

    try {
      setErrorMsg("");
      await api.delete(`/equipment/${targetId}`);
      setSuccessMsg(`Successfully deleted ${deleteTarget.name}.`);
      setSnackbarOpen(true);
      setDeleteTarget(null);
      loadEquipment();
    } catch (err) {
      const serverError = err.response?.data?.message || err.message;
      if (err.response) {
        setErrorMsg(serverError || "Deletion failed: Equipment has active bookings or dependencies.");
      } else {
        console.warn("DELETE /equipment failed. Removing locally (Demo Mode).", err);
        setEquipmentList((prev) =>
          Array.isArray(prev) ? prev.filter((e) => (e?.id || e?._id) !== targetId) : []
        );
        setSuccessMsg(`Successfully deleted ${deleteTarget.name} (Demo Mode).`);
        setSnackbarOpen(true);
      }
      setDeleteTarget(null);
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
      default:
        return "default";
    }
  };

  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];

  const categories = ["All", ...new Set(safeEquipmentList.map((item) => item?.category).filter(Boolean))];

  // Filters
  const filteredList = safeEquipmentList.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.name || "")?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "")?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedList = Array.isArray(filteredList)
    ? filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : [];

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  if (loading && equipmentList.length === 0) {
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
            Equipment Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create new items, modify existing parameters, or remove device catalogs.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/technician/equipment/add")}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            backgroundColor: "#1e3a8a",
            "&:hover": { backgroundColor: "#172554" },
          }}
        >
          Add Equipment
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Filter Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by equipment name, details..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Equipment Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Quantity</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Available Quantity</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedList.length > 0 ? (
              paginatedList.map((item) => {
                const itemId = item.id || item._id;
                return (
                  <TableRow key={itemId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" sx={{ backgroundColor: "#f1f5f9", fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{item.availableQuantity}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={getStatusColor(item.status)} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/equipment/${itemId}`)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/technician/equipment/edit/${itemId}`)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(item)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No items registered.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> from the system catalog?
            This will clear all booking history associated with it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ fontWeight: 700 }}>
            Delete
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
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Maintenance" },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available" },
];

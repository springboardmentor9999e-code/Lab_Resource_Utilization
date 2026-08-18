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
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api/axiosConfig";

export default function AdminEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal States
  const [viewItem, setViewItem] = useState(null);
  const [formItem, setFormItem] = useState(null); // Used for both Add and Edit
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    availableQuantity: 0,
    status: "Available",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const statuses = ["Available", "Booked", "Maintenance", "Unavailable"];
  const categories = ["Electronics", "Chemistry", "Biology", "General"];

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/equipment");
      setEquipmentList(response.data || []);
    } catch (err) {
      console.warn("Failed to fetch equipment catalog. Loading mock catalog.", err);
      setEquipmentList(MOCK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      category: "Electronics",
      quantity: 1,
      availableQuantity: 1,
      status: "Available",
      description: "",
    });
    setFormErrors({});
    setFormItem({}); // Open Modal
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setFormItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "Electronics",
      quantity: item.quantity || 0,
      availableQuantity: item.availableQuantity || 0,
      status: item.status || "Available",
      description: item.description || "",
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-set available quantity to match quantity when adding/editing if needed
      if (name === "quantity") {
        updated.availableQuantity = parseInt(value) || 0;
      }
      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Equipment name is required.";
      isValid = false;
    }
    if (!formData.category) {
      errors.category = "Category is required.";
      isValid = false;
    }
    if (formData.quantity < 1) {
      errors.quantity = "Quantity must be at least 1.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setSuccess("");

    try {
      if (isEditMode) {
        // Edit Operation
        const id = formItem.id || formItem._id;
        await api.put(`/equipment/${id}`, formData);
        setSuccess(`Successfully updated ${formData.name}.`);
      } else {
        // Add Operation
        await api.post("/equipment", formData);
        setSuccess(`Successfully added ${formData.name} to the catalog.`);
      }
      setFormItem(null);
      loadEquipment();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Equipment submit API failed. Simulating locally...", err);

      if (isEditMode) {
        setEquipmentList((prev) =>
          prev.map((eq) =>
            (eq.id || eq._id) === (formItem.id || formItem._id) ? { ...eq, ...formData } : eq
          )
        );
        setSuccess(`Successfully updated ${formData.name} (Demo Mode).`);
      } else {
        const newItem = {
          id: String(Date.now()),
          ...formData,
        };
        setEquipmentList([newItem, ...equipmentList]);
        setSuccess(`Successfully added ${formData.name} (Demo Mode).`);
      }
      setFormItem(null);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const handleDelete = async (item) => {
    const id = item.id || item._id;
    if (window.confirm(`Are you sure you want to delete ${item.name} from the directory?`)) {
      try {
        setError("");
        setSuccess("");
        await api.delete(`/equipment/${id}`);
        setSuccess(`Successfully deleted ${item.name}.`);
        loadEquipment();
        setTimeout(() => setSuccess(""), 4000);
      } catch (err) {
        console.warn("Delete API failed. Simulating locally...", err);

        setEquipmentList((prev) => prev.filter((eq) => (eq.id || eq._id) !== id));
        setSuccess(`Deleted ${item.name} (Demo Mode).`);
        setTimeout(() => setSuccess(""), 4000);
      }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Equipment Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create new items, edit parameters, view detailed status, and delete entries.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Add Equipment
        </Button>
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
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Available</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipmentList.map((item) => {
              const itemId = item.id || item._id;
              
              return (
                <TableRow key={itemId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="center">{item.availableQuantity}</TableCell>
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

                      {/* Edit */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditModal(item)}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        Edit
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(item)}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
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

      {/* Add / Edit Form Dialog */}
      <Dialog open={!!formItem} onClose={() => setFormItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{isEditMode ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Equipment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Available Quantity"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleFormChange}
                  inputProps={{ min: 0, max: formData.quantity }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button onClick={() => setFormItem(null)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogActions>
        </Box>
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

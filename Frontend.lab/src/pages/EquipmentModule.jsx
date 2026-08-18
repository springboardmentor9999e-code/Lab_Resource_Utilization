import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Divider,
  Container,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../services/api";

// Fallback laboratories if API is offline
const MOCK_LABS = [
  { id: 1, labName: "Electronics & Circuits Lab", location: "Building A, Room 101" },
  { id: 2, labName: "Biochemistry & Molecular Lab", location: "Building B, Room 204" },
  { id: 3, labName: "Mechanical Robotics Lab", location: "Building C, Room 302" },
  { id: 4, labName: "Computer Vision & AI Lab", location: "Building D, Room 405" },
];

// Fallback equipment list if API is offline
const MOCK_EQUIPMENT = [
  {
    id: 101,
    name: "Digital Oscilloscope 100MHz",
    description: "Dual-channel digital storage oscilloscope for signal analysis.",
    category: "Electronics",
    quantity: 10,
    availableQuantity: 8,
    status: "AVAILABLE",
    laboratory: { id: 1, labName: "Electronics & Circuits Lab" },
  },
  {
    id: 102,
    name: "High-Speed Centrifuge Machine",
    description: "Refrigerated benchtop centrifuge 15,000 RPM.",
    category: "Biochemistry",
    quantity: 4,
    availableQuantity: 0,
    status: "NOT_AVAILABLE",
    laboratory: { id: 2, labName: "Biochemistry & Molecular Lab" },
  },
  {
    id: 103,
    name: "6-DOF Robotic Arm Trainer",
    description: "Programmable articulated robotic arm with servo controllers.",
    category: "Robotics",
    quantity: 6,
    availableQuantity: 5,
    status: "AVAILABLE",
    laboratory: { id: 3, labName: "Mechanical Robotics Lab" },
  },
];

const CATEGORY_OPTIONS = [
  "Electronics",
  "Biochemistry",
  "Robotics",
  "Computer Science",
  "Physics",
  "Mechanical",
  "General Scientific",
];

export default function EquipmentModule() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Data States
  const [laboratories, setLaboratories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labsLoading, setLabsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Notification Toast States
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "success" });

  // Form State (New Equipment)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Electronics",
    quantity: 1,
    availableQuantity: 1,
    status: "AVAILABLE",
    laboratoryId: "",
  });

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    name: "",
    description: "",
    category: "",
    quantity: 1,
    availableQuantity: 1,
    status: "AVAILABLE",
    laboratoryId: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Confirmation Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Helper Toast Alert
  const showToast = (message, severity = "success") => {
    setAlertInfo({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setAlertInfo((prev) => ({ ...prev, open: false }));
  };

  // 1. Fetch Laboratories from GET /api/laboratories
  const fetchLaboratories = async () => {
    try {
      setLabsLoading(true);
      const res = await api.get("/laboratories");
      const data = Array.isArray(res.data) ? res.data : [];
      setLaboratories(data.length > 0 ? data : MOCK_LABS);
      if (data.length > 0 && !formData.laboratoryId) {
        setFormData((prev) => ({ ...prev, laboratoryId: data[0].id }));
      } else if (MOCK_LABS.length > 0 && !formData.laboratoryId) {
        setFormData((prev) => ({ ...prev, laboratoryId: MOCK_LABS[0].id }));
      }
    } catch (err) {
      console.warn("Failed to fetch laboratories from API. Using demo data.", err);
      setLaboratories(MOCK_LABS);
      if (MOCK_LABS.length > 0 && !formData.laboratoryId) {
        setFormData((prev) => ({ ...prev, laboratoryId: MOCK_LABS[0].id }));
      }
    } finally {
      setLabsLoading(false);
    }
  };

  // 2. Fetch Equipment from GET /api/equipment
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await api.get("/equipment");
      const data = Array.isArray(res.data) ? res.data : [];
      setEquipmentList(data.length > 0 ? data : MOCK_EQUIPMENT);
    } catch (err) {
      console.warn("Failed to fetch equipment list from API. Using demo catalog.", err);
      setEquipmentList(MOCK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaboratories();
    fetchEquipment();
  }, []);

  // Handle Form Change for Add Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Keep availableQuantity bounded by total quantity if quantity changes
      if (name === "quantity") {
        const qtyNum = parseInt(value, 10) || 0;
        if (parseInt(prev.availableQuantity, 10) > qtyNum) {
          updated.availableQuantity = qtyNum;
        }
      }
      return updated;
    });
  };

  // 3. Submit New Equipment via POST /api/equipment
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Equipment Name is required", "error");
      return;
    }
    if (!formData.laboratoryId) {
      showToast("Please select a Laboratory", "error");
      return;
    }

    const selectedLab = laboratories.find(
      (lab) => String(lab.id) === String(formData.laboratoryId)
    );

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || `${formData.name} for laboratory usage.`,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10) || 1,
      availableQuantity: parseInt(formData.availableQuantity, 10) || 0,
      status: formData.status,
      laboratory: selectedLab ? { id: selectedLab.id } : { id: parseInt(formData.laboratoryId, 10) },
    };

    try {
      setFormLoading(true);
      const res = await api.post("/equipment", payload);
      showToast("Equipment added successfully!", "success");

      // Reset Form
      setFormData({
        name: "",
        description: "",
        category: "Electronics",
        quantity: 1,
        availableQuantity: 1,
        status: "AVAILABLE",
        laboratoryId: laboratories[0]?.id || "",
      });

      // Refresh list
      fetchEquipment();
    } catch (err) {
      console.warn("POST /api/equipment call failed. Adding item locally.", err);
      // Demo local append fallback
      const createdItem = {
        id: Date.now(),
        ...payload,
        laboratory: selectedLab || { id: formData.laboratoryId, labName: `Lab #${formData.laboratoryId}` },
      };
      setEquipmentList((prev) => [createdItem, ...prev]);
      showToast("Equipment created (Demo Mode)", "info");

      // Reset Form
      setFormData({
        name: "",
        description: "",
        category: "Electronics",
        quantity: 1,
        availableQuantity: 1,
        status: "AVAILABLE",
        laboratoryId: laboratories[0]?.id || "",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // 4. Edit Equipment Actions
  const handleOpenEdit = (item) => {
    setEditData({
      id: item.id,
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Electronics",
      quantity: item.quantity || 1,
      availableQuantity: item.availableQuantity ?? 1,
      status: item.status || "AVAILABLE",
      laboratoryId: item.laboratory?.id || item.laboratoryId || (laboratories[0]?.id || ""),
    });
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "quantity") {
        const qtyNum = parseInt(value, 10) || 0;
        if (parseInt(prev.availableQuantity, 10) > qtyNum) {
          updated.availableQuantity = qtyNum;
        }
      }
      return updated;
    });
  };

  const handleEditSubmit = async () => {
    if (!editData.name.trim()) {
      showToast("Equipment Name is required", "error");
      return;
    }

    const selectedLab = laboratories.find(
      (lab) => String(lab.id) === String(editData.laboratoryId)
    );

    const payload = {
      name: editData.name.trim(),
      description: editData.description.trim() || `${editData.name} details.`,
      category: editData.category,
      quantity: parseInt(editData.quantity, 10) || 1,
      availableQuantity: parseInt(editData.availableQuantity, 10) || 0,
      status: editData.status,
      laboratory: selectedLab ? { id: selectedLab.id } : { id: parseInt(editData.laboratoryId, 10) },
    };

    try {
      setEditLoading(true);
      await api.put(`/equipment/${editData.id}`, payload);
      showToast("Equipment updated successfully!", "success");
      setEditDialogOpen(false);
      fetchEquipment();
    } catch (err) {
      console.warn(`PUT /api/equipment/${editData.id} failed. Updating locally.`, err);
      setEquipmentList((prev) =>
        prev.map((item) =>
          item.id === editData.id
            ? {
                ...item,
                ...payload,
                laboratory: selectedLab || item.laboratory,
              }
            : item
        )
      );
      showToast("Equipment updated (Demo Mode)", "info");
      setEditDialogOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  // 5. Delete Equipment Actions
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/equipment/${itemToDelete.id}`);
      showToast("Equipment deleted successfully!", "success");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchEquipment();
    } catch (err) {
      console.warn(`DELETE /api/equipment/${itemToDelete.id} failed. Removing locally.`, err);
      setEquipmentList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast("Equipment removed (Demo Mode)", "info");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper renderer for Laboratory Name
  const getLabName = (item) => {
    if (item.laboratory && (item.laboratory.labName || item.laboratory.name)) {
      return item.laboratory.labName || item.laboratory.name;
    }
    const foundLab = laboratories.find(
      (lab) => String(lab.id) === String(item.laboratoryId || item.laboratory?.id)
    );
    if (foundLab) {
      return foundLab.labName || foundLab.name;
    }
    return "Unassigned Laboratory";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Banner */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <ScienceIcon color="primary" sx={{ fontSize: 36 }} />
            Equipment Management Module
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create, manage, and monitor laboratory equipment inventory across university facilities.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchLaboratories();
            fetchEquipment();
          }}
          sx={{ borderRadius: 2 }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Main Grid: Form on Top/Left, Equipment Table on Bottom/Right */}
      <Grid container spacing={4}>
        {/* ADD EQUIPMENT FORM CARD */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              boxShadow: isDark
                ? "none"
                : "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: theme.palette.primary.main,
                }}
              >
                <AddIcon fontSize="small" />
                Add New Equipment
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleFormSubmit} noValidate>
                <Grid container spacing={2.5}>
                  {/* Equipment Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      label="Equipment Name"
                      name="name"
                      placeholder="e.g. Digital Oscilloscope 100MHz"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Laboratory Dropdown (Fetched from GET /api/laboratories) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      select
                      size="small"
                      label="Laboratory Facility"
                      name="laboratoryId"
                      value={formData.laboratoryId}
                      onChange={handleInputChange}
                      disabled={labsLoading}
                      helperText={
                        labsLoading
                          ? "Loading laboratories list..."
                          : "Select the assigned lab facility"
                      }
                    >
                      {laboratories.map((lab) => (
                        <MenuItem key={lab.id} value={lab.id}>
                          {lab.labName || lab.name || `Lab #${lab.id}`}
                          {lab.location ? ` (${lab.location})` : ""}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Category */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      select
                      size="small"
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Status Dropdown */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      select
                      size="small"
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                      <MenuItem value="NOT_AVAILABLE">NOT_AVAILABLE</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Quantity */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      size="small"
                      label="Total Quantity"
                      name="quantity"
                      inputProps={{ min: 1 }}
                      value={formData.quantity}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Available Quantity */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      size="small"
                      label="Available Quantity"
                      name="availableQuantity"
                      inputProps={{ min: 0, max: formData.quantity }}
                      value={formData.availableQuantity}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      label="Description"
                      name="description"
                      placeholder="Enter technical specifications or operational details..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={formLoading}
                      startIcon={
                        formLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <AddIcon />
                        )
                      }
                      sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                    >
                      {formLoading ? "Saving Equipment..." : "Save Equipment"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* EQUIPMENT TABLE CARD */}
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              boxShadow: isDark
                ? "none"
                : "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Equipment Inventory Registry ({equipmentList.length})
                </Typography>
                <Chip
                  label={`${equipmentList.filter((e) => e.status === "AVAILABLE").length} Available`}
                  color="success"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Table Container */}
              <TableContainer component={Paper} elevation={0} sx={{ border: "none" }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Equipment Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Laboratory</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Quantity
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Available
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Status
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={36} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            Synchronizing equipment catalog...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : equipmentList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            No equipment items registered yet.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Use the form on the left to add your first lab equipment.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipmentList.map((item) => {
                        const isAvailable = item.status === "AVAILABLE";
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            {/* Equipment Name & Description */}
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {item.name}
                              </Typography>
                              {item.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Laboratory */}
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {getLabName(item)}
                              </Typography>
                            </TableCell>

                            {/* Category */}
                            <TableCell>
                              <Chip
                                label={item.category || "General"}
                                size="small"
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "#e0f2fe",
                                  color: isDark ? "#60a5fa" : "#0369a1",
                                }}
                              />
                            </TableCell>

                            {/* Quantity */}
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.quantity}
                              </Typography>
                            </TableCell>

                            {/* Available Quantity */}
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: item.availableQuantity > 0 ? "success.main" : "error.main",
                                }}
                              >
                                {item.availableQuantity}
                              </Typography>
                            </TableCell>

                            {/* Status */}
                            <TableCell align="center">
                              <Chip
                                icon={
                                  isAvailable ? (
                                    <CheckCircleIcon style={{ fontSize: 14 }} />
                                  ) : (
                                    <CancelIcon style={{ fontSize: 14 }} />
                                  )
                                }
                                label={isAvailable ? "AVAILABLE" : "NOT_AVAILABLE"}
                                color={isAvailable ? "success" : "error"}
                                size="small"
                                variant={isDark ? "outlined" : "filled"}
                                sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                              />
                            </TableCell>

                            {/* Edit & Delete Actions */}
                            <TableCell align="right">
                              <Tooltip title="Edit Equipment">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenEdit(item)}
                                  sx={{ mr: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Equipment">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDelete(item)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* EDIT EQUIPMENT DIALOG */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Equipment Parameters</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                size="small"
                label="Equipment Name"
                name="name"
                value={editData.name}
                onChange={handleEditInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Laboratory Facility"
                name="laboratoryId"
                value={editData.laboratoryId}
                onChange={handleEditInputChange}
              >
                {laboratories.map((lab) => (
                  <MenuItem key={lab.id} value={lab.id}>
                    {lab.labName || lab.name || `Lab #${lab.id}`}
                    {lab.location ? ` (${lab.location})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Category"
                name="category"
                value={editData.category}
                onChange={handleEditInputChange}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Status"
                name="status"
                value={editData.status}
                onChange={handleEditInputChange}
              >
                <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                <MenuItem value="NOT_AVAILABLE">NOT_AVAILABLE</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Total Quantity"
                name="quantity"
                inputProps={{ min: 1 }}
                value={editData.quantity}
                onChange={handleEditInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Available Quantity"
                name="availableQuantity"
                inputProps={{ min: 0, max: editData.quantity }}
                value={editData.availableQuantity}
                onChange={handleEditInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Description"
                name="description"
                value={editData.description}
                onChange={handleEditInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ fontWeight: 700 }}
          >
            {editLoading ? "Updating..." : "Update Equipment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Confirm Equipment Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action will
            remove the equipment item from the facility inventory.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ fontWeight: 700 }}
          >
            {deleteLoading ? "Deleting..." : "Delete Equipment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GLOBAL TOAST NOTIFICATION */}
      <Snackbar
        open={alertInfo.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={alertInfo.severity}
          variant="filled"
          sx={{ width: "100%", fontWeight: 600, borderRadius: 2 }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

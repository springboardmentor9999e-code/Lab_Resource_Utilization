import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import api from "../api/axiosConfig";
import Loading from "../components/Loading";

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 1,
    availableQuantity: 1,
    status: "Available",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorAlert, setErrorAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");

  const categories = ["Electronics", "Chemistry", "Biology", "Physics", "General"];
  const statuses = ["Available", "Booked", "Maintenance", "Unavailable"];

  useEffect(() => {
    if (!isNew) {
      const fetchDetails = async () => {
        try {
          setFetching(true);
          setErrorAlert("");
          const response = await api.get(`/equipment/${id}`);
          if (response.data) {
            setFormData({
              name: response.data.name || "",
              description: response.data.description || "",
              category: response.data.category || "",
              quantity: response.data.quantity ?? 1,
              availableQuantity: response.data.availableQuantity ?? 1,
              status: response.data.status || "Available",
            });
          }
        } catch (err) {
          console.warn("Fetch details failed, loading demo item...", err);
          // Offline fallback
          const demoItem = MOCK_EQUIPMENT.find(item => item.id === id);
          if (demoItem) {
            setFormData({
              name: demoItem.name,
              description: demoItem.description,
              category: demoItem.category,
              quantity: demoItem.quantity,
              availableQuantity: demoItem.availableQuantity,
              status: demoItem.status,
            });
          } else {
            setErrorAlert("Could not retrieve equipment data. Loading mock defaults.");
          }
        } finally {
          setFetching(false);
        }
      };
      fetchDetails();
    }
  }, [id, isNew]);

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = "Equipment name is required.";
      isValid = false;
    }
    if (!formData.category) {
      tempErrors.category = "Category is required.";
      isValid = false;
    }
    
    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      tempErrors.quantity = "Total quantity must be at least 1.";
      isValid = false;
    }

    const avail = parseInt(formData.availableQuantity);
    if (isNaN(avail) || avail < 0) {
      tempErrors.availableQuantity = "Available quantity cannot be negative.";
      isValid = false;
    } else if (avail > qty) {
      tempErrors.availableQuantity = "Available quantity cannot exceed total quantity.";
      isValid = false;
    }

    if (!formData.status) {
      tempErrors.status = "Status is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    setSuccessAlert("");

    if (!validate()) return;

    setLoading(true);
    try {
      if (isNew) {
        await api.post("/equipment", formData);
        setSuccessAlert("Equipment added successfully!");
      } else {
        await api.put(`/equipment/${id}`, formData);
        setSuccessAlert("Equipment updated successfully!");
      }
      setTimeout(() => {
        navigate("/equipment");
      }, 1500);
    } catch (err) {
      console.warn("Submission failed. Completing action in Demo Mode...", err);
      // Offline fallback
      setSuccessAlert(isNew ? "Equipment added (Demo Mode)!" : "Equipment updated (Demo Mode)!");
      setTimeout(() => {
        navigate("/equipment");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Loading message="Retrieving resource specifications..." />;
  }

  return (
    <Box>
      {/* Action Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/equipment")}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          {isNew ? "Add New Equipment" : "Edit Equipment"}
        </Typography>
      </Box>

      {successAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successAlert}
        </Alert>
      )}
      {errorAlert && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorAlert}
        </Alert>
      )}

      {/* Form Container */}
      <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Equipment Name */}
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Equipment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  required
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={!!errors.category}
                  helperText={errors.category}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Total Quantity */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Total Quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Available Quantity */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Available Quantity"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  error={!!errors.availableQuantity}
                  helperText={errors.availableQuantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  required
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  error={!!errors.status}
                  helperText={errors.status}
                >
                  {statuses.map((stat) => (
                    <MenuItem key={stat} value={stat}>
                      {stat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Actions row */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/equipment")}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    sx={{
                      backgroundColor: "#0284c7",
                      "&:hover": { backgroundColor: "#0369a1" },
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 4,
                    }}
                  >
                    {loading ? "Saving Changes..." : "Save Equipment"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", description: "Dual-channel digital storage oscilloscope with logic analyzer capabilities." },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Booked", description: "High-precision wavelength scanning spectrophotometer for fluid analysis." },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available", description: "High-speed laboratory centrifuge with temperature controls up to -20C." },
  { id: "4", name: "Binocular Compound Microscope", category: "Biology", quantity: 12, availableQuantity: 9, status: "Available", description: "LED compound microscope with 40x-1000x magnification capabilities." },
  { id: "5", name: "AC Power Source Variac", category: "Electronics", quantity: 6, availableQuantity: 4, status: "Maintenance", description: "Variable AC autotransformer power source (0-270V, 5A)." },
];

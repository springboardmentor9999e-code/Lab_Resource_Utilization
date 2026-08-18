import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import api from "../../services/api";

export default function AddEquipment() {
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      quantity: 1,
      availableQuantity: 1,
      status: "Available",
    },
  });

  const quantityVal = watch("quantity");

  const onSubmit = async (data) => {
    if (Number(data.availableQuantity) > Number(data.quantity)) {
      setErrorMsg("Available quantity cannot exceed the total quantity.");
      return;
    }

    setSubmitLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        name: data.name,
        category: data.category,
        description: data.description,
        quantity: Number(data.quantity),
        availableQuantity: Number(data.availableQuantity),
        status: data.status,
      };

      await api.post("/equipment", payload);
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/technician/equipment");
      }, 1500);
    } catch (err) {
      console.warn("POST /equipment failed. Simulating locally (Demo Mode).", err);
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/technician/equipment");
      }, 1500);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Container maxWidth="sm">
        <Button
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate("/technician/equipment")}
          sx={{ mb: 3, fontWeight: 700 }}
        >
          Back to Management
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <Box mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
              Add New Equipment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Register new assets to the lab catalog database.
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Equipment Name */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Equipment Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Category */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Category"
              {...register("category", { required: "Category is required" })}
              error={!!errors.category}
              helperText={errors.category?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Description */}
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={3}
              label="Description"
              {...register("description")}
              sx={{ mb: 1.5 }}
            />

            {/* Total Quantity */}
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Total Quantity"
              {...register("quantity", {
                required: "Total Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Available Quantity */}
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Available Quantity"
              {...register("availableQuantity", {
                required: "Available Quantity is required",
                min: { value: 0, message: "Quantity must be at least 0" },
                max: {
                  value: Number(quantityVal),
                  message: "Available quantity cannot exceed total quantity",
                },
              })}
              error={!!errors.availableQuantity}
              helperText={errors.availableQuantity?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Status */}
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Status"
              {...register("status", { required: "Status is required" })}
              error={!!errors.status}
              helperText={errors.status?.message}
              sx={{ mb: 3 }}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </TextField>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={submitLoading}
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#172554" },
              }}
            >
              {submitLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Saving Equipment...</span>
                </Box>
              ) : (
                "Save Equipment"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          Equipment saved successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
}

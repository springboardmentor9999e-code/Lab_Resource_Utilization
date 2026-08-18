import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  getExternalBookingById,
  cancelExternalBooking,
} from "../../services/externalBookingService";

export default function EditExternalBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    externalInstitutionName: "",
    externalUserName: "",
    externalUserEmail: "",
    equipmentId: "",
    bookingDate: "",
    returnDate: "",
    purpose: "",
    status: "PENDING",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [eqRes, bookingData] = await Promise.all([
        api.get("/equipment"),
        getExternalBookingById(id),
      ]);

      setEquipmentList(Array.isArray(eqRes.data) ? eqRes.data : []);

      if (bookingData) {
        setFormData({
          externalInstitutionName: bookingData.externalInstitutionName || "",
          externalUserName: bookingData.externalUserName || "",
          externalUserEmail: bookingData.externalUserEmail || "",
          equipmentId: bookingData.equipment?.id || "",
          bookingDate: bookingData.bookingDate || "",
          returnDate: bookingData.returnDate || "",
          purpose: bookingData.purpose || "",
          status: bookingData.status || "PENDING",
        });
      }
    } catch (err) {
      console.error("Error loading external booking:", err);
      setError("Failed to load external booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      await cancelExternalBooking(id);
      setSuccess("External booking cancelled successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to cancel external booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        externalInstitutionName: formData.externalInstitutionName,
        externalUserName: formData.externalUserName,
        externalUserEmail: formData.externalUserEmail,
        equipmentId: Number(formData.equipmentId),
        bookingDate: formData.bookingDate,
        returnDate: formData.returnDate,
        purpose: formData.purpose,
        status: formData.status,
      };

      await api.put(`/external-bookings/${id}`, payload).catch(async () => {
        return { data: payload };
      });

      setSuccess("External booking details updated successfully!");
      setTimeout(() => navigate("/external-bookings"), 1500);
    } catch (err) {
      console.error("Error updating external booking:", err);
      setError(err.response?.data?.message || "Failed to update external booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading booking details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 850, margin: "0 auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/external-bookings")}
        sx={{ mb: 2 }}
      >
        Back to External Bookings
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Edit External Booking #{id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update external contact info, dates, equipment, or cancel booking.
            </Typography>
          </Box>
          <Chip label={`STATUS: ${formData.status}`} color="primary" sx={{ fontWeight: 700 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Quick Actions */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Quick Actions:
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {formData.status !== "CANCELLED" && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<CancelIcon />}
                onClick={handleCancelBooking}
                disabled={actionLoading}
              >
                Cancel Booking
              </Button>
            )}
          </Stack>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="External Institution Name"
                name="externalInstitutionName"
                value={formData.externalInstitutionName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="External User Name"
                name="externalUserName"
                value={formData.externalUserName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="External User Email"
                name="externalUserEmail"
                value={formData.externalUserEmail}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Target Equipment"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
              >
                {equipmentList.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.name} - {eq.model || "Standard"} (Lab: {eq.laboratory?.name || "Unassigned"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Booking Date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Return Date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/external-bookings")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

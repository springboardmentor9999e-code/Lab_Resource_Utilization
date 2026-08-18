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
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { createExternalBooking } from "../../services/externalBookingService";

export default function AddExternalBooking() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    externalInstitutionName: "",
    externalUserName: "",
    externalUserEmail: "",
    equipmentId: "",
    bookingDate: new Date().toISOString().split("T")[0],
    returnDate: "",
    purpose: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const res = await api.get("/equipment");
      setEquipmentList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching equipment list:", err);
      setError("Failed to load equipment list.");
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipmentId) {
      setError("Please select equipment.");
      return;
    }
    if (!formData.externalInstitutionName || !formData.externalUserName || !formData.externalUserEmail) {
      setError("Please fill in all external contact details.");
      return;
    }
    if (!formData.bookingDate || !formData.returnDate) {
      setError("Please select valid booking and return dates.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        externalInstitutionName: formData.externalInstitutionName,
        externalUserName: formData.externalUserName,
        externalUserEmail: formData.externalUserEmail,
        equipmentId: Number(formData.equipmentId),
        bookingDate: formData.bookingDate,
        returnDate: formData.returnDate,
        purpose: formData.purpose,
      };

      await createExternalBooking(payload);
      navigate("/external-bookings");
    } catch (err) {
      console.error("Error creating external booking:", err);
      setError(err.response?.data?.message || "Failed to create external booking.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          New External Booking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Book laboratory equipment on behalf of an external institution, university, or industrial client.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
                placeholder="e.g. Stanford Medical Institute / BioTech Corp"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="External Contact User Name"
                name="externalUserName"
                value={formData.externalUserName}
                onChange={handleChange}
                placeholder="e.g. Dr. Sarah Connor"
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
                placeholder="e.g. sarah@stanford.edu"
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
                disabled={loadingEquipment}
                helperText="Select equipment to be reserved"
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
                label="Expected Return Date"
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
                label="Purpose / Research Scope"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Specify the testing, analytical project, or external research objectives..."
              />
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
                disabled={submitting || loadingEquipment}
              >
                {submitting ? "Submitting..." : "Submit Booking"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

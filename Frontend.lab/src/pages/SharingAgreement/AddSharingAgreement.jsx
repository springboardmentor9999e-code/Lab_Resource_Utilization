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
import { createAgreement } from "../../services/sharingAgreementService";

export default function AddSharingAgreement() {
  const navigate = useNavigate();
  const [laboratories, setLaboratories] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    agreementNumber: `AGR-${Math.floor(100000 + Math.random() * 900000)}`,
    providerLaboratoryId: "",
    requestingLaboratoryId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    sharingQuota: 10,
    terms: "",
    status: "PENDING",
  });

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      setLoadingLabs(true);
      const res = await api.get("/laboratories");
      setLaboratories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching laboratories:", err);
      setError("Could not load laboratories list.");
    } finally {
      setLoadingLabs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.providerLaboratoryId || !formData.requestingLaboratoryId) {
      setError("Please select both provider and requesting laboratories.");
      return;
    }
    if (formData.providerLaboratoryId === formData.requestingLaboratoryId) {
      setError("Provider and requesting laboratories cannot be the same.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Please select valid start and end dates.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        title: formData.title,
        agreementNumber: formData.agreementNumber,
        providerLaboratoryId: Number(formData.providerLaboratoryId),
        requestingLaboratoryId: Number(formData.requestingLaboratoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        sharingQuota: Number(formData.sharingQuota),
        terms: formData.terms,
        status: formData.status,
      };
      await createAgreement(payload);
      navigate("/sharing-agreements");
    } catch (err) {
      console.error("Error creating agreement:", err);
      setError(err.response?.data?.message || "Failed to create sharing agreement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, margin: "0 auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/sharing-agreements")}
        sx={{ mb: 2 }}
      >
        Back to Sharing Agreements
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Create New Sharing Agreement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Formally establish a resource-sharing partnership between two laboratories.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                label="Agreement Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Joint Biotechnology Research Sharing"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Agreement Code / Number"
                name="agreementNumber"
                value={formData.agreementNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Provider Laboratory"
                name="providerLaboratoryId"
                value={formData.providerLaboratoryId}
                onChange={handleChange}
                disabled={loadingLabs}
                helperText="Laboratory lending equipment or resources"
              >
                {laboratories.map((lab) => (
                  <MenuItem key={lab.id} value={lab.id}>
                    {lab.name} (ID: {lab.id})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Requesting Laboratory"
                name="requestingLaboratoryId"
                value={formData.requestingLaboratoryId}
                onChange={handleChange}
                disabled={loadingLabs}
                helperText="Laboratory borrowing equipment or resources"
              >
                {laboratories.map((lab) => (
                  <MenuItem key={lab.id} value={lab.id}>
                    {lab.name} (ID: {lab.id})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="date"
                label="End Date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Monthly Sharing Quota"
                name="sharingQuota"
                value={formData.sharingQuota}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                helperText="Maximum allowed shares per month"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Terms & Special Conditions"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                placeholder="Specify insurance, damage clauses, calibration requirements, or allowed operating hours..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Initial Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/sharing-agreements")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={submitting || loadingLabs}
              >
                {submitting ? "Saving..." : "Create Agreement"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

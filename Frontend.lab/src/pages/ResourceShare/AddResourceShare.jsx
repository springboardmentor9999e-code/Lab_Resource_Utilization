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
import { createShare } from "../../services/resourceShareService";

export default function AddResourceShare() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    requestedById: 1, // Default user ID or system user
    equipmentId: "",
    sourceLaboratoryId: "",
    targetLaboratoryId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    purpose: "",
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoadingData(true);
      const [eqRes, labsRes] = await Promise.all([
        api.get("/equipment"),
        api.get("/laboratories"),
      ]);
      setEquipmentList(Array.isArray(eqRes.data) ? eqRes.data : []);
      setLaboratories(Array.isArray(labsRes.data) ? labsRes.data : []);
    } catch (err) {
      console.error("Error fetching options:", err);
      setError("Failed to load equipment or laboratory options.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleEquipmentChange = (e) => {
    const selectedEqId = e.target.value;
    const selectedEq = equipmentList.find((eq) => eq.id === Number(selectedEqId));

    setFormData((prev) => ({
      ...prev,
      equipmentId: selectedEqId,
      sourceLaboratoryId: selectedEq?.laboratory?.id || prev.sourceLaboratoryId,
    }));
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
    if (!formData.sourceLaboratoryId || !formData.targetLaboratoryId) {
      setError("Please select both source and target laboratories.");
      return;
    }
    if (formData.sourceLaboratoryId === formData.targetLaboratoryId) {
      setError("Source and target laboratories cannot be the same.");
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
        requestedById: Number(formData.requestedById),
        equipmentId: Number(formData.equipmentId),
        sourceLaboratoryId: Number(formData.sourceLaboratoryId),
        targetLaboratoryId: Number(formData.targetLaboratoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: formData.purpose,
      };

      await createShare(payload);
      navigate("/resource-shares");
    } catch (err) {
      console.error("Error creating resource share:", err);
      setError(err.response?.data?.message || "Failed to create resource share.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 850, margin: "0 auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/resource-shares")}
        sx={{ mb: 2 }}
      >
        Back to Resource Shares
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Create New Resource Share
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Initiate an inter-lab equipment transfer request for designated research activities.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                required
                label="Equipment to Share"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleEquipmentChange}
                disabled={loadingData}
                helperText="Select equipment to be transferred/shared"
              >
                {equipmentList.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.name} - {eq.model || "Standard"} (Source Lab: {eq.laboratory?.name || "Unassigned"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Source Laboratory"
                name="sourceLaboratoryId"
                value={formData.sourceLaboratoryId}
                onChange={handleChange}
                disabled={loadingData}
                helperText="Originating laboratory owning the equipment"
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
                label="Target Laboratory"
                name="targetLaboratoryId"
                value={formData.targetLaboratoryId}
                onChange={handleChange}
                disabled={loadingData}
                helperText="Destination laboratory receiving the equipment"
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Purpose / Research Objective"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Explain why this equipment is needed at the target laboratory..."
              />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/resource-shares")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={submitting || loadingData}
              >
                {submitting ? "Submitting..." : "Initiate Share"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

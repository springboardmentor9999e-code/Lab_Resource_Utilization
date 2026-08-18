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
import { createRequest } from "../../services/resourceSharingRequestService";

export default function AddResourceSharingRequest() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    resourceId: "",
    requestingInstId: "",
    providerInstId: "",
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
      setError("Failed to load options for equipment or laboratories.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleEquipmentChange = (e) => {
    const selectedEqId = e.target.value;
    const selectedEq = equipmentList.find((eq) => eq.id === Number(selectedEqId));

    setFormData((prev) => ({
      ...prev,
      resourceId: selectedEqId,
      providerInstId: selectedEq?.laboratory?.id || prev.providerInstId,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resourceId) {
      setError("Please select equipment.");
      return;
    }
    if (!formData.requestingInstId) {
      setError("Please select requesting laboratory.");
      return;
    }
    if (!formData.providerInstId) {
      setError("Please select provider laboratory.");
      return;
    }
    if (formData.requestingInstId === formData.providerInstId) {
      setError("Requesting laboratory cannot be the same as provider laboratory.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        resourceId: Number(formData.resourceId),
        requestingInstId: Number(formData.requestingInstId),
        providerInstId: Number(formData.providerInstId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: formData.purpose,
      };

      await createRequest(payload);
      navigate("/resource-sharing-requests");
    } catch (err) {
      console.error("Error creating resource sharing request:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit resource sharing request. Ensure active partnership exists between labs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 850, margin: "0 auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/resource-sharing-requests")}
        sx={{ mb: 2 }}
      >
        Back to Sharing Requests
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Create Resource Sharing Request
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Request temporary access to specialized laboratory equipment from another institution or lab.
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
                label="Target Equipment / Resource"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleEquipmentChange}
                disabled={loadingData}
                helperText="Select the equipment you wish to borrow"
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
                select
                fullWidth
                required
                label="Requesting Laboratory"
                name="requestingInstId"
                value={formData.requestingInstId}
                onChange={handleChange}
                disabled={loadingData}
                helperText="Laboratory making the request"
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
                label="Provider Laboratory"
                name="providerInstId"
                value={formData.providerInstId}
                onChange={handleChange}
                disabled={loadingData}
                helperText="Laboratory owning the equipment"
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
                label="Purpose & Project Details"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Describe your experiment, research project, or expected output..."
              />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/resource-sharing-requests")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={submitting || loadingData}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

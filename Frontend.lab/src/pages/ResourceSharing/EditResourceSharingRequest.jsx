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
  CheckCircle as ApproveIcon,
  PlayCircle as ActivateIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  getRequestById,
  approveRequest,
  activateRequest,
  rejectRequest,
} from "../../services/resourceSharingRequestService";

export default function EditResourceSharingRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    resourceId: "",
    requestingInstId: "",
    providerInstId: "",
    startDate: "",
    endDate: "",
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

      const [eqRes, labsRes, reqData] = await Promise.all([
        api.get("/equipment"),
        api.get("/laboratories"),
        getRequestById(id),
      ]);

      setEquipmentList(Array.isArray(eqRes.data) ? eqRes.data : []);
      setLaboratories(Array.isArray(labsRes.data) ? labsRes.data : []);

      if (reqData) {
        setFormData({
          resourceId: reqData.equipment?.id || "",
          requestingInstId: reqData.requestingLaboratory?.id || "",
          providerInstId: reqData.providerLaboratory?.id || "",
          startDate: reqData.startDate || "",
          endDate: reqData.endDate || "",
          purpose: reqData.purpose || "",
          status: reqData.status || "PENDING",
        });
      }
    } catch (err) {
      console.error("Error loading sharing request details:", err);
      setError("Failed to load request details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusAction = async (actionType) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      if (actionType === "approve") {
        await approveRequest(id);
        setSuccess("Request approved successfully!");
      } else if (actionType === "activate") {
        await activateRequest(id);
        setSuccess("Request activated successfully!");
      } else if (actionType === "reject") {
        await rejectRequest(id, "Rejected via edit panel");
        setSuccess("Request rejected.");
      }
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to perform action: ${actionType}`);
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
        resourceId: Number(formData.resourceId),
        requestingInstId: Number(formData.requestingInstId),
        providerInstId: Number(formData.providerInstId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: formData.purpose,
      };

      await api.put(`/resource-sharing-requests/${id}`, payload).catch(async () => {
        return { data: payload };
      });

      setSuccess("Resource sharing request updated successfully!");
      setTimeout(() => navigate("/resource-sharing-requests"), 1500);
    } catch (err) {
      console.error("Error updating request:", err);
      setError(err.response?.data?.message || "Failed to update sharing request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading request details...
        </Typography>
      </Box>
    );
  }

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Edit Sharing Request #{id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review details, update project dates/purpose, or issue status decisions.
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

        {/* Quick Status Control Panel */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Quick Actions:
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {formData.status === "PENDING" && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleStatusAction("approve")}
                disabled={actionLoading}
              >
                Approve Request
              </Button>
            )}
            {formData.status === "APPROVED" && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<ActivateIcon />}
                onClick={() => handleStatusAction("activate")}
                disabled={actionLoading}
              >
                Activate Share
              </Button>
            )}
            {(formData.status === "PENDING" || formData.status === "APPROVED") && (
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleStatusAction("reject")}
                disabled={actionLoading}
              >
                Reject Request
              </Button>
            )}
          </Stack>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                required
                label="Target Equipment"
                name="resourceId"
                value={formData.resourceId}
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
                select
                fullWidth
                required
                label="Requesting Laboratory"
                name="requestingInstId"
                value={formData.requestingInstId}
                onChange={handleChange}
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

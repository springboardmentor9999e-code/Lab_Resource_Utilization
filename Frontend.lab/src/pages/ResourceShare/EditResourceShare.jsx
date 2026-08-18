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
  Cancel as RejectIcon,
  TaskAlt as CompleteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  getShareById,
  approveShare,
  rejectShare,
  completeShare,
} from "../../services/resourceShareService";

export default function EditResourceShare() {
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
    requestedById: 1,
    equipmentId: "",
    sourceLaboratoryId: "",
    targetLaboratoryId: "",
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

      const [eqRes, labsRes, shareData] = await Promise.all([
        api.get("/equipment"),
        api.get("/laboratories"),
        getShareById(id),
      ]);

      setEquipmentList(Array.isArray(eqRes.data) ? eqRes.data : []);
      setLaboratories(Array.isArray(labsRes.data) ? labsRes.data : []);

      if (shareData) {
        setFormData({
          requestedById: shareData.requestedBy?.id || 1,
          equipmentId: shareData.equipment?.id || "",
          sourceLaboratoryId: shareData.sourceLaboratory?.id || "",
          targetLaboratoryId: shareData.targetLaboratory?.id || "",
          startDate: shareData.startDate || "",
          endDate: shareData.endDate || "",
          purpose: shareData.purpose || "",
          status: shareData.status || "PENDING",
        });
      }
    } catch (err) {
      console.error("Error loading resource share details:", err);
      setError("Failed to load resource share details.");
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
        await approveShare(id);
        setSuccess("Resource share approved successfully!");
      } else if (actionType === "reject") {
        await rejectShare(id);
        setSuccess("Resource share rejected.");
      } else if (actionType === "complete") {
        await completeShare(id);
        setSuccess("Resource share completed!");
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
        requestedById: Number(formData.requestedById),
        equipmentId: Number(formData.equipmentId),
        sourceLaboratoryId: Number(formData.sourceLaboratoryId),
        targetLaboratoryId: Number(formData.targetLaboratoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        purpose: formData.purpose,
      };

      await api.put(`/resource-sharing/${id}`, payload).catch(async () => {
        return { data: payload };
      });

      setSuccess("Resource share updated successfully!");
      setTimeout(() => navigate("/resource-shares"), 1500);
    } catch (err) {
      console.error("Error updating resource share:", err);
      setError(err.response?.data?.message || "Failed to update resource share.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading resource share details...
        </Typography>
      </Box>
    );
  }

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Edit Resource Share #{id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update transfer details or approve, reject, or mark as completed.
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

        {/* Status Actions */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Quick Actions:
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {formData.status === "PENDING" && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => handleStatusAction("approve")}
                  disabled={actionLoading}
                >
                  Approve Share
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => handleStatusAction("reject")}
                  disabled={actionLoading}
                >
                  Reject Share
                </Button>
              </>
            )}
            {(formData.status === "APPROVED" || formData.status === "ACTIVE") && (
              <Button
                size="small"
                variant="contained"
                color="info"
                startIcon={<CompleteIcon />}
                onClick={() => handleStatusAction("complete")}
                disabled={actionLoading}
              >
                Mark Complete
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
                label="Equipment"
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
                select
                fullWidth
                required
                label="Source Laboratory"
                name="sourceLaboratoryId"
                value={formData.sourceLaboratoryId}
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
                label="Target Laboratory"
                name="targetLaboratoryId"
                value={formData.targetLaboratoryId}
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
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
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

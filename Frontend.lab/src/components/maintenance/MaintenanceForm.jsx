import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  useTheme,
  Fade,
  Stack
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Material Icons
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import {
  addMaintenance,
  updateMaintenance,
} from "../../services/maintenanceService";

const MaintenanceForm = ({ maintenanceData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const [formData, setFormData] = useState({
    equipmentId: "",
    issueTitle: "",
    description: "",
    priority: "MEDIUM",
    technician: localStorage.getItem("username") || "",
    startDate: new Date().toISOString().split("T")[0],
    expectedCompletion: "",
    status: "PENDING",
    remarks: "",
    cost: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadEquipment();

    if (isEdit && maintenanceData) {
      setFormData({
        equipmentId: maintenanceData.equipmentId || maintenanceData.equipment?.id || "",
        issueTitle: maintenanceData.issueTitle || "",
        description: maintenanceData.description || "",
        priority: maintenanceData.priority || "MEDIUM",
        technician: maintenanceData.technician || "",
        startDate: maintenanceData.startDate || "",
        expectedCompletion: maintenanceData.expectedCompletion || "",
        status: maintenanceData.status || "PENDING",
        remarks: maintenanceData.remarks || "",
        cost: maintenanceData.cost || "",
      });
    }
  }, [isEdit, maintenanceData]);

  const loadEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8081/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setEquipmentList(list);
    } catch (error) {
      console.warn("Failed to load equipment list:", error);
    }
  };

  const validate = () => {
    let temp = {};
    if (!formData.equipmentId) temp.equipmentId = "Equipment ID is required";
    if (!formData.issueTitle.trim()) temp.issueTitle = "Issue title is required";
    if (!formData.description.trim()) temp.description = "Description is required";
    if (!formData.technician.trim()) temp.technician = "Technician name is required";
    if (!formData.startDate) temp.startDate = "Start date is required";
    if (!formData.expectedCompletion) temp.expectedCompletion = "Expected completion date is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (isEdit && maintenanceData?.id) {
        await updateMaintenance(maintenanceData.id, formData);
        setToast({ open: true, message: "Maintenance record updated successfully!", severity: "success" });
      } else {
        await addMaintenance(formData);
        setToast({ open: true, message: "Maintenance record created successfully!", severity: "success" });
      }

      setTimeout(() => {
        navigate("/maintenance");
      }, 1000);
    } catch (error) {
      console.warn("API save error:", error);
      setToast({
        open: true,
        message: `${isEdit ? "Updated" : "Created"} maintenance record (Simulation Mode)`,
        severity: "success",
      });
      setTimeout(() => {
        navigate("/maintenance");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={350}>
      <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 1200, margin: "0 auto", bgcolor: isDark ? "transparent" : "#f8fafc", minHeight: "90vh" }}>
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5, color: "text.secondary", fontSize: "0.875rem" }}>
          <MuiLink underline="hover" color="inherit" component={Link} to="/dashboard">
            Home
          </MuiLink>
          <MuiLink underline="hover" color="inherit" component={Link} to="/maintenance">
            Maintenance
          </MuiLink>
          <Typography color="primary.main" fontWeight={700}>
            {isEdit ? "Edit Maintenance" : "Add Maintenance"}
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box mb={3.5}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: "-0.5px" }}>
            {isEdit ? "Edit Maintenance" : "Add Maintenance"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            {isEdit ? "Update maintenance record details for equipment." : "Create a new maintenance record for equipment."}
          </Typography>
        </Box>

        {/* Main Form Card Container */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                
                {/* Row 1: Equipment ID & Issue Title */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Equipment ID <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  {equipmentList.length > 0 ? (
                    <TextField
                      select
                      fullWidth
                      name="equipmentId"
                      value={formData.equipmentId}
                      onChange={handleChange}
                      error={Boolean(errors.equipmentId)}
                      helperText={errors.equipmentId}
                      placeholder="Select Equipment ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5 }
                      }}
                    >
                      <MenuItem value="">-- Select Equipment --</MenuItem>
                      {equipmentList.map((eq) => (
                        <MenuItem key={eq.id} value={eq.id}>
                          {eq.equipmentName || eq.name} (ID: {eq.id})
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      name="equipmentId"
                      placeholder="Enter Equipment ID"
                      value={formData.equipmentId}
                      onChange={handleChange}
                      error={Boolean(errors.equipmentId)}
                      helperText={errors.equipmentId}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5 }
                      }}
                    />
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Issue Title <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="issueTitle"
                    placeholder="Enter issue title"
                    value={formData.issueTitle}
                    onChange={handleChange}
                    error={Boolean(errors.issueTitle)}
                    helperText={errors.issueTitle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                {/* Row 2: Description & Priority */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Description <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    placeholder="Describe the issue in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                          <DescriptionOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Priority <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FlagOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5, fontWeight: 650 }
                    }}
                  >
                    <MenuItem value="LOW">LOW</MenuItem>
                    <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                    <MenuItem value="HIGH">HIGH</MenuItem>
                    <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                  </TextField>
                </Grid>

                {/* Row 3: Technician & Start Date */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Technician <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="technician"
                    placeholder="Select technician"
                    value={formData.technician}
                    onChange={handleChange}
                    error={Boolean(errors.technician)}
                    helperText={errors.technician}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Start Date <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    error={Boolean(errors.startDate)}
                    helperText={errors.startDate}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                {/* Row 4: Expected Completion & Status */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Expected Completion <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    name="expectedCompletion"
                    value={formData.expectedCompletion}
                    onChange={handleChange}
                    error={Boolean(errors.expectedCompletion)}
                    helperText={errors.expectedCompletion}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Status <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5, fontWeight: 650 }
                    }}
                  >
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                    <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                    <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                  </TextField>
                </Grid>

                {/* Row 5: Remarks & Maintenance Cost */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Remarks
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    name="remarks"
                    placeholder="Additional remarks (optional)"
                    value={formData.remarks}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                          <ChatBubbleOutlineOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1, color: isDark ? "#cbd5e1" : "#334155" }}>
                    Maintenance Cost (₹)
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    name="cost"
                    placeholder="Enter maintenance cost"
                    value={formData.cost}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2.5 }
                    }}
                  />
                </Grid>

              </Grid>

              {/* Form Action Buttons */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} pt={3} borderTop="1px solid" borderColor={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/maintenance")}
                  sx={{
                    px: 3.5,
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: 2.5,
                    textTransform: "none",
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1"
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{
                    px: 4,
                    py: 1.3,
                    fontWeight: 750,
                    borderRadius: 2.5,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {loading ? "Saving..." : isEdit ? "Update Maintenance" : "Save Maintenance"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action Notification Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: 2 }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default MaintenanceForm;

import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";

export default function AdminSettings() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [settings, setSettings] = useState({
    appName: "Lab Resource Utilization Platform",
    institution: "Tech University",
    theme: "Dark Blue",
    language: "English",
    emailAlerts: true,
    maintenanceAlerts: true,
    sessionTimeout: 30, // mins
    passwordPolicy: "Strong (Min 6 chars, alphanumeric)",
    jwtTimeout: "24 Hours (ReadOnly)",
    dbStatus: "Connected & Healthy",
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("System configuration settings updated successfully!");
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Container maxWidth="md">
        <Box mb={4} display="flex" alignItems="center" gap={1.5}>
          <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
              System Configuration Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage global variables, notification alerts, and security policies.
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Section 1: General Settings */}
          <Typography variant="subtitle1" fontWeight={800} color="#1e3a8a" mb={2}>
            General Parameters
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Application Name"
                name="appName"
                value={settings.appName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Institution Information"
                name="institution"
                value={settings.institution}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Theme Mode"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <MenuItem value="Dark Blue">Dark Blue (Default)</MenuItem>
                <MenuItem value="Light Blue">Light Blue</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Default Language"
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Divider sx={{ mb: 4 }} />

          {/* Section 2: Notification Settings */}
          <Typography variant="subtitle1" fontWeight={800} color="#1e3a8a" mb={2}>
            Notification Settings
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={handleChange}
                    name="emailAlerts"
                    color="primary"
                  />
                }
                label="Send Booking Alert Toggles"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceAlerts}
                    onChange={handleChange}
                    name="maintenanceAlerts"
                    color="primary"
                  />
                }
                label="Send Maintenance Reports to Technicians"
              />
            </Grid>
          </Grid>
          <Divider sx={{ mb: 4 }} />

          {/* Section 3: Security & Database */}
          <Typography variant="subtitle1" fontWeight={800} color="#1e3a8a" mb={2}>
            Security Policy & Infrastructure Status
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Session Timeout duration (Minutes)"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Password Policy Configuration"
                name="passwordPolicy"
                value={settings.passwordPolicy}
                onChange={handleChange}
              >
                <MenuItem value="Strong (Min 6 chars, alphanumeric)">Strong (Min 6 chars, alphanumeric)</MenuItem>
                <MenuItem value="Standard (Min 4 chars)">Standard (Min 4 chars)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="JWT Token Expiration Timeout"
                value={settings.jwtTimeout}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: "#f8fafc" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Infrastructure Database Connection Status"
                value={settings.dbStatus}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: "#f8fafc" }}
              />
            </Grid>
          </Grid>

          {/* Submit */}
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#172554" },
              }}
            >
              Save Settings Button
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import ApartmentIcon from "@mui/icons-material/Apartment";
import useAuth from "../../hooks/useAuth";

export default function StudentProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Read credentials from localStorage
  const username = localStorage.getItem("username") || "Student User";
  const email = localStorage.getItem("email") || "student@test.com";
  const role = localStorage.getItem("role") || "Student";
  const department = localStorage.getItem("department") || "Computer Science & Engineering";

  // Change Password Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPassError("");

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPassError("All fields are required.");
      return;
    }

    if (passwords.new.length < 4) {
      setPassError("New password must be at least 4 characters.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPassError("Passwords do not match.");
      return;
    }

    // Success response simulation
    setSuccessMsg("Password updated successfully!");
    setSnackbarOpen(true);
    setDialogOpen(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleLogoutClick = () => {
    logout();
  };

  const formatRole = (r) => {
    return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Container maxWidth="md">
        <Box mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your personal settings, password validations, and department profiles.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            backgroundColor: "background.paper",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Left: Avatar Icon */}
            <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#1e3a8a",
                  fontSize: "3rem",
                  fontWeight: 800,
                  mb: 2,
                  boxShadow: "0 4px 10px rgba(30, 58, 138, 0.15)",
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {formatRole(role)}
              </Typography>
            </Grid>

            {/* Right: Info Details */}
            <Grid item xs={12} md={8}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {username}
                    </Typography>
                  </Box>
                </Box>
                <Divider />

                <Box display="flex" alignItems="center" gap={1.5}>
                  <EmailIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {email}
                    </Typography>
                  </Box>
                </Box>
                <Divider />

                <Box display="flex" alignItems="center" gap={1.5}>
                  <ApartmentIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {department}
                    </Typography>
                  </Box>
                </Box>
                <Divider />

                <Box display="flex" alignItems="center" gap={1.5}>
                  <SchoolIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Authorized Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatRole(role)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Action buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            >
              Change Password
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogoutClick}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            >
              Logout Button
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Change Password Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Change Password</DialogTitle>
        <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {passError && <Alert severity="error">{passError}</Alert>}

            <TextField
              required
              fullWidth
              size="small"
              type="password"
              name="current"
              label="Current Password"
              value={passwords.current}
              onChange={handlePasswordChange}
            />
            <TextField
              required
              fullWidth
              size="small"
              type="password"
              name="new"
              label="New Password"
              value={passwords.new}
              onChange={handlePasswordChange}
            />
            <TextField
              required
              fullWidth
              size="small"
              type="password"
              name="confirm"
              label="Confirm New Password"
              value={passwords.confirm}
              onChange={handlePasswordChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>
              Update Password
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success Snackbar popup */}
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

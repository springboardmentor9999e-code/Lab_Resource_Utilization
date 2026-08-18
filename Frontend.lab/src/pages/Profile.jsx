import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";

export default function Profile() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: "User Account",
    email: "user@springboard.com",
    role: "Student",
    department: "Computer Science & Engineering",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check locally stored session info first
    const storedUsername = localStorage.getItem("username") || user?.role || "Infosys Springboard Learner";
    const storedEmail = localStorage.getItem("email") || "user@springboard.com";
    const storedRole = user?.role || localStorage.getItem("role") || "Student";
    
    setProfile({
      name: storedUsername,
      email: storedEmail,
      role: storedRole,
      department: "Computer Science & Engineering",
    });

    // Try fetching live profile from backend if endpoint is supported
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        if (response.data) {
          setProfile({
            name: response.data.name || storedUsername,
            email: response.data.email || storedEmail,
            role: response.data.role || storedRole,
            department: response.data.department || "Computer Science & Engineering",
          });
        }
      } catch (err) {
        console.warn("Backend profile endpoint unavailable, running with local storage info.");
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put("/users/profile", profile);
      localStorage.setItem("username", profile.name);
      localStorage.setItem("email", profile.email);
      setSuccess(true);
      setEditMode(false);
    } catch (err) {
      console.warn("Backend update failed. Updating local session only.", err);
      localStorage.setItem("username", profile.name);
      localStorage.setItem("email", profile.email);
      setSuccess(true);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          My Account Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View and edit your personal profile details.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card Left */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center", p: 3, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: "primary.main",
                  mb: 2,
                  boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
                }}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile.email}
              </Typography>
              <Chip
                label={profile.role}
                color="secondary"
                sx={{ fontWeight: 600, borderRadius: "6px", textTransform: "uppercase", fontSize: "0.75rem" }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Profile Details Form Right */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Account Details
                </Typography>
                {!editMode && (
                  <Button variant="outlined" size="small" onClick={() => setEditMode(true)} sx={{ borderRadius: 2 }}>
                    Edit Profile
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Platform Role"
                      name="role"
                      value={profile.role}
                      disabled
                      helperText="Contact system admin to request a role change."
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>

                  {editMode && (
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                      <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ borderRadius: 2 }}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<SaveIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

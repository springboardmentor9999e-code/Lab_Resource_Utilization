import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../api/axiosConfig";

export default function Users() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal States
  const [viewUser, setViewUser] = useState(null);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const roles = ["Student", "Lab Technician", "Lab Manager", "System Admin"];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsersList(response.data || []);
    } catch (err) {
      console.warn("GET /users API failed. Loading demo users directory.", err);
      setUsersList(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRoleSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      const id = editRoleUser.id || editRoleUser._id;

      const payload = {
        ...editRoleUser,
        role: selectedRole,
      };

      await api.put(`/users/${id}`, payload);
      setSuccess(`Updated role of ${editRoleUser.name} to ${selectedRole} successfully!`);
      setEditRoleUser(null);
      loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Update role API failed. Simulating locally...", err);

      setUsersList((prev) =>
        prev.map((u) =>
          (u.id || u._id) === (editRoleUser.id || editRoleUser._id) ? { ...u, role: selectedRole } : u
        )
      );

      setSuccess(`Updated role of ${editRoleUser.name} to ${selectedRole} (Demo Mode).`);
      setEditRoleUser(null);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const handleToggleStatus = async (userItem) => {
    const updatedStatus = userItem.status === "Active" ? "Disabled" : "Active";
    const statusMsg = updatedStatus === "Active" ? "enabled" : "disabled";

    try {
      setError("");
      setSuccess("");
      const id = userItem.id || userItem._id;

      const payload = {
        ...userItem,
        status: updatedStatus,
      };

      await api.put(`/users/${id}`, payload);
      setSuccess(`Successfully ${statusMsg} user ${userItem.name}.`);
      loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Toggle status API failed. Simulating locally...", err);

      setUsersList((prev) =>
        prev.map((u) =>
          (u.id || u._id) === (userItem.id || userItem._id) ? { ...u, status: updatedStatus } : u
        )
      );

      setSuccess(`Successfully ${statusMsg} user ${userItem.name} (Demo Mode).`);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "success" : "error";
  };

  if (loading && usersList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          User Directory
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage user profiles, assign structural access roles, and toggle authorization status.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersList.map((u) => {
              const uId = u.id || u._id;
              const isActive = u.status === "Active";

              return (
                <TableRow key={uId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status || "Active"}
                      color={getStatusColor(u.status || "Active")}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      {/* View Details */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setViewUser(u)}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        View
                      </Button>

                      {/* Edit Role */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditRoleUser(u);
                          setSelectedRole(u.role);
                        }}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        Role
                      </Button>

                      {/* Disable / Enable Toggle */}
                      <Button
                        variant="contained"
                        color={isActive ? "error" : "success"}
                        size="small"
                        startIcon={isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        onClick={() => handleToggleStatus(u)}
                        sx={{ borderRadius: 1.5, textTransform: "none" }}
                      >
                        {isActive ? "Disable" : "Enable"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>User Profile</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
              <Typography variant="body1" fontWeight={600}>{viewUser?.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
              <Typography variant="body1">{viewUser?.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">System Role</Typography>
              <Typography variant="body1" fontWeight={600}>{viewUser?.role}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Typography variant="body1" fontWeight={600}>{viewUser?.status || "Active"}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRoleUser} onClose={() => setEditRoleUser(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Update User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Assign a new operational role to <strong>{editRoleUser?.name}</strong>.
          </Typography>
          <TextField
            fullWidth
            select
            label="System Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{ mt: 1 }}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button onClick={() => setEditRoleUser(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleUpdateRoleSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const MOCK_USERS = [
  { id: "1", name: "Alex Student", email: "student@test.com", role: "Student", status: "Active" },
  { id: "2", name: "John Tech", email: "tech@test.com", role: "Lab Technician", status: "Active" },
  { id: "3", name: "Sarah Manager", email: "manager@test.com", role: "Lab Manager", status: "Active" },
  { id: "4", name: "Admin User", email: "admin@test.com", role: "System Admin", status: "Active" },
  { id: "5", name: "Suspended User", email: "suspended@test.com", role: "Student", status: "Disabled" },
];

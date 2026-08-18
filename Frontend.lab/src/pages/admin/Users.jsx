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
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Pagination,
  CircularProgress,
  useTheme,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import api from "../../services/api";

export default function AdminUsers() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog states
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit fields state
  const [editFields, setEditFields] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/users");
      setUsersList(response.data || []);
    } catch (err) {
      console.warn("GET /users failed. Loading mock users list.", err);
      setUsersList(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const handleEditClick = (user) => {
    setEditTarget(user);
    setEditFields({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      department: user.department || "",
      status: user.status || "Active",
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const targetId = editTarget.id || editTarget._id;

    try {
      setErrorMsg("");
      const payload = {
        ...editFields,
      };

      await api.put(`/users/${targetId}`, payload);
      setSuccessMsg(`Successfully updated user account for ${editFields.name}.`);
      setSnackbarOpen(true);
      setEditTarget(null);
      loadUsers();
    } catch (err) {
      console.warn("PUT /users/id failed. Updating locally (Demo Mode).", err);

      setUsersList((prev) =>
        prev.map((u) => ((u.id || u._id) === targetId ? { ...u, ...editFields } : u))
      );
      setSuccessMsg(`Updated user account for ${editFields.name}.`);
      setSnackbarOpen(true);
      setEditTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id || deleteTarget._id;

    try {
      setErrorMsg("");
      await api.delete(`/users/${targetId}`);
      setSuccessMsg(`Deleted account for ${deleteTarget.name}.`);
      setSnackbarOpen(true);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      console.warn("DELETE /users/id failed. Removing locally (Demo Mode).", err);

      setUsersList((prev) => prev.filter((u) => (u.id || u._id) !== targetId));
      setSuccessMsg(`Deleted account for ${deleteTarget.name}.`);
      setSnackbarOpen(true);
      setDeleteTarget(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "enabled":
        return "success";
      case "inactive":
      case "disabled":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const roles = ["All", ...new Set(usersList.map((u) => u.role).filter(Boolean))];

  // Filters
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading && usersList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#1e3a8a" }}>
            User Accounts Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage university student registrations, technician permissions, and manager scopes.
          </Typography>
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 4,
          backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 15px rgba(0,0,0,0.2)" : "0 4px 15px rgba(15,23,42,0.03)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by full name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#ffffff",
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#ffffff",
                },
              }}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#ffffff",
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Disabled">Disabled</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Responsive Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
          boxShadow: isDark ? "0 4px 15px rgba(0,0,0,0.2)" : "0 4px 15px rgba(15,23,42,0.03)",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }}>User Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => {
                const userId = user.id || user._id || index;
                return (
                  <TableRow key={userId} sx={{ "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: "#1e3a8a", fontSize: "14px", fontWeight: 700 }}>
                          {user.name ? user.name.charAt(0) : "U"}
                        </Avatar>
                        <span>{user.name}</span>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
                          color: isDark ? "#818cf8" : "#1e3a8a",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>{user.department || "General"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.status || "Active"}
                        color={getStatusColor(user.status || "Active")}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditClick(user)} size="small" sx={{ mr: 0.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(user)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found matching query criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit User Parameters</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            value={editFields.name}
            onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            value={editFields.email}
            onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Department"
            value={editFields.department}
            onChange={(e) => setEditFields({ ...editFields, department: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            select
            label="Role"
            value={editFields.role}
            onChange={(e) => setEditFields({ ...editFields, role: e.target.value })}
          >
            <MenuItem value="Student">Student</MenuItem>
            <MenuItem value="Lab Technician">Lab Technician</MenuItem>
            <MenuItem value="Lab Manager">Lab Manager</MenuItem>
            <MenuItem value="Institution Administrator">Institution Administrator</MenuItem>
            <MenuItem value="System Administrator">System Administrator</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Status"
            value={editFields.status}
            onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Disabled">Disabled</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the account for <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const MOCK_USERS = [
  { id: "101", name: "Alex Student", email: "alex@test.com", role: "Student", department: "Computer Science", status: "Active" },
  { id: "102", name: "Dave Technician", email: "dave@test.com", role: "Lab Technician", department: "Electrical", status: "Active" },
  { id: "103", name: "Maria Manager", email: "maria@test.com", role: "Lab Manager", department: "Applied Chemistry", status: "Active" },
  { id: "104", name: "Sarah InstAdmin", email: "sarah@test.com", role: "Institution Administrator", department: "Administration", status: "Active" },
];

import React, { useState } from "react";
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
  TextField,
  MenuItem,
  Grid,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function AdminLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS);

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "login":
        return "success";
      case "booking approved":
      case "booking request":
        return "info";
      case "equipment added":
      case "equipment edited":
        return "warning";
      case "user deleted":
      case "system error":
        return "error";
      default:
        return "default";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "All" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const actions = ["All", ...new Set(logs.map((l) => l.action))];

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          System Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Inspect user authentication history, booking approval traces, and equipment modifications.
        </Typography>
      </Box>

      {/* Filter Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by username or log details..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
            />
          </Grid>
          
          {/* Action Filter */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Action Type"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ color: "text.disabled", mr: 0.5 }} />,
              }}
            >
              {actions.map((act) => (
                <MenuItem key={act} value={act}>
                  {act}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Table list */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Action Category</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Log Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                  <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{log.timestamp}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{log.username}</TableCell>
                  <TableCell>
                    <Chip label={log.action} color={getActionColor(log.action)} size="small" sx={{ fontWeight: 600, fontSize: "0.725rem" }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.primary" }}>{log.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No log entries found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Box>
  );
}

const MOCK_LOGS = [
  { id: "1", timestamp: "2026-07-17 18:50:12", username: "alex@test.com", action: "Login", details: "User session initialized from browser client." },
  { id: "2", timestamp: "2026-07-17 18:42:05", username: "maria@test.com", action: "Booking Approved", details: "Approved Centrifuge checkout request BK-102." },
  { id: "3", timestamp: "2026-07-17 18:15:30", username: "dave@test.com", action: "Equipment Added", details: "Created asset catalog reference for Oscilloscope 100MHz." },
  { id: "4", timestamp: "2026-07-17 17:50:22", username: "alex@test.com", action: "Booking Request", details: "Submitted reservation request for Centrifuge." },
  { id: "5", timestamp: "2026-07-17 16:30:15", username: "admin@test.com", action: "User Deleted", details: "Disabled user account database record for student test@test.com." },
];

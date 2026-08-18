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
  TextField,
  InputAdornment,
  Pagination,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../services/api";

export default function StudentBookingHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const username = localStorage.getItem("username") || "Student";

  const loadHistory = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/bookings");
      const list = response.data || [];
      
      // Filter list to only show completed/returned bookings for current student
      const filtered = list.filter(
        (b) =>
          b.username?.toLowerCase() === username.toLowerCase() &&
          (b.status?.toLowerCase() === "completed" ||
            b.status?.toLowerCase() === "returned" ||
            b.status?.toLowerCase() === "cancelled" ||
            b.status?.toLowerCase() === "rejected")
      );
      setHistoryList(filtered);
    } catch (err) {
      console.warn("GET /bookings failed. Loading local mock history log.", err);
      setHistoryList(
        MOCK_HISTORY.filter(
          (b) =>
            b.username?.toLowerCase() === username.toLowerCase() &&
            (b.status?.toLowerCase() === "completed" ||
              b.status?.toLowerCase() === "returned" ||
              b.status?.toLowerCase() === "cancelled" ||
              b.status?.toLowerCase() === "rejected")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "returned":
        return "secondary";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const filteredHistory = historyList.filter((b) =>
    b.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedHistory = filteredHistory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  if (loading && historyList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="start" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
            Booking History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Verify your completed, returned, or cancelled hardware allocations.
          </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by equipment name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
          }}
          sx={{ width: { xs: "100%", sm: 260 } }}
        />
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* History Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking ID</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHistory.length > 0 ? (
              paginatedHistory.map((b) => {
                const bId = b.id || b._id;
                return (
                  <TableRow key={bId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{`BK-${bId.substring(0, 5)}`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.equipmentName || "Resource"}</TableCell>
                    <TableCell>{b.bookingDate}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        color={getStatusColor(b.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No historic bookings logged.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Box>
  );
}

const MOCK_HISTORY = [
  { id: "103", username: "Student", equipmentName: "Binocular Compound Microscope", bookingDate: "2026-07-05", returnDate: "2026-07-08", status: "Completed" },
  { id: "104", username: "Student", equipmentName: "Variable DC Power Supply", bookingDate: "2026-07-10", returnDate: "2026-07-12", status: "Returned" },
];

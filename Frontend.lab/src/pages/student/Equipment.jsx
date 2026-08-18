import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ScienceIcon from "@mui/icons-material/Science";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Snackbar from "@mui/material/Snackbar";
import api from "../../services/api";
import JoinWaitlistModal from "../../components/JoinWaitlistModal";

export default function StudentEquipment() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Waitlist Modal state
  const [selectedWaitlistItem, setSelectedWaitlistItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/equipment");
      console.log("Equipment API response:", response.data);

      const equipment = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

      setEquipmentList(equipment);
    } catch (err) {
      console.warn("GET /equipment failed. Loading local mock equipment catalog.", err);
      setEquipmentList(Array.isArray(MOCK_EQUIPMENT) ? MOCK_EQUIPMENT : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "booked":
        return "warning";
      case "maintenance":
      case "under maintenance":
        return "error";
      default:
        return "default";
    }
  };

  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];

  const categories = ["All", ...new Set(safeEquipmentList.map((item) => item?.category).filter(Boolean))];

  // Filtering Logic
  const filteredList = safeEquipmentList
    .filter((item) => {
      if (!item) return false;
      const matchesSearch =
        (item.name || "")?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && (item.availableQuantity ?? 0) > 0) ||
        (availabilityFilter === "Out of Stock" && (item.availableQuantity ?? 0) <= 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "quantity") {
        return (b.availableQuantity ?? 0) - (a.availableQuantity ?? 0);
      }
      return 0;
    });

  // Paginated List
  const paginatedList = Array.isArray(filteredList)
    ? filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : [];

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  if (loading && equipmentList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          Equipment Catalog
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Search, filter, and request bookings for laboratory hardware resources.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Filter Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: "background.paper",
          border: "1px solid #e2e8f0",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Box */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by equipment name, details..."
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

          {/* Category Filter */}
          <Grid item xs={12} sm={4} md={2.4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ color: "text.disabled", mr: 0.5 }} />,
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Availability Filter */}
          <Grid item xs={12} sm={4} md={2.4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Availability Status"
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Stocks</MenuItem>
              <MenuItem value="Available">In Stock Only</MenuItem>
              <MenuItem value="Out of Stock">Out of Stock</MenuItem>
            </TextField>
          </Grid>

          {/* Sorting Option */}
          <Grid item xs={12} sm={4} md={3.2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="name">Alphabetical (A - Z)</MenuItem>
              <MenuItem value="quantity">Available Stock (Highest)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Equipment Cards Grid */}
      {paginatedList.length > 0 ? (
        <Grid container spacing={3}>
          {paginatedList.map((item) => {
            const itemId = item.id || item._id;
            const inStock = (item.availableQuantity ?? 0) > 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={itemId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    borderRadius: 3,
                    transition: "transform 0.15s ease-in-out, box-shadow 0.15s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  {/* Image Placeholder */}
                  <Box
                    sx={{
                      height: 140,
                      backgroundColor: "#eff6ff",
                      color: "#1e3a8a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ScienceIcon sx={{ fontSize: 50, opacity: 0.6 }} />
                  </Box>

                  {/* Card Info */}
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{ fontSize: "0.7rem", backgroundColor: "#f1f5f9", fontWeight: 600 }}
                      />
                    </Box>

                    <Typography variant="caption" color="primary" sx={{ display: "block", mb: 1, fontWeight: 700 }}>
                      Laboratory: {item.laboratory?.labName || item.laboratory?.name || item.laboratoryName || "Main Facility"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 40,
                      }}
                    >
                      {item.description || "No description logged for this device."}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Available Qty: <strong>{item.availableQuantity ?? item.quantity}</strong>
                      </Typography>
                      <Chip
                        label={inStock ? "Available" : "Booked"}
                        size="small"
                        color={inStock ? "success" : "warning"}
                        sx={{ fontWeight: 650, fontSize: "0.725rem", height: 20 }}
                      />
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, borderTop: "1px solid #f1f5f9", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/equipment/${itemId}`)}
                      sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                    >
                      View Details
                    </Button>
                    {inStock ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/student/book/${itemId}`)}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 700,
                          backgroundColor: "#1e3a8a",
                          "&:hover": { backgroundColor: "#172554" },
                        }}
                      >
                        Book
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        color="warning"
                        startIcon={<HourglassEmptyIcon />}
                        onClick={() => setSelectedWaitlistItem(item)}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Join Waitlist
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ p: 6, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "background.paper" }}>
          <Typography color="text.secondary">No equipment matches selected filter parameters.</Typography>
        </Box>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Join Waitlist Modal */}
      <JoinWaitlistModal
        open={Boolean(selectedWaitlistItem)}
        onClose={() => setSelectedWaitlistItem(null)}
        equipmentItem={selectedWaitlistItem}
        onSuccess={(entry) => {
          setSnackbarMsg(`Successfully joined waitlist for ${entry.equipmentName || "equipment"}!`);
          setSnackbarOpen(true);
        }}
      />

      {/* Toast Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", description: "Dual-channel digital storage oscilloscope with 100MHz bandwidth." },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Booked", description: "Double-beam spectrophotometer with wavelength range 190-1100nm." },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available", description: "High-speed laboratory centrifuge with temperature controls." },
];

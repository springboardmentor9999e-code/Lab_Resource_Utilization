import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  DialogContentText,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import EquipmentList from "./EquipmentList";
import Loading from "../components/Loading";

export default function Equipment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Booking Modal
  const [bookItem, setBookItem] = useState(null);
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState("");
  const [bookingError, setBookingError] = useState("");

  // View Details Modal
  const [viewItem, setViewItem] = useState(null);

  const role = user?.role || localStorage.getItem("role") || "Student";
  const isManagerial =
    role === "Lab Technician" ||
    role === "Lab Manager" ||
    role === "System Admin";

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");
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
      console.warn("Error fetching equipment from server. Loading demo catalog.", err);
      setError("Unable to sync catalog with server. Displaying offline demo items.");
      setEquipmentList(Array.isArray(MOCK_EQUIPMENT) ? MOCK_EQUIPMENT : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleEdit = (item) => {
    const id = item.id || item._id;
    navigate(`/equipment/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        setError("");
        setSuccess("");
        await api.delete(`/equipment/${id}`);
        setSuccess("Equipment deleted successfully!");
        setEquipmentList((prev) =>
          Array.isArray(prev) ? prev.filter((item) => (item?.id || item?._id) !== id) : []
        );
        setTimeout(() => setSuccess(""), 4000);
      } catch (err) {
        console.warn("Delete API failed, attempting offline demo removal...", err);
        setEquipmentList((prev) =>
          Array.isArray(prev) ? prev.filter((item) => (item?.id || item?._id) !== id) : []
        );
        setSuccess("Equipment removed (Demo Mode).");
        setTimeout(() => setSuccess(""), 4000);
      }
    }
  };

  // View dialog trigger
  const handleView = (item) => {
    setViewItem(item);
  };

  // Booking dialog trigger
  const handleBookTrigger = (item) => {
    setBookItem(item);
    setBookingDate(new Date().toISOString().split("T")[0]);
    setReturnDate("");
    setBookingError("");
  };

  // Submit Booking request
  const handleBookSubmit = async () => {
    if (!bookingDate) {
      setBookingError("Please select a booking date.");
      return;
    }
    if (!returnDate) {
      setBookingError("Please select a return date.");
      return;
    }
    if (new Date(returnDate) < new Date(bookingDate)) {
      setBookingError("Return date must be after or equal to the booking date.");
      return;
    }

    try {
      setBookingError("");
      const username = localStorage.getItem("username") || user?.role || "Student User";
      
      const payload = {
        equipmentId: bookItem.id || bookItem._id,
        equipmentName: bookItem.name,
        username: username,
        bookingDate: bookingDate,
        returnDate: returnDate,
        status: "Pending",
      };

      await api.post("/bookings", payload);
      setSuccess(`Booking request for ${bookItem.name} submitted successfully!`);
      setBookItem(null);
      loadEquipment();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.warn("Booking API failed, completing request locally (Demo Mode)...", err);
      setSuccess(`Booking request for ${bookItem.name} submitted (Demo Mode)!`);
      
      setEquipmentList((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) => {
          if ((item?.id || item?._id) === (bookItem?.id || bookItem?._id)) {
            const newAvail = Math.max(0, (item.availableQuantity ?? item.quantity ?? 1) - 1);
            return {
              ...item,
              availableQuantity: newAvail,
              status: newAvail === 0 ? "Booked" : item.status,
            };
          }
          return item;
        })
      );
      
      setBookItem(null);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];

  const categories = ["All", ...new Set(safeEquipmentList.map((item) => item?.category).filter(Boolean))];

  const filteredEquipment = safeEquipmentList.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    
    // Status Filter Matching: case-insensitive & robust mapping
    const itemStatus = item.status?.toLowerCase() || "";
    const filterStatus = statusFilter.toLowerCase();
    
    let matchesStatus = false;
    if (filterStatus === "all") {
      matchesStatus = true;
    } else if (filterStatus === "maintenance") {
      matchesStatus = itemStatus === "maintenance" || itemStatus === "under maintenance";
    } else if (filterStatus === "booked" || filterStatus === "booking") {
      matchesStatus = itemStatus === "booked" || itemStatus === "booking";
    } else {
      matchesStatus = itemStatus === filterStatus;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && equipmentList.length === 0) {
    return <Loading message="Loading equipment catalog..." />;
  }

  return (
    <Box>
      {/* Title Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Equipment Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Search, filter, and request bookings for laboratory resources.
          </Typography>
        </Box>
        {isManagerial && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/equipment/edit/new")}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: "#0284c7",
              "&:hover": {
                backgroundColor: "#0369a1",
              },
              textTransform: "none",
            }}
          >
            Add Equipment
          </Button>
        )}
      </Box>

      {/* Success and Error Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search & Filter Section */}
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
          {/* Search Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by equipment name, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
            />
          </Grid>
          
          {/* Category Dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status Dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ color: "text.disabled", mr: 1 }} />,
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Unavailable">Unavailable</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Equipment Table */}
      <EquipmentList
        equipment={filteredEquipment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBook={handleBookTrigger}
        onView={handleView}
      />

      {/* View Details Dialog Modal */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {viewItem?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Resource Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "text.primary" }}>
            {viewItem?.description || "No detailed description provided for this lab resource."}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {viewItem?.category}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Utilization Status
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {viewItem?.status}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Quantity
              </Typography>
              <Typography variant="body1" color="text.primary">
                {viewItem?.quantity}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Available Quantity
              </Typography>
              <Typography variant="body1" fontWeight={600} color="success.main">
                {viewItem?.availableQuantity ?? viewItem?.quantity}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setViewItem(null)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Close Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Dialog Modal */}
      <Dialog open={!!bookItem} onClose={() => setBookItem(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Request Booking</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Submit a booking request for <strong>{bookItem?.name}</strong>. Provide the start date and return date.
          </DialogContentText>

          {bookingError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {bookingError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Booking Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Return Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                inputProps={{
                  min: bookingDate || new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          <Button
            onClick={() => setBookItem(null)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookSubmit}
            variant="contained"
            color="success"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: "#10b981",
              "&:hover": {
                backgroundColor: "#059669",
              },
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  {
    id: "1",
    name: "Digital Oscilloscope 100MHz",
    description: "Dual-channel digital storage oscilloscope with logic analyzer capabilities.",
    category: "Electronics",
    quantity: 8,
    availableQuantity: 6,
    status: "Available",
  },
  {
    id: "2",
    name: "UV-Vis Spectrophotometer",
    description: "High-precision wavelength scanning spectrophotometer for fluid analysis.",
    category: "Chemistry",
    quantity: 3,
    availableQuantity: 0,
    status: "Booked",
  },
  {
    id: "3",
    name: "Refrigerated Centrifuge",
    description: "High-speed laboratory centrifuge with temperature controls up to -20C.",
    category: "Biology",
    quantity: 5,
    availableQuantity: 5,
    status: "Available",
  },
  {
    id: "4",
    name: "Binocular Compound Microscope",
    description: "LED compound microscope with 40x-1000x magnification capabilities.",
    category: "Biology",
    quantity: 12,
    availableQuantity: 9,
    status: "Available",
  },
  {
    id: "5",
    name: "AC Power Source Variac",
    description: "Variable AC autotransformer power source (0-270V, 5A).",
    category: "Electronics",
    quantity: 6,
    availableQuantity: 4,
    status: "Maintenance",
  },
];

import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Bar, Pie } from "react-chartjs-2";
import api from "../../services/api";

export default function ManagerInventoryAnalytics() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [stats, setStats] = useState({
    totalInventory: 0,
    availableInventory: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    underMaintenance: 0,
  });

  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await api.get("/equipment");
      const list = response.data || [];
      setEquipmentList(list);

      // Calculations
      const totalQty = list.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const availableQty = list.reduce((sum, item) => sum + (item.availableQuantity ?? 0), 0);
      const lowStock = list.filter(
        (item) => (item.availableQuantity ?? 0) > 0 && (item.availableQuantity ?? 0) <= 2
      ).length;
      const outOfStock = list.filter((item) => (item.availableQuantity ?? 0) <= 0).length;
      const maintenance = list.filter(
        (item) =>
          item.status?.toLowerCase() === "maintenance" ||
          item.status?.toLowerCase() === "under maintenance"
      ).length;

      setStats({
        totalInventory: totalQty,
        availableInventory: availableQty,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock,
        underMaintenance: maintenance,
      });

      // Pie Chart: Availability status breakdown
      setPieChartData({
        labels: ["Available stock", "Checked out stock", "Under Maintenance"],
        datasets: [
          {
            data: [availableQty, totalQty - availableQty - maintenance, maintenance],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
          },
        ],
      });

      // Bar Chart: Category distribution counts
      const cats = Array.from(new Set(list.map((item) => item.category)));
      const catCounts = cats.map(
        (cat) => list.filter((item) => item.category === cat).length
      );

      setBarChartData({
        labels: cats.length > 0 ? cats : ["No Category Data"],
        datasets: [
          {
            label: "Device Count per Category",
            data: catCounts.length > 0 ? catCounts : [0],
            backgroundColor: "#1e3a8a",
            borderRadius: 4,
          },
        ],
      });
    } catch (err) {
      console.warn("GET /equipment failed. Loading local mock inventory metrics.", err);
      setEquipmentList(MOCK_EQUIPMENT);
      
      const list = MOCK_EQUIPMENT;
      const totalQty = list.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const availableQty = list.reduce((sum, item) => sum + (item.availableQuantity ?? 0), 0);
      const lowStock = list.filter(
        (item) => (item.availableQuantity ?? 0) > 0 && (item.availableQuantity ?? 0) <= 2
      ).length;
      const outOfStock = list.filter((item) => (item.availableQuantity ?? 0) <= 0).length;
      const maintenance = list.filter((item) => item.status === "Maintenance").length;

      setStats({
        totalInventory: totalQty,
        availableInventory: availableQty,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock,
        underMaintenance: maintenance,
      });

      setPieChartData({
        labels: ["Available stock", "Checked out stock", "Under Maintenance"],
        datasets: [
          {
            data: [availableQty, totalQty - availableQty - maintenance, maintenance],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
          },
        ],
      });

      setBarChartData({
        labels: ["Electronics", "Chemistry", "Biology"],
        datasets: [
          {
            label: "Device Count per Category",
            data: [1, 1, 1],
            backgroundColor: "#1e3a8a",
            borderRadius: 4,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
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

  const categories = ["All", ...new Set(equipmentList.map((item) => item.category))];

  // Filters
  const filteredList = equipmentList.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedList = filteredList.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
          Inventory Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor catalog volumes, stock levels, and device availability parameters.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Total Inventory
              </Typography>
              <Typography variant="h5" fontWeight={850} color="text.primary" mt={0.5}>
                {stats.totalInventory}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Available Qty
              </Typography>
              <Typography variant="h5" fontWeight={850} color="success.main" mt={0.5}>
                {stats.availableInventory}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Low Stock
              </Typography>
              <Typography variant="h5" fontWeight={850} color="warning.main" mt={0.5}>
                {stats.lowStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Out of Stock
              </Typography>
              <Typography variant="h5" fontWeight={850} color="error.main" mt={0.5}>
                {stats.outOfStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Under repairs
              </Typography>
              <Typography variant="h5" fontWeight={850} color="error.main" mt={0.5}>
                {stats.underMaintenance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              Availability Status Breakdown
            </Typography>
            <Box height={240} display="flex" justifyContent="center">
              {pieChartData && <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              Category Distribution Counts
            </Typography>
            <Box height={240}>
              {barChartData && <Bar data={barChartData} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
          <Grid item xs={12} md={6}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Equipment Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Quantity</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }} align="center">Available Quantity</TableCell>
              <TableCell sx={{ fontWeight: 650, color: "#475569" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedList.length > 0 ? (
              paginatedList.map((item) => {
                const itemId = item.id || item._id;
                return (
                  <TableRow key={itemId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" sx={{ backgroundColor: "#f1f5f9", fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{item.availableQuantity}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={getStatusColor(item.status)} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No items match filters.</Typography>
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

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", description: "Oscilloscope device description." },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Maintenance", description: "UV Spectrometer description." },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available", description: "Centrifuge description." },
];

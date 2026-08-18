import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextField,
  InputAdornment,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ScienceIcon from "@mui/icons-material/Science";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import JoinWaitlistModal from "../../components/JoinWaitlistModal";

const MOCK_STUDENT_WAITLIST = [
  {
    id: "wl-101",
    equipmentId: "1",
    equipmentName: "High-Resolution NMR Spectrometer 500MHz",
    department: "Chemistry & Materials Lab",
    requestDate: "2026-08-01",
    preferredDates: "2026-08-10 to 2026-08-12",
    queuePosition: 2,
    totalInQueue: 5,
    estimatedWait: "2 Days",
    status: "In Queue",
  },
  {
    id: "wl-102",
    equipmentId: "3",
    equipmentName: "Refrigerated High-Speed Centrifuge",
    department: "Biotechnology Lab B",
    requestDate: "2026-08-03",
    preferredDates: "2026-08-08 to 2026-08-09",
    queuePosition: 1,
    totalInQueue: 3,
    estimatedWait: "Ready (1 Day)",
    status: "Notified",
  },
];

const MOCK_EQUIPMENT_DROPDOWN = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry" },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology" },
  { id: "4", name: "High-Resolution NMR Spectrometer 500MHz", category: "Chemistry" },
];

export default function StudentWaitlist() {
  const navigate = useNavigate();
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [leaveTarget, setLeaveTarget] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);

  const username = localStorage.getItem("username") || "Student";

  const fetchEquipmentCatalog = async () => {
    try {
      const response = await api.get("/equipment");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data || MOCK_EQUIPMENT_DROPDOWN;
      setEquipmentList(list);
    } catch (err) {
      setEquipmentList(MOCK_EQUIPMENT_DROPDOWN);
    }
  };

  const loadWaitlistData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await api.get("/waitlist");
      const rawData = response?.data;
      let list = [];
      if (Array.isArray(rawData)) list = rawData;
      else if (rawData && Array.isArray(rawData.data)) list = rawData.data;
      else list = MOCK_STUDENT_WAITLIST;

      // Filter local storage waitlists
      const localList = JSON.parse(localStorage.getItem("local_waitlist") || "[]");
      const combined = [...list, ...localList];
      setWaitlist(combined);
    } catch (err) {
      console.warn("GET /waitlist endpoint unavailable. Loading mock waitlist data.", err);
      const localList = JSON.parse(localStorage.getItem("local_waitlist") || "[]");
      setWaitlist([...MOCK_STUDENT_WAITLIST, ...localList]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlistData();
    fetchEquipmentCatalog();
  }, []);

  const handleWaitlistSuccess = (newEntry) => {
    setSuccessMsg(`Successfully joined waitlist for ${newEntry.equipmentName || "equipment"}!`);
    setSnackbarOpen(true);
    loadWaitlistData();
  };

  const handleConfirmLeave = async () => {
    if (!leaveTarget) return;
    const targetId = leaveTarget.id;
    const eqName = leaveTarget.equipmentName || "Resource";

    try {
      await api.delete(`/waitlist/${targetId}`);
      setSuccessMsg(`Successfully removed from waitlist for ${eqName}.`);
    } catch (err) {
      console.warn("DELETE /waitlist failed. Updating locally (Demo mode).", err);
      const updated = waitlist.filter((w) => w.id !== targetId);
      setWaitlist(updated);
      localStorage.setItem(
        "local_waitlist",
        JSON.stringify(updated.filter((w) => !w.id.startsWith("wl-")))
      );
      setSuccessMsg(`Removed from waitlist for ${eqName} (Demo Mode).`);
    } finally {
      setLeaveTarget(null);
      setSnackbarOpen(true);
    }
  };

  const filteredWaitlist = waitlist.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.equipmentName?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  });

  const activeCount = waitlist.length;
  const bestPosition = waitlist.length > 0 ? Math.min(...waitlist.map((w) => w.queuePosition || 99)) : 0;
  const notifiedCount = waitlist.filter((w) => w.status?.toLowerCase().includes("notified")).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Waitlist Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your queue position, estimated availability, and waitlist requests for lab equipment.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            + Join Waitlist
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/equipment")}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Browse Catalog
          </Button>
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Active Waitlist Requests
                </Typography>
                <Typography variant="h4" fontWeight={850} color="primary.main" mt={0.5}>
                  {activeCount}
                </Typography>
              </Box>
              <HourglassEmptyIcon color="primary" sx={{ fontSize: 38, opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Best Queue Position
                </Typography>
                <Typography variant="h4" fontWeight={850} color="secondary.main" mt={0.5}>
                  {bestPosition > 0 ? `#${bestPosition}` : "-"}
                </Typography>
              </Box>
              <ScienceIcon color="secondary" sx={{ fontSize: 38, opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Ready to Book Notifications
                </Typography>
                <Typography variant="h4" fontWeight={850} color="success.main" mt={0.5}>
                  {notifiedCount}
                </Typography>
              </Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 38, opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by equipment, department, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 400, backgroundColor: "background.paper", borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Main Waitlist Table */}
      <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, overflow: "hidden" }}>
        {filteredWaitlist.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Equipment Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Preferred Slot</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Queue Position</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estimated Wait</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWaitlist.map((item) => {
                  const isNotified = item.status?.toLowerCase().includes("notified");
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 650 }}>{item.equipmentName}</TableCell>
                      <TableCell color="text.secondary">{item.department || "General Lab"}</TableCell>
                      <TableCell>{item.preferredDates || item.requestDate || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={`Position #${item.queuePosition || 1}`}
                          color={item.queuePosition === 1 ? "success" : "primary"}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>{item.estimatedWait || "1-2 Days"}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || "In Queue"}
                          color={isNotified ? "success" : "warning"}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                          {isNotified && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => navigate(`/student/book/${item.equipmentId || 1}`)}
                              sx={{ fontWeight: 700 }}
                            >
                              Book Now
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/equipment/${item.equipmentId || 1}`)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setLeaveTarget(item)}
                          >
                            Leave
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <HourglassEmptyIcon color="action" sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No active waitlist entries found.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              When high-demand equipment is fully booked, you can join the queue to be notified as soon as a slot opens.
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
                + Join Waitlist
              </Button>
              <Button variant="outlined" color="primary" onClick={() => navigate("/equipment")}>
                Browse Equipment Catalog
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Join Waitlist Dialog Modal */}
      <JoinWaitlistModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipmentList={equipmentList}
        onSuccess={handleWaitlistSuccess}
      />

      {/* Leave Waitlist Confirmation Dialog */}
      <Dialog open={Boolean(leaveTarget)} onClose={() => setLeaveTarget(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Leave Waitlist Queue?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove yourself from the waitlist for{" "}
            <strong>{leaveTarget?.equipmentName}</strong>? You will lose your current position in line.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeaveTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmLeave} color="error" variant="contained">
            Confirm & Leave Queue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={successMsg}
      />
    </Box>
  );
}

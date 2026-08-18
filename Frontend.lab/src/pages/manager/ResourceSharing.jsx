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
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import BusinessIcon from "@mui/icons-material/Business";
import ForwardIcon from "@mui/icons-material/Forward";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import api from "../../services/api";

// Fallback Mock Data
const MOCK_PARTNER_INSTITUTIONS = [
  { id: "inst-1", name: "Metropolitan Tech University", campus: "North Campus", activeBorrows: 3, activeLends: 2, trustScore: "Tier-1 Excellent" },
  { id: "inst-2", name: "State Science & Research Center", campus: "Main Facility", activeBorrows: 1, activeLends: 4, trustScore: "Tier-1 Excellent" },
  { id: "inst-3", name: "National Institute of Physics", campus: "South Lab", activeBorrows: 0, activeLends: 1, trustScore: "Tier-2 Verified" },
  { id: "inst-4", name: "Global Biochem Laboratories", campus: "Tech Park", activeBorrows: 2, activeLends: 0, trustScore: "Tier-2 Verified" },
];

const MOCK_SHARING_REQUESTS_INCOMING = [
  { id: "req-501", fromInstitution: "Metropolitan Tech University", equipmentName: "Ultrafast Spectrophotometer", qty: 1, durationDays: 14, status: "Pending", requester: "Dr. Rachel Green" },
  { id: "req-502", fromInstitution: "State Science & Research Center", campus: "Main Facility", equipmentName: "Gas Chromatograph MS", qty: 1, durationDays: 30, status: "Approved", requester: "Prof. Alan Turing" },
];

const MOCK_SHARING_REQUESTS_OUTGOING = [
  { id: "req-601", toInstitution: "National Institute of Physics", equipmentName: "High-Vac Sputter System", qty: 1, durationDays: 7, status: "Pending", requester: "Sarah Manager" },
  { id: "req-602", toInstitution: "State Science & Research Center", equipmentName: "Helium Leak Detector", qty: 2, durationDays: 21, status: "Approved", requester: "Sarah Manager" },
];

const MOCK_EXTERNAL_BOOKINGS = [
  { id: "ext-101", requester: "Michael Scott (Metropolitan Tech)", equipmentName: "High-Frequency Oscilloscope", date: "2026-07-22", duration: "10:00 - 14:00", status: "Pending" },
  { id: "ext-102", requester: "Pam Beesly (State Research)", equipmentName: "DNA Sequencer NextGen", date: "2026-07-24", duration: "09:00 - 17:00", status: "Approved" },
];

const MOCK_EQUIPMENT_SHARING = [
  { id: "e101", name: "High-Frequency Oscilloscope", category: "Electronics", quantity: 3, availableQuantity: 2, status: "Available" },
  { id: "e102", name: "Ultrafast Spectrophotometer", category: "Chemistry", quantity: 1, availableQuantity: 1, status: "Available" },
  { id: "e103", name: "DNA Sequencer NextGen", category: "Biology", quantity: 2, availableQuantity: 1, status: "Available" },
  { id: "e104", name: "Universal Tensile Tester", category: "Mechanical", quantity: 1, availableQuantity: 0, status: "Booked" },
];

export default function ManagerResourceSharing() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Sharing request dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sharingTarget, setSharingTarget] = useState(null);
  const [targetInstitution, setTargetInstitution] = useState("");
  const [shareDuration, setShareDuration] = useState(14);
  const [shareNotes, setShareNotes] = useState("");

  // Workflow Lists States
  const [incomingRequests, setIncomingRequests] = useState(MOCK_SHARING_REQUESTS_INCOMING);
  const [outgoingRequests, setOutgoingRequests] = useState(MOCK_SHARING_REQUESTS_OUTGOING);
  const [externalBookings, setExternalBookings] = useState(MOCK_EXTERNAL_BOOKINGS);

  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/equipment");
      console.log("Resource sharing API response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.content)
            ? response.data.content
            : [];

      setEquipmentList(data);
    } catch (err) {
      console.warn("GET /equipment failed. Loading local catalog.", err);
      setEquipmentList(Array.isArray(MOCK_EQUIPMENT_SHARING) ? MOCK_EQUIPMENT_SHARING : []);
      setErrorMsg("Failed to sync catalog with server. Displaying offline demo items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleShareClick = (item) => {
    setSharingTarget(item);
    setDialogOpen(true);
  };

  const handleConfirmShare = () => {
    if (!sharingTarget || !targetInstitution) return;
    const newOutgoing = {
      id: `req-${Math.floor(Math.random() * 900) + 100}`,
      toInstitution: targetInstitution,
      equipmentName: sharingTarget.name,
      qty: 1,
      durationDays: shareDuration,
      status: "Pending",
      requester: "Sarah Manager (Local)",
    };
    setOutgoingRequests((prev) => (Array.isArray(prev) ? [newOutgoing, ...prev] : [newOutgoing]));
    setSuccessMsg(`Proposed sharing of "${sharingTarget.name}" with "${targetInstitution}" successfully.`);
    setSnackbarOpen(true);
    setDialogOpen(false);
    setTargetInstitution("");
    setShareDuration(14);
    setShareNotes("");
    setSharingTarget(null);
  };

  const handleIncomingStatus = (reqId, isApproved) => {
    setIncomingRequests((prev) =>
      (Array.isArray(prev) ? prev : []).map((req) => (req.id === reqId ? { ...req, status: isApproved ? "Approved" : "Rejected" } : req))
    );
    setSuccessMsg(`Request ${reqId} has been successfully ${isApproved ? "Approved" : "Rejected"}.`);
    setSnackbarOpen(true);
  };

  const handleExternalBookingStatus = (bookingId, isApproved) => {
    setExternalBookings((prev) =>
      (Array.isArray(prev) ? prev : []).map((b) => (b.id === bookingId ? { ...b, status: isApproved ? "Approved" : "Rejected" } : b))
    );
    setSuccessMsg(`External user booking ${bookingId} has been ${isApproved ? "Approved" : "Rejected"}.`);
    setSnackbarOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
      case "approved":
        return "success";
      case "booked":
      case "pending":
        return "warning";
      case "rejected":
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];
  const safeIncomingRequests = Array.isArray(incomingRequests) ? incomingRequests : [];
  const safeOutgoingRequests = Array.isArray(outgoingRequests) ? outgoingRequests : [];
  const safeExternalBookings = Array.isArray(externalBookings) ? externalBookings : [];

  const categories = ["All", ...new Set(safeEquipmentList.map((item) => item?.category).filter(Boolean))];

  const filteredList = safeEquipmentList.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.name || "")?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "")?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
          Inter-Institution Resource Sharing
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Share assets with partner colleges, approve incoming reservation requests, and manage shared catalogs.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
        <Tabs
          value={activeTab}
          onChange={(e, nv) => setActiveTab(nv)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<LibraryBooksIcon />} label="Shared Catalog" sx={{ fontWeight: 700 }} />
          <Tab icon={<ForwardIcon />} label="Sharing Workflows" sx={{ fontWeight: 700 }} />
          <Tab icon={<BusinessIcon />} label="Partner Institutions" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          {/* Catalog Filter Controls */}
          <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search equipment for inter-institution share..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Category Filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Catalog List */}
          {loading && safeEquipmentList.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Total Qty</TableCell>
                    <TableCell align="center">Available Local</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <TableRow key={item.id || Math.random()} hover>
                        <TableCell sx={{ fontWeight: 650 }}>{item.name}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.availableQuantity}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" color={getStatusColor(item.status)} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<ShareIcon />}
                            disabled={(item.availableQuantity ?? 0) <= 0}
                            onClick={() => handleShareClick(item)}
                            sx={{ boxShadow: "none", fontWeight: 700 }}
                          >
                            Share Externally
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No resources available for sharing.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Workflows grids */}
          <Grid container spacing={4}>
            {/* Incoming Requests */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={750} mb={2}>
                    Incoming Borrow Requests from Partner Institutions
                  </Typography>
                  <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Request ID</TableCell>
                          <TableCell>Partner Institution</TableCell>
                          <TableCell>Asset Requested</TableCell>
                          <TableCell>Requested By</TableCell>
                          <TableCell align="center">Borrow Term</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeIncomingRequests.length > 0 ? (
                          safeIncomingRequests.map((req) => (
                            <TableRow key={req.id}>
                              <TableCell sx={{ fontWeight: 650 }}>{req.id}</TableCell>
                              <TableCell>{req.fromInstitution}</TableCell>
                              <TableCell sx={{ fontWeight: 550 }}>{req.equipmentName}</TableCell>
                              <TableCell>{req.requester}</TableCell>
                              <TableCell align="center">{req.durationDays} Days</TableCell>
                              <TableCell>
                                <Chip label={req.status} size="small" color={getStatusColor(req.status)} sx={{ fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="right">
                                {req.status === "Pending" && (
                                  <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <IconButton color="success" size="small" onClick={() => handleIncomingStatus(req.id, true)}>
                                      <CheckIcon />
                                    </IconButton>
                                    <IconButton color="error" size="small" onClick={() => handleIncomingStatus(req.id, false)}>
                                      <ClearIcon />
                                    </IconButton>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">No incoming requests.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Outgoing Requests */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={750} mb={2}>
                    Outgoing Requests Sent to Partner Networks
                  </Typography>
                  <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Request ID</TableCell>
                          <TableCell>Destination Institution</TableCell>
                          <TableCell>Asset Proposed</TableCell>
                          <TableCell align="center">Lend Term</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeOutgoingRequests.length > 0 ? (
                          safeOutgoingRequests.map((req) => (
                            <TableRow key={req.id}>
                              <TableCell sx={{ fontWeight: 650 }}>{req.id}</TableCell>
                              <TableCell>{req.toInstitution}</TableCell>
                              <TableCell sx={{ fontWeight: 550 }}>{req.equipmentName}</TableCell>
                              <TableCell align="center">{req.durationDays} Days</TableCell>
                              <TableCell>
                                <Chip label={req.status} size="small" color={getStatusColor(req.status)} sx={{ fontWeight: 700 }} />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">No outgoing requests.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* External User Bookings approvals */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={750} mb={2}>
                    External User Individual Booking Approvals
                  </Typography>
                  <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Booking ID</TableCell>
                          <TableCell>External Researcher</TableCell>
                          <TableCell>Equipment</TableCell>
                          <TableCell>Booking Slot</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeExternalBookings.length > 0 ? (
                          safeExternalBookings.map((b) => (
                            <TableRow key={b.id}>
                              <TableCell sx={{ fontWeight: 650 }}>{b.id}</TableCell>
                              <TableCell>{b.requester}</TableCell>
                              <TableCell sx={{ fontWeight: 550 }}>{b.equipmentName}</TableCell>
                              <TableCell>{b.date} | {b.duration}</TableCell>
                              <TableCell>
                                <Chip label={b.status} size="small" color={getStatusColor(b.status)} sx={{ fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="right">
                                {b.status === "Pending" && (
                                  <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <Button
                                      variant="outlined"
                                      color="success"
                                      size="small"
                                      onClick={() => handleExternalBookingStatus(b.id, true)}
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="text"
                                      color="error"
                                      size="small"
                                      onClick={() => handleExternalBookingStatus(b.id, false)}
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Deny
                                    </Button>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">No external bookings.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            {MOCK_PARTNER_INSTITUTIONS.map((inst) => (
              <Grid item xs={12} sm={6} md={3} key={inst.id}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Avatar sx={{ mx: "auto", mb: 2, width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                      <BusinessIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={800} noWrap>
                      {inst.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Campus: {inst.campus}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" justifyContent="space-between" px={1} mb={1}>
                      <Typography variant="body2" color="text.secondary">Lending:</Typography>
                      <Typography variant="body2" fontWeight={700}>{inst.activeLends} items</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" px={1} mb={2}>
                      <Typography variant="body2" color="text.secondary">Borrowing:</Typography>
                      <Typography variant="body2" fontWeight={700}>{inst.activeBorrows} items</Typography>
                    </Box>
                    <Chip label={inst.trustScore} color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Initiate Resource Sharing</DialogTitle>
        <DialogContent>
          <Box mt={1.5} display="flex" flexDirection="column" gap={3}>
            <Typography variant="body2" color="text.secondary">
              Transfer temporary access and operating rights of <strong>{sharingTarget?.name}</strong> to a partner institution:
            </Typography>

            <TextField
              fullWidth
              select
              label="Select Partner Institution"
              value={targetInstitution}
              onChange={(e) => setTargetInstitution(e.target.value)}
            >
              {MOCK_PARTNER_INSTITUTIONS.map((inst) => (
                <MenuItem key={inst.id} value={inst.name}>
                  {inst.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Lend Term Duration (Days)"
              value={shareDuration}
              onChange={(e) => setShareDuration(parseInt(e.target.value))}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Agreement notes / Transfer conditions"
              value={shareNotes}
              onChange={(e) => setShareNotes(e.target.value)}
              placeholder="E.g., User must handle calibration logs upon return."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="text" color="inherit" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!targetInstitution}
            onClick={handleConfirmShare}
            sx={{ fontWeight: 700, boxShadow: "none" }}
          >
            Confirm sharing Proposal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast popup */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={successMsg}
      />
    </Box>
  );
}

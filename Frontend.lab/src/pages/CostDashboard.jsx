import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import CostSummaryCards from "../components/cost/CostSummaryCards";
import MonthlyCostChart from "../components/cost/MonthlyCostChart";
import DepartmentCostTable from "../components/cost/DepartmentCostTable";
import BillingDetails from "../components/cost/BillingDetails";

import {
  getDashboardCost,
  getMonthlyCost,
  getDepartmentCost,
  getBilling,
} from "../services/costService";

export default function CostDashboard() {
  const [summary, setSummary] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [department, setDepartment] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [openModal, setOpenModal] = useState(false);
  const [newAllocation, setNewAllocation] = useState({
    department: "",
    equipment: "",
    amount: "",
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, deptRes, billRes] = await Promise.allSettled([
        getDashboardCost(),
        getMonthlyCost(),
        getDepartmentCost(),
        getBilling(),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary(sumRes.value.data);
      if (monthRes.status === "fulfilled" && monthRes.value?.data) setMonthly(monthRes.value.data);
      if (deptRes.status === "fulfilled" && deptRes.value?.data) setDepartment(deptRes.value.data);
      if (billRes.status === "fulfilled" && billRes.value?.data) setBilling(billRes.value.data);
    } catch (err) {
      console.error("Failed to load cost data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportStatement = () => {
    setToast({ open: true, message: "Cost Sharing & Billing statement exported successfully!", severity: "success" });
  };

  const handleCreateAllocation = () => {
    if (!newAllocation.department || !newAllocation.amount) {
      setToast({ open: true, message: "Please enter department and amount.", severity: "warning" });
      return;
    }

    const newBillingItem = {
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      department: newAllocation.department,
      amount: parseFloat(newAllocation.amount),
      status: "PENDING",
      dueDate: newAllocation.dueDate || "2026-08-30",
    };

    setBilling((prev) => [newBillingItem, ...prev]);
    setToast({ open: true, message: "Cost allocation invoice created successfully!", severity: "success" });
    setOpenModal(false);
    setNewAllocation({ department: "", equipment: "", amount: "", dueDate: "", description: "" });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Banner Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1.5, color: "#1e3a8a", letterSpacing: -0.5 }}>
            <AttachMoneyIcon fontSize="large" color="primary" /> 💰 Cost Sharing & Financial Allocation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor inter-laboratory cost recovery, equipment usage billing, maintenance split, and billing statements.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCostData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExportStatement}>
            Export Statement
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ fontWeight: 700, borderRadius: 2.5, boxShadow: 3 }}
          >
            Create Allocation
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
            Loading cost sharing data...
          </Typography>
        </Box>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <Box sx={{ mb: 3.5 }}>
            <CostSummaryCards data={summary} />
          </Box>

          {/* Monthly Chart Breakdown */}
          <MonthlyCostChart data={monthly} />

          {/* Inter-Department Allocation Breakdown Table */}
          <DepartmentCostTable data={department} />

          {/* Billing & Invoices Table */}
          <BillingDetails data={billing} />
        </>
      )}

      {/* Modal for Creating New Cost Allocation */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Inter-Department Cost Allocation</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Department / Facility"
                placeholder="e.g. Physics Quantum Lab"
                value={newAllocation.department}
                onChange={(e) => setNewAllocation({ ...newAllocation, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Allocated Amount (₹)"
                type="number"
                placeholder="25000"
                value={newAllocation.amount}
                onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Payment Due Date"
                InputLabelProps={{ shrink: true }}
                value={newAllocation.dueDate}
                onChange={(e) => setNewAllocation({ ...newAllocation, dueDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Allocation Description / Equipment Used"
                placeholder="Cost sharing for SEM-500 microscope runtime..."
                value={newAllocation.description}
                onChange={(e) => setNewAllocation({ ...newAllocation, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateAllocation} sx={{ fontWeight: 700 }}>
            Generate Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

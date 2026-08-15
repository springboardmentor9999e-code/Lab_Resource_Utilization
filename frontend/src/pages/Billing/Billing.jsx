import { useEffect, useState } from "react";
import billingService from "../../services/billingService";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useAuth } from "../../context/AuthContext";

import {
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
PieChart,
Pie,
Cell,
Legend,
LineChart,
Line
} from "recharts";

function Billing() {
    const [billings, setBillings] = useState([]);
    const [departmentCosts, setDepartmentCosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const { role, userId, institutionId } = useAuth();
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    averageInvoiceValue: 0,
  });

  useEffect(() => {
    loadSummary();
    loadBillings();
    loadDepartmentCost();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await billingService.getBillingSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsPaid = async (billingId) => {

    try {

        await billingService.markAsPaid(billingId);

        await loadSummary();
        await loadBillings();

    } catch (error) {

        console.error(error);

    }

};

  const loadBillings = async () => {

    try {

        let data = [];

        switch (role) {

            case "SYSTEM_ADMIN":
                data = await billingService.getAllBilling();
                break;

            case "INSTITUTE_ADMIN":
                data = await billingService.getInstitutionBilling(institutionId);
                break;

            case "DEPARTMENT_HEAD":
                data = await billingService.getDepartmentBilling(userId);
                break;

            case "FACULTY":
            case "STUDENT":
                data = await billingService.getMyBilling();
                break;

            default:
                data = [];
        }

        setBillings(data);

    } catch (error) {

        console.error(error);

    }

};

const loadDepartmentCost = async () => {
  try {
    const data = await billingService.getDepartmentWiseCost();
    setDepartmentCosts(data);
  } catch (error) {
    console.error(error);
  }
};

const filteredBillings = billings.filter((bill) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
        bill.institutionName?.toLowerCase().includes(search) ||
        bill.departmentName?.toLowerCase().includes(search) ||
        bill.equipmentName?.toLowerCase().includes(search);

    const matchesFilter =
        filter === "ALL" ||
        bill.paymentStatus === filter;

    return matchesSearch && matchesFilter;

});

const indexOfLastRecord = page * rowsPerPage;

const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;

const currentBillings = filteredBillings.slice(
    indexOfFirstRecord,
    indexOfLastRecord
);

const handleOpenDialog = (bill) => {

    setSelectedBill(bill);

    setOpenDialog(true);

};

const handleCloseDialog = () => {

    setOpenDialog(false);

    setSelectedBill(null);
};

const handleDownloadInvoice = (bill) => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Lab Resource Utilization Platform", 20, 20);

    doc.setFontSize(14);
    doc.text("Invoice", 20, 35);

    doc.setFontSize(12);

    doc.text(`Invoice ID : ${bill.billingId}`, 20, 50);
    doc.text(`Institution : ${bill.institutionName}`, 20, 60);
    doc.text(`Department : ${bill.departmentName}`, 20, 70);
    doc.text(`Laboratory : ${bill.laboratoryName}`, 20, 80);
    doc.text(`Equipment : ${bill.equipmentName}`, 20, 90);

    doc.text(`Equipment Cost : ₹ ${bill.equipmentCost}`, 20, 105);
    doc.text(`Laboratory Cost : ₹ ${bill.laboratoryCost}`, 20, 115);

    doc.setFontSize(13);

    doc.text(`Total Cost : ₹ ${bill.totalCost}`, 20, 130);

    doc.text(`Payment Status : ${bill.paymentStatus}`, 20, 140);

    doc.text(`Generated Date : ${bill.generatedDate}`, 20, 150);

    doc.save(`Invoice_${bill.billingId}.pdf`);

};

const handleExportExcel = () => {

    const exportData = billings.map((bill) => ({

        "Invoice ID": bill.billingId,
        "Institution": bill.institutionName,
        "Department": bill.departmentName,
        "Laboratory": bill.laboratoryName,
        "Equipment": bill.equipmentName,
        "Equipment Cost": bill.equipmentCost,
        "Laboratory Cost": bill.laboratoryCost,
        "Total Cost": bill.totalCost,
        "Payment Status": bill.paymentStatus,
        "Generated Date": bill.generatedDate

    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Billing Report"
    );

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const data = new Blob(
        [excelBuffer],
        {
            type: "application/octet-stream"
        }
    );

    saveAs(data, "Billing_Report.xlsx");

};

const handleExportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Lab Resource Utilization Platform", 14, 18);

    doc.setFontSize(14);
    doc.text("Billing Report", 14, 28);

    const tableColumn = [

        "Invoice",
        "Institution",
        "Department",
        "Laboratory",
        "Equipment",
        "Total",
        "Status",
        "Date"

    ];

    const tableRows = [];

    billings.forEach((bill) => {

        tableRows.push([

            bill.billingId,
            bill.institutionName,
            bill.departmentName,
            bill.laboratoryName,
            bill.equipmentName,
            `₹ ${bill.totalCost}`,
            bill.paymentStatus,
            bill.generatedDate

        ]);

    });

    autoTable(doc, {

        head: [tableColumn],

        body: tableRows,

        startY: 38,

        styles: {

            fontSize: 10

        },

        headStyles: {

            fillColor: [25, 118, 210]

        }

    });

    doc.save("Billing_Report.pdf");

};

const departmentChartData = departmentCosts.map((dept) => ({
    name: dept.departmentName,
    revenue: dept.totalCost
}));

const paymentChartData = [

{
name: "Paid",
value: summary.paidInvoices
},

{
name: "Pending",
value: summary.pendingPayments
}

];
const COLORS = ["#4CAF50", "#FF9800"];

const monthlyRevenue = {};

billings.forEach((bill) => {
    if (bill.generatedDate && bill.totalCost != null) {

        const date = String(bill.generatedDate);
        const month = date.substring(0, 7);

        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }

        monthlyRevenue[month] += Number(bill.totalCost);
    }
});

const monthlyRevenueData = Object.keys(monthlyRevenue)
    .sort()
    .map((key) => ({
        month: key,
        revenue: Number(monthlyRevenue[key])
    }));


const institutionRevenue = {};

billings.forEach((bill) => {

    const institution =
        bill.institutionName?.trim() || "Unknown Institution";

    if (!institutionRevenue[institution]) {
        institutionRevenue[institution] = 0;
    }

    institutionRevenue[institution] += Number(bill.totalCost || 0);

});

const institutionChartData = Object.keys(institutionRevenue).map((key) => ({
    institution: key,
    revenue: Number(institutionRevenue[key])
}));
console.log("Billing role:", role);
console.log("Billing role:", role);
console.log("Billing userId:", userId);
console.log("Billing institutionId:", institutionId);
console.log("Billing records:", billings);
console.log("Institution chart:", institutionChartData);
console.log("Monthly revenue chart:", monthlyRevenueData);
  return (
    <>
        <Box
        sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: 3,
        }}
        >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        >
        Billing Management
        </Typography>
        {(role === "SYSTEM_ADMIN" ||
  role === "INSTITUTE_ADMIN" ||
  role === "DEPARTMENT_HEAD") && (
      <Grid container spacing={3} justifyContent="center">

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>

              <Typography color="text.secondary">
                Total Revenue
              </Typography>

              <Typography
                variant="h4"
                color="primary"
                fontWeight="bold"
              >
                ₹ {summary.totalRevenue}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>

              <Typography color="text.secondary">
                Total Invoices
              </Typography>

              <Typography
                variant="h4"
                color="success.main"
                fontWeight="bold"
              >
                {summary.totalInvoices}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>

              <Typography color="text.secondary">
                Pending Payments
              </Typography>

              <Typography
                variant="h4"
                color="warning.main"
                fontWeight="bold"
              >
                {summary.pendingPayments}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>

              <Typography color="text.secondary">
                Paid Invoices
              </Typography>

              <Typography
                variant="h4"
                color="success.main"
                fontWeight="bold"
              >
                {summary.paidInvoices}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>

              <Typography color="text.secondary">
                Average Invoice
              </Typography>

              <Typography
                variant="h4"
                color="secondary"
                fontWeight="bold"
              >
                ₹ {summary.averageInvoiceValue}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

      </Grid>
      )}
</Box>

      <Box mt={5}>
        <Box
    sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 2
    }}
>

<TextField
    label="Search Institution / Department / Equipment"
    size="small"
    value={searchTerm}
    onChange={(e) => {

    setSearchTerm(e.target.value);

    setPage(1);

}}
    sx={{
        width: { xs: "100%", md: 420 }
    }}
/>

<Box>

<Button
variant={filter === "ALL" ? "contained" : "outlined"}
onClick={() => setFilter("ALL")}
sx={{ mr: 1 }}
>
All
</Button>

<Button
variant={filter === "PENDING" ? "contained" : "outlined"}
color="warning"
onClick={() => setFilter("PENDING")}
sx={{ mr: 1 }}
>
Pending
</Button>

<Button
variant={filter === "PAID" ? "contained" : "outlined"}
color="success"
onClick={() => setFilter("PAID")}
>
Paid
</Button>

</Box>

</Box>




<Typography
variant="h5"
fontWeight="bold"
>
Billing Records
</Typography>


<Box>
{(role === "SYSTEM_ADMIN" || role === "INSTITUTE_ADMIN") && (

<>
<Button
variant="contained"
color="success"
onClick={handleExportExcel}
sx={{ mr: 2 }}
>
Export Excel
</Button>

<Button
variant="contained"
color="error"
onClick={handleExportPDF}
>
Export PDF
</Button>
</>

)}
</Box>

  <TableContainer
  component={Paper}
  sx={{
    width: "100%",
    borderRadius: 3,
    boxShadow: 3,
    overflowX: "auto",
  }}
>

    <Table>

      <TableHead
        sx={{ backgroundColor: "#1976d2" }}
      >

        <TableRow>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Invoice ID
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Institution
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Department
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Laboratory
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Equipment
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Equipment Cost
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Laboratory Cost
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Total Cost
          </TableCell>

          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Payment
          </TableCell>
          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            View
            </TableCell>

            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Action
            </TableCell>
          <TableCell sx={{ color: "white", fontWeight: "bold" }}>
            Date
          </TableCell>

        </TableRow>

      </TableHead>

      <TableBody>

        {currentBillings.map((bill) => (

          <TableRow key={bill.billingId} hover>

            <TableCell>{bill.billingId}</TableCell>

            <TableCell>{bill.institutionName}</TableCell>

            <TableCell>{bill.departmentName}</TableCell>

            <TableCell>{bill.laboratoryName}</TableCell>

            <TableCell>{bill.equipmentName}</TableCell>

            <TableCell>
              ₹ {bill.equipmentCost}
            </TableCell>

            <TableCell>
              ₹ {bill.laboratoryCost}
            </TableCell>

            <TableCell>
              ₹ {bill.totalCost}
            </TableCell>

            <TableCell>{bill.paymentStatus}</TableCell>

            <TableCell align="center">

            <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleOpenDialog(bill)}
            >
                View
            </Button>

            </TableCell>
            <TableCell align="center">
            {(role === "SYSTEM_ADMIN" || role === "INSTITUTE_ADMIN") ? (

    bill.paymentStatus === "PENDING" ? (

        <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleMarkAsPaid(bill.billingId)}
        >
            Mark as Paid
        </Button>

    ) : (

        <Button
            variant="contained"
            color="primary"
            size="small"
            disabled
        >
            Paid
        </Button>

    )

) : (

    <Typography color="text.secondary">
        -
    </Typography>

)}
            </TableCell>

    <TableCell>  {bill.generatedDate} </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>

  </TableContainer>

</Box>

<Stack
    spacing={2}
    mt={3}
    alignItems="center"
>
    <Pagination
        count={Math.ceil(filteredBillings.length / rowsPerPage)}
        page={page}
        color="primary"
        onChange={(event, value) => setPage(value)}
    />
</Stack>

{(role === "SYSTEM_ADMIN" ||
  role === "INSTITUTE_ADMIN" ||
  role === "DEPARTMENT_HEAD") && (

<>
<Typography
    variant="h5"
    fontWeight="bold"
    mt={5}
    mb={3}
>
    Billing Statistics
</Typography>

<Grid container spacing={3}>

    {/* Revenue by Department */}

    <Grid size={{ xs: 12, md: 6 }}>

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Revenue by Department
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <BarChart data={departmentChartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="revenue"
                            fill="#1976d2"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    </Grid>

    {/* Paid vs Pending */}

    <Grid size={{ xs: 12, md: 6 }}>

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Paid vs Pending
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <PieChart>

                        <Pie
                            data={paymentChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >

                            {paymentChartData.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />

                            ))}

                        </Pie>

                        <Legend />

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    </Grid>

  
    {/* Revenue by Institution */}
    {(role === "SYSTEM_ADMIN" ||
  role === "INSTITUTE_ADMIN") && (

<>
    <Grid size={{ xs: 12, md: 6 }}>

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Revenue by Institution
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <BarChart data={institutionChartData}>

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="institution"/>

                        <YAxis/>

                        <Tooltip/>

                        <Bar
                            dataKey="revenue"
                            fill="#9c27b0"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    </Grid>
</>
  )}
    {/* Monthly Revenue */}
    {(role === "SYSTEM_ADMIN" ||
  role === "INSTITUTE_ADMIN") && (

<>

    <Grid size={{ xs: 12, md: 6 }}>

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Monthly Revenue
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <LineChart data={monthlyRevenueData}>

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="month"/>

                        <YAxis/>

                        <Tooltip/>

                        <Legend/>

                        <Line
    type="monotone"
    dataKey="revenue"
    stroke="#2e7d32"
    strokeWidth={3}
    dot={{ r: 6 }}
    activeDot={{ r: 8 }}
/>

                    </LineChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    </Grid>
</>
)}
</Grid>
</>

)}

<Box mt={5}>

  <Typography
    variant="h5"
    fontWeight="bold"
    mb={2}
  >
    Department-wise Cost Summary
  </Typography>

  <TableContainer
    component={Paper}
    sx={{
      borderRadius: 3,
      boxShadow: 3,
    }}
  >

    <Table>

      <TableHead
        sx={{
          backgroundColor: "#1976d2"
        }}
      >

        <TableRow>

          <TableCell
            sx={{
              color: "white",
              fontWeight: "bold",
            }}
          >
            Department
          </TableCell>

          <TableCell
            sx={{
              color: "white",
              fontWeight: "bold",
            }}
          >
            Total Bookings
          </TableCell>

          <TableCell
            sx={{
              color: "white",
              fontWeight: "bold",
            }}
          >
            Total Cost
          </TableCell>

        </TableRow>

      </TableHead>

      <TableBody>

        {departmentCosts.map((dept, index) => (

          <TableRow key={index} hover>

            <TableCell>
              {dept.departmentName}
            </TableCell>

            <TableCell>
              {dept.totalBookings}
            </TableCell>

            <TableCell>
              ₹ {dept.totalCost}
            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>

  </TableContainer>

        <Dialog
    open={openDialog}
    onClose={handleCloseDialog}
    maxWidth="sm"
    fullWidth
>

<DialogTitle>
    Invoice Details
</DialogTitle>

<DialogContent>

{selectedBill && (

<Box>

<Typography>
<b>Invoice ID:</b> {selectedBill.billingId}
</Typography>

<Typography>
<b>Institution:</b> {selectedBill.institutionName}
</Typography>

<Typography>
<b>Department:</b> {selectedBill.departmentName}
</Typography>

<Typography>
<b>Laboratory:</b> {selectedBill.laboratoryName}
</Typography>

<Typography>
<b>Equipment:</b> {selectedBill.equipmentName}
</Typography>

<Typography>
<b>Equipment Cost:</b> ₹ {selectedBill.equipmentCost}
</Typography>

<Typography>
<b>Laboratory Cost:</b> ₹ {selectedBill.laboratoryCost}
</Typography>

<Typography>
<b>Total Cost:</b> ₹ {selectedBill.totalCost}
</Typography>

<Typography>
<b>Payment Status:</b> {selectedBill.paymentStatus}
</Typography>

<Typography>
<b>Generated Date:</b> {selectedBill.generatedDate}
</Typography>

</Box>

)}

</DialogContent>

<DialogActions>

<Button
    variant="contained"
    color="success"
    onClick={() => handleDownloadInvoice(selectedBill)}
>
    Download PDF
</Button>

<Button
    variant="outlined"
    onClick={handleCloseDialog}
>
    Close
</Button>

</DialogActions>
</Dialog>
</Box>

    </>

  );
}

export default Billing;
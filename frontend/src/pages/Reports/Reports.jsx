import { useEffect, useState } from "react";
import reportService from "../../services/reportService";
import ReportsChart from "../../components/reports/ReportsChart";
import ReportsBarChart from "../../components/reports/ReportsBarChart";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Button,
    TextField
} from "@mui/material";

function Reports() {

    const [summary, setSummary] = useState({});
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const data = await reportService.getSummary();
            setSummary(data);
        } catch (error) {
            console.error(error);
        }
    };

    const exportPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Lab Resource Utilization Report", 15, 20);

        autoTable(doc, {
            startY: 35,
            head: [["Category", "Count"]],
            body: [

                ["Users", summary.Users || 0],
                ["Laboratories", summary.Laboratories || 0],
                ["Equipment", summary.Equipment || 0],
                ["Resources", summary.Resources || 0],
                ["Bookings", summary.Bookings || 0],
                ["Maintenance", summary.Maintenance || 0]

            ]
        });

        doc.save("Lab_Report.pdf");
    };

    const cards = [

        {
            title: "Users",
            value: summary.Users || 0
        },

        {
            title: "Laboratories",
            value: summary.Laboratories || 0
        },

        {
            title: "Equipment",
            value: summary.Equipment || 0
        },

        {
            title: "Resources",
            value: summary.Resources || 0
        },

        {
            title: "Bookings",
            value: summary.Bookings || 0
        },

        {
            title: "Maintenance",
            value: summary.Maintenance || 0
        }

    ];

    const overallData = [

        {
            name: "Users",
            value: summary.Users || 0
        },

        {
            name: "Labs",
            value: summary.Laboratories || 0
        },

        {
            name: "Equipment",
            value: summary.Equipment || 0
        },

        {
            name: "Resources",
            value: summary.Resources || 0
        },

        {
            name: "Bookings",
            value: summary.Bookings || 0
        },

        {
            name: "Maintenance",
            value: summary.Maintenance || 0
        }

    ];

    const bookingChart = [

        {
            name: "Approved",
            value: summary.ApprovedBookings || 0
        },

        {
            name: "Pending",
            value: summary.PendingBookings || 0
        },

        {
            name: "Rejected",
            value: summary.RejectedBookings || 0
        },

        {
            name: "Completed",
            value: summary.CompletedBookings || 0
        }

    ];

    const maintenanceChart = [

        {
            name: "Pending",
            value: summary.PendingMaintenance || 0
        },

        {
            name: "Resolved",
            value: summary.ResolvedMaintenance || 0
        }

    ];
    
  return (
  <Box
    sx={{
      width: "100%",
      p: 4,
      background: "#f5f7fb",
      minHeight: "100vh",
    }}
  >
    {/* ================= HEADER ================= */}

    <Typography
      variant="h3"
      align="center"
      fontWeight="bold"
      mb={4}
    >
      Reports Dashboard
    </Typography>

    {/* ================= FILTER CARD ================= */}

    <Card
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 4,
        boxShadow: 3,
      }}
    >
      <Grid
        container
        spacing={3}
        alignItems="center"
      >
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: {
              xs: "center",
              md: "flex-end",
            },
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={exportPDF}
            sx={{
              px: 5,
              borderRadius: 3,
            }}
          >
            Export PDF
          </Button>
        </Grid>
      </Grid>
    </Card>

    {/* ================= SUMMARY ================= */}

    <Grid container spacing={3} mb={5}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            sx={{
              borderRadius: 4,
              textAlign: "center",
              boxShadow: 3,
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: ".3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                color="text.secondary"
              >
                {card.title}
              </Typography>

              <Typography
                variant="h2"
                color="primary"
                fontWeight="bold"
              >
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* ================= ANALYTICS ================= */}

    <Typography
      variant="h4"
      fontWeight="bold"
      mb={3}
    >
      Analytics
    </Typography>

            <Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "1fr 1fr",
    },
    gap: 4,
    width: "100%",
  }}
>
  <ReportsChart
    title="Overall Platform Statistics"
    data={overallData}
  />

  <ReportsBarChart
    data={overallData}
  />

  <ReportsChart
    title="Booking Status"
    data={bookingChart}
  />

  <ReportsChart
    title="Maintenance Status"
    data={maintenanceChart}
  />
</Box>
  </Box>
);

}

export default Reports;
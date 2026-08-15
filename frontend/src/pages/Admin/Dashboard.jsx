import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

import dashboardService from "../../services/dashboardService";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    users: 0,
    laboratories: 0,
    equipment: 0,
    resources: 0,
    bookings: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    completedBookings: 0,
    maintenance: 0,
    pendingMaintenance: 0,
    resolvedMaintenance: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getDashboardData();

        setDashboard({
          users: data.Users || 0,
          laboratories: data.Laboratories || 0,
          equipment: data.Equipment || 0,
          resources: data.Resources || 0,
          bookings: data.Bookings || 0,
          approvedBookings: data.ApprovedBookings || 0,
          pendingBookings: data.PendingBookings || 0,
          rejectedBookings: data.RejectedBookings || 0,
          completedBookings: data.CompletedBookings || 0,
          maintenance: data.Maintenance || 0,
          pendingMaintenance: data.PendingMaintenance || 0,
          resolvedMaintenance: data.ResolvedMaintenance || 0,
        });
      } catch (error) {
        console.error("Failed to load system admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: dashboard.users,
      description: "Registered platform users",
    },
    {
      title: "Laboratories",
      value: dashboard.laboratories,
      description: "Total laboratories",
    },
    {
      title: "Equipment",
      value: dashboard.equipment,
      description: "Available equipment records",
    },
    {
      title: "Resources",
      value: dashboard.resources,
      description: "Total resources",
    },
    {
      title: "Total Bookings",
      value: dashboard.bookings,
      description: "All booking requests",
    },
    {
      title: "Approved Bookings",
      value: dashboard.approvedBookings,
      description: "Approved requests",
    },
    {
      title: "Pending Bookings",
      value: dashboard.pendingBookings,
      description: "Waiting for approval",
    },
    {
      title: "Completed Bookings",
      value: dashboard.completedBookings,
      description: "Successfully completed",
    },
    {
      title: "Rejected Bookings",
      value: dashboard.rejectedBookings,
      description: "Rejected requests",
    },
    {
      title: "Maintenance",
      value: dashboard.maintenance,
      description: "Total maintenance records",
    },
    {
      title: "Pending Maintenance",
      value: dashboard.pendingMaintenance,
      description: "Maintenance requiring attention",
    },
    {
      title: "Resolved Maintenance",
      value: dashboard.resolvedMaintenance,
      description: "Completed maintenance work",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#1f2937", mb: 1 }}
        >
          System Admin Dashboard
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "#6b7280" }}
        >
          Overview of users, laboratories, equipment, bookings and maintenance
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={card.title}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#6b7280",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    color: "#1f2937",
                    mb: 1,
                  }}
                >
                  {card.value}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#9ca3af",
                  }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Booking Overview */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 2, color: "#1f2937" }}
        >
          Booking Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Total
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.bookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Approved
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.approvedBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Pending
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.pendingBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Completed
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.completedBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Maintenance Overview */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 2, color: "#1f2937" }}
        >
          Maintenance Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Total Maintenance
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.maintenance}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Pending
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.pendingMaintenance}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography color="text.secondary">
                  Resolved
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {dashboard.resolvedMaintenance}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
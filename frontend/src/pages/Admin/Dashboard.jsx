import { useEffect, useState } from "react";

import {
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import dashboardService from "../../services/dashboardService";

function Dashboard() {

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalLaboratories: 0,
    totalEquipment: 0,
    totalResources: 0,
    totalBookings: 0,
    totalMaintenance: 0,
    pendingBookings: 0,
    pendingMaintenance: 0,
    completedMaintenance: 0,
  });

  useEffect(() => {

    const loadDashboard = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard", error);
      }
    };

    loadDashboard();

  }, []);

  const cards = [
    { title: "Total Users", value: dashboard.totalUsers },
    { title: "Laboratories", value: dashboard.totalLaboratories },
    { title: "Equipment", value: dashboard.totalEquipment },
    { title: "Resources", value: dashboard.totalResources },
    { title: "Bookings", value: dashboard.totalBookings },
    { title: "Maintenance", value: dashboard.totalMaintenance },
    { title: "Pending Bookings", value: dashboard.pendingBookings },
    { title: "Pending Maintenance", value: dashboard.pendingMaintenance },
    { title: "Completed Maintenance", value: dashboard.completedMaintenance },
  ];

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3}>

        {cards.map((card) => (

          <Grid item xs={12} sm={6} md={4} key={card.title}>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent>

                <Typography
                  color="text.secondary"
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                >
                  {card.value}
                </Typography>

              </CardContent>
            </Card>

          </Grid>

        ))}

      </Grid>
    </>
  );
}

export default Dashboard;
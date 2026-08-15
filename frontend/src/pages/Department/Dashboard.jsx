import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from "@mui/material";

import dashboardService from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { role, fullName } = useAuth();

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
    approvedBookings: 0,
    completedBookings: 0,
    rejectedBookings: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const data = await dashboardService.getDashboardData();

        console.log("Dashboard data:", data);

        setDashboard({
          totalUsers: data.Users || 0,
          totalLaboratories: data.Laboratories || 0,
          totalEquipment: data.Equipment || 0,
          totalResources: data.Resources || 0,
          totalBookings: data.Bookings || 0,
          totalMaintenance: data.Maintenance || 0,

          pendingBookings: data.PendingBookings || 0,
          pendingMaintenance: data.PendingMaintenance || 0,

          completedMaintenance: data.ResolvedMaintenance || 0,

          approvedBookings: data.ApprovedBookings || 0,
          completedBookings: data.CompletedBookings || 0,
          rejectedBookings: data.RejectedBookings || 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /*
   * -------------------------------------------------------
   * COMMON CARD
   * -------------------------------------------------------
   */

  const StatCard = ({ title, value }) => {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          height: "100%",
          minHeight: 120,
        }}
      >
        <CardContent>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
          >
            {loading ? "..." : value}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  /*
   * -------------------------------------------------------
   * SYSTEM ADMIN DASHBOARD
   * -------------------------------------------------------
   */

  const SystemAdminDashboard = () => {
    const cards = [
      {
        title: "Total Users",
        value: dashboard.totalUsers,
      },
      {
        title: "Laboratories",
        value: dashboard.totalLaboratories,
      },
      {
        title: "Equipment",
        value: dashboard.totalEquipment,
      },
      {
        title: "Resources",
        value: dashboard.totalResources,
      },
      {
        title: "Bookings",
        value: dashboard.totalBookings,
      },
      {
        title: "Maintenance",
        value: dashboard.totalMaintenance,
      },
      {
        title: "Pending Bookings",
        value: dashboard.pendingBookings,
      },
      {
        title: "Pending Maintenance",
        value: dashboard.pendingMaintenance,
      },
      {
        title: "Completed Maintenance",
        value: dashboard.completedMaintenance,
      },
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
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={card.title}
            >
              <StatCard
                title={card.title}
                value={card.value}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  /*
   * -------------------------------------------------------
   * LAB ASSISTANT / LAB MANAGER DASHBOARD
   * -------------------------------------------------------
   */

  const LabAssistantDashboard = () => {
    return (
      <>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              color: "#5f6680",
              fontSize: {
                xs: "36px",
                md: "58px",
              },
            }}
          >
            Lab Manager Dashboard
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Welcome, {fullName || "Lab Manager"}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Laboratory resources and operational overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={dashboard.totalBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approved Bookings"
              value={dashboard.approvedBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Bookings"
              value={dashboard.pendingBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Bookings"
              value={dashboard.completedBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Equipment"
              value={dashboard.totalEquipment}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Laboratories"
              value={dashboard.totalLaboratories}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Maintenance"
              value={dashboard.totalMaintenance}
            />
          </Grid>

          {/* Maintenance Schedule */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 190,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="500"
                  mb={2}
                >
                  Maintenance Schedule Overview
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography>
                    Pending Maintenance
                  </Typography>

                  <Chip
                    label={dashboard.pendingMaintenance}
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <Typography>
                    Resolved Maintenance
                  </Typography>

                  <Chip
                    label={dashboard.completedMaintenance}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Adoption */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 190,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="500"
                  mb={2}
                >
                  Booking Adoption
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                >
                  {dashboard.totalBookings}
                </Typography>

                <Typography color="text.secondary">
                  Total booking requests
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography>
                  Approved: {dashboard.approvedBookings}
                </Typography>

                <Typography>
                  Pending: {dashboard.pendingBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* High Demand Alert */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  textAlign="center"
                  mb={1}
                >
                  High-Demand Equipment Alerts
                </Typography>

                {dashboard.pendingBookings > 0 ? (
                  <Typography
                    textAlign="center"
                    color="warning.main"
                  >
                    ⚠ {dashboard.pendingBookings} booking request
                    {dashboard.pendingBookings !== 1 ? "s" : ""}{" "}
                    waiting for approval.
                  </Typography>
                ) : (
                  <Typography
                    textAlign="center"
                    color="success.main"
                  >
                    ✓ No high-demand booking alerts.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  /*
   * -------------------------------------------------------
   * DEPARTMENT HEAD DASHBOARD
   * -------------------------------------------------------
   */

  const DepartmentHeadDashboard = () => {
    return (
      <>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              color: "#5f6680",
              fontSize: {
                xs: "36px",
                md: "58px",
              },
            }}
          >
            Department Head Dashboard
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Welcome, {fullName || "Department Head"}
          </Typography>

          <Typography color="text.secondary">
            Resource utilization and departmental overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={dashboard.totalBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approved"
              value={dashboard.approvedBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={dashboard.pendingBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={dashboard.completedBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Equipment"
              value={dashboard.totalEquipment}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Laboratories"
              value={dashboard.totalLaboratories}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Maintenance"
              value={dashboard.totalMaintenance}
            />
          </Grid>

          {/* Equipment Utilization */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 210,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  mb={2}
                >
                  Department Equipment Utilization
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                >
                  {dashboard.totalBookings}
                </Typography>

                <Typography color="text.secondary">
                  Booking activities recorded
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography>
                  Equipment available:{" "}
                  {dashboard.totalEquipment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Maintenance */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 210,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  mb={2}
                >
                  Maintenance Schedule
                </Typography>

                <Typography>
                  Pending maintenance
                </Typography>

                <Chip
                  label={dashboard.pendingMaintenance}
                  color="warning"
                  sx={{ mt: 1, mb: 2 }}
                />

                <Typography>
                  Resolved maintenance
                </Typography>

                <Chip
                  label={dashboard.completedMaintenance}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  textAlign="center"
                >
                  High-Demand Equipment Alerts
                </Typography>

                <Typography
                  textAlign="center"
                  sx={{ mt: 1 }}
                  color={
                    dashboard.pendingBookings > 0
                      ? "warning.main"
                      : "success.main"
                  }
                >
                  {dashboard.pendingBookings > 0
                    ? `⚠ ${dashboard.pendingBookings} booking requests are waiting for approval.`
                    : "✓ No pending high-demand alerts."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  /*
   * -------------------------------------------------------
   * INSTITUTION ADMIN DASHBOARD
   * -------------------------------------------------------
   */

  const InstitutionAdminDashboard = () => {
    return (
      <>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              color: "#5f6680",
              fontSize: {
                xs: "36px",
                md: "58px",
              },
            }}
          >
            Institution Admin Dashboard
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Welcome, {fullName || "Institution Admin"}
          </Typography>

          <Typography color="text.secondary">
            Institution-wide resource management and intelligence
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Laboratories"
              value={dashboard.totalLaboratories}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Equipment"
              value={dashboard.totalEquipment}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={dashboard.totalBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Maintenance"
              value={dashboard.totalMaintenance}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Organization-wide Equipment Utilization
                </Typography>

                <Typography variant="h3" fontWeight="bold">
                  {dashboard.totalBookings}
                </Typography>

                <Typography color="text.secondary">
                  Total equipment booking activities
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography>
                  Available equipment:{" "}
                  {dashboard.totalEquipment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Cross-Department Resource Sharing
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                >
                  {dashboard.totalResources}
                </Typography>

                <Typography color="text.secondary">
                  Resources available for sharing
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Procurement Recommendations
                </Typography>

                <Typography>
                  Current equipment inventory:
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ mt: 1 }}
                >
                  {dashboard.totalEquipment}
                </Typography>

                <Typography color="text.secondary">
                  Equipment units/resources managed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Equipment Lifecycle & Maintenance
                </Typography>

                <Typography>
                  Pending maintenance
                </Typography>

                <Chip
                  label={dashboard.pendingMaintenance}
                  color="warning"
                  sx={{ mt: 1, mb: 2 }}
                />

                <Typography>
                  Resolved maintenance
                </Typography>

                <Chip
                  label={dashboard.completedMaintenance}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  textAlign="center"
                  mb={2}
                >
                  Reports Management
                </Typography>

                <Typography
                  textAlign="center"
                  color="text.secondary"
                >
                  Equipment, booking, utilization and
                  maintenance reports are available from
                  the Reports module.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  /*
   * -------------------------------------------------------
   * STUDENT / RESEARCHER / FACULTY DASHBOARD
   * -------------------------------------------------------
   */

  const StudentDashboard = () => {
    return (
      <>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              color: "#5f6680",
              fontSize: {
                xs: "36px",
                md: "58px",
              },
            }}
          >
            Researcher / Student Dashboard
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Welcome, {fullName || "Researcher"}
          </Typography>

          <Typography color="text.secondary">
            Your laboratory bookings and resource overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="My Bookings"
              value={dashboard.totalBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approved Bookings"
              value={dashboard.approvedBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Bookings"
              value={dashboard.pendingBookings}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Bookings"
              value={dashboard.completedBookings}
            />
          </Grid>

          {/* Booking History */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Booking History & Usage Summary
                </Typography>

                <Typography>
                  Total bookings:{" "}
                  {dashboard.totalBookings}
                </Typography>

                <Typography>
                  Approved:{" "}
                  {dashboard.approvedBookings}
                </Typography>

                <Typography>
                  Completed:{" "}
                  {dashboard.completedBookings}
                </Typography>

                <Typography>
                  Rejected:{" "}
                  {dashboard.rejectedBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Equipment Availability */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Equipment Availability Overview
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                >
                  {dashboard.totalEquipment}
                </Typography>

                <Typography color="text.secondary">
                  Equipment available in your institution
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography>
                  Check the Equipment module for detailed
                  availability.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 180,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Notifications
                </Typography>

                <Typography color="text.secondary">
                  Booking approvals, rejections and
                  maintenance notifications can be viewed
                  in the Notifications module.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                minHeight: 180,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Equipment Recommendations
                </Typography>

                <Typography color="text.secondary">
                  Recommendations based on your booking
                  history will appear here.
                </Typography>

                <Chip
                  label="Coming from usage history"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  /*
   * -------------------------------------------------------
   * ROLE SELECTION
   * -------------------------------------------------------
   */

  const normalizedRole = role
    ? role.toUpperCase()
    : "";

  if (normalizedRole === "SYSTEM_ADMIN") {
    return <SystemAdminDashboard />;
  }

  if (
    normalizedRole === "LAB_ASSISTANT" ||
    normalizedRole === "LAB_MANAGER"
  ) {
    return <LabAssistantDashboard />;
  }

  if (normalizedRole === "DEPARTMENT_HEAD") {
    return <DepartmentHeadDashboard />;
  }

  if (
    normalizedRole === "INSTITUTE_ADMIN" ||
    normalizedRole === "INSTITUTION_ADMIN"
  ) {
    return <InstitutionAdminDashboard />;
  }

  if (
    normalizedRole === "STUDENT" ||
    normalizedRole === "RESEARCHER" ||
    normalizedRole === "FACULTY"
  ) {
    return <StudentDashboard />;
  }

  // Fallback
  return <StudentDashboard />;
}

export default Dashboard;
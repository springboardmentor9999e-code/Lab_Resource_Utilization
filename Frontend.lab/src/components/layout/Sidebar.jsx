import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import ShareIcon from "@mui/icons-material/Share";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SettingsIcon from "@mui/icons-material/Settings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function Sidebar({ mobileOpen, onClose, drawerWidth = 260 }) {
  const location = useLocation();
  const theme = useTheme();

  const [role, setRole] = useState(() => localStorage.getItem("role") || "Student");

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role") || "Student");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const normalizedRole = role.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "_");

  const getMenuItems = () => {
    switch (normalizedRole) {
      case "STUDENT":
      case "RESEARCHER":
        return [
          { text: "Dashboard", path: "/student/dashboard", icon: <DashboardIcon /> },
          { text: "Equipment Catalog", path: "/student/equipment", icon: <ScienceIcon /> },
          { text: "My Bookings", path: "/student/bookings", icon: <EventNoteIcon /> },
          { text: "Booking History", path: "/student/history", icon: <HistoryIcon /> },
          { text: "🌐 Shared Equipment", path: "/student/shared-equipment", icon: <PublicIcon /> },
          { text: "Notifications", path: "/notifications", icon: <NotificationsIcon />, badge: 3 },
          { text: "Profile", path: "/profile", icon: <PersonIcon /> },
        ];

      case "LAB_TECHNICIAN":
      case "TECHNICIAN":
        return [
          { text: "Dashboard", path: "/technician/dashboard", icon: <DashboardIcon /> },
          { text: "Equipment Module", path: "/equipment-module", icon: <ScienceIcon /> },
          { text: "Equipment Registry", path: "/technician/equipment", icon: <EngineeringIcon /> },
          { text: "Add Equipment", path: "/technician/equipment/add", icon: <AddCircleIcon /> },
          { text: "Maintenance Dashboard", path: "/maintenance/dashboard", icon: <BarChartIcon /> },
          { text: "Maintenance List", path: "/maintenance", icon: <ListAltIcon /> },
          { text: "Add Maintenance", path: "/maintenance/add", icon: <AddCircleIcon /> },
          { text: "Maintenance History", path: "/maintenance/history", icon: <HistoryIcon /> },
          { text: "Booking Approval", path: "/technician/bookings/approve", icon: <CheckCircleIcon /> },
          { text: "Returns Registry", path: "/technician/return-equipment", icon: <AssignmentReturnIcon /> },
          { text: "Notifications", path: "/notifications", icon: <NotificationsIcon />, badge: 2 },
        ];

      case "LAB_MANAGER":
      case "MANAGER":
        return [
          { text: "Dashboard", path: "/manager/dashboard", icon: <DashboardIcon /> },
          { text: "Equipment", path: "/manager/equipment", icon: <ScienceIcon /> },
          { text: "Bookings", path: "/manager/bookings", icon: <EventNoteIcon /> },
          { text: "🌐 Shared Equipment", path: "/resource-shares", icon: <PublicIcon /> },
          { text: "📄 Sharing Requests", path: "/resource-sharing-requests", icon: <DescriptionIcon /> },
          { text: "📆 External Bookings", path: "/external-bookings", icon: <CalendarTodayIcon /> },
          { text: "💰 Cost Sharing", path: "/manager/cost-sharing", icon: <AttachMoneyIcon /> },
          { text: "📅 Shared Schedule", path: "/manager/shared-schedule", icon: <CalendarMonthIcon /> },
          { text: "📈 Sharing Analytics", path: "/manager/sharing-analytics", icon: <TrendingUpIcon /> },
        ];

      case "HOD":
      case "DEPARTMENT_HEAD":
      case "INSTITUTION_ADMINISTRATOR":
      case "INSTITUTION_ADMIN":
        return [
          { text: "Dashboard", path: "/institution/dashboard", icon: <DashboardIcon /> },
          { text: "🌐 Resource Sharing", path: "/institution/resource-sharing", icon: <PublicIcon /> },
          { text: "💰 Cost Analysis", path: "/institution/cost-analysis", icon: <AttachMoneyIcon /> },
          { text: "📊 Reports", path: "/institution/reports", icon: <BarChartIcon /> },
        ];

      case "SYSTEM_ADMINISTRATOR":
      case "SYSTEM_ADMIN":
      case "ADMIN":
        return [
          { text: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
          { text: "🏫 Institutions", path: "/admin/institutions", icon: <ApartmentIcon /> },
          { text: "🌐 Resource Sharing", path: "/admin/resource-sharing", icon: <PublicIcon /> },
          { text: "👥 User Management", path: "/admin/users", icon: <PeopleIcon /> },
          { text: "📊 Analytics", path: "/admin/analytics", icon: <BarChartIcon /> },
          { text: "📄 Reports", path: "/admin/reports", icon: <DescriptionIcon /> },
        ];

      default:
        return [
          { text: "Dashboard", path: "/student/dashboard", icon: <DashboardIcon /> },
          { text: "Equipment Catalog", path: "/student/equipment", icon: <ScienceIcon /> },
        ];
    }
  };

  const menuItems = getMenuItems();

  const formatRoleDisplay = (r) => {
    const norm = r.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "_");
    if (norm === "STUDENT") return "Student";
    if (norm === "LAB_TECHNICIAN" || norm === "TECHNICIAN") return "Lab Technician";
    if (norm === "LAB_MANAGER" || norm === "MANAGER") return "Lab Manager";
    if (norm === "HOD" || norm === "DEPARTMENT_HEAD" || norm.includes("INSTITUTION")) return "Head of Department (HOD)";
    if (norm === "ADMIN" || norm.includes("ADMIN")) return "System Administrator";
    return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isDarkMode = theme.palette.mode === "dark";
  const sidebarBg = isDarkMode ? "#1e293b" : "#0b132b";

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: sidebarBg, color: "#f8fafc" }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 3,
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(37, 99, 235, 0.4)",
          }}
        >
          <SchoolIcon sx={{ color: "#ffffff", fontSize: 22 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#ffffff", letterSpacing: 0.8, fontSize: "1.05rem" }}>
          LAB PLATFORM
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      {/* Role Authorized Scope Badge */}
      <Box sx={{ p: 2.5, backgroundColor: "rgba(15, 23, 42, 0.4)", display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            textTransform: "uppercase",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: 0.6,
          }}
        >
          LOGGED IN SCOPE
        </Typography>
        <Chip
          label={formatRoleDisplay(role)}
          color="primary"
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.78rem",
            borderRadius: "6px",
            alignSelf: "flex-start",
            px: 0.5,
            py: 0.2,
          }}
        />
      </Box>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      {/* Role-Specific Navigation Menu */}
      <List sx={{ px: 2, py: 2, flexGrow: 1, overflowY: "auto" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onClose}
                sx={{
                  borderRadius: "10px",
                  px: 2,
                  py: 1.1,
                  backgroundColor: isActive ? "#1d4ed8" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  position: "relative",
                  "& .MuiListItemIcon-root": {
                    color: isActive ? "#ffffff" : "#64748b",
                  },
                  "&:hover": {
                    backgroundColor: isActive ? "#1d4ed8" : "rgba(255, 255, 255, 0.06)",
                    color: "#ffffff",
                    "& .MuiListItemIcon-root": {
                      color: "#ffffff",
                    },
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Info Box */}
      <Box sx={{ p: 2, m: 2, borderRadius: "12px", background: "linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
        <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 700, mb: 0.5, textAlign: "center" }}>
          Resource Platform
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", textAlign: "center", lineHeight: 1.3 }}>
          Authorized scope: {formatRoleDisplay(role)}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="navigation links drawer"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: isDarkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

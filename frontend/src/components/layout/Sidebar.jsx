import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BusinessIcon from "@mui/icons-material/Business";
import ShareIcon from "@mui/icons-material/Share";

import {
  Dashboard,
  People,
  Science,
  Inventory,
  Category,
  EventNote,
  Build,
  Notifications,
  Assessment,
  Logout,
} from "@mui/icons-material";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const { role, logout } = useAuth();

  const menuConfig = {

    SYSTEM_ADMIN: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "Users", icon: <People />, path: "/users" },
      { text: "Institutions",icon: <BusinessIcon />,path: "/institutions", },
      { text: "Laboratories", icon: <Science />, path: "/laboratories" },
      { text: "Equipment", icon: <Inventory />, path: "/equipment" },
      { text: "Resources", icon: <Category />, path: "/resources" },
      { text: "Bookings", icon: <EventNote />, path: "/bookings" },
      { text: "Maintenance", icon: <Build />, path: "/maintenance" },
      { text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
      { text: "Notifications", icon: <Notifications />, path: "/notifications" },
      { text: "Reports", icon: <Assessment />, path: "/reports" },
    ],

    FACULTY: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "Laboratories", icon: <Science />, path: "/laboratories" },
      { text: "Equipment", icon: <Inventory />, path: "/equipment" },
      { text: "Bookings", icon: <EventNote />, path: "/bookings" },
      //{ text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
      { text: "Notifications", icon: <Notifications />, path: "/notifications" },
      { text: "Reports", icon: <Assessment />, path: "/reports" },
    ],

    STUDENT: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "Bookings", icon: <EventNote />, path: "/bookings" },
     // { text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
      { text: "Notifications", icon: <Notifications />, path: "/notifications" },
    ],

    LAB_ASSISTANT: [
        { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { text: "Equipment", icon: <Inventory />, path: "/equipment" },
        { text: "Resources", icon: <Category />, path: "/resources" },
        { text: "Bookings", icon: <EventNote />, path: "/bookings" },
        { text: "Maintenance", icon: <Build />, path: "/maintenance" },
        { text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
        { text: "Notifications", icon: <Notifications />, path: "/notifications" },
      ],

    INSTITUTE_ADMIN: [
        { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
        { text: "Laboratories", icon: <Science />, path: "/laboratories" },
        { text: "Equipment", icon: <Inventory />, path: "/equipment" },
        { text: "Resources", icon: <Category />, path: "/resources" },
        { text: "Bookings", icon: <EventNote />, path: "/bookings" },
        { text: "Maintenance", icon: <Build />, path: "/maintenance" },
        { text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
        { text: "Notifications", icon: <Notifications />, path: "/notifications" },
        { text: "Reports", icon: <Assessment />, path: "/reports" },
      ],

    DEPARTMENT_HEAD: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "Bookings", icon: <EventNote />, path: "/bookings" },
      //{ text: "Inter Institution Sharing", icon: <ShareIcon />, path: "/inter-sharing",},
      { text: "Reports", icon: <Assessment />, path: "/reports" },
      { text: "Notifications", icon: <Notifications />, path: "/notifications" },
    ],
  };

  const menuItems = menuConfig[role] || [];

  const handleLogout = () => {

  logout();

  navigate("/");
};

  return (
    <Box
        sx={{
          width: 240,
          bgcolor: "#1e293b",
          color: "white",

          position: "fixed",
          left: 0,
          top: 0,

          height: "100vh",

          overflowY: "auto",
          zIndex: 1200,
        }}
      >
      <Typography
        variant="h5"
        sx={{
          p: 3,
          fontWeight: "bold",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,.1)",
        }}
      >
        Lab Resource
      </Typography>

      <List sx={{ flex: 1 }}>

        {menuItems.map((item) => (

          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              color: "white",
              mx: 1,
              my: 0.5,
              borderRadius: 2,

              "&.Mui-selected": {
                background: "#2563EB",
              },

              "&:hover": {
                background: "#2563EB",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />

          </ListItemButton>

        ))}

      </List>

      <List>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: "white",
            m: 1,
            borderRadius: 2,

            "&:hover": {
              background: "#DC2626",
            },
          }}
        >

          <ListItemIcon sx={{ color: "white" }}>
            <Logout />
          </ListItemIcon>

          <ListItemText primary="Logout" />

        </ListItemButton>

      </List>

    </Box>
  );
}

export default Sidebar;
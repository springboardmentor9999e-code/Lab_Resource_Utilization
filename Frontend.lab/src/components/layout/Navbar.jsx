import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import useAuth from "../../hooks/useAuth";
import { useThemeMode } from "../../context/ThemeContext";
import Breadcrumbs from "./Breadcrumbs";
import NotificationMenu from "./NotificationMenu";

export default function Navbar({ onMenuClick, drawerWidth = 260 }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode, toggleTheme } = useThemeMode();

  const [username, setUsername] = useState(() => localStorage.getItem("username") || "User");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "Student");
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "user@test.com");

  useEffect(() => {
    const syncUserInfo = () => {
      setUsername(localStorage.getItem("username") || "User");
      setRole(localStorage.getItem("role") || "Student");
      setEmail(localStorage.getItem("email") || "user@test.com");
    };
    window.addEventListener("storage", syncUserInfo);
    return () => window.removeEventListener("storage", syncUserInfo);
  }, []);

  const handleAvatarClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    handleClose();
    logout();
  };

  const formatRole = (r) => {
    return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        boxShadow: "none",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          height: 64,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {isMobile && (
            <IconButton
              onClick={onMenuClick}
              edge="start"
              sx={{ mr: 1, color: theme.palette.primary.main }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Breadcrumbs />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Tooltip title={`Switch to ${mode === "light" ? "Dark" : "Light"} Mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon sx={{ color: "#f59e0b" }} />}
            </IconButton>
          </Tooltip>

          <NotificationMenu />

          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "15px",
                color: theme.palette.text.primary,
                lineHeight: 1.2,
              }}
            >
              {username}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "text.secondary",
                lineHeight: 1.2,
              }}
            >
              {formatRole(role)}
            </Typography>
          </Box>

          <Avatar
            onClick={handleAvatarClick}
            sx={{
              width: 40,
              height: 40,
              cursor: "pointer",
              bgcolor: theme.palette.primary.main,
              fontSize: "1rem",
              fontWeight: 700,
              border: `2px solid ${theme.palette.divider}`,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                width: 220,
                borderRadius: 3,
                mt: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <Box px={2.5} py={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                {email}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 650, color: theme.palette.primary.main, textTransform: "uppercase", fontSize: "0.675rem" }}>
                {formatRole(role)}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClick} sx={{ py: 1.2 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1.2 }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick} sx={{ py: 1.2, color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

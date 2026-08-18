import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import useAuth from "../../hooks/useAuth";

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "Student";
  const email = localStorage.getItem("email") || "user@test.com";

  const handleClick = (e) => {
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
    <Box>
      <IconButton onClick={handleClick} sx={{ p: 0, border: "2px solid #e2e8f0" }}>
        <Avatar
          sx={{ width: 34, height: 34, bgcolor: "#1e3a8a", fontSize: "0.95rem", fontWeight: 700 }}
        >
          {username.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

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
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        {/* User Card Summary */}
        <Box px={2.5} py={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
            {username}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            {email}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 650, color: "#1e3a8a", textTransform: "uppercase", fontSize: "0.675rem" }}>
            {formatRole(role)}
          </Typography>
        </Box>
        <Divider />

        {/* Profile menu item */}
        <MenuItem onClick={handleProfileClick} sx={{ py: 1.2 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Profile Button</Typography>
        </MenuItem>

        {/* Settings menu item */}
        <MenuItem onClick={handleClose} sx={{ py: 1.2 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Settings Button</Typography>
        </MenuItem>
        
        <Divider />

        {/* Logout */}
        <MenuItem onClick={handleLogoutClick} sx={{ py: 1.2, color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Logout Button
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

import React from "react";
import { IconButton, Badge, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

export default function NotificationBell({ unreadCount = 0, onClick }) {
  return (
    <Tooltip title={unreadCount > 0 ? `${unreadCount} Unread Notifications` : "Notifications"}>
      <IconButton
        color="inherit"
        onClick={onClick}
        sx={{
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.75rem",
              fontWeight: 800,
              height: 20,
              minWidth: 20,
              borderRadius: "10px",
              boxShadow: "0 0 0 2px #fff",
              animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%": {
                  boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)",
                },
                "70%": {
                  boxShadow: "0 0 0 6px rgba(239, 68, 68, 0)",
                },
                "100%": {
                  boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
                },
              },
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsActiveIcon sx={{ color: "#2563eb", fontSize: 26 }} />
          ) : (
            <NotificationsIcon sx={{ color: "#64748b", fontSize: 26 }} />
          )}
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

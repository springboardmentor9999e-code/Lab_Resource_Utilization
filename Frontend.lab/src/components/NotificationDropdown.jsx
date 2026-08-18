import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CircleIcon from "@mui/icons-material/Circle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationBadge from "./NotificationBadge";

export default function NotificationDropdown({
  anchorEl,
  open,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkSingleRead,
}) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigateToAll = () => {
    onClose();
    navigate("/notifications");
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{
        sx: {
          width: 380,
          maxHeight: 520,
          borderRadius: 4,
          mt: 1.5,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        },
      }}
    >
      {/* Dropdown Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        sx={{ backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc" }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: "12px",
                fontSize: "0.725rem",
                fontWeight: 800,
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              }}
            >
              {unreadCount} new
            </Box>
          )}
        </Box>

        {unreadCount > 0 && (
          <Tooltip title="Mark all as read">
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={onMarkAllRead}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
            >
              Mark all read
            </Button>
          </Tooltip>
        )}
      </Box>
      <Divider />

      {/* Notification List */}
      <List sx={{ p: 0, maxHeight: 340, overflowY: "auto" }}>
        {notifications && notifications.length > 0 ? (
          notifications.slice(0, 6).map((n) => {
            const isUnread = !(n.isRead !== undefined ? n.isRead : n.read);
            return (
              <ListItem
                key={n.id}
                onClick={() => {
                  if (isUnread && onMarkSingleRead) onMarkSingleRead(n.id);
                }}
                sx={{
                  py: 1.8,
                  px: 3,
                  cursor: "pointer",
                  backgroundColor: isUnread
                    ? theme.palette.mode === "dark"
                      ? "#1e293b"
                      : "#eff6ff"
                    : "transparent",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "dark" ? "#334155" : "#f1f5f9",
                  },
                }}
              >
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <NotificationBadge type={n.type} />
                    {isUnread && (
                      <CircleIcon sx={{ fontSize: 10, color: theme.palette.primary.main }} />
                    )}
                  </Box>

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isUnread ? 750 : 600,
                      fontSize: "0.9rem",
                      color: theme.palette.text.primary,
                      mb: 0.3,
                    }}
                  >
                    {n.title || "Alert"}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.825rem",
                      color: theme.palette.text.secondary,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.message}
                  </Typography>
                </Box>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No recent notifications.
            </Typography>
          </Box>
        )}
      </List>
      <Divider />

      {/* Footer view all link */}
      <Box
        sx={{
          textAlign: "center",
          py: 1.5,
          backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
        }}
      >
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNavigateToAll}
          sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.85rem" }}
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );
}

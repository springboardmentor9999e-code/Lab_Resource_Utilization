import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip,
  useTheme,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationBadge from "./NotificationBadge";

export default function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  const theme = useTheme();
  const { id, title, message, type, isRead, read, createdAt, time } = notification;
  const readStatus = isRead !== undefined ? isRead : Boolean(read);

  const formatDate = (dateStr) => {
    if (!dateStr) return time || "Just now";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return time || dateStr;
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return time || "Recent";
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: `1px solid ${readStatus ? theme.palette.divider : theme.palette.primary.main + "40"}`,
        backgroundColor: readStatus
          ? theme.palette.background.paper
          : theme.palette.mode === "dark"
          ? "#1e293b"
          : "#f0f7ff",
        boxShadow: readStatus
          ? "0 2px 8px rgba(0, 0, 0, 0.03)"
          : "0 4px 14px rgba(37, 99, 235, 0.08)",
        transition: "all 0.25s ease-in-out",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      {/* Unread Indicator Bar */}
      {!readStatus && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "5px",
            backgroundColor: theme.palette.primary.main,
          }}
        />
      )}

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box flex={1}>
            {/* Header: Type Badge & Read/Unread Pill */}
            <Box display="flex" alignItems="center" gap={1.5} mb={1} flexWrap="wrap">
              <NotificationBadge type={type} />
              {!readStatus && (
                <Box
                  component="span"
                  sx={{
                    px: 1.2,
                    py: 0.2,
                    borderRadius: "12px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Unread
                </Box>
              )}
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: readStatus ? 600 : 750,
                fontSize: "1.05rem",
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {title || "Notification"}
            </Typography>

            {/* Message */}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.925rem",
                lineHeight: 1.5,
                mb: 1.5,
              }}
            >
              {message}
            </Typography>

            {/* Time / Date stamp */}
            <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
              <AccessTimeIcon sx={{ fontSize: 14, opacity: 0.7 }} />
              <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.85 }}>
                {formatDate(createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" gap={1}>
            {!readStatus && onMarkAsRead && (
              <Tooltip title="Mark as Read">
                <IconButton
                  size="small"
                  onClick={() => onMarkAsRead(id)}
                  sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="Delete Notification">
                <IconButton
                  size="small"
                  onClick={() => onDelete(id)}
                  sx={{
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.mode === "dark" ? "#450a0a" : "#fef2f2",
                    "&:hover": {
                      backgroundColor: theme.palette.error.main,
                      color: "#fff",
                    },
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

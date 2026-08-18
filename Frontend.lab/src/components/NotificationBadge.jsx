import React from "react";
import { Chip, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import SpeedIcon from "@mui/icons-material/Speed";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShareIcon from "@mui/icons-material/Share";
import InfoIcon from "@mui/icons-material/Info";

const TYPE_CONFIG = {
  BOOKING_CONFIRMED: {
    label: "Booking Confirmed",
    color: "success",
    bgColor: "#dcfce7",
    textColor: "#15803d",
    borderColor: "#86efac",
    icon: <CheckCircleIcon style={{ fontSize: 16 }} />,
  },
  EQUIPMENT_AVAILABLE: {
    label: "Equipment Available",
    color: "info",
    bgColor: "#e0f2fe",
    textColor: "#0369a1",
    borderColor: "#7dd3fc",
    icon: <InventoryIcon style={{ fontSize: 16 }} />,
  },
  MAINTENANCE_DUE: {
    label: "Maintenance Due",
    color: "warning",
    bgColor: "#fef3c7",
    textColor: "#b45309",
    borderColor: "#fde047",
    icon: <BuildIcon style={{ fontSize: 16 }} />,
  },
  CALIBRATION_EXPIRING: {
    label: "Calibration Expiring",
    color: "error",
    bgColor: "#ffe4e6",
    textColor: "#be123c",
    borderColor: "#fda4af",
    icon: <SpeedIcon style={{ fontSize: 16 }} />,
  },
  SHARING_APPROVED: {
    label: "Sharing Approved",
    color: "secondary",
    bgColor: "#f3e8ff",
    textColor: "#6b21a8",
    borderColor: "#d8b4fe",
    icon: <ShareIcon style={{ fontSize: 16 }} />,
  },
};

export default function NotificationBadge({ type, label }) {
  const normalizedType = (type || "").toUpperCase().replace(/\s+/g, "_");
  const config = TYPE_CONFIG[normalizedType] || {
    label: label || type || "General Alert",
    bgColor: "#f1f5f9",
    textColor: "#475569",
    borderColor: "#cbd5e1",
    icon: <InfoIcon style={{ fontSize: 16 }} />,
  };

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.8,
        px: 1.4,
        py: 0.4,
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        textTransform: "capitalize",
      }}
    >
      {config.icon}
      {config.label}
    </Box>
  );
}

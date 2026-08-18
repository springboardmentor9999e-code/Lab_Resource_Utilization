import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Box sx={{ py: 0.5 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: "#94a3b8" }} />}
        aria-label="breadcrumb navigation stack"
      >
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/dashboard"
          sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}
        >
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return last ? (
            <Typography
              key={to}
              variant="body2"
              sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e3a8a" }}
            >
              {capitalize(value)}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={to}
              key={to}
              sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}
            >
              {capitalize(value)}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}

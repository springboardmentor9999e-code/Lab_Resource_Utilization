import React from "react";
import { Box, IconButton, InputBase, Paper, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Breadcrumbs from "./Breadcrumbs";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";

export default function Topbar({ onMenuClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        py: 1,
        px: 3,
        height: 64,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {/* Left: Mobile hamburger toggle & Breadcrumbs */}
      <Box display="flex" alignItems="center" gap={1}>
        {isMobile && (
          <IconButton
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 1, color: "#1e3a8a" }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Breadcrumbs />
      </Box>

      {/* Right: Search box, Notification menu, Profile settings */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Search Bar */}
        {!isMobile && (
          <Paper
            elevation={0}
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: "flex",
              alignItems: "center",
              width: 240,
              backgroundColor: "#f1f5f9",
              borderRadius: 2,
              px: 1.5,
              py: 0.25,
            }}
          >
            <InputBase
              placeholder="Search..."
              sx={{ ml: 1, flex: 1, fontSize: "0.85rem", color: "#475569" }}
            />
            <IconButton type="submit" size="small" sx={{ p: 0.5 }}>
              <SearchIcon fontSize="small" sx={{ color: "#64748b" }} />
            </IconButton>
          </Paper>
        )}

        <NotificationMenu />
        <ProfileMenu />
      </Box>
    </Box>
  );
}

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

import ErrorBoundary from "../components/ErrorBoundary";

const DRAWER_WIDTH = 260;

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: theme.palette.background.default }}>
      {/* Top Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Left Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Navbar height spacing offset */}
        
        {/* Child Router View */}
        <Box sx={{ flexGrow: 1, py: 2 }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
}

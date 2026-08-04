import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
} from "@mui/material";

function Navbar() {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        background: "#ffffff",
        color: "#333",
        width: "calc(100% - 240px)",
        ml: "240px",
        zIndex: 1100,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold" }}
        >
          Lab Resource Utilization Platform
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Avatar sx={{ bgcolor: "#2563EB" }}>
          A
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
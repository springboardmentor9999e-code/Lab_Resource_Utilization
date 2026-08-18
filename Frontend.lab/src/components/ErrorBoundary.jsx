import React from "react";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
          p={3}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 600,
              width: "100%",
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <ErrorIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Component Render Exception
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected runtime exception occurred while attempting to render this module view.
            </Typography>

            {this.state.error && (
              <Alert severity="error" variant="outlined" sx={{ mb: 3, textAlign: "left", borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {this.state.error.toString()}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{ borderRadius: 2.5, px: 3, py: 1, textTransform: "none", fontWeight: 700 }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ borderRadius: 2.5, px: 3, py: 1, textTransform: "none", fontWeight: 700 }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

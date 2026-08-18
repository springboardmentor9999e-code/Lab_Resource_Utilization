import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "./routes/AppRoutes";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function ThemeWrapper() {
  const { mode } = useThemeMode();

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === "light" ? "#1e3a8a" : "#3b82f6",
          light: mode === "light" ? "#3b82f6" : "#60a5fa",
          dark: mode === "light" ? "#172554" : "#1d4ed8",
          contrastText: "#ffffff",
        },
        secondary: {
          main: mode === "light" ? "#0ea5e9" : "#38bdf8",
          light: mode === "light" ? "#38bdf8" : "#7dd3fc",
          dark: mode === "light" ? "#0369a1" : "#0369a1",
          contrastText: "#ffffff",
        },
        background: {
          default: mode === "light" ? "#f8fafc" : "#0f172a",
          paper: mode === "light" ? "#ffffff" : "#1e293b",
        },
        text: {
          primary: mode === "light" ? "#0f172a" : "#f8fafc",
          secondary: mode === "light" ? "#475569" : "#cbd5e1",
        },
        success: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
          contrastText: "#ffffff",
        },
        warning: {
          main: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          contrastText: "#ffffff",
        },
        error: {
          main: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
          contrastText: "#ffffff",
        },
        info: {
          main: "#0284c7",
          light: "#38bdf8",
          dark: "#0369a1",
          contrastText: "#ffffff",
        },
        divider: mode === "light" ? "#e2e8f0" : "#334155",
      },
      typography: {
        fontFamily: "'Outfit', 'Inter', 'Roboto', sans-serif",
        button: { textTransform: "none", fontWeight: 600 },
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 800 },
        h4: { fontWeight: 800 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              border: mode === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
              boxShadow: mode === "light" ? "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)" : "none",
              borderRadius: 12,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: "8px 16px",
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: mode === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
            },
            head: {
              fontWeight: 700,
              backgroundColor: mode === "light" ? "#f1f5f9" : "#0f172a",
              color: mode === "light" ? "#0f172a" : "#f8fafc",
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemeWrapper />
    </ThemeModeProvider>
  );
}
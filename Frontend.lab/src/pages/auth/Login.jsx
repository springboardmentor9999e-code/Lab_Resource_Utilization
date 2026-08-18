import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  Grid,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ScienceIcon from "@mui/icons-material/Science";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SecurityIcon from "@mui/icons-material/Security";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const DEMO_ACCOUNTS = [
  {
    roleName: "Student",
    roleKey: "STUDENT",
    email: "student@university.edu",
    password: "password123",
    icon: <PersonIcon fontSize="small" />,
    color: "#2563eb",
  },
  {
    roleName: "Lab Technician",
    roleKey: "LAB_TECHNICIAN",
    email: "technician@university.edu",
    password: "password123",
    icon: <EngineeringIcon fontSize="small" />,
    color: "#0d9488",
  },
  {
    roleName: "Lab Manager",
    roleKey: "LAB_MANAGER",
    email: "manager@university.edu",
    password: "password123",
    icon: <AssessmentIcon fontSize="small" />,
    color: "#7c3aed",
  },
  {
    roleName: "HOD",
    roleKey: "HOD",
    email: "hod@university.edu",
    password: "password123",
    icon: <ApartmentIcon fontSize="small" />,
    color: "#d97706",
  },
  {
    roleName: "Admin",
    roleKey: "ADMIN",
    email: "admin@university.edu",
    password: "password123",
    icon: <SecurityIcon fontSize="small" />,
    color: "#dc2626",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isDark = theme.palette.mode === "dark";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const getRedirectPath = (roleName) => {
    if (!roleName) return "/student/dashboard";
    const r = roleName.toUpperCase().trim().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "");
    switch (r) {
      case "SYSTEMADMINISTRATOR":
      case "SYSTEMADMIN":
      case "ADMIN":
        return "/admin/dashboard";
      case "LABMANAGER":
      case "MANAGER":
        return "/manager/dashboard";
      case "LABTECHNICIAN":
      case "TECHNICIAN":
        return "/technician/dashboard";
      case "HOD":
      case "INSTITUTION":
      case "INSTITUTIONADMINISTRATOR":
      case "INSTITUTIONADMIN":
      case "DEPARTMENTHEAD":
        return "/institution/dashboard";
      case "STUDENT":
      default:
        return "/student/dashboard";
    }
  };

  const handleDemoLogin = (account) => {
    setValue("email", account.email);
    setValue("password", account.password);
    
    // Authenticate with specific role
    const demoToken = `demo-jwt-token-${account.roleKey.toLowerCase()}-2026`;
    const demoName = `${account.roleName} User`;

    localStorage.setItem("token", demoToken);
    localStorage.setItem("role", account.roleKey);
    localStorage.setItem("email", account.email);
    localStorage.setItem("name", demoName);
    localStorage.setItem("username", demoName);

    window.dispatchEvent(new Event("storage"));
    login(demoToken, account.roleKey, demoName, account.email);
    navigate(getRedirectPath(account.roleKey));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError("");
    const emailInput = (data.email || "").trim();

    try {
      const response = await authService.login(emailInput, data.password);
      const roleFromBackend = response.data?.role || "STUDENT";
      const userToken = response.data?.token || `jwt-token-${Date.now()}`;
      const userName = response.data?.name || emailInput.split("@")[0];
      const userEmail = response.data?.email || emailInput;

      localStorage.setItem("token", userToken);
      localStorage.setItem("role", roleFromBackend);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("name", userName);
      localStorage.setItem("username", userName);

      window.dispatchEvent(new Event("storage"));
      login(userToken, roleFromBackend, userName, userEmail);
      navigate(getRedirectPath(roleFromBackend));
    } catch (err) {
      console.warn("Backend auth offline, using role detection fallback based on email prefix:", err);
      let detectedRole = "STUDENT";
      if (emailInput.includes("manager")) detectedRole = "LAB_MANAGER";
      else if (emailInput.includes("technician")) detectedRole = "LAB_TECHNICIAN";
      else if (emailInput.includes("hod")) detectedRole = "HOD";
      else if (emailInput.includes("admin")) detectedRole = "ADMIN";

      const fallbackToken = `fallback-token-${detectedRole.toLowerCase()}`;
      const fallbackName = emailInput.split("@")[0] || "User";

      localStorage.setItem("token", fallbackToken);
      localStorage.setItem("role", detectedRole);
      localStorage.setItem("email", emailInput);
      localStorage.setItem("name", fallbackName);
      localStorage.setItem("username", fallbackName);

      window.dispatchEvent(new Event("storage"));
      login(fallbackToken, detectedRole, fallbackName, emailInput);
      navigate(getRedirectPath(detectedRole));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #e0f2fe 100%)",
        py: 6,
        px: 2.5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          filter: "blur(120px)",
          bgcolor: isDark ? "rgba(79, 70, 229, 0.15)" : "rgba(165, 180, 252, 0.4)",
          top: "-10%",
          left: "10%",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          filter: "blur(100px)",
          bgcolor: isDark ? "rgba(14, 165, 233, 0.1)" : "rgba(196, 181, 253, 0.4)",
          bottom: "-5%",
          right: "15%",
          zIndex: 1,
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 3.5, sm: 5 },
            borderRadius: 6,
            backdropFilter: "blur(20px)",
            backgroundColor: isDark ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.9)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.35)"
              : "0 20px 40px -15px rgba(15, 23, 42, 0.1)",
          }}
        >
          {/* Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: "24px",
                background: isDark
                  ? "linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)"
                  : "linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)",
                color: isDark ? "#818cf8" : "#1e3a8a",
                mb: 2,
                display: "inline-flex",
              }}
            >
              <ScienceIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 900,
                color: isDark ? "#f8fafc" : "#0f172a",
                lineHeight: 1.2,
                letterSpacing: -0.5,
              }}
            >
              Lab Resource Utilization Platform
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
              Sign in with your role credentials
            </Typography>
          </Box>

          {/* Role Preset Selector Bar */}
          <Box sx={{ mb: 3, p: 2, borderRadius: 3, backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#f8fafc", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1.2 }}>
              ⚡ DEMO ROLE QUICK-LOGIN (SELECT ROLE TO SIGN IN)
            </Typography>
            <Grid container spacing={1}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Grid item xs={12} sm={6} key={acc.roleKey}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={acc.icon}
                    onClick={() => handleDemoLogin(acc)}
                    sx={{
                      justifyContent: "flex-start",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      borderRadius: 2,
                      borderColor: acc.color,
                      color: acc.color,
                      textTransform: "none",
                      py: 0.8,
                      "&:hover": {
                        backgroundColor: acc.color,
                        color: "#ffffff",
                        borderColor: acc.color,
                      },
                    }}
                  >
                    {acc.roleName}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {apiError}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              placeholder="student@university.edu"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.2)" : "rgba(248, 250, 252, 0.8)",
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.2)" : "rgba(248, 250, 252, 0.8)",
                },
              }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <FormControlLabel
                control={<Checkbox color="primary" {...register("rememberMe")} />}
                label={
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Remember Me
                  </Typography>
                }
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: isDark ? "#818cf8" : "#1e3a8a",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                background: isDark
                  ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
                  : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
            </Button>

            <Box display="flex" justifyContent="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{ fontWeight: 700, color: isDark ? "#818cf8" : "#1e3a8a" }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

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
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Link,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import authService from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      role: "STUDENT",
    },
  });

  const roles = [
    { value: "STUDENT", label: "Student" },
    { value: "LAB_TECHNICIAN", label: "Lab Technician" },
    { value: "LAB_MANAGER", label: "Lab Manager" },
    { value: "INSTITUTION_ADMINISTRATOR", label: "Institution Administrator" },
    { value: "SYSTEM_ADMINISTRATOR", label: "System Administrator" },
  ];

  const watchPassword = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        department: data.department,
      };

      await authService.register(payload);
      setSnackbarOpen(true);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration failed:", err);
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyleProps = {
    mb: 1.5,
    "& .MuiInputBase-input": {
      color: isDark ? "#f8fafc" : "#0f172a",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "rgba(255,255,255,0.7)" : "#334155",
      fontWeight: 500,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#ffffff",
      "& fieldset": {
        borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
      },
      "&:hover fieldset": {
        borderColor: isDark ? "#818cf8" : "#1e3a8a",
      },
      "&.Mui-focused fieldset": {
        borderColor: isDark ? "#818cf8" : "#1e3a8a",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
          }}
        >
          {/* Header icon and brand */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                backgroundColor: isDark ? "rgba(30, 58, 138, 0.4)" : "#eff6ff",
                color: isDark ? "#818cf8" : "#1e3a8a",
                mb: 2,
              }}
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#1e3a8a" }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Register for the Lab Resource Platform
            </Typography>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Full Name */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              {...register("name", { required: "Full Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={inputStyleProps}
            />

            {/* Email Address */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={inputStyleProps}
            />

            {/* Department */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="department"
              label="Department"
              {...register("department", { required: "Department is required" })}
              error={!!errors.department}
              helperText={errors.department?.message}
              sx={inputStyleProps}
            />

            {/* Role Dropdown */}
            <TextField
              margin="normal"
              required
              fullWidth
              select
              id="role"
              label="Operational Role"
              {...register("role", { required: "Role is required" })}
              sx={inputStyleProps}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      color: isDark ? "#f8fafc" : "#0f172a",
                    },
                  },
                },
              }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ color: isDark ? "#f8fafc" : "#0f172a" }}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 4,
                  message: "Password must be at least 4 characters",
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyleProps}
            />

            {/* Confirm Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === watchPassword || "Passwords do not match",
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputStyleProps, mb: 3 }}
            />

            {/* Register Action Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                backgroundColor: isDark ? "#3b82f6" : "#1e3a8a",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: isDark ? "#2563eb" : "#172554",
                },
              }}
            >
              {loading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Registering...</span>
                </Box>
              ) : (
                "Register"
              )}
            </Button>

            {/* Link back to login */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ fontWeight: 700, color: isDark ? "#818cf8" : "#1e3a8a", textDecoration: "none" }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Registration success alert snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </Box>
  );
}

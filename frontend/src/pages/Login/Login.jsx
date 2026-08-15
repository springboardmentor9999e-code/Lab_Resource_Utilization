import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  Science,
  Inventory2,
  EventAvailable,
  Analytics,
} from "@mui/icons-material";


function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {

      setLoading(true);

      const response = await authService.login(
        email.trim(),
        password
      );

      /*
       * Keep the existing authentication flow.
       * The backend determines the user's role.
       */

      login(
        response.token,
        response.role,
        response.userId,
        response.fullName,
        response.institutionId
      );

      navigate("/dashboard");

    } catch (err) {

      console.error("Login failed:", err);

      setError(
        "Invalid email or password. Please check your credentials and try again."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef3f9 0%, #f8fafc 50%, #e8eef7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >

        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 1050,
            minHeight: 610,
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",

            "@media (max-width: 900px)": {
              flexDirection: "column",
              minHeight: "auto",
            },
          }}
        >

          {/* =====================================================
              LEFT PROJECT INFORMATION SECTION
             ===================================================== */}

          <Box
            sx={{
              width: "50%",
              background:
                "linear-gradient(145deg, #17243a 0%, #243653 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: 6,
              py: 6,
              position: "relative",
              overflow: "hidden",

              "@media (max-width: 900px)": {
                width: "100%",
                px: 4,
                py: 5,
              },

              "@media (max-width: 600px)": {
                px: 3,
                py: 4,
              },
            }}
          >

            {/* Decorative circles */}

            <Box
              sx={{
                position: "absolute",
                width: 260,
                height: 260,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.04)",
                top: -100,
                right: -80,
              }}
            />

            <Box
              sx={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.03)",
                bottom: -70,
                left: -60,
              }}
            />


            {/* PROJECT ICON */}

            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: 3,
                backgroundColor: "#2864e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                position: "relative",
                zIndex: 1,
                boxShadow:
                  "0 8px 25px rgba(40,100,232,0.35)",
              }}
            >

              <Science
                sx={{
                  fontSize: 42,
                }}
              />

            </Box>


            {/* PROJECT TITLE */}

            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 2,
                position: "relative",
                zIndex: 1,

                "@media (max-width: 600px)": {
                  fontSize: "2rem",
                },
              }}
            >
              Lab Resource
              <br />
              Utilization Platform
            </Typography>


            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.78)",
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 4,
                position: "relative",
                zIndex: 1,
              }}
            >
              A centralized platform for managing laboratory
              resources, equipment, bookings, maintenance,
              and resource utilization.
            </Typography>


            <Divider
              sx={{
                borderColor:
                  "rgba(255,255,255,0.18)",
                mb: 3,
                position: "relative",
                zIndex: 1,
              }}
            />


            {/* PROJECT FEATURES */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >

                <Inventory2
                  sx={{
                    mr: 2,
                    color: "#7fa8ff",
                  }}
                />

                <Typography>
                  Laboratory & Equipment Management
                </Typography>

              </Box>


              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >

                <EventAvailable
                  sx={{
                    mr: 2,
                    color: "#7fa8ff",
                  }}
                />

                <Typography>
                  Smart Booking & Resource Allocation
                </Typography>

              </Box>


              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >

                <Analytics
                  sx={{
                    mr: 2,
                    color: "#7fa8ff",
                  }}
                />

                <Typography>
                  Utilization & Operational Insights
                </Typography>

              </Box>

            </Box>

          </Box>


          {/* =====================================================
              RIGHT LOGIN SECTION
             ===================================================== */}

          <Box
            sx={{
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              px: 6,
              py: 5,

              "@media (max-width: 900px)": {
                width: "100%",
              },

              "@media (max-width: 600px)": {
                px: 3,
              },
            }}
          >

            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 410,
                backgroundColor: "transparent",
              }}
            >

              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                }}
              >

                {/* LOGIN ICON */}

                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    backgroundColor: "#edf3ff",
                    color: "#2864e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >

                  <Science
                    sx={{
                      fontSize: 34,
                    }}
                  />

                </Box>


                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    color: "#202938",
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.98rem",
                  }}
                >
                  Sign in to access your laboratory resources
                </Typography>

              </Box>


              {/* ERROR MESSAGE */}

              {error && (

                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>

              )}


              {/* LOGIN FORM */}

              <Box
                component="form"
                onSubmit={handleLogin}
              >

                {/* EMAIL */}

                <TextField
                  fullWidth
                  required
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="email"
                  placeholder="Enter your email"
                  margin="normal"
                  sx={{
                    mb: 1.5,

                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />


                {/* PASSWORD */}

                <TextField
                  fullWidth
                  required
                  label="Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  margin="normal"
                  sx={{
                    mb: 1,

                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}

                  InputProps={{
                    endAdornment: (

                      <InputAdornment position="end">

                        <IconButton
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          edge="end"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >

                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}

                        </IconButton>

                      </InputAdornment>

                    ),
                  }}
                />


                {/* LOGIN BUTTON */}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.6,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    textTransform: "none",
                    backgroundColor: "#2864e8",

                    "&:hover": {
                      backgroundColor: "#1e50c2",
                    },
                  }}
                >

                  {loading ? (

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >

                      <CircularProgress
                        size={22}
                        sx={{
                          color: "white",
                        }}
                      />

                      Signing in...

                    </Box>

                  ) : (

                    "Sign In"

                  )}

                </Button>

              </Box>


              {/* SECURITY / ROLE MESSAGE */}

              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f6f8fc",
                  textAlign: "center",
                }}
              >

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                  }}
                >
                  Your access level and available features
                  are determined automatically according to
                  your registered role.
                </Typography>

              </Box>


              {/* FOOTER */}

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="center"
                sx={{
                  mt: 3,
                }}
              >
                Lab Resource Utilization Platform
              </Typography>

            </Card>

          </Box>

        </Paper>

      </Container>

    </Box>
  );
}

export default Login;
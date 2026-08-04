import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await authService.login(email, password);

      login(
          response.token,
          response.role,
          response.userId,
          response.fullName,
          response.institutionId
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid Email or Password");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: "100%", p: 2 }}>
        <CardContent>

          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
          >
            Lab Resource Platform
          </Typography>

          <Typography
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Login to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
          >

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mt: 3 }}
            >
              Login
            </Button>

          </Box>

        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;
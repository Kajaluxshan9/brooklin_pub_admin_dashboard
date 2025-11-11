import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logoStyle = {
    height: 60,
    marginBottom: 16,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #E8C9A3 0%, #F9F6F2 50%, #E0D0BA 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(201, 168, 124, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 440,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 20px 25px -5px rgba(212, 165, 116, 0.1), 0 10px 10px -5px rgba(212, 165, 116, 0.04)",
          border: "1px solid rgba(232, 227, 220, 0.5)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: 2,
              bgcolor: "#F9F6F2",
              mb: 2,
            }}
          >
            <img
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              style={{ ...logoStyle, display: "block" }}
            />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#2D2416",
              mb: 1,
              fontSize: "1.75rem",
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.938rem", color: "#6B5D4F" }}
          >
            Sign in to manage Brooklin Pub
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: "1px solid #FCA5A5",
              bgcolor: "#FEF2F2",
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FEFDFB",
                transition: "all 0.15s",
                "&:hover": {
                  bgcolor: "#ffffff",
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FEFDFB",
                transition: "all 0.15s",
                "&:hover": {
                  bgcolor: "#ffffff",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                    sx={{
                      color: "#E49B5F",
                      "&:hover": { bgcolor: "#F9F6F2" },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              bgcolor: "#E49B5F",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 1px 3px 0 rgba(212, 165, 116, 0.3)",
              transition: "all 0.15s",
              "&:hover": {
                bgcolor: "#C9A87C",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 6px -1px rgba(212, 165, 116, 0.3)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
            startIcon={<LoginIcon />}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;


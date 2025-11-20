import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const { login } = useAuth();
  const location = useLocation();

  // Check if we have a message from navigation state (e.g., from email verification)
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      setSnackbar({
        open: true,
        message: state.message,
        severity: state.severity || "success",
      });
      // Clear the state to prevent showing message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FFF8F0 0%, #FFFBF7 25%, #FFF3E6 50%, #FFE8D1 75%, #FFF8F0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(200, 121, 65, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(232, 155, 92, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(245, 169, 76, 0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          animation: "float 20s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(200, 121, 65, 0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          opacity: 0.5,
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          width: "100%",
          maxWidth: 460,
          borderRadius: 5,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          boxShadow:
            "0 24px 48px -12px rgba(200, 121, 65, 0.2), 0 12px 24px -6px rgba(200, 121, 65, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
          border: "2px solid rgba(200, 121, 65, 0.15)",
          position: "relative",
          zIndex: 1,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, transparent 0%, #C87941 20%, #E89B5C 50%, #C87941 80%, transparent 100%)",
            borderRadius: "20px 20px 0 0",
          },
          "&:hover": {
            boxShadow:
              "0 32px 64px -12px rgba(200, 121, 65, 0.25), 0 16px 32px -6px rgba(200, 121, 65, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
            transform: "translateY(-4px)",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2.5,
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.98)",
              mb: 2.5,
              border: "2px solid rgba(200, 121, 65, 0.15)",
              boxShadow:
                "0 4px 16px rgba(200, 121, 65, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: 3,
                padding: "2px",
                background:
                  "linear-gradient(135deg, #C87941, #E89B5C, #F5A94C)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                opacity: 0,
                transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              "&:hover": {
                transform: "scale(1.05) rotate(-2deg)",
                boxShadow:
                  "0 8px 24px rgba(200, 121, 65, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.7)",
              },
              "&:hover::after": {
                opacity: 1,
              },
            }}
          >
            <Box
              component="img"
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              sx={{
                height: 60,
                width: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              background:
                "linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "1rem",
              color: "#8B7355",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
              mb: 2,
            }}
          >
            <MuiLink
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{
                fontSize: "0.875rem",
                color: "#8B7355",
                fontWeight: 500,
                "&:hover": {
                  color: "#E49B5F",
                },
              }}
            >
              Forgot password?
            </MuiLink>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.75,
              background:
                "linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)",
              fontSize: "1.05rem",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 3,
              boxShadow:
                "0 6px 20px rgba(200, 121, 65, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              letterSpacing: "0.5px",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                transition: "left 0.6s",
              },
              "&:hover": {
                background:
                  "linear-gradient(135deg, #A45F2D 0%, #C87941 50%, #E89B5C 100%)",
                transform: "translateY(-2px) scale(1.02)",
                boxShadow:
                  "0 10px 30px rgba(200, 121, 65, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
              },
              "&:hover::before": {
                left: "100%",
              },
              "&:active": {
                transform: "translateY(0) scale(0.98)",
                boxShadow: "0 4px 12px rgba(200, 121, 65, 0.3)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #DDD0C0 0%, #C9BDB0 100%)",
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
            startIcon={<LoginIcon sx={{ fontSize: "1.2rem" }} />}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;

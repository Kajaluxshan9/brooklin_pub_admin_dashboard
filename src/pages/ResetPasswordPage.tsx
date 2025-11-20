import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { api } from "../utils/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      // Extract error message from Error object or response
      let errorMessage = "Failed to reset password. The link may have expired. Please request a new one.";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        const msg = err.response.data.message;
        errorMessage = Array.isArray(msg) ? msg.join('. ') : msg;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d1b00 100%)",
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 500,
          width: "100%",
          padding: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockResetIcon sx={{ fontSize: 48, color: "#d4a574", mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your new password below
          </Typography>
        </Box>

        {success ? (
          <Box sx={{ textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                Password Reset Successfully!
              </Typography>
              <Typography variant="body2">
                Your password has been changed. You will be redirected to the
                login page in a few seconds...
              </Typography>
            </Alert>

            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/login"
              sx={{
                backgroundColor: "#d4a574",
                color: "white",
                "&:hover": {
                  backgroundColor: "#b8935f",
                },
              }}
            >
              Go to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !token}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Password must contain:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                • At least 8 characters
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                • One uppercase letter (A-Z)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                • One lowercase letter (a-z)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                • One number (0-9)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                • One special character (!@#$%^&*)
              </Typography>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !token}
              sx={{
                mb: 2,
                py: 1.5,
                backgroundColor: "#d4a574",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#b8935f",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  textTransform: "none",
                  "&:hover": {
                    color: "#d4a574",
                    backgroundColor: "transparent",
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

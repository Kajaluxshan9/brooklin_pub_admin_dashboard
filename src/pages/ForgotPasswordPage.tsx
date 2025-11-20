import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api } from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
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
          maxWidth: 450,
          width: "100%",
          padding: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <EmailIcon sx={{ fontSize: 48, color: "#d4a574", mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you instructions to reset
            your password.
          </Typography>
        </Box>

        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Email Sent Successfully!
              </Typography>
              <Typography variant="body2">
                If an account exists with <strong>{email}</strong>, you will
                receive password reset instructions shortly. Please check your
                inbox (and spam folder).
              </Typography>
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderColor: "#d4a574",
                color: "#d4a574",
                "&:hover": {
                  borderColor: "#b8935f",
                  backgroundColor: "rgba(212, 165, 116, 0.08)",
                },
              }}
            >
              Back to Login
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
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
                "Send Reset Link"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <MuiLink
                component={Link}
                to="/login"
                underline="hover"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  "&:hover": {
                    color: "#d4a574",
                  },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Back to Login
              </MuiLink>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

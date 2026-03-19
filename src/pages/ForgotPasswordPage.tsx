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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF3E6 40%, #FFF8F0 70%, #FFFFFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 121, 65, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-8%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 132, 45, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(200, 121, 65, 0.06)',
          border: '1px solid rgba(200, 121, 65, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {success ? (
          /* Success State */
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38, color: '#10B981' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}
            >
              Check your inbox
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B7355', mb: 1, fontSize: '0.938rem' }}>
              We sent password reset instructions to
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#C87941', mb: 3, fontSize: '0.938rem' }}
            >
              {email}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#A89588', display: 'block', mb: 4, fontSize: '0.813rem' }}
            >
              Didn't receive it? Check your spam folder or try again.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
            >
              Back to Sign In
            </Button>
          </Box>
        ) : (
          /* Form State */
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(200, 121, 65, 0.12) 0%, rgba(200, 121, 65, 0.06) 100%)',
                  border: '1.5px solid rgba(200, 121, 65, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                }}
              >
                <EmailIcon sx={{ fontSize: 32, color: '#C87941' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}
              >
                Forgot your password?
              </Typography>
              <Typography variant="body2" sx={{ color: '#8B7355', fontSize: '0.938rem', lineHeight: 1.6 }}>
                Enter your email and we'll send you instructions to reset your password.
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2' }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email address"
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
                startIcon={
                  loading
                    ? <CircularProgress size={18} color="inherit" />
                    : <EmailIcon />
                }
                sx={{ py: 1.5, fontSize: '0.938rem', fontWeight: 600, borderRadius: 2.5, mb: 2 }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#8B7355',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': { color: '#C87941' },
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 15 }} />
                  Back to Sign In
                </MuiLink>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

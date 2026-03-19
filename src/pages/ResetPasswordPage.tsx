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
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api } from "../utils/api";

const requirements = [
  "At least 8 characters",
  "One uppercase letter (A-Z)",
  "One lowercase letter (a-z)",
  "One number (0-9)",
  "One special character (!@#$%^&*)",
];

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
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("Invalid reset token"); return; }
    if (!password || !confirmPassword) { setError("Please fill in all fields"); return; }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      let errorMessage = "Failed to reset password. The link may have expired.";
      if (err.message) errorMessage = err.message;
      else if (err.response?.data?.message) {
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
          maxWidth: 480,
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
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}>
              Password reset!
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B7355', mb: 3, fontSize: '0.938rem', lineHeight: 1.6 }}>
              Your password has been changed successfully. Redirecting you to the sign in page…
            </Typography>
            <Button fullWidth variant="contained" component={Link} to="/login" startIcon={<ArrowBackIcon />}>
              Go to Sign In
            </Button>
          </Box>
        ) : (
          <>
            {/* Header */}
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
                <LockResetIcon sx={{ fontSize: 32, color: '#C87941' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}>
                Set new password
              </Typography>
              <Typography variant="body2" sx={{ color: '#8B7355', fontSize: '0.938rem' }}>
                Must be at least 8 characters with mixed case, number and symbol.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="New password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#C87941', '&:hover': { bgcolor: '#FFF3E6' } }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#C87941', '&:hover': { bgcolor: '#FFF3E6' } }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Requirements */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(200, 121, 65, 0.04)',
                  border: '1px solid rgba(200, 121, 65, 0.1)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B4E3D', display: 'block', mb: 1 }}>
                  Password requirements:
                </Typography>
                {requirements.map((req) => (
                  <Typography key={req} variant="caption" sx={{ color: '#A89588', display: 'block', lineHeight: 1.8 }}>
                    · {req}
                  </Typography>
                ))}
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !token}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
                sx={{ py: 1.5, fontSize: '0.938rem', fontWeight: 600, borderRadius: 2.5 }}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
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

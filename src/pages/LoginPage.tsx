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
  CircularProgress,
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

  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      setSnackbar({
        open: true,
        message: state.message,
        severity: state.severity || "success",
      });
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
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF3E6 40%, #FFF8F0 70%, #FFFFFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        // Subtle decorative circles
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 121, 65, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-8%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 132, 45, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Extra decorative element */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 121, 65, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          display: { xs: 'none', md: 'block' },
        }}
      />

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
        {/* Logo & Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 1)',
              mb: 2.5,
              border: '1px solid rgba(200, 121, 65, 0.12)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box
              component="img"
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              sx={{ height: 56, width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.625rem', sm: '1.875rem' },
              color: '#2C1810',
              mb: 0.75,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.938rem',
              color: '#8B7355',
              fontWeight: 500,
            }}
          >
            Sign in to manage{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              The Brooklin Pub
            </Box>
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: '1px solid #FCA5A5',
              bgcolor: '#FEF2F2',
              '& .MuiAlert-icon': { color: '#EF4444' },
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoFocus
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{ color: '#C87941', '&:hover': { bgcolor: '#FFF3E6' } }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 0.5 }}>
            <MuiLink
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{
                fontSize: '0.875rem',
                color: '#8B7355',
                fontWeight: 500,
                '&:hover': { color: '#C87941' },
              }}
            >
              Forgot password?
            </MuiLink>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={
              loading
                ? <CircularProgress size={18} color="inherit" />
                : <LoginIcon sx={{ fontSize: '1.1rem' }} />
            }
            sx={{
              mt: 3,
              mb: 1,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2.5,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;

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
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #FEFDFB 0%, #FFF8F0 50%, #FFFFFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(200, 121, 65, 0.1)',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              mb: 2.5,
              border: '1px solid rgba(200, 121, 65, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <Box
              component="img"
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              sx={{
                height: 60,
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background:
                'linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '1rem',
              color: '#8B7355',
              fontWeight: 500,
              letterSpacing: '0.01em',
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
              border: '1px solid #FCA5A5',
              bgcolor: '#FEF2F2',
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
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FEFDFB',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: '#ffffff',
                },
              },
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FEFDFB',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: '#ffffff',
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
                      color: '#E49B5F',
                      '&:hover': { bgcolor: '#F9F6F2' },
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
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 1,
              mb: 2,
            }}
          >
            <MuiLink
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{
                fontSize: '0.875rem',
                color: '#8B7355',
                fontWeight: 500,
                '&:hover': {
                  color: '#E49B5F',
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
              py: 1.5,
              background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: '0 4px 16px rgba(200, 121, 65, 0.25)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A45F2D 0%, #C87941 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(200, 121, 65, 0.35)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: '#DDD0C0',
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            startIcon={<LoginIcon sx={{ fontSize: '1.1rem' }} />}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
        // @ts-ignore PortalProps typed as any
        PortalProps={{ style: { zIndex: 99999 } }}
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

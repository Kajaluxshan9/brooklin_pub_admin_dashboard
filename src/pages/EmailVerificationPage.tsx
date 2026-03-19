import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { api } from "../utils/api";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Invalid verification link. No token provided.");
        setLoading(false);
        return;
      }

      try {
        await api.post("/auth/verify-email", { token });
        setSuccess(true);
        setError("");
        setRedirecting(true);
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Email verified successfully! You can now log in.",
              severity: "success",
            },
          });
        }, 3000);
      } catch (err: any) {
        setSuccess(false);
        setError(
          err.response?.data?.message ||
            "Failed to verify email. The link may have expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = () => {
    navigate("/forgot-password");
  };

  const bgStyles = {
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
  } as const;

  const paperStyles = {
    p: { xs: 4, sm: 5 },
    width: '100%',
    maxWidth: 460,
    borderRadius: 4,
    textAlign: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(200, 121, 65, 0.06)',
    border: '1px solid rgba(200, 121, 65, 0.1)',
    position: 'relative' as const,
    zIndex: 1,
  };

  return (
    <Box sx={bgStyles}>
      <Paper elevation={0} sx={paperStyles}>
        {loading ? (
          /* Loading State */
          <Box>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(200, 121, 65, 0.12) 0%, rgba(200, 121, 65, 0.06) 100%)',
                border: '1.5px solid rgba(200, 121, 65, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <MarkEmailReadIcon sx={{ fontSize: 34, color: '#C87941' }} />
            </Box>
            <CircularProgress size={32} sx={{ color: '#C87941', mb: 2.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}>
              Verifying your email
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B7355', fontSize: '0.938rem' }}>
              Please wait while we confirm your email address…
            </Typography>
          </Box>
        ) : success ? (
          /* Success State */
          <Box>
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
              Email verified!
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B7355', mb: 4, fontSize: '0.938rem', lineHeight: 1.6 }}>
              {redirecting
                ? "Redirecting you to the sign in page…"
                : "Your email has been successfully verified. You can now log in."}
            </Typography>
            {!redirecting && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{ py: 1.5, fontWeight: 600, borderRadius: 2.5 }}
              >
                Go to Sign In
              </Button>
            )}
          </Box>
        ) : (
          /* Error State */
          <Box>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ErrorIcon sx={{ fontSize: 38, color: '#EF4444' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2C1810', mb: 1, letterSpacing: '-0.01em' }}>
              Verification failed
            </Typography>
            <Typography variant="body2" sx={{ color: '#8B7355', mb: 1.5, fontSize: '0.938rem', lineHeight: 1.6 }}>
              {error}
            </Typography>
            <Typography variant="caption" sx={{ color: '#A89588', display: 'block', mb: 4, fontSize: '0.813rem' }}>
              Links are valid for 10 minutes. Request a new one below.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{ py: 1.25, fontWeight: 600, borderRadius: 2.5 }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleResendVerification}
                startIcon={<RefreshIcon />}
                sx={{ py: 1.25, fontWeight: 600, borderRadius: 2.5 }}
              >
                Request New Link
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

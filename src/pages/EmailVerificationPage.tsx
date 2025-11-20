import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
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

        // Redirect to login after 3 seconds
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

  const handleResendVerification = async () => {
    // This would need the email, but we don't have it from the URL
    // For now, redirect to forgot password page where they can enter email
    navigate("/forgot-password");
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
          textAlign: "center",
        }}
      >
        {loading ? (
          <Box>
            <CircularProgress size={60} sx={{ color: "#d4a574", mb: 3 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Verifying Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          </Box>
        ) : success ? (
          <Box>
            <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Email Verified!
            </Typography>
            <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body1" gutterBottom>
                Your email has been successfully verified.
              </Typography>
              <Typography variant="body2">
                {redirecting
                  ? "Redirecting to login page..."
                  : "You can now log in to your account."}
              </Typography>
            </Alert>

            {!redirecting && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  backgroundColor: "#d4a574",
                  color: "white",
                  py: 1.5,
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#b8935f",
                  },
                }}
              >
                Go to Login
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            <ErrorIcon sx={{ fontSize: 80, color: "#f44336", mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {error}
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The verification link may have expired (links are valid for 10
              minutes) or is invalid.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#d4a574",
                  color: "#d4a574",
                  "&:hover": {
                    borderColor: "#b8935f",
                    backgroundColor: "rgba(212, 165, 116, 0.08)",
                  },
                }}
              >
                Go to Login
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleResendVerification}
                sx={{
                  backgroundColor: "#d4a574",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#b8935f",
                  },
                }}
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

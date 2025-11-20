import React from "react";
import { Snackbar, Alert, Slide } from "@mui/material";
import type { AlertColor, SlideProps } from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

interface ToastProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000,
}) => {
  const getIcon = () => {
    switch (severity) {
      case "success":
        return <SuccessIcon sx={{ fontSize: 22 }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: 22 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 22 }} />;
      case "info":
        return <InfoIcon sx={{ fontSize: 22 }} />;
      default:
        return undefined;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideTransition}
      sx={{
        "& .MuiSnackbar-root": {
          top: { xs: 8, sm: 24 },
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={getIcon()}
        elevation={6}
        variant="filled"
        sx={{
          minWidth: 300,
          maxWidth: 500,
          borderRadius: 2,
          fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(10px)",
          "& .MuiAlert-message": {
            fontSize: "0.95rem",
            padding: "4px 0",
          },
          "& .MuiAlert-icon": {
            alignItems: "center",
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

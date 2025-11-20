import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";
import { HourglassEmpty as HourglassIcon } from "@mui/icons-material";

interface LoadingStateProps {
  message?: string;
  variant?: "circular" | "linear" | "skeleton";
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  variant = "circular",
  size = "medium",
  fullScreen = false,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case "small":
        return 32;
      case "large":
        return 64;
      case "medium":
      default:
        return 48;
    }
  };

  const renderLoader = () => {
    switch (variant) {
      case "linear":
        return (
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(200, 121, 65, 0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background:
                    "linear-gradient(90deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                  boxShadow: "0 0 12px rgba(200, 121, 65, 0.4)",
                },
                "@keyframes shimmer": {
                  "0%": { backgroundPosition: "200% 0" },
                  "100%": { backgroundPosition: "-200% 0" },
                },
              }}
            />
          </Box>
        );
      case "skeleton":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <HourglassIcon
              sx={{
                fontSize: getSizeValue(),
                color: "primary.main",
                animation: "rotate 1.5s linear infinite",
                "@keyframes rotate": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
          </Box>
        );
      case "circular":
      default:
        return (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              size={getSizeValue()}
              thickness={4}
              sx={{
                color: "primary.main",
                animationDuration: "1.2s",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animation: "pulse 1.5s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    opacity: 0.3,
                    transform: "translate(-50%, -50%) scale(0.8)",
                  },
                  "50%": {
                    opacity: 0.6,
                    transform: "translate(-50%, -50%) scale(1)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: getSizeValue() * 0.6,
                  height: getSizeValue() * 0.6,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(200, 121, 65, 0.3) 0%, transparent 70%)",
                }}
              />
            </Box>
          </Box>
        );
    }
  };

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2.5,
        p: 4,
        animation: "fadeIn 0.3s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {renderLoader()}
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize:
              size === "small"
                ? "0.875rem"
                : size === "large"
                ? "1.125rem"
                : "1rem",
            textAlign: "center",
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.7 },
              "50%": { opacity: 1 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 248, 240, 0.95)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingState;

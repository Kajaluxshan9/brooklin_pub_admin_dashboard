import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { STANDARD_COLORS } from "../../utils/standardColors";

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  icon: SvgIconComponent;
  color: string;
  progress?: number;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  total,
  icon: Icon,
  color,
  progress,
  onClick,
  trend,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: "2px solid",
        borderColor: `${color}20`,
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${color}08 100%)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `0 4px 12px ${color}12, 0 2px 6px ${color}08, inset 0 1px 2px rgba(255, 255, 255, 0.8)`,
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          borderRadius: "14px 14px 0 0",
          opacity: onClick ? 1 : 0.5,
        },
        "&:hover": onClick
          ? {
              transform: "translateY(-4px) scale(1.02)",
              boxShadow: `0 12px 28px ${color}20, 0 6px 14px ${color}15, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
              borderColor: color,
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${color}12 100%)`,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Icon and Title Row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2.5 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              background: `linear-gradient(135deg, ${color}25 0%, ${color}15 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.75,
              border: `2px solid ${color}30`,
              boxShadow: `0 4px 12px ${color}18, inset 0 1px 2px rgba(255, 255, 255, 0.5)`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
                animation: "pulse 3s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%, 100%": { opacity: 0.5 },
                "50%": { opacity: 0.8 },
              },
            }}
          >
            <Icon
              sx={{
                fontSize: 32,
                color,
                filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.2))",
                position: "relative",
                zIndex: 1,
                transition: "all 0.3s ease",
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: STANDARD_COLORS.text.secondary,
                fontSize: "0.813rem",
                lineHeight: 1.3,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Value Display with Enhanced Animation */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: STANDARD_COLORS.text.primary,
                fontSize: { xs: "2rem", sm: "2.25rem" },
                lineHeight: 1,
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "countUp 0.6s ease-out",
                "@keyframes countUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(10px) scale(0.9)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0) scale(1)",
                  },
                },
              }}
            >
              {value.toLocaleString()}
            </Typography>
            {trend && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  background: trend.isPositive
                    ? `${STANDARD_COLORS.status.success.light}40`
                    : `${STANDARD_COLORS.status.error.light}40`,
                  border: `1.5px solid ${
                    trend.isPositive
                      ? STANDARD_COLORS.status.success.main
                      : STANDARD_COLORS.status.error.main
                  }`,
                  animation: "fadeIn 0.5s ease-out 0.2s both",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: trend.isPositive
                      ? STANDARD_COLORS.status.success.main
                      : STANDARD_COLORS.status.error.main,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    letterSpacing: "0.3px",
                  }}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </Typography>
              </Box>
            )}
          </Box>
          {total !== undefined && total > 0 && value !== total && (
            <Typography
              variant="body2"
              sx={{
                color: STANDARD_COLORS.text.disabled,
                fontWeight: 500,
                fontSize: "0.813rem",
                mt: 0.75,
                animation: "fadeIn 0.5s ease-out 0.3s both",
              }}
            >
              of {total.toLocaleString()} total
            </Typography>
          )}
        </Box>

        {/* Enhanced Progress Bar with Animation */}
        {progress !== undefined && progress < 100 && (
          <Box sx={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: STANDARD_COLORS.text.secondary,
                  fontWeight: 700,
                  fontSize: "0.688rem",
                  letterSpacing: "0.8px",
                }}
              >
                PROGRESS
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  background: `${color}15`,
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${color}15`,
                border: `1px solid ${color}20`,
                boxShadow: `inset 0 1px 3px ${color}15`,
                overflow: "visible",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)`,
                  boxShadow: `0 0 12px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  position: "relative",
                  animation: "progressGrow 1s ease-out",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
                    borderRadius: "4px 4px 0 0",
                  },
                },
                "@keyframes progressGrow": {
                  from: {
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                  },
                  to: {
                    transform: "scaleX(1)",
                    transformOrigin: "left",
                  },
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  variant?: "default" | "gradient" | "glass" | "elevated";
  tag?: string;
  tagColor?: string;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  children,
  action,
  icon,
  color = "#C87941",
  variant = "default",
  tag,
  tagColor,
  onClick,
  onMenuClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return {
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `2px solid ${color}30`,
          boxShadow: `0 8px 24px ${color}20, inset 0 1px 2px rgba(255,255,255,0.5)`,
        };
      case "glass":
        return {
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        };
      case "elevated":
        return {
          background: "#fff",
          border: "none",
          boxShadow:
            "0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        };
      default:
        return {
          background: "#fff",
          border: "1px solid rgba(200, 121, 65, 0.12)",
          boxShadow: "0 4px 12px rgba(200, 121, 65, 0.08)",
        };
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "visible",
        ...getVariantStyles(),
        "&:hover": onClick
          ? {
              transform: "translateY(-4px) scale(1.01)",
              boxShadow:
                variant === "glass"
                  ? "0 12px 40px rgba(0, 0, 0, 0.12)"
                  : `0 16px 48px ${color}25`,
            }
          : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 50%, transparent 100%)`,
          borderRadius: "12px 12px 0 0",
          opacity: 0.8,
        },
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {/* Header Section */}
        {(title || action || icon || tag || onMenuClick) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: title || subtitle ? 2.5 : 0,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}
            >
              {icon && (
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                    color,
                    border: `2px solid ${color}30`,
                    boxShadow: `0 4px 12px ${color}20`,
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: subtitle ? 0.5 : 0,
                  }}
                >
                  {title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.125rem",
                        color: "text.primary",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {title}
                    </Typography>
                  )}
                  {tag && (
                    <Chip
                      label={tag}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.688rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        background: tagColor || `${color}20`,
                        color: tagColor || color,
                        border: `1.5px solid ${tagColor || color}40`,
                      }}
                    />
                  )}
                </Box>
                {subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {action}
              {onMenuClick && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick();
                  }}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      backgroundColor: `${color}15`,
                      color,
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}

        {/* Content Section */}
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default ModernCard;

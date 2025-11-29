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
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${color}08 100%)`,
          border: `1px solid ${color}15`,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.05)`,
        };
      case "glass":
        return {
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        };
      case "elevated":
        return {
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(200, 121, 65, 0.06)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        };
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2.5,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'visible',
        ...getVariantStyles(),
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
            }
          : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${color}80 0%, ${color} 50%, ${color}80 100%)`,
          borderRadius: '10px 10px 0 0',
          opacity: 0.7,
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header Section */}
        {(title || action || icon || tag || onMenuClick) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: title || subtitle ? 2.5 : 0,
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: subtitle ? 0.5 : 0,
                  }}
                >
                  {title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color: 'text.primary',
                        letterSpacing: '-0.01em',
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
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
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
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {action}
              {onMenuClick && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick();
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
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

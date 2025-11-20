import React from "react";
import { Box, IconButton, Tooltip, Zoom } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { STATUS_COLORS } from "../../utils/standardColors";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  onMore?: () => void;
  size?: "small" | "medium";
  showLabels?: boolean;
  variant?: "default" | "compact" | "colorful";
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onMore,
  size = "small",
  variant = "default",
}) => {
  const getButtonStyles = (color: string, hoverColor?: string) => {
    if (variant === "colorful") {
      return {
        color: "#fff",
        background: `linear-gradient(135deg, ${color} 0%, ${
          hoverColor || color
        }DD 100%)`,
        border: "none",
        boxShadow: `0 2px 8px ${color}40`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          background: `linear-gradient(135deg, ${
            hoverColor || color
          } 0%, ${color} 100%)`,
          transform: "translateY(-2px) scale(1.05)",
          boxShadow: `0 4px 12px ${color}50`,
        },
        "&:active": {
          transform: "translateY(0) scale(0.98)",
        },
      };
    }

    if (variant === "compact") {
      return {
        color,
        background: "transparent",
        border: "none",
        transition: "all 0.25s ease",
        "&:hover": {
          backgroundColor: `${color}15`,
          transform: "scale(1.1)",
        },
      };
    }

    return {
      color,
      background: "rgba(255, 255, 255, 0.8)",
      border: `1.5px solid ${color}30`,
      backdropFilter: "blur(8px)",
      boxShadow: `0 2px 6px ${color}20`,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        backgroundColor: `${color}15`,
        borderColor: color,
        transform: "translateY(-2px)",
        boxShadow: `0 4px 12px ${color}30`,
      },
      "&:active": {
        transform: "translateY(0)",
      },
    };
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: variant === "compact" ? 0.25 : 0.75,
        alignItems: "center",
        animation: "fadeIn 0.3s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "scale(0.9)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      {onView && (
        <Tooltip
          title="View Details"
          arrow
          TransitionComponent={Zoom}
          enterDelay={300}
          placement="top"
        >
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            sx={{
              ...getButtonStyles(STATUS_COLORS.info, "#2196F3"),
            }}
          >
            <VisibilityIcon
              fontSize={size}
              sx={{
                transition: "transform 0.2s ease",
                ".MuiIconButton-root:hover &": {
                  transform: "scale(1.1)",
                },
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip
          title="Edit"
          arrow
          TransitionComponent={Zoom}
          enterDelay={300}
          placement="top"
        >
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{
              ...getButtonStyles(STATUS_COLORS.primary, "#E89B5C"),
            }}
          >
            <EditIcon
              fontSize={size}
              sx={{
                transition: "transform 0.2s ease",
                ".MuiIconButton-root:hover &": {
                  transform: "rotate(15deg) scale(1.1)",
                },
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {onDuplicate && (
        <Tooltip
          title="Duplicate"
          arrow
          TransitionComponent={Zoom}
          enterDelay={300}
          placement="top"
        >
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            sx={{
              ...getButtonStyles("#9C27B0", "#BA68C8"),
            }}
          >
            <ContentCopyIcon
              fontSize={size}
              sx={{
                transition: "transform 0.2s ease",
                ".MuiIconButton-root:hover &": {
                  transform: "translateX(2px) scale(1.1)",
                },
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip
          title="Delete"
          arrow
          TransitionComponent={Zoom}
          enterDelay={300}
          placement="top"
        >
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              ...getButtonStyles(STATUS_COLORS.error, "#F44336"),
            }}
          >
            <DeleteIcon
              fontSize={size}
              sx={{
                transition: "transform 0.2s ease",
                ".MuiIconButton-root:hover &": {
                  transform: "rotate(-15deg) scale(1.1)",
                },
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip
          title="More Options"
          arrow
          TransitionComponent={Zoom}
          enterDelay={300}
          placement="top"
        >
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onMore();
            }}
            sx={{
              ...getButtonStyles("#607D8B", "#78909C"),
            }}
          >
            <MoreVertIcon
              fontSize={size}
              sx={{
                transition: "transform 0.2s ease",
                ".MuiIconButton-root:hover &": {
                  transform: "scale(1.2)",
                },
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;

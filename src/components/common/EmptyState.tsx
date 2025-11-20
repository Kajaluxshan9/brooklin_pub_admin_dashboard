import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  Add as AddIcon,
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "inbox" | "search" | "folder" | "custom";
  customIcon?: React.ReactNode;
  variant?: "default" | "minimal" | "illustration";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items",
  description = "There are currently no items to display.",
  actionLabel = "Create new",
  onAction,
  icon = "inbox",
  customIcon,
  variant = "default",
}) => {
  const renderIcon = () => {
    if (customIcon) return customIcon;

    const iconProps = {
      sx: {
        fontSize: variant === "minimal" ? 48 : 64,
        color: "rgba(200, 121, 65, 0.3)",
        mb: 2,
        animation: "float 3s ease-in-out infinite",
      },
    };

    switch (icon) {
      case "search":
        return <SearchOffIcon {...iconProps} />;
      case "folder":
        return <FolderOpenIcon {...iconProps} />;
      case "inbox":
      default:
        return <InboxIcon {...iconProps} />;
    }
  };

  if (variant === "minimal") {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 3,
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {renderIcon()}
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: onAction ? 3 : 0,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          {description}
        </Typography>
        {onAction && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAction}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(200, 121, 65, 0.25)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(200, 121, 65, 0.35)",
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: "center",
        py: 8,
        px: 4,
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)",
        border: "2px dashed rgba(200, 121, 65, 0.2)",
        position: "relative",
        overflow: "hidden",
        animation: "scaleIn 0.5s ease-out",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(200, 121, 65, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(232, 155, 92, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {renderIcon()}
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: onAction ? 4 : 0,
            maxWidth: 500,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
        {onAction && (
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={onAction}
            sx={{
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #C87941 0%, #E89B5C 100%)",
              boxShadow: "0 4px 14px rgba(200, 121, 65, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: "linear-gradient(135deg, #A45F2D 0%, #C87941 100%)",
                transform: "translateY(-3px)",
                boxShadow: "0 8px 24px rgba(200, 121, 65, 0.4)",
              },
              "&:active": {
                transform: "translateY(-1px)",
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default EmptyState;

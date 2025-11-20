import React, { useState } from "react";
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Zoom,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

interface FloatingAction {
  icon: React.ReactElement;
  name: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[];
  mainAction?: () => void;
  mainIcon?: React.ReactElement;
  variant?: "single" | "speed-dial";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [],
  mainAction,
  mainIcon = <AddIcon />,
  variant = "single",
  position = "bottom-right",
}) => {
  const [open, setOpen] = useState(false);

  const getPositionStyles = () => {
    const base = { position: "fixed", bottom: 24, zIndex: 1000 };
    switch (position) {
      case "bottom-left":
        return { ...base, left: 24 };
      case "bottom-center":
        return { ...base, left: "50%", transform: "translateX(-50%)" };
      case "bottom-right":
      default:
        return { ...base, right: 24 };
    }
  };

  if (variant === "speed-dial" && actions.length > 0) {
    return (
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{
          ...getPositionStyles(),
          "& .MuiSpeedDial-fab": {
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #C87941 0%, #E89B5C 100%)",
            boxShadow: "0 8px 24px rgba(200, 121, 65, 0.35)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #A45F2D 0%, #C87941 100%)",
              transform: "scale(1.1) rotate(90deg)",
              boxShadow: "0 12px 32px rgba(200, 121, 65, 0.45)",
            },
          },
        }}
        icon={<SpeedDialIcon icon={mainIcon} openIcon={<CloseIcon />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {actions.map((action, index) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              action.onClick();
              setOpen(false);
            }}
            sx={{
              width: 48,
              height: 48,
              background: action.color || "#fff",
              color: action.color ? "#fff" : "#C87941",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: `${index * 30}ms`,
              "&:hover": {
                background: action.color || "#FFF8F0",
                transform: "scale(1.15)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
              },
            }}
          />
        ))}
      </SpeedDial>
    );
  }

  return (
    <Zoom in timeout={300}>
      <Tooltip title="Add New" arrow placement="left">
        <Fab
          color="primary"
          aria-label="add"
          onClick={mainAction}
          sx={{
            ...getPositionStyles(),
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #C87941 0%, #E89B5C 100%)",
            boxShadow:
              "0 8px 24px rgba(200, 121, 65, 0.35), 0 4px 12px rgba(200, 121, 65, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #A45F2D 0%, #C87941 100%)",
              transform: "scale(1.15) rotate(90deg)",
              boxShadow:
                "0 12px 32px rgba(200, 121, 65, 0.45), 0 6px 16px rgba(200, 121, 65, 0.25)",
            },
            "&:active": {
              transform: "scale(1.05) rotate(90deg)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(200, 121, 65, 0.3), rgba(232, 155, 92, 0.3))",
              zIndex: -1,
              opacity: 0,
              transition: "opacity 0.3s ease",
            },
            "&:hover::before": {
              opacity: 1,
              animation: "pulse 2s ease-in-out infinite",
            },
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 0.5,
              },
              "50%": {
                transform: "scale(1.2)",
                opacity: 0,
              },
            },
          }}
        >
          {mainIcon}
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default FloatingActionButton;

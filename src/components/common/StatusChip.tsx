import React from "react";
import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { STANDARD_COLORS } from "../../utils/standardColors";

export type StatusType =
  | "active"
  | "inactive"
  | "open"
  | "closed"
  | "pending"
  | "success"
  | "error"
  | "warning"
  | "info";

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: StatusType;
  label?: string;
}

const STATUS_CONFIG = {
  active: {
    color: STANDARD_COLORS.status.active.main,
    bg: STANDARD_COLORS.status.active.light,
    icon: CheckCircleIcon,
    defaultLabel: "Active",
  },
  inactive: {
    color: STANDARD_COLORS.status.inactive.main,
    bg: STANDARD_COLORS.status.inactive.light,
    icon: CancelIcon,
    defaultLabel: "Inactive",
  },
  open: {
    color: STANDARD_COLORS.status.open.main,
    bg: STANDARD_COLORS.status.open.light,
    icon: CheckCircleIcon,
    defaultLabel: "Open",
  },
  closed: {
    color: STANDARD_COLORS.status.closed.main,
    bg: STANDARD_COLORS.status.closed.light,
    icon: CancelIcon,
    defaultLabel: "Closed",
  },
  pending: {
    color: STANDARD_COLORS.status.pending.main,
    bg: STANDARD_COLORS.status.pending.light,
    icon: HourglassEmptyIcon,
    defaultLabel: "Pending",
  },
  warning: {
    color: STANDARD_COLORS.status.warning.main,
    bg: STANDARD_COLORS.status.warning.light,
    icon: WarningIcon,
    defaultLabel: "Warning",
  },
  error: {
    color: STANDARD_COLORS.status.error.main,
    bg: STANDARD_COLORS.status.error.light,
    icon: CancelIcon,
    defaultLabel: "Error",
  },
  success: {
    color: STANDARD_COLORS.status.success.main,
    bg: STANDARD_COLORS.status.success.light,
    icon: CheckCircleIcon,
    defaultLabel: "Success",
  },
  info: {
    color: STANDARD_COLORS.status.info.main,
    bg: STANDARD_COLORS.status.info.light,
    icon: InfoIcon,
    defaultLabel: "Info",
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = "medium",
  ...rest
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Chip
      icon={
        <Icon
          sx={{
            fontSize: size === "small" ? "1rem" : "1.25rem",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1, transform: "scale(1)" },
              "50%": { opacity: 0.85, transform: "scale(0.95)" },
            },
          }}
        />
      }
      label={label || config.defaultLabel}
      size={size}
      sx={{
        background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg}DD 100%)`,
        color: config.color,
        fontWeight: 700,
        fontSize: size === "small" ? "0.75rem" : "0.813rem",
        letterSpacing: "0.3px",
        borderRadius: 2.5,
        px: size === "small" ? 1.25 : 1.75,
        py: size === "small" ? 0.5 : 0.75,
        border: `2px solid ${config.color}30`,
        boxShadow: `0 3px 10px ${config.color}25, inset 0 1px 0 rgba(255,255,255,0.4)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -2,
          borderRadius: 2.5,
          padding: "2px",
          background: `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          boxShadow: `0 5px 16px ${config.color}35, inset 0 1px 0 rgba(255,255,255,0.5)`,
          transform: "translateY(-2px) scale(1.02)",
          borderColor: config.color,
          "&::before": {
            opacity: 1,
          },
        },
        "&:active": {
          transform: "translateY(0) scale(0.98)",
        },
        "& .MuiChip-icon": {
          color: config.color,
          marginLeft: size === "small" ? "4px" : "6px",
        },
        "& .MuiChip-label": {
          paddingLeft: size === "small" ? "6px" : "8px",
          paddingRight: size === "small" ? "8px" : "10px",
          textShadow: "0 1px 2px rgba(0,0,0,0.05)",
        },
        animation: "fadeIn 0.4s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "scale(0.9)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};

export default StatusChip;

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
      icon={<Icon sx={{ fontSize: size === "small" ? "1rem" : "1.25rem" }} />}
      label={label || config.defaultLabel}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 2,
        px: size === "small" ? 1 : 1.5,
        "& .MuiChip-icon": {
          color: config.color,
        },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};

export default StatusChip;

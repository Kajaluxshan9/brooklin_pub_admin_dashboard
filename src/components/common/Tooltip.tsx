import React from "react";
import { Tooltip as MuiTooltip, styled } from "@mui/material";
import type { TooltipProps } from "@mui/material";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(() => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor: "rgba(45, 36, 22, 0.95)",
    color: "#FFF8F0",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 8,
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
    maxWidth: 320,
    border: "1px solid rgba(200, 121, 65, 0.2)",
  },
  "& .MuiTooltip-arrow": {
    color: "rgba(45, 36, 22, 0.95)",
    "&::before": {
      border: "1px solid rgba(200, 121, 65, 0.2)",
    },
  },
}));

interface EnhancedTooltipProps extends Omit<TooltipProps, "title"> {
  title: string;
  children: React.ReactElement;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <StyledTooltip
      title={title}
      arrow
      enterDelay={300}
      leaveDelay={200}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

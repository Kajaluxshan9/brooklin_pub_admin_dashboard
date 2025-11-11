import React from "react";
import { Box, Typography } from "@mui/material";
import { STANDARD_COLORS } from "../../utils/standardColors";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  statusChip?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  statusChip,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${STANDARD_COLORS.ui.border}`,
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: subtitle ? 1 : 0,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: STANDARD_COLORS.text.primary,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
            }}
          >
            {title}
          </Typography>
          {statusChip}
        </Box>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: STANDARD_COLORS.text.secondary,
              fontSize: "1rem",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default PageHeader;

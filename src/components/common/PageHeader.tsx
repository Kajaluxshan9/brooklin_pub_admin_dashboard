import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { STANDARD_COLORS } from "../../utils/standardColors";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  statusChip?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  statusChip,
  breadcrumbs,
  icon,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 4.5,
        pb: 3.5,
        position: "relative",
        gap: 2,
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(200, 121, 65, 0.25) 0%, rgba(200, 121, 65, 0.1) 50%, transparent 100%)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200px",
          height: "3px",
          background:
            "linear-gradient(90deg, #C87941 0%, #E89B5C 70%, transparent 100%)",
          borderRadius: "4px",
          boxShadow: "0 2px 12px rgba(200, 121, 65, 0.4)",
          animation: "slideInWithGlow 0.8s ease-out",
        },
        "@keyframes slideInWithGlow": {
          "0%": {
            width: 0,
            opacity: 0,
          },
          "50%": {
            width: "100px",
            opacity: 0.7,
          },
          "100%": {
            width: "200px",
            opacity: 1,
          },
        },
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={
            <NavigateNextIcon
              fontSize="small"
              sx={{ color: "rgba(200, 121, 65, 0.5)" }}
            />
          }
          sx={{
            mb: 1,
            animation: "fadeIn 0.5s ease-out",
            "& .MuiBreadcrumbs-ol": {
              flexWrap: "nowrap",
            },
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              href={crumb.href}
              underline="hover"
              sx={{
                color:
                  index === breadcrumbs.length - 1
                    ? "text.primary"
                    : "text.secondary",
                fontSize: "0.875rem",
                fontWeight: index === breadcrumbs.length - 1 ? 600 : 500,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "translateX(2px)",
                },
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2.5,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: subtitle ? 1.5 : 0,
              flexWrap: "wrap",
            }}
          >
            {icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background:
                    "linear-gradient(135deg, rgba(200, 121, 65, 0.15) 0%, rgba(232, 155, 92, 0.1) 100%)",
                  border: "2px solid rgba(200, 121, 65, 0.2)",
                  color: "primary.main",
                  animation: "scaleIn 0.5s ease-out",
                  boxShadow: "0 4px 12px rgba(200, 121, 65, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "rotate(5deg) scale(1.05)",
                    boxShadow: "0 6px 16px rgba(200, 121, 65, 0.25)",
                  },
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: { xs: "2rem", sm: "2.5rem" },
                letterSpacing: "-0.02em",
                position: "relative",
                animation: "fadeInUp 0.6s ease-out",
                "@keyframes fadeInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(20px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              {title}
            </Typography>
            {statusChip && (
              <Box sx={{ animation: "fadeIn 0.7s ease-out 0.2s both" }}>
                {statusChip}
              </Box>
            )}
          </Box>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: STANDARD_COLORS.text.secondary,
                fontSize: "1.05rem",
                fontWeight: 500,
                maxWidth: "700px",
                lineHeight: 1.7,
                animation: "fadeIn 0.6s ease-out 0.3s both",
                position: "relative",
                pl: icon ? 8 : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box
            sx={{
              flexShrink: 0,
              animation: "slideInRight 0.5s ease-out 0.4s both",
              "@keyframes slideInRight": {
                from: {
                  opacity: 0,
                  transform: "translateX(20px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              },
            }}
          >
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;

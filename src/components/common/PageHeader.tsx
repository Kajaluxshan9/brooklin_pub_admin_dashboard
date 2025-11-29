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
        display: 'flex',
        flexDirection: 'column',
        mb: 4,
        pb: 3,
        position: 'relative',
        gap: 1.5,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '120px',
          height: '2px',
          background:
            'linear-gradient(90deg, #C87941 0%, rgba(200, 121, 65, 0.3) 100%)',
          borderRadius: '2px',
        },
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={
            <NavigateNextIcon
              fontSize="small"
              sx={{ color: 'rgba(200, 121, 65, 0.5)' }}
            />
          }
          sx={{
            mb: 1,
            animation: 'fadeIn 0.5s ease-out',
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'nowrap',
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
                    ? 'text.primary'
                    : 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: index === breadcrumbs.length - 1 ? 600 : 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateX(2px)',
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
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2.5,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: subtitle ? 1.5 : 0,
              flexWrap: 'wrap',
            }}
          >
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: 'rgba(200, 121, 65, 0.08)',
                  border: '1px solid rgba(200, 121, 65, 0.15)',
                  color: 'primary.main',
                  transition: 'all 0.2s ease',
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#C87941',
                fontSize: { xs: '1.75rem', sm: '2rem' },
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            {statusChip && (
              <Box sx={{ animation: 'fadeIn 0.7s ease-out 0.2s both' }}>
                {statusChip}
              </Box>
            )}
          </Box>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: STANDARD_COLORS.text.secondary,
                fontSize: '1.05rem',
                fontWeight: 500,
                maxWidth: '700px',
                lineHeight: 1.7,
                animation: 'fadeIn 0.6s ease-out 0.3s both',
                position: 'relative',
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
              animation: 'slideInRight 0.5s ease-out 0.4s both',
              '@keyframes slideInRight': {
                from: {
                  opacity: 0,
                  transform: 'translateX(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateX(0)',
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

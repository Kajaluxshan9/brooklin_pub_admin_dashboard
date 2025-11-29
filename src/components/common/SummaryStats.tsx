import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

export interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface SummaryStatsProps {
  stats: StatItem[];
  columns?: number;
  variant?: 'default' | 'compact' | 'card';
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  stats,
  columns = 4,
  variant = 'default',
}) => {
  const getGridSize = () => {
    switch (columns) {
      case 2:
        return { xs: 6, sm: 6, md: 6 };
      case 3:
        return { xs: 6, sm: 4, md: 4 };
      case 4:
        return { xs: 6, sm: 3, md: 3 };
      case 5:
        return { xs: 6, sm: 4, md: 2.4 };
      case 6:
        return { xs: 6, sm: 4, md: 2 };
      default:
        return { xs: 6, sm: 3, md: 3 };
    }
  };

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(200, 121, 65, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {stat.icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: stat.color
                    ? `${stat.color}15`
                    : 'rgba(200, 121, 65, 0.1)',
                  color: stat.color || '#C87941',
                }}
              >
                {stat.icon}
              </Box>
            )}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: stat.color || '#2D2416',
                  fontSize: '1.25rem',
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
                {stat.suffix && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary',
                      ml: 0.5,
                    }}
                  >
                    {stat.suffix}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2.5,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid key={index} size={getGridSize()}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  background: stat.color
                    ? `${stat.color}08`
                    : 'rgba(200, 121, 65, 0.04)',
                  border: '1px solid',
                  borderColor: stat.color
                    ? `${stat.color}15`
                    : 'rgba(200, 121, 65, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: stat.color
                      ? `${stat.color}12`
                      : 'rgba(200, 121, 65, 0.08)',
                  },
                }}
              >
                {stat.icon && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      background: stat.color
                        ? `${stat.color}20`
                        : 'rgba(200, 121, 65, 0.15)',
                      color: stat.color || '#C87941',
                    }}
                  >
                    {stat.icon}
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: stat.color || '#2D2416',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                    {stat.suffix && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                          ml: 0.5,
                        }}
                      >
                        {stat.suffix}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  // Default variant
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid key={index} size={getGridSize()}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(200, 121, 65, 0.08)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {stat.icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: stat.color
                      ? `${stat.color}15`
                      : 'rgba(200, 121, 65, 0.1)',
                    color: stat.color || '#C87941',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  {stat.icon}
                </Box>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: stat.color || '#2D2416',
                  mb: 0.5,
                }}
              >
                {stat.value}
                {stat.suffix && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.secondary',
                      ml: 0.5,
                    }}
                  >
                    {stat.suffix}
                  </Typography>
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SummaryStats;

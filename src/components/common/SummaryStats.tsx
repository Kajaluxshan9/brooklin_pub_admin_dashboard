import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

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
      case 2: return { xs: 6, sm: 6, md: 6 };
      case 3: return { xs: 6, sm: 4, md: 4 };
      case 4: return { xs: 6, sm: 3, md: 3 };
      case 5: return { xs: 6, sm: 4, md: 2.4 };
      case 6: return { xs: 6, sm: 4, md: 2 };
      default: return { xs: 6, sm: 3, md: 3 };
    }
  };

  // Compact variant — pill-style chips in a flex row
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              background: stat.color ? `${stat.color}0D` : 'rgba(200, 121, 65, 0.06)',
              border: `1px solid ${stat.color ? `${stat.color}20` : 'rgba(200, 121, 65, 0.12)'}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: stat.color ? `${stat.color}15` : 'rgba(200, 121, 65, 0.1)',
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${stat.color ? `${stat.color}20` : 'rgba(200,121,65,0.1)'}`,
              },
            }}
          >
            {stat.icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  background: stat.color ? `${stat.color}20` : 'rgba(200, 121, 65, 0.15)',
                  color: stat.color || '#C87941',
                  flexShrink: 0,
                  '& svg': { fontSize: '0.95rem' },
                }}
              >
                {stat.icon}
              </Box>
            )}
            <Box>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                  mb: 0.25,
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: stat.color || '#2C1810',
                  fontSize: '1.15rem',
                  lineHeight: 1,
                }}
              >
                {stat.value}
                {stat.suffix && (
                  <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', ml: 0.5 }}>
                    {stat.suffix}
                  </Box>
                )}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Card variant — single row card with stat items side by side
  if (variant === 'card') {
    return (
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Grid container spacing={1.5}>
          {stats.map((stat, index) => (
            <Grid key={index} size={getGridSize()}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.75,
                  borderRadius: 2,
                  background: stat.color ? `${stat.color}08` : 'rgba(200, 121, 65, 0.04)',
                  border: `1px solid ${stat.color ? `${stat.color}18` : 'rgba(200, 121, 65, 0.1)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: stat.color ? `${stat.color}12` : 'rgba(200, 121, 65, 0.08)',
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
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: stat.color ? `${stat.color}18` : 'rgba(200, 121, 65, 0.12)',
                      color: stat.color || '#C87941',
                      flexShrink: 0,
                      '& svg': { fontSize: '1.1rem' },
                    }}
                  >
                    {stat.icon}
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 0.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: stat.color || '#2C1810',
                      fontSize: '1.375rem',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                    {stat.suffix && (
                      <Box component="span" sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.secondary', ml: 0.5 }}>
                        {stat.suffix}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Default variant — equal-width stat blocks in a row strip
  return (
    <Box
      sx={{
        mb: 3,
        p: 1.5,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(200, 121, 65, 0.08)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Grid container spacing={0}>
        {stats.map((stat, index) => (
          <Grid key={index} size={getGridSize()}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                textAlign: 'center',
                position: 'relative',
                borderRight: index < stats.length - 1 ? '1px solid rgba(200, 121, 65, 0.08)' : 'none',
                '&:hover': {
                  background: 'rgba(200, 121, 65, 0.03)',
                  borderRadius: 2,
                },
              }}
            >
              {stat.icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: stat.color ? `${stat.color}15` : 'rgba(200, 121, 65, 0.1)',
                    color: stat.color || '#C87941',
                    mb: 1,
                    '& svg': { fontSize: '1rem' },
                  }}
                >
                  {stat.icon}
                </Box>
              )}
              <Typography
                sx={{
                  fontWeight: 800,
                  color: stat.color || '#2C1810',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {stat.value}
                {stat.suffix && (
                  <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary', ml: 0.5 }}>
                    {stat.suffix}
                  </Box>
                )}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </Typography>
              {stat.trendValue && (
                <Box
                  sx={{
                    mt: 0.75,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    background: stat.trend === 'up'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : stat.trend === 'down'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(107, 114, 128, 0.1)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: stat.trend === 'up'
                      ? '#10B981'
                      : stat.trend === 'down'
                      ? '#EF4444'
                      : '#6B7280',
                  }}
                >
                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.trendValue}
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SummaryStats;

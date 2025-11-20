// Theme utilities and helpers

import { STANDARD_COLORS } from "./standardColors";

// Spacing utilities
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

// Border radius presets
export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "24px",
  round: "50%",
};

// Shadow presets
export const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 4px 16px rgba(0, 0, 0, 0.12)",
  lg: "0 8px 32px rgba(0, 0, 0, 0.16)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.2)",
  colored: (color: string, opacity: number = 0.15) =>
    `0 8px 24px ${color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`,
  inner: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
};

// Gradient builders
export const gradients = {
  primary: `linear-gradient(135deg, ${STANDARD_COLORS.brand.primary.light} 0%, ${STANDARD_COLORS.brand.primary.main} 100%)`,
  secondary: `linear-gradient(135deg, ${STANDARD_COLORS.brand.secondary.light} 0%, ${STANDARD_COLORS.brand.secondary.main} 100%)`,
  success: `linear-gradient(135deg, ${STANDARD_COLORS.status.success.light} 0%, ${STANDARD_COLORS.status.success.main} 100%)`,
  error: `linear-gradient(135deg, ${STANDARD_COLORS.status.error.light} 0%, ${STANDARD_COLORS.status.error.main} 100%)`,
  warning: `linear-gradient(135deg, ${STANDARD_COLORS.status.warning.light} 0%, ${STANDARD_COLORS.status.warning.main} 100%)`,
  info: `linear-gradient(135deg, ${STANDARD_COLORS.status.info.light} 0%, ${STANDARD_COLORS.status.info.main} 100%)`,
  background: `linear-gradient(135deg, #FFF8F0 0%, #FFFBF7 25%, #FFF3E6 50%, #FFE8D1 75%, #FFF8F0 100%)`,
  card: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 240, 0.95) 100%)`,
};

// Glass morphism effect
export const glassMorphism = (opacity: number = 0.98) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid rgba(200, 121, 65, 0.15)",
});

// Hover effects
export const hoverEffects = {
  lift: {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
    },
  },
  scale: {
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  glow: (color: string) => ({
    transition: "box-shadow 0.3s ease",
    "&:hover": {
      boxShadow: `0 0 20px ${color}80`,
    },
  }),
  brighten: {
    transition: "filter 0.3s ease",
    "&:hover": {
      filter: "brightness(1.1)",
    },
  },
};

// Typography helpers
export const typography = {
  heading1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  heading2: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  heading3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.4,
  },
};

// Breakpoint helpers (matches MUI defaults)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Z-index levels
export const zIndex = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Transition timing functions
export const transitions = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

// Color utilities
export const colorUtils = {
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  lighten: (color: string): string => {
    // Simple lighten function - in production, use a color library
    return color;
  },
  darken: (color: string): string => {
    // Simple darken function - in production, use a color library
    return color;
  },
};

// Responsive helpers
export const responsive = {
  isMobile: () => window.innerWidth < breakpoints.sm,
  isTablet: () =>
    window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.lg,
  isDesktop: () => window.innerWidth >= breakpoints.lg,
};

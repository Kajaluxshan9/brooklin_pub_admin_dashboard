/**
 * Standard Colors for Brooklin Pub Admin Dashboard
 * Following industry standards for status indicators
 */

export const STANDARD_COLORS = {
  // Status Colors (Industry Standard)
  status: {
    active: {
      main: "#4CAF50",
      light: "#E8F5E9",
      dark: "#388E3C",
      contrast: "#FFFFFF",
    },
    inactive: {
      main: "#9E9E9E",
      light: "#F5F5F5",
      dark: "#616161",
      contrast: "#FFFFFF",
    },
    open: {
      main: "#4CAF50",
      light: "#E8F5E9",
      dark: "#388E3C",
      contrast: "#FFFFFF",
    },
    closed: {
      main: "#F44336",
      light: "#FFEBEE",
      dark: "#D32F2F",
      contrast: "#FFFFFF",
    },
    pending: {
      main: "#FF9800",
      light: "#FFF3E0",
      dark: "#F57C00",
      contrast: "#000000",
    },
    warning: {
      main: "#FF9800",
      light: "#FFF3E0",
      dark: "#F57C00",
      contrast: "#000000",
    },
    error: {
      main: "#F44336",
      light: "#FFEBEE",
      dark: "#D32F2F",
      contrast: "#FFFFFF",
    },
    success: {
      main: "#4CAF50",
      light: "#E8F5E9",
      dark: "#388E3C",
      contrast: "#FFFFFF",
    },
    info: {
      main: "#2196F3",
      light: "#E3F2FD",
      dark: "#1976D2",
      contrast: "#FFFFFF",
    },
  },

  // Brand Colors
  brand: {
    primary: {
      main: "#C87941",
      light: "#FFF8F0",
      dark: "#A45F2D",
      contrast: "#FFFFFF",
    },
    secondary: {
      main: "#D4842D",
      light: "#FFF3E6",
      dark: "#B66D25",
      contrast: "#FFFFFF",
    },
  },

  // UI Colors
  ui: {
    border: "#E8DDD0",
    divider: "#E8E3DC",
    background: "#FFF8F0",
    surface: "#FFFFFF",
    hover: "#FFF3E6",
  },

  // Text Colors
  text: {
    primary: "#2C1810",
    secondary: "#6B4E3D",
    disabled: "#9E9E9E",
    hint: "#BDBDBD",
  },
};

// Event Type Colors
export const EVENT_TYPE_COLORS = {
  LIVE_MUSIC: STANDARD_COLORS.status.info.main, // Blue
  SPORTS_VIEWING: STANDARD_COLORS.status.success.main, // Green
  TRIVIA_NIGHT: STANDARD_COLORS.status.warning.main, // Orange
  PRIVATE_PARTY: STANDARD_COLORS.brand.primary.main, // Terracotta
  KARAOKE: "#9C27B0", // Purple
  SPECIAL_EVENT: STANDARD_COLORS.status.info.main, // Blue
};

// Quick access helpers
export const STATUS_COLORS = {
  active: STANDARD_COLORS.status.active.main,
  inactive: STANDARD_COLORS.status.inactive.main,
  open: STANDARD_COLORS.status.open.main,
  closed: STANDARD_COLORS.status.closed.main,
  pending: STANDARD_COLORS.status.pending.main,
  warning: STANDARD_COLORS.status.warning.main,
  error: STANDARD_COLORS.status.error.main,
  success: STANDARD_COLORS.status.success.main,
  info: STANDARD_COLORS.status.info.main,
  primary: STANDARD_COLORS.brand.primary.main,
  secondary: STANDARD_COLORS.brand.secondary.main,
};

export default STANDARD_COLORS;

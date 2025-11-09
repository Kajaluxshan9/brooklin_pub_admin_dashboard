// Brown Theme Configuration for Brooklin Pub Admin Dashboard
export const brooklinBrownTheme = {
  // Primary brown colors
  primary: {
    main: "#8B4513", // Saddle Brown
    light: "#A0522D", // Sienna
    dark: "#654321", // Dark Brown
    contrastText: "#FFFFFF",
  },

  // Secondary brown colors
  secondary: {
    main: "#D2691E", // Chocolate
    light: "#DEB887", // Burlywood
    dark: "#CD853F", // Peru
    contrastText: "#FFFFFF",
  },

  // Background colors
  background: {
    default: "#faf6f2", // Light cream
    paper: "#FFFFFF",
    accent: "#f5f1ed", // Very light brown
  },

  // Text colors
  text: {
    primary: "#3e2723", // Dark brown
    secondary: "#5d4037", // Medium brown
    disabled: "#8d6e63", // Light brown
  },

  // Border and divider colors
  divider: "#d7ccc8", // Light brown-grey

  // Status colors (keeping standard but with brown tints)
  success: {
    main: "#4caf50",
    light: "#81c784",
    dark: "#388e3c",
  },

  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
  },

  warning: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
  },

  info: {
    main: "#2196f3",
    light: "#64b5f6",
    dark: "#1976d2",
  },

  // Card shadows with brown tint
  shadows: {
    light: "0 4px 12px rgba(139, 69, 19, 0.15)",
    medium: "0 6px 20px rgba(139, 69, 19, 0.25)",
    heavy: "0 8px 32px rgba(139, 69, 19, 0.35)",
  },

  // Component styling utilities
  components: {
    header: {
      background: "#8B4513",
      color: "#FFFFFF",
      shadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
    },
    card: {
      background: "#FFFFFF",
      border: "1px solid #d7ccc8",
      shadow: "0 4px 12px rgba(139, 69, 19, 0.15)",
      hoverShadow: "0 8px 25px rgba(139, 69, 19, 0.25)",
    },
    button: {
      primary: {
        background: "#8B4513",
        hover: "#A0522D",
        color: "#FFFFFF",
      },
      secondary: {
        background: "transparent",
        border: "1px solid #8B4513",
        color: "#8B4513",
        hover: "rgba(139, 69, 19, 0.1)",
      },
    },
    input: {
      border: "#d7ccc8",
      focus: "#8B4513",
      background: "#FFFFFF",
    },
    sidebar: {
      background: "#faf6f2",
      itemActive: "#8B4513",
      itemHover: "rgba(139, 69, 19, 0.1)",
    },
  },
};

// Utility functions for consistent styling
export const getBrownTheme = () => brooklinBrownTheme;

export const createCardStyle = (hover = true) => ({
  backgroundColor: brooklinBrownTheme.background.paper,
  border: `1px solid ${brooklinBrownTheme.divider}`,
  borderRadius: 3,
  boxShadow: brooklinBrownTheme.shadows.light,
  transition: "all 0.3s ease",
  ...(hover && {
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: brooklinBrownTheme.shadows.medium,
    },
  }),
});

export const createHeaderStyle = () => ({
  backgroundColor: brooklinBrownTheme.components.header.background,
  color: brooklinBrownTheme.components.header.color,
  boxShadow: brooklinBrownTheme.components.header.shadow,
  borderRadius: 3,
  padding: 3,
  marginBottom: 4,
});

export const createButtonStyle = (
  variant: "primary" | "secondary" = "primary"
) => {
  if (variant === "primary") {
    const btn = brooklinBrownTheme.components.button.primary;
    return {
      backgroundColor: btn.background,
      color: btn.color,
      fontWeight: 600,
      "&:hover": {
        backgroundColor: btn.hover,
      },
    };
  } else {
    const btn = brooklinBrownTheme.components.button.secondary;
    return {
      backgroundColor: btn.background,
      color: btn.color,
      fontWeight: 600,
      border: btn.border,
      "&:hover": {
        backgroundColor: btn.hover,
      },
    };
  }
};

export const createInputStyle = () => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: brooklinBrownTheme.components.input.background,
    "&:hover fieldset": {
      borderColor: brooklinBrownTheme.components.input.focus,
    },
    "&.Mui-focused fieldset": {
      borderColor: brooklinBrownTheme.components.input.focus,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brooklinBrownTheme.components.input.focus,
  },
});

export default brooklinBrownTheme;

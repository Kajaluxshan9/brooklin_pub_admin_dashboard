import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./components/AppRoutes";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8B4513", // Saddle Brown - matching pub theme
      light: "#CD853F", // Peru
      dark: "#654321", // Dark Brown
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D2691E", // Chocolate
      light: "#F4A460", // Sandy Brown
      dark: "#A0522D", // Sienna
      contrastText: "#ffffff",
    },
    background: {
      default: "#faf9f7", // Warm off-white background
      paper: "#ffffff",
    },
    text: {
      primary: "#3e2723", // Dark brown text
      secondary: "#5d4037", // Medium brown text
    },
    grey: {
      50: "#faf9f7",
      100: "#f5f4f1",
      200: "#efebe7",
      300: "#e8e0db",
      400: "#bcaaa4",
      500: "#8d6e63",
      600: "#6d4c41",
      700: "#5d4037",
      800: "#4e342e",
      900: "#3e2723",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    info: {
      main: "#8B4513", // Changed from blue to brown
      light: "#CD853F",
      dark: "#654321",
    },
    divider: "#d7ccc8", // Light brown divider
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(139, 69, 19, 0.05)",
    "0 1px 3px 0 rgba(139, 69, 19, 0.1), 0 1px 2px 0 rgba(139, 69, 19, 0.06)",
    "0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)",
    "0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)",
    "0 20px 25px -5px rgba(139, 69, 19, 0.1), 0 10px 10px -5px rgba(139, 69, 19, 0.04)",
    "0 25px 50px -12px rgba(139, 69, 19, 0.25)",
    "0 30px 60px -15px rgba(139, 69, 19, 0.3)",
    "0 35px 70px -20px rgba(139, 69, 19, 0.25)",
    "0 40px 80px -25px rgba(139, 69, 19, 0.2)",
    "0 45px 90px -30px rgba(139, 69, 19, 0.15)",
    "0 50px 100px -35px rgba(139, 69, 19, 0.1)",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "0 0 20px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          padding: "10px 20px",
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(139, 69, 19, 0.15)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 8px 25px rgba(139, 69, 19, 0.25)",
            backgroundColor: "#654321", // Dark brown hover
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(139, 69, 19, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#ffffff",
        },
        elevation1: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 0",
          "&.Mui-selected": {
            backgroundColor: "#8B4513",
            color: "white",
            "&:hover": {
              backgroundColor: "#654321",
            },
            "& .MuiListItemIcon-root": {
              color: "white",
            },
            "& .MuiTypography-root": {
              fontWeight: 600,
            },
          },
          "&:hover": {
            backgroundColor: "rgba(139, 69, 19, 0.08)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "& fieldset": {
              borderColor: "#e2e8f0",
            },
            "&:hover fieldset": {
              borderColor: "#8B4513",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8B4513",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#f1f5f9",
        },
        bar: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

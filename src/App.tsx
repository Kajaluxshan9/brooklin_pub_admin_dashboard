import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./components/AppRoutes";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#C87941", // Rich terracotta brown
      light: "#E49B5F", // Warm amber
      dark: "#A45F2D", // Deep copper
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D4842D", // Golden brown
      light: "#F5A94C", // Bright caramel
      dark: "#B5661A", // Deep golden
      contrastText: "#ffffff",
    },
    background: {
      default: "#FFF8F0", // Warm cream white
      paper: "#ffffff",
    },
    text: {
      primary: "#2C1810", // Deep rich brown
      secondary: "#6B4E3D", // Warm brown
    },
    grey: {
      50: "#FFF8F0",
      100: "#FFF3E6",
      200: "#F5EBE0",
      300: "#E8DDD0",
      400: "#DDD0C0",
      500: "#A89588",
      600: "#6B4E3D",
      700: "#523A2A",
      800: "#3A2618",
      900: "#2C1810",
    },
    success: {
      main: "#10B981",
      light: "#6EE7B7",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FCD34D",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#FCA5A5",
      dark: "#DC2626",
    },
    info: {
      main: "#3B82F6",
      light: "#93C5FD",
      dark: "#2563EB",
    },
    divider: "#E8DDD0",
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: "#2D2416",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.02em",
      color: "#2D2416",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.015em",
      color: "#2D2416",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
      color: "#2D2416",
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#2D2416",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#2D2416",
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
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(200, 121, 65, 0.08)",
    "0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)",
    "0 4px 6px -1px rgba(200, 121, 65, 0.12), 0 2px 4px -1px rgba(200, 121, 65, 0.08)",
    "0 10px 15px -3px rgba(200, 121, 65, 0.12), 0 4px 6px -2px rgba(200, 121, 65, 0.08)",
    "0 20px 25px -5px rgba(200, 121, 65, 0.12), 0 10px 10px -5px rgba(200, 121, 65, 0.06)",
    "0 25px 50px -12px rgba(200, 121, 65, 0.18)",
    "0 30px 60px -15px rgba(200, 121, 65, 0.22)",
    "0 35px 70px -20px rgba(200, 121, 65, 0.18)",
    "0 40px 80px -25px rgba(200, 121, 65, 0.14)",
    "0 45px 90px -30px rgba(200, 121, 65, 0.12)",
    "0 50px 100px -35px rgba(200, 121, 65, 0.10)",
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
          backgroundColor: "#ffffff",
          backgroundImage: "none",
          boxShadow:
            "0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)",
          borderBottom: "1px solid #E8DDD0",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E8DDD0",
          boxShadow:
            "0 4px 6px -1px rgba(200, 121, 65, 0.12), 0 2px 4px -1px rgba(200, 121, 65, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            "0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)",
          border: "1px solid #E8DDD0",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgba(200, 121, 65, 0.12), 0 4px 6px -2px rgba(200, 121, 65, 0.08)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.938rem",
          padding: "8px 16px",
          boxShadow: "none",
          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(200, 121, 65, 0.18)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(200, 121, 65, 0.22)",
            backgroundColor: "#A45F2D",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "#FFF3E6",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.813rem",
          height: "28px",
        },
        filled: {
          backgroundColor: "#FFF3E6",
          color: "#6B4E3D",
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
          boxShadow:
            "0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 0",
          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          "&.Mui-selected": {
            backgroundColor: "#C87941",
            color: "white",
            "&:hover": {
              backgroundColor: "#D4842D",
            },
            "& .MuiListItemIcon-root": {
              color: "white",
            },
            "& .MuiTypography-root": {
              fontWeight: 600,
            },
          },
          "&:hover": {
            backgroundColor: "#FFF3E6",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#ffffff",
            transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "#DDD0C0",
            },
            "&:hover": {
              backgroundColor: "#FFF8F0",
              "& fieldset": {
                borderColor: "#C87941",
              },
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              "& fieldset": {
                borderColor: "#C87941",
                borderWidth: "2px",
              },
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "#F5F1EC",
          height: 6,
        },
        bar: {
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow:
            "0 20px 25px -5px rgba(212, 165, 116, 0.1), 0 10px 10px -5px rgba(212, 165, 116, 0.04)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F9F6F2",
          "& .MuiTableCell-root": {
            fontWeight: 600,
            color: "#2D2416",
          },
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

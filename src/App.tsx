import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './components/AppRoutes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C87941', // Rich terracotta brown
      light: '#E49B5F', // Warm amber
      dark: '#A45F2D', // Deep copper
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4842D', // Golden brown
      light: '#F5A94C', // Bright caramel
      dark: '#B5661A', // Deep golden
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFF8F0', // Warm cream white
      paper: '#ffffff',
    },
    text: {
      primary: '#2C1810', // Deep rich brown
      secondary: '#6B4E3D', // Warm brown
    },
    grey: {
      50: '#FFF8F0',
      100: '#FFF3E6',
      200: '#F5EBE0',
      300: '#E8DDD0',
      400: '#DDD0C0',
      500: '#A89588',
      600: '#6B4E3D',
      700: '#523A2A',
      800: '#3A2618',
      900: '#2C1810',
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#93C5FD',
      dark: '#2563EB',
    },
    divider: '#E8DDD0',
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#2D2416',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      color: '#2D2416',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.015em',
      color: '#2D2416',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#2D2416',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2D2416',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2D2416',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(200, 121, 65, 0.08)',
    '0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)',
    '0 4px 6px -1px rgba(200, 121, 65, 0.12), 0 2px 4px -1px rgba(200, 121, 65, 0.08)',
    '0 10px 15px -3px rgba(200, 121, 65, 0.12), 0 4px 6px -2px rgba(200, 121, 65, 0.08)',
    '0 20px 25px -5px rgba(200, 121, 65, 0.12), 0 10px 10px -5px rgba(200, 121, 65, 0.06)',
    '0 25px 50px -12px rgba(200, 121, 65, 0.18)',
    '0 30px 60px -15px rgba(200, 121, 65, 0.22)',
    '0 35px 70px -20px rgba(200, 121, 65, 0.18)',
    '0 40px 80px -25px rgba(200, 121, 65, 0.14)',
    '0 45px 90px -30px rgba(200, 121, 65, 0.12)',
    '0 50px 100px -35px rgba(200, 121, 65, 0.10)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  // Ensure Snackbar (toast) always appears above dialogs/modals
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1500,
    tooltip: 1600,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          zIndex: 9999,
        },
      },
      defaultProps: {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          boxShadow:
            '0 1px 3px 0 rgba(200, 121, 65, 0.12), 0 1px 2px 0 rgba(200, 121, 65, 0.08)',
          borderBottom: '1px solid #E8DDD0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #E8DDD0',
          boxShadow:
            '0 4px 6px -1px rgba(200, 121, 65, 0.12), 0 2px 4px -1px rgba(200, 121, 65, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            '0 4px 12px rgba(200, 121, 65, 0.08), 0 2px 4px rgba(200, 121, 65, 0.04)',
          border: '1px solid rgba(200, 121, 65, 0.12)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background:
              'linear-gradient(90deg, transparent 0%, #C87941 50%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:hover': {
            boxShadow:
              '0 16px 32px rgba(200, 121, 65, 0.15), 0 8px 16px rgba(200, 121, 65, 0.1)',
            transform: 'translateY(-4px)',
            borderColor: 'rgba(200, 121, 65, 0.25)',
          },
          '&:hover::before': {
            opacity: 1,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.938rem',
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.6s, height 0.6s',
          },
          '&:hover::before': {
            width: '300px',
            height: '300px',
          },
          '&:hover': {
            boxShadow: '0 8px 16px -4px rgba(200, 121, 65, 0.25)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(200, 121, 65, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
          boxShadow: '0 4px 12px rgba(200, 121, 65, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A45F2D 0%, #C87941 100%)',
            boxShadow: '0 8px 20px rgba(200, 121, 65, 0.3)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#C87941',
          color: '#C87941',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(200, 121, 65, 0.08)',
            borderColor: '#A45F2D',
            color: '#A45F2D',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(200, 121, 65, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.813rem',
          height: '30px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(200, 121, 65, 0.15)',
          },
        },
        filled: {
          background:
            'linear-gradient(135deg, rgba(200, 121, 65, 0.15) 0%, rgba(232, 155, 92, 0.15) 100%)',
          color: '#6B4E3D',
          border: '1px solid rgba(200, 121, 65, 0.2)',
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow:
            '0 2px 8px rgba(200, 121, 65, 0.1), 0 1px 4px rgba(200, 121, 65, 0.06)',
        },
        elevation2: {
          boxShadow:
            '0 4px 12px rgba(200, 121, 65, 0.12), 0 2px 6px rgba(200, 121, 65, 0.08)',
        },
        elevation3: {
          boxShadow:
            '0 8px 20px rgba(200, 121, 65, 0.15), 0 4px 10px rgba(200, 121, 65, 0.1)',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 0',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            backgroundColor: '#C87941',
            color: 'white',
            '&:hover': {
              backgroundColor: '#D4842D',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '& .MuiTypography-root': {
              fontWeight: 600,
            },
          },
          '&:hover': {
            backgroundColor: '#FFF3E6',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FEFDFB',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(200, 121, 65, 0.2)',
              borderWidth: '1.5px',
            },
            '&:hover': {
              backgroundColor: '#FFF8F0',
              '& fieldset': {
                borderColor: 'rgba(200, 121, 65, 0.4)',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 3px rgba(200, 121, 65, 0.1)',
              '& fieldset': {
                borderColor: '#C87941',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#C87941',
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#F5F1EC',
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
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(200, 121, 65, 0.25)',
          border: '1px solid rgba(200, 121, 65, 0.1)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(45, 36, 22, 0.5)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9F6F2',
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#2D2416',
          },
        },
      },
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

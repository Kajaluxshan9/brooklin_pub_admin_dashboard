import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Brown theme to match the pub
    },
    secondary: {
      main: '#DAA520', // Gold accent
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          color: 'white',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const drawerWidth = 240;

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormData>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin'
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // User is not authenticated, do nothing
      }
    };

    checkAuthStatus();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAlert({ type: 'success', message: 'Login successful!' });
        
        // Clear the form
        setLoginForm({ email: '', password: '' });
      } else {
        setAlert({ type: 'error', message: data.message || 'Login failed' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Connection error. Please try again.' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Admin registered successfully!' });
        setShowRegisterDialog(false);
        setRegisterForm({ email: '', password: '', firstName: '', lastName: '', role: 'admin' });
      } else {
        setAlert({ type: 'error', message: data.message || 'Registration failed' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Connection error. Please try again.' });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setIsAuthenticated(false);
      setSelectedMenu('dashboard');
      setAlert({ type: 'success', message: 'Logged out successfully' });
    } catch (error) {
      // Even if logout request fails, clear local state
      setIsAuthenticated(false);
      setSelectedMenu('dashboard');
      setAlert({ type: 'success', message: 'Logged out successfully' });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'menu', label: 'Menu Management', icon: <RestaurantIcon /> },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedMenu === item.id}
              onClick={() => setSelectedMenu(item.id)}
              sx={{
                color: 'white',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.3)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: 'white' }}>
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // Login Screen
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #DAA520 100%)',
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 5,
              maxWidth: 450,
              width: '100%',
              mx: 2,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #8B4513, #DAA520)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(139, 69, 19, 0.3)'
                }}
              >
                <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#8B4513' }}>
                Brooklin Pub
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage your restaurant
              </Typography>
            </Box>

            {alert && (
              <Alert severity={alert.type} sx={{ mb: 2 }}>
                {alert.message}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#8B4513',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B4513',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B4513',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#8B4513',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B4513',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B4513',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#8B4513' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 4, 
                  mb: 3, 
                  py: 1.8,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #8B4513, #A0522D)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #A0522D, #8B4513)',
                    boxShadow: '0 6px 20px rgba(139, 69, 19, 0.4)',
                  }
                }}
              >
                Sign In to Dashboard
              </Button>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => setAlert({ type: 'error', message: 'Contact your administrator for password reset' })}
                sx={{ 
                  color: '#8B4513',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.04)',
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // Main Dashboard
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Brooklin Pub - {menuItems.find(item => item.id === selectedMenu)?.label}
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setShowRegisterDialog(true)}
            >
              Add Admin
            </Button>
          </Toolbar>
        </AppBar>

        {/* Navigation Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Container maxWidth="xl">
            {selectedMenu === 'dashboard' && (
              <>
                <Typography variant="h4" gutterBottom>
                  Dashboard Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <RestaurantIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Menu Items</Typography>
                            <Typography variant="h4">24</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Admins</Typography>
                            <Typography variant="h4">3</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <DashboardIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Active Sessions</Typography>
                            <Typography variant="h4">12</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <SettingsIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">System Status</Typography>
                            <Typography variant="h4" color="success.main">Online</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}

            {selectedMenu === 'menu' && (
              <Box>
                <Typography variant="h4" gutterBottom>
                  Menu Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage menu items, categories, and pricing.
                </Typography>
              </Box>
            )}

            {selectedMenu === 'users' && (
              <Box>
                <Typography variant="h4" gutterBottom>
                  User Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage admin users and their permissions.
                </Typography>
              </Box>
            )}

            {selectedMenu === 'settings' && (
              <Box>
                <Typography variant="h4" gutterBottom>
                  Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Configure system settings and preferences.
                </Typography>
              </Box>
            )}
          </Container>
        </Box>

        {/* Register Dialog */}
        <Dialog open={showRegisterDialog} onClose={() => setShowRegisterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Register New Admin</DialogTitle>
          <form onSubmit={handleRegister}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={registerForm.role}
                      label="Role"
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as 'admin' | 'super_admin' })}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Register</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;

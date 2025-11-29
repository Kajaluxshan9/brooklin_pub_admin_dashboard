import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
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
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Star as SpecialsIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  PhotoLibrary as StoriesIcon,
  Category as MeasurementsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment-timezone";

const drawerWidth = 260;

const navigation = [
  { name: 'Dashboard', path: '/', icon: DashboardIcon },
  { name: 'Menu', path: '/menu', icon: RestaurantIcon },
  { name: 'Measurements', path: '/measurements', icon: MeasurementsIcon },
  { name: 'Specials', path: '/specials', icon: SpecialsIcon },
  { name: 'Events', path: '/events', icon: EventIcon },
  { name: 'Stories', path: '/stories', icon: StoriesIcon },
  { name: 'Opening Hours', path: '/hours', icon: ScheduleIcon },
  { name: 'User', path: '/users', icon: PeopleIcon },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = moment().tz("America/Toronto");
      setCurrentTime(now.format("MMM DD, YYYY • h:mm:ss A"));
    };

    updateClock(); // Initial update
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(200, 121, 65, 0.1)',
          backdropFilter: 'blur(16px)',
          color: '#2D2416',
          minHeight: { xs: 56, sm: 72 },
          px: 3,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #ffffff 0%, #FFF8F0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(200, 121, 65, 0.2)',
              border: '2px solid rgba(200, 121, 65, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'rotate(-5deg) scale(1.05)',
                boxShadow: '0 6px 16px rgba(200, 121, 65, 0.3)',
              },
            }}
          >
            <Box
              component="img"
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              sx={{
                height: 32,
                width: 52,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 800,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              The Brooklin Pub
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#8B7355',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(200, 121, 65, 0.15)' }} />
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          p: 2.5,
          pt: 3,
        }}
      >
        <List sx={{ pt: 0 }}>
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                <Fade in timeout={300 + index * 50}>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 3,
                      minHeight: 52,
                      px: 2.5,
                      py: 1.75,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      mb: 0.5,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 5,
                        background:
                          'linear-gradient(180deg, #E89B5C 0%, #C87941 100%)',
                        borderRadius: '0 4px 4px 0',
                        transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
                        transition:
                          'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive
                          ? '2px 0 8px rgba(200, 121, 65, 0.4)'
                          : 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 3,
                        padding: '1.5px',
                        background: isActive
                          ? 'linear-gradient(135deg, #C87941, #E89B5C)'
                          : 'transparent',
                        WebkitMask:
                          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: isActive ? 1 : 0,
                        transition:
                          'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      '&.Mui-selected': {
                        background:
                          'linear-gradient(135deg, rgba(200, 121, 65, 0.95) 0%, rgba(232, 155, 92, 0.95) 100%)',
                        color: 'white',
                        boxShadow:
                          '0 6px 16px rgba(200, 121, 65, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, rgba(164, 95, 45, 0.95) 0%, rgba(200, 121, 65, 0.95) 100%)',
                          boxShadow:
                            '0 8px 20px rgba(200, 121, 65, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
                          transform: 'translateX(6px) scale(1.02)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                          transform: 'scale(1.15)',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                        },
                      },
                      '&:hover': {
                        backgroundColor: isActive
                          ? 'transparent'
                          : 'rgba(200, 121, 65, 0.1)',
                        transform: isActive
                          ? 'translateX(6px) scale(1.02)'
                          : 'translateX(3px)',
                        boxShadow: !isActive
                          ? '0 2px 8px rgba(200, 121, 65, 0.15)'
                          : undefined,
                        '& .MuiListItemIcon-root': {
                          transform: isActive ? 'scale(1.15)' : 'scale(1.08)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 42,
                        color: isActive ? 'white' : '#C87941',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Icon fontSize="medium" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.925rem',
                        color: isActive ? 'white' : '#2C1810',
                        letterSpacing: '-0.01em',
                      }}
                    />
                  </ListItemButton>
                </Fade>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={(theme) => ({
          // floating rectangular header
          top: { xs: 6, sm: 8 },
          left: { xs: 6, sm: `${drawerWidth + 8}px` },
          right: { xs: 6, sm: 8 },
          width: {
            xs: `calc(100% - 1px)`,
            sm: `calc(100% - ${drawerWidth + 12}px)`,
          },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.85)',
          color: '#2C1810',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: theme.zIndex.drawer + 30,
        })}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 68 }, px: { xs: 2, sm: 4 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              color: '#C87941',
              '&:hover': { backgroundColor: '#FFF3E6' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Real-time Clock */}
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: '1.15rem' }} />}
              label={currentTime}
              variant="outlined"
              size="medium"
              sx={{
                display: { xs: 'none', md: 'flex' },
                borderColor: 'rgba(200, 121, 65, 0.2)',
                borderWidth: '1px',
                color: '#6B4E3D',
                fontWeight: 500,
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                px: 1.5,
                height: 38,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'rgba(200, 121, 65, 0.35)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                },
                '& .MuiChip-icon': {
                  color: '#C87941',
                },
              }}
            />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0.5,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  backgroundColor: 'transparent',
                  '& .MuiAvatar-root': {
                    boxShadow:
                      '0 8px 24px rgba(200, 121, 65, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  },
                },
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  background:
                    'linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  boxShadow:
                    '0 6px 16px rgba(200, 121, 65, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.95)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.5px',
                }}
              >
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            mt: 1.5,
            borderRadius: 3,
            minWidth: 240,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(200, 121, 65, 0.1)',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '& .MuiMenuItem-root': {
              px: 3,
              py: 1.75,
              borderRadius: 2,
              mx: 1.5,
              my: 0.5,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#6B4E3D',
              fontWeight: 500,
              fontSize: '0.938rem',
              '&:hover': {
                background: 'rgba(200, 121, 65, 0.08)',
                color: '#C87941',
                transform: 'translateX(4px)',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: '1px solid rgba(200, 121, 65, 0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: '#2C1810', fontSize: '0.95rem' }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#8B7355', fontSize: '0.8rem' }}
          >
            {user?.email}
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate('/settings')}>
          <AccountCircle sx={{ mr: 1.5, color: '#C87941', fontSize: 22 }} />
          Profile Settings
        </MenuItem>
        <Divider
          sx={{ borderColor: 'rgba(200, 121, 65, 0.12)', my: 0.5, mx: 1.5 }}
        />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, color: '#C87941', fontSize: 22 }} />
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#faf6f2',
              borderRight: 'none',
              boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRight: '1px solid rgba(200, 121, 65, 0.08)',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 247, 0.9) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #FEFDFB 0%, #FFF8F0 50%, #FFFFFF 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          position: 'relative',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 68 } }} />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            mx: 'auto',
            minHeight: 'calc(100vh - 68px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

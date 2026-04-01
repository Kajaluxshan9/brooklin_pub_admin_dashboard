import React, { useState, useEffect, memo } from "react";
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
  Email as NewsletterIcon,
  Campaign as AnnouncementsIcon,
  NotificationsActive as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment-timezone";

const drawerWidth = 260;

// Isolated clock component – updates every second without re-rendering the entire layout
const ClockChip = memo(() => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = moment().tz("America/Toronto");
      setCurrentTime(now.format("MMM DD, YYYY • h:mm:ss A"));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Chip
      icon={<AccessTimeIcon sx={{ fontSize: '1rem !important' }} />}
      label={currentTime}
      variant="outlined"
      size="small"
      sx={{
        display: { xs: 'none', md: 'flex' },
        borderColor: 'rgba(200, 121, 65, 0.2)',
        color: '#6B4E3D',
        fontWeight: 500,
        fontSize: '0.813rem',
        letterSpacing: '-0.01em',
        px: 0.5,
        '& .MuiChip-icon': { color: '#C87941' },
      }}
    />
  );
});

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Menu', path: '/menu', icon: RestaurantIcon },
      { name: 'Measurements', path: '/measurements', icon: MeasurementsIcon },
      { name: 'Specials', path: '/specials', icon: SpecialsIcon },
      { name: 'Events', path: '/events', icon: EventIcon },
      { name: 'Stories', path: '/stories', icon: StoriesIcon },
      { name: 'Opening Hours', path: '/hours', icon: ScheduleIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Newsletter', path: '/newsletter', icon: NewsletterIcon },
      { name: 'Announcements', path: '/announcements', icon: AnnouncementsIcon },
      { name: 'Notifications', path: '/notifications', icon: NotificationsIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Users', path: '/users', icon: PeopleIcon },
      { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ],
  },
];

// Flat list for resolving current page name
const allNavItems = navigationGroups.flatMap((g) => g.items);

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage = allNavItems.find((item) => item.path === location.pathname);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Header */}
      <Toolbar
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(200, 121, 65, 0.1)',
          backdropFilter: 'blur(16px)',
          color: '#2D2416',
          minHeight: { xs: 56, sm: 72 },
          px: 3,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #FFF8F0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(200, 121, 65, 0.18)',
              border: '1.5px solid rgba(200, 121, 65, 0.15)',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/brooklinpub-logo.png"
              alt="Brooklin Pub"
              sx={{ height: 28, width: 46, objectFit: 'contain', display: 'block' }}
            />
          </Box>
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 800,
                fontSize: '1.1rem',
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
                color: '#A89588',
                fontWeight: 600,
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(200, 121, 65, 0.1)' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, pt: 2.5 }}>
        {navigationGroups.map((group, groupIndex) => (
          <Box key={group.label} sx={{ mb: groupIndex < navigationGroups.length - 1 ? 1 : 0 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 1.5,
                mb: 0.75,
                mt: groupIndex > 0 ? 2 : 0,
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#C4A882',
              }}
            >
              {group.label}
            </Typography>
            <List sx={{ pt: 0 }}>
              {group.items.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const fadeDelay = (groupIndex * 3 + index) * 40;

                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                    <Fade in timeout={300 + fadeDelay}>
                      <ListItemButton
                        selected={isActive}
                        onClick={() => {
                          navigate(item.path);
                          setMobileOpen(false);
                        }}
                        sx={{
                          borderRadius: 2.5,
                          minHeight: 46,
                          px: 2,
                          py: 1.25,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                            color: 'white',
                            boxShadow: '0 4px 14px rgba(200, 121, 65, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #A45F2D 0%, #C87941 100%)',
                            },
                            '& .MuiListItemIcon-root': { color: 'white' },
                          },
                          '&:hover:not(.Mui-selected)': {
                            backgroundColor: 'rgba(200, 121, 65, 0.08)',
                            transform: 'translateX(3px)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 38,
                            color: isActive ? 'white' : '#C87941',
                            transition: 'color 0.2s',
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.9rem',
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
        ))}
      </Box>

      {/* User Profile Footer */}
      <Divider sx={{ borderColor: 'rgba(200, 121, 65, 0.1)' }} />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: 'rgba(200, 121, 65, 0.04)',
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: '2px solid rgba(200, 121, 65, 0.2)',
            flexShrink: 0,
          }}
        >
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 700, color: '#2C1810', fontSize: '0.85rem', lineHeight: 1.3 }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: '#A89588', fontSize: '0.72rem', display: 'block' }}
          >
            {user?.email}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            color: '#A89588',
            flexShrink: 0,
            '&:hover': { color: '#C87941', backgroundColor: 'rgba(200, 121, 65, 0.08)' },
          }}
          title="Logout"
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={(theme) => ({
          top: { xs: 6, sm: 8 },
          left: { xs: 6, sm: `${drawerWidth + 8}px` },
          right: { xs: 6, sm: 8 },
          width: {
            xs: `calc(100% - 12px)`,
            sm: `calc(100% - ${drawerWidth + 16}px)`,
          },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.88)',
          color: '#2C1810',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: theme.zIndex.drawer + 30,
        })}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 1.5,
              display: { sm: 'none' },
              color: '#C87941',
              '&:hover': { backgroundColor: '#FFF3E6' },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Current Page Title */}
          {currentPage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: 'rgba(200, 121, 65, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C87941',
                }}
              >
                <currentPage.icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#2C1810',
                  letterSpacing: '-0.01em',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {currentPage.name}
              </Typography>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Real-time Clock */}
            <ClockChip />

            {/* Profile Avatar */}
            <IconButton
              size="small"
              aria-label="account"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0.5,
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(200, 121, 65, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(200, 121, 65, 0.4)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
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
            minWidth: 230,
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(200, 121, 65, 0.1)',
            '& .MuiMenuItem-root': {
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              mx: 1,
              my: 0.25,
              transition: 'all 0.2s ease',
              color: '#4A3728',
              fontWeight: 500,
              fontSize: '0.9rem',
              '&:hover': {
                background: 'rgba(200, 121, 65, 0.08)',
                color: '#C87941',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(200, 121, 65, 0.1)' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2C1810', fontSize: '0.9rem' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#A89588', fontSize: '0.78rem' }}>
            {user?.email}
          </Typography>
        </Box>
        <Box sx={{ py: 0.5 }}>
          <MenuItem onClick={() => navigate('/settings')}>
            <AccountCircle sx={{ mr: 1.5, color: '#C87941', fontSize: 20 }} />
            Profile Settings
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(200, 121, 65, 0.1)', mx: 1.5, my: 0.5 }} />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1.5, color: '#EF4444', fontSize: 20 }} />
            <Typography sx={{ color: '#EF4444 !important' }}>Sign Out</Typography>
          </MenuItem>
        </Box>
      </Menu>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
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
              bgcolor: '#faf7f4',
              borderRight: 'none',
              boxShadow: '4px 0 32px rgba(139, 69, 19, 0.15)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 251, 246, 0.95) 100%)',
              borderRight: '1px solid rgba(200, 121, 65, 0.08)',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            },
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
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #FEFDFB 0%, #FFF8F0 60%, #FFFFFF 100%)',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

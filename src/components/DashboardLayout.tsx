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
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment-timezone";

const drawerWidth = 280;

const navigation = [
  { name: "Dashboard", path: "/", icon: DashboardIcon },
  { name: "Menu Management", path: "/menu", icon: RestaurantIcon },
  { name: "Specials", path: "/specials", icon: SpecialsIcon },
  { name: "Events", path: "/events", icon: EventIcon },
  { name: "Opening Hours", path: "/hours", icon: ScheduleIcon },
  { name: "User Management", path: "/users", icon: PeopleIcon },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
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

  const logoStyle = {
    height: 32,
    marginRight: 8,
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E8E3DC",
          color: "#2D2416",
          minHeight: { xs: 56, sm: 64 },
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <img
            src="/brooklinpub-logo.png"
            alt="Brooklin Pub"
            style={logoStyle}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "#C87941",
              letterSpacing: "-0.01em",
            }}
          >
            The Brooklin Pub
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: "#E8DDD0" }} />
      <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#FFFFFF", p: 2 }}>
        <List sx={{ pt: 1 }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: "10px",
                    minHeight: 44,
                    px: 2,
                    py: 1.25,
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&.Mui-selected": {
                      backgroundColor: "#C87941",
                      color: "white",
                      boxShadow: "0 1px 3px 0 rgba(200, 121, 65, 0.22)",
                      "&:hover": {
                        backgroundColor: "#D4842D",
                        boxShadow: "0 4px 6px -1px rgba(200, 121, 65, 0.22)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                    },
                    "&:hover": {
                      backgroundColor: isActive ? "#D4842D" : "#FFF3E6",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "white" : "#C87941",
                      transition: "color 0.15s",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.875rem",
                      color: isActive ? "white" : "#000000",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
          color: "#2C1810",
          borderBottom: "none",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: "#C87941",
              "&:hover": { backgroundColor: "#FFF3E6" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Real-time Clock */}
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: "1rem" }} />}
              label={currentTime}
              variant="outlined"
              size="medium"
              sx={{
                display: { xs: "none", md: "flex" },
                borderColor: "#E8DDD0",
                color: "#6B5D4F",
                fontWeight: 500,
                fontSize: "0.875rem",
                backgroundColor: "#FFF8F0",
                "& .MuiChip-icon": {
                  color: "#C87941",
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
                transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "#FFF3E6",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#C87941",
                  fontWeight: 600,
                  fontSize: "0.938rem",
                  boxShadow: "0 1px 3px 0 rgba(200, 121, 65, 0.22)",
                  border: "2px solid #E8DDD0",
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
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 10px 15px rgba(200, 121, 65, 0.12))",
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8DDD0",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.25,
              borderRadius: 1.5,
              mx: 1,
              my: 0.25,
              transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              color: "#6B4E3D",
              fontWeight: 500,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: "#FFF3E6",
                color: "#C87941",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => navigate("/settings")}>
          <AccountCircle sx={{ mr: 1.5, color: "#C87941", fontSize: 20 }} />
          Profile Settings
        </MenuItem>
        <Divider sx={{ borderColor: "#E8DDD0", my: 0.5 }} />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, color: "#C87941", fontSize: 20 }} />
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
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#faf6f2",
              borderRight: "none",
              boxShadow: "0 8px 32px rgba(139, 69, 19, 0.2)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#FFFFFF",
              borderRight: "1px solid #E8DDD0",
              boxShadow:
                "0 4px 6px -1px rgba(200, 121, 65, 0.12), 0 2px 4px -1px rgba(200, 121, 65, 0.08)",
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
          minHeight: "100vh",
          bgcolor: "#FFF8F0",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: "100%",
            mx: "auto",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

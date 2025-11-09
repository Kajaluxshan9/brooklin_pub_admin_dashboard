import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
          bgcolor: "#8B4513", // Brown header
          color: "white",
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
            sx={{ fontWeight: 700, fontSize: "1.2rem" }}
          >
            Brooklin Pub
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: "#d7ccc8" }} />
      <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#faf6f2" }}>
        <List sx={{ pt: 2, px: 2 }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: 2,
                    py: 1.5,
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: "#8B4513",
                      color: "white",
                      boxShadow: "0 3px 10px rgba(139, 69, 19, 0.3)",
                      "&:hover": {
                        backgroundColor: "#A0522D",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 15px rgba(139, 69, 19, 0.4)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                    },
                    "&:hover": {
                      backgroundColor: isActive
                        ? "#A0522D"
                        : "rgba(139, 69, 19, 0.1)",
                      transform: isActive ? "translateY(-1px)" : "none",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 40, color: isActive ? "white" : "#8B4513" }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: "0.95rem",
                      color: isActive ? "white" : "#5d4037",
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
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
          color: "#3e2723",
          borderBottom: "2px solid #d7ccc8",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 10px rgba(139, 69, 19, 0.1)",
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
              color: "#8B4513",
              "&:hover": { backgroundColor: "rgba(139, 69, 19, 0.1)" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: "#8B4513",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Admin Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mr: 1,
                display: { xs: "none", md: "block" },
                fontWeight: 600,
                color: "#5d4037",
              }}
            >
              Welcome, {user?.firstName}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "rgba(139, 69, 19, 0.1)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#8B4513",
                  fontWeight: 700,
                  boxShadow: "0 3px 10px rgba(139, 69, 19, 0.3)",
                  border: "2px solid #d7ccc8",
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
            filter: "drop-shadow(0px 4px 16px rgba(139, 69, 19, 0.2))",
            mt: 1.5,
            borderRadius: 3,
            minWidth: 180,
            backgroundColor: "#faf6f2",
            border: "1px solid #d7ccc8",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              transition: "all 0.2s ease-in-out",
              color: "#5d4037",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "rgba(139, 69, 19, 0.1)",
                transform: "translateX(4px)",
                color: "#8B4513",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => navigate("/settings")}>
          <AccountCircle sx={{ mr: 1, color: "#8B4513" }} />
          Profile Settings
        </MenuItem>
        <Divider sx={{ borderColor: "#d7ccc8" }} />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1, color: "#8B4513" }} />
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
              bgcolor: "#faf6f2",
              borderRight: "2px solid #d7ccc8",
              boxShadow: "0 0 20px rgba(139, 69, 19, 0.1)",
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
          bgcolor: "#faf6f2", // Light brown background
          transition: "all 0.3s ease-in-out",
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

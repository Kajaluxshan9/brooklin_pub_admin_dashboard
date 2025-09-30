import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Star as SpecialsIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";

interface DashboardStats {
  menuItems: number;
  activeMenuItems: number;
  users: number;
  activeUsers: number;
  events: number;
  specials: number;
  todos: number;
  completedTodos: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface MenuItem {
  id: string;
  name: string;
  createdAt: string;
  isAvailable: boolean;
}

interface Special {
  id: string;
  title: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    menuItems: 0,
    activeMenuItems: 0,
    users: 0,
    activeUsers: 0,
    events: 0,
    specials: 0,
    todos: 0,
    completedTodos: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [menuCategoryData, setMenuCategoryData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // Use the new dashboard summary endpoint
      const summaryResponse = await fetch(
        "http://localhost:5000/dashboard/summary",
        {
          credentials: "include",
        }
      );

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();

        setStats({
          menuItems: summary.menu.total,
          activeMenuItems: summary.menu.active,
          users: summary.users.total,
          activeUsers: summary.users.active,
          events: summary.events.total,
          specials: summary.specials.total,
          todos: summary.todos.total,
          completedTodos: summary.todos.completed,
        });

        // Set menu category data
        const categoryColors = ["#8B4513", "#D2691E", "#B8860B", "#CD853F"];
        setMenuCategoryData(
          summary.menu.categories.map(
            (category: { name: string; itemCount: number }, index: number) => ({
              name: category.name,
              value: category.itemCount,
              color: categoryColors[index % categoryColors.length],
            })
          )
        );

        // Create recent activities from the summary data
        const activities: RecentActivity[] = [];

        if (summary.recent.menuItems?.length > 0) {
          const latestMenuItem = summary.recent.menuItems[0];
          activities.push({
            id: "menu-1",
            type: "menu",
            message: `Menu item "${latestMenuItem.name}" was added`,
            timestamp: new Date(latestMenuItem.createdAt),
          });
        }

        if (summary.recent.specials?.length > 0) {
          const latestSpecial = summary.recent.specials[0];
          activities.push({
            id: "special-1",
            type: "special",
            message: `Special "${latestSpecial.title}" was created`,
            timestamp: new Date(latestSpecial.createdAt),
          });
        }

        if (summary.recent.events?.length > 0) {
          const latestEvent = summary.recent.events[0];
          activities.push({
            id: "event-1",
            type: "event",
            message: `Event "${latestEvent.title}" was scheduled`,
            timestamp: new Date(latestEvent.startDateTime),
          });
        }

        if (summary.recent.users?.length > 0) {
          const latestUser = summary.recent.users[0];
          activities.push({
            id: "user-1",
            type: "user",
            message: `User "${latestUser.firstName} ${latestUser.lastName}" joined`,
            timestamp: new Date(latestUser.createdAt),
          });
        }

        // Add a default activity if we don't have any data
        if (activities.length === 0) {
          activities.push({
            id: "1",
            type: "system",
            message: "Dashboard loaded successfully",
            timestamp: new Date(),
          });
        }

        setRecentActivities(activities);
      } else {
        // Fallback to individual API calls if summary endpoint fails
        await loadDashboardDataFallback();
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      await loadDashboardDataFallback();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadDashboardDataFallback = async () => {
    try {
      // Fetch menu items
      const menuItemsResponse = await fetch(
        "http://localhost:5000/menu/items",
        {
          credentials: "include",
        }
      );
      const menuItems: MenuItem[] = menuItemsResponse.ok
        ? await menuItemsResponse.json()
        : [];

      // Fetch specials
      const specialsResponse = await fetch("http://localhost:5000/specials", {
        credentials: "include",
      });
      const specials: Special[] = specialsResponse.ok
        ? await specialsResponse.json()
        : [];

      // Fetch users
      const usersResponse = await fetch("http://localhost:5000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const users = usersResponse.ok ? await usersResponse.json() : [];

      // Fetch events
      const eventsResponse = await fetch("http://localhost:5000/events", {
        credentials: "include",
      });
      const events = eventsResponse.ok ? await eventsResponse.json() : [];

      // Fetch todos
      const todosResponse = await fetch("http://localhost:5000/todos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const todos = todosResponse.ok ? await todosResponse.json() : [];

      setStats({
        menuItems: menuItems.length,
        activeMenuItems: menuItems.filter((item: MenuItem) => item.isAvailable)
          .length,
        users: users.length,
        activeUsers: users.filter(
          (user: { isActive: boolean }) => user.isActive
        ).length,
        events: events.length,
        specials: specials.length,
        todos: todos.length,
        completedTodos: todos.filter(
          (todo: { status: string }) => todo.status === "completed"
        ).length,
      });

      // Fetch menu categories
      const categoriesResponse = await fetch(
        "http://localhost:5000/menu/categories",
        {
          credentials: "include",
        }
      );
      const categories = categoriesResponse.ok
        ? await categoriesResponse.json()
        : [];

      const categoryColors = ["#8B4513", "#D2691E", "#B8860B", "#CD853F"];
      setMenuCategoryData(
        categories.map(
          (
            category: { name: string; menuItems: MenuItem[] },
            index: number
          ) => ({
            name: category.name,
            value: category.menuItems?.length || 0,
            color: categoryColors[index % categoryColors.length],
          })
        )
      );

      // For recent activities, we'll create some based on actual data
      const activities: RecentActivity[] = [];

      if (menuItems.length > 0) {
        const latestMenuItem = menuItems.sort(
          (a: MenuItem, b: MenuItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        activities.push({
          id: "1",
          type: "menu",
          message: `Menu item "${latestMenuItem.name}" was added`,
          timestamp: new Date(latestMenuItem.createdAt),
        });
      }

      if (specials.length > 0) {
        const latestSpecial = specials.sort(
          (a: Special, b: Special) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        activities.push({
          id: "2",
          type: "special",
          message: `Special "${latestSpecial.title}" was created`,
          timestamp: new Date(latestSpecial.createdAt),
        });
      }

      // Add a default activity if we don't have any data
      if (activities.length === 0) {
        activities.push({
          id: "1",
          type: "system",
          message: "Dashboard loaded successfully",
          timestamp: new Date(),
        });
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const statsCards = [
    {
      title: "Menu Items",
      value: stats.activeMenuItems,
      total: stats.menuItems,
      icon: RestaurantIcon,
      color: "#8B4513",
      progress: (stats.activeMenuItems / stats.menuItems) * 100,
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      total: stats.users,
      icon: PeopleIcon,
      color: "#D2691E",
      progress: (stats.activeUsers / stats.users) * 100,
    },
    {
      title: "Upcoming Events",
      value: stats.events,
      total: stats.events,
      icon: EventIcon,
      color: "#B8860B",
      progress: 100,
    },
    {
      title: "Active Specials",
      value: stats.specials,
      total: stats.specials,
      icon: SpecialsIcon,
      color: "#CD853F",
      progress: 100,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <LinearProgress
          sx={{ width: "100%", maxWidth: 400, borderRadius: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            mb: 1,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Welcome back! Here's what's happening at Brooklin Pub today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.title}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "none",
                  background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}15 100%)`,
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px ${card.color}20`,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${card.color}, ${card.color}80)`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${card.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: card.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "1.1rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: card.color,
                        fontSize: { xs: "2rem", sm: "2.5rem" },
                        lineHeight: 1,
                        mb: 0.5,
                      }}
                    >
                      {card.value.toLocaleString()}
                    </Typography>
                    {card.total > 0 && card.value !== card.total && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      >
                        of {card.total.toLocaleString()} total
                      </Typography>
                    )}
                  </Box>

                  {card.progress !== undefined && card.progress < 100 && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(card.progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${card.color}20`,
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            backgroundColor: card.color,
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Content Sections */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Recent Activity & Quick Actions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              height: "fit-content",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              Recent Activity
            </Typography>
            <List>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      px: 0,
                      py: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      {activity.type === "menu" && (
                        <RestaurantIcon sx={{ color: "primary.main" }} />
                      )}
                      {activity.type === "user" && (
                        <PeopleIcon sx={{ color: "secondary.main" }} />
                      )}
                      {activity.type === "event" && (
                        <EventIcon sx={{ color: "warning.main" }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ fontWeight: 500, color: "text.primary" }}
                        >
                          {activity.message}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                        >
                          {moment(activity.timestamp).fromNow()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ px: 0, py: 4, textAlign: "center" }}>
                  <ListItemText
                    primary={
                      <Typography color="text.secondary">
                        No recent activity to display
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions & Menu Categories */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Quick Actions */}
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      fontSize: "1.25rem",
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RestaurantIcon />}
                        href="/menu"
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Add Menu Item
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EventIcon />}
                        href="/events"
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Create Event
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<SpecialsIcon />}
                        href="/specials"
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Add Special
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PeopleIcon />}
                        href="/users"
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Add User
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Menu Categories */}
            {menuCategoryData.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        fontSize: "1.25rem",
                      }}
                    >
                      Menu Categories
                    </Typography>
                    <Box>
                      {menuCategoryData.map((category) => (
                        <Box key={category.name} sx={{ mb: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {category.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.secondary" }}
                            >
                              {category.value} items
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              category.value > 0
                                ? Math.min((category.value / 20) * 100, 100)
                                : 0
                            }
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: `${category.color}15`,
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: category.color,
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

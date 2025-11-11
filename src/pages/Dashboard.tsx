import React, { useEffect, useState, useCallback } from "react";
import { api } from "../utils/api";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Chip,
  IconButton,
  Checkbox,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Star as SpecialsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from "../components/common/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import { ActionButtons } from "../components/common/ActionButtons";

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

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: Date;
  createdAt: Date;
}

// User interface removed (unused)

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoDialog, setTodoDialog] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoForm, setTodoForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "pending" as "pending" | "in_progress" | "completed" | "cancelled",
    dueDate: "",
  });

  const loadDashboardData = useCallback(async () => {
    try {
      // Use the new dashboard summary endpoint
      const summaryResponse = await api.get("/dashboard/summary");
      if (summaryResponse.status === 200) {
        const summary = summaryResponse.data;

        setStats({
          menuItems: summary.menu.total,
          activeMenuItems: summary.menu.active,
          users: summary.users.total,
          activeUsers: summary.users.active,
          events: summary.events.upcoming,
          specials: summary.specials.total,
          todos: summary.todos.total,
          completedTodos: summary.todos.completed,
        });

        // Set menu category data
        const categoryColors = ["#C87941", "#D4842D", "#E49B5F", "#F5A94C"];
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

  const loadDashboardDataFallback = async () => {
    try {
      // Fetch menu items
      const menuItemsResponse = await api.get("/menu/items");
      const menuItems: MenuItem[] =
        menuItemsResponse.status === 200 ? menuItemsResponse.data : [];

      // Fetch specials
      const specialsResponse = await api.get("/specials");
      const specials: Special[] =
        specialsResponse.status === 200 ? specialsResponse.data : [];

      // Fetch users
      const usersResponse = await api.get("/users");
      const users = usersResponse.status === 200 ? usersResponse.data : [];

      // Fetch events
      const eventsResponse = await api.get("/events");
      const events = eventsResponse.status === 200 ? eventsResponse.data : [];

      // Fetch todos
      const todosResponse = await api.get("/todos");
      const todos = todosResponse.status === 200 ? todosResponse.data : [];

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
      const categoriesResponse = await api.get("/menu/categories");
      const categories =
        categoriesResponse.status === 200 ? categoriesResponse.data : [];

      const categoryColors = ["#C87941", "#D4842D", "#E49B5F", "#F5A94C"];
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

  const loadTodos = async () => {
    try {
      const response = await api.get("/todos");
      if (response.status === 200) {
        setTodos(response.data || []);
      }
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadTodos();
  }, [loadDashboardData]);

  const handleCreateTodo = () => {
    setSelectedTodo(null);
    setTodoForm({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
    });
    setTodoDialog(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      dueDate: todo.dueDate ? moment(todo.dueDate).format("YYYY-MM-DD") : "",
    });
    setTodoDialog(true);
  };

  const handleSaveTodo = async () => {
    try {
      const todoData = {
        ...todoForm,
        dueDate: todoForm.dueDate
          ? new Date(todoForm.dueDate).toISOString()
          : null,
      };

      let response;
      if (selectedTodo) {
        response = await api.patch(`/todos/${selectedTodo.id}`, todoData);
      } else {
        response = await api.post(`/todos`, todoData);
      }

      if (response.status === 200 || response.status === 201) {
        setTodoDialog(false);
        await loadTodos();
        await loadDashboardData();
      } else {
        alert("Failed to save todo. Please try again.");
      }
    } catch (error) {
      console.error("Error saving todo:", error);
      alert("Error saving todo. Please try again.");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      try {
        const response = await api.delete(`/todos/${id}`);
        if (response.status === 200) {
          await loadTodos();
          await loadDashboardData();
        } else {
          alert("Failed to delete todo. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting todo:", error);
        alert("Error deleting todo. Please try again.");
      }
    }
  };

  const handleToggleTodoStatus = async (todo: Todo) => {
    try {
      // Use the dedicated toggle endpoint to flip completion state
      const response = await api.patch(`/todos/${todo.id}/toggle-complete`);

      if (response.status === 200) {
        await loadTodos();
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  const getPriorityColor = (
    priority: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  // Updated order: Menu Items, Menu Categories, Upcoming Events, Active Specials, Active Users
  const statsCards = [
    {
      title: "Menu Items",
      value: stats.activeMenuItems,
      total: stats.menuItems,
      icon: RestaurantIcon,
      color: "#C87941",
      progress:
        stats.menuItems > 0
          ? (stats.activeMenuItems / stats.menuItems) * 100
          : 0,
      path: "/menu",
    },
    {
      title: "Menu Categories",
      value: menuCategoryData.length,
      total: menuCategoryData.length,
      icon: RestaurantIcon,
      color: "#D4842D",
      progress: 100,
      path: "/menu",
    },
    {
      title: "Upcoming Events",
      value: stats.events,
      total: stats.events,
      icon: EventIcon,
      color: "#E49B5F",
      progress: 100,
      path: "/events",
    },
    {
      title: "Active Specials",
      value: stats.specials,
      total: stats.specials,
      icon: SpecialsIcon,
      color: "#F5A94C",
      progress: 100,
      path: "/specials",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      total: stats.users,
      icon: PeopleIcon,
      color: "#A68B65",
      progress: stats.users > 0 ? (stats.activeUsers / stats.users) * 100 : 0,
      path: "/users",
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
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        backgroundColor: "transparent",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <PageHeader
        title={`Welcome, ${user?.firstName || 'Admin'}!`}
        subtitle="Here's what's happening at Brooklin Pub today."
      />

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 4 }}>
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={card.title}>
              <Card
                onClick={() => navigate(card.path)}
                sx={{
                  height: "100%",
                  borderRadius: 2.5,
                  border: "1px solid #E8E3DC",
                  background: "white",
                  boxShadow:
                    "0 1px 3px 0 rgba(212, 165, 116, 0.1), 0 1px 2px 0 rgba(212, 165, 116, 0.06)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 10px 15px -3px rgba(200, 121, 65, 0.12), 0 4px 6px -2px rgba(200, 121, 65, 0.08)",
                    borderColor: "#C87941",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${card.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: card.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#6B5D4F",
                          fontSize: "0.813rem",
                          lineHeight: 1.3,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#2D2416",
                        fontSize: { xs: "1.75rem", sm: "2rem" },
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
                          color: "#AFA69A",
                          fontWeight: 400,
                          fontSize: "0.813rem",
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
                        <Typography
                          variant="body2"
                          sx={{ color: "#5d4037", fontWeight: 600 }}
                        >
                          Progress
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#5d4037", fontWeight: 600 }}
                        >
                          {Math.round(card.progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(139, 69, 19, 0.2)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
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
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2.5,
              height: "fit-content",
              backgroundColor: "white",
              boxShadow:
                "0 1px 3px 0 rgba(212, 165, 116, 0.1), 0 1px 2px 0 rgba(212, 165, 116, 0.06)",
              border: "1px solid #E8E3DC",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "#2D2416",
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
                      borderColor: "#d7ccc8",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      {activity.type === "menu" && (
                        <RestaurantIcon sx={{ color: "#C87941" }} />
                      )}
                      {activity.type === "user" && (
                        <PeopleIcon sx={{ color: "#D4842D" }} />
                      )}
                      {activity.type === "event" && (
                        <EventIcon sx={{ color: "#E49B5F" }} />
                      )}
                      {activity.type === "special" && (
                        <SpecialsIcon sx={{ color: "#F5A94C" }} />
                      )}
                      {activity.type === "system" && (
                        <CheckCircleIcon sx={{ color: "#E8B67D" }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: "#3e2723" }}>
                          {activity.message}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{ color: "#5d4037", fontSize: "0.875rem" }}
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
                      <Typography color="#6d4c41">
                        No recent activity to display
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Todo List Section */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(139, 69, 19, 0.15)",
              border: "1px solid #d7ccc8",
              backgroundColor: "white",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#C87941",
                  }}
                >
                  Tasks & To-Do
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="small"
                  onClick={handleCreateTodo}
                  sx={{
                    backgroundColor: "#C87941",
                    "&:hover": { backgroundColor: "#A45F2D" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Add Task
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                      Total Tasks
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: "#3e2723" }}
                    >
                      {stats.todos}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                      Completed
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: "#4caf50" }}
                    >
                      {stats.completedTodos}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                      Pending
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: "#C87941" }}
                    >
                      {stats.todos - stats.completedTodos}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    stats.todos > 0
                      ? (stats.completedTodos / stats.todos) * 100
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(200, 121, 65, 0.2)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#C87941",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {todos.length > 0 ? (
                  todos
                    .filter((todo) => todo.status !== "completed")
                    .slice(0, 5)
                    .map((todo) => (
                      <ListItem
                        key={todo.id}
                        sx={{
                          px: 0,
                          py: 2,
                          borderBottom: "1px solid #d7ccc8",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={todo.status === "completed"}
                            onChange={() => handleToggleTodoStatus(todo)}
                            icon={<UncheckedIcon />}
                            checkedIcon={<CheckCircleIcon />}
                            sx={{
                              color: "#C87941",
                              "&.Mui-checked": {
                                color: "#C87941",
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  color: "#3e2723",
                                  textDecoration:
                                    todo.status === "completed"
                                      ? "line-through"
                                      : "none",
                                }}
                              >
                                {todo.title}
                              </Typography>
                              <StatusChip
                                status={
                                  todo.priority === "urgent"
                                    ? "error"
                                    : todo.priority === "high"
                                    ? "warning"
                                    : todo.priority === "medium"
                                    ? "info"
                                    : "success"
                                }
                                label={todo.priority}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            todo.dueDate && (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <ScheduleIcon
                                  sx={{
                                    fontSize: 14,
                                    mr: 0.5,
                                    color: "#6d4c41",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6d4c41" }}
                                >
                                  {moment(todo.dueDate).format("MMM DD, YYYY")}
                                </Typography>
                              </Box>
                            )
                          }
                        />
                        <ActionButtons
                          size="small"
                          onEdit={() => handleEditTodo(todo)}
                          onDelete={() => handleDeleteTodo(todo.id)}
                        />
                      </ListItem>
                    ))
                ) : (
                  <ListItem sx={{ px: 0, py: 4, textAlign: "center" }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: "#6d4c41" }}>
                          No tasks yet. Create your first task!
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Todo Dialog */}
      <Dialog
        open={todoDialog}
        onClose={() => setTodoDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid #d7ccc8",
          },
        }}
      >
        <DialogTitle sx={{ color: "#C87941", fontWeight: 600 }}>
          {selectedTodo ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title"
                value={todoForm.title}
                onChange={(e) =>
                  setTodoForm({ ...todoForm, title: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#C87941",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C87941",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C87941",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={todoForm.description}
                onChange={(e) =>
                  setTodoForm({ ...todoForm, description: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#C87941",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C87941",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C87941",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ "&.Mui-focused": { color: "#C87941" } }}>
                  Priority
                </InputLabel>
                <Select
                  value={todoForm.priority}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      priority: e.target.value as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent",
                    })
                  }
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C87941",
                    },
                  }}
                >
                  <SelectMenuItem value="low">Low</SelectMenuItem>
                  <SelectMenuItem value="medium">Medium</SelectMenuItem>
                  <SelectMenuItem value="high">High</SelectMenuItem>
                  <SelectMenuItem value="urgent">Urgent</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ "&.Mui-focused": { color: "#C87941" } }}>
                  Status
                </InputLabel>
                <Select
                  value={todoForm.status}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      status: e.target.value as
                        | "pending"
                        | "in_progress"
                        | "completed"
                        | "cancelled",
                    })
                  }
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C87941",
                    },
                  }}
                >
                  <SelectMenuItem value="pending">Pending</SelectMenuItem>
                  <SelectMenuItem value="in_progress">
                    In Progress
                  </SelectMenuItem>
                  <SelectMenuItem value="completed">Completed</SelectMenuItem>
                  <SelectMenuItem value="cancelled">Cancelled</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={todoForm.dueDate}
                onChange={(e) =>
                  setTodoForm({ ...todoForm, dueDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#C87941",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#C87941",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#C87941",
                  },
                }}
              />
            </Grid>
            {/* Assign To removed - todos are admin reminders */}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setTodoDialog(false)}
            sx={{
              color: "#6d4c41",
              "&:hover": {
                backgroundColor: "rgba(109, 76, 65, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTodo}
            sx={{
              backgroundColor: "#C87941",
              "&:hover": { backgroundColor: "#A45F2D" },
              fontWeight: 600,
            }}
          >
            {selectedTodo ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

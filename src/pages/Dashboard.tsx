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
  Checkbox,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Star as SpecialsIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
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
      const menuItemsResponse = await api.get('/menu/items');
      const menuItems: MenuItem[] =
        menuItemsResponse.status === 200 ? menuItemsResponse.data : [];

      // Fetch specials
      const specialsResponse = await api.get('/specials');
      const specials: Special[] =
        specialsResponse.status === 200 ? specialsResponse.data : [];

      // Fetch users
      const usersResponse = await api.get('/users');
      const allUsers = usersResponse.status === 200 ? usersResponse.data : [];
      const users =
        user?.role === 'super_admin'
          ? allUsers
          : allUsers.filter((u: any) => u.role !== 'super_admin');

      // Fetch events
      const eventsResponse = await api.get('/events');
      const events = eventsResponse.status === 200 ? eventsResponse.data : [];

      // Fetch todos
      const todosResponse = await api.get('/todos');
      const todos = todosResponse.status === 200 ? todosResponse.data : [];

      setStats({
        menuItems: menuItems.length,
        activeMenuItems: menuItems.filter((item: MenuItem) => item.isAvailable)
          .length,
        users: users.length,
        activeUsers: users.filter(
          (user: { isActive: boolean }) => user.isActive,
        ).length,
        events: events.length,
        specials: specials.length,
        todos: todos.length,
        completedTodos: todos.filter(
          (todo: { status: string }) => todo.status === 'completed',
        ).length,
      });

      // Fetch menu categories
      const categoriesResponse = await api.get('/menu/categories');
      const categories =
        categoriesResponse.status === 200 ? categoriesResponse.data : [];

      const categoryColors = ['#C87941', '#D4842D', '#E49B5F', '#F5A94C'];
      setMenuCategoryData(
        categories.map(
          (
            category: { name: string; menuItems: MenuItem[] },
            index: number,
          ) => ({
            name: category.name,
            value: category.menuItems?.length || 0,
            color: categoryColors[index % categoryColors.length],
          }),
        ),
      );

      // For recent activities, we'll create some based on actual data
      const activities: RecentActivity[] = [];

      if (menuItems.length > 0) {
        const latestMenuItem = menuItems.sort(
          (a: MenuItem, b: MenuItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        activities.push({
          id: '1',
          type: 'menu',
          message: `Menu item "${latestMenuItem.name}" was added`,
          timestamp: new Date(latestMenuItem.createdAt),
        });
      }

      if (specials.length > 0) {
        const latestSpecial = specials.sort(
          (a: Special, b: Special) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        activities.push({
          id: '2',
          type: 'special',
          message: `Special "${latestSpecial.title}" was created`,
          timestamp: new Date(latestSpecial.createdAt),
        });
      }

      // Add a default activity if we don't have any data
      if (activities.length === 0) {
        activities.push({
          id: '1',
          type: 'system',
          message: 'Dashboard loaded successfully',
          timestamp: new Date(),
        });
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadTodos = async () => {
    try {
      const response = await api.get('/todos');
      if (response.status === 200) {
        setTodos(response.data || []);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadTodos();
  }, [loadDashboardData]);

  const handleCreateTodo = () => {
    setSelectedTodo(null);
    setTodoForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
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
      dueDate: todo.dueDate ? moment(todo.dueDate).format('YYYY-MM-DD') : '',
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
        alert('Failed to save todo. Please try again.');
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Error saving todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        const response = await api.delete(`/todos/${id}`);
        if (response.status === 200) {
          await loadTodos();
          await loadDashboardData();
        } else {
          alert('Failed to delete todo. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting todo. Please try again.');
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
      console.error('Error updating todo status:', error);
    }
  };

  // const getPriorityColor = (
  //   priority: string
  // ):
  //   | "default"
  //   | "primary"
  //   | "secondary"
  //   | "error"
  //   | "info"
  //   | "success"
  //   | "warning" => {
  //   switch (priority) {
  //     case "urgent":
  //       return "error";
  //     case "high":
  //       return "warning";
  //     case "medium":
  //       return "info";
  //     case "low":
  //       return "success";
  //     default:
  //       return "default";
  //   }
  // };

  // Updated order: Menu Items, Menu Categories, Upcoming Events, Active Specials, Active Users
  const statsCards = [
    {
      title: 'Menu Items',
      value: stats.activeMenuItems,
      total: stats.menuItems,
      icon: RestaurantIcon,
      color: '#C87941',
      progress:
        stats.menuItems > 0
          ? (stats.activeMenuItems / stats.menuItems) * 100
          : 0,
      path: '/menu',
    },
    {
      title: 'Menu Categories',
      value: menuCategoryData.length,
      total: menuCategoryData.length,
      icon: RestaurantIcon,
      color: '#D4842D',
      progress: 100,
      path: '/menu',
    },
    {
      title: 'Upcoming Events',
      value: stats.events,
      total: stats.events,
      icon: EventIcon,
      color: '#E49B5F',
      progress: 100,
      path: '/events',
    },
    {
      title: 'Active Specials',
      value: stats.specials,
      total: stats.specials,
      icon: SpecialsIcon,
      color: '#F5A94C',
      progress: 100,
      path: '/specials',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      total: stats.users,
      icon: PeopleIcon,
      color: '#A68B65',
      progress: stats.users > 0 ? (stats.activeUsers / stats.users) * 100 : 0,
      path: '/users',
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <LinearProgress
          sx={{ width: '100%', maxWidth: 400, borderRadius: 1 }}
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
        width: '100%',
        maxWidth: '100%',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        minHeight: '100vh',
        backgroundColor: 'transparent',
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
                  height: '100%',
                  borderRadius: 4,
                  border: '2px solid',
                  borderColor: `${card.color}20`,
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${card.color}08 50%, rgba(255, 255, 255, 0.98) 100%)`,
                  boxShadow: `0 8px 20px ${card.color}18, 0 4px 8px ${card.color}12, inset 0 1px 2px rgba(255, 255, 255, 0.8)`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: `linear-gradient(90deg, transparent 0%, ${card.color} 20%, ${card.color}CC 50%, ${card.color} 80%, transparent 100%)`,
                    borderRadius: '16px 16px 0 0',
                    boxShadow: `0 2px 8px ${card.color}40`,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: `linear-gradient(135deg, ${card.color}40, ${card.color}20)`,
                    borderRadius: 4,
                    opacity: 0,
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: -1,
                  },
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: `0 16px 40px ${card.color}30, 0 8px 20px ${card.color}20, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
                    borderColor: card.color,
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${card.color}15 50%, rgba(255, 255, 255, 0.98) 100%)`,
                  },
                  '&:hover::after': {
                    opacity: 1,
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.01)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${card.color}25 0%, ${card.color}15 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                        border: `1.5px solid ${card.color}30`,
                        boxShadow: `0 2px 8px ${card.color}12`,
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 28,
                          color: card.color,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          background: `linear-gradient(135deg, #6B4E3D 0%, ${card.color} 70%, ${card.color}CC 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          textShadow: `0 1px 2px ${card.color}20`,
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
                        color: '#2D2416',
                        fontSize: { xs: '1.75rem', sm: '2rem' },
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
                          color: '#AFA69A',
                          fontWeight: 400,
                          fontSize: '0.813rem',
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
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: '#5d4037', fontWeight: 600 }}
                        >
                          Progress
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#5d4037', fontWeight: 600 }}
                        >
                          {Math.round(card.progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: `${card.color}12`,
                          border: `1.5px solid ${card.color}25`,
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: `inset 0 2px 4px ${card.color}10`,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${card.color}DD 0%, ${card.color} 50%, ${card.color}DD 100%)`,
                            boxShadow: `0 0 12px ${card.color}50, inset 0 1px 2px rgba(255, 255, 255, 0.3)`,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '50%',
                              background:
                                'linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent)',
                              borderRadius: '5px 5px 0 0',
                            },
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
              p: 0,
              borderRadius: 4,
              height: 'fit-content',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow:
                '0 8px 24px rgba(200, 121, 65, 0.15), 0 4px 12px rgba(200, 121, 65, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
              border: '2px solid',
              borderColor: 'rgba(200, 121, 65, 0.2)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow:
                  '0 12px 32px rgba(200, 121, 65, 0.2), 0 6px 16px rgba(200, 121, 65, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                p: 3.5,
                background:
                  'linear-gradient(135deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 70%)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Recent Activity
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <List>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ListItem
                      key={activity.id}
                      sx={{
                        px: 2,
                        py: 2,
                        borderRadius: 2,
                        mb: 1,
                        border: '1px solid rgba(200, 121, 65, 0.08)',
                        background: 'rgba(200, 121, 65, 0.02)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, rgba(200, 121, 65, 0.08) 0%, rgba(232, 155, 92, 0.08) 100%)',
                          borderColor: 'rgba(200, 121, 65, 0.2)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(200, 121, 65, 0.12)',
                        },
                        '&:last-child': {
                          mb: 0,
                        },
                      }}
                    >
                      <ListItemIcon>
                        {activity.type === 'menu' && (
                          <RestaurantIcon sx={{ color: '#C87941' }} />
                        )}
                        {activity.type === 'user' && (
                          <PeopleIcon sx={{ color: '#D4842D' }} />
                        )}
                        {activity.type === 'event' && (
                          <EventIcon sx={{ color: '#E49B5F' }} />
                        )}
                        {activity.type === 'special' && (
                          <SpecialsIcon sx={{ color: '#F5A94C' }} />
                        )}
                        {activity.type === 'system' && (
                          <CheckCircleIcon sx={{ color: '#E8B67D' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ fontWeight: 500, color: '#3e2723' }}
                          >
                            {activity.message}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{ color: '#5d4037', fontSize: '0.875rem' }}
                          >
                            {moment(activity.timestamp).fromNow()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ px: 0, py: 4, textAlign: 'center' }}>
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
            </Box>
          </Paper>
        </Grid>

        {/* Todo List Section */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(200, 121, 65, 0.12)',
              border: '2px solid',
              borderColor: 'rgba(200, 121, 65, 0.15)',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Add Task
                </Button>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background:
                        'linear-gradient(135deg, rgba(200, 121, 65, 0.08) 0%, rgba(200, 121, 65, 0.04) 100%)',
                      border: '1.5px solid rgba(200, 121, 65, 0.15)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#8B6F47', fontWeight: 600, mb: 0.5 }}
                    >
                      Total Tasks
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: '#3e2723' }}
                    >
                      {stats.todos}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background:
                        'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%)',
                      border: '1.5px solid rgba(76, 175, 80, 0.2)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#2E7D32', fontWeight: 600, mb: 0.5 }}
                    >
                      Completed
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: '#4caf50' }}
                    >
                      {stats.completedTodos}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background:
                        'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.04) 100%)',
                      border: '1.5px solid rgba(255, 152, 0, 0.2)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#E65100', fontWeight: 600, mb: 0.5 }}
                    >
                      Pending
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: '#FF9800' }}
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
                    backgroundColor: 'rgba(200, 121, 65, 0.15)',
                    border: '1px solid rgba(200, 121, 65, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background:
                        'linear-gradient(90deg, #C87941 0%, #E89B5C 100%)',
                      borderRadius: 4,
                      boxShadow: '0 0 8px rgba(200, 121, 65, 0.4)',
                    },
                  }}
                />
              </Box>

              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {todos.length > 0 ? (
                  todos
                    .filter((todo) => todo.status !== 'completed')
                    .slice(0, 5)
                    .map((todo) => (
                      <ListItem
                        key={todo.id}
                        sx={{
                          px: 2,
                          py: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1.5px solid rgba(200, 121, 65, 0.12)',
                          background:
                            'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(200, 121, 65, 0.03) 100%)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: 'rgba(200, 121, 65, 0.3)',
                            background:
                              'linear-gradient(135deg, #ffffff 0%, rgba(200, 121, 65, 0.08) 100%)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(200, 121, 65, 0.12)',
                          },
                          '&:last-child': { mb: 0 },
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={todo.status === 'completed'}
                            onChange={() => handleToggleTodoStatus(todo)}
                            icon={<UncheckedIcon />}
                            checkedIcon={<CheckCircleIcon />}
                            sx={{
                              color: '#C87941',
                              '&.Mui-checked': {
                                color: '#C87941',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  color: '#3e2723',
                                  textDecoration:
                                    todo.status === 'completed'
                                      ? 'line-through'
                                      : 'none',
                                }}
                              >
                                {todo.title}
                              </Typography>
                              <StatusChip
                                status={
                                  todo.priority === 'urgent'
                                    ? 'error'
                                    : todo.priority === 'high'
                                    ? 'warning'
                                    : todo.priority === 'medium'
                                    ? 'info'
                                    : 'success'
                                }
                                label={todo.priority}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            todo.dueDate && (
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <ScheduleIcon
                                  sx={{
                                    fontSize: 14,
                                    mr: 0.5,
                                    color: '#6d4c41',
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#6d4c41' }}
                                >
                                  {moment(todo.dueDate).format('MMM DD, YYYY')}
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
                  <ListItem sx={{ px: 0, py: 4, textAlign: 'center' }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: '#6d4c41' }}>
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
            border: '1px solid #d7ccc8',
          },
        }}
      >
        <DialogTitle sx={{ color: '#C87941', fontWeight: 600 }}>
          {selectedTodo ? 'Edit Task' : 'Create New Task'}
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
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#C87941',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C87941',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#C87941',
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
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#C87941',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C87941',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#C87941',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#C87941' } }}>
                  Priority
                </InputLabel>
                <Select
                  value={todoForm.priority}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      priority: e.target.value as
                        | 'low'
                        | 'medium'
                        | 'high'
                        | 'urgent',
                    })
                  }
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#C87941',
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
                <InputLabel sx={{ '&.Mui-focused': { color: '#C87941' } }}>
                  Status
                </InputLabel>
                <Select
                  value={todoForm.status}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      status: e.target.value as
                        | 'pending'
                        | 'in_progress'
                        | 'completed'
                        | 'cancelled',
                    })
                  }
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#C87941',
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
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#C87941',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C87941',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#C87941',
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
              color: '#6d4c41',
              '&:hover': {
                backgroundColor: 'rgba(109, 76, 65, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTodo}
            sx={{
              backgroundColor: '#C87941',
              '&:hover': { backgroundColor: '#A45F2D' },
              fontWeight: 600,
            }}
          >
            {selectedTodo ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

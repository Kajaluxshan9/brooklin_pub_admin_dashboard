import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";

const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

type PriorityValue = (typeof Priority)[keyof typeof Priority];

const TodoStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

type TodoStatusValue = (typeof TodoStatus)[keyof typeof TodoStatus];

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: PriorityValue;
  status: TodoStatusValue;
  createdUserId: string;
  createdUserName: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const TodoManagement: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoForm, setTodoForm] = useState<{
    title: string;
    description: string;
    priority: PriorityValue;
    status: TodoStatusValue;

    dueDate: string;
  }>({
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    status: TodoStatus.PENDING,
    dueDate: "",
  });

  useEffect(() => {
    loadTodos();
  }, []);

  // users and assign-to removed - todos are admin reminders

  const loadTodos = async () => {
    try {
      const response = await api.get("/todos");
      setTodos(response.data || []);
    } catch (error) {
      console.error("Error loading todos:", error);
      setTodos([]);
    }
  };

  const handleCreate = () => {
    setSelectedTodo(null);
    setTodoForm({
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      status: TodoStatus.PENDING,
      dueDate: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,

      dueDate: todo.dueDate ? moment(todo.dueDate).format("YYYY-MM-DD") : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
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
        response = await api.post("/todos", todoData);
      }

      if (response.status === 201 || response.status === 200) {
        await loadTodos();
        setDialogOpen(false);
      } else {
        console.error("Failed to save todo");
      }
    } catch (error) {
      console.error("Error saving todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      try {
        const response = await api.delete(`/todos/${id}`);
        if (response.status === 200) {
          await loadTodos();
        } else {
          console.error("Failed to delete todo");
        }
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const response = await api.patch(`/todos/${id}/toggle-complete`);
      if (response.status === 200) {
        await loadTodos();
      } else {
        console.error("Failed to toggle todo completion");
      }
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getPriorityColor = (priority: PriorityValue) => {
    switch (priority) {
      case Priority.URGENT:
        return "error";
      case Priority.HIGH:
        return "warning";
      case Priority.MEDIUM:
        return "info";
      case Priority.LOW:
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: TodoStatusValue) => {
    switch (status) {
      case TodoStatus.COMPLETED:
        return "success";
      case TodoStatus.IN_PROGRESS:
        return "warning";
      case TodoStatus.PENDING:
        return "info";
      case TodoStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.dueDate || todo.status === TodoStatus.COMPLETED) return false;
    return moment(todo.dueDate).isBefore(moment(), "day");
  };

  const filteredTodos = todos.filter((todo) => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Pending
        return todo.status === TodoStatus.PENDING;
      case 2: // In Progress
        return todo.status === TodoStatus.IN_PROGRESS;
      case 3: // Completed
        return todo.status === TodoStatus.COMPLETED;
      default:
        return true;
    }
  });

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(
      (t) => t.status === TodoStatus.COMPLETED
    ).length;
    const pending = todos.filter((t) => t.status === TodoStatus.PENDING).length;
    const inProgress = todos.filter(
      (t) => t.status === TodoStatus.IN_PROGRESS
    ).length;
    const overdue = todos.filter((t) => isOverdue(t)).length;

    return { total, completed, pending, inProgress, overdue };
  };

  const stats = getStats();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Todo Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            backgroundColor: "#8B4513",
            "&:hover": { backgroundColor: "#A0522D" },
          }}
        >
          Add Todo
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography color="textSecondary">Total</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="info.main">
              {stats.pending}
            </Typography>
            <Typography color="textSecondary">Pending</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="warning.main">
              {stats.inProgress}
            </Typography>
            <Typography color="textSecondary">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="success.main">
              {stats.completed}
            </Typography>
            <Typography color="textSecondary">Completed</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="error.main">
              {stats.overdue}
            </Typography>
            <Typography color="textSecondary">Overdue</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          Overall Progress: {stats.completed} of {stats.total} completed (
          {((stats.completed / stats.total) * 100).toFixed(0)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(stats.completed / stats.total) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`All (${todos.length})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`In Progress (${stats.inProgress})`} />
          <Tab label={`Completed (${stats.completed})`} />
        </Tabs>
      </Paper>

      {/* Todo List */}
      <Grid container spacing={2}>
        {filteredTodos.map((todo) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={todo.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: todo.status === TodoStatus.COMPLETED ? 0.7 : 1,
                border: isOverdue(todo) ? "2px solid #f44336" : "none",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleComplete(todo.id)}
                      sx={{ mr: 1 }}
                    >
                      {todo.status === TodoStatus.COMPLETED ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <UncheckedIcon />
                      )}
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration:
                          todo.status === TodoStatus.COMPLETED
                            ? "line-through"
                            : "none",
                        wordBreak: "break-word",
                      }}
                    >
                      {todo.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Chip
                      label={todo.priority.toUpperCase()}
                      color={getPriorityColor(todo.priority)}
                      size="small"
                    />
                    {isOverdue(todo) && (
                      <Chip label="OVERDUE" color="error" size="small" />
                    )}
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {todo.description}
                </Typography>

                <Chip
                  label={todo.status.replace("_", " ").toUpperCase()}
                  color={getStatusColor(todo.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <List dense sx={{ p: 0 }}>
                  {/* assigned user removed - todos are admin reminders */}

                  {todo.dueDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={moment(todo.dueDate)
                          .tz("America/Toronto")
                          .format("MMM D, YYYY")}
                        secondary={`Due ${moment(todo.dueDate)
                          .tz("America/Toronto")
                          .fromNow()}`}
                      />
                    </ListItem>
                  )}

                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={`Created by ${todo.createdUserName}`}
                      secondary={moment(todo.createdAt)
                        .tz("America/Toronto")
                        .fromNow()}
                      sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                    />
                  </ListItem>

                  {todo.completedAt && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={`Completed ${moment(todo.completedAt)
                          .tz("America/Toronto")
                          .fromNow()}`}
                        sx={{ fontSize: "0.875rem", color: "success.main" }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleEdit(todo)}>
                  <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(todo.id)}
                >
                  <DeleteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedTodo ? "Edit Todo" : "Create Todo"}</DialogTitle>
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
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={todoForm.priority}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      priority: e.target.value as PriorityValue,
                    })
                  }
                >
                  <MenuItem value={Priority.LOW}>Low</MenuItem>
                  <MenuItem value={Priority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={Priority.HIGH}>High</MenuItem>
                  <MenuItem value={Priority.URGENT}>Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={todoForm.status}
                  onChange={(e) =>
                    setTodoForm({
                      ...todoForm,
                      status: e.target.value as TodoStatusValue,
                    })
                  }
                >
                  <MenuItem value={TodoStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={TodoStatus.IN_PROGRESS}>
                    In Progress
                  </MenuItem>
                  <MenuItem value={TodoStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={TodoStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Assign To removed - todos are admin reminders */}

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={todoForm.dueDate}
                onChange={(e) =>
                  setTodoForm({ ...todoForm, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedTodo ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoManagement;

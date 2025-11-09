import React, { useState, useEffect } from "react";
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
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  MusicNote as MusicIcon,
  SportsBar as SportsIcon,
  Quiz as QuizIcon,
  Celebration as CelebrationIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";

const TIMEZONE = "America/Toronto";

const EventType = {
  LIVE_MUSIC: "live_music",
  SPORTS_VIEWING: "sports_viewing",
  TRIVIA_NIGHT: "trivia_night",
  PRIVATE_PARTY: "private_party",
  SPECIAL_EVENT: "special_event",
  KARAOKE: "karaoke",
} as const;

type EventTypeValue = (typeof EventType)[keyof typeof EventType];

interface Event {
  id: string;
  title: string;
  description: string;
  type: EventTypeValue;
  displayStartDate: Date;
  displayEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  imageUrls: string[];
  isActive: boolean;
  createdAt: Date;
}

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    type: EventTypeValue;
    displayStartDate: moment.Moment | null;
    displayEndDate: moment.Moment | null;
    eventStartDate: moment.Moment | null;
    eventEndDate: moment.Moment | null;
    imageUrls: string[];
    isActive: boolean;
  }>({
    title: "",
    description: "",
    type: EventType.SPECIAL_EVENT,
    displayStartDate: null,
    displayEndDate: null,
    eventStartDate: null,
    eventEndDate: null,
    imageUrls: [],
    isActive: true,
  });
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/events", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to load events");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setEventForm({
      title: "",
      description: "",
      type: EventType.SPECIAL_EVENT,
      displayStartDate: null,
      displayEndDate: null,
      eventStartDate: null,
      eventEndDate: null,
      imageUrls: [],
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      type: event.type,
      displayStartDate: moment.tz(event.displayStartDate, TIMEZONE),
      displayEndDate: moment.tz(event.displayEndDate, TIMEZONE),
      eventStartDate: moment.tz(event.eventStartDate, TIMEZONE),
      eventEndDate: moment.tz(event.eventEndDate, TIMEZONE),
      imageUrls: event.imageUrls || [],
      isActive: event.isActive,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    const maxImages = 5;
    const maxSize = 1024 * 1024; // 1MB

    if (eventForm.imageUrls.length + files.length > maxImages) {
      showSnackbar(`Maximum ${maxImages} images allowed`, "error");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        showSnackbar("Image size must be less than 1MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showSnackbar("Only image files are allowed", "error");
        return;
      }
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/upload/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls) {
          setEventForm((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...data.urls],
          }));
          showSnackbar("Images uploaded successfully", "success");
        }
      } else {
        showSnackbar("Error uploading images", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showSnackbar("Error uploading images", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = eventForm.imageUrls[index];

    if (imageUrl && imageUrl.startsWith("https://")) {
      try {
        await fetch("http://localhost:5000/upload/images", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: [imageUrl] }),
        });
      } catch (error) {
        console.error("Error deleting image from server:", error);
      }
    }

    setEventForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        type: eventForm.type,
        displayStartDate: eventForm.displayStartDate?.utc().toISOString(),
        displayEndDate: eventForm.displayEndDate?.utc().toISOString(),
        eventStartDate: eventForm.eventStartDate?.utc().toISOString(),
        eventEndDate: eventForm.eventEndDate?.utc().toISOString(),
        imageUrls: eventForm.imageUrls,
        isActive: eventForm.isActive,
      };

      const url = selectedEvent
        ? `http://localhost:5000/events/${selectedEvent.id}`
        : "http://localhost:5000/events";

      const method = selectedEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        loadEvents();
        setDialogOpen(false);
        showSnackbar(
          selectedEvent
            ? "Event updated successfully"
            : "Event created successfully",
          "success"
        );
      } else {
        showSnackbar("Failed to save event", "error");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      showSnackbar("Error saving event", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`http://localhost:5000/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          loadEvents();
          showSnackbar("Event deleted successfully", "success");
        } else {
          showSnackbar("Failed to delete event", "error");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        showSnackbar("Error deleting event", "error");
      }
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case EventType.LIVE_MUSIC:
        return <MusicIcon />;
      case EventType.SPORTS_VIEWING:
        return <SportsIcon />;
      case EventType.TRIVIA_NIGHT:
        return <QuizIcon />;
      case EventType.PRIVATE_PARTY:
        return <CelebrationIcon />;
      case EventType.KARAOKE:
        return <MusicIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case EventType.LIVE_MUSIC:
        return "#8B4513"; // Saddle Brown
      case EventType.SPORTS_VIEWING:
        return "#A0522D"; // Sienna
      case EventType.TRIVIA_NIGHT:
        return "#D2691E"; // Chocolate
      case EventType.PRIVATE_PARTY:
        return "#CD853F"; // Peru
      case EventType.KARAOKE:
        return "#DEB887"; // Burlywood
      default:
        return "#8B4513"; // Default brown
    }
  };

  const getEventStatus = (event: Event): "upcoming" | "ongoing" | "past" => {
    const now = moment().tz(TIMEZONE);
    const startDate = moment.tz(event.eventStartDate, TIMEZONE);
    const endDate = moment.tz(event.eventEndDate, TIMEZONE);

    if (now.isBefore(startDate)) {
      return "upcoming";
    } else if (now.isBetween(startDate, endDate, null, "[]")) {
      return "ongoing";
    } else {
      return "past";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ p: 3, backgroundColor: "#faf6f2", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            p: 3,
            backgroundColor: "#8B4513",
            borderRadius: 3,
            color: "white",
            boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: "white" }}>
            Events Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              backgroundColor: "white",
              color: "#8B4513",
              "&:hover": { backgroundColor: "#f5f5f5" },
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            Add Event
          </Button>
        </Box>

        {/* Events Grid */}
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 3,
                  boxShadow: "0 6px 20px rgba(139, 69, 19, 0.15)",
                  border: `2px solid ${
                    getEventStatus(event) === "upcoming"
                      ? getEventTypeColor(event.type)
                      : "#e0e0e0"
                  }`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(139, 69, 19, 0.25)",
                  },
                }}
              >
                <Box
                  sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}
                >
                  <Chip
                    label={
                      getEventStatus(event) === "upcoming"
                        ? "Upcoming"
                        : getEventStatus(event) === "ongoing"
                        ? "Ongoing"
                        : "Past"
                    }
                    color={
                      getEventStatus(event) === "upcoming"
                        ? "success"
                        : getEventStatus(event) === "ongoing"
                        ? "primary"
                        : "default"
                    }
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor:
                        getEventStatus(event) === "upcoming"
                          ? "#4caf50"
                          : getEventStatus(event) === "ongoing"
                          ? "#2196f3"
                          : "#757575",
                      color: "white",
                    }}
                  />
                </Box>

                {/* Event Images */}
                {event.imageUrls && event.imageUrls.length > 0 && (
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${event.imageUrls[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getEventTypeColor(event.type),
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 700, color: "#3e2723" }}
                      >
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.type.replace("_", " ").toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, color: "#5d4037", lineHeight: 1.6 }}
                  >
                    {event.description}
                  </Typography>

                  <Divider sx={{ my: 2, backgroundColor: "#d7ccc8" }} />

                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon
                          fontSize="small"
                          sx={{ color: "#8d6e63" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#3e2723" }}
                          >
                            Display Period
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: "#5d4037" }}
                          >
                            {moment
                              .tz(event.displayStartDate, TIMEZONE)
                              .format("MMM D, YYYY")}{" "}
                            -{" "}
                            {moment
                              .tz(event.displayEndDate, TIMEZONE)
                              .format("MMM D, YYYY")}
                          </Typography>
                        }
                      />
                    </ListItem>

                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <EventIcon fontSize="small" sx={{ color: "#8d6e63" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#3e2723" }}
                          >
                            Event Time
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: "#5d4037" }}
                          >
                            {moment
                              .tz(event.eventStartDate, TIMEZONE)
                              .format("MMM D, h:mm A")}{" "}
                            -{" "}
                            {moment
                              .tz(event.eventEndDate, TIMEZONE)
                              .format("MMM D, h:mm A")}
                          </Typography>
                        }
                      />
                    </ListItem>

                    {event.imageUrls && event.imageUrls.length > 1 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ImageIcon
                            fontSize="small"
                            sx={{ color: "#8d6e63" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{ color: "#5d4037" }}
                            >
                              {event.imageUrls.length} images
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    onClick={() => handleEdit(event)}
                    sx={{
                      color: "#8B4513",
                      "&:hover": { backgroundColor: "rgba(139, 69, 19, 0.1)" },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(event.id)}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
                    }}
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
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: "#faf6f2",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#8B4513",
              color: "white",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            {selectedEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogContent sx={{ p: 3, backgroundColor: "#faf6f2" }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      "&:hover fieldset": { borderColor: "#8B4513" },
                      "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#8B4513" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ "&.Mui-focused": { color: "#8B4513" } }}>
                    Event Type
                  </InputLabel>
                  <Select
                    value={eventForm.type}
                    label="Event Type"
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        type: e.target.value as EventTypeValue,
                      })
                    }
                    sx={{
                      backgroundColor: "white",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8B4513",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8B4513",
                      },
                    }}
                  >
                    <MenuItem value={EventType.LIVE_MUSIC}>Live Music</MenuItem>
                    <MenuItem value={EventType.SPORTS_VIEWING}>
                      Sports Viewing
                    </MenuItem>
                    <MenuItem value={EventType.TRIVIA_NIGHT}>
                      Trivia Night
                    </MenuItem>
                    <MenuItem value={EventType.PRIVATE_PARTY}>
                      Private Party
                    </MenuItem>
                    <MenuItem value={EventType.SPECIAL_EVENT}>
                      Special Event
                    </MenuItem>
                    <MenuItem value={EventType.KARAOKE}>Karaoke</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      "&:hover fieldset": { borderColor: "#8B4513" },
                      "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#8B4513" },
                  }}
                />
              </Grid>

              {/* Display Period */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#8B4513", fontWeight: 600, mb: 2 }}
                >
                  Display Period
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Display Start Date"
                  value={eventForm.displayStartDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, displayStartDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": { borderColor: "#8B4513" },
                          "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#8B4513",
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Display End Date"
                  value={eventForm.displayEndDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, displayEndDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": { borderColor: "#8B4513" },
                          "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#8B4513",
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {/* Event Period */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#8B4513", fontWeight: 600, mb: 2 }}
                >
                  Event Period
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Event Start Date & Time"
                  value={eventForm.eventStartDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, eventStartDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": { borderColor: "#8B4513" },
                          "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#8B4513",
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Event End Date & Time"
                  value={eventForm.eventEndDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, eventEndDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": { borderColor: "#8B4513" },
                          "&.Mui-focused fieldset": { borderColor: "#8B4513" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#8B4513",
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {/* Image Upload Section */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#8B4513", fontWeight: 600, mb: 2 }}
                >
                  Event Images (Max 5, 1MB each)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={loading || eventForm.imageUrls.length >= 5}
                    sx={{
                      borderColor: "#8B4513",
                      color: "#8B4513",
                      "&:hover": {
                        borderColor: "#A0522D",
                        backgroundColor: "rgba(139, 69, 19, 0.1)",
                      },
                    }}
                  >
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        e.target.files && handleImageUpload(e.target.files)
                      }
                    />
                  </Button>
                </Box>

                {/* Display uploaded images */}
                {eventForm.imageUrls.length > 0 && (
                  <Grid container spacing={2}>
                    {eventForm.imageUrls.map((url, index) => (
                      <Grid size={{ xs: 6, md: 4 }} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 2,
                            overflow: "hidden",
                            backgroundColor: "white",
                            border: "2px solid #d7ccc8",
                          }}
                        >
                          <img
                            src={url}
                            alt={`Event ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: "rgba(0,0,0,0.6)",
                              color: "white",
                              "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventForm.isActive}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isActive: e.target.checked,
                        })
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#8B4513",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          { backgroundColor: "#8B4513" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#5d4037", fontWeight: 600 }}>
                      Active Event
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, backgroundColor: "#faf6f2" }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ color: "#8d6e63" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{
                backgroundColor: "#8B4513",
                "&:hover": { backgroundColor: "#A0522D" },
                fontWeight: 600,
              }}
            >
              {loading ? "Saving..." : selectedEvent ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EventsManagement;

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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  MusicNote as MusicIcon,
  SportsBar as SportsIcon,
  Quiz as QuizIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";

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
  startDateTime: Date;
  endDateTime: Date;
  capacity?: number;
  currentBookings: number;
  isRecurring: boolean;
  recurringPattern?: string;
  location?: string;
  contactInfo?: string;
  ticketPrice?: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    type: EventTypeValue;
    startDateTime: moment.Moment | null;
    endDateTime: moment.Moment | null;
    capacity: number;
    currentBookings: number;
    isRecurring: boolean;
    recurringPattern: string;
    location: string;
    contactInfo: string;
    ticketPrice: number;
    isActive: boolean;
    imageUrl: string;
  }>({
    title: "",
    description: "",
    type: EventType.LIVE_MUSIC,
    startDateTime: null,
    endDateTime: null,
    capacity: 0,
    currentBookings: 0,
    isRecurring: false,
    recurringPattern: "",
    location: "",
    contactInfo: "",
    ticketPrice: 0,
    isActive: true,
    imageUrl: "",
  });

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
      type: EventType.LIVE_MUSIC,
      startDateTime: null,
      endDateTime: null,
      capacity: 0,
      currentBookings: 0,
      isRecurring: false,
      recurringPattern: "",
      location: "",
      contactInfo: "",
      ticketPrice: 0,
      isActive: true,
      imageUrl: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      type: event.type,
      startDateTime: moment(event.startDateTime),
      endDateTime: moment(event.endDateTime),
      capacity: event.capacity || 0,
      currentBookings: event.currentBookings,
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern || "",
      location: event.location || "",
      contactInfo: event.contactInfo || "",
      ticketPrice: event.ticketPrice || 0,
      isActive: event.isActive,
      imageUrl: event.imageUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const eventData = {
        ...eventForm,
        startDateTime: eventForm.startDateTime?.toDate(),
        endDateTime: eventForm.endDateTime?.toDate(),
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
      } else {
        console.error("Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
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
        } else {
          console.error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
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
        return "#8B4513";
      case EventType.SPORTS_VIEWING:
        return "#D2691E";
      case EventType.TRIVIA_NIGHT:
        return "#B8860B";
      case EventType.PRIVATE_PARTY:
        return "#CD853F";
      case EventType.KARAOKE:
        return "#DEB887";
      default:
        return "#8B4513";
    }
  };

  const isEventUpcoming = (event: Event) => {
    return moment(event.startDateTime).isAfter(moment());
  };

  const getCapacityPercentage = (event: Event) => {
    if (!event.capacity) return 0;
    return (event.currentBookings / event.capacity) * 100;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
            Events Management
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
            Add Event
          </Button>
        </Box>

        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  border: isEventUpcoming(event)
                    ? `2px solid ${getEventTypeColor(event.type)}`
                    : "none",
                }}
              >
                <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
                  <Chip
                    label={isEventUpcoming(event) ? "Upcoming" : "Past"}
                    color={isEventUpcoming(event) ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{ bgcolor: getEventTypeColor(event.type), mr: 2 }}
                    >
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.type.replace("_", " ").toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: "white",
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {event.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={moment(event.startDateTime)
                          .tz("America/Toronto")
                          .format("MMM D, YYYY")}
                        secondary={`${moment(event.startDateTime)
                          .tz("America/Toronto")
                          .format("h:mm A")} - ${moment(event.endDateTime)
                          .tz("America/Toronto")
                          .format("h:mm A")}`}
                      />
                    </ListItem>

                    {event.location && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <LocationIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={event.location} />
                      </ListItem>
                    )}

                    {event.capacity && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${event.currentBookings} / ${event.capacity}`}
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 6,
                                  backgroundColor: "grey.300",
                                  borderRadius: 3,
                                  mr: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${getCapacityPercentage(event)}%`,
                                    height: "100%",
                                    backgroundColor:
                                      getCapacityPercentage(event) > 80
                                        ? "error.main"
                                        : "success.main",
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                              <Typography variant="caption">
                                {getCapacityPercentage(event).toFixed(0)}%
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    )}

                    {event.ticketPrice && event.ticketPrice > 0 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={`Ticket Price: $${event.ticketPrice.toFixed(
                            2
                          )}`}
                          sx={{ textAlign: "center" }}
                        />
                      </ListItem>
                    )}

                    {event.isRecurring && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Chip
                              label={event.recurringPattern || "Recurring"}
                              color="info"
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleEdit(event)}>
                    <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(event.id)}
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
        >
          <DialogTitle>
            {selectedEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        type: e.target.value as EventTypeValue,
                      })
                    }
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
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={eventForm.startDateTime}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, startDateTime: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="End Date & Time"
                  value={eventForm.endDateTime}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, endDateTime: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={eventForm.capacity}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Current Bookings"
                  type="number"
                  value={eventForm.currentBookings}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      currentBookings: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Location"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, location: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Info"
                  value={eventForm.contactInfo}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, contactInfo: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Ticket Price"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  value={eventForm.ticketPrice}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      ticketPrice: parseFloat(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Recurring Pattern"
                  value={eventForm.recurringPattern}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      recurringPattern: e.target.value,
                    })
                  }
                  placeholder="e.g., Every Friday"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={eventForm.isRecurring}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            isRecurring: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Recurring Event"
                  />
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
                      />
                    }
                    label="Active"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {selectedEvent ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EventsManagement;

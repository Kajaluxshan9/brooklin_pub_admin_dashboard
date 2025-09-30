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
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as SpecialIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";

const SpecialType = {
  DAILY: "daily",
  SEASONAL: "seasonal",
  HOLIDAY: "holiday",
  LIMITED_TIME: "limited_time",
} as const;

const DayOfWeek = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const;

type DayOfWeekValue = (typeof DayOfWeek)[keyof typeof DayOfWeek];

interface Special {
  id: string;
  title: string;
  description: string;
  type: (typeof SpecialType)[keyof typeof SpecialType];
  startDate?: Date;
  endDate?: Date;
  startTime?: moment.Moment;
  endTime?: moment.Moment;
  availableDays: DayOfWeekValue[];
  originalPrice?: number;
  specialPrice: number;
  discountPercentage?: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

const SpecialsManagement: React.FC = () => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<Special | null>(null);
  const [specialForm, setSpecialForm] = useState({
    title: "",
    description: "",
    type: SpecialType.DAILY as (typeof SpecialType)[keyof typeof SpecialType],
    startDate: null as moment.Moment | null,
    endDate: null as moment.Moment | null,
    startTime: null as moment.Moment | null,
    endTime: null as moment.Moment | null,
    availableDays: [] as DayOfWeekValue[],
    originalPrice: 0,
    specialPrice: 0,
    discountPercentage: 0,
    isActive: true,
    imageUrl: "",
  });

  useEffect(() => {
    loadSpecials();
  }, []);

  const loadSpecials = async () => {
    try {
      const response = await fetch("http://localhost:5000/specials", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const formattedSpecials = data.map((special: Special) => ({
          ...special,
          startDate: special.startDate
            ? new Date(special.startDate)
            : undefined,
          endDate: special.endDate ? new Date(special.endDate) : undefined,
          startTime: special.startTime
            ? moment(special.startTime, "HH:mm:ss")
            : undefined,
          endTime: special.endTime
            ? moment(special.endTime, "HH:mm:ss")
            : undefined,
          createdAt: new Date(special.createdAt),
        }));
        setSpecials(formattedSpecials);
      } else {
        console.error("Failed to fetch specials");
      }
    } catch (error) {
      console.error("Error fetching specials:", error);
    }
  };

  const handleCreate = () => {
    setSelectedSpecial(null);
    setSpecialForm({
      title: "",
      description: "",
      type: SpecialType.DAILY,
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      availableDays: [],
      originalPrice: 0,
      specialPrice: 0,
      discountPercentage: 0,
      isActive: true,
      imageUrl: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (special: Special) => {
    setSelectedSpecial(special);
    setSpecialForm({
      title: special.title,
      description: special.description,
      type: special.type,
      startDate: special.startDate ? moment(special.startDate) : null,
      endDate: special.endDate ? moment(special.endDate) : null,
      startTime: special.startTime ? moment(special.startTime) : null,
      endTime: special.endTime ? moment(special.endTime) : null,
      availableDays: special.availableDays,
      originalPrice: special.originalPrice || 0,
      specialPrice: special.specialPrice,
      discountPercentage: special.discountPercentage || 0,
      isActive: special.isActive,
      imageUrl: special.imageUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const specialData = {
        ...specialForm,
        startDate: specialForm.startDate?.toDate(),
        endDate: specialForm.endDate?.toDate(),
        startTime: specialForm.startTime?.format("HH:mm:ss"),
        endTime: specialForm.endTime?.format("HH:mm:ss"),
      };

      const url = selectedSpecial
        ? `http://localhost:5000/specials/${selectedSpecial.id}`
        : "http://localhost:5000/specials";

      const method = selectedSpecial ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(specialData),
      });

      if (response.ok) {
        setDialogOpen(false);
        loadSpecials(); // Reload the list
      } else {
        console.error("Failed to save special");
        alert("Failed to save special. Please try again.");
      }
    } catch (error) {
      console.error("Error saving special:", error);
      alert("Error saving special. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this special?")) {
      try {
        const response = await fetch(`http://localhost:5000/specials/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          loadSpecials(); // Reload the list
        } else {
          console.error("Failed to delete special");
          alert("Failed to delete special. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting special:", error);
        alert("Error deleting special. Please try again.");
      }
    }
  };

  const handleDayToggle = (day: DayOfWeekValue) => {
    const currentDays = specialForm.availableDays;
    if (currentDays.includes(day)) {
      setSpecialForm({
        ...specialForm,
        availableDays: currentDays.filter((d) => d !== day),
      });
    } else {
      setSpecialForm({
        ...specialForm,
        availableDays: [...currentDays, day],
      });
    }
  };

  const getSpecialTypeColor = (type: string) => {
    switch (type) {
      case SpecialType.DAILY:
        return "primary";
      case SpecialType.SEASONAL:
        return "secondary";
      case SpecialType.HOLIDAY:
        return "error";
      case SpecialType.LIMITED_TIME:
        return "warning";
      default:
        return "default";
    }
  };

  const formatDays = (days: DayOfWeekValue[]) => {
    if (days.length === 7) return "Every day";
    if (days.length === 0) return "No days selected";
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(", ");
  };

  const isSpecialActive = (special: Special) => {
    if (!special.isActive) return false;

    const now = moment().tz("America/Toronto");
    const today = now.format("dddd").toLowerCase() as DayOfWeekValue;

    // Check if today is in available days
    if (!special.availableDays.includes(today)) return false;

    // Check date range for seasonal/holiday specials
    if (special.startDate && special.endDate) {
      const start = moment(special.startDate);
      const end = moment(special.endDate);
      if (!now.isBetween(start, end, "day", "[]")) return false;
    }

    // Check time range for daily specials
    if (special.startTime && special.endTime) {
      const startTime = moment(special.startTime);
      const endTime = moment(special.endTime);
      const currentTime = moment().hour(now.hour()).minute(now.minute());
      if (!currentTime.isBetween(startTime, endTime)) return false;
    }

    return true;
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
            Specials Management
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
            Add Special
          </Button>
        </Box>

        <Grid container spacing={3}>
          {specials.map((special) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={special.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  opacity: isSpecialActive(special) ? 1 : 0.7,
                }}
              >
                <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
                  <Chip
                    label={
                      isSpecialActive(special)
                        ? "Active Now"
                        : special.isActive
                        ? "Scheduled"
                        : "Inactive"
                    }
                    color={
                      isSpecialActive(special)
                        ? "success"
                        : special.isActive
                        ? "primary"
                        : "default"
                    }
                    size="small"
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <SpecialIcon
                      sx={{ mr: 1, color: getSpecialTypeColor(special.type) }}
                    />
                    <Typography variant="h6" component="div">
                      {special.title}
                    </Typography>
                  </Box>

                  <Chip
                    label={special.type.replace("_", " ").toUpperCase()}
                    color={getSpecialTypeColor(special.type)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {special.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <CalendarIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                      />
                      {formatDays(special.availableDays)}
                    </Typography>

                    {special.startTime && special.endTime && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        <ScheduleIcon
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            verticalAlign: "middle",
                          }}
                        />
                        {moment(special.startTime).format("h:mm A")} -{" "}
                        {moment(special.endTime).format("h:mm A")}
                      </Typography>
                    )}

                    {special.startDate && special.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        {moment(special.startDate).format("MMM D")} -{" "}
                        {moment(special.endDate).format("MMM D, YYYY")}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      {special.originalPrice && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "text.secondary",
                          }}
                        >
                          $
                          {typeof special.originalPrice === "number"
                            ? special.originalPrice.toFixed(2)
                            : parseFloat(special.originalPrice || "0").toFixed(
                                2
                              )}
                        </Typography>
                      )}
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        $
                        {typeof special.specialPrice === "number"
                          ? special.specialPrice.toFixed(2)
                          : parseFloat(special.specialPrice || "0").toFixed(2)}
                      </Typography>
                    </Box>

                    {special.discountPercentage && (
                      <Chip
                        label={`${special.discountPercentage}% OFF`}
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleEdit(special)}>
                    <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(special.id)}
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
            {selectedSpecial ? "Edit Special" : "Create Special"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={specialForm.title}
                  onChange={(e) =>
                    setSpecialForm({ ...specialForm, title: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={specialForm.type}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        type: e.target
                          .value as (typeof SpecialType)[keyof typeof SpecialType],
                      })
                    }
                  >
                    <MenuItem value={SpecialType.DAILY}>Daily</MenuItem>
                    <MenuItem value={SpecialType.SEASONAL}>Seasonal</MenuItem>
                    <MenuItem value={SpecialType.HOLIDAY}>Holiday</MenuItem>
                    <MenuItem value={SpecialType.LIMITED_TIME}>
                      Limited Time
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={specialForm.description}
                  onChange={(e) =>
                    setSpecialForm({
                      ...specialForm,
                      description: e.target.value,
                    })
                  }
                />
              </Grid>

              {(specialForm.type === SpecialType.SEASONAL ||
                specialForm.type === SpecialType.HOLIDAY ||
                specialForm.type === SpecialType.LIMITED_TIME) && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="Start Date"
                      value={specialForm.startDate}
                      onChange={(newValue) =>
                        setSpecialForm({ ...specialForm, startDate: newValue })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="End Date"
                      value={specialForm.endDate}
                      onChange={(newValue) =>
                        setSpecialForm({ ...specialForm, endDate: newValue })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 6 }}>
                <TimePicker
                  label="Start Time"
                  value={specialForm.startTime}
                  onChange={(newValue) =>
                    setSpecialForm({ ...specialForm, startTime: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TimePicker
                  label="End Time"
                  value={specialForm.endTime}
                  onChange={(newValue) =>
                    setSpecialForm({ ...specialForm, endTime: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Days
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {Object.values(DayOfWeek).map((day) => (
                    <Chip
                      key={day}
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      clickable
                      color={
                        specialForm.availableDays.includes(day)
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleDayToggle(day)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Original Price"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  value={specialForm.originalPrice}
                  onChange={(e) =>
                    setSpecialForm({
                      ...specialForm,
                      originalPrice: parseFloat(e.target.value),
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Special Price"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  value={specialForm.specialPrice}
                  onChange={(e) =>
                    setSpecialForm({
                      ...specialForm,
                      specialPrice: parseFloat(e.target.value),
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Discount %"
                  type="number"
                  value={specialForm.discountPercentage}
                  onChange={(e) =>
                    setSpecialForm({
                      ...specialForm,
                      discountPercentage: parseInt(e.target.value),
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={specialForm.isActive}
                      onChange={(e) =>
                        setSpecialForm({
                          ...specialForm,
                          isActive: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              {selectedSpecial ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default SpecialsManagement;

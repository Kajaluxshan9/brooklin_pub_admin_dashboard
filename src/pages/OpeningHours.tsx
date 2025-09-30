import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";
import { useAuth } from "../contexts/AuthContext";

// Timezone constant
const TIMEZONE = "America/Toronto";

// Types
type DayOfWeekValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DayOfWeek = {
  MONDAY: "monday" as DayOfWeekValue,
  TUESDAY: "tuesday" as DayOfWeekValue,
  WEDNESDAY: "wednesday" as DayOfWeekValue,
  THURSDAY: "thursday" as DayOfWeekValue,
  FRIDAY: "friday" as DayOfWeekValue,
  SATURDAY: "saturday" as DayOfWeekValue,
  SUNDAY: "sunday" as DayOfWeekValue,
};

interface OpeningHoursData {
  id?: number;
  dayOfWeek: DayOfWeekValue;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isOpen: boolean;
  isClosedNextDay?: boolean;
  specialNote?: string;
}

interface EditFormData {
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isOpen: boolean;
  isClosedNextDay: boolean;
  specialNote: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const OpeningHours: React.FC = () => {
  const { user } = useAuth();
  const [openingHours, setOpeningHours] = useState<OpeningHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfWeekValue | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    openTime: "",
    closeTime: "",
    isActive: true,
    isOpen: true,
    isClosedNextDay: false,
    specialNote: "",
  });
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    type: "info",
  });

  // Utility Functions
  const getDayDisplayName = (day: DayOfWeekValue): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const isCurrentDay = (day: DayOfWeekValue): boolean => {
    const currentDayName = moment().tz(TIMEZONE).format("dddd").toLowerCase();
    return currentDayName === day;
  };

  const formatTimeRange = (
    openTime: string,
    closeTime: string,
    isClosedNextDay?: boolean
  ): string => {
    const openMoment = moment(openTime, "HH:mm");
    const closeMoment = moment(closeTime, "HH:mm");

    if (isClosedNextDay || closeMoment.isBefore(openMoment)) {
      return `${openMoment.format("h:mm A")} - ${closeMoment.format(
        "h:mm A"
      )} (+1 day)`;
    }
    return `${openMoment.format("h:mm A")} - ${closeMoment.format("h:mm A")}`;
  };

  const showNotification = (
    message: string,
    type: NotificationState["type"] = "info"
  ) => {
    setNotification({
      open: true,
      message,
      type,
    });
  };

  const initializeDefaultHours = () => {
    const defaultHours: OpeningHoursData[] = Object.values(DayOfWeek).map(
      (day) => ({
        dayOfWeek: day,
        openTime: "11:00",
        closeTime: "23:00",
        isActive: true,
        isOpen: true,
        isClosedNextDay: false,
        specialNote: "",
      })
    );
    setOpeningHours(defaultHours);
  };

  // API Functions
  const fetchOpeningHours = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/opening-hours", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOpeningHours(data);
      } else {
        console.warn("Failed to fetch opening hours, using defaults");
        initializeDefaultHours();
      }
    } catch (error) {
      console.error("Error fetching opening hours:", error);
      initializeDefaultHours();
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOpeningHours = async (
    dayOfWeek: DayOfWeekValue,
    hoursData: EditFormData
  ): Promise<boolean> => {
    try {
      setSaving(true);
      const existingHours = openingHours.find(
        (oh) => oh.dayOfWeek === dayOfWeek
      );

      const payload = {
        dayOfWeek,
        openTime: hoursData.isOpen ? hoursData.openTime : "",
        closeTime: hoursData.isOpen ? hoursData.closeTime : "",
        isActive: hoursData.isActive,
        isOpen: hoursData.isOpen,
        isClosedNextDay: hoursData.isClosedNextDay,
        specialNote: hoursData.specialNote,
      };

      const url = existingHours?.id
        ? `http://localhost:5000/opening-hours/${existingHours.id}`
        : "http://localhost:5000/opening-hours";

      const method = existingHours?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      if (existingHours) {
        setOpeningHours((prev) =>
          prev.map((oh) =>
            oh.dayOfWeek === dayOfWeek
              ? { ...oh, ...payload, id: result.id || oh.id }
              : oh
          )
        );
      } else {
        setOpeningHours((prev) => [...prev, { ...payload, id: result.id }]);
      }

      return true;
    } catch (error) {
      console.error("Error saving opening hours:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Event Handlers
  const handleEdit = (day: DayOfWeekValue) => {
    const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);

    // Set form with existing data or defaults
    setEditForm({
      openTime: dayHours?.openTime || "11:00",
      closeTime: dayHours?.closeTime || "23:00",
      isActive: dayHours?.isActive ?? true,
      isOpen: dayHours?.isOpen ?? true,
      isClosedNextDay: dayHours?.isClosedNextDay || false,
      specialNote: dayHours?.specialNote || "",
    });

    setEditingDay(day);
  };

  const handleSave = async () => {
    if (!editingDay) return;

    if (editForm.isOpen && (!editForm.openTime || !editForm.closeTime)) {
      showNotification(
        "Please set both open and close times when marked as open",
        "warning"
      );
      return;
    }

    const success = await saveOpeningHours(editingDay, editForm);

    if (success) {
      showNotification(
        `${getDayDisplayName(editingDay)} hours updated successfully`,
        "success"
      );
      setEditingDay(null);
      setEditForm({
        openTime: "",
        closeTime: "",
        isActive: true,
        isOpen: true,
        isClosedNextDay: false,
        specialNote: "",
      });
    } else {
      showNotification(
        "Failed to save opening hours. Please try again.",
        "error"
      );
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditForm({
      openTime: "",
      closeTime: "",
      isActive: true,
      isOpen: true,
      isClosedNextDay: false,
      specialNote: "",
    });
  };

  // Status Calculation
  const getCurrentOpenStatus = () => {
    const now = moment().tz(TIMEZONE);
    const currentDay = now.format("dddd").toLowerCase() as DayOfWeekValue;
    const currentTime = now.format("HH:mm");

    // Check current day
    const todayHours = openingHours.find((oh) => oh.dayOfWeek === currentDay);

    if (
      todayHours &&
      todayHours.isActive &&
      todayHours.isOpen &&
      todayHours.openTime &&
      todayHours.closeTime
    ) {
      const openTime = todayHours.openTime;
      const closeTime = todayHours.closeTime;

      // Handle overnight hours
      if (closeTime < openTime) {
        // Business closes next day
        if (currentTime >= openTime || currentTime <= closeTime) {
          return {
            isOpen: true,
            message: `Open until ${moment(closeTime, "HH:mm").format(
              "h:mm A"
            )} (overnight)`,
            day: currentDay,
          };
        }
      } else {
        // Same day close
        if (currentTime >= openTime && currentTime <= closeTime) {
          return {
            isOpen: true,
            message: `Open until ${moment(closeTime, "HH:mm").format(
              "h:mm A"
            )}`,
            day: currentDay,
          };
        }
      }
    }

    // Check if we're in overnight hours from previous day
    const previousDay = now.clone().subtract(1, "day");
    const previousDayName = previousDay
      .format("dddd")
      .toLowerCase() as DayOfWeekValue;
    const previousDayHours = openingHours.find(
      (oh) => oh.dayOfWeek === previousDayName
    );

    if (
      previousDayHours &&
      previousDayHours.isActive &&
      previousDayHours.isOpen &&
      previousDayHours.openTime &&
      previousDayHours.closeTime
    ) {
      if (
        previousDayHours.closeTime < previousDayHours.openTime &&
        currentTime <= previousDayHours.closeTime
      ) {
        return {
          isOpen: true,
          message: `Open until ${moment(
            previousDayHours.closeTime,
            "HH:mm"
          ).format("h:mm A")} (from ${getDayDisplayName(previousDayName)})`,
          day: previousDayName,
        };
      }
    }

    // Find next opening
    const nextOpen = findNextOpenDay(now);
    const nextOpenMessage = nextOpen
      ? `Next open: ${getDayDisplayName(nextOpen.day)} at ${moment(
          nextOpen.openTime,
          "HH:mm"
        ).format("h:mm A")}`
      : "Opening hours not available";

    return {
      isOpen: false,
      message: `Currently closed - ${nextOpenMessage}`,
      day: currentDay,
    };
  };

  const findNextOpenDay = (now: moment.Moment) => {
    for (let i = 0; i < 7; i++) {
      const checkDay = now.clone().add(i, "days");
      const dayName = checkDay.format("dddd").toLowerCase() as DayOfWeekValue;
      const dayHours = openingHours.find((oh) => oh.dayOfWeek === dayName);

      if (
        dayHours &&
        dayHours.isActive &&
        dayHours.isOpen &&
        dayHours.openTime
      ) {
        // If it's today, check if we haven't passed opening time yet
        if (i === 0) {
          const currentTime = now.format("HH:mm");
          if (currentTime < dayHours.openTime) {
            return { day: dayName, openTime: dayHours.openTime };
          }
        } else {
          return { day: dayName, openTime: dayHours.openTime };
        }
      }
    }
    return null;
  };

  const status = getCurrentOpenStatus();

  // Effects
  useEffect(() => {
    if (user) {
      fetchOpeningHours();
    }
  }, [fetchOpeningHours, user]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size={40} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "100%", width: "100%" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
            }}
          >
            Opening Hours Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: "1.1rem",
            }}
          >
            Manage your pub's operating hours for each day of the week
          </Typography>
        </Box>

        {/* Current Status */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", sm: "flex-end" },
            gap: 1,
          }}
        >
          <Chip
            icon={<ScheduleIcon />}
            label={status.isOpen ? "Currently Open" : "Currently Closed"}
            color={status.isOpen ? "success" : "error"}
            variant="filled"
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            {status.message}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontSize: "0.75rem" }}
          >
            Current time:{" "}
            {moment().tz(TIMEZONE).format("dddd, MMM Do - h:mm A")}
          </Typography>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert
        severity="info"
        sx={{
          mb: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.light",
          backgroundColor: "primary.50",
          "& .MuiAlert-icon": {
            color: "primary.main",
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          All times are in Toronto timezone (America/Toronto). Overnight hours
          (e.g., Tuesday 11 AM to Wednesday 2 AM) are supported.
        </Typography>
      </Alert>

      {/* Opening Hours Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        {Object.values(DayOfWeek).map((day) => {
          const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);
          const isToday = isCurrentDay(day);

          // Show default values if no data exists for this day
          const displayData = dayHours || {
            dayOfWeek: day,
            openTime: "",
            closeTime: "",
            isActive: true,
            isOpen: false,
            isClosedNextDay: false,
            specialNote: "",
          };

          return (
            <Card
              key={day}
              sx={{
                border: isToday ? "2px solid" : "1px solid",
                borderColor: isToday ? "primary.main" : "divider",
                borderRadius: 3,
                backgroundColor: isToday ? "primary.50" : "background.paper",
                transition: "all 0.3s ease-in-out",
                boxShadow: isToday
                  ? "0 8px 32px rgba(139, 69, 19, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(139, 69, 19, 0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isToday ? "primary.main" : "text.primary",
                            fontSize: "1.25rem",
                          }}
                        >
                          {getDayDisplayName(day)}
                        </Typography>
                        {isToday && (
                          <Chip
                            label="Today"
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                        )}
                      </Box>

                      {editingDay === day ? (
                        // Edit Mode
                        <Box sx={{ width: "100%", mt: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={editForm.isActive}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        isActive: e.target.checked,
                                      })
                                    }
                                    sx={{
                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "primary.main",
                                      },
                                    }}
                                  />
                                }
                                label="Active"
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    fontWeight: 500,
                                  },
                                }}
                              />

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={!editForm.isOpen}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        isOpen: !e.target.checked,
                                      })
                                    }
                                    sx={{
                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "error.main",
                                      },
                                    }}
                                  />
                                }
                                label="Closed"
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            </Box>

                            {editForm.isOpen && (
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                }}
                              >
                                <TextField
                                  label="Open Time"
                                  type="time"
                                  value={editForm.openTime}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      openTime: e.target.value,
                                    })
                                  }
                                  InputLabelProps={{ shrink: true }}
                                  size="small"
                                  helperText="Opening time"
                                  sx={{
                                    flex: "1 1 200px",
                                    "& .MuiOutlinedInput-root": {
                                      "&.Mui-focused fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                  }}
                                />
                                <TextField
                                  label="Close Time"
                                  type="time"
                                  value={editForm.closeTime}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      closeTime: e.target.value,
                                    })
                                  }
                                  InputLabelProps={{ shrink: true }}
                                  size="small"
                                  helperText="Can be next day"
                                  sx={{
                                    flex: "1 1 200px",
                                    "& .MuiOutlinedInput-root": {
                                      "&.Mui-focused fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                  }}
                                />

                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={editForm.isClosedNextDay}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          isClosedNextDay: e.target.checked,
                                        })
                                      }
                                      sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": {
                                          color: "warning.main",
                                        },
                                      }}
                                    />
                                  }
                                  label="Closes Next Day"
                                  sx={{
                                    mt: 1,
                                    "& .MuiFormControlLabel-label": {
                                      fontSize: "0.875rem",
                                      color: "text.secondary",
                                    },
                                  }}
                                />
                              </Box>
                            )}

                            <TextField
                              label="Special Notes"
                              value={editForm.specialNote}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  specialNote: e.target.value,
                                })
                              }
                              size="small"
                              fullWidth
                              placeholder="e.g., Live Music Night, Happy Hour 5-7 PM"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "&.Mui-focused fieldset": {
                                    borderColor: "primary.main",
                                  },
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        // Display Mode
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={
                                displayData.isActive ? "Active" : "Inactive"
                              }
                              color={
                                displayData.isActive ? "success" : "default"
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />

                            <Typography
                              variant="body1"
                              sx={{
                                color: "text.primary",
                                fontWeight: 600,
                                fontSize: "1rem",
                              }}
                            >
                              {!displayData.isOpen
                                ? "Closed"
                                : displayData.openTime && displayData.closeTime
                                ? formatTimeRange(
                                    displayData.openTime,
                                    displayData.closeTime,
                                    displayData.isClosedNextDay
                                  )
                                : "Hours not set"}
                            </Typography>
                          </Box>

                          {displayData.specialNote && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                                mt: 0.5,
                              }}
                            >
                              📝 {displayData.specialNote}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    {editingDay === day ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                          sx={{
                            backgroundColor: "primary.main",
                            "&:hover": { backgroundColor: "primary.dark" },
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={saving}
                          sx={{
                            borderColor: "text.secondary",
                            color: "text.secondary",
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "text.primary",
                              color: "text.primary",
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(day)}
                        disabled={!!editingDay}
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "primary.50",
                            borderColor: "primary.dark",
                          },
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpeningHours;

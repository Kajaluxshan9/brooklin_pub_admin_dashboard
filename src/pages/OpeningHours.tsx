import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../config/env.config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { getErrorMessage } from '../utils/uploadHelpers';
import logger from '../utils/logger';
import { StatusChip } from '../components/common/StatusChip';

// Timezone constant
const TIMEZONE = 'America/Toronto';

// Types
type DayOfWeekValue =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

const DayOfWeek = {
  MONDAY: 'monday' as DayOfWeekValue,
  TUESDAY: 'tuesday' as DayOfWeekValue,
  WEDNESDAY: 'wednesday' as DayOfWeekValue,
  THURSDAY: 'thursday' as DayOfWeekValue,
  FRIDAY: 'friday' as DayOfWeekValue,
  SATURDAY: 'saturday' as DayOfWeekValue,
  SUNDAY: 'sunday' as DayOfWeekValue,
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
  type: 'success' | 'error' | 'warning' | 'info';
}

const OpeningHours: React.FC = () => {
  const { user } = useAuth();
  const [openingHours, setOpeningHours] = useState<OpeningHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfWeekValue | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    openTime: '',
    closeTime: '',
    isActive: true,
    isOpen: true,
    isClosedNextDay: false,
    specialNote: '',
  });
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
  });

  // Utility Functions
  const getDayDisplayName = (day: DayOfWeekValue): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const isCurrentDay = (day: DayOfWeekValue): boolean => {
    const currentDayName = moment().tz(TIMEZONE).format('dddd').toLowerCase();
    return currentDayName === day;
  };

  const formatTimeRange = (
    openTime: string,
    closeTime: string,
    isClosedNextDay?: boolean,
  ): string => {
    const openMoment = moment(openTime, 'HH:mm');
    const closeMoment = moment(closeTime, 'HH:mm');

    if (isClosedNextDay || closeMoment.isBefore(openMoment)) {
      return `${openMoment.format('h:mm A')} - ${closeMoment.format(
        'h:mm A',
      )} (+1 day)`;
    }
    return `${openMoment.format('h:mm A')} - ${closeMoment.format('h:mm A')}`;
  };

  const showNotification = (
    message: string,
    type: NotificationState['type'] = 'info',
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
        openTime: '11:00',
        closeTime: '23:00',
        isActive: true,
        isOpen: true,
        isClosedNextDay: false,
        specialNote: '',
      }),
    );
    setOpeningHours(defaultHours);
  };

  // API Functions
  const fetchOpeningHours = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/opening-hours`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOpeningHours(data);
      } else {
        logger.warn('Failed to fetch opening hours, using defaults');
        initializeDefaultHours();
      }
    } catch (error) {
      logger.error('Error fetching opening hours:', error);
      initializeDefaultHours();
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOpeningHours = async (
    dayOfWeek: DayOfWeekValue,
    hoursData: EditFormData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);
      const existingHours = openingHours.find(
        (oh) => oh.dayOfWeek === dayOfWeek,
      );

      const payload = {
        dayOfWeek,
        openTime: hoursData.isOpen ? hoursData.openTime : '',
        closeTime: hoursData.isOpen ? hoursData.closeTime : '',
        isActive: hoursData.isActive,
        isOpen: hoursData.isOpen,
        isClosedNextDay: hoursData.isClosedNextDay,
        specialNote: hoursData.specialNote,
      };

      const url = existingHours?.id
        ? `${API_BASE_URL}/opening-hours/${existingHours.id}`
        : `${API_BASE_URL}/opening-hours`;

      const method = existingHours?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      // Update local state
      if (existingHours) {
        setOpeningHours((prev) =>
          prev.map((oh) =>
            oh.dayOfWeek === dayOfWeek
              ? { ...oh, ...payload, id: result.id || oh.id }
              : oh,
          ),
        );
      } else {
        setOpeningHours((prev) => [...prev, { ...payload, id: result.id }]);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error saving opening hours:', error);
      return { success: false, error: getErrorMessage(error) };
    } finally {
      setSaving(false);
    }
  };

  // Event Handlers
  const handleEdit = (day: DayOfWeekValue) => {
    const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);

    // Set form with existing data or defaults
    setEditForm({
      openTime: dayHours?.openTime || '11:00',
      closeTime: dayHours?.closeTime || '23:00',
      isActive: dayHours?.isActive ?? true,
      isOpen: dayHours?.isOpen ?? true,
      isClosedNextDay: dayHours?.isClosedNextDay || false,
      specialNote: dayHours?.specialNote || '',
    });

    setEditingDay(day);
  };

  const handleSave = async () => {
    if (!editingDay) return;

    if (editForm.isOpen && (!editForm.openTime || !editForm.closeTime)) {
      showNotification(
        'Please set both open and close times when marked as open',
        'warning',
      );
      return;
    }

    const result = await saveOpeningHours(editingDay, editForm);

    if (result.success) {
      showNotification(
        `${getDayDisplayName(editingDay)} hours updated successfully`,
        'success',
      );
      setEditingDay(null);
      setEditForm({
        openTime: '',
        closeTime: '',
        isActive: true,
        isOpen: true,
        isClosedNextDay: false,
        specialNote: '',
      });
    } else {
      showNotification(
        result.error || 'Failed to save opening hours. Please try again.',
        'error',
      );
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditForm({
      openTime: '',
      closeTime: '',
      isActive: true,
      isOpen: true,
      isClosedNextDay: false,
      specialNote: '',
    });
  };

  // Status Calculation
  const getCurrentOpenStatus = () => {
    const now = moment().tz(TIMEZONE);
    const currentDay = now.format('dddd').toLowerCase() as DayOfWeekValue;
    const currentTime = now.format('HH:mm');

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
            message: `Open until ${moment(closeTime, 'HH:mm').format(
              'h:mm A',
            )} (overnight)`,
            day: currentDay,
          };
        }
      } else {
        // Same day close
        if (currentTime >= openTime && currentTime <= closeTime) {
          return {
            isOpen: true,
            message: `Open until ${moment(closeTime, 'HH:mm').format(
              'h:mm A',
            )}`,
            day: currentDay,
          };
        }
      }
    }

    // Check if we're in overnight hours from previous day
    const previousDay = now.clone().subtract(1, 'day');
    const previousDayName = previousDay
      .format('dddd')
      .toLowerCase() as DayOfWeekValue;
    const previousDayHours = openingHours.find(
      (oh) => oh.dayOfWeek === previousDayName,
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
            'HH:mm',
          ).format('h:mm A')} (from ${getDayDisplayName(previousDayName)})`,
          day: previousDayName,
        };
      }
    }

    // Find next opening
    const nextOpen = findNextOpenDay(now);
    const nextOpenMessage = nextOpen
      ? `Next open: ${getDayDisplayName(nextOpen.day)} at ${moment(
          nextOpen.openTime,
          'HH:mm',
        ).format('h:mm A')}`
      : 'Opening hours not available';

    return {
      isOpen: false,
      message: `Currently closed - ${nextOpenMessage}`,
      day: currentDay,
    };
  };

  const findNextOpenDay = (now: moment.Moment) => {
    for (let i = 0; i < 7; i++) {
      const checkDay = now.clone().add(i, 'days');
      const dayName = checkDay.format('dddd').toLowerCase() as DayOfWeekValue;
      const dayHours = openingHours.find((oh) => oh.dayOfWeek === dayName);

      if (
        dayHours &&
        dayHours.isActive &&
        dayHours.isOpen &&
        dayHours.openTime
      ) {
        // If it's today, check if we haven't passed opening time yet
        if (i === 0) {
          const currentTime = now.format('HH:mm');
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', width: '100%' }}>
      {/* Header Section with Status */}
      <PageHeader
        title="Opening Hours Management"
        subtitle="Manage your pub's operating hours for each day of the week"
        statusChip={
          <StatusChip
            status={status.isOpen ? 'open' : 'closed'}
            label={status.isOpen ? 'Currently Open' : 'Currently Closed'}
          />
        }
      />

      {/* Status Message */}
      {status.message && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.95rem',
            }}
          >
            {status.message}
          </Typography>
        </Box>
      )}
      {/* Opening Hours Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        {Object.values(DayOfWeek).map((day) => {
          const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);
          const isToday = isCurrentDay(day);

          // Show default values if no data exists for this day
          const displayData = dayHours || {
            dayOfWeek: day,
            openTime: '',
            closeTime: '',
            isActive: true,
            isOpen: false,
            isClosedNextDay: false,
            specialNote: '',
          };

          return (
            <Card
              key={day}
              sx={{
                border: isToday ? '3px solid' : '2px solid',
                borderColor: isToday ? '#C87941' : 'rgba(200, 121, 65, 0.2)',
                borderRadius: 4,
                background: isToday
                  ? 'linear-gradient(135deg, rgba(200, 121, 65, 0.08) 0%, rgba(232, 155, 92, 0.06) 100%)'
                  : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 247, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isToday
                  ? '0 12px 40px rgba(200, 121, 65, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
                  : '0 8px 32px rgba(200, 121, 65, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                '&::before': isToday
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background:
                        'linear-gradient(90deg, #C87941 0%, #E89B5C 50%, #F5A94C 100%)',
                    }
                  : {},
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.01)',
                  boxShadow:
                    '0 16px 48px rgba(200, 121, 65, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                  borderColor: '#C87941',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isToday ? 'primary.main' : 'text.primary',
                            fontSize: '1.25rem',
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
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        )}
                      </Box>

                      {editingDay === day ? (
                        // Edit Mode
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
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
                                      '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'primary.main',
                                      },
                                    }}
                                  />
                                }
                                label="Active"
                                sx={{
                                  '& .MuiFormControlLabel-label': {
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
                                      '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'error.main',
                                      },
                                    }}
                                  />
                                }
                                label="Closed"
                                sx={{
                                  '& .MuiFormControlLabel-label': {
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            </Box>

                            {editForm.isOpen && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 2,
                                  flexWrap: 'wrap',
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
                                    flex: '1 1 200px',
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
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
                                    flex: '1 1 200px',
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
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
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: 'warning.main',
                                        },
                                      }}
                                    />
                                  }
                                  label="Closes Next Day"
                                  sx={{
                                    mt: 1,
                                    '& .MuiFormControlLabel-label': {
                                      fontSize: '0.875rem',
                                      color: 'text.secondary',
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
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
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
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={
                                displayData.isActive ? 'Active' : 'Inactive'
                              }
                              color={
                                displayData.isActive ? 'success' : 'default'
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />

                            <Typography
                              variant="body1"
                              sx={{
                                color: 'text.primary',
                                fontWeight: 600,
                                fontSize: '1rem',
                              }}
                            >
                              {!displayData.isOpen
                                ? 'Closed'
                                : displayData.openTime && displayData.closeTime
                                ? formatTimeRange(
                                    displayData.openTime,
                                    displayData.closeTime,
                                    displayData.isClosedNextDay,
                                  )
                                : 'Hours not set'}
                            </Typography>
                          </Box>

                          {displayData.specialNote && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic',
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
                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    {editingDay === day ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                          sx={{
                            backgroundColor: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.dark' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={saving}
                          sx={{
                            borderColor: 'text.secondary',
                            color: 'text.secondary',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: 'text.primary',
                              color: 'text.primary',
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
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'primary.50',
                            borderColor: 'primary.dark',
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpeningHours;


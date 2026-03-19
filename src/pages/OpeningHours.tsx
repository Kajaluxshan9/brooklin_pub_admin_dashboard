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
  Snackbar,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FiberManualRecord as DotIcon,
  Schedule as ScheduleIcon,
  EventBusy as ClosedIcon,
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

  // Helper: convert HH:mm to fractional hours (0-24)
  const timeToHours = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  // Skeleton loading
  if (loading) {
    return (
      <Box sx={{ maxWidth: '100%', width: '100%' }}>
        <Box sx={{ mb: 4, pb: 3, borderBottom: '3px solid rgba(200,121,65,0.15)' }}>
          <Skeleton variant="text" width={320} height={44} />
          <Skeleton variant="text" width={480} height={24} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="rounded" height={80} sx={{ mb: 3, borderRadius: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 2.5 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', width: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title="Opening Hours"
        subtitle="Manage your pub's operating hours for each day of the week"
        statusChip={
          <StatusChip
            status={status.isOpen ? 'open' : 'closed'}
            label={status.isOpen ? 'Currently Open' : 'Currently Closed'}
          />
        }
      />

      {/* Live Status Banner */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: status.isOpen
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)',
          border: `1px solid ${status.isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DotIcon sx={{ fontSize: 16, color: status.isOpen ? '#10B981' : '#EF4444' }} />
          <Box sx={{
            position: 'absolute',
            width: 26, height: 26, borderRadius: '50%',
            background: status.isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.8)', opacity: 1 },
              '70%': { transform: 'scale(1.4)', opacity: 0 },
              '100%': { transform: 'scale(0.8)', opacity: 0 },
            },
          }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.938rem', color: status.isOpen ? '#065F46' : '#991B1B', lineHeight: 1.2 }}>
            {status.isOpen ? 'We are open right now' : 'Currently closed'}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: status.isOpen ? '#047857' : '#B91C1C', mt: 0.25 }}>
            {status.message}
          </Typography>
        </Box>
      </Box>

      {/* Day Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {Object.values(DayOfWeek).map((day) => {
          const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);
          const isToday = isCurrentDay(day);
          const displayData = dayHours || {
            dayOfWeek: day, openTime: '', closeTime: '',
            isActive: true, isOpen: false, isClosedNextDay: false, specialNote: '',
          };

          // Time bar calculation
          const hasTimeBar = displayData.isOpen && displayData.openTime && displayData.closeTime;
          const openH = hasTimeBar ? timeToHours(displayData.openTime) : 0;
          const closeH = hasTimeBar ? timeToHours(displayData.closeTime) : 0;
          const isOvernight = hasTimeBar && closeH < openH;
          const barLeft = hasTimeBar ? `${(openH / 24) * 100}%` : '0%';
          const barWidth = hasTimeBar
            ? isOvernight
              ? `${((24 - openH) / 24) * 100}%`
              : `${((closeH - openH) / 24) * 100}%`
            : '0%';

          return (
            <Card
              key={day}
              elevation={0}
              sx={{
                border: isToday ? '2px solid #C87941' : '1px solid rgba(200,121,65,0.1)',
                borderRadius: 2.5,
                background: isToday ? 'rgba(200,121,65,0.03)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(16px)',
                transition: 'box-shadow 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isToday ? '0 4px 20px rgba(200,121,65,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
                '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
              }}
            >
              {/* Today accent stripe */}
              {isToday && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #C87941 0%, rgba(200,121,65,0.3) 100%)' }} />
              )}

              <CardContent sx={{ p: 2.5 }}>
                {/* Card header row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: editingDay === day ? 2 : 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Day icon */}
                    <Box sx={{
                      width: 42, height: 42, borderRadius: 2, flexShrink: 0,
                      background: isToday ? 'rgba(200,121,65,0.12)' : 'rgba(200,121,65,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isToday ? '#C87941' : '#8B7355',
                    }}>
                      {displayData.isOpen
                        ? <ScheduleIcon sx={{ fontSize: '1.2rem' }} />
                        : <ClosedIcon sx={{ fontSize: '1.2rem' }} />}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: isToday ? '#C87941' : '#2C1810', lineHeight: 1.1 }}>
                          {getDayDisplayName(day)}
                        </Typography>
                        {isToday && (
                          <Chip label="Today" size="small"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: 'rgba(200,121,65,0.15)', color: '#C87941' }} />
                        )}
                      </Box>
                      {editingDay !== day && (
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: displayData.isOpen ? '#2C1810' : '#9E9E9E', mt: 0.25 }}>
                          {!displayData.isOpen
                            ? 'Closed'
                            : displayData.openTime && displayData.closeTime
                            ? formatTimeRange(displayData.openTime, displayData.closeTime, displayData.isClosedNextDay)
                            : 'Hours not set'}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                    {editingDay === day ? (
                      <>
                        <Button size="small" variant="contained" startIcon={<SaveIcon />}
                          onClick={handleSave} disabled={saving}
                          sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.8rem', py: 0.75, px: 1.5, backgroundColor: '#C87941', '&:hover': { backgroundColor: '#A45F2D' } }}>
                          {saving ? 'Saving…' : 'Save'}
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<CancelIcon />}
                          onClick={handleCancel} disabled={saving}
                          sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.8rem', py: 0.75, px: 1.5 }}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="small" variant={isToday ? 'contained' : 'outlined'} startIcon={<EditIcon />}
                        onClick={() => handleEdit(day)} disabled={!!editingDay}
                        sx={{
                          borderRadius: 2, fontWeight: 600, fontSize: '0.8rem', py: 0.75, px: 1.5,
                          ...(isToday
                            ? { backgroundColor: '#C87941', '&:hover': { backgroundColor: '#A45F2D' } }
                            : { borderColor: 'rgba(200,121,65,0.4)', color: '#C87941', '&:hover': { borderColor: '#C87941', bgcolor: 'rgba(200,121,65,0.05)' } }),
                        }}>
                        Edit
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Edit form */}
                {editingDay === day && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, borderTop: '1px solid rgba(200,121,65,0.1)' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <FormControlLabel control={<Switch checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />} label="Active" />
                      <FormControlLabel control={<Switch checked={!editForm.isOpen} onChange={(e) => setEditForm({ ...editForm, isOpen: !e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#EF4444' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#EF4444' } }} />} label="Mark as Closed" />
                    </Box>
                    {editForm.isOpen && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField label="Open Time" type="time" value={editForm.openTime}
                          onChange={(e) => setEditForm({ ...editForm, openTime: e.target.value })}
                          slotProps={{ inputLabel: { shrink: true } }} size="small" helperText="Opening time" sx={{ flex: '1 1 160px' }} />
                        <TextField label="Close Time" type="time" value={editForm.closeTime}
                          onChange={(e) => setEditForm({ ...editForm, closeTime: e.target.value })}
                          slotProps={{ inputLabel: { shrink: true } }} size="small" helperText="Can be next day" sx={{ flex: '1 1 160px' }} />
                        <FormControlLabel control={<Switch checked={editForm.isClosedNextDay} onChange={(e) => setEditForm({ ...editForm, isClosedNextDay: e.target.checked })} size="small" />}
                          label={<Typography sx={{ fontSize: '0.85rem' }}>Closes next day</Typography>} />
                      </Box>
                    )}
                    <TextField label="Special Note" value={editForm.specialNote}
                      onChange={(e) => setEditForm({ ...editForm, specialNote: e.target.value })}
                      size="small" fullWidth placeholder="e.g., Live Music Night, Happy Hour 5–7 PM" />
                  </Box>
                )}

                {/* Time bar visualization */}
                {editingDay !== day && (
                  <Box sx={{ mt: 2 }}>
                    {/* 24h track */}
                    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                      {hasTimeBar && (
                        <Box sx={{
                          position: 'absolute', top: 0, bottom: 0, borderRadius: 3,
                          left: barLeft, width: barWidth,
                          background: displayData.isActive
                            ? 'linear-gradient(90deg, #C87941, #DDA15E)'
                            : 'rgba(158,158,158,0.4)',
                        }} />
                      )}
                    </Box>
                    {/* Time labels */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      {['12am', '6am', '12pm', '6pm', '12am'].map((t) => (
                        <Typography key={t} sx={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.3)', fontWeight: 500 }}>{t}</Typography>
                      ))}
                    </Box>
                    {/* Special note */}
                    {displayData.specialNote && (
                      <Typography sx={{ fontSize: '0.78rem', color: '#8B7355', mt: 1, fontStyle: 'italic' }}>
                        ✦ {displayData.specialNote}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpeningHours;


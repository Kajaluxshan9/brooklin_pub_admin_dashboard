import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as SentIcon,
  Error as FailedIcon,
  Cancel as CancelledIcon,
  Star as SpecialIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

interface ScheduledNotification {
  id: string;
  type: 'special' | 'event';
  referenceId: string;
  referenceTitle: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt: string | null;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactElement }
> = {
  pending: {
    label: 'Pending',
    color: '#ED6C02',
    bg: 'rgba(237, 108, 2, 0.08)',
    icon: <PendingIcon fontSize="small" />,
  },
  sent: {
    label: 'Sent',
    color: '#2E7D32',
    bg: 'rgba(46, 125, 50, 0.08)',
    icon: <SentIcon fontSize="small" />,
  },
  failed: {
    label: 'Failed',
    color: '#D32F2F',
    bg: 'rgba(211, 47, 47, 0.08)',
    icon: <FailedIcon fontSize="small" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#757575',
    bg: 'rgba(117, 117, 117, 0.08)',
    icon: <CancelledIcon fontSize="small" />,
  },
};

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactElement }
> = {
  special: {
    label: 'Special',
    color: '#C87941',
    icon: <SpecialIcon fontSize="small" />,
  },
  event: {
    label: 'Event',
    color: '#1976D2',
    icon: <EventIcon fontSize="small" />,
  },
};

const ScheduledNotifications: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>(
    [],
  );
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'sent' | 'failed' | 'cancelled'
  >('all');
  const [filterType, setFilterType] = useState<'all' | 'special' | 'event'>(
    'all',
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notificationsRes, statsRes] = await Promise.all([
        api.get<ScheduledNotification[]>('/notifications'),
        api.get<NotificationStats>('/notifications/stats'),
      ]);
      setNotifications(notificationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      logger.error('Failed to fetch notification data:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch = n.referenceTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
      const matchesType = filterType === 'all' || n.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [notifications, searchTerm, filterStatus, filterType]);

  const summaryStats: StatItem[] = [
    {
      label: 'Total Scheduled',
      value: stats.total,
      icon: <NotificationsActiveIcon />,
      color: '#C87941',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: <PendingIcon />,
      color: '#ED6C02',
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: <SendIcon />,
      color: '#2E7D32',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: <FailedIcon />,
      color: '#D32F2F',
    },
  ];

  const formatDate = (dateStr: string) =>
    moment(dateStr).tz('America/Toronto').format('MMM DD, YYYY • h:mm A');

  const getTimeUntil = (dateStr: string) => {
    const scheduledMoment = moment(dateStr).tz('America/Toronto');
    const now = moment().tz('America/Toronto');
    if (scheduledMoment.isBefore(now)) return 'Overdue';
    return scheduledMoment.fromNow();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Scheduled Notifications"
        subtitle="Track and monitor subscriber notifications for specials and events"
        icon={
          <NotificationsActiveIcon sx={{ fontSize: 32, color: '#C87941' }} />
        }
        action={
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ color: '#C87941' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <SummaryStats stats={summaryStats} columns={4} />

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 260,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.6)',
            },
          }}
        />

        {/* Status filter chips */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'sent', 'failed', 'cancelled'] as const).map(
            (status) => (
              <Chip
                key={status}
                label={status === 'all' ? 'All' : STATUS_CONFIG[status].label}
                size="small"
                onClick={() => setFilterStatus(status)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor:
                    filterStatus === status
                      ? alpha('#C87941', 0.12)
                      : 'rgba(0,0,0,0.04)',
                  color: filterStatus === status ? '#C87941' : 'text.secondary',
                  border:
                    filterStatus === status
                      ? '1px solid rgba(200,121,65,0.3)'
                      : '1px solid transparent',
                  '&:hover': { bgcolor: alpha('#C87941', 0.08) },
                }}
              />
            ),
          )}
        </Box>

        {/* Type filter chips */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(['all', 'special', 'event'] as const).map((type) => (
            <Chip
              key={type}
              label={type === 'all' ? 'All Types' : TYPE_CONFIG[type].label}
              size="small"
              onClick={() => setFilterType(type)}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor:
                  filterType === type
                    ? alpha('#C87941', 0.12)
                    : 'rgba(0,0,0,0.04)',
                color: filterType === type ? '#C87941' : 'text.secondary',
                border:
                  filterType === type
                    ? '1px solid rgba(200,121,65,0.3)'
                    : '1px solid transparent',
                '&:hover': { bgcolor: alpha('#C87941', 0.08) },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results count */}
      <Typography
        variant="body2"
        sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}
      >
        Showing {filteredNotifications.length} of {notifications.length}{' '}
        notification{notifications.length !== 1 ? 's' : ''}
      </Typography>

      {/* Notification Cards */}
      {!loading && filteredNotifications.length === 0 ? (
        <Card
          sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: 'rgba(255,255,255,0.6)',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <NotificationsActiveIcon
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            No notifications found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
            Scheduled notifications will appear here when specials or events are
            created with future display dates.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredNotifications.map((notification) => {
            const statusCfg = STATUS_CONFIG[notification.status];
            const typeCfg = TYPE_CONFIG[notification.type];

            return (
              <Card
                key={notification.id}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.7)',
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    {/* Left: title + type */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flex: 1,
                        minWidth: 200,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(typeCfg.color, 0.1),
                          color: typeCfg.color,
                          flexShrink: 0,
                        }}
                      >
                        {typeCfg.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {notification.referenceTitle}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {typeCfg.label}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Center: schedule info */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 200,
                      }}
                    >
                      <ScheduleIcon
                        sx={{ fontSize: 16, color: 'text.disabled' }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            lineHeight: 1.2,
                          }}
                        >
                          Scheduled for
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, lineHeight: 1.2 }}
                        >
                          {formatDate(notification.scheduledFor)}
                        </Typography>
                        {notification.status === 'pending' && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#ED6C02',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }}
                          >
                            {getTimeUntil(notification.scheduledFor)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Sent at (if sent) */}
                    {notification.sentAt && (
                      <Box sx={{ minWidth: 150 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            lineHeight: 1.2,
                          }}
                        >
                          Sent at
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, lineHeight: 1.2 }}
                        >
                          {formatDate(notification.sentAt)}
                        </Typography>
                      </Box>
                    )}

                    {/* Right: status */}
                    <Chip
                      icon={statusCfg.icon}
                      label={statusCfg.label}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        bgcolor: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.color}20`,
                        '& .MuiChip-icon': { color: statusCfg.color },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ScheduledNotifications;

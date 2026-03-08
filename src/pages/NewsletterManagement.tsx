import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  PersonOff as UnsubscribedIcon,
  CheckCircle as ActiveIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Unsubscribe as UnsubscribeIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  updatedAt: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}

const NewsletterManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subscribersRes, statsRes] = await Promise.all([
        api.get<Subscriber[]>('/newsletter/subscribers'),
        api.get<NewsletterStats>('/newsletter/stats'),
      ]);
      setSubscribers(subscribersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      logger.error('Failed to fetch newsletter data:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!subscriberToDelete) return;
    try {
      await api.delete(`/newsletter/subscribers/${subscriberToDelete.id}`);
      showToast('Subscriber removed successfully', 'success');
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      fetchData();
    } catch (error) {
      logger.error('Failed to delete subscriber:', error);
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleCopyEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.isActive)
      .map((s) => s.email)
      .join(', ');
    navigator.clipboard.writeText(activeEmails);
    showToast(`Copied ${subscribers.filter((s) => s.isActive).length} active emails`, 'success');
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && sub.isActive) ||
        (filterStatus === 'unsubscribed' && !sub.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [subscribers, searchTerm, filterStatus]);

  const summaryStats: StatItem[] = [
    {
      label: 'Total Subscribers',
      value: stats.total,
      icon: <GroupIcon />,
      color: '#C87941',
    },
    {
      label: 'Active Subscribers',
      value: stats.active,
      icon: <ActiveIcon />,
      color: '#4CAF50',
    },
    {
      label: 'Unsubscribed',
      value: stats.unsubscribed,
      icon: <UnsubscribeIcon />,
      color: '#FF9800',
    },
    {
      label: 'Engagement Rate',
      value: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%',
      icon: <TrendingUpIcon />,
      color: '#2196F3',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Newsletter"
        subtitle="Manage your newsletter subscribers and track engagement"
        icon={<EmailIcon sx={{ fontSize: 32, color: '#C87941' }} />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy active emails">
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyEmails}
                disabled={subscribers.filter((s) => s.isActive).length === 0}
                sx={{
                  borderColor: 'rgba(200, 121, 65, 0.3)',
                  color: '#C87941',
                  '&:hover': { borderColor: '#C87941', bgcolor: 'rgba(200, 121, 65, 0.05)' },
                }}
              >
                Copy Emails
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} sx={{ color: '#C87941' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C87941' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C87941' },
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'active', 'unsubscribed'] as const).map((status) => (
            <Chip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              variant={filterStatus === status ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus(status)}
              sx={{
                fontWeight: 600,
                ...(filterStatus === status
                  ? {
                      bgcolor: '#C87941',
                      color: '#fff',
                      '&:hover': { bgcolor: '#A0612F' },
                    }
                  : {
                      borderColor: 'rgba(200, 121, 65, 0.3)',
                      color: '#C87941',
                      '&:hover': { bgcolor: 'rgba(200, 121, 65, 0.05)' },
                    }),
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
          Showing {filteredSubscribers.length} of {subscribers.length}
        </Typography>
      </Box>

      {/* Subscriber List */}
      {filteredSubscribers.length === 0 ? (
        <Card
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(200, 121, 65, 0.08)',
          }}
        >
          <CardContent>
            <EmailIcon sx={{ fontSize: 64, color: 'rgba(200, 121, 65, 0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {searchTerm || filterStatus !== 'all' ? 'No matching subscribers' : 'No subscribers yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Subscribers will appear here when users sign up via the website newsletter form'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredSubscribers.map((subscriber) => (
            <Card
              key={subscriber.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2.5,
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: subscriber.isActive
                  ? 'rgba(200, 121, 65, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                opacity: subscriber.isActive ? 1 : 0.7,
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                  borderColor: 'rgba(200, 121, 65, 0.15)',
                },
              }}
            >
              {/* Email indicator */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: subscriber.isActive
                    ? (theme) => alpha(theme.palette.success.main, 0.1)
                    : (theme) => alpha(theme.palette.warning.main, 0.1),
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                {subscriber.isActive ? (
                  <EmailIcon sx={{ fontSize: 20, color: 'success.main' }} />
                ) : (
                  <UnsubscribedIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                )}
              </Box>

              {/* Email */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subscriber.email}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Subscribed {moment(subscriber.subscribedAt).tz('America/Toronto').format('MMM D, YYYY [at] h:mm A')}
                  {subscriber.unsubscribedAt && !subscriber.isActive && (
                    <> · Unsubscribed {moment(subscriber.unsubscribedAt).tz('America/Toronto').format('MMM D, YYYY')}</>
                  )}
                </Typography>
              </Box>

              {/* Status */}
              <Chip
                label={subscriber.isActive ? 'Active' : 'Unsubscribed'}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  mx: 2,
                  ...(subscriber.isActive
                    ? {
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                        color: 'success.dark',
                      }
                    : {
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                        color: 'warning.dark',
                      }),
                }}
              />

              {/* Actions */}
              <Tooltip title="Remove subscriber">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSubscriberToDelete(subscriber);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main', bgcolor: 'rgba(244, 67, 54, 0.08)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 440,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Subscriber</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to permanently remove{' '}
            <strong>{subscriberToDelete?.email}</strong> from the newsletter? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsletterManagement;

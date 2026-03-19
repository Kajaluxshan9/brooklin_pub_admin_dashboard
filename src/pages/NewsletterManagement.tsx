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
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  PersonOff as UnsubscribedIcon,
  CheckCircle as ActiveIcon,
  Group as GroupIcon,
  HourglassEmpty as PendingPromoIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  LocalOffer as PromoIcon,
  CheckCircleOutline as SentPromoIcon,
  TaskAlt as ClaimedIcon,
} from '@mui/icons-material';
import { FaFacebookF } from 'react-icons/fa';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  updatedAt: string;
  promoCode: string | null;
  promoCodeSent: boolean;
  promoSentAt: string | null;
  promoClaimed: boolean;
  promoClaimedAt: string | null;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  promoSent: number;
  promoPending: number;
}

type FilterStatus = 'all' | 'active' | 'unsubscribed' | 'promo_pending' | 'promo_sent' | 'promo_claimed';

// ─── Main Component ───────────────────────────────────────────────────────────

const NewsletterManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    promoSent: 0,
    promoPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  // Per-subscriber loading flags to prevent double-click / concurrent requests
  const [sendingPromo, setSendingPromo] = useState<Record<string, boolean>>({});
  const [claimingPromo, setClaimingPromo] = useState<Record<string, boolean>>({});

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

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

  const handleSendPromo = async (subscriber: Subscriber) => {
    if (subscriber.promoCodeSent || sendingPromo[subscriber.id]) return;

    setSendingPromo((prev) => ({ ...prev, [subscriber.id]: true }));
    try {
      const res = await api.post<{ message: string; promoCode: string }>(
        `/newsletter/subscribers/${subscriber.id}/send-promo`,
      );
      // Optimistic update — avoids a full refetch round-trip
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, promoCodeSent: true, promoCode: res.data.promoCode, promoSentAt: new Date().toISOString() }
            : s,
        ),
      );
      setStats((prev) => ({
        ...prev,
        promoSent: prev.promoSent + 1,
        promoPending: Math.max(0, prev.promoPending - 1),
      }));
      showToast(`Promo code sent to ${subscriber.email}`, 'success');
    } catch (error) {
      logger.error('Failed to send promo code:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSendingPromo((prev) => ({ ...prev, [subscriber.id]: false }));
    }
  };

  const handleMarkClaimed = async (subscriber: Subscriber) => {
    if (!subscriber.promoCodeSent || subscriber.promoClaimed || claimingPromo[subscriber.id]) return;

    setClaimingPromo((prev) => ({ ...prev, [subscriber.id]: true }));
    try {
      await api.patch(`/newsletter/subscribers/${subscriber.id}/claim-promo`);
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, promoClaimed: true, promoClaimedAt: new Date().toISOString() }
            : s,
        ),
      );
      showToast(`Promo marked as claimed for ${subscriber.email}`, 'success');
    } catch (error) {
      logger.error('Failed to mark promo as claimed:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setClaimingPromo((prev) => ({ ...prev, [subscriber.id]: false }));
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

  // ─── Derived data ──────────────────────────────────────────────────────────

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && sub.isActive) ||
        (filterStatus === 'unsubscribed' && !sub.isActive) ||
        (filterStatus === 'promo_pending' && sub.isActive && !sub.promoCodeSent) ||
        (filterStatus === 'promo_sent' && sub.promoCodeSent && !sub.promoClaimed) ||
        (filterStatus === 'promo_claimed' && sub.promoClaimed);
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
      label: 'Promo Code Sent',
      value: stats.promoSent,
      icon: <SentPromoIcon />,
      color: '#2196F3',
    },
    {
      label: 'Pending Promo',
      value: stats.promoPending,
      icon: <PendingPromoIcon />,
      color: '#FF9800',
    },
  ];

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
    { value: 'promo_pending', label: 'Need Promo' },
    { value: 'promo_sent', label: 'Promo Sent' },
    { value: 'promo_claimed', label: 'Claimed' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Newsletter"
        subtitle="Manage your newsletter subscribers and send promo codes"
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

      {/* Social channels — included in every email footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          px: 2.5,
          py: 1.5,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          borderRadius: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
          Email footer links:
        </Typography>
        <Tooltip title="Facebook — facebook.com/brooklinpub">
          <Box
            component="a"
            href="https://www.facebook.com/brooklinpub"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: '#1877F2',
              color: '#fff',
              textDecoration: 'none',
              '&:hover': { opacity: 0.85 },
              transition: 'opacity 0.2s',
            }}
          >
            <FaFacebookF size={13} />
          </Box>
        </Tooltip>
        <Tooltip title="Instagram — instagram.com/brooklinpubngrill">
          <Box
            component="a"
            href="https://www.instagram.com/brooklinpubngrill/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: '#E1306C',
              color: '#fff',
              textDecoration: 'none',
              '&:hover': { opacity: 0.85 },
              transition: 'opacity 0.2s',
            }}
          >
            <FaInstagram size={14} />
          </Box>
        </Tooltip>
        <Tooltip title="TikTok — tiktok.com/@brooklinpubngrill">
          <Box
            component="a"
            href="https://www.tiktok.com/@brooklinpubngrill"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: '#010101',
              color: '#fff',
              textDecoration: 'none',
              '&:hover': { opacity: 0.85 },
              transition: 'opacity 0.2s',
            }}
          >
            <FaTiktok size={14} />
          </Box>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
          These links appear in every newsletter email sent to subscribers.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filterOptions.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              variant={filterStatus === value ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus(value)}
              sx={{
                fontWeight: 600,
                ...(filterStatus === value
                  ? { bgcolor: '#C87941', color: '#fff', '&:hover': { bgcolor: '#A0612F' } }
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

      {/* Subscriber list */}
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
            <SubscriberRow
              key={subscriber.id}
              subscriber={subscriber}
              isSendingPromo={!!sendingPromo[subscriber.id]}
              isClaimingPromo={!!claimingPromo[subscriber.id]}
              onSendPromo={handleSendPromo}
              onMarkClaimed={handleMarkClaimed}
              onDelete={() => {
                setSubscriberToDelete(subscriber);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </Box>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 440 } } }}
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

// ─── Subscriber Row ───────────────────────────────────────────────────────────

interface SubscriberRowProps {
  subscriber: Subscriber;
  isSendingPromo: boolean;
  isClaimingPromo: boolean;
  onSendPromo: (subscriber: Subscriber) => void;
  onMarkClaimed: (subscriber: Subscriber) => void;
  onDelete: () => void;
}

const SubscriberRow: React.FC<SubscriberRowProps> = ({
  subscriber,
  isSendingPromo,
  isClaimingPromo,
  onSendPromo,
  onMarkClaimed,
  onDelete,
}) => {
  const canSendPromo = subscriber.isActive && !subscriber.promoCodeSent;
  const canMarkClaimed = subscriber.promoCodeSent && !subscriber.promoClaimed;

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2.5,
        py: 1.5,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: subscriber.isActive ? 'rgba(200, 121, 65, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        opacity: subscriber.isActive ? 1 : 0.7,
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
          borderColor: 'rgba(200, 121, 65, 0.15)',
        },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: { xs: 1, sm: 0 },
      }}
    >
      {/* Status icon */}
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

      {/* Email + date info */}
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

        {/* Promo code + claimed info */}
        {subscriber.promoCodeSent && subscriber.promoCode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
            <PromoIcon sx={{ fontSize: 12, color: '#2196F3' }} />
            <Typography variant="caption" sx={{ color: '#2196F3', fontWeight: 700, letterSpacing: 1.5, fontFamily: 'monospace' }}>
              {subscriber.promoCode}
            </Typography>
            {subscriber.promoSentAt && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                · Sent {moment(subscriber.promoSentAt).tz('America/Toronto').format('MMM D, YYYY')}
              </Typography>
            )}
            {subscriber.promoClaimed && subscriber.promoClaimedAt && (
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                · Claimed {moment(subscriber.promoClaimedAt).tz('America/Toronto').format('MMM D, YYYY')}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Subscription status chip */}
      <Chip
        label={subscriber.isActive ? 'Active' : 'Unsubscribed'}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.72rem',
          mx: { xs: 0, sm: 1.5 },
          ...(subscriber.isActive
            ? { bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.dark' }
            : { bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' }),
        }}
      />

      {/* Promo status chip */}
      <Chip
        label={
          subscriber.promoClaimed
            ? 'Claimed'
            : subscriber.promoCodeSent
              ? 'Sent'
              : 'Not Sent'
        }
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.72rem',
          mr: { xs: 0, sm: 1.5 },
          ...(subscriber.promoClaimed
            ? { bgcolor: (theme) => alpha(theme.palette.success.main, 0.12), color: 'success.dark' }
            : subscriber.promoCodeSent
              ? { bgcolor: (theme) => alpha(theme.palette.info.main, 0.1), color: 'info.dark' }
              : { bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary' }),
        }}
      />

      {/* Send Promo button */}
      <Tooltip
        title={
          !subscriber.isActive
            ? 'Subscriber is inactive — cannot send promo'
            : subscriber.promoCodeSent
              ? 'Promo code already sent'
              : 'Send promo code via email'
        }
      >
        <span>
          <Button
            size="small"
            variant={canSendPromo ? 'contained' : 'outlined'}
            startIcon={
              isSendingPromo ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <PromoIcon sx={{ fontSize: 15 }} />
              )
            }
            disabled={!canSendPromo || isSendingPromo}
            onClick={() => onSendPromo(subscriber)}
            sx={{
              mr: 1,
              fontWeight: 600,
              fontSize: '0.72rem',
              borderRadius: 2,
              minWidth: 130,
              whiteSpace: 'nowrap',
              ...(canSendPromo
                ? { bgcolor: '#C87941', color: '#fff', '&:hover': { bgcolor: '#A0612F' }, boxShadow: 'none' }
                : { borderColor: 'rgba(0,0,0,0.12)', color: 'text.disabled' }),
            }}
          >
            {isSendingPromo ? 'Sending…' : subscriber.promoCodeSent ? 'Already Sent' : 'Send Promo Code'}
          </Button>
        </span>
      </Tooltip>

      {/* Mark as Claimed button */}
      <Tooltip
        title={
          !subscriber.promoCodeSent
            ? 'Send promo code first'
            : subscriber.promoClaimed
              ? 'Promo already claimed'
              : 'Mark promo as claimed at the pub'
        }
      >
        <span>
          <Button
            size="small"
            variant={canMarkClaimed ? 'outlined' : 'text'}
            startIcon={
              isClaimingPromo ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <ClaimedIcon sx={{ fontSize: 15 }} />
              )
            }
            disabled={!canMarkClaimed || isClaimingPromo}
            onClick={() => onMarkClaimed(subscriber)}
            sx={{
              mr: 1,
              fontWeight: 600,
              fontSize: '0.72rem',
              borderRadius: 2,
              minWidth: 120,
              whiteSpace: 'nowrap',
              ...(canMarkClaimed
                ? {
                    borderColor: 'rgba(76, 175, 80, 0.5)',
                    color: 'success.main',
                    '&:hover': { borderColor: 'success.main', bgcolor: 'rgba(76, 175, 80, 0.05)' },
                  }
                : { color: 'text.disabled' }),
            }}
          >
            {isClaimingPromo ? 'Saving…' : subscriber.promoClaimed ? 'Claimed' : 'Mark Claimed'}
          </Button>
        </span>
      </Tooltip>

      {/* Delete */}
      <Tooltip title="Remove subscriber">
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'error.main', bgcolor: 'rgba(244, 67, 54, 0.08)' },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Card>
  );
};

export default NewsletterManagement;

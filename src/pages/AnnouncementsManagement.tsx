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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Fade,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Drafts as DraftsIcon,
  CheckCircle as SentIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────

type AnnouncementType =
  | 'general'
  | 'promotion'
  | 'closure'
  | 'menu_update'
  | 'community'
  | 'holiday';
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
type AnnouncementStatus = 'draft' | 'sending' | 'sent' | 'failed';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  recipientCount: number;
  sentAt: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementStats {
  total: number;
  sent: number;
  drafts: number;
  totalRecipients: number;
}

interface FormData {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  ctaText: string;
  ctaUrl: string;
}

// ─── Constants ────────────────────────────────────────────────

const ANNOUNCEMENT_TYPE_META: Record<
  AnnouncementType,
  { label: string; emoji: string; color: string; description: string }
> = {
  general: {
    label: 'General',
    emoji: '📢',
    color: '#C87941',
    description: 'General announcements & updates',
  },
  promotion: {
    label: 'Promotion',
    emoji: '🎁',
    color: '#E67E22',
    description: 'Deals, offers & promotions',
  },
  closure: {
    label: 'Closure Notice',
    emoji: '⚠️',
    color: '#E74C3C',
    description: 'Temporary closures & rescheduling',
  },
  menu_update: {
    label: 'Menu Update',
    emoji: '🍽️',
    color: '#27AE60',
    description: 'Menu changes & new dishes',
  },
  community: {
    label: 'Community',
    emoji: '🤝',
    color: '#3498DB',
    description: 'Community events & updates',
  },
  holiday: {
    label: 'Holiday',
    emoji: '🎄',
    color: '#8E44AD',
    description: 'Holiday greetings & seasonal notices',
  },
};

const PRIORITY_META: Record<
  AnnouncementPriority,
  { label: string; color: string }
> = {
  low: { label: 'Low', color: '#9E9E9E' },
  normal: { label: 'Normal', color: '#4CAF50' },
  high: { label: 'High', color: '#FF9800' },
  urgent: { label: 'Urgent', color: '#F44336' },
};

const STATUS_META: Record<
  AnnouncementStatus,
  { label: string; color: string }
> = {
  draft: { label: 'Draft', color: '#9E9E9E' },
  sending: { label: 'Sending...', color: '#2196F3' },
  sent: { label: 'Sent', color: '#4CAF50' },
  failed: { label: 'Failed', color: '#F44336' },
};

const INITIAL_FORM: FormData = {
  title: '',
  content: '',
  type: 'general',
  priority: 'normal',
  ctaText: '',
  ctaUrl: '',
};

// ─── Component ────────────────────────────────────────────────

const AnnouncementsManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AnnouncementStats>({
    total: 0,
    sent: 0,
    drafts: 0,
    totalRecipients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AnnouncementStatus>(
    'all',
  );

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Send/Delete confirmation
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [sending, setSending] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [announcementsRes, statsRes] = await Promise.all([
        api.get<Announcement[]>('/announcements'),
        api.get<AnnouncementStats>('/announcements/stats'),
      ]);
      setAnnouncements(announcementsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      logger.error('Failed to fetch announcements:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Filtering ──────────────────────────────────────────────

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchTerm, filterStatus]);

  // ─── Handlers ───────────────────────────────────────────────

  const openCreateForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      ctaText: announcement.ctaText || '',
      ctaUrl: announcement.ctaUrl || '',
    });
    setEditingId(announcement.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        ctaText: formData.ctaText || undefined,
        ctaUrl: formData.ctaUrl || undefined,
      };

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload);
        showToast('Announcement updated', 'success');
      } else {
        await api.post('/announcements', payload);
        showToast('Announcement saved as draft', 'success');
      }
      setFormOpen(false);
      fetchData();
    } catch (error) {
      logger.error('Failed to save announcement:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!selectedAnnouncement) return;
    setSending(true);
    try {
      await api.post(`/announcements/${selectedAnnouncement.id}/send`);
      showToast('Announcement sent to all active subscribers!', 'success');
      setSendDialogOpen(false);
      setSelectedAnnouncement(null);
      fetchData();
    } catch (error) {
      logger.error('Failed to send announcement:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await api.delete(`/announcements/${selectedAnnouncement.id}`);
      showToast('Announcement deleted', 'success');
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      fetchData();
    } catch (error) {
      logger.error('Failed to delete announcement:', error);
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ─── Summary Stats ─────────────────────────────────────────

  const summaryStats: StatItem[] = [
    {
      label: 'Total Announcements',
      value: stats.total,
      icon: <CampaignIcon />,
      color: '#C87941',
    },
    { label: 'Sent', value: stats.sent, icon: <SentIcon />, color: '#4CAF50' },
    {
      label: 'Drafts',
      value: stats.drafts,
      icon: <DraftsIcon />,
      color: '#FF9800',
    },
    {
      label: 'Total Recipients',
      value: stats.totalRecipients,
      icon: <GroupIcon />,
      color: '#2196F3',
    },
  ];

  // ─── Render ─────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Announcements"
        subtitle="Create and send announcements to your newsletter subscribers"
        icon={<CampaignIcon sx={{ fontSize: 32, color: '#C87941' }} />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateForm}
              sx={{
                bgcolor: '#C87941',
                '&:hover': { bgcolor: '#A0612F' },
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              New Announcement
            </Button>
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
          placeholder="Search announcements..."
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
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#C87941',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#C87941',
              },
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'draft', 'sent', 'failed'] as const).map((status) => (
            <Chip
              key={status}
              label={
                status === 'all' ? 'All' : STATUS_META[status]?.label || status
              }
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
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', ml: 'auto' }}
        >
          Showing {filteredAnnouncements.length} of {announcements.length}
        </Typography>
      </Box>

      {/* Announcement List */}
      {filteredAnnouncements.length === 0 ? (
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
            <CampaignIcon
              sx={{ fontSize: 64, color: 'rgba(200, 121, 65, 0.3)', mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              {searchTerm || filterStatus !== 'all'
                ? 'No matching announcements'
                : 'No announcements yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first announcement to reach your subscribers'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredAnnouncements.map((announcement) => {
            const typeMeta = ANNOUNCEMENT_TYPE_META[announcement.type];
            const statusMeta = STATUS_META[announcement.status];
            const priorityMeta = PRIORITY_META[announcement.priority];

            return (
              <Card
                key={announcement.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor:
                    announcement.status === 'draft'
                      ? 'rgba(200, 121, 65, 0.12)'
                      : 'rgba(0, 0, 0, 0.06)',
                  borderLeft: `4px solid ${typeMeta.color}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-1px)',
                    borderColor: 'rgba(200, 121, 65, 0.15)',
                  },
                }}
              >
                {/* Type indicator */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(typeMeta.color, 0.1),
                    mr: 2,
                    flexShrink: 0,
                    fontSize: 22,
                  }}
                >
                  {typeMeta.emoji}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
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
                      {announcement.title}
                    </Typography>
                    {(announcement.priority === 'high' ||
                      announcement.priority === 'urgent') && (
                      <Chip
                        label={priorityMeta.label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: alpha(priorityMeta.color, 0.12),
                          color: priorityMeta.color,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 500,
                    }}
                  >
                    {announcement.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                  >
                    {typeMeta.label}
                    {' · '}
                    Created{' '}
                    {moment(announcement.createdAt)
                      .tz('America/Toronto')
                      .format('MMM D, YYYY [at] h:mm A')}
                    {announcement.sentAt && (
                      <>
                        {' · Sent '}
                        {moment(announcement.sentAt)
                          .tz('America/Toronto')
                          .format('MMM D, YYYY [at] h:mm A')}
                        {' · '}
                        {announcement.recipientCount} recipient
                        {announcement.recipientCount !== 1 ? 's' : ''}
                      </>
                    )}
                  </Typography>
                </Box>

                {/* Status */}
                <Chip
                  label={statusMeta.label}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mx: 1,
                    bgcolor: alpha(statusMeta.color, 0.1),
                    color: statusMeta.color,
                  }}
                />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
                  {announcement.status === 'draft' && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditForm(announcement)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              color: '#C87941',
                              bgcolor: 'rgba(200, 121, 65, 0.08)',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send to subscribers">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setSendDialogOpen(true);
                          }}
                          sx={{
                            color: '#4CAF50',
                            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' },
                          }}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                          bgcolor: 'rgba(244, 67, 54, 0.08)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ─── Create / Edit Dialog ──────────────────────────────── */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {editingId ? 'Edit Announcement' : 'New Announcement'}
          <IconButton onClick={() => setFormOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}
          >
            {/* Type Selection */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}
              >
                Announcement Type
              </Typography>
              <Grid container spacing={1.5}>
                {(
                  Object.entries(ANNOUNCEMENT_TYPE_META) as [
                    AnnouncementType,
                    (typeof ANNOUNCEMENT_TYPE_META)[AnnouncementType],
                  ][]
                ).map(([key, meta]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <Card
                      onClick={() => setFormData((p) => ({ ...p, type: key }))}
                      sx={{
                        cursor: 'pointer',
                        p: 1.5,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor:
                          formData.type === key
                            ? meta.color
                            : 'rgba(0,0,0,0.08)',
                        bgcolor:
                          formData.type === key
                            ? alpha(meta.color, 0.06)
                            : 'transparent',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: alpha(meta.color, 0.5),
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: 24, mb: 0.5 }}>
                        {meta.emoji}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        {meta.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.68rem' }}
                      >
                        {meta.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Title */}
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., Happy Hour Extended This Weekend!"
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.title.length}/200`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C87941',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C87941' },
              }}
            />

            {/* Content */}
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={5}
              value={formData.content}
              onChange={(e) =>
                setFormData((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Write the announcement content that subscribers will receive in their email..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C87941',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C87941' },
              }}
            />

            {/* Priority */}
            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#C87941' } }}>
                Priority
              </InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    priority: e.target.value as AnnouncementPriority,
                  }))
                }
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C87941',
                  },
                }}
              >
                {(
                  Object.entries(PRIORITY_META) as [
                    AnnouncementPriority,
                    (typeof PRIORITY_META)[AnnouncementPriority],
                  ][]
                ).map(([key, meta]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: meta.color,
                        }}
                      />
                      {meta.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Optional CTA */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
              >
                Call to Action (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Button Text"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ctaText: e.target.value }))
                  }
                  placeholder="e.g., Learn More"
                  inputProps={{ maxLength: 50 }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#C87941',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#C87941' },
                  }}
                />
                <TextField
                  size="small"
                  label="Button URL"
                  value={formData.ctaUrl}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ctaUrl: e.target.value }))
                  }
                  placeholder="https://brooklinpub.com/..."
                  sx={{
                    flex: 2,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#C87941',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#C87941' },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setFormOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              saving || !formData.title.trim() || !formData.content.trim()
            }
            sx={{
              bgcolor: '#C87941',
              '&:hover': { bgcolor: '#A0612F' },
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Save as Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Send Confirmation Dialog ──────────────────────────── */}
      <Dialog
        open={sendDialogOpen}
        onClose={() => !sending && setSendDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 500 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <SendIcon sx={{ color: '#4CAF50' }} />
          Send Announcement
        </DialogTitle>
        <DialogContent>
          {selectedAnnouncement && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to send this announcement to{' '}
                <strong>all active subscribers</strong>?
              </Typography>
              <Card
                sx={{
                  p: 2,
                  bgcolor: 'rgba(200, 121, 65, 0.04)',
                  border: '1px solid rgba(200, 121, 65, 0.12)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {ANNOUNCEMENT_TYPE_META[selectedAnnouncement.type].emoji}{' '}
                  {selectedAnnouncement.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mt: 0.5 }}
                >
                  Type:{' '}
                  {ANNOUNCEMENT_TYPE_META[selectedAnnouncement.type].label}
                  {' · '}Priority:{' '}
                  {PRIORITY_META[selectedAnnouncement.priority].label}
                </Typography>
              </Card>
              {(selectedAnnouncement.priority === 'high' ||
                selectedAnnouncement.priority === 'urgent') && (
                <Fade in>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 2,
                      p: 1.5,
                      bgcolor: 'rgba(255, 152, 0, 0.08)',
                      borderRadius: 1.5,
                    }}
                  >
                    <WarningIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#E65100' }}>
                      This is a{' '}
                      <strong>{selectedAnnouncement.priority} priority</strong>{' '}
                      announcement. It will be prominently highlighted in the
                      email.
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setSendDialogOpen(false)}
            disabled={sending}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={sending}
            startIcon={<SendIcon />}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#388E3C' },
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {sending ? 'Sending...' : 'Send Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 440 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to permanently delete{' '}
            <strong>{selectedAnnouncement?.title}</strong>? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementsManagement;

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TablePagination,
  Checkbox,
  FormControlLabel,
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
  Print as PrintIcon,
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

interface PaginatedSubscribersResponse {
  data: Subscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  // Subscriber list state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter + search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  // Debounced search value — only sent to the API after 350 ms of no typing
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Other UI state
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    promoSent: 0,
    promoPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [sendingPromo, setSendingPromo] = useState<Record<string, boolean>>({});
  const [claimingPromo, setClaimingPromo] = useState<Record<string, boolean>>({});

  // ─── Selection state (for print) ─────────────────────────────────────────
  // Map preserves full Subscriber objects so cross-page selections can be printed
  const [selectedSubscribers, setSelectedSubscribers] = useState<Map<string, Subscriber>>(new Map());

  // ─── Debounce search input ────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
      setSelectedSubscribers(new Map()); // Clear when search context changes
    }, 350);
  };

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page + 1, // API is 1-indexed
        limit: rowsPerPage,
        status: filterStatus,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get<PaginatedSubscribersResponse>('/newsletter/subscribers', { params });
      setSubscribers(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      logger.error('Failed to fetch subscribers:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterStatus, debouncedSearch, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<NewsletterStats>('/newsletter/stats');
      setStats(res.data);
    } catch (error) {
      logger.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchAll = useCallback(() => {
    void fetchSubscribers();
    void fetchStats();
  }, [fetchSubscribers, fetchStats]);

  useEffect(() => {
    void fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // ─── Pagination handlers ─────────────────────────────────────────────────

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    // Selection intentionally preserved — user may select across multiple pages
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
    // Selection intentionally preserved across page-size changes
  };

  const handleFilterChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setPage(0);
    setSelectedSubscribers(new Map()); // Clear when context changes
  };

  // ─── Action handlers ─────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!subscriberToDelete) return;
    try {
      await api.delete(`/newsletter/subscribers/${subscriberToDelete.id}`);
      showToast('Subscriber removed successfully', 'success');
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      fetchAll();
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

  const handleCopyEmails = async () => {
    try {
      // Fetch all active emails (no pagination) for clipboard copy
      const res = await api.get<PaginatedSubscribersResponse>('/newsletter/subscribers', {
        params: { page: 1, limit: 1000, status: 'active' },
      });
      const emails = res.data.data.map((s) => s.email).join(', ');
      await navigator.clipboard.writeText(emails);
      showToast(`Copied ${res.data.total} active emails`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ─── Selection helpers ────────────────────────────────────────────────────

  const handleToggleSelect = (subscriber: Subscriber) => {
    setSelectedSubscribers((prev) => {
      const next = new Map(prev);
      if (next.has(subscriber.id)) next.delete(subscriber.id);
      else next.set(subscriber.id, subscriber);
      return next;
    });
  };

  const allOnPageSelected =
    subscribers.length > 0 && subscribers.every((s) => selectedSubscribers.has(s.id));

  const someOnPageSelected =
    subscribers.some((s) => selectedSubscribers.has(s.id)) && !allOnPageSelected;

  const handleSelectAllPage = () => {
    if (allOnPageSelected) {
      setSelectedSubscribers((prev) => {
        const next = new Map(prev);
        subscribers.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedSubscribers((prev) => {
        const next = new Map(prev);
        subscribers.forEach((s) => next.set(s.id, s));
        return next;
      });
    }
  };

  const handlePrintSelected = () => {
    const toPrint = Array.from(selectedSubscribers.values());
    if (toPrint.length === 0) return;

    const formatDate = (iso: string | null, includeTime = false) => {
      if (!iso) return '—';
      const fmt = includeTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY';
      return moment(iso).tz('America/Toronto').format(fmt);
    };

    const logoUrl = `${window.location.origin}/brooklinpub-logo.png`;

    const rows = toPrint
      .map(
        (s, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td class="num">${i + 1}</td>
          <td class="email">${s.email}</td>
          <td><span class="badge ${s.isActive ? 'active' : 'inactive'}">${s.isActive ? 'Active' : 'Unsub'}</span></td>
          <td>${formatDate(s.subscribedAt)}</td>
          <td class="mono">${s.promoCode ?? '—'}</td>
          <td><span class="badge ${s.promoClaimed ? 'claimed' : s.promoCodeSent ? 'sent' : 'pending'}">${s.promoClaimed ? 'Claimed' : s.promoCodeSent ? 'Sent' : 'Pending'}</span></td>
          <td>${s.promoSentAt ? formatDate(s.promoSentAt) : '—'}</td>
          <td>${s.promoClaimedAt ? formatDate(s.promoClaimedAt) : '—'}</td>
        </tr>`,
      )
      .join('');

    const filterLabel = filterOptions.find((f) => f.value === filterStatus)?.label ?? 'All';
    const printedAt = moment().tz('America/Toronto').format('MMMM D, YYYY [at] h:mm A');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Newsletter Subscribers — Brooklin Pub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { height: 100%; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10px;
      color: #1a1a1a;
      padding: 96px 0 48px 0;
    }

    @page {
      size: letter portrait;
      margin: 0.45in;
      /* Clear every margin-box slot so Chrome/Edge show nothing in the
         header/footer strip (date, title, URL, page number).
         Supported in Chrome 131+ (Nov 2024) and Edge. */
      @top-left      { content: ''; }
      @top-center    { content: ''; }
      @top-right     { content: ''; }
      @bottom-left   { content: ''; }
      @bottom-center { content: ''; }
      @bottom-right  { content: ''; }
    }

    /* ── Fixed header — repeats on every printed page ── */
    .page-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #fff;
      padding: 14px 0 10px 0;
      border-bottom: 2.5px solid #C87941;
      z-index: 100;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 100%;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 5px;
      flex-shrink: 0;
    }
    .brand-text h1 { font-size: 15px; font-weight: 800; color: #C87941; letter-spacing: -0.3px; }
    .brand-text .tagline { font-size: 9.5px; color: #999; margin-top: 1px; }
    .brand-text .report-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 9px;
      font-weight: 700;
      color: #fff;
      background: #C87941;
      padding: 2px 8px;
      border-radius: 9px;
      letter-spacing: 0.3px;
    }
    .meta { text-align: right; flex-shrink: 0; }
    .meta p { font-size: 9px; color: #666; line-height: 1.7; }
    .meta strong { color: #1a1a1a; }

    /* ── Fixed footer — repeats on every printed page ── */
    .page-footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #fff;
      border-top: 1.5px solid #e0c9b0;
      padding: 7px 0 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }
    .page-footer p { font-size: 8.5px; color: #bbb; }

    /* ── Content area ── */
    .content { width: 100%; }

    /* ── Summary bar ── */
    .summary {
      display: flex;
      gap: 0;
      margin-bottom: 14px;
      border: 1px solid #e8d5c0;
      border-radius: 7px;
      overflow: hidden;
    }
    .summary-item {
      flex: 1;
      text-align: center;
      padding: 9px 4px;
      border-right: 1px solid #e8d5c0;
    }
    .summary-item:last-child { border-right: none; }
    .summary-item .val { font-size: 18px; font-weight: 800; color: #C87941; line-height: 1; }
    .summary-item .lbl { font-size: 8px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
    thead tr { background: #C87941; }
    thead th {
      padding: 7px 8px;
      text-align: left;
      font-weight: 700;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #fff;
      white-space: nowrap;
    }
    thead th.num { width: 24px; text-align: center; }
    tbody tr.even { background: #fff; }
    tbody tr.odd  { background: #fdf8f4; }
    td {
      padding: 6px 8px;
      vertical-align: middle;
      border-bottom: 1px solid #f0e8df;
    }
    td.num { text-align: center; color: #bbb; font-size: 8.5px; }
    td.email { font-weight: 600; color: #111; word-break: break-all; max-width: 180px; }
    td.mono { font-family: 'Courier New', monospace; font-weight: 700; color: #1565c0; font-size: 9px; letter-spacing: 1px; }

    /* ── Badges ── */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .badge.active   { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fff3e0; color: #bf360c; }
    .badge.sent     { background: #e3f2fd; color: #1565c0; }
    .badge.claimed  { background: #e8f5e9; color: #2e7d32; }
    .badge.pending  { background: #f5f5f5; color: #757575; }

    @media print {
      body { padding: 96px 0 48px 0; }
    }
  </style>
</head>
<body>

  <!-- Fixed header: appears at the top of every printed page -->
  <div class="page-header">
    <div class="header-inner">
      <div class="brand">
        <img class="brand-logo" src="${logoUrl}" alt="Brooklin Pub Logo" />
        <div class="brand-text">
          <h1>Brooklin Pub</h1>
          <div class="tagline">Newsletter Management System</div>
          <span class="report-badge">Subscriber Report</span>
        </div>
      </div>
      <div class="meta">
        <p><strong>Printed:</strong> ${printedAt}</p>
        <p><strong>Filter:</strong> ${filterLabel}${debouncedSearch ? ` &middot; &ldquo;${debouncedSearch}&rdquo;` : ''}</p>
        <p><strong>Selected:</strong> ${toPrint.length} subscriber${toPrint.length !== 1 ? 's' : ''}</p>
        <p><strong>Total in DB:</strong> ${total}</p>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="content">
    <div class="summary">
      <div class="summary-item">
        <div class="val">${toPrint.length}</div>
        <div class="lbl">Printed</div>
      </div>
      <div class="summary-item">
        <div class="val">${toPrint.filter((s) => s.isActive).length}</div>
        <div class="lbl">Active</div>
      </div>
      <div class="summary-item">
        <div class="val">${toPrint.filter((s) => !s.isActive).length}</div>
        <div class="lbl">Unsubscribed</div>
      </div>
      <div class="summary-item">
        <div class="val">${toPrint.filter((s) => s.promoCodeSent).length}</div>
        <div class="lbl">Promo Sent</div>
      </div>
      <div class="summary-item">
        <div class="val">${toPrint.filter((s) => s.promoClaimed).length}</div>
        <div class="lbl">Claimed</div>
      </div>
      <div class="summary-item">
        <div class="val">${toPrint.filter((s) => s.isActive && !s.promoCodeSent).length}</div>
        <div class="lbl">Need Promo</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Email Address</th>
          <th>Sub Status</th>
          <th>Subscribed On</th>
          <th>Promo Code</th>
          <th>Promo Status</th>
          <th>Promo Sent</th>
          <th>Promo Claimed</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>

  <!-- Fixed footer: appears at the bottom of every printed page -->
  <div class="page-footer">
    <p>Brooklin Pub &mdash; Confidential, for internal use only</p>
    <p>Generated ${printedAt}</p>
  </div>

  <script>
    var img = document.querySelector('.brand-logo');
    if (img) {
      img.onload = function() { window.print(); };
      img.onerror = function() { window.print(); }; // print even if logo fails
    } else {
      window.print();
    }
  </script>
</body>
</html>`;

    // Use a Blob URL so @page { margin: 0 } in the HTML fully suppresses
    // the browser's built-in print header/footer (date, title, URL).
    // @page only takes effect in a top-level browsing context, not an iframe.
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank', 'width=900,height=750');
    if (win) {
      win.addEventListener('load', () => {
        URL.revokeObjectURL(blobUrl);
      }, { once: true });
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────

  const summaryStats: StatItem[] = [
    { label: 'Total Subscribers', value: stats.total, icon: <GroupIcon />, color: '#C87941' },
    { label: 'Active Subscribers', value: stats.active, icon: <ActiveIcon />, color: '#4CAF50' },
    { label: 'Promo Code Sent', value: stats.promoSent, icon: <SentPromoIcon />, color: '#2196F3' },
    { label: 'Pending Promo', value: stats.promoPending, icon: <PendingPromoIcon />, color: '#FF9800' },
  ];

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
    { value: 'promo_pending', label: 'Need Promo' },
    { value: 'promo_sent', label: 'Promo Sent' },
    { value: 'promo_claimed', label: 'Claimed' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Newsletter"
        subtitle="Manage your newsletter subscribers and send promo codes"
        icon={<EmailIcon sx={{ fontSize: 32, color: '#C87941' }} />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {selectedSubscribers.size > 0 && (
              <Tooltip title={`Print ${selectedSubscribers.size} selected subscriber${selectedSubscribers.size !== 1 ? 's' : ''} as PDF`}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintSelected}
                  sx={{
                    bgcolor: '#C87941',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#A0612F', boxShadow: 'none' },
                  }}
                >
                  Print PDF ({selectedSubscribers.size})
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Copy all active emails to clipboard">
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyEmails}
                disabled={stats.active === 0}
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
              <IconButton onClick={fetchAll} sx={{ color: '#C87941' }}>
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 1.5, bgcolor: '#1877F2',
              color: '#fff', textDecoration: 'none',
              '&:hover': { opacity: 0.85 }, transition: 'opacity 0.2s',
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 1.5, bgcolor: '#E1306C',
              color: '#fff', textDecoration: 'none',
              '&:hover': { opacity: 0.85 }, transition: 'opacity 0.2s',
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 1.5, bgcolor: '#010101',
              color: '#fff', textDecoration: 'none',
              '&:hover': { opacity: 0.85 }, transition: 'opacity 0.2s',
            }}
          >
            <FaTiktok size={14} />
          </Box>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
          These links appear in every newsletter email sent to subscribers.
        </Typography>
      </Box>

      {/* Filters + search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Select-all checkbox for current page */}
        <Tooltip title={allOnPageSelected ? 'Deselect all on this page' : 'Select all on this page'}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={handleSelectAllPage}
                disabled={subscribers.length === 0}
                sx={{
                  color: 'rgba(200, 121, 65, 0.5)',
                  '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#C87941' },
                  p: 0.5,
                }}
              />
            }
            label={
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {selectedSubscribers.size > 0 ? `${selectedSubscribers.size} selected` : 'Select page'}
              </Typography>
            }
            sx={{ m: 0, userSelect: 'none' }}
          />
        </Tooltip>
        <TextField
          size="small"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
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
              onClick={() => handleFilterChange(value)}
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
          {total > 0 ? `${total} subscriber${total !== 1 ? 's' : ''}` : 'No results'}
        </Typography>
      </Box>

      {/* Subscriber list */}
      {!loading && subscribers.length === 0 ? (
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
              {debouncedSearch || filterStatus !== 'all' ? 'No matching subscribers' : 'No subscribers yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {debouncedSearch || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Subscribers will appear here when users sign up via the website newsletter form'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {subscribers.map((subscriber) => (
            <SubscriberRow
              key={subscriber.id}
              subscriber={subscriber}
              selected={selectedSubscribers.has(subscriber.id)}
              onToggleSelect={handleToggleSelect}
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

      {/* Pagination */}
      {total > 0 && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(200, 121, 65, 0.08)',
            borderRadius: 2,
          }}
        >
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="Per page:"
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: 'text.secondary',
                fontSize: '0.8rem',
              },
              '& .MuiTablePagination-select': { color: '#C87941', fontWeight: 600 },
              '& .MuiIconButton-root': { color: '#C87941' },
              '& .MuiIconButton-root.Mui-disabled': { color: 'rgba(0,0,0,0.26)' },
            }}
          />
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
  selected: boolean;
  onToggleSelect: (subscriber: Subscriber) => void;
  isSendingPromo: boolean;
  isClaimingPromo: boolean;
  onSendPromo: (subscriber: Subscriber) => void;
  onMarkClaimed: (subscriber: Subscriber) => void;
  onDelete: () => void;
}

const SubscriberRow: React.FC<SubscriberRowProps> = ({
  subscriber,
  selected,
  onToggleSelect,
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
        px: 2,
        py: 1.5,
        background: selected ? 'rgba(200, 121, 65, 0.06)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: selected
          ? 'rgba(200, 121, 65, 0.35)'
          : subscriber.isActive
            ? 'rgba(200, 121, 65, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        opacity: subscriber.isActive ? 1 : 0.7,
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
          borderColor: selected ? 'rgba(200, 121, 65, 0.5)' : 'rgba(200, 121, 65, 0.15)',
        },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: { xs: 1, sm: 0 },
      }}
    >
      {/* Selection checkbox */}
      <Checkbox
        checked={selected}
        onChange={() => onToggleSelect(subscriber)}
        size="small"
        sx={{
          mr: 0.5,
          flexShrink: 0,
          color: 'rgba(200, 121, 65, 0.4)',
          '&.Mui-checked': { color: '#C87941' },
          p: 0.5,
        }}
      />

      {/* Status icon */}
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: subscriber.isActive
            ? (theme) => alpha(theme.palette.success.main, 0.1)
            : (theme) => alpha(theme.palette.warning.main, 0.1),
          mr: 2, flexShrink: 0,
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
          sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
          fontWeight: 600, fontSize: '0.72rem', mx: { xs: 0, sm: 1.5 },
          ...(subscriber.isActive
            ? { bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.dark' }
            : { bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' }),
        }}
      />

      {/* Promo status chip */}
      <Chip
        label={subscriber.promoClaimed ? 'Claimed' : subscriber.promoCodeSent ? 'Sent' : 'Not Sent'}
        size="small"
        sx={{
          fontWeight: 600, fontSize: '0.72rem', mr: { xs: 0, sm: 1.5 },
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
            startIcon={isSendingPromo ? <CircularProgress size={13} color="inherit" /> : <PromoIcon sx={{ fontSize: 15 }} />}
            disabled={!canSendPromo || isSendingPromo}
            onClick={() => onSendPromo(subscriber)}
            sx={{
              mr: 1, fontWeight: 600, fontSize: '0.72rem', borderRadius: 2,
              minWidth: 130, whiteSpace: 'nowrap',
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
            startIcon={isClaimingPromo ? <CircularProgress size={13} color="inherit" /> : <ClaimedIcon sx={{ fontSize: 15 }} />}
            disabled={!canMarkClaimed || isClaimingPromo}
            onClick={() => onMarkClaimed(subscriber)}
            sx={{
              mr: 1, fontWeight: 600, fontSize: '0.72rem', borderRadius: 2,
              minWidth: 120, whiteSpace: 'nowrap',
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
          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'rgba(244, 67, 54, 0.08)' } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Card>
  );
};

export default NewsletterManagement;

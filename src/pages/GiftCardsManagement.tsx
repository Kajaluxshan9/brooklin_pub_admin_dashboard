import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ActiveIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  PointOfSale as RedeemIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import { useGlobalToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────────────────────

type GiftCardStatus =
  | 'pending_verification'
  | 'active'
  | 'rejected'
  | 'fully_redeemed'
  | 'frozen'
  | 'void';

interface GiftCard {
  id: string;
  code: string;
  status: GiftCardStatus;
  source: 'online' | 'admin';
  paymentMethod: 'interac' | 'bank_deposit' | 'in_store' | 'complimentary';
  requestedAmount: number;
  approvedAmount: number | null;
  balance: number;
  isLocked: boolean;
  lockedAt: string | null;
  failedPinAttempts: number;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  isForSelf: boolean;
  recipientName: string;
  recipientEmail: string | null;
  message: string | null;
  hasSlip: boolean;
  slipMimeType: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  approvalNote: string | null;
  rejectionReason: string | null;
  activatedAt: string | null;
  createdAt: string;
}

interface GiftCardTransaction {
  id: string;
  type: string;
  amountCents: number | null;
  balanceAfterCents: number | null;
  note: string | null;
  performedByName: string | null;
  createdAt: string;
}

interface GiftCardDetail extends GiftCard {
  transactions: GiftCardTransaction[];
}

interface GiftCardStats {
  pendingCount: number;
  oldestPendingAt: string | null;
  activeCount: number;
  lockedCount: number;
  outstandingBalance: number;
  soldThisMonth: number;
  soldCountThisMonth: number;
  redeemedThisMonth: number;
}

interface GiftCardSettings {
  isEnabled: boolean;
  presetAmounts: number[];
  customAmountEnabled: boolean;
  customAmountMin: number;
  customAmountMax: number;
  interacEnabled: boolean;
  interacEmail: string | null;
  interacRecipientName: string | null;
  interacInstructions: string | null;
  bankDepositEnabled: boolean;
  bankName: string | null;
  bankAccountName: string | null;
  bankInstitutionNumber: string | null;
  bankTransitNumber: string | null;
  bankAccountNumber: string | null;
  bankInstructions: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TZ = 'America/Toronto';
const money = (n: number | null | undefined) =>
  `$${(n ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string | null) => (d ? moment(d).tz(TZ).format('MMM D, YYYY h:mm A') : '—');
const daysAgo = (d: string) => moment().diff(moment(d), 'days');

const STATUS_META: Record<GiftCardStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default' | 'info' }> = {
  pending_verification: { label: 'Pending', color: 'warning' },
  active: { label: 'Active', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  fully_redeemed: { label: 'Fully used', color: 'default' },
  frozen: { label: 'Frozen', color: 'info' },
  void: { label: 'Void', color: 'error' },
};

const PAYMENT_LABEL: Record<GiftCard['paymentMethod'], string> = {
  interac: 'Interac e-Transfer',
  bank_deposit: 'Bank deposit',
  in_store: 'In-store',
  complimentary: 'Complimentary',
};

const TX_LABEL: Record<string, string> = {
  issue: 'Issued',
  redeem: 'Redeemed',
  adjust: 'Adjusted',
  void: 'Voided',
  reject: 'Rejected',
  freeze: 'Frozen',
  unfreeze: 'Unfrozen',
  lock: 'Locked',
  unlock: 'Unlocked',
  pin_reset: 'PIN reset',
  email_resent: 'Email resent',
};

/**
 * index.css paints every <button> with the brand gradient. Neutralise that for
 * text/outlined buttons, tabs and icon buttons inside this page and its dialogs.
 */
const buttonResetSx = {
  '& .MuiButton-text, & .MuiButton-outlined, & .MuiTab-root, & .MuiIconButton-root': {
    background: 'transparent',
    boxShadow: 'none',
    '&::before': { display: 'none' },
    '&:hover': { background: 'rgba(200, 121, 65, 0.08)', transform: 'none', boxShadow: 'none' },
  },
  '& .MuiButton-text.Mui-disabled, & .MuiButton-outlined.Mui-disabled': { background: 'transparent' },
} as const;

const StatusChips: React.FC<{ card: GiftCard }> = ({ card }) => (
  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
    <Chip size="small" label={STATUS_META[card.status].label} color={STATUS_META[card.status].color} />
    {card.isLocked && <Chip size="small" icon={<LockIcon />} label="Locked" color="error" variant="outlined" />}
  </Box>
);

// ─── Slip viewer (fetches the private file with the admin's cookie) ───────────

const SlipViewer: React.FC<{ card: GiftCard }> = ({ card }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!card.hasSlip) return;
    let objectUrl: string | null = null;
    api
      .get(`/giftcards/admin/${card.id}/slip`, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data as Blob);
        setUrl(objectUrl);
      })
      .catch((e) => setError(getErrorMessage(e)));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [card.id, card.hasSlip]);

  if (!card.hasSlip) return <Alert severity="info">No payment slip (issued by staff).</Alert>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!url) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;

  const isPdf = card.slipMimeType === 'application/pdf';
  return (
    <Box>
      {isPdf ? (
        <Box component="iframe" title="Payment slip" src={url} sx={{ width: '100%', height: 420, border: '1px solid #eee', borderRadius: 2 }} />
      ) : (
        <Box component="img" src={url} alt="Payment slip" sx={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 2, border: '1px solid #eee', bgcolor: '#fafafa' }} />
      )}
      <Button size="small" href={url} target="_blank" rel="noopener" sx={{ mt: 1 }}>
        Open full size
      </Button>
    </Box>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const GiftCardsManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<GiftCardStats | null>(null);

  // list state
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // dialogs
  const [detail, setDetail] = useState<GiftCardDetail | null>(null);
  const [reviewCard, setReviewCard] = useState<GiftCard | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [shownPin, setShownPin] = useState<{ code: string; pin: string } | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get<GiftCardStats>('/giftcards/admin/stats');
      setStats(res.data);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
  }, [showToast]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: page + 1, limit: rowsPerPage };
      if (tab === 0) params.status = 'pending_verification';
      else if (statusFilter === 'locked') params.locked = 'true';
      else if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get<{ items: GiftCard[]; total: number }>('/giftcards/admin', { params });
      setCards(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tab, statusFilter, search, showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (tab <= 1) {
      const t = setTimeout(loadCards, search ? 300 : 0);
      return () => clearTimeout(t);
    }
  }, [loadCards, tab, search]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStats(), tab <= 1 ? loadCards() : Promise.resolve()]);
  }, [loadStats, loadCards, tab]);

  const openDetail = useCallback(
    async (id: string) => {
      try {
        const res = await api.get<GiftCardDetail>(`/giftcards/admin/${id}`);
        setDetail(res.data);
      } catch (e) {
        showToast(getErrorMessage(e), 'error');
      }
    },
    [showToast],
  );

  const summary: StatItem[] = useMemo(
    () => [
      { label: 'Pending approval', value: stats?.pendingCount ?? 0, icon: <PendingIcon />, color: '#ED6C02' },
      { label: 'Active cards', value: stats?.activeCount ?? 0, icon: <ActiveIcon />, color: '#2E7D32' },
      { label: 'Outstanding balance', value: money(stats?.outstandingBalance), icon: <MoneyIcon />, color: '#C87941' },
      { label: 'Sold this month', value: money(stats?.soldThisMonth), icon: <GiftIcon />, color: '#6A3A1E' },
      { label: 'Locked cards', value: stats?.lockedCount ?? 0, icon: <LockIcon />, color: '#D32F2F' },
    ],
    [stats],
  );

  return (
    <Box sx={buttonResetSx}>
      <PageHeader
        title="Gift Cards"
        subtitle="Verify bank-transfer orders, redeem cards at the till and manage balances"
        icon={<GiftIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<RefreshIcon />} onClick={refreshAll}>Refresh</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIssueOpen(true)}>
              Issue card
            </Button>
          </Box>
        }
      />

      <SummaryStats stats={summary} columns={5} />

      {stats && stats.pendingCount > 0 && stats.oldestPendingAt && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {stats.pendingCount} order{stats.pendingCount === 1 ? '' : 's'} awaiting payment verification — oldest waiting{' '}
          {daysAgo(stats.oldestPendingAt)} day{daysAgo(stats.oldestPendingAt) === 1 ? '' : 's'}.
        </Alert>
      )}

      <Card sx={{ mt: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setPage(0);
          }}
          variant="scrollable"
          sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}
        >
          <Tab label={`Pending${stats?.pendingCount ? ` (${stats.pendingCount})` : ''}`} />
          <Tab label="All cards" />
          <Tab label="Redeem" icon={<RedeemIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Settings" />
        </Tabs>
        <CardContent>
          {tab <= 1 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search ID, name, email, phone"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 280, flex: 1 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
                />
                {tab === 1 && (
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <MenuItem key={k} value={k}>{v.label}</MenuItem>
                    ))}
                    <MenuItem value="locked">Locked</MenuItem>
                  </TextField>
                )}
              </Box>

              {loading ? (
                <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
              ) : cards.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  {tab === 0 ? 'No orders waiting for approval 🎉' : 'No gift cards found'}
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Gift card ID</TableCell>
                        <TableCell>Buyer</TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell align="right">{tab === 0 ? 'Requested' : 'Balance'}</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>{tab === 0 ? 'Waiting' : 'Created'}</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cards.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{c.buyerName}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.buyerEmail || c.buyerPhone || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{c.isForSelf ? 'Self' : c.recipientName}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.isForSelf ? '' : c.recipientEmail}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            {tab === 0 ? money(c.requestedAmount) : `${money(c.balance)} / ${money(c.approvedAmount ?? c.requestedAmount)}`}
                          </TableCell>
                          <TableCell>{PAYMENT_LABEL[c.paymentMethod]}</TableCell>
                          <TableCell><StatusChips card={c} /></TableCell>
                          <TableCell>
                            {tab === 0 ? (
                              <Chip size="small" variant="outlined" color={daysAgo(c.createdAt) >= 7 ? 'error' : 'default'} label={`${daysAgo(c.createdAt)}d`} />
                            ) : (
                              fmtDate(c.createdAt)
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {tab === 0 || c.status === 'pending_verification' || c.status === 'rejected' ? (
                              <Button size="small" variant="contained" onClick={() => setReviewCard(c)}>Review</Button>
                            ) : (
                              <Tooltip title="Details">
                                <IconButton size="small" onClick={() => openDetail(c.id)}><ViewIcon /></IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}

          {tab === 2 && <RedeemPanel onDone={refreshAll} onOpenDetail={openDetail} />}
          {tab === 3 && <SettingsPanel canEdit={isSuperAdmin} />}
        </CardContent>
      </Card>

      {reviewCard && (
        <ReviewDialog
          card={reviewCard}
          onClose={() => setReviewCard(null)}
          onDone={() => {
            setReviewCard(null);
            refreshAll();
          }}
        />
      )}

      {detail && (
        <DetailDialog
          card={detail}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setDetail(null)}
          onChanged={(updated, pin) => {
            if (pin) setShownPin({ code: updated.code, pin });
            openDetail(updated.id);
            refreshAll();
          }}
        />
      )}

      {issueOpen && (
        <IssueDialog
          onClose={() => setIssueOpen(false)}
          onIssued={(card, pin, emailed) => {
            setIssueOpen(false);
            if (!emailed) setShownPin({ code: card.code, pin });
            else showToast(`Gift card ${card.code} issued and emailed`, 'success');
            refreshAll();
          }}
        />
      )}

      <Dialog open={!!shownPin} onClose={() => setShownPin(null)} maxWidth="xs" fullWidth sx={buttonResetSx}>
        <DialogTitle>Hand these details to the customer</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The PIN is shown only once. Write it down or print it for the customer now.
          </Alert>
          <Typography variant="overline">Gift card ID</Typography>
          <Typography variant="h5" sx={{ fontFamily: 'monospace', mb: 2 }}>{shownPin?.code}</Typography>
          <Typography variant="overline">PIN</Typography>
          <Typography variant="h4" sx={{ fontFamily: 'monospace', letterSpacing: 8 }}>{shownPin?.pin}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setShownPin(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Review (approve / reject) ────────────────────────────────────────────────

const ReviewDialog: React.FC<{ card: GiftCard; onClose: () => void; onDone: () => void }> = ({ card, onClose, onDone }) => {
  const { showToast } = useGlobalToast();
  const [received, setReceived] = useState(String(card.requestedAmount));
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const receivedNum = Number(received);
  const differs = !Number.isNaN(receivedNum) && Math.round(receivedNum * 100) !== Math.round(card.requestedAmount * 100);
  const validAmount = !Number.isNaN(receivedNum) && receivedNum >= 1 && receivedNum <= 10000;

  const approve = async () => {
    setBusy(true);
    try {
      await api.post(`/giftcards/admin/${card.id}/approve`, { receivedAmount: receivedNum, note: note.trim() || undefined });
      showToast(`Approved ${card.code} for ${money(receivedNum)} — recipient emailed`, 'success');
      onDone();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      await api.post(`/giftcards/admin/${card.id}/reject`, { reason: reason.trim() });
      showToast(`Rejected ${card.code} — buyer notified`, 'info');
      onDone();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth sx={buttonResetSx}>
      <DialogTitle>
        Review order <Box component="span" sx={{ fontFamily: 'monospace' }}>{card.code}</Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Payment slip</Typography>
            <SlipViewer card={card} />
          </Box>
          <Box>
            <InfoRow label="Requested amount" value={<b>{money(card.requestedAmount)}</b>} />
            <InfoRow label="Payment method" value={PAYMENT_LABEL[card.paymentMethod]} />
            <InfoRow label="Submitted" value={`${fmtDate(card.createdAt)} (${daysAgo(card.createdAt)} days ago)`} />
            <Divider sx={{ my: 1.5 }} />
            <InfoRow label="Buyer" value={card.buyerName} />
            <InfoRow label="Buyer email" value={card.buyerEmail} />
            <InfoRow label="Buyer phone" value={card.buyerPhone} />
            <InfoRow label="Recipient" value={card.isForSelf ? 'Buyer (for themselves)' : `${card.recipientName} — ${card.recipientEmail}`} />
            {card.message && <InfoRow label="Message" value={<i>“{card.message}”</i>} />}
            {card.status === 'rejected' && <Alert severity="error" sx={{ mt: 1 }}>Previously rejected: {card.rejectionReason}</Alert>}

            <Divider sx={{ my: 2 }} />
            {!rejecting ? (
              <>
                <Typography variant="subtitle2" gutterBottom>Amount received</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 1, step: '0.01' } }}
                  helperText="Change this if the transfer was more or less than requested. The card is issued for this amount."
                  error={!validAmount}
                />
                {differs && (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    Received {money(receivedNum)} instead of {money(card.requestedAmount)}. The buyer will be told about the difference.
                  </Alert>
                )}
                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label={differs ? 'Note (required)' : 'Note (optional)'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={differs ? 'e.g. Received $45 via e-Transfer' : ''}
                  multiline
                  minRows={2}
                  required={differs}
                  slotProps={{ htmlInput: { maxLength: 500 }, inputLabel: { shrink: true } }}
                  error={differs && !note.trim()}
                />
              </>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>Reason for rejection</Typography>
                <TextField
                  fullWidth
                  autoFocus
                  multiline
                  minRows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. No matching transfer received"
                  helperText="This is sent to the buyer by email."
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        {!rejecting ? (
          <>
            {card.status === 'pending_verification' && (
              <Button color="error" onClick={() => setRejecting(true)} disabled={busy}>Reject…</Button>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={approve}
              disabled={busy || !validAmount || (differs && !note.trim())}
            >
              {busy ? <CircularProgress size={20} /> : `Approve ${validAmount ? money(receivedNum) : ''}`}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setRejecting(false)} disabled={busy}>Back</Button>
            <Button variant="contained" color="error" onClick={reject} disabled={busy || !reason.trim()}>
              Reject order
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>{label}</Typography>
    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{value || '—'}</Typography>
  </Box>
);

// ─── Card detail with actions ─────────────────────────────────────────────────

const DetailDialog: React.FC<{
  card: GiftCardDetail;
  isSuperAdmin: boolean;
  onClose: () => void;
  onChanged: (card: GiftCard, pin?: string) => void;
}> = ({ card, isSuperAdmin, onClose, onChanged }) => {
  const { showToast } = useGlobalToast();
  const [busy, setBusy] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [confirm, setConfirm] = useState<null | { title: string; text: string; run: () => Promise<void> }>(null);

  const act = async (fn: () => Promise<{ data: GiftCard & { pin?: string } }>, success: string) => {
    setBusy(true);
    try {
      const res = await fn();
      showToast(success, 'success');
      onChanged(res.data, res.data.pin);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const issued = card.status !== 'pending_verification' && card.status !== 'rejected';

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth sx={buttonResetSx}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box component="span" sx={{ fontFamily: 'monospace' }}>{card.code}</Box>
        <Tooltip title="Copy ID">
          <IconButton size="small" onClick={() => navigator.clipboard.writeText(card.code)}><CopyIcon fontSize="small" /></IconButton>
        </Tooltip>
        <StatusChips card={card} />
      </DialogTitle>
      <DialogContent dividers>
        {card.isLocked && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Locked on {fmtDate(card.lockedAt)} after {card.failedPinAttempts || 5} incorrect PIN attempts. Verify the customer's identity before unlocking.
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#C87941', fontWeight: 700 }}>{money(card.balance)}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              remaining of {money(card.approvedAmount)}
              {card.approvedAmount !== null && card.approvedAmount !== card.requestedAmount && ` (requested ${money(card.requestedAmount)})`}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <InfoRow label="Payment" value={PAYMENT_LABEL[card.paymentMethod]} />
            <InfoRow label="Buyer" value={`${card.buyerName}${card.buyerEmail ? ` — ${card.buyerEmail}` : ''}`} />
            <InfoRow label="Buyer phone" value={card.buyerPhone} />
            <InfoRow label="Recipient" value={`${card.recipientName}${card.recipientEmail ? ` — ${card.recipientEmail}` : ''}`} />
            <InfoRow label="Approved by" value={card.reviewedByName ? `${card.reviewedByName}, ${fmtDate(card.reviewedAt)}` : null} />
            {card.approvalNote && <InfoRow label="Note" value={card.approvalNote} />}
            {card.message && <InfoRow label="Message" value={<i>“{card.message}”</i>} />}
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>History</Typography>
            <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
              {card.transactions.map((t) => (
                <Box key={t.id} sx={{ py: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{TX_LABEL[t.type] || t.type}</Typography>
                    {t.amountCents !== null && (
                      <Typography variant="body2" fontWeight={600} color={t.amountCents < 0 ? 'error.main' : 'success.main'}>
                        {t.amountCents < 0 ? '−' : '+'}{money(Math.abs(t.amountCents) / 100)}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {fmtDate(t.createdAt)} · {t.performedByName || 'System'}
                    {t.balanceAfterCents !== null && ` · balance ${money(t.balanceAfterCents / 100)}`}
                  </Typography>
                  {t.note && <Typography variant="caption" component="div">{t.note}</Typography>}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {adjustOpen && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Adjust balance</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                type="number"
                label="Amount (+ add / − remove)"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
              />
              <TextField size="small" label="Reason (required)" value={adjNote} onChange={(e) => setAdjNote(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
              <Button
                variant="contained"
                disabled={busy || !Number(adjAmount) || !adjNote.trim()}
                onClick={() =>
                  act(() => api.post(`/giftcards/admin/${card.id}/adjust`, { amount: Number(adjAmount), note: adjNote.trim() }), 'Balance adjusted').then(() => {
                    setAdjustOpen(false);
                    setAdjAmount('');
                    setAdjNote('');
                  })
                }
              >
                Apply
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        {card.isLocked && (
          <Button startIcon={<UnlockIcon />} disabled={busy} onClick={() => act(() => api.post(`/giftcards/admin/${card.id}/unlock`), 'Card unlocked')}>
            Unlock
          </Button>
        )}
        {issued && card.recipientEmail && (
          <Button startIcon={<SendIcon />} disabled={busy} onClick={() => act(() => api.post(`/giftcards/admin/${card.id}/resend`).then(() => ({ data: card })), 'Gift card email resent to recipient')}>
            Resend email
          </Button>
        )}
        {isSuperAdmin && issued && card.status !== 'void' && (
          <>
            <Button disabled={busy} onClick={() => setAdjustOpen((v) => !v)}>Adjust</Button>
            <Button
              disabled={busy}
              onClick={() =>
                setConfirm({
                  title: 'Reset PIN?',
                  text: card.recipientEmail
                    ? `A new PIN will be emailed to ${card.recipientEmail}. The old PIN stops working and the card is unlocked.`
                    : 'A new PIN will be shown to you once. The old PIN stops working.',
                  run: () => act(() => api.post(`/giftcards/admin/${card.id}/reset-pin`), 'PIN reset'),
                })
              }
            >
              Reset PIN
            </Button>
            {card.status === 'frozen' ? (
              <Button disabled={busy} onClick={() => act(() => api.patch(`/giftcards/admin/${card.id}/unfreeze`, {}), 'Card unfrozen')}>Unfreeze</Button>
            ) : (
              card.status === 'active' && (
                <Button disabled={busy} onClick={() => act(() => api.patch(`/giftcards/admin/${card.id}/freeze`, {}), 'Card frozen')}>Freeze</Button>
              )
            )}
            <Button
              color="error"
              disabled={busy}
              onClick={() =>
                setConfirm({
                  title: 'Void this gift card?',
                  text: `This permanently cancels ${card.code} and removes its ${money(card.balance)} balance. This cannot be undone.`,
                  run: () => act(() => api.patch(`/giftcards/admin/${card.id}/void`, {}), 'Gift card voided'),
                })
              }
            >
              Void
            </Button>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} sx={buttonResetSx}>
        <DialogTitle>{confirm?.title}</DialogTitle>
        <DialogContent><Typography>{confirm?.text}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={busy} onClick={() => confirm?.run()}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

// ─── Redeem at the till ───────────────────────────────────────────────────────

const RedeemPanel: React.FC<{ onDone: () => void; onOpenDetail: (id: string) => void }> = ({ onDone, onOpenDetail }) => {
  const { showToast } = useGlobalToast();
  const [code, setCode] = useState('');
  const [card, setCard] = useState<GiftCard | null>(null);
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const lookup = async () => {
    setBusy(true);
    setCard(null);
    setLastResult(null);
    try {
      const res = await api.get<GiftCard>(`/giftcards/admin/code/${encodeURIComponent(code.trim().toUpperCase())}`);
      setCard(res.data);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const redeem = async () => {
    if (!card) return;
    setBusy(true);
    try {
      const res = await api.post<GiftCard>(`/giftcards/admin/${card.id}/redeem`, { amount: Number(amount), pin, note: note.trim() || undefined });
      setLastResult(`Charged ${money(Number(amount))} to ${card.code}. Remaining balance: ${money(res.data.balance)}`);
      setCard(res.data);
      setPin('');
      setAmount('');
      setNote('');
      onDone();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const amountNum = Number(amount);
  const canRedeem = card && card.status === 'active' && !card.isLocked && /^\d{4}$/.test(pin) && amountNum > 0 && amountNum <= card.balance;

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ask the customer for their Gift Card ID and 4-digit PIN.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          fullWidth
          label="Gift card ID"
          placeholder="BPGC-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && code.trim() && lookup()}
          slotProps={{ htmlInput: { style: { fontFamily: 'monospace', letterSpacing: 2 } } }}
        />
        <Button variant="contained" onClick={lookup} disabled={busy || !code.trim()} sx={{ whiteSpace: 'nowrap', minWidth: 110 }}>Look up</Button>
      </Box>

      {lastResult && <Alert severity="success" sx={{ mt: 2 }}>{lastResult}</Alert>}

      {card && (
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{card.code}</Typography>
                <Typography variant="body2" color="text.secondary">{card.recipientName}</Typography>
              </Box>
              <StatusChips card={card} />
            </Box>
            <Typography variant="h4" sx={{ my: 1.5, color: '#C87941', fontWeight: 700 }}>{money(card.balance)}</Typography>

            {card.isLocked ? (
              <Alert severity="error" action={<Button size="small" onClick={() => onOpenDetail(card.id)}>Manage</Button>}>
                This card is locked after too many wrong PINs. Verify the customer and unlock it first.
              </Alert>
            ) : card.status !== 'active' ? (
              <Alert severity="warning">This card can't be used (status: {STATUS_META[card.status].label}).</Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label="PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'off', style: { letterSpacing: 6, fontFamily: 'monospace' } } }}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Bill amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={amountNum > card.balance}
                    helperText={amountNum > card.balance ? 'More than the balance' : ' '}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 0.01, step: '0.01' } }}
                    sx={{ flex: 1, minWidth: 140 }}
                  />
                  <Button size="small" onClick={() => setAmount(String(card.balance))} sx={{ alignSelf: 'flex-start', mt: 1, whiteSpace: 'nowrap' }}>Use full</Button>
                </Box>
                <TextField fullWidth size="small" label="Note (optional, e.g. table / bill #)" value={note} onChange={(e) => setNote(e.target.value)} sx={{ mt: 1 }} />
                <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={busy || !canRedeem} onClick={redeem} startIcon={<RedeemIcon />}>
                  Charge {amountNum > 0 ? money(amountNum) : ''}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// ─── Settings ─────────────────────────────────────────────────────────────────

const SettingsPanel: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const { showToast } = useGlobalToast();
  const [s, setS] = useState<GiftCardSettings | null>(null);
  const [presetText, setPresetText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<GiftCardSettings>('/giftcards/admin/settings')
      .then((res) => {
        setS(res.data);
        setPresetText(res.data.presetAmounts.join(', '));
      })
      .catch((e) => showToast(getErrorMessage(e), 'error'));
  }, [showToast]);

  if (!s) return <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>;

  const set = <K extends keyof GiftCardSettings>(k: K, v: GiftCardSettings[K]) => setS({ ...s, [k]: v });
  const presets = presetText.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0);
  const minMaxInvalid = s.customAmountMin > s.customAmountMax;

  const save = async () => {
    setSaving(true);
    try {
      const { presetAmounts: _ignored, ...rest } = s;
      void _ignored;
      const body = {
        ...rest,
        presetAmounts: presets,
        customAmountMin: Number(s.customAmountMin),
        customAmountMax: Number(s.customAmountMax),
      } as Record<string, unknown>;
      delete body.id;
      delete body.updatedAt;
      const res = await api.put<GiftCardSettings>('/giftcards/admin/settings', body);
      setS(res.data);
      setPresetText(res.data.presetAmounts.join(', '));
      showToast('Gift card settings saved', 'success');
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const field = (k: keyof GiftCardSettings, label: string, opts: { multiline?: boolean } = {}) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={(s[k] as string | null) ?? ''}
      onChange={(e) => set(k, e.target.value as never)}
      disabled={!canEdit}
      multiline={opts.multiline}
      minRows={opts.multiline ? 2 : undefined}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <Box sx={{ maxWidth: 820 }}>
      {!canEdit && <Alert severity="info" sx={{ mb: 2 }}>Only super admins can change gift card settings.</Alert>}

      <FormControlLabel
        control={<Switch checked={s.isEnabled} onChange={(e) => set('isEnabled', e.target.checked)} disabled={!canEdit} />}
        label={<b>Sell gift cards online</b>}
      />

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>Amounts</Typography>
      <TextField
        fullWidth
        size="small"
        label="Preset amounts ($, comma separated)"
        value={presetText}
        onChange={(e) => setPresetText(e.target.value)}
        disabled={!canEdit}
        helperText={`Shown as: ${presets.map((p) => `$${p}`).join(' · ') || 'none'}`}
        sx={{ mb: 1.5 }}
      />
      <FormControlLabel
        control={<Switch checked={s.customAmountEnabled} onChange={(e) => set('customAmountEnabled', e.target.checked)} disabled={!canEdit} />}
        label="Allow a custom amount"
      />
      {s.customAmountEnabled && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1 }}>
          <TextField size="small" type="number" label="Minimum $" value={s.customAmountMin} onChange={(e) => set('customAmountMin', Number(e.target.value))} disabled={!canEdit} error={minMaxInvalid} />
          <TextField size="small" type="number" label="Maximum $" value={s.customAmountMax} onChange={(e) => set('customAmountMax', Number(e.target.value))} disabled={!canEdit} error={minMaxInvalid} helperText={minMaxInvalid ? 'Min must not exceed max' : ''} />
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <FormControlLabel
              control={<Switch checked={s.interacEnabled} onChange={(e) => set('interacEnabled', e.target.checked)} disabled={!canEdit} />}
              label={<b>Interac e-Transfer</b>}
            />
            <Box sx={{ mt: 1.5, opacity: s.interacEnabled ? 1 : 0.5 }}>
              {field('interacEmail', 'e-Transfer email')}
              {field('interacRecipientName', 'Recipient name')}
              {field('interacInstructions', 'Instructions for customers', { multiline: true })}
            </Box>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <FormControlLabel
              control={<Switch checked={s.bankDepositEnabled} onChange={(e) => set('bankDepositEnabled', e.target.checked)} disabled={!canEdit} />}
              label={<b>Bank deposit</b>}
            />
            <Box sx={{ mt: 1.5, opacity: s.bankDepositEnabled ? 1 : 0.5 }}>
              {field('bankName', 'Bank name')}
              {field('bankAccountName', 'Account name')}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {field('bankInstitutionNumber', 'Institution #')}
                {field('bankTransitNumber', 'Transit #')}
              </Box>
              {field('bankAccountNumber', 'Account #')}
              {field('bankInstructions', 'Instructions for customers', { multiline: true })}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {!s.interacEnabled && !s.bankDepositEnabled && s.isEnabled && (
        <Alert severity="warning" sx={{ mt: 2 }}>Both payment methods are off — customers won't be able to buy gift cards.</Alert>
      )}

      {canEdit && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={save} disabled={saving || minMaxInvalid}>
          {saving ? <CircularProgress size={20} /> : 'Save settings'}
        </Button>
      )}
    </Box>
  );
};

// ─── Issue (walk-in / complimentary) ──────────────────────────────────────────

const IssueDialog: React.FC<{ onClose: () => void; onIssued: (card: GiftCard, pin: string, emailed: boolean) => void }> = ({ onClose, onIssued }) => {
  const { showToast } = useGlobalToast();
  const [f, setF] = useState({
    amount: '',
    paymentMethod: 'in_store',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
    note: '',
  });
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { amount: Number(f.amount), paymentMethod: f.paymentMethod, buyerName: f.buyerName.trim(), recipientName: (f.recipientName || f.buyerName).trim() };
      for (const k of ['buyerEmail', 'buyerPhone', 'recipientEmail', 'message', 'note'] as const) if (f[k].trim()) body[k] = f[k].trim();
      const res = await api.post<GiftCard & { pin: string; emailed: boolean }>('/giftcards/admin/issue', body);
      onIssued(res.data, res.data.pin, res.data.emailed);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth sx={buttonResetSx}>
      <DialogTitle>Issue a gift card</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For cards paid at the pub or given away. The card is active immediately.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Amount" type="number" value={f.amount} onChange={up('amount')} required slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} sx={{ flex: 1 }} />
          <TextField select label="Type" value={f.paymentMethod} onChange={up('paymentMethod')} sx={{ flex: 1 }}>
            <MenuItem value="in_store">Paid in-store</MenuItem>
            <MenuItem value="complimentary">Complimentary</MenuItem>
          </TextField>
        </Box>
        <TextField fullWidth label="Buyer name" value={f.buyerName} onChange={up('buyerName')} required sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField fullWidth label="Buyer email" value={f.buyerEmail} onChange={up('buyerEmail')} />
          <TextField fullWidth label="Buyer phone" value={f.buyerPhone} onChange={up('buyerPhone')} />
        </Box>
        <TextField fullWidth label="Recipient name (defaults to buyer)" value={f.recipientName} onChange={up('recipientName')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Recipient email" value={f.recipientEmail} onChange={up('recipientEmail')} helperText="If given, the card and PIN are emailed. Otherwise the PIN is shown to you once." sx={{ mb: 2 }} />
        <TextField fullWidth label="Message (optional)" value={f.message} onChange={up('message')} multiline minRows={2} sx={{ mb: 2 }} />
        <TextField fullWidth label="Internal note (optional)" value={f.note} onChange={up('note')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !(Number(f.amount) >= 1) || !f.buyerName.trim()}>
          {busy ? <CircularProgress size={20} /> : 'Issue card'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GiftCardsManagement;

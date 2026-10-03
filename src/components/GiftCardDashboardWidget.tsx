import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import { CardGiftcard as GiftIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import { api } from '../utils/api';

interface Stats {
  pendingCount: number;
  oldestPendingAt: string | null;
  activeCount: number;
  lockedCount: number;
  outstandingBalance: number;
  soldThisMonth: number;
  soldCountThisMonth: number;
  redeemedThisMonth: number;
}

const money = (n: number) => `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Dashboard summary: pending approvals alert + gift card figures for the month. */
export const GiftCardDashboardWidget: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .get<Stats>('/giftcards/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => undefined);
  }, []);

  if (!stats) return null;
  const oldestDays = stats.oldestPendingAt ? moment().diff(moment(stats.oldestPendingAt), 'days') : 0;

  return (
    <Box sx={{ mb: 4 }}>
      {stats.pendingCount > 0 && (
        <Alert
          severity={oldestDays >= 7 ? 'error' : 'warning'}
          sx={{ mb: 2, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/gift-cards')}>
              Review
            </Button>
          }
        >
          <b>{stats.pendingCount}</b> gift card order{stats.pendingCount === 1 ? '' : 's'} awaiting payment verification
          {stats.oldestPendingAt && ` — oldest waiting ${oldestDays} day${oldestDays === 1 ? '' : 's'}`}.
        </Alert>
      )}
      {stats.lockedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
          {stats.lockedCount} gift card{stats.lockedCount === 1 ? ' is' : 's are'} locked after too many wrong PIN attempts.
        </Alert>
      )}
      <Card sx={{ borderRadius: 3, cursor: 'pointer' }} onClick={() => navigate('/gift-cards')}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <GiftIcon sx={{ color: '#C87941', fontSize: 32 }} />
            <Typography variant="h6" fontWeight={700}>Gift cards</Typography>
          </Box>
          {[
            ['Sold this month', `${money(stats.soldThisMonth)} (${stats.soldCountThisMonth})`],
            ['Redeemed this month', money(stats.redeemedThisMonth)],
            ['Active cards', String(stats.activeCount)],
            ['Outstanding balance', money(stats.outstandingBalance)],
          ].map(([label, value]) => (
            <Box key={label}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{value}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

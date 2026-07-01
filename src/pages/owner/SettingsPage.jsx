import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { getRazorpayPayoutStatus, saveRazorpayCredentials } from '../../services/ownerService';

// ─── Design tokens (matches existing owner pages) ─────────────────────────────
const T = {
  bg: '#121212',
  surface: '#1E1E1E',
  surfVar: '#2C2C2C',
  primary: '#BB86FC',
  fg1: '#FFFFFF',
  fg2: '#B0B0B0',
  fg3: 'rgba(255,255,255,0.35)',
  outline: 'rgba(255,255,255,0.10)',
  sans: "'DM Sans', system-ui, sans-serif",
  error: '#CF6679',
  connected: '#43A047',
  pending: '#FB8C00',
};

function statusChipProps(status) {
  if (status === 'CONNECTED') {
    return { label: 'Connected', sx: { bgcolor: 'rgba(67,160,71,0.15)', color: T.connected } };
  }
  if (status === 'NEEDS_RECONNECT') {
    return { label: 'Needs Reconnect', sx: { bgcolor: 'rgba(251,140,0,0.15)', color: T.pending } };
  }
  return { label: 'Not Connected', sx: { bgcolor: T.surfVar, color: T.fg2 } };
}

/**
 * SettingsPage — owner "Payouts" settings.
 *
 * Lets the owner paste their own Razorpay Key ID/Secret so fee payments
 * settle directly into their own account (BYO-Razorpay, Phase F).
 */
export default function SettingsPage() {
  const [status, setStatus] = useState('NOT_CONNECTED');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getRazorpayPayoutStatus()
      .then((data) => {
        setStatus(data.status);
        setKeyId(data.key_id ?? '');
      })
      .catch(() => setError('Failed to load payout settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const data = await saveRazorpayCredentials(keyId, keySecret);
      setStatus(data.status);
      setKeyId(data.key_id ?? '');
      setKeySecret('');
      setSuccess(true);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to save Razorpay credentials.');
    } finally {
      setSaving(false);
    }
  }

  const chip = statusChipProps(status);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: T.sans, maxWidth: 560 }}>
      <Typography sx={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: T.fg1, mb: 3 }}>
        Settings
      </Typography>

      <Card
        elevation={0}
        sx={{ bgcolor: T.surface, border: `1px solid ${T.outline}`, borderRadius: '16px' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <LockIcon sx={{ color: T.primary, fontSize: 22 }} />
            <Typography sx={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: T.fg1 }}>
              Payouts
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" width={90} height={24} sx={{ bgcolor: T.surfVar }} />
            ) : (
              <Chip size="small" label={chip.label} sx={{ ...chip.sx, fontFamily: T.sans, fontSize: 12 }} />
            )}
          </Box>

          <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2, mb: 2.5 }}>
            You'll need your own Razorpay account to collect fees online — sign up at{' '}
            <strong>razorpay.com</strong>, complete your own KYC, then paste your Key ID and
            Key Secret below. Payments will settle directly into your Razorpay account;
            BatchBook never holds or moves your money.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
              Razorpay credentials saved.
            </Alert>
          )}

          {loading ? (
            <Skeleton variant="rounded" height={96} sx={{ bgcolor: T.surfVar, borderRadius: '12px' }} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Key ID"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_live_..."
                size="small"
                fullWidth
              />
              <TextField
                label="Key Secret"
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder={status === 'CONNECTED' ? 'Enter secret again to update' : ''}
                helperText={
                  status === 'CONNECTED'
                    ? "For security we never show your saved secret — re-enter it to change your credentials."
                    : ''
                }
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !keyId || !keySecret}
                sx={{
                  alignSelf: 'flex-start',
                  fontFamily: T.sans,
                  textTransform: 'none',
                  borderRadius: '10px',
                  bgcolor: T.primary,
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#9c5fdc' },
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

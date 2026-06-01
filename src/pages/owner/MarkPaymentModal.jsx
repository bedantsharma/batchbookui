import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { markPayment } from '../../services/ownerService';

const T = {
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  primary:  '#BB86FC',
  secondary:'#03DAC6',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.12)',
  sans:     "'DM Sans', system-ui, sans-serif",
  error:    '#CF6679',
  paid:     '#43A047',
  partial:  '#FB8C00',
};

function fmtAmount(val) {
  return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * MarkPaymentModal — records a cash or UPI payment against a fee record.
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   record     — FeeRecordSummary (from fee dashboard) with student_name, amount_due, amount_paid, status
 *   onSuccess  — (updatedRecord) => void
 */
export default function MarkPaymentModal({ open, onClose, record, onSuccess }) {
  const amountDue = record ? Number(record.amount_due) : 0;
  const alreadyPaid = record ? Number(record.amount_paid) : 0;
  const outstanding = amountDue - alreadyPaid;

  const [amountStr, setAmountStr] = useState('');
  const [reference, setReference] = useState('');
  const [amountError, setAmountError] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open && record) {
      setAmountStr(String(outstanding > 0 ? outstanding : amountDue));
      setReference('');
      setAmountError('');
      setApiError('');
    }
  }, [open, record]);

  function handleClose() {
    if (saving) return;
    onClose();
  }

  function validate() {
    const val = parseFloat(amountStr);
    if (!amountStr.trim() || isNaN(val) || val < 0) {
      setAmountError('Enter a valid amount (₹0 or more).');
      return false;
    }
    setAmountError('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError('');

    try {
      const updated = await markPayment(record.id, parseFloat(amountStr), reference.trim() || null);
      onSuccess(updated);
      handleClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setApiError(
        typeof detail === 'string' ? detail : 'Failed to record payment. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!record) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          bgcolor: T.surface,
          backgroundImage: 'none',
          borderRadius: '16px',
          border: `1px solid ${T.outline}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: T.sans,
          fontWeight: 700,
          fontSize: 17,
          color: T.fg1,
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Mark Payment
        <IconButton onClick={handleClose} disabled={saving} sx={{ color: T.fg2 }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Student summary */}
      <Box sx={{ px: 3, pt: 0.5, pb: 0 }}>
        <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
          {record.student_name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`Due: ₹${fmtAmount(amountDue)}`}
            sx={{ fontFamily: T.sans, fontSize: 12, bgcolor: T.surfVar, color: T.fg2 }}
          />
          {alreadyPaid > 0 && (
            <Chip
              size="small"
              label={`Paid: ₹${fmtAmount(alreadyPaid)}`}
              sx={{ fontFamily: T.sans, fontSize: 12, bgcolor: 'rgba(67,160,71,0.15)', color: T.paid }}
            />
          )}
          {outstanding > 0 && (
            <Chip
              size="small"
              label={`Remaining: ₹${fmtAmount(outstanding)}`}
              sx={{ fontFamily: T.sans, fontSize: 12, bgcolor: 'rgba(251,140,0,0.15)', color: T.partial }}
            />
          )}
        </Box>
      </Box>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Amount Paid (₹)"
            type="number"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            error={!!amountError}
            helperText={amountError}
            fullWidth
            required
            autoFocus
            inputProps={{ min: 0, step: '0.01' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon sx={{ fontSize: 18, color: T.fg2 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontFamily: T.sans,
                color: T.fg1,
                '& fieldset': { borderColor: T.outline },
                '&:hover fieldset': { borderColor: T.primary },
                '&.Mui-focused fieldset': { borderColor: T.primary },
              },
              '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
              '& .MuiFormHelperText-root': { fontFamily: T.sans },
            }}
          />

          <TextField
            label="Reference (UPI ID / Cash)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder='e.g. "Cash" or UPI transaction ID'
            fullWidth
            inputProps={{ maxLength: 255 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontFamily: T.sans,
                color: T.fg1,
                '& fieldset': { borderColor: T.outline },
                '&:hover fieldset': { borderColor: T.primary },
                '&.Mui-focused fieldset': { borderColor: T.primary },
                '& input::placeholder': { color: T.fg3 },
              },
              '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
            }}
          />

          {apiError && (
            <Typography sx={{ fontSize: 13, color: T.error, fontFamily: T.sans }}>
              {apiError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={saving}
            sx={{
              fontFamily: T.sans,
              textTransform: 'none',
              color: T.fg2,
              borderRadius: '10px',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              fontFamily: T.sans,
              textTransform: 'none',
              borderRadius: '10px',
              bgcolor: T.paid,
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#2e7d32' },
              '&.Mui-disabled': { bgcolor: T.surfVar, color: T.fg3 },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

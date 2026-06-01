import { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { setupFeeStructure, generateMonthlyRecords } from '../../services/ownerService';

const T = {
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  primary:  '#BB86FC',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.12)',
  sans:     "'DM Sans', system-ui, sans-serif",
  error:    '#CF6679',
};

/**
 * FeeSetupModal — sets or updates the monthly fee for a batch.
 *
 * After saving the structure it also generates fee records for the selected
 * month so the batch fee table is immediately populated.
 *
 * Props:
 *   open        — boolean
 *   onClose     — () => void
 *   batch       — BatchResponse (id + name)
 *   month       — "YYYY-MM" string
 *   onSuccess   — (structure) => void   called after save + generate
 *   existing    — FeeStructureResponse | null   pre-fills the form if editing
 */
export default function FeeSetupModal({ open, onClose, batch, month, onSuccess, existing }) {
  const [amount, setAmount] = useState(existing ? String(existing.monthly_amount) : '');
  const [amountError, setAmountError] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleClose() {
    if (saving) return;
    setAmount(existing ? String(existing.monthly_amount) : '');
    setAmountError('');
    setApiError('');
    onClose();
  }

  function validate() {
    const val = parseFloat(amount);
    if (!amount.trim() || isNaN(val) || val <= 0) {
      setAmountError('Enter a valid monthly fee amount greater than ₹0.');
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
      const structure = await setupFeeStructure(batch.id, parseFloat(amount));
      // Generate records for the current month immediately (idempotent — safe to call again)
      await generateMonthlyRecords(batch.id, month);
      onSuccess(structure);
      handleClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setApiError(
        typeof detail === 'string'
          ? detail
          : 'Failed to save fee structure. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

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
        {existing ? 'Update Fee' : 'Set Monthly Fee'}
        <IconButton onClick={handleClose} disabled={saving} sx={{ color: T.fg2 }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 0.5, pb: 0 }}>
        <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
          {batch?.name}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Monthly Fee (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!amountError}
            helperText={amountError || 'This amount applies to all students in the batch.'}
            fullWidth
            required
            autoFocus
            inputProps={{ min: 1, step: '0.01' }}
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

          {apiError && (
            <Typography sx={{ mt: 1.5, fontSize: 13, color: T.error, fontFamily: T.sans }}>
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
              bgcolor: T.primary,
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#9c5fdc' },
              '&.Mui-disabled': { bgcolor: T.surfVar, color: T.fg3 },
            }}
          >
            {saving ? (
              <CircularProgress size={18} sx={{ color: '#000' }} />
            ) : existing ? (
              'Update & Regenerate'
            ) : (
              'Save & Generate'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

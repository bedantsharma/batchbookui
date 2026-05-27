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
  Grid,
  MenuItem,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { addStudentAndEnroll } from '../../services/ownerService';

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayDayOfMonth() {
  return new Date().getDate();
}

/**
 * Compute pro-rated fee for joining month.
 * Formula: (daysRemaining / daysInMonth) * monthlyFee (truncated to 2dp)
 */
function proRatedAmount(dueDay, monthlyFee) {
  if (!monthlyFee || monthlyFee <= 0) return '';
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const daysRemaining = Math.max(daysInMonth - today + 1, 1);
  const proRated = ((daysRemaining / daysInMonth) * monthlyFee).toFixed(2);
  return proRated;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.phone_number.trim()) {
    errors.phone_number = 'Phone number is required.';
  } else if (!/^\d{10}$/.test(form.phone_number.trim())) {
    errors.phone_number = 'Enter a valid 10-digit phone number.';
  }
  if (!form.batch_id) errors.batch_id = 'Select a batch.';
  if (!form.due_day || Number(form.due_day) < 1 || Number(form.due_day) > 28) {
    errors.due_day = 'Due day must be 1–28.';
  }
  if (form.first_month_amount !== '' && (isNaN(form.first_month_amount) || Number(form.first_month_amount) < 0)) {
    errors.first_month_amount = 'Enter a valid amount or leave blank.';
  }
  return errors;
}

// ─── AddStudentModal ──────────────────────────────────────────────────────────

/**
 * AddStudentModal — create a new student and immediately enroll them in a batch.
 *
 * Props:
 *   open         — boolean
 *   onClose      — () => void
 *   onAdded      — () => void — called after successful creation
 *   batches      — BatchResponse[] — available batches to enroll into
 *   defaultBatch — optional BatchResponse — pre-selected batch
 */
export default function AddStudentModal({ open, onClose, onAdded, batches = [], defaultBatch = null }) {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    batch_id: '',
    due_day: String(todayDayOfMonth()),
    first_month_amount: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-select defaultBatch when it changes
  useEffect(() => {
    if (defaultBatch?.id) {
      setForm((prev) => ({ ...prev, batch_id: defaultBatch.id }));
    }
  }, [defaultBatch?.id]);

  function handleChange(field) {
    return (e) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };
  }

  function handleClose() {
    if (loading) return;
    setForm({
      name: '',
      phone_number: '',
      email: '',
      batch_id: defaultBatch?.id ?? '',
      due_day: String(todayDayOfMonth()),
      first_month_amount: '',
    });
    setErrors({});
    setApiError('');
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await addStudentAndEnroll({
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim() || undefined,
        batch_id: Number(form.batch_id),
        due_day: Number(form.due_day),
        first_month_amount: form.first_month_amount !== '' ? Number(form.first_month_amount) : undefined,
      });
      handleClose();
      onAdded();
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to add student.';
      setApiError(typeof detail === 'string' ? detail : 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      fontFamily: T.sans,
      color: T.fg1,
      '& fieldset': { borderColor: T.outline },
      '&:hover fieldset': { borderColor: T.fg3 },
      '&.Mui-focused fieldset': { borderColor: T.primary },
    },
    '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
    '& .MuiInputLabel-root.Mui-focused': { color: T.primary },
    '& .MuiFormHelperText-root': { fontFamily: T.sans },
    '& .MuiSelect-icon': { color: T.fg2 },
    input: { color: T.fg1, fontFamily: T.sans },
  };

  // Compute suggested pro-rated amount (informational hint)
  const selectedBatch = batches.find((b) => b.id === form.batch_id);
  const proRatedHint = form.first_month_amount === '' && form.due_day
    ? '— leave blank to use standard monthly amount'
    : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: T.surface,
            borderRadius: 3,
            border: `1px solid ${T.outline}`,
            fontFamily: T.sans,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: T.sans,
          fontWeight: 700,
          color: T.fg1,
          fontSize: 18,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Add Student
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: T.fg2 }}
          aria-label="close dialog"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                label="Student Name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                fullWidth
                required
                sx={inputSx}
                data-testid="student-name-input"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={7}>
              <TextField
                label="Phone Number"
                placeholder="10-digit number"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                disabled={loading}
                fullWidth
                required
                inputProps={{ maxLength: 10, inputMode: 'numeric', 'data-testid': 'phone-input' }}
                sx={inputSx}
              />
            </Grid>

            {/* Email (optional) */}
            <Grid item xs={12} sm={5}>
              <TextField
                label="Email (optional)"
                type="email"
                placeholder="rahul@example.com"
                value={form.email}
                onChange={handleChange('email')}
                disabled={loading}
                fullWidth
                sx={inputSx}
              />
            </Grid>

            {/* Batch selector */}
            <Grid item xs={12}>
              <TextField
                select
                label="Enroll in Batch"
                value={form.batch_id}
                onChange={handleChange('batch_id')}
                error={!!errors.batch_id}
                helperText={errors.batch_id}
                disabled={loading || batches.length === 0}
                fullWidth
                required
                sx={inputSx}
                slotProps={{
                  select: {
                    MenuProps: {
                      slotProps: {
                        paper: {
                          sx: { bgcolor: T.surfVar, border: `1px solid ${T.outline}` },
                        },
                      },
                    },
                  },
                }}
              >
                {batches.length === 0 && (
                  <MenuItem disabled value="">
                    <Typography sx={{ fontFamily: T.sans, color: T.fg3, fontSize: 13 }}>
                      No batches available — create one first
                    </Typography>
                  </MenuItem>
                )}
                {batches.filter((b) => b.status !== 'ARCHIVED').map((b) => (
                  <MenuItem
                    key={b.id}
                    value={b.id}
                    sx={{ fontFamily: T.sans, color: T.fg1, bgcolor: T.surfVar }}
                  >
                    {b.name}
                    {b.subject ? ` — ${b.subject}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Due day + First month fee */}
            <Grid item xs={5}>
              <TextField
                label="Fee Due Day"
                type="number"
                value={form.due_day}
                onChange={handleChange('due_day')}
                error={!!errors.due_day}
                helperText={errors.due_day ?? 'Day of month (1–28)'}
                disabled={loading}
                fullWidth
                required
                data-testid="due-day-input"
                inputProps={{ min: 1, max: 28 }}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={7}>
              <TextField
                label="First Month Fee (₹)"
                type="number"
                value={form.first_month_amount}
                onChange={handleChange('first_month_amount')}
                error={!!errors.first_month_amount}
                helperText={errors.first_month_amount ?? proRatedHint}
                disabled={loading}
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
                sx={inputSx}
                placeholder="Optional — pro-rated"
              />
            </Grid>
          </Grid>

          {apiError && (
            <Typography color="error" variant="body2" sx={{ fontFamily: T.sans, mt: 2, fontSize: 13 }}>
              {apiError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ fontFamily: T.sans, color: T.fg2, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || batches.length === 0}
            sx={{
              fontFamily: T.sans,
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: T.primary,
              color: '#000',
              minWidth: 130,
              '&:hover': { bgcolor: '#a06adc' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Add Student'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

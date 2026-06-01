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
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createBatch } from '../../services/ownerService';

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

const DAYS = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
];

const INITIAL_FORM = {
  name: '',
  subject: '',
  grade: '',
  start_time: '16:00',
  end_time: '17:00',
  days_of_week: [],
  max_capacity: '',
  end_date: '',
};

function today() {
  return new Date().toISOString().split('T')[0];
}

function oneYearFromToday() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Batch name is required.';
  if (!form.subject.trim()) errors.subject = 'Subject is required.';
  if (!form.start_time) errors.start_time = 'Start time is required.';
  if (!form.end_time) errors.end_time = 'End time is required.';
  if (form.start_time && form.end_time && form.start_time >= form.end_time) {
    errors.end_time = 'End time must be after start time.';
  }
  if (form.days_of_week.length === 0) errors.days_of_week = 'Select at least one day.';
  if (!form.max_capacity || Number(form.max_capacity) < 1) {
    errors.max_capacity = 'Capacity must be at least 1.';
  }
  if (!form.end_date) errors.end_date = 'End date is required.';
  if (form.end_date && form.end_date <= today()) {
    errors.end_date = 'End date must be in the future.';
  }
  return errors;
}

// ─── CreateBatchModal ─────────────────────────────────────────────────────────

/**
 * CreateBatchModal — MUI Dialog to create a new batch.
 *
 * Props:
 *   open     — boolean
 *   onClose  — () => void
 *   onCreated(batch) — called with the newly created BatchResponse
 */
export default function CreateBatchModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };
  }

  function handleDayToggle(day) {
    setForm((prev) => {
      const next = prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: next };
    });
    if (errors.days_of_week) setErrors((prev) => ({ ...prev, days_of_week: '' }));
  }

  function handleClose() {
    if (loading) return;
    setForm(INITIAL_FORM);
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
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        grade: form.grade.trim() || null,
        start_time: form.start_time,
        end_time: form.end_time,
        days_of_week: form.days_of_week,
        max_capacity: Number(form.max_capacity),
        start_date: today(),
        end_date: form.end_date,
      };
      const batch = await createBatch(payload);
      setForm(INITIAL_FORM);
      onCreated(batch);
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to create batch.';
      setApiError(typeof detail === 'string' ? detail : 'Failed to create batch.');
    } finally {
      setLoading(false);
    }
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      fontFamily: T.sans,
      '& fieldset': { borderColor: T.outline },
      '&:hover fieldset': { borderColor: T.fg3 },
      '&.Mui-focused fieldset': { borderColor: T.primary },
    },
    '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
    '& .MuiInputLabel-root.Mui-focused': { color: T.primary },
    '& .MuiFormHelperText-root': { fontFamily: T.sans },
    input: { color: T.fg1, fontFamily: T.sans },
  };

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
        Create New Batch
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
            {/* Batch name */}
            <Grid item xs={12}>
              <TextField
                label="Batch Name"
                placeholder="e.g. Class 10 Maths"
                value={form.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                fullWidth
                required
                sx={inputSx}
                data-testid="batch-name-input"
              />
            </Grid>

            {/* Subject + Grade */}
            <Grid item xs={8}>
              <TextField
                label="Subject"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={handleChange('subject')}
                error={!!errors.subject}
                helperText={errors.subject}
                disabled={loading}
                fullWidth
                required
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Grade (optional)"
                placeholder="e.g. 10"
                value={form.grade}
                onChange={handleChange('grade')}
                disabled={loading}
                fullWidth
                sx={inputSx}
              />
            </Grid>

            {/* Start time + End time */}
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                value={form.start_time}
                onChange={handleChange('start_time')}
                error={!!errors.start_time}
                helperText={errors.start_time}
                disabled={loading}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time"
                type="time"
                value={form.end_time}
                onChange={handleChange('end_time')}
                error={!!errors.end_time}
                helperText={errors.end_time}
                disabled={loading}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </Grid>

            {/* Days of week */}
            <Grid item xs={12}>
              <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2, mb: 0.5 }}>
                Class Days *
              </Typography>
              <FormGroup row sx={{ gap: 0 }}>
                {DAYS.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        checked={form.days_of_week.includes(value)}
                        onChange={() => handleDayToggle(value)}
                        disabled={loading}
                        size="small"
                        sx={{
                          color: T.fg3,
                          '&.Mui-checked': { color: T.primary },
                          p: 0.5,
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
                        {label}
                      </Typography>
                    }
                    sx={{ mr: 1 }}
                  />
                ))}
              </FormGroup>
              {errors.days_of_week && (
                <FormHelperText error sx={{ fontFamily: T.sans, mt: 0.5, ml: 0 }}>
                  {errors.days_of_week}
                </FormHelperText>
              )}
            </Grid>

            {/* Max capacity + End date */}
            <Grid item xs={6}>
              <TextField
                label="Max Capacity"
                type="number"
                value={form.max_capacity}
                onChange={handleChange('max_capacity')}
                error={!!errors.max_capacity}
                helperText={errors.max_capacity}
                disabled={loading}
                fullWidth
                required
                data-testid="batch-capacity-input"
                inputProps={{ min: 1 }}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={handleChange('end_date')}
                error={!!errors.end_date}
                helperText={errors.end_date}
                disabled={loading}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today() }}
                placeholder={oneYearFromToday()}
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* API error */}
          {apiError && (
            <Typography
              color="error"
              variant="body2"
              sx={{ fontFamily: T.sans, mt: 2, fontSize: 13 }}
            >
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
            disabled={loading}
            sx={{
              fontFamily: T.sans,
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: T.primary,
              color: '#000',
              minWidth: 120,
              '&:hover': { bgcolor: '#a06adc' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Batch'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../../services/api';

// ─── Design tokens (matches existing Dashboard palette) ───────────────────────
const T = {
  bg:      '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  fg1:     '#FFFFFF',
  fg2:     '#B0B0B0',
  sans:    "'DM Sans', system-ui, sans-serif",
};

/**
 * OwnerSetup — one-time institute registration form shown after first login.
 *
 * Calls POST /owner/institute with { name, city }.
 * On success, navigates to /owner/dashboard.
 *
 * If the owner already has an institute (API returns 409), we redirect
 * directly to the dashboard without forcing a re-submit.
 */
export default function OwnerSetup() {
  const navigate = useNavigate();
  const [name, setName]   = useState('');
  const [city, setCity]   = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Institute name is required.';
    if (!city.trim()) e.city = 'City is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await api.post('/owner/institute', { name: name.trim(), city: city.trim() });
      navigate('/owner/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        // Institute already exists — just go to dashboard
        navigate('/owner/dashboard');
        return;
      }
      const detail = err.response?.data?.detail ?? err.message ?? 'Something went wrong.';
      setApiError(typeof detail === 'string' ? detail : 'Failed to save institute details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: T.bg,
        p: 2,
        fontFamily: T.sans,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          p: 4,
          bgcolor: T.surface,
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo / Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <BusinessIcon sx={{ fontSize: 48, color: T.primary, mb: 1 }} />
          <Typography variant="h5" sx={{ color: T.fg1, fontWeight: 700, fontFamily: T.sans }}>
            Set up your institute
          </Typography>
          <Typography variant="body2" sx={{ color: T.fg2, mt: 1, fontFamily: T.sans }}>
            Tell us about your coaching institute. This takes 30 seconds and you only do it once.
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              id="institute-name"
              label="Institute Name"
              placeholder="e.g. Sharma Classes"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <BusinessIcon sx={{ mr: 1, color: T.fg2, fontSize: 20 }} />
                ),
              }}
            />

            <TextField
              id="city"
              label="City"
              placeholder="e.g. Gurugram"
              value={city}
              onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
              error={!!errors.city}
              helperText={errors.city}
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <LocationOnIcon sx={{ mr: 1, color: T.fg2, fontSize: 20 }} />
                ),
              }}
            />

            {apiError && (
              <Typography color="error" variant="body2" sx={{ fontFamily: T.sans }}>
                {apiError}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, mt: 1, fontFamily: T.sans, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save & Continue →'}
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}

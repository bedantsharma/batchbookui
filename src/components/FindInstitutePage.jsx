import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, TextField, Button, CircularProgress, InputAdornment } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { findInstituteByOwnerPhone } from '../services/ownerService';

export default function FindInstitutePage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [institute, setInstitute] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (phone.length !== 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setLoading(true); setError(''); setInstitute(null);
    try {
      const data = await findInstituteByOwnerPhone(phone);
      setInstitute(data);
    } catch (err) {
      setError(err.message || 'No institute found for that number.');
    } finally {
      setLoading(false);
    }
  }

  function handleJoin() {
    navigate(`/join/${institute.join_code}`);
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440, p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Find your institute</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your teacher's phone number to find and join their institute.
        </Typography>

        <Box component="form" onSubmit={handleSearch} noValidate>
          <TextField
            label="Teacher's phone number"
            fullWidth
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); setInstitute(null); }}
            inputProps={{ maxLength: 10, inputMode: 'numeric' }}
            placeholder="10-digit mobile number"
            error={!!error}
            helperText={error || 'Indian number, no country code'}
            disabled={loading}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || phone.length !== 10}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        {institute && (
          <Box sx={{ mt: 3, p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={16}>{institute.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{institute.city}</Typography>
                </Box>
              </Box>
            </Box>
            {institute.owner_name && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Managed by <strong>{institute.owner_name}</strong>
              </Typography>
            )}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleJoin}
              sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
            >
              This is my institute →
            </Button>
          </Box>
        )}

        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/')}
          sx={{ mt: 2, color: 'text.secondary', fontSize: 13 }}
        >
          Back to home
        </Button>
      </Card>
    </Box>
  );
}

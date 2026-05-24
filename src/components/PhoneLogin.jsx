import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, '').substring(0, 10);
    setPhoneNumber(cleanedValue);
    if (error && cleanedValue.length === 10) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/generate_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${res.status}`);
      }

      navigate('/otp-verification', { state: { phoneNumber } });
    } catch (err) {
      console.error('OTP send error:', err);
      setError('Failed to send OTP. Please check your number and try again. ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          textAlign: 'center',
          borderRadius: 4,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Login with Phone
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter your 10-digit Indian phone number to receive an OTP.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            id="phoneNumber"
            label="Phone Number"
            variant="outlined"
            fullWidth
            type="tel"
            placeholder="e.g., 9876543210"
            value={phoneNumber}
            onChange={handlePhoneChange}
            inputProps={{ maxLength: 10 }}
            error={!!error}
            helperText={error}
            disabled={isLoading}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Get OTP'
            )}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default PhoneLogin;

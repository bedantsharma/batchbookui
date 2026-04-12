import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone'; // Using Material Icons for consistency

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters for Indian phone numbers
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
      console.log(`Sending OTP to: ${phoneNumber}`);
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

      // On success, navigate to OTP verification page
      navigate('/otp-verification', { state: { phoneNumber } });
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('OTP send error:', err);
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
        bgcolor: 'background.default', // Uses theme background color
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          textAlign: 'center',
          borderRadius: 4, // Material 3 default rounded corners
          boxShadow: 3, // Material 3 elevation
          bgcolor: 'background.paper', // Card background
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
            variant="outlined" // Material 3 prefers outlined or filled
            fullWidth
            type="tel"
            placeholder="e.g., 9876543210"
            value={phoneNumber}
            onChange={handlePhoneChange}
            inputProps={{ maxLength: 10 }}
            error={!!error}
            helperText={error}
            disabled={isLoading}
            size="medium" // Larger input field
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
            variant="contained" // Primary button style
            color="primary"
            fullWidth
            size="large" // Larger button
            disabled={isLoading}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }} // Custom padding and border-radius
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

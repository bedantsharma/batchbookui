import React, { useState, useEffect } from 'react';
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
import { auth } from '../firebaseconfig'; // Import auth instance
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize reCAPTCHA verifier when the component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // This callback is usually not triggered for invisible reCAPTCHA unless there's a challenge.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          window.recaptchaVerifier.render().then(function(widgetId) {
            grecaptcha.reset(widgetId);
          });
        }
      });
    }
  }, []);

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
      const fullPhoneNumber = `+91${phoneNumber}`; // Assuming Indian phone numbers
      console.log(`Sending OTP to: ${fullPhoneNumber}`);

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult; // Store confirmationResult globally or in state/context

      navigate('/otp-verification', { state: { phoneNumber: fullPhoneNumber } });
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
        {/* This div is required for reCAPTCHA */}
        <div id="recaptcha-container" style={{ marginTop: '20px' }}></div>
      </Card>
    </Box>
  );
};

export default PhoneLogin;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();
  const phoneNumber = location.state?.phoneNumber;

  // Refs for each OTP input field
  const otpRefs = useRef(Array(6).fill(null).map(() => React.createRef()));

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/phone-login');
    }

    let timer;
    if (isResending && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResending(false);
    }

    return () => clearInterval(timer);
  }, [phoneNumber, navigate, resendTimer, isResending]);

  const handleOtpChange = (index, value) => {
    const newOtpArray = otp.split('');
    newOtpArray[index] = value.slice(-1); // Take only the last character if pasted
    const updatedOtp = newOtpArray.join('');
    setOtp(updatedOtp);

    // Move focus to the next input if a digit was entered and it's not the last field
    if (value && index < 5 && otpRefs.current[index + 1].current) {
      otpRefs.current[index + 1].current.focus();
    }
    if (error && updatedOtp.length === 6) {
      setError('');
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpRefs.current[index - 1].current) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Verifying OTP: ${otp} for phone: ${phoneNumber}`);
      // Simulate API call to verify OTP
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (otp === '123456') { // Example valid OTP
            resolve();
          } else {
            reject(new Error('Invalid OTP'));
          }
        }, 2000);
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsResending(true);
    setResendTimer(60); // Reset timer

    try {
      console.log(`Resending OTP to: ${phoneNumber}`);
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Optionally, show a success message for resend
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error('OTP resend error:', err);
    } finally {
      // Timer will handle setting isResending to false
    }
  };

  if (!phoneNumber) {
    return null; // Or a loading spinner, or redirect immediately
  }

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
          Verify OTP
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          An OTP has been sent to <Typography component="span" color="primary" fontWeight="bold">{phoneNumber}</Typography>. Please enter it below.
        </Typography>

        <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            {Array(6).fill(0).map((_, index) => (
              <TextField
                key={index}
                inputRef={otpRefs.current[index]}
                variant="outlined"
                size="medium"
                value={otp[index] || ''}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center', fontSize: '1.5rem', width: '1.5em' },
                }}
                sx={{
                  width: 50,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
                error={!!error}
                disabled={isLoading || isResending}
              />
            ))}
          </Stack>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading || otp.length !== 6}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Verify OTP'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {resendTimer > 0 && isResending ? (
              <Typography variant="body2" color="text.secondary">
                Resend OTP in {resendTimer}s
              </Typography>
            ) : (
              <Button
                type="button"
                variant="text"
                onClick={handleResendOtp}
                disabled={isResending}
                sx={{ borderRadius: 2 }}
              >
                {isResending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Resend OTP'
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default OtpVerification;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const OtpVerification = () => {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();
  const phoneNumber = location.state?.phoneNumber;

  const inputRefs = useRef(Array.from({ length: 6 }, () => React.createRef()));

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/phone-login');
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const tick = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(tick);
  }, [resendTimer]);

  const otp = digits.join('');

  const focusBox = (index) => inputRefs.current[index]?.current?.focus();

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) focusBox(index + 1);
    if (error) setError('');
  };

  // Paste handler — distribute all 6 digits across boxes from the pasted position
  const handlePaste = (index, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
    if (!pasted) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < pasted.length; i++) next[index + i] = pasted[i];
      return next;
    });
    const lastFilled = Math.min(index + pasted.length - 1, 5);
    focusBox(lastFilled < 5 ? lastFilled + 1 : 5);
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      focusBox(index - 1);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6 || digits.some((d) => d === '')) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: call backend — verifies OTP + upserts Owner in DB
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/verify_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp, phone: phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${res.status}`);
      }

      const { auth_token, refresh_token } = await res.json();

      // Bridge backend JWT into the Supabase JS client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: auth_token,
        refresh_token: refresh_token,
      });
      if (sessionError) throw sessionError;

      // Stamp owner role for OwnerRoute guard
      localStorage.setItem('bb_role', 'owner');

      // Check if owner has an institute — new owners must set one up first
      const instRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/institute`, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      navigate(instRes.ok ? '/owner/dashboard' : '/owner/setup');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP. Please check the OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setDigits(Array(6).fill(''));
    setResendTimer(60);
    setIsResending(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/generate_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${res.status}`);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again. ' + err.message);
    } finally {
      setIsResending(false);
    }
  };

  if (!phoneNumber) {
    return null;
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
          An OTP has been sent to{' '}
          <Typography component="span" color="primary" fontWeight="bold">
            +91 {phoneNumber}
          </Typography>
          . Please enter it below.
        </Typography>

        <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            {Array.from({ length: 6 }).map((_, index) => (
              <TextField
                key={index}
                inputRef={inputRefs.current[index]}
                variant="outlined"
                size="medium"
                value={digits[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  autoComplete: index === 0 ? 'one-time-code' : 'off',
                  style: { textAlign: 'center', fontSize: '1.5rem', width: '1.5em' },
                }}
                sx={{
                  width: 50,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
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
            disabled={isLoading || otp.length !== 6 || digits.some((d) => d === '')}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {resendTimer > 0 ? (
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
                {isResending ? <CircularProgress size={24} color="inherit" /> : 'Resend OTP'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default OtpVerification;

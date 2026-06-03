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

/**
 * OtpVerification — owner login step 2.
 *
 * Receives { phoneNumber } from router state (set by PhoneLogin).
 * Calls the backend /owner/verify_otp which:
 *   1. Verifies the OTP with Supabase
 *   2. Upserts the Owner record in the DB
 *   3. Returns { auth_token, refresh_token, aud, teacher_id }
 *
 * We then call supabase.auth.setSession() so the Supabase JS client
 * has a valid session. AuthContext picks it up via onAuthStateChange
 * and ProtectedRoute lets the user through.
 */
const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();
  const phoneNumber = location.state?.phoneNumber;

  // Refs for each OTP digit input
  const otpRefs = useRef(Array(6).fill(null).map(() => React.createRef()));

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/phone-login');
    }
  }, [phoneNumber, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const tick = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(tick);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    const digits = otp.split('');
    digits[index] = value.slice(-1);
    const updated = digits.join('');
    setOtp(updated);
    if (value && index < 5 && otpRefs.current[index + 1].current) {
      otpRefs.current[index + 1].current.focus();
    }
    if (error && updated.length === 6) setError('');
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
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  autoComplete: 'one-time-code',
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
            disabled={isLoading || otp.length !== 6}
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

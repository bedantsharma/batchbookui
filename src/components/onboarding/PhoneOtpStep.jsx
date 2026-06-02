// src/components/onboarding/PhoneOtpStep.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, InputAdornment } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { supabase } from '../../lib/supabaseClient';

const API = import.meta.env.VITE_API_BASE_URL;

export default function PhoneOtpStep({ phone: initialPhone = '', label = 'Phone number', onSuccess }) {
  const prefilled = !!initialPhone;
  const [subStep, setSubStep] = useState(prefilled ? 'otp-pending' : 'phone');
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Clean countdown: a new interval fires whenever resendTimer > 0
  useEffect(() => {
    if (resendTimer <= 0) return;
    const tick = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(tick);
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').substring(0, 10));
    if (error) setError('');
  };

  const sendOtp = async (phoneNum) => {
    if (phoneNum.length !== 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/student/generate_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNum }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `Error ${res.status}`); }
      setSubStep('otp');
      setResendTimer(60);
    } catch (err) {
      setError('Failed to send OTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-send OTP when phone is pre-filled (parent flow)
  useEffect(() => {
    if (prefilled && subStep === 'otp-pending') { sendOtp(initialPhone); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/student/verify_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token: otp }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `Error ${res.status}`); }
      const { auth_token, refresh_token, children } = await res.json();

      // Store the first child's ID so dashboard APIs know which student to load.
      if (children && children.length > 0) {
        localStorage.setItem('bb_student_id', String(children[0].id));
        localStorage.setItem('bb_student_name', children[0].name ?? '');
      }

      // Bridge the backend Supabase JWT into the Supabase JS client.
      // AuthContext will pick up the session via onAuthStateChange.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: auth_token,
        refresh_token: refresh_token,
      });
      if (sessionError) throw sessionError;

      onSuccess(phone);
    } catch (err) {
      setError('OTP verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (subStep === 'phone') {
    return (
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>Your phone number</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We'll send a one-time password to verify your number.
        </Typography>
        <TextField
          label={label}
          fullWidth
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          inputProps={{ maxLength: 10 }}
          placeholder="10-digit mobile number"
          error={!!error}
          helperText={error || 'Indian number, no country code'}
          disabled={loading}
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment> }}
          sx={{ mb: 3 }}
        />
        <Button variant="contained" color="primary" fullWidth size="large" disabled={loading || phone.length !== 10} onClick={() => sendOtp(phone)} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
          {loading ? <CircularProgress size={22} color="inherit"/> : 'Send OTP'}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Enter OTP</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sent to <strong>+91 {phone}</strong>
      </Typography>
      <TextField
        label="6-digit OTP"
        fullWidth
        type="tel"
        value={otp}
        onChange={e => { setOtp(e.target.value.replace(/\D/g, '').substring(0, 6)); if (error) setError(''); }}
        inputProps={{ maxLength: 6 }}
        error={!!error}
        helperText={error}
        disabled={loading}
        sx={{ mb: 3 }}
      />
      <Button variant="contained" color="primary" fullWidth size="large" disabled={loading || otp.length !== 6} onClick={verifyOtp} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mb: 1.5 }}>
        {loading ? <CircularProgress size={22} color="inherit"/> : 'Verify'}
      </Button>
      <Button variant="text" fullWidth disabled={resendTimer > 0 || loading} onClick={() => { setOtp(''); sendOtp(phone); }} sx={{ color: 'text.secondary', fontSize: 13 }}>
        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
      </Button>
    </Box>
  );
}

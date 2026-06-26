import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import PhoneOtpStep from './PhoneOtpStep';

export default function JoinInstitute() {
  const { joinCode } = useParams();
  const [params] = useSearchParams();
  const studentName = params.get('student') || '';
  const navigate = useNavigate();

  const handleSuccess = async () => {
    // Parent claimed their stub on OTP verify (backend links by phone).
    // Persist join code for the join-institute call if the parent is new.
    try {
      localStorage.setItem('bb_join_code', joinCode || '');
    } catch { /* ignore */ }
    navigate('/dashboard/student');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {studentName ? `Welcome, ${studentName}'s parent!` : 'Verify your number'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verify your phone to view attendance, fees &amp; schedule.
        </Typography>
        <PhoneOtpStep label="Your phone number" onSuccess={handleSuccess} />
      </Card>
    </Box>
  );
}

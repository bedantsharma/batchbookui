import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import { joinInstitute } from '../services/ownerService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function JoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [institute, setInstitute] = useState(null);
  const [loadingInstitute, setLoadingInstitute] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Fetch institute info by join code (public, no auth needed)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE}/parent/institute/search?owner_phone=` +
          // join_code lookup via a dedicated public endpoint would be ideal;
          // for now we rely on the JoinPage only being reached via QR which
          // has the code, so we call the search-by-code path on the parent route
          // using a workaround: we POST join-institute only when authenticated.
          // For the preview card we call a lightweight public resolve endpoint.
          // TODO: add GET /institute/public/{code} when adding more pages.
          // For now, we skip the preview fetch and show just the code.
          encodeURIComponent(''),
        );
        // Graceful: if no preview endpoint exists yet, show generic card
      } catch (_) {
        // ignore
      } finally {
        setInstitute({ join_code: code });
        setLoadingInstitute(false);
      }
    }
    load();
  }, [code]);

  async function handleJoin() {
    if (!session) {
      // Not logged in — send through OTP flow then come back here
      navigate(`/onboarding?redirect=/join/${code}`);
      return;
    }
    setJoining(true); setJoinError('');
    try {
      const inst = await joinInstitute(code);
      setInstitute(inst);
      setJoined(true);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to join. Try again.';
      setJoinError(msg);
    } finally {
      setJoining(false);
    }
  }

  if (loadingInstitute) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (joined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
        <Card sx={{ width: '100%', maxWidth: 400, p: 4, borderRadius: 4, bgcolor: 'background.paper', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>You're in!</Typography>
          <Typography color="text.secondary" mb={3}>
            {institute?.name
              ? `You've been linked to ${institute.name}.`
              : "You've been linked to your institute."}
            {' '}Your attendance, fees and schedule will appear on your dashboard.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate('/dashboard/student')}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
          >
            Go to dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SchoolIcon sx={{ color: '#000', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {institute?.name || 'Join Institute'}
            </Typography>
            {institute?.city && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{institute.city}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          You've been invited to join via code <strong>{code}</strong>.
          {!session && ' Log in first so we can link your account.'}
        </Typography>

        {joinError && (
          <Typography color="error" variant="body2" sx={{ mb: 2, fontSize: 13 }}>
            {joinError}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={joining}
          onClick={handleJoin}
          sx={{ borderRadius: 2, fontWeight: 700, py: 1.5, mb: 1.5 }}
        >
          {joining ? <CircularProgress size={22} color="inherit" /> : session ? 'Confirm & Join' : 'Log in to join'}
        </Button>

        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary', fontSize: 13 }}
        >
          Back to home
        </Button>
      </Card>
    </Box>
  );
}

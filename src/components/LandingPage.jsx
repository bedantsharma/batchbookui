// src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button } from '@mui/material';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420, p: 5, textAlign: 'center', borderRadius: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a' }}>B</Typography>
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1.5 }}>
          BatchBook
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          Manage your coaching classes — attendance, fees, and students in one place.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/onboarding')}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 15 }}
        >
          Get Started
        </Button>
      </Card>
    </Box>
  );
}

// src/components/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button } from '@mui/material';
import ExploreOffIcon from '@mui/icons-material/ExploreOff';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: 5, textAlign: 'center', borderRadius: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
        <Typography sx={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.04em', color: 'primary.main', lineHeight: 1, mb: 1 }}>
          404
        </Typography>
        <ExploreOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}/>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Are you lost?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          This page doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          Go Home
        </Button>
      </Card>
    </Box>
  );
}

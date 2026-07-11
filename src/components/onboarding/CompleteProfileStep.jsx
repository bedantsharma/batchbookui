// src/components/onboarding/CompleteProfileStep.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import api from '../../services/api';

export default function CompleteProfileStep({ missing, childId, onDone }) {
  const [parentName, setParentName] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    (!missing.parentName || parentName.trim().length > 0) &&
    (!missing.childEmail || childEmail.trim().length > 0);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (missing.parentName) {
        await api.patch('/parent/update', { name: parentName.trim() });
      }
      if (missing.childEmail) {
        await api.patch(`/parent/children/${childId}`, { email: childEmail.trim() });
      }
      onDone();
    } catch (err) {
      setError('Could not save your details: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Just one more thing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A couple of details are still missing from your profile.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {missing.parentName && (
          <TextField
            label="Your name"
            fullWidth
            value={parentName}
            onChange={e => setParentName(e.target.value)}
            disabled={loading}
          />
        )}
        {missing.childEmail && (
          <TextField
            label="Child's email"
            fullWidth
            type="email"
            value={childEmail}
            onChange={e => setChildEmail(e.target.value)}
            disabled={loading}
          />
        )}
        {error && <Typography variant="caption" color="error">{error}</Typography>}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || !canSubmit}
          onClick={handleSubmit}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={22} color="inherit"/> : 'Continue'}
        </Button>
      </Box>
    </Box>
  );
}

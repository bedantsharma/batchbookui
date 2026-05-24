// src/components/onboarding/ProfileStep.jsx
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

export default function ProfileStep({ name, email, onChangeName, onChangeEmail }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Tell us about yourself</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Both fields are optional — we've pre-filled a name for you.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Your name"
          fullWidth
          value={name}
          onChange={e => onChangeName(e.target.value)}
          helperText="Leave as-is or enter your real name"
        />
        <TextField
          label="Email (optional)"
          fullWidth
          type="email"
          value={email}
          onChange={e => onChangeEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Box>
    </Box>
  );
}

// src/components/onboarding/InstitutionStep.jsx
import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

export default function InstitutionStep({ institutionName, onChange }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Your institution</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Optional — we've generated a placeholder name you can change anytime.
      </Typography>
      <TextField
        label="Institution name"
        fullWidth
        value={institutionName}
        onChange={e => onChange(e.target.value)}
        helperText="E.g. Sharma Classes, Bright Future Academy"
        InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon/></InputAdornment> }}
      />
    </Box>
  );
}

// src/components/onboarding/ParentDetailsStep.jsx
import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export default function ParentDetailsStep({ parentName, parentPhone, onChangeName, onChangePhone, errors }) {
  const handlePhone = (e) => {
    const clean = e.target.value.replace(/\D/g, '').substring(0, 10);
    onChangePhone(clean);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Parent details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your parent will verify their phone number to complete sign-up.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Parent name"
          fullWidth
          value={parentName}
          onChange={e => onChangeName(e.target.value)}
          error={!!errors?.parentName}
          helperText={errors?.parentName}
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon/></InputAdornment> }}
        />
        <TextField
          label="Parent phone number"
          fullWidth
          type="tel"
          value={parentPhone}
          onChange={handlePhone}
          inputProps={{ maxLength: 10 }}
          placeholder="10-digit mobile number"
          error={!!errors?.parentPhone}
          helperText={errors?.parentPhone || 'OTP will be sent to this number'}
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment> }}
        />
      </Box>
    </Box>
  );
}

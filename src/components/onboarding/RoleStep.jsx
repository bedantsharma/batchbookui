// src/components/onboarding/RoleStep.jsx
import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

export default function RoleStep({ value, onChange }) {
  const options = [
    { id: 'student', label: 'Student', sub: "I'm here to learn", Icon: SchoolIcon },
    { id: 'teacher', label: 'Teacher', sub: 'I run a coaching class', Icon: PersonIcon },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>What's your role?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This helps us set up the right experience for you.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {options.map(({ id, label, sub, Icon }) => {
          const selected = value === id;
          return (
            <Card
              key={id}
              onClick={() => onChange(id)}
              sx={{
                p: 2.5, cursor: 'pointer', borderRadius: 3,
                border: '2px solid',
                borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.10)',
                bgcolor: selected ? 'rgba(187,134,252,0.08)' : 'background.paper',
                display: 'flex', alignItems: 'center', gap: 2,
                transition: 'all 0.15s',
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: selected ? 'primary.main' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon sx={{ color: selected ? '#1a1a1a' : 'text.secondary', fontSize: 22 }}/>
              </Box>
              <Box>
                <Typography fontWeight={700} sx={{ color: selected ? 'primary.main' : 'text.primary' }}>{label}</Typography>
                <Typography variant="caption" color="text.secondary">{sub}</Typography>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

// src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const T = {
  bg:      '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  fg1:     '#FFFFFF',
  fg2:     '#B0B0B0',
  fg3:     'rgba(255,255,255,0.35)',
  outline: 'rgba(255,255,255,0.10)',
  sans:    "'DM Sans', system-ui, sans-serif",
};

function LogoMark({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size * (46 / 48)} viewBox="0 0 48 46" fill="none">
      <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: '₹',
    title: 'Fee Management',
    desc: 'See who has paid, send reminders, and collect UPI payments — all from your phone. No more chasing parents on WhatsApp.',
  },
  {
    icon: '✓',
    title: 'Attendance',
    desc: 'Mark an entire batch present or absent in under 30 seconds. Parents get an automatic alert when their child is absent.',
  },
  {
    icon: '📊',
    title: 'Test Scores',
    desc: 'Record scores after every test. BatchBook flags students whose average drops below 60% so no one slips through the cracks.',
  },
];

const STEPS = [
  { n: '1', label: 'Sign up',        desc: 'Enter your phone number, verify with OTP. No passwords, no forms.' },
  { n: '2', label: 'Add students',   desc: 'Create your batches and add students. Takes about 2 minutes.' },
  { n: '3', label: 'Start managing', desc: 'Mark attendance, collect fees, track test scores — all from your phone.' },
];

function CTAButton({ onClick, children }) {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={onClick}
      sx={{
        bgcolor: T.primary,
        color: '#1a1a1a',
        fontWeight: 700,
        fontSize: 15,
        borderRadius: '14px',
        px: 4,
        py: 1.5,
        fontFamily: T.sans,
        textTransform: 'none',
        '&:hover': { bgcolor: '#c99ffe' },
      }}
    >
      {children}
    </Button>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goToOnboarding = () => navigate('/onboarding');

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: T.sans, color: T.fg1 }}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${T.outline}` }}>
        <LogoMark size={22} />
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: T.fg1, fontFamily: T.sans }}>BatchBook</Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          size="small"
          onClick={goToOnboarding}
          sx={{ borderColor: T.primary, color: T.primary, borderRadius: '20px', fontFamily: T.sans, fontWeight: 600, fontSize: 13, px: 2.5, textTransform: 'none' }}
        >
          Sign in
        </Button>
      </Box>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, pt: { xs: 8, sm: 12 }, pb: { xs: 6, sm: 10 }, maxWidth: 740, mx: 'auto', textAlign: 'center' }}>
        <Box sx={{ display: 'inline-block', bgcolor: 'rgba(187,134,252,0.12)', border: `1px solid rgba(187,134,252,0.25)`, borderRadius: '20px', px: 2, py: 0.5, mb: 3 }}>
          <Typography sx={{ fontSize: 11, color: T.primary, fontFamily: T.sans, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            For coaching institutes
          </Typography>
        </Box>

        <Typography
          component="h1"
          sx={{ fontSize: { xs: 32, sm: 46 }, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', color: T.fg1, fontFamily: T.sans, mb: 2.5 }}
        >
          Run your coaching institute from your phone
        </Typography>

        <Typography sx={{ fontSize: { xs: 15, sm: 18 }, color: T.fg2, lineHeight: 1.7, fontFamily: T.sans, mb: 5, maxWidth: 580, mx: 'auto' }}>
          Fees, attendance, and test scores — all in one place. Built for solo teachers who spend 8+ hours a week on admin work that software can do in seconds.
        </Typography>

        <CTAButton onClick={goToOnboarding}>Get Started Free</CTAButton>
        <Typography sx={{ fontSize: 12, color: T.fg3, mt: 1.5, fontFamily: T.sans }}>No credit card required</Typography>
      </Box>

      {/* ── Social proof strip ────────────────────────────────── */}
      <Box sx={{ textAlign: 'center', pb: 8 }}>
        <Typography sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans }}>
          Join <strong style={{ color: T.fg2 }}>50+ coaching institutes</strong> already using BatchBook
        </Typography>
      </Box>

      {/* ── Features ──────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, pb: { xs: 10, sm: 14 }, maxWidth: 1000, mx: 'auto' }}>
        <Typography sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 700, textAlign: 'center', mb: 6, fontFamily: T.sans }}>
          Everything you need, nothing you don't
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {FEATURES.map(f => (
            <Box key={f.title} sx={{ bgcolor: T.surface, borderRadius: '16px', p: 3.5, border: `1px solid ${T.outline}` }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '12px', bgcolor: 'rgba(187,134,252,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, mb: 2.5 }}>
                {f.icon}
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.fg1, fontFamily: T.sans, mb: 1 }}>{f.title}</Typography>
              <Typography sx={{ fontSize: 13, color: T.fg2, fontFamily: T.sans, lineHeight: 1.65 }}>{f.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── How it works ──────────────────────────────────────── */}
      <Box sx={{ bgcolor: T.surface, py: { xs: 10, sm: 14 }, px: { xs: 2.5, sm: 5 }, borderTop: `1px solid ${T.outline}`, borderBottom: `1px solid ${T.outline}` }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 700, mb: 7, fontFamily: T.sans }}>
            Up and running in 5 minutes
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 4 }}>
            {STEPS.map(s => (
              <Box key={s.n} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#1a1a1a', fontFamily: T.sans, flexShrink: 0 }}>
                  {s.n}
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.fg1, fontFamily: T.sans }}>{s.label}</Typography>
                <Typography sx={{ fontSize: 13, color: T.fg2, fontFamily: T.sans, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 7 }}>
            <CTAButton onClick={goToOnboarding}>Start for free</CTAButton>
          </Box>
        </Box>
      </Box>

      {/* ── Footer ────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogoMark size={16} />
            <Typography sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans }}>
              BatchBook © {new Date().getFullYear()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography
              component="a"
              href="/privacy-policy"
              sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans, textDecoration: 'none', '&:hover': { color: T.fg2 } }}
            >
              Privacy Policy
            </Typography>
            <Typography
              component="a"
              href="mailto:manurishi1103@gmail.com"
              sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans, textDecoration: 'none', '&:hover': { color: T.fg2 } }}
            >
              Contact
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}

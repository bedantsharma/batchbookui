// src/components/PrivacyPolicy.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

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

function LogoMark({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size * (46 / 48)} viewBox="0 0 48 46" fill="none">
      <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
    </svg>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 700, color: T.fg1, fontFamily: T.sans, mb: 1.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: 14, color: T.fg2, fontFamily: T.sans, lineHeight: 1.8 }}>{children}</Typography>
    </Box>
  );
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: T.sans, color: T.fg1 }}>

      {/* Nav */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${T.outline}`, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <LogoMark size={20} />
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.fg1, fontFamily: T.sans }}>BatchBook</Typography>
        <Typography sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans, ml: 0.5 }}>/ Privacy Policy</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: { xs: 6, sm: 8 }, maxWidth: 680, mx: 'auto' }}>
        <Typography component="h1" sx={{ fontSize: { xs: 26, sm: 32 }, fontWeight: 800, mb: 1, fontFamily: T.sans }}>
          Privacy Policy
        </Typography>
        <Typography sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans, mb: 6 }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>

        <Section title="What is BatchBook?">
          BatchBook is a software product for coaching institutes in India. It helps institute owners manage students, track attendance, collect fees, and monitor test scores. Parents use BatchBook to view their child's attendance, schedule, and fee status.
        </Section>

        <Section title="What data we collect">
          We collect phone numbers for authentication (OTP-based login — no passwords). For institute owners we store their name, phone number, and institute details. For students and parents we store name, phone number, and the student's academic data (attendance records, fee status, test scores). No financial payment data is stored on our servers — payments are processed by Razorpay, which has its own privacy policy.
        </Section>

        <Section title="How we use your data">
          Your data is used solely to operate the BatchBook service: authenticating you, displaying your institute's records, sending fee reminders and absence alerts via WhatsApp (where enabled), and generating reports for the institute owner. We do not use your data for advertising or sell it to any third party.
        </Section>

        <Section title="Who can see your data">
          Institute owners can see the data for their own institute only. Parents can see their own child's data only. We do not share your data with other institutes or third parties, except service providers required to operate the product (Supabase for authentication and database hosting, Razorpay for payment processing, WATI for WhatsApp messaging).
        </Section>

        <Section title="Data retention">
          We retain your data for as long as your account is active. If you wish to delete your data, contact us at the email below and we will remove it within 30 days.
        </Section>

        <Section title="Contact">
          If you have questions about this privacy policy or your data, email us at{' '}
          <Typography component="a" href="mailto:manurishi1103@gmail.com" sx={{ color: T.primary, fontFamily: T.sans, fontSize: 14 }}>
            manurishi1103@gmail.com
          </Typography>
          .
        </Section>
      </Box>

      {/* Footer */}
      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: 3, borderTop: `1px solid ${T.outline}`, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: T.fg3, fontFamily: T.sans }}>BatchBook © {new Date().getFullYear()}</Typography>
      </Box>

    </Box>
  );
}

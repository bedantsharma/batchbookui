import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, Typography, Button } from '@mui/material';
import { keyframes } from '@emotion/react';

const drawCircle = keyframes`
  to { stroke-dashoffset: 0; }
`;

const drawCheck = keyframes`
  to { stroke-dashoffset: 0; }
`;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPaid = searchParams.get('razorpay_payment_link_status') === 'paid';

  const iconColor = isPaid ? '#03DAC6' : '#BB86FC';
  const iconLabel = isPaid ? 'Payment successful' : 'Payment not completed';
  const heading = isPaid ? 'Payment received' : 'Payment not completed';
  const body = isPaid
    ? 'Your institute will confirm it shortly.'
    : 'If money was deducted, it will be refunded automatically. You can try the link again or contact your institute.';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 5,
          textAlign: 'center',
          borderRadius: 4,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" role="img" aria-label={iconLabel}>
            <circle
              cx="44"
              cy="44"
              r="40"
              stroke={iconColor}
              strokeWidth="4"
              fill="none"
              strokeDasharray="251"
              strokeDashoffset="251"
              style={{ animation: `${drawCircle} 0.6s ease-out forwards` }}
            />
            {isPaid && (
              <path
                d="M26 45 L39 58 L62 32"
                stroke={iconColor}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="50"
                strokeDashoffset="50"
                style={{ animation: `${drawCheck} 0.4s ease-out 0.5s forwards` }}
              />
            )}
          </svg>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {heading}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {body}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          Done
        </Button>
      </Card>
    </Box>
  );
}

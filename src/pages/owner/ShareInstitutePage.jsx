import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeSVG } from 'qrcode.react';
import { getInstituteQR } from '../../services/ownerService';

const T = {
  bg:      '#121212',
  surface: '#1E1E1E',
  surfVar: '#2C2C2C',
  primary: '#BB86FC',
  fg1:     '#FFFFFF',
  fg2:     '#B0B0B0',
  outline: 'rgba(255,255,255,0.10)',
  sans:    "'DM Sans', system-ui, sans-serif",
};

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '12px 16px', borderRadius: 2, bgcolor: T.surfVar, mb: 1.5 }}>
      <Box>
        <Typography sx={{ fontFamily: T.sans, fontSize: 11, color: T.fg2, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>{label}</Typography>
        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.fg1, wordBreak: 'break-all' }}>{value}</Typography>
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton onClick={copy} size="small" sx={{ color: copied ? 'secondary.main' : T.fg2, ml: 1 }}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function ShareInstitutePage() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getInstituteQR()
      .then(setQrData)
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load QR info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.bg }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.bg }}>
        <Typography sx={{ fontFamily: T.sans, color: '#CF6679' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, bgcolor: T.bg, overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
      <Typography sx={{ fontFamily: T.sans, fontWeight: 700, fontSize: 22, color: T.fg1, mb: 0.5 }}>
        Share with parents
      </Typography>
      <Typography sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg2, mb: 4 }}>
        Parents scan the QR code or enter your phone number to find and join {qrData.institute_name}.
      </Typography>

      {/* QR code */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 3, display: 'inline-block' }}>
          <QRCodeSVG
            value={qrData.join_url}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#121212"
            level="M"
          />
        </Box>
      </Box>

      {/* Copy rows */}
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <CopyRow label="Join link (share on WhatsApp)" value={qrData.join_url} />
        <CopyRow label="Join code" value={qrData.join_code} />
        <CopyRow label="Your phone number (parents can search with this)" value={qrData.owner_phone} />
      </Box>

      {/* Instructions */}
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 3, p: 2.5, borderRadius: 2, border: `1px solid ${T.outline}` }}>
        <Typography sx={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.fg1, mb: 1 }}>
          How parents join
        </Typography>
        {[
          'Share the join link on your class WhatsApp group',
          'Parent opens the link → taps "Log in to join" → enters their phone',
          'They verify with OTP → automatically linked to your institute',
          "Their child's attendance, fees & schedule appear immediately",
        ].map((step, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
            <Typography sx={{ fontFamily: T.sans, fontSize: 12, color: T.primary, fontWeight: 700, minWidth: 16 }}>{i + 1}.</Typography>
            <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>{step}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

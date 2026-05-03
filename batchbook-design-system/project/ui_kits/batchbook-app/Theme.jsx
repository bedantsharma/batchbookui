// BatchBook UI Kit — Theme
// Shared design tokens and MUI-aligned theme values

const BB_THEME = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    primary: '#BB86FC',
    primaryVivid: '#863bff',
    primaryContainer: '#3700B3',
    secondary: '#03DAC6',
    error: '#CF6679',
    errorContainer: '#B00020',
    success: '#4CAF50',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: 'rgba(255,255,255,0.38)',
    outline: 'rgba(255,255,255,0.12)',
    outlineVariant: 'rgba(255,255,255,0.08)',
  },
  fonts: {
    sans: "'DM Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadow: {
    card: '0 10px 20px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.6)',
    primary: '0 0 0 3px rgba(187,134,252,0.3)',
    glow: '0 0 16px rgba(134,59,255,0.4)',
  }
};

Object.assign(window, { BB_THEME });

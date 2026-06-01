import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

/**
 * ErrorBoundary — catches uncaught render errors in any child component tree
 * and shows a friendly fallback instead of a blank white screen.
 *
 * Must be a class component; React error boundaries cannot be hooks.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          bgcolor: '#121212',
          color: '#FFFFFF',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(207,102,121,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: '#CF6679',
          }}
        >
          ✕
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Something went wrong
        </Typography>
        <Typography variant="body2" sx={{ color: '#B0B0B0', maxWidth: 360 }}>
          An unexpected error occurred. Try refreshing the page, or click the button below.
        </Typography>
        <Button
          variant="contained"
          onClick={() => this.setState({ hasError: false })}
          sx={{ mt: 1, borderRadius: '16px' }}
        >
          Try again
        </Button>
      </Box>
    );
  }
}

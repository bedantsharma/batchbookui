import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PhoneLogin from './components/PhoneLogin';
import OtpVerification from './components/OtpVerification';
import Dashboard from './components/Dashboard';
import OwnerSetup from './pages/owner/OwnerSetup';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ─── BatchBook dark theme ─────────────────────────────────────────────────────
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: '16px' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '16px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
        },
      },
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Public routes ─────────────────────────────────── */}
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/otp-verification" element={<OtpVerification />} />

            {/* ── Student routes (protected) ─────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Owner routes (protected) ───────────────────────── */}
            <Route
              path="/owner/setup"
              element={
                <ProtectedRoute>
                  <OwnerSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Root redirect ──────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/phone-login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

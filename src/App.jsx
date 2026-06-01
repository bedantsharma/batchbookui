import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './components/LandingPage';
import NotFoundPage from './components/NotFoundPage';
import PhoneLogin from './components/PhoneLogin';
import OtpVerification from './components/OtpVerification';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerSetup from './pages/owner/OwnerSetup';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#BB86FC' },
    secondary: { main: '#03DAC6' },
    background: { default: '#121212', paper: '#1E1E1E' },
    text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
  },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: '16px' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: '16px' } } },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>
            <Router>
          <Routes>
            {/* ── Public routes ─────────────────────────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* ── Owner protected routes ────────────────────────── */}
            <Route
              path="/owner/setup"
              element={<ProtectedRoute><OwnerSetup /></ProtectedRoute>}
            />
            <Route
              path="/owner/dashboard"
              element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>}
            />

            {/* ── Student / Teacher protected routes ────────────── */}
            <Route
              path="/dashboard/teacher"
              element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/student"
              element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
            />

            {/* ── Legacy redirect ───────────────────────────────── */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            {/* ── Catch-all ─────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { darkTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerRoute from './components/OwnerRoute';
import StudentRoute from './components/StudentRoute';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import NotFoundPage from './components/NotFoundPage';
import PhoneLogin from './components/PhoneLogin';
import PaymentSuccess from './components/PaymentSuccess';
import OtpVerification from './components/OtpVerification';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import CompleteProfileStep from './components/onboarding/CompleteProfileStep';
import JoinInstitute from './components/onboarding/JoinInstitute';
import StudentDashboard from './components/student/StudentDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerSetup from './pages/owner/OwnerSetup';

function CompleteProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { missing, childId } = location.state || {};
  if (!missing) return <Navigate to="/dashboard/student" replace />;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4, boxShadow: 3, bgcolor: 'background.paper' }}>
        <CompleteProfileStep
          missing={missing}
          childId={childId}
          onDone={() => navigate('/dashboard/student', { replace: true })}
        />
      </Box>
    </Box>
  );
}

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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/join/:joinCode" element={<JoinInstitute />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* ── Owner protected routes ────────────────────────── */}
            <Route
              path="/owner/setup"
              element={<OwnerRoute><OwnerSetup /></OwnerRoute>}
            />
            <Route
              path="/owner/dashboard"
              element={<OwnerRoute><OwnerDashboard /></OwnerRoute>}
            />

            {/* ── Student protected route ───────────────────────── */}
            <Route
              path="/dashboard/student"
              element={<StudentRoute><StudentDashboard /></StudentRoute>}
            />
            <Route
              path="/complete-profile"
              element={<StudentRoute><CompleteProfilePage /></StudentRoute>}
            />

            {/* ── Teacher — coming soon (no auth required) ─────── */}
            <Route
              path="/dashboard/teacher"
              element={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400, p: 4 }}>
                    Teacher access is coming soon.<br />Ask your institute owner to invite you.
                  </Typography>
                </Box>
              }
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

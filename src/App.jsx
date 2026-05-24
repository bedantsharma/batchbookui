import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './components/LandingPage';
import NotFoundPage from './components/NotFoundPage';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          {/* Legacy redirects */}
          <Route path="/phone-login" element={<Navigate to="/" replace />} />
          <Route path="/otp-verification" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

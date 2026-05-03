import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PhoneLogin from './components/PhoneLogin';
import OtpVerification from './components/OtpVerification';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Resets browser default styles
import Dashboard from './components/Dashboard';

// Define a basic Material 3 dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC', // Example Material 3 dark primary color
    },
    secondary: {
      main: '#03DAC6', // Example Material 3 dark secondary color
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E', // Darker surface for cards, etc.
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
        root: {
          borderRadius: '16px', // Example: More rounded corners for cards
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Example: More rounded corners for buttons
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', // Example: More rounded corners for text fields
          },
        },
      },
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Apply a baseline CSS reset */}
      <Router>
        <Routes>
          <Route path="/phone-login" element={<PhoneLogin />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<PhoneLogin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

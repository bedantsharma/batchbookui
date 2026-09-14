// src/theme.js
//
// Shared MUI theme. Extracted out of App.jsx so it can also be imported by
// src/entry-server.jsx (the build-time prerenderer), which doesn't load the
// rest of App.jsx's client-only routing/context tree.
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
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

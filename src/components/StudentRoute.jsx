import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * StudentRoute — guards any route that requires an authenticated student/parent.
 *
 * Reads role from localStorage directly (not React state) so the check
 * is always current after login stamps bb_role before navigating.
 */
export default function StudentRoute({ children }) {
  const { session, loading } = useAuth();
  const role = localStorage.getItem('bb_role');

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session || role !== 'student') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

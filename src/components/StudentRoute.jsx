import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import api from '../services/api';
import { computeMissingFields, hasMissingFields } from '../lib/profileCompleteness';

/**
 * StudentRoute — guards any route that requires an authenticated student/parent.
 *
 * Fast path: `bb_role === 'student'` in localStorage + a live session — renders
 * immediately, no network call.
 *
 * Fallback: a live session exists but `bb_role` is missing (cleared storage, new
 * device) — call GET /parent/me to restore the role instead of forcing the whole
 * onboarding flow again. If that profile is missing fields, redirect to
 * /complete-profile instead of the originally-requested page.
 */
export default function StudentRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const role = localStorage.getItem('bb_role');
  const [restoring, setRestoring] = useState(session && role !== 'student');
  const [restoreResult, setRestoreResult] = useState(null); // 'ok' | 'incomplete' | 'failed' | null

  useEffect(() => {
    if (loading || !session || role === 'student') return;
    let cancelled = false;
    setRestoring(true);
    api.get('/parent/me')
      .then(({ data }) => {
        if (cancelled) return;
        localStorage.setItem('bb_role', 'student');
        const child = data.children?.[0];
        if (child) {
          localStorage.setItem('bb_student_id', String(child.id));
          localStorage.setItem('bb_student_name', child.name ?? '');
        }
        const missing = computeMissingFields(data.name, child);
        if (child && hasMissingFields(missing)) {
          setRestoreResult({ status: 'incomplete', missing, childId: child.id });
        } else {
          setRestoreResult({ status: 'ok' });
        }
      })
      .catch(() => { if (!cancelled) setRestoreResult({ status: 'failed' }); })
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session?.access_token, role]);

  if (loading || restoring) {
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

  if (!session) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check restoreResult (this mount's actual /parent/me outcome) before the plain
  // role fast path: the effect stamps bb_role = 'student' on ANY successful fetch,
  // complete or not, so a live localStorage read here would otherwise mask an
  // 'incomplete' result behind the now-truthy bb_role cache.
  if (restoreResult?.status === 'ok') {
    return children;
  }
  if (restoreResult?.status === 'incomplete') {
    if (location.pathname === '/complete-profile') return children;
    return (
      <Navigate
        to="/complete-profile"
        state={{ missing: restoreResult.missing, childId: restoreResult.childId }}
        replace
      />
    );
  }
  if (restoreResult?.status === 'failed') {
    return <Navigate to="/onboarding" replace />;
  }

  // No restore was attempted this mount (restoreResult is still null) — fall back
  // to the plain cached-role fast path.
  if (role === 'student') {
    return children;
  }

  return <Navigate to="/onboarding" replace />;
}

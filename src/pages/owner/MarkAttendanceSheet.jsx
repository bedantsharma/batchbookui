import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { markAttendance } from '../../services/ownerService';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       '#121212',
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  primary:  '#BB86FC',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.10)',
  sans:     "'DM Sans', system-ui, sans-serif",
  present:  '#4CAF50',
  absent:   '#CF6679',
};

/**
 * MarkAttendanceSheet
 *
 * Renders one row per attendance record for this session, with PRESENT/ABSENT
 * toggles. On submit, sends the marked attendance to the backend.
 *
 * The session's roster (who appears, and the present/absent counts) comes
 * from `initialAttendance` — the rows actually persisted for this session —
 * not from `enrollments`, the batch's *current* active-enrollment list.
 * Those two can diverge: a session's attendance rows are frozen to whoever
 * was actively enrolled when the session was created, while `enrollments`
 * keeps changing as students join/leave the batch. Rendering off the live
 * enrollment list made an older session's roster silently drift from its
 * actual attendance records — showing the wrong students, wrong checkmarks,
 * and present/absent counts that didn't add up to the true class size.
 * `enrollments` is only used here to look up display names.
 *
 * Props:
 *   sessionId       - ClassSession ID
 *   enrollments     - list of { id, student_id, student_name? } from the parent (name lookup only)
 *   initialAttendance - existing attendance rows (AttendanceResponse[]) for this session — the roster
 *   onSubmitted     - callback(attendanceRows) after successful submission
 */
export default function MarkAttendanceSheet({
  sessionId,
  enrollments,
  initialAttendance,
  onSubmitted,
}) {
  const roster = initialAttendance || [];

  function presentIdsFrom(rows) {
    return new Set(rows.filter((r) => r.status === 'PRESENT').map((r) => r.enrollment_id));
  }

  const [presentIds, setPresentIds] = useState(() => presentIdsFrom(roster));
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  function toggleStudent(enrollmentId) {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) {
        next.delete(enrollmentId);
      } else {
        next.add(enrollmentId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const rows = await markAttendance(sessionId, [...presentIds]);
      const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
      const absentCount = rows.filter((r) => r.status === 'ABSENT').length;
      // Resync from the server's response (the source of truth) rather than
      // trusting whatever was locally toggled — a toggled ID that has no
      // attendance row for this session is silently ignored server-side.
      setPresentIds(presentIdsFrom(rows));
      setToast({
        open: true,
        message: `Attendance saved! ${presentCount} present, ${absentCount} absent.`,
        severity: 'success',
      });
      if (onSubmitted) onSubmitted(rows);
    } catch {
      setToast({ open: true, message: 'Failed to save attendance. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const presentCount = presentIds.size;
  const totalCount = roster.length;

  return (
    <Box>
      {/* Header row: counts */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            label={`${presentCount} Present`}
            size="small"
            sx={{
              bgcolor: 'rgba(76,175,80,0.15)',
              color: T.present,
              fontFamily: T.sans,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${totalCount - presentCount} Absent`}
            size="small"
            sx={{
              bgcolor: 'rgba(207,102,121,0.15)',
              color: T.absent,
              fontFamily: T.sans,
              fontWeight: 600,
            }}
          />
        </Box>
        <Button
          variant="text"
          size="small"
          sx={{ fontFamily: T.sans, color: T.fg2, fontSize: 12 }}
          onClick={() => setPresentIds(new Set(roster.map((r) => r.enrollment_id)))}
        >
          Mark All Present
        </Button>
      </Box>

      <Divider sx={{ borderColor: T.outline, mb: 2 }} />

      {/* Student list */}
      {roster.length === 0 ? (
        <Typography sx={{ color: T.fg3, fontFamily: T.sans, fontSize: 14, textAlign: 'center', py: 4 }}>
          No students were enrolled when this session was created.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {roster.map((row) => {
            const enrollment = enrollmentById.get(row.enrollment_id);
            const isPresent = presentIds.has(row.enrollment_id);
            return (
              <Box
                key={row.enrollment_id}
                onClick={() => toggleStudent(row.enrollment_id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.25,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  bgcolor: isPresent
                    ? 'rgba(76,175,80,0.08)'
                    : 'rgba(207,102,121,0.06)',
                  border: `1px solid ${isPresent ? 'rgba(76,175,80,0.25)' : 'rgba(207,102,121,0.20)'}`,
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: isPresent
                      ? 'rgba(76,175,80,0.14)'
                      : 'rgba(207,102,121,0.12)',
                  },
                }}
              >
                <Typography sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg1 }}>
                  {enrollment?.student_name ?? `Enrollment #${row.enrollment_id}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {isPresent ? (
                    <CheckCircleOutlinedIcon sx={{ color: T.present, fontSize: 20 }} />
                  ) : (
                    <CancelOutlinedIcon sx={{ color: T.absent, fontSize: 20 }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: T.sans,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isPresent ? T.present : T.absent,
                      minWidth: 50,
                    }}
                  >
                    {isPresent ? 'PRESENT' : 'ABSENT'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Submit button */}
      <Button
        variant="contained"
        fullWidth
        disabled={submitting || roster.length === 0}
        onClick={handleSubmit}
        sx={{
          bgcolor: T.primary,
          color: '#000',
          fontFamily: T.sans,
          fontWeight: 700,
          fontSize: 14,
          borderRadius: '10px',
          py: 1.25,
          '&:hover': { bgcolor: '#9C65E0' },
        }}
      >
        {submitting ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Submit Attendance'}
      </Button>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  getBatches,
  getEnrollmentsByBatch,
  getBatchSessions,
  getSessionAttendance,
  createSession,
} from '../../services/ownerService';
import MarkAttendanceSheet from './MarkAttendanceSheet';

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
  cardShadow: '0 4px 24px rgba(0,0,0,0.5)',
};

const DAYS = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

function SessionRow({ session, enrollments }) {
  const [expanded, setExpanded] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleExpand() {
    if (!expanded && attendance === null) {
      setLoading(true);
      try {
        const rows = await getSessionAttendance(session.id);
        setAttendance(rows);
      } catch {
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    }
    setExpanded((v) => !v);
  }

  const presentCount = attendance ? attendance.filter((r) => r.status === 'PRESENT').length : null;
  const total = attendance ? attendance.length : null;

  return (
    <Box
      sx={{
        border: `1px solid ${T.outline}`,
        borderRadius: '12px',
        overflow: 'hidden',
        mb: 1.5,
      }}
    >
      <Box
        onClick={handleExpand}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: T.surface,
          '&:hover': { bgcolor: T.surfVar },
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.fg1 }}>
            {formatDate(session.date)}
          </Typography>
          <Typography sx={{ fontFamily: T.sans, fontSize: 12, color: T.fg2 }}>
            {formatTime(session.start_time)} – {formatTime(session.end_time)}
            {session.topic ? ` · ${session.topic}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {attendance !== null && (
            <Chip
              label={`${presentCount}/${total} present`}
              size="small"
              sx={{
                bgcolor: presentCount === total ? 'rgba(76,175,80,0.15)' : 'rgba(255,193,7,0.15)',
                color: presentCount === total ? T.present : '#FFC107',
                fontFamily: T.sans,
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
          {loading ? (
            <CircularProgress size={16} sx={{ color: T.fg2 }} />
          ) : expanded ? (
            <ExpandLessIcon sx={{ color: T.fg2, fontSize: 20 }} />
          ) : (
            <ExpandMoreIcon sx={{ color: T.fg2, fontSize: 20 }} />
          )}
        </Box>
      </Box>

      <Collapse in={expanded && !loading}>
        {attendance && (
          <Box sx={{ px: 2, pt: 0, pb: 2, bgcolor: T.bg }}>
            <Divider sx={{ borderColor: T.outline, mb: 2 }} />
            <MarkAttendanceSheet
              sessionId={session.id}
              enrollments={enrollments}
              initialAttendance={attendance}
              onSubmitted={(rows) => setAttendance(rows)}
            />
          </Box>
        )}
      </Collapse>
    </Box>
  );
}

// ─── AttendancePage ───────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Start session form state
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSessionStart, setNewSessionStart] = useState('16:00');
  const [newSessionEnd, setNewSessionEnd] = useState('17:00');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [creatingSess, setCreatingSess] = useState(false);
  const [createError, setCreateError] = useState('');

  // Load batches on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getBatches();
        setBatches(data);
        if (data.length > 0) setSelectedBatchId(data[0].id);
      } catch {
        /* silently fail — user sees empty state */
      } finally {
        setLoadingBatches(false);
      }
    })();
  }, []);

  // Load enrollments + sessions when batch changes
  const loadBatchData = useCallback(async (batchId) => {
    if (!batchId) return;
    setLoadingData(true);
    try {
      const [enrlData, sessData] = await Promise.all([
        getEnrollmentsByBatch(batchId),
        getBatchSessions(batchId),
      ]);
      // Active enrollments only for the mark sheet
      setEnrollments(enrlData.filter((e) => e.is_active));
      setSessions(sessData);
    } catch {
      setEnrollments([]);
      setSessions([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBatchId) loadBatchData(selectedBatchId);
  }, [selectedBatchId, loadBatchData]);

  async function handleCreateSession() {
    setCreateError('');
    if (!newSessionDate || !newSessionStart || !newSessionEnd) {
      setCreateError('Date, start time and end time are required.');
      return;
    }
    setCreatingSess(true);
    try {
      await createSession({
        batch_id: Number(selectedBatchId),
        date: newSessionDate,
        start_time: newSessionStart + ':00',
        end_time: newSessionEnd + ':00',
        topic: newSessionTopic || null,
      });
      setShowNewSession(false);
      setNewSessionTopic('');
      await loadBatchData(selectedBatchId);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setCreateError(detail || 'Failed to create session. It may already exist for this date.');
    } finally {
      setCreatingSess(false);
    }
  }

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: T.fg1 }}>
          Attendance
        </Typography>
        <Typography sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg2 }}>
          Start a session then mark each student present or absent.
        </Typography>
      </Box>

      {/* Batch selector */}
      {loadingBatches ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: T.primary }} />
        </Box>
      ) : batches.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: T.fg3,
            fontFamily: T.sans,
          }}
        >
          <Typography sx={{ fontSize: 16, color: T.fg2, mb: 1 }}>No batches found</Typography>
          <Typography sx={{ fontSize: 13, color: T.fg3 }}>
            Create a batch first, then come back to record attendance.
          </Typography>
        </Box>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: T.fg2, fontFamily: T.sans }}>Select Batch</InputLabel>
            <Select
              value={selectedBatchId}
              label="Select Batch"
              onChange={(e) => setSelectedBatchId(e.target.value)}
              sx={{
                fontFamily: T.sans,
                color: T.fg1,
                '.MuiOutlinedInput-notchedOutline': { borderColor: T.outline },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.primary },
                '& .MuiSvgIcon-root': { color: T.fg2 },
              }}
            >
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id} sx={{ fontFamily: T.sans }}>
                  {b.name.length > 14 ? `${b.name.slice(0, 12)}…` : b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: T.primary }} />
            </Box>
          ) : (
            <>
              {/* Start session button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => { setShowNewSession((v) => !v); setCreateError(''); }}
                  sx={{
                    bgcolor: T.primary,
                    color: '#000',
                    fontFamily: T.sans,
                    fontWeight: 700,
                    fontSize: 13,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: '#9C65E0' },
                  }}
                >
                  Start Session
                </Button>
              </Box>

              {/* New session form */}
              {showNewSession && (
                <Box
                  sx={{
                    bgcolor: T.surface,
                    border: `1px solid ${T.outline}`,
                    borderRadius: '12px',
                    p: 2.5,
                    mb: 3,
                  }}
                >
                  <Typography sx={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.fg1, mb: 2 }}>
                    New Session — {selectedBatch?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Date"
                      type="date"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: '1 1 160px', input: { color: T.fg1, fontFamily: T.sans } }}
                    />
                    <TextField
                      label="Start Time"
                      type="time"
                      value={newSessionStart}
                      onChange={(e) => setNewSessionStart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: '1 1 140px', input: { color: T.fg1, fontFamily: T.sans } }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={newSessionEnd}
                      onChange={(e) => setNewSessionEnd(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: '1 1 140px', input: { color: T.fg1, fontFamily: T.sans } }}
                    />
                    <TextField
                      label="Topic (optional)"
                      value={newSessionTopic}
                      onChange={(e) => setNewSessionTopic(e.target.value)}
                      sx={{ flex: '2 1 200px', input: { color: T.fg1, fontFamily: T.sans } }}
                    />
                  </Box>
                  {createError && (
                    <Typography sx={{ color: T.absent, fontSize: 12, fontFamily: T.sans, mt: 1.5 }}>
                      {createError}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                    <Button
                      variant="contained"
                      disabled={creatingSess}
                      onClick={handleCreateSession}
                      sx={{
                        bgcolor: T.primary,
                        color: '#000',
                        fontFamily: T.sans,
                        fontWeight: 700,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#9C65E0' },
                      }}
                    >
                      {creatingSess ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Create'}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setShowNewSession(false)}
                      sx={{ fontFamily: T.sans, color: T.fg2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Sessions list */}
              <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, mb: 1.5 }}>
                {sessions.length === 0
                  ? 'No sessions recorded yet. Start a session above.'
                  : `${sessions.length} session${sessions.length === 1 ? '' : 's'} — click to view or edit attendance`}
              </Typography>

              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  enrollments={enrollments}
                />
              ))}
            </>
          )}
        </>
      )}
    </Box>
  );
}

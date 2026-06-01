import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Skeleton,
  Alert,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getBatches, getEnrollmentsByBatch } from '../../services/ownerService';
import CreateBatchModal from './CreateBatchModal';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       '#121212',
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  primary:  '#BB86FC',
  secondary:'#03DAC6',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.10)',
  sans:     "'DM Sans', system-ui, sans-serif",
  error:    '#CF6679',
};

// Day labels
const DAY_LABELS = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu',
  FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${suffix}`;
}

function formatDays(days) {
  if (!days?.length) return '';
  return days.map((d) => DAY_LABELS[d] ?? d).join(' / ');
}

function statusColor(status) {
  if (status === 'ACTIVE') return '#43A047';
  if (status === 'CLOSING') return '#FB8C00';
  if (status === 'ARCHIVED') return '#78909C';
  return T.fg2;
}

// ─── BatchCard ────────────────────────────────────────────────────────────────

function BatchCard({ batch, onAddStudent }) {
  const [enrollments, setEnrollments] = useState(null);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadEnrollments() {
      try {
        const data = await getEnrollmentsByBatch(batch.id);
        if (!cancelled) {
          // Count only active enrollments
          setEnrollments(data.filter((e) => e.is_active));
        }
      } catch {
        if (!cancelled) setEnrollments([]);
      } finally {
        if (!cancelled) setLoadingEnrollments(false);
      }
    }
    loadEnrollments();
    return () => { cancelled = true; };
  }, [batch.id]);

  const enrolledCount = enrollments?.length ?? 0;
  const capacityPercent = Math.round((enrolledCount / batch.max_capacity) * 100);
  const isNearFull = capacityPercent >= 80;
  const isFull = enrolledCount >= batch.max_capacity;

  return (
    <Card
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${T.outline}`,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: T.primary + '55' },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography
              sx={{ fontFamily: T.sans, fontWeight: 700, fontSize: 16, color: T.fg1, lineHeight: 1.2 }}
            >
              {batch.name}
            </Typography>
            <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.primary, mt: 0.3 }}>
              {batch.subject}{batch.grade ? ` · Grade ${batch.grade}` : ''}
            </Typography>
          </Box>
          <Chip
            label={batch.status}
            size="small"
            sx={{
              bgcolor: statusColor(batch.status) + '22',
              color: statusColor(batch.status),
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 600,
              height: 22,
              border: `1px solid ${statusColor(batch.status)}44`,
            }}
          />
        </Box>

        {/* Timing */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: T.fg3 }} />
          <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
            {formatTime(batch.start_time)} – {formatTime(batch.end_time)}
          </Typography>
        </Box>

        {/* Days */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 14, color: T.fg3 }} />
          <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
            {formatDays(batch.days_of_week)}
          </Typography>
        </Box>

        {/* Capacity */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14, color: T.fg3 }} />
              <Typography sx={{ fontFamily: T.sans, fontSize: 12, color: T.fg2 }}>
                Capacity
              </Typography>
            </Box>
            {loadingEnrollments ? (
              <Skeleton width={40} height={16} sx={{ bgcolor: T.surfVar }} />
            ) : (
              <Typography
                sx={{
                  fontFamily: T.sans,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isFull ? T.error : isNearFull ? '#FB8C00' : T.fg2,
                }}
              >
                {enrolledCount} / {batch.max_capacity}
              </Typography>
            )}
          </Box>
          {!loadingEnrollments && (
            <LinearProgress
              variant="determinate"
              value={Math.min(capacityPercent, 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: T.surfVar,
                '& .MuiLinearProgress-bar': {
                  bgcolor: isFull ? T.error : isNearFull ? '#FB8C00' : T.secondary,
                  borderRadius: 2,
                },
              }}
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onAddStudent(batch)}
          disabled={isFull || batch.status === 'ARCHIVED'}
          sx={{
            fontFamily: T.sans,
            fontSize: 12,
            borderColor: T.primary + '55',
            color: T.primary,
            borderRadius: 2,
            '&:hover': { borderColor: T.primary, bgcolor: T.primary + '11' },
            '&.Mui-disabled': { color: T.fg3, borderColor: T.outline },
          }}
        >
          {isFull ? 'Batch Full' : 'Add Student'}
        </Button>
      </CardActions>
    </Card>
  );
}

// ─── LoadingGrid ──────────────────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <Grid container spacing={2.5}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card sx={{ bgcolor: T.surface, border: `1px solid ${T.outline}`, borderRadius: 3, p: 2.5 }}>
            <Skeleton height={22} width="60%" sx={{ bgcolor: T.surfVar, mb: 1 }} />
            <Skeleton height={16} width="40%" sx={{ bgcolor: T.surfVar, mb: 1.5 }} />
            <Skeleton height={14} width="70%" sx={{ bgcolor: T.surfVar, mb: 1 }} />
            <Skeleton height={14} width="50%" sx={{ bgcolor: T.surfVar, mb: 2 }} />
            <Skeleton height={8} width="100%" sx={{ bgcolor: T.surfVar, borderRadius: 1 }} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateBatch }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          bgcolor: T.primary + '11',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${T.primary}22`,
        }}
      >
        <CalendarTodayIcon sx={{ fontSize: 40, color: T.primary }} />
      </Box>
      <Typography sx={{ fontFamily: T.sans, fontSize: 18, fontWeight: 700, color: T.fg1 }}>
        No batches yet
      </Typography>
      <Typography sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg2, textAlign: 'center', maxWidth: 340 }}>
        Create your first batch to start managing students, collecting fees, and marking attendance.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateBatch}
        sx={{
          mt: 1,
          fontFamily: T.sans,
          fontWeight: 600,
          borderRadius: 2,
          bgcolor: T.primary,
          color: '#000',
          '&:hover': { bgcolor: '#a06adc' },
        }}
      >
        Create First Batch
      </Button>
    </Box>
  );
}

// ─── BatchesPage (main export) ────────────────────────────────────────────────

/**
 * BatchesPage — shows all batches for the owner's institute.
 *
 * Props:
 *   onAddStudent(batch) — called when owner clicks "Add Student" on a batch card;
 *                         the parent (OwnerDashboard) switches to the students section
 *                         with that batch pre-selected.
 */
export default function BatchesPage({ onAddStudent }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load batches.';
      setError(typeof detail === 'string' ? detail : 'Failed to load batches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  function handleBatchCreated(newBatch) {
    setBatches((prev) => [newBatch, ...prev]);
    setCreateModalOpen(false);
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: T.sans }}>
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: T.fg1, fontFamily: T.sans }}>
            Batches
          </Typography>
          <Typography sx={{ fontSize: 14, color: T.fg2, fontFamily: T.sans, mt: 0.25 }}>
            {loading ? 'Loading…' : `${batches.length} batch${batches.length !== 1 ? 'es' : ''}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton
              onClick={loadBatches}
              disabled={loading}
              sx={{ color: T.fg2, '&:hover': { color: T.fg1 } }}
              aria-label="refresh batches"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              fontFamily: T.sans,
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: T.primary,
              color: '#000',
              '&:hover': { bgcolor: '#a06adc' },
            }}
          >
            New Batch
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: T.sans, bgcolor: T.error + '22', color: T.error }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && <LoadingGrid />}

      {/* Empty state */}
      {!loading && !error && batches.length === 0 && (
        <EmptyState onCreateBatch={() => setCreateModalOpen(true)} />
      )}

      {/* Batch cards */}
      {!loading && batches.length > 0 && (
        <Grid container spacing={2.5}>
          {batches.map((batch) => (
            <Grid item xs={12} sm={6} md={4} key={batch.id}>
              <BatchCard batch={batch} onAddStudent={onAddStudent} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create batch modal */}
      <CreateBatchModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleBatchCreated}
      />
    </Box>
  );
}

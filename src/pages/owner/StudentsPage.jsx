import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Skeleton,
  Alert,
  Tooltip,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { getBatches, getEnrollmentsByBatch, removeEnrollment } from '../../services/ownerService';
import AddStudentModal from './AddStudentModal';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       '#121212',
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  surfVar2: '#363636',
  primary:  '#BB86FC',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.10)',
  sans:     "'DM Sans', system-ui, sans-serif",
  error:    '#CF6679',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function feeStatusColor(status) {
  if (status === 'FULLY_PAID') return '#43A047';
  if (status === 'PARTIALLY_PAID') return '#FB8C00';
  return T.error; // NOT_PAID
}

function feeStatusLabel(status) {
  if (status === 'FULLY_PAID') return 'Paid';
  if (status === 'PARTIALLY_PAID') return 'Partial';
  return 'Unpaid';
}

// ─── StudentsPage ─────────────────────────────────────────────────────────────

/**
 * StudentsPage — cross-batch student/enrollment list.
 *
 * - Lets the owner filter by batch (or view all batches).
 * - Supports search by student name.
 * - "Add Student" opens AddStudentModal.
 * - Shows active enrollments with batch name, due day, and fee status.
 *
 * Props:
 *   initialBatch  — optional BatchResponse to pre-select in the filter
 */
export default function StudentsPage({ initialBatch }) {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatch?.id ?? 'all');

  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState('');

  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Load batches on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingBatches(true);
      try {
        const data = await getBatches();
        if (!cancelled) setBatches(data);
      } finally {
        if (!cancelled) setLoadingBatches(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // When initialBatch prop changes (e.g. owner clicked "Add Student" from BatchesPage)
  useEffect(() => {
    if (initialBatch?.id) setSelectedBatchId(initialBatch.id);
  }, [initialBatch?.id]);

  // Load enrollments when the selected batch changes
  const loadEnrollments = useCallback(async (batchId) => {
    if (!batchId || batchId === 'all') {
      // Load all batches, collect all enrollments
      setLoadingEnrollments(true);
      setEnrollmentsError('');
      try {
        const all = await Promise.all(
          batches.map(async (b) => {
            const data = await getEnrollmentsByBatch(b.id);
            return data.map((e) => ({ ...e, _batchName: b.name, _batchId: b.id }));
          })
        );
        setEnrollments(all.flat().filter((e) => e.is_active));
      } catch (err) {
        setEnrollmentsError(err.response?.data?.detail ?? 'Failed to load students.');
      } finally {
        setLoadingEnrollments(false);
      }
      return;
    }

    setLoadingEnrollments(true);
    setEnrollmentsError('');
    try {
      const data = await getEnrollmentsByBatch(batchId);
      const batch = batches.find((b) => b.id === batchId);
      setEnrollments(
        data.filter((e) => e.is_active).map((e) => ({
          ...e,
          _batchName: batch?.name ?? '—',
          _batchId: batchId,
        }))
      );
    } catch (err) {
      setEnrollmentsError(err.response?.data?.detail ?? 'Failed to load students.');
    } finally {
      setLoadingEnrollments(false);
    }
  }, [batches]);

  useEffect(() => {
    if (!loadingBatches && batches.length > 0) {
      loadEnrollments(selectedBatchId);
    }
  }, [selectedBatchId, loadingBatches, loadEnrollments, batches.length]);

  async function handleRemoveEnrollment(enrollment) {
    if (!window.confirm(`Remove ${enrollment.student_name || 'this student'} from the batch?`)) return;
    setRemovingId(enrollment.id);
    try {
      await removeEnrollment(enrollment.id);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id));
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to remove student.');
    } finally {
      setRemovingId(null);
    }
  }

  function handleStudentAdded() {
    setAddModalOpen(false);
    loadEnrollments(selectedBatchId);
  }

  const filtered = enrollments.filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (e.student_name ?? '').toLowerCase().includes(term);
  });

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      fontFamily: T.sans,
      '& fieldset': { borderColor: T.outline },
      '&:hover fieldset': { borderColor: T.fg3 },
      '&.Mui-focused fieldset': { borderColor: T.primary },
    },
    '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
    '& .MuiInputLabel-root.Mui-focused': { color: T.primary },
    input: { color: T.fg1, fontFamily: T.sans },
  };

  const selectBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: T.sans }}>
      {/* Header */}
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
            Students
          </Typography>
          <Typography sx={{ fontSize: 14, color: T.fg2, fontFamily: T.sans, mt: 0.25 }}>
            {loadingEnrollments ? 'Loading…' : `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => loadEnrollments(selectedBatchId)}
              disabled={loadingEnrollments}
              sx={{ color: T.fg2, '&:hover': { color: T.fg1 } }}
              aria-label="refresh students"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            disabled={batches.length === 0}
            sx={{
              fontFamily: T.sans,
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: T.primary,
              color: '#000',
              '&:hover': { bgcolor: '#a06adc' },
            }}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Filters row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        {/* Batch filter */}
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              fontFamily: T.sans,
              color: T.fg1,
              '& fieldset': { borderColor: T.outline },
              '&:hover fieldset': { borderColor: T.fg3 },
              '&.Mui-focused fieldset': { borderColor: T.primary },
            },
            '& .MuiInputLabel-root': { fontFamily: T.sans, color: T.fg2 },
            '& .MuiInputLabel-root.Mui-focused': { color: T.primary },
            '& .MuiSelect-icon': { color: T.fg2 },
          }}
        >
          <InputLabel>Batch</InputLabel>
          <Select
            value={selectedBatchId}
            label="Batch"
            onChange={(e) => setSelectedBatchId(e.target.value)}
            disabled={loadingBatches}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: { bgcolor: T.surfVar, border: `1px solid ${T.outline}`, fontFamily: T.sans },
                },
              },
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: T.sans, color: T.fg1 }}>
              All Batches
            </MenuItem>
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id} sx={{ fontFamily: T.sans, color: T.fg1 }}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 180, ...inputSx }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: T.fg3, fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error */}
      {enrollmentsError && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, fontFamily: T.sans, bgcolor: T.error + '22', color: T.error }}
        >
          {enrollmentsError}
        </Alert>
      )}

      {/* Table */}
      <Paper
        sx={{
          bgcolor: T.surface,
          border: `1px solid ${T.outline}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table size="small" aria-label="students table">
            <TableHead>
              <TableRow sx={{ bgcolor: T.surfVar }}>
                {['Name', 'Batch', 'Due Day', 'First Month Fee', 'Status', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontFamily: T.sans,
                      fontWeight: 600,
                      fontSize: 12,
                      color: T.fg2,
                      borderColor: T.outline,
                      py: 1.25,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingEnrollments &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} sx={{ borderColor: T.outline }}>
                        <Skeleton height={18} sx={{ bgcolor: T.surfVar }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loadingEnrollments && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      color: T.fg3,
                      fontFamily: T.sans,
                      fontSize: 14,
                      borderColor: T.outline,
                    }}
                  >
                    {search ? 'No students match your search.' : 'No students enrolled yet.'}
                  </TableCell>
                </TableRow>
              )}

              {!loadingEnrollments &&
                filtered.map((enrollment) => (
                  <TableRow
                    key={enrollment.id}
                    sx={{
                      '&:last-child td': { border: 0 },
                      '&:hover': { bgcolor: T.surfVar + '88' },
                    }}
                  >
                    <TableCell
                      sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg1, borderColor: T.outline }}
                    >
                      {enrollment.student_name ?? `Student #${enrollment.student_id}`}
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: T.sans, fontSize: 13, color: T.primary, borderColor: T.outline }}
                    >
                      {enrollment._batchName}
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2, borderColor: T.outline }}
                    >
                      {enrollment.due_day}
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2, borderColor: T.outline }}
                    >
                      {enrollment.first_month_amount != null
                        ? `₹${Number(enrollment.first_month_amount).toLocaleString('en-IN')}`
                        : '—'}
                    </TableCell>
                    <TableCell sx={{ borderColor: T.outline }}>
                      <Chip
                        label={feeStatusLabel(enrollment.fee_status ?? 'NOT_PAID')}
                        size="small"
                        sx={{
                          fontFamily: T.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          height: 22,
                          bgcolor: feeStatusColor(enrollment.fee_status ?? 'NOT_PAID') + '22',
                          color: feeStatusColor(enrollment.fee_status ?? 'NOT_PAID'),
                          border: `1px solid ${feeStatusColor(enrollment.fee_status ?? 'NOT_PAID')}44`,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: T.outline }}>
                      <Tooltip title="Remove from batch">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveEnrollment(enrollment)}
                          disabled={removingId === enrollment.id}
                          sx={{ color: T.fg3, '&:hover': { color: T.error } }}
                          aria-label={`remove student ${enrollment.id} from batch`}
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add student modal */}
      <AddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={handleStudentAdded}
        batches={batches}
        defaultBatch={selectBatch}
      />
    </Box>
  );
}

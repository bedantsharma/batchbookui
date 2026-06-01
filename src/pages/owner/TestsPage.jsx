import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import { getBatches, getEnrollmentsByBatch, getStudentScores, createTestScore } from '../../services/ownerService';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#121212',
  surface: '#1E1E1E',
  surfVar: '#2C2C2C',
  primary: '#BB86FC',
  fg1: '#FFFFFF',
  fg2: '#B0B0B0',
  fg3: 'rgba(255,255,255,0.35)',
  outline: 'rgba(255,255,255,0.10)',
  sans: "'DM Sans', system-ui, sans-serif",
  error: '#CF6679',
  success: '#03DAC6',
};

const today = new Date().toISOString().slice(0, 10);

// ─── Add Score Modal ──────────────────────────────────────────────────────────
function AddScoreModal({ open, onClose, onSaved, enrollmentId }) {
  const [form, setForm] = useState({
    test_name: '',
    subject: '',
    date: today,
    max_marks: '',
    obtained_marks: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit() {
    if (!form.test_name || !form.subject || !form.date || !form.max_marks || form.obtained_marks === '') {
      setError('All fields are required.');
      return;
    }
    const max = Number(form.max_marks);
    const obtained = Number(form.obtained_marks);
    if (max <= 0 || obtained < 0 || obtained > max) {
      setError('Marks are invalid. Obtained marks must be between 0 and max marks.');
      return;
    }

    setSaving(true);
    try {
      const saved = await createTestScore({
        enrollment_id: enrollmentId,
        test_name: form.test_name.trim(),
        subject: form.subject.trim(),
        date: form.date,
        max_marks: max,
        obtained_marks: obtained,
      });
      onSaved(saved);
      setForm({ test_name: '', subject: '', date: today, max_marks: '', obtained_marks: '' });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Failed to save score. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: T.surface, borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontFamily: T.sans, color: T.fg1, fontWeight: 700 }}>
        Add Test Score
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Test Name"
          value={form.test_name}
          onChange={(e) => handleChange('test_name', e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. Unit Test 1, Mid-Term"
        />
        <TextField
          label="Subject"
          value={form.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. Maths, Science"
        />
        <TextField
          label="Test Date"
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Max Marks"
            type="number"
            value={form.max_marks}
            onChange={(e) => handleChange('max_marks', e.target.value)}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Obtained Marks"
            type="number"
            value={form.obtained_marks}
            onChange={(e) => handleChange('obtained_marks', e.target.value)}
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: T.fg2 }} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          sx={{ bgcolor: T.primary, color: '#000', fontWeight: 700, borderRadius: 2, px: 3 }}
        >
          {saving ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Score Table ──────────────────────────────────────────────────────────────
function ScoreTable({ scores, needsAttention }) {
  if (!scores || scores.length === 0) {
    return (
      <Typography sx={{ color: T.fg3, fontFamily: T.sans, fontSize: 14, mt: 2 }}>
        No test scores recorded yet.
      </Typography>
    );
  }

  return (
    <>
      {needsAttention && (
        <Alert
          icon={<WarningAmberIcon />}
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Needs attention — average of last 3 tests is below 60%.
        </Alert>
      )}
      <TableContainer component={Paper} sx={{ bgcolor: T.surfVar, borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Test', 'Subject', 'Date', 'Marks', 'Percentage'].map((h) => (
                <TableCell key={h} sx={{ color: T.fg2, fontFamily: T.sans, fontWeight: 600, borderColor: T.outline }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {scores.map((s) => (
              <TableRow key={s.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ color: T.fg1, fontFamily: T.sans, borderColor: T.outline }}>
                  {s.test_name}
                </TableCell>
                <TableCell sx={{ color: T.fg2, fontFamily: T.sans, borderColor: T.outline }}>
                  {s.subject}
                </TableCell>
                <TableCell sx={{ color: T.fg2, fontFamily: T.sans, borderColor: T.outline }}>
                  {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell sx={{ color: T.fg1, fontFamily: T.sans, borderColor: T.outline }}>
                  {s.obtained_marks} / {s.max_marks}
                </TableCell>
                <TableCell sx={{ borderColor: T.outline }}>
                  <Chip
                    label={`${s.percentage}%`}
                    size="small"
                    sx={{
                      bgcolor: s.percentage >= 60 ? 'rgba(3,218,198,0.15)' : 'rgba(207,102,121,0.15)',
                      color: s.percentage >= 60 ? T.success : T.error,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// ─── TestsPage ────────────────────────────────────────────────────────────────
export default function TestsPage() {
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    getBatches()
      .then(setBatches)
      .catch(() => setBatches([]))
      .finally(() => setLoadingBatches(false));
  }, []);

  async function handleBatchChange(batchId) {
    setSelectedBatch(batchId);
    setSelectedEnrollment('');
    setStudentData(null);
    if (!batchId) {
      setEnrollments([]);
      return;
    }
    setLoadingEnrollments(true);
    try {
      const data = await getEnrollmentsByBatch(batchId);
      setEnrollments(data.filter((e) => e.is_active));
    } catch {
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }

  async function handleEnrollmentChange(enrollmentId) {
    setSelectedEnrollment(enrollmentId);
    setStudentData(null);
    if (!enrollmentId) return;
    setLoadingScores(true);
    try {
      const data = await getStudentScores(enrollmentId);
      setStudentData(data);
    } catch {
      setStudentData({ enrollment_id: enrollmentId, scores: [], needs_attention: false });
    } finally {
      setLoadingScores(false);
    }
  }

  function handleScoreSaved(newScore) {
    setStudentData((prev) => {
      if (!prev) return prev;
      const updated = [newScore, ...prev.scores];
      const needsAttention =
        updated.length >= 3
          ? (updated.slice(0, 3).reduce((sum, s) => sum + s.obtained_marks / s.max_marks, 0) / 3) < 0.6
          : false;
      return { ...prev, scores: updated, needs_attention: needsAttention };
    });
    setToast({ open: true, message: 'Score saved successfully.' });
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: T.sans, color: T.fg1 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Test Scores</Typography>
      <Typography sx={{ fontSize: 14, color: T.fg2, mb: 3 }}>
        Record and track student test performance. Students flagged in red need attention.
      </Typography>

      <Divider sx={{ borderColor: T.outline, mb: 3 }} />

      {/* Selectors */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: T.fg2 }}>Batch</InputLabel>
          <Select
            value={selectedBatch}
            label="Batch"
            onChange={(e) => handleBatchChange(e.target.value)}
            disabled={loadingBatches}
            sx={{ color: T.fg1, bgcolor: T.surfVar }}
          >
            <MenuItem value="">— Select batch —</MenuItem>
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name} ({b.subject})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedBatch && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: T.fg2 }}>Student</InputLabel>
            <Select
              value={selectedEnrollment}
              label="Student"
              onChange={(e) => handleEnrollmentChange(e.target.value)}
              disabled={loadingEnrollments}
              sx={{ color: T.fg1, bgcolor: T.surfVar }}
            >
              <MenuItem value="">— Select student —</MenuItem>
              {enrollments.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  Student #{e.student_id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedEnrollment && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setModalOpen(true)}
            sx={{
              bgcolor: T.primary,
              color: '#000',
              fontWeight: 700,
              borderRadius: 2,
              alignSelf: 'center',
            }}
          >
            Add Score
          </Button>
        )}
      </Box>

      {/* Scores area */}
      {loadingScores ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress sx={{ color: T.primary }} />
        </Box>
      ) : selectedEnrollment && studentData ? (
        <ScoreTable scores={studentData.scores} needsAttention={studentData.needs_attention} />
      ) : !selectedBatch ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: T.fg3 }}>
          <Typography sx={{ fontSize: 16 }}>Select a batch to get started.</Typography>
        </Box>
      ) : !selectedEnrollment ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: T.fg3 }}>
          <Typography sx={{ fontSize: 16 }}>Select a student to view their scores.</Typography>
        </Box>
      ) : null}

      {/* Add Score Modal */}
      <AddScoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleScoreSaved}
        enrollmentId={selectedEnrollment}
      />

      {/* Success toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

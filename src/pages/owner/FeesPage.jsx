import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PercentIcon from '@mui/icons-material/Percent';

import {
  getBatches,
  getFeeDashboard,
  getBatchFees,
  getFeeStructure,
  generateMonthlyRecords,
} from '../../services/ownerService';
import FeeSetupModal from './FeeSetupModal';
import MarkPaymentModal from './MarkPaymentModal';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       '#121212',
  surface:  '#1E1E1E',
  surfVar:  '#2C2C2C',
  surfVar2: '#363636',
  primary:  '#BB86FC',
  secondary:'#03DAC6',
  fg1:      '#FFFFFF',
  fg2:      '#B0B0B0',
  fg3:      'rgba(255,255,255,0.35)',
  outline:  'rgba(255,255,255,0.10)',
  sans:     "'DM Sans', system-ui, sans-serif",
  error:    '#CF6679',
  paid:     '#43A047',
  partial:  '#FB8C00',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonthStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function fmtAmount(val) {
  return `₹${Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function fmtCollectionRate(rate) {
  return `${Number(rate).toFixed(1)}%`;
}

function statusChipProps(status) {
  if (status === 'FULLY_PAID') return { label: 'Paid', sx: { bgcolor: 'rgba(67,160,71,0.15)', color: T.paid } };
  if (status === 'PARTIALLY_PAID') return { label: 'Partial', sx: { bgcolor: 'rgba(251,140,0,0.15)', color: T.partial } };
  return { label: 'Unpaid', sx: { bgcolor: 'rgba(207,102,121,0.15)', color: T.error } };
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, loading, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 140,
        bgcolor: T.surface,
        border: `1px solid ${T.outline}`,
        borderRadius: '16px',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: `${color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
          <Typography sx={{ fontFamily: T.sans, fontSize: 12, color: T.fg2 }}>{label}</Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width={80} height={32} sx={{ bgcolor: T.surfVar }} />
        ) : (
          <Typography sx={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: T.fg1 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── BatchFeeTable ────────────────────────────────────────────────────────────

function BatchFeeTable({ batch, month, onStructureChanged }) {
  const [structure, setStructure] = useState(null);
  const [structureLoading, setStructureLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [setupOpen, setSetupOpen] = useState(false);
  const [payRecord, setPayRecord] = useState(null);

  const loadStructure = useCallback(async () => {
    setStructureLoading(true);
    try {
      const s = await getFeeStructure(batch.id);
      setStructure(s);
    } catch (err) {
      if (err?.response?.status === 404) {
        setStructure(null);
      } else {
        setError('Failed to load fee structure.');
      }
    } finally {
      setStructureLoading(false);
    }
  }, [batch.id]);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    setError('');
    try {
      const data = await getBatchFees(batch.id, month);
      setRecords(data);
    } catch (err) {
      if (err?.response?.status === 404) {
        setRecords([]);
      } else {
        setError('Failed to load fee records.');
      }
    } finally {
      setRecordsLoading(false);
    }
  }, [batch.id, month]);

  useEffect(() => {
    loadStructure();
  }, [loadStructure]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await generateMonthlyRecords(batch.id, month);
      await loadRecords();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to generate fee records.');
    } finally {
      setGenerating(false);
    }
  }

  function handleSetupSuccess(newStructure) {
    setStructure(newStructure);
    loadRecords();
    onStructureChanged?.();
  }

  function handlePaymentSuccess(updatedRecord) {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r))
    );
    onStructureChanged?.();
  }

  if (structureLoading) {
    return (
      <Box sx={{ pt: 2 }}>
        <Skeleton variant="rounded" height={48} sx={{ bgcolor: T.surfVar, borderRadius: '12px' }} />
      </Box>
    );
  }

  // No fee structure yet
  if (!structure) {
    return (
      <Box
        sx={{
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontFamily: T.sans, fontSize: 14, color: T.fg2 }}>
          No monthly fee set for <strong style={{ color: T.fg1 }}>{batch.name}</strong>.
        </Typography>
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={() => setSetupOpen(true)}
          sx={{
            fontFamily: T.sans,
            textTransform: 'none',
            borderRadius: '10px',
            bgcolor: T.primary,
            color: '#000',
            fontWeight: 600,
            '&:hover': { bgcolor: '#9c5fdc' },
          }}
        >
          Set Monthly Fee
        </Button>

        <FeeSetupModal
          open={setupOpen}
          onClose={() => setSetupOpen(false)}
          batch={batch}
          month={month}
          onSuccess={handleSetupSuccess}
          existing={null}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Fee structure bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`Monthly Fee: ${fmtAmount(structure.monthly_amount)}`}
            size="small"
            sx={{ fontFamily: T.sans, fontSize: 12, bgcolor: T.surfVar, color: T.fg1 }}
          />
          <Tooltip title="Update fee">
            <IconButton size="small" sx={{ color: T.fg2 }} onClick={() => setSetupOpen(true)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {records.length === 0 && !recordsLoading && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlaylistAddIcon />}
            onClick={handleGenerate}
            disabled={generating}
            sx={{
              fontFamily: T.sans,
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: T.outline,
              color: T.secondary,
              '&:hover': { borderColor: T.secondary, bgcolor: 'rgba(3,218,198,0.05)' },
            }}
          >
            {generating ? 'Generating…' : 'Generate Records'}
          </Button>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '12px', bgcolor: 'rgba(207,102,121,0.10)', color: T.error }}
        >
          {error}
        </Alert>
      )}

      {generating && <LinearProgress sx={{ mb: 1, borderRadius: 2 }} />}

      {recordsLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ bgcolor: T.surfVar, mb: 1, borderRadius: '10px' }} />
        ))
      ) : records.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg2 }}>
            No fee records for this month.
          </Typography>
        </Box>
      ) : (
        <TableContainer
          sx={{
            borderRadius: '12px',
            border: `1px solid ${T.outline}`,
            bgcolor: T.surface,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Student', 'Amount Due', 'Amount Paid', 'Status', 'Action'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontFamily: T.sans,
                      fontSize: 11,
                      fontWeight: 600,
                      color: T.fg3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom: `1px solid ${T.outline}`,
                      py: 1.25,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((rec) => {
                const chip = statusChipProps(rec.status);
                return (
                  <TableRow
                    key={rec.id}
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { bgcolor: T.surfVar },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: T.sans,
                        fontSize: 13,
                        color: T.fg1,
                        borderBottom: `1px solid ${T.outline}`,
                        py: 1.25,
                      }}
                    >
                      {rec.student_name ?? `Enrollment #${rec.enrollment_id}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: T.sans,
                        fontSize: 13,
                        color: T.fg1,
                        borderBottom: `1px solid ${T.outline}`,
                        py: 1.25,
                      }}
                    >
                      {fmtAmount(rec.amount_due)}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: T.sans,
                        fontSize: 13,
                        color: rec.amount_paid > 0 ? T.paid : T.fg2,
                        borderBottom: `1px solid ${T.outline}`,
                        py: 1.25,
                      }}
                    >
                      {fmtAmount(rec.amount_paid)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${T.outline}`, py: 1.25 }}>
                      <Chip size="small" label={chip.label} sx={{ ...chip.sx, fontFamily: T.sans, fontSize: 11 }} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${T.outline}`, py: 1.25 }}>
                      {rec.status !== 'FULLY_PAID' && (
                        <Tooltip title="Record payment">
                          <IconButton
                            size="small"
                            sx={{ color: T.secondary }}
                            onClick={() => setPayRecord(rec)}
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FeeSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        batch={batch}
        month={month}
        onSuccess={handleSetupSuccess}
        existing={structure}
      />

      <MarkPaymentModal
        open={!!payRecord}
        onClose={() => setPayRecord(null)}
        record={payRecord}
        onSuccess={handlePaymentSuccess}
      />
    </Box>
  );
}

// ─── FeesPage ─────────────────────────────────────────────────────────────────

/**
 * FeesPage — institute-wide fee management.
 *
 * - Month selector at the top (defaults to current month)
 * - Four summary cards: Total Due, Collected, Pending, Collection %
 * - Tabs for each batch — each shows that batch's fee records
 * - FeeSetupModal for setting/updating fee structures
 * - MarkPaymentModal for recording cash/UPI payments
 */
export default function FeesPage() {
  const [month, setMonth] = useState(currentMonthStr());
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  const [batchError, setBatchError] = useState('');

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    setBatchError('');
    try {
      const data = await getBatches();
      setBatches(data.filter((b) => b.status !== 'ARCHIVED'));
    } catch {
      setBatchError('Failed to load batches.');
    } finally {
      setBatchesLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError('');
    try {
      const data = await getFeeDashboard(month);
      setDashboard(data);
    } catch (err) {
      if (err?.response?.status === 404) {
        setDashboard({ total_due: 0, total_collected: 0, total_pending: 0, collection_rate: 0, records: [] });
      } else {
        setDashError('Failed to load fee summary.');
      }
    } finally {
      setDashLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Reset to first tab when month changes so the tab stays valid
  useEffect(() => {
    setActiveTab(0);
  }, [month]);

  function handleTabChange(_, newValue) {
    setActiveTab(newValue);
  }

  const activeBatch = batches[activeTab] ?? null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: T.sans }}>
      {/* ── Header ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography sx={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: T.fg1 }}>
          Fee Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              background: T.surface,
              border: `1px solid ${T.outline}`,
              borderRadius: '10px',
              color: T.fg1,
              fontFamily: T.sans,
              fontSize: 13,
              padding: '6px 12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={() => { loadBatches(); loadDashboard(); }}
              sx={{ color: T.fg2 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Summary cards ──────────────────────────── */}
      {dashError ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{dashError}</Alert>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <SummaryCard
            icon={<TrendingUpIcon fontSize="small" />}
            label="Total Due"
            value={dashboard ? fmtAmount(dashboard.total_due) : '—'}
            loading={dashLoading}
            color={T.primary}
          />
          <SummaryCard
            icon={<AttachMoneyIcon fontSize="small" />}
            label="Collected"
            value={dashboard ? fmtAmount(dashboard.total_collected) : '—'}
            loading={dashLoading}
            color={T.paid}
          />
          <SummaryCard
            icon={<HourglassEmptyIcon fontSize="small" />}
            label="Pending"
            value={dashboard ? fmtAmount(dashboard.total_pending) : '—'}
            loading={dashLoading}
            color={T.partial}
          />
          <SummaryCard
            icon={<PercentIcon fontSize="small" />}
            label="Collection Rate"
            value={dashboard ? fmtCollectionRate(dashboard.collection_rate) : '—'}
            loading={dashLoading}
            color={T.secondary}
          />
        </Box>
      )}

      {/* ── Batch tabs ─────────────────────────────── */}
      {batchError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{batchError}</Alert>
      )}

      {batchesLoading ? (
        <Skeleton variant="rounded" height={44} sx={{ bgcolor: T.surfVar, borderRadius: '12px' }} />
      ) : batches.length === 0 ? (
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontFamily: T.sans, fontSize: 16, color: T.fg2 }}>
            No active batches found.
          </Typography>
          <Typography sx={{ fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>
            Create a batch first, then set up fees here.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': { bgcolor: T.primary },
              '& .MuiTab-root': {
                fontFamily: T.sans,
                textTransform: 'none',
                fontSize: 13,
                color: T.fg2,
                minHeight: 40,
                '&.Mui-selected': { color: T.primary, fontWeight: 600 },
              },
              borderBottom: `1px solid ${T.outline}`,
            }}
          >
            {batches.map((b) => (
              <Tab key={b.id} label={b.name} />
            ))}
          </Tabs>

          {activeBatch && (
            <BatchFeeTable
              key={`${activeBatch.id}-${month}`}
              batch={activeBatch}
              month={month}
              onStructureChanged={loadDashboard}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

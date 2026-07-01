import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import { getOwnerStats } from '../../services/ownerService';
import AttendancePage from './AttendancePage';
import BatchesPage from './BatchesPage';
import FeesPage from './FeesPage';
import StudentsPage from './StudentsPage';
import SettingsPage from './SettingsPage';
import TestsPage from './TestsPage';

// ─── Design tokens (matches existing Dashboard palette) ───────────────────────
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
  cardShadow: '0 4px 24px rgba(0,0,0,0.5)',
};

const SIDEBAR_WIDTH = 240;

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'students',
    label: 'Students',
    icon: <PeopleIcon />,
    description: 'Manage enrolled students',
  },
  {
    id: 'batches',
    label: 'Batches',
    icon: <ClassIcon />,
    description: 'Manage class batches',
  },
  {
    id: 'fees',
    label: 'Fees',
    icon: <CurrencyRupeeIcon />,
    description: 'Track fee collection',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <EventNoteIcon />,
    description: 'Mark class attendance',
  },
  {
    id: 'tests',
    label: 'Tests',
    icon: <SchoolIcon />,
    description: 'Track student test scores',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    description: 'Payouts and account settings',
  },
];

// ─── LogoMark (same as student Dashboard) ────────────────────────────────────
function LogoMark({ size = 26 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (46 / 48)}
      viewBox="0 0 48 46"
      fill="none"
    >
      <path
        fill="#863bff"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
    </svg>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({ activeSection, onSectionChange, onLogout }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: T.surface,
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 2.5,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <LogoMark size={28} />
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: T.fg1,
              fontFamily: T.sans,
              lineHeight: 1,
            }}
          >
            BatchBook
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: T.primary, fontFamily: T.sans, mt: 0.3 }}
          >
            Owner Dashboard
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: T.outline }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, pb: 1 }}>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const active = activeSection === id;
          return (
            <ListItem key={id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onSectionChange(id)}
                sx={{
                  mx: 1,
                  borderRadius: '10px',
                  py: 1,
                  bgcolor: active ? 'rgba(187,134,252,0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? 'rgba(187,134,252,0.18)'
                      : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? T.primary : T.fg2,
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: T.sans,
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        color: active ? T.fg1 : T.fg2,
                      }}
                    >
                      {label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: T.outline }} />

      {/* Sign out */}
      <List sx={{ pt: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              mx: 1,
              borderRadius: '10px',
              py: 1,
              '&:hover': { bgcolor: 'rgba(207,102,121,0.10)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#CF6679' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  component="span"
                  sx={{ fontFamily: T.sans, fontSize: 14, color: '#CF6679' }}
                >
                  Sign Out
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

// ─── Placeholder for sections not yet implemented ─────────────────────────────
function ComingSoonPlaceholder({ section }) {
  const sectionMeta = NAV_ITEMS.find((n) => n.id === section);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        color: T.fg3,
        fontFamily: T.sans,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '20px',
          bgcolor: 'rgba(187,134,252,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.primary,
          fontSize: 36,
        }}
      >
        {sectionMeta?.icon}
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: T.fg1, fontFamily: T.sans }}>
        {sectionMeta?.label ?? 'Dashboard'}
      </Typography>
      <Typography sx={{ fontSize: 14, color: T.fg2, fontFamily: T.sans }}>
        {sectionMeta?.description} — coming soon
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: T.fg3,
          fontFamily: T.sans,
          mt: 1,
          bgcolor: T.surfVar,
          px: 2,
          py: 0.75,
          borderRadius: 2,
        }}
      >
        This section is under construction
      </Typography>
    </Box>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatPill({ label, value, loading }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.6,
        borderRadius: '20px',
        bgcolor: 'rgba(187,134,252,0.10)',
        border: `1px solid rgba(187,134,252,0.20)`,
      }}
    >
      <Typography
        sx={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: T.sans }}
      >
        {loading ? '…' : value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: T.fg2, fontFamily: T.sans }}>
        {label}
      </Typography>
    </Box>
  );
}

function StatsBar({ stats, loading }) {
  const fmt = new Intl.NumberFormat('en-IN');
  return (
    <Box
      data-testid="stats-bar"
      sx={{
        px: 2.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        bgcolor: T.surface,
        borderBottom: `1px solid ${T.outline}`,
      }}
    >
      <StatPill
        label="students enrolled"
        value={fmt.format(stats.enrolled_students)}
        loading={loading}
      />
      <StatPill
        label="collected this month"
        value={`₹${fmt.format(Number(stats.fees_collected_this_month))}`}
        loading={loading}
      />
      <StatPill
        label="avg attendance"
        value={`${stats.avg_attendance_this_month}%`}
        loading={loading}
      />
    </Box>
  );
}

// ─── Main content area ────────────────────────────────────────────────────────
function MainContent({ section, onSectionChange, addStudentBatch }) {
  if (section === 'batches') {
    return (
      <BatchesPage
        onAddStudent={(batch) => {
          // Switch to students section with the batch pre-selected
          onSectionChange('students', batch);
        }}
      />
    );
  }

  if (section === 'students') {
    return <StudentsPage initialBatch={addStudentBatch} />;
  }

  if (section === 'fees') {
    return <FeesPage onNavigateToSettings={() => onSectionChange('settings')} />;
  }

  if (section === 'attendance') {
    return <AttendancePage />;
  }

  if (section === 'tests') {
    return <TestsPage />;
  }

  if (section === 'settings') {
    return <SettingsPage />;
  }

  return <ComingSoonPlaceholder section={section} />;
}

// ─── OwnerDashboard (root) ────────────────────────────────────────────────────
/**
 * OwnerDashboard — the shell for all owner-facing pages.
 *
 * Layout:
 *   - Left sidebar (240px, permanent on md+, drawer on mobile)
 *   - Main content area with section placeholder
 *
 * Navigation state is local — each nav item will later be replaced with a
 * proper sub-route or page component.
 */
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeSection, setActiveSection] = useState('batches');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addStudentBatch, setAddStudentBatch] = useState(null);
  const [stats, setStats] = useState({
    enrolled_students: 0,
    fees_collected_this_month: '0',
    avg_attendance_this_month: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getOwnerStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/phone-login');
  }

  /**
   * Switch the active section. Optionally pass a batch to pre-select in the
   * students section (used when owner clicks "Add Student" on a batch card).
   */
  function handleSectionChange(id, batch = null) {
    setActiveSection(id);
    if (id === 'students' && batch) {
      setAddStudentBatch(batch);
    } else {
      setAddStudentBatch(null);
    }
    if (isMobile) setMobileOpen(false);
  }

  const sidebarProps = {
    activeSection,
    onSectionChange: handleSectionChange,
    onLogout: handleLogout,
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: T.bg }}>
      {/* ── Sidebar — permanent on desktop ───────────────────── */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: `1px solid ${T.outline}`,
            },
          }}
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      {/* ── Sidebar — temporary drawer on mobile ──────────────── */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      {/* ── Main area ─────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: T.surface,
              borderBottom: `1px solid ${T.outline}`,
            }}
          >
            <Tooltip title="Open menu">
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ color: T.fg1 }}
                aria-label="open navigation menu"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <LogoMark size={22} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: T.fg1,
                fontFamily: T.sans,
              }}
            >
              BatchBook
            </Typography>
          </Box>
        )}

        <StatsBar stats={stats} loading={statsLoading} />

        <MainContent
          section={activeSection}
          onSectionChange={handleSectionChange}
          addStudentBatch={addStudentBatch}
        />
      </Box>
    </Box>
  );
}

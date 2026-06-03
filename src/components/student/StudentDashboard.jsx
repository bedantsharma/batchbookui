// batchbookui/src/components/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import C, { fonts } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';
import {
  getStudentProfile,
  getAttendance,
  getTodaySchedule,
  getUpcomingEvents,
} from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home',     label: 'Overview', icon: I.home },
  { id: 'batches',  label: 'Batches',  icon: I.batch },
  { id: 'schedule', label: 'Schedule', icon: I.cal },
  { id: 'fees',     label: 'Fees',     icon: I.rupee },
];

function StudentSidebar({ name, onLogout }) {
  return (
    <div style={{ width: 232, background: C.surface, borderRight: `1px solid ${C.outline}`, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 22px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#1a1a1a' }}>B</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: C.text, fontFamily: fonts.sans }}>BatchBook</div>
          <div style={{ fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: fonts.sans }}>Student</div>
        </div>
      </div>
      {NAV_ITEMS.map(it => {
        const Ico = it.icon;
        const on = it.id === 'home';
        return (
          <button key={it.id} style={{ background: on ? C.primary15 : 'transparent', border: 'none', borderRadius: 10, cursor: on ? 'default' : 'not-allowed', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, color: on ? C.primary : C.text2, fontFamily: fonts.sans, fontSize: 13, fontWeight: on ? 600 : 500, opacity: on ? 1 : 0.5 }}>
            <Ico size={18}/><span>{it.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, color: '#CF6679', fontFamily: fonts.sans, fontSize: 13, borderRadius: 10 }}>
        Sign Out
      </button>
    </div>
  );
}

function StudentBottomNav() {
  return (
    <div style={{ flexShrink: 0, background: C.surface, borderTop: `1px solid ${C.outline}`, padding: '8px 4px 22px', display: 'flex', justifyContent: 'space-around' }}>
      {NAV_ITEMS.map(it => {
        const Ico = it.icon;
        const on = it.id === 'home';
        return (
          <button key={it.id} style={{ background: 'none', border: 'none', cursor: on ? 'default' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 14px', color: on ? C.secondary : C.text2, fontFamily: fonts.sans, opacity: on ? 1 : 0.5 }}>
            <Ico size={22}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function OverviewContent({ profile, attendance, schedule, upcomingEvents, loading, error }) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ color: C.text2, fontFamily: fonts.sans, fontSize: 14 }}>Loading your dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ textAlign: 'center', color: C.text2, fontFamily: fonts.sans, padding: 32 }}>
          <div style={{ fontSize: 16, color: '#CF6679', marginBottom: 8 }}>Could not load dashboard</div>
          <div style={{ fontSize: 13 }}>{error}</div>
        </div>
      </div>
    );
  }

  const attendancePct = attendance?.total > 0
    ? Math.round((attendance.present / attendance.total) * 100)
    : 0;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>
          Hello, {profile?.name ?? 'Student'} 👋
        </div>
        <div style={{ fontSize: 13, color: C.text2, marginTop: 4, fontFamily: fonts.sans }}>
          {attendance?.month ?? ''}
        </div>
      </div>

      <div style={{ background: C.surface, borderRadius: 16, padding: '20px 24px', border: `1px solid ${C.outline}` }}>
        <div style={{ fontSize: 12, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: fonts.sans, marginBottom: 8 }}>
          Attendance this month
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: attendancePct >= 75 ? C.secondary : '#CF6679', fontFamily: fonts.sans }}>
          {attendancePct}%
        </div>
        <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans, marginTop: 4 }}>
          {attendance?.present ?? 0} present out of {attendance?.total ?? 0} sessions
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>
          Today's classes
        </div>
        {(schedule ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No classes scheduled today.</div>
        ) : (
          (schedule ?? []).map(s => (
            <div key={s.id} style={{ background: C.surface, borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: `1px solid ${C.outline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{s.subject}</div>
                <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>{s.batchName}{s.topic ? ` · ${s.topic}` : ''}</div>
              </div>
              <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>{s.time}</div>
            </div>
          ))
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>
          Upcoming
        </div>
        {(upcomingEvents ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No upcoming classes found.</div>
        ) : (
          (upcomingEvents ?? []).slice(0, 5).map(e => (
            <div key={e.id} style={{ background: C.surface, borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: `1px solid ${C.outline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{e.label}</div>
                <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>{e.sub}{e.topic ? ` · ${e.topic}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: C.primary, fontFamily: fonts.sans, fontWeight: 600 }}>{e.day}</div>
                <div style={{ fontSize: 11, color: C.text2, fontFamily: fonts.sans }}>{e.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getStudentProfile(),
      getAttendance(),
      getTodaySchedule(),
      getUpcomingEvents(),
    ])
      .then(([p, a, s, u]) => {
        setProfile(p);
        setAttendance(a);
        setSchedule(s);
        setUpcomingEvents(u);
      })
      .catch(err => setError(err.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/onboarding');
  }

  const contentProps = { profile, attendance, schedule, upcomingEvents, loading, error };

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.bg, color: C.text }}>
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1a1a1a' }}>B</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>BatchBook</div>
          <div style={{ marginLeft: 4, fontSize: 10, color: C.text2, fontFamily: fonts.sans }}>Student</div>
          <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#CF6679', fontFamily: fonts.sans, fontSize: 12 }}>Sign Out</button>
        </div>
        <OverviewContent {...contentProps} />
        <StudentBottomNav/>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: C.bg, color: C.text }}>
      <StudentSidebar name={profile?.name} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>Student · <strong style={{ color: C.text }}>Overview</strong></div>
        </div>
        <OverviewContent {...contentProps} />
      </div>
    </div>
  );
}

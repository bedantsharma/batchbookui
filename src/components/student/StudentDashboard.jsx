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
  getFeeStatus,
} from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home',     label: 'Overview', icon: I.home },
  { id: 'batches',  label: 'Batches',  icon: I.batch },
  { id: 'schedule', label: 'Schedule', icon: I.cal },
  { id: 'fees',     label: 'Fees',     icon: I.rupee },
];

function StudentSidebar({ activeTab, onTabChange, onLogout }) {
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
        const on = it.id === activeTab;
        return (
          <button key={it.id} onClick={() => onTabChange(it.id)} style={{ background: on ? C.primary15 : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, color: on ? C.primary : C.text2, fontFamily: fonts.sans, fontSize: 13, fontWeight: on ? 600 : 500 }}>
            <Ico size={18} /><span>{it.label}</span>
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

function StudentBottomNav({ activeTab, onTabChange }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface, borderTop: `1px solid ${C.outline}`, padding: '8px 4px 22px', display: 'flex', justifyContent: 'space-around' }}>
      {NAV_ITEMS.map(it => {
        const Ico = it.icon;
        const on = it.id === activeTab;
        return (
          <button key={it.id} onClick={() => onTabChange(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 14px', color: on ? C.secondary : C.text2, fontFamily: fonts.sans }}>
            <Ico size={22} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LoadingPane() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ color: C.text2, fontFamily: fonts.sans, fontSize: 14 }}>Loading…</div>
    </div>
  );
}

function OverviewContent({ profile, attendance, schedule, upcomingEvents, loading, error }) {
  if (loading) return <LoadingPane />;

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

      {profile?.feeDue && (
        <div style={{ background: 'rgba(207,102,121,0.12)', border: '1px solid rgba(207,102,121,0.30)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#CF6679', fontFamily: fonts.sans }}>Fee Due</div>
            <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans, marginTop: 2 }}>You have an outstanding fee for this month.</div>
          </div>
          {profile.paymentLink ? (
            <a href={profile.paymentLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#CF6679', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Pay Now
              </button>
            </a>
          ) : (
            <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans, whiteSpace: 'nowrap' }}>Contact your institute</div>
          )}
        </div>
      )}

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
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>Today's classes</div>
        {(schedule ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No classes scheduled today.</div>
        ) : (
          schedule.map(s => (
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
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>Upcoming</div>
        {(upcomingEvents ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No upcoming classes found.</div>
        ) : (
          upcomingEvents.slice(0, 5).map(e => (
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

function BatchesTab({ attendance, loading }) {
  if (loading) return <LoadingPane />;

  const items = attendance?.items ?? [];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>Your Batches</div>
      {items.length === 0 ? (
        <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No batches found.</div>
      ) : (
        items.map((item, i) => {
          const pct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
          return (
            <div key={i} style={{ background: C.surface, borderRadius: 14, padding: '16px 20px', border: `1px solid ${C.outline}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{item.batch_name}</div>
                  <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans, marginTop: 3 }}>{item.subject}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: pct >= 75 ? C.secondary : '#CF6679', fontFamily: fonts.sans }}>{pct}%</div>
              </div>
              <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans, marginTop: 8 }}>
                {item.present} present · {item.total} sessions this month
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ScheduleTab({ schedule, upcomingEvents, loading }) {
  if (loading) return <LoadingPane />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>Today</div>
        {(schedule ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No classes today.</div>
        ) : (
          schedule.map(s => (
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
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: fonts.sans, marginBottom: 12 }}>Upcoming</div>
        {(upcomingEvents ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No upcoming classes.</div>
        ) : (
          upcomingEvents.map(e => (
            <div key={e.id} style={{ background: C.surface, borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: `1px solid ${C.outline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{e.label}</div>
                <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>{e.sub}</div>
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

function FeesTab({ feeRecords, loading }) {
  if (loading) return <LoadingPane />;

  const statusColor = (s) =>
    s === 'FULLY_PAID' ? C.secondary : s === 'PARTIALLY_PAID' ? '#FFA726' : '#CF6679';
  const statusLabel = (s) =>
    s === 'FULLY_PAID' ? 'Paid' : s === 'PARTIALLY_PAID' ? 'Partial' : 'Unpaid';

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>Fee Status</div>
      {(feeRecords ?? []).length === 0 ? (
        <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>No fee records found for this month.</div>
      ) : (
        feeRecords.map((record, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 14, padding: '16px 20px', border: `1px solid ${C.outline}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{record.batch_name}</div>
                <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans, marginTop: 3 }}>Due: ₹{record.amount_due}</div>
                {record.amount_paid > 0 && (
                  <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>Paid: ₹{record.amount_paid}</div>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: statusColor(record.status), background: `${statusColor(record.status)}20`, borderRadius: 20, padding: '3px 10px', fontFamily: fonts.sans }}>
                {statusLabel(record.status)}
              </div>
            </div>
            {(record.status === 'NOT_PAID' || record.status === 'PARTIALLY_PAID') && (
              <div style={{ marginTop: 12 }}>
                {record.payment_link ? (
                  <a href={record.payment_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#CF6679', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontFamily: fonts.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Pay Now
                    </button>
                  </a>
                ) : (
                  <div style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>Contact your institute to pay</div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getStudentProfile(),
      getAttendance(),
      getTodaySchedule(),
      getUpcomingEvents(),
      getFeeStatus(),
    ])
      .then(([p, a, s, u, f]) => {
        setProfile(p);
        setAttendance(a);
        setSchedule(s);
        setUpcomingEvents(u);
        setFeeRecords(f);
      })
      .catch(err => setError(err.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/onboarding');
  }

  function renderContent() {
    if (activeTab === 'batches') return <BatchesTab attendance={attendance} loading={loading} />;
    if (activeTab === 'schedule') return <ScheduleTab schedule={schedule} upcomingEvents={upcomingEvents} loading={loading} />;
    if (activeTab === 'fees') return <FeesTab feeRecords={feeRecords} loading={loading} />;
    return <OverviewContent profile={profile} attendance={attendance} schedule={schedule} upcomingEvents={upcomingEvents} loading={loading} error={error} />;
  }

  const activeLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? 'Overview';

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.bg, color: C.text }}>
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1a1a1a' }}>B</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>BatchBook</div>
          <div style={{ marginLeft: 4, fontSize: 10, color: C.text2, fontFamily: fonts.sans }}>Student</div>
          <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#CF6679', fontFamily: fonts.sans, fontSize: 12 }}>Sign Out</button>
        </div>
        {renderContent()}
        <StudentBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: C.bg, color: C.text }}>
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>
            Student · <strong style={{ color: C.text }}>{activeLabel}</strong>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

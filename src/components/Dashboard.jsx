import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import {
  getStudentProfile,
  getAttendance,
  getUpcomingEvents,
  getTodaySchedule,
} from '../services/dashboardService';

// ─── Design tokens (BB_THEME / Option B) ─────────────────────────────────────
const T = {
  bg:           '#121212',
  surface:      '#1E1E1E',
  surfVar:      '#2C2C2C',
  primary:      '#BB86FC',
  primaryVivid: '#863bff',
  primaryCont:  'rgba(55,0,179,0.4)',
  secondary:    '#03DAC6',
  error:        '#CF6679',
  success:      '#4CAF50',
  warning:      '#F9A825',
  fg1:          '#FFFFFF',
  fg2:          '#B0B0B0',
  fg3:          'rgba(255,255,255,0.35)',
  outline:      'rgba(255,255,255,0.10)',
  sans:         "'DM Sans', system-ui, sans-serif",
  mono:         "'JetBrains Mono', monospace",
  rSm:  '8px',
  rMd:  '12px',
  rLg:  '16px',
  rXl:  '20px',
  rFull:'9999px',
  cardShadow: '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)',
  glowPurple: '0 0 20px rgba(134,59,255,0.25)',
};

// ─── Event metadata ───────────────────────────────────────────────────────────
const EVENT_META = {
  class:   { color: T.primary,    bg: 'rgba(187,134,252,0.12)', label: 'Class' },
  test:    { color: '#FB8C00',    bg: 'rgba(251,140,0,0.12)',    label: 'Test'  },
  holiday: { color: T.secondary,  bg: 'rgba(3,218,198,0.10)',    label: 'Holiday' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function attPct(present, total) {
  return Math.round((present / total) * 100);
}

// ─── LogoMark ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 26 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size * (46 / 48)} viewBox="0 0 48 46" fill="none">
      <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7e14ff 0%, #BB86FC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: '#fff',
        flexShrink: 0, fontFamily: T.sans,
        boxShadow: '0 0 0 2px rgba(187,134,252,0.3)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {initials}
    </div>
  );
}

// ─── Fee Alert ────────────────────────────────────────────────────────────────
function FeeAlert() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      background: 'rgba(249,168,37,0.08)', border: '1px solid rgba(249,168,37,0.25)',
      borderRadius: T.rMd, padding: '10px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: 12, color: T.warning, fontWeight: 500 }}>Fee due this month</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: T.fg3, cursor: 'pointer', padding: '2px 4px', fontSize: 16, lineHeight: 1, fontFamily: T.sans }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Event Icon ───────────────────────────────────────────────────────────────
function EventIcon({ type, size = 16 }) {
  const c = EVENT_META[type].color;
  if (type === 'class') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
  if (type === 'test') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',     label: 'Home' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'profile',  label: 'Profile' },
];

function HomeNavIcon({ size = 22, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? T.primary : 'none'} stroke={active ? T.primary : T.fg3} strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function CalNavIcon({ size = 22, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? T.primary : T.fg3} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function UserNavIcon({ size = 22, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? T.primary : T.fg3} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

const NAV_ICONS = { home: HomeNavIcon, schedule: CalNavIcon, profile: UserNavIcon };

function BottomNav({ tab, setTab }) {
  return (
    <div style={{
      background: T.surface, borderTop: `1px solid ${T.outline}`,
      padding: '8px 0 12px', display: 'flex', justifyContent: 'space-around',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.4)', flexShrink: 0,
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ id, label }) => {
        const active = tab === id;
        const Icon = NAV_ICONS[id];
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 20px', color: active ? T.primary : T.fg3,
            transition: 'color 0.15s', fontFamily: T.sans,
          }}>
            <Icon size={22} active={active} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────
function PlaceholderTab({ name, icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', color: T.fg3, gap: 10,
    }}>
      <div style={{ opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.fg1, fontFamily: T.sans }}>{name}</div>
      <div style={{ fontSize: 12, fontFamily: T.sans }}>Coming soon</div>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ profile, attendance, events }) {
  if (!profile || !attendance || !events) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${T.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const pct = attPct(attendance.present, attendance.total);
  const lowAtt = pct < 75;
  const todayEvents = events.filter(e => e.day === 'Today');
  const laterEvents = events.filter(e => e.day !== 'Today');

  return (
    <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Fee alert */}
      {profile.feeDue && <FeeAlert />}

      {/* ── Attendance card ─────────────────────────────────── */}
      <div style={{
        background: T.surface, borderRadius: T.rXl, padding: '20px',
        boxShadow: T.cardShadow,
        border: lowAtt ? '1px solid rgba(207,102,121,0.3)' : '1px solid rgba(187,134,252,0.15)',
      }}>
        <div style={{ fontSize: 11, color: T.fg3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Attendance — {attendance.month}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Big fraction */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, fontFamily: T.mono, color: lowAtt ? T.error : T.primary, lineHeight: 1 }}>
              {attendance.present}
            </span>
            <span style={{ fontSize: 20, color: T.fg3, fontFamily: T.mono }}>/</span>
            <span style={{ fontSize: 24, fontWeight: 500, fontFamily: T.mono, color: T.fg2 }}>
              {attendance.total}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            {/* Progress bar */}
            <div style={{ background: T.surfVar, borderRadius: T.rFull, height: 6, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: T.rFull,
                background: lowAtt
                  ? `linear-gradient(90deg, ${T.error}, rgba(207,102,121,0.6))`
                  : `linear-gradient(90deg, #863bff, ${T.primary})`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: T.fg2 }}>{pct}% this month</span>
              {!lowAtt && (
                <span style={{ fontSize: 11, color: T.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={T.primary}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  {attendance.streak} day streak
                </span>
              )}
              {lowAtt && <span style={{ fontSize: 11, color: T.error }}>Below 75%</span>}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: T.fg3, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.outline}` }}>
          Classes attended · {attendance.total - attendance.present} missed
        </div>
      </div>

      {/* ── Upcoming label ──────────────────────────────────── */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: T.fg1, fontFamily: T.sans }}>Upcoming</div>

      {/* ── Today's highlight card ──────────────────────────── */}
      {todayEvents.map(ev => {
        const meta = EVENT_META[ev.type];
        return (
          <div key={ev.id} style={{
            background: 'linear-gradient(135deg, rgba(134,59,255,0.18) 0%, rgba(30,30,30,0.9) 100%)',
            borderRadius: T.rXl, padding: '16px',
            border: '1px solid rgba(187,134,252,0.25)',
            boxShadow: T.glowPurple,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: T.rMd, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EventIcon type={ev.type} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.primary, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.fg1, fontFamily: T.sans }}>{ev.label}</div>
              <div style={{ fontSize: 11, color: T.fg2, fontFamily: T.sans }}>{ev.sub} · {ev.time}</div>
            </div>
          </div>
        );
      })}

      {/* ── Rest of upcoming events ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {laterEvents.map((ev, i) => {
          const meta = EVENT_META[ev.type];
          return (
            <div key={ev.id} style={{
              background: T.surface, borderRadius: T.rLg, padding: '11px 14px',
              display: 'flex', alignItems: 'center', gap: 11,
              opacity: i > 2 ? 0.65 : 1,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: T.rSm, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <EventIcon type={ev.type} size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.fg1, fontFamily: T.sans }}>{ev.label}</div>
                <div style={{ fontSize: 11, color: T.fg2, fontFamily: T.sans }}>{ev.sub}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>{ev.day}</div>
                <div style={{ fontSize: 10, color: T.fg3, fontFamily: T.sans }}>{ev.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ schedule }) {
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!schedule) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${T.primary}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.fg1, fontFamily: T.sans, marginBottom: 4 }}>Today's Schedule</div>
      <div style={{ fontSize: 12, color: T.fg2, fontFamily: T.sans, marginBottom: 16 }}>{todayLabel}</div>
      {schedule.length === 0 ? (
        <PlaceholderTab name="No sessions today" icon={<CalNavIcon size={48} active={false} />} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {schedule.map(s => (
            <div key={s.id} style={{ background: T.surface, borderRadius: T.rLg, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 4, borderRadius: 4, alignSelf: 'stretch', background: T.primary, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.fg1, fontFamily: T.sans }}>{s.batchName}</div>
                <div style={{ fontSize: 12, color: T.fg2, fontFamily: T.sans, marginTop: 2 }}>{s.time} · {s.room}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ profile, onLogout }) {
  if (!profile) return null;

  const rows = [
    { label: 'Phone',     value: profile.phone },
    { label: 'Institute', value: profile.institute },
    { label: 'Enrolled',  value: profile.enrolledYear },
    // TODO: add more fields as API provides them
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, paddingTop: 8 }}>
        <Avatar initials={profile.initials} size={72} />
        <div style={{ fontSize: 20, fontWeight: 700, color: T.fg1, fontFamily: T.sans, marginTop: 12 }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: T.fg2, fontFamily: T.sans, marginTop: 4 }}>Student</div>
      </div>

      {/* Info card */}
      <div style={{ background: T.surface, borderRadius: T.rLg, boxShadow: T.cardShadow, marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px',
            borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.08)` : 'none',
          }}>
            <span style={{ fontSize: 13, color: T.fg2, fontFamily: T.sans }}>{r.label}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.fg1, fontFamily: T.sans }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={onLogout} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '14px', borderRadius: T.rMd, border: `1px solid rgba(255,255,255,0.12)`,
        background: 'transparent', cursor: 'pointer', color: T.error,
        fontFamily: T.sans, fontSize: 14, fontWeight: 600,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.error} strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  );
}

// ─── Dashboard (root) ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate   = useNavigate();
  const [tab, setTab]           = useState('home');
  const [profile, setProfile]   = useState(null);
  const [attendance, setAtt]    = useState(null);
  const [events, setEvents]     = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    getStudentProfile().then(setProfile);
    getAttendance().then(setAtt);
    getUpcomingEvents().then(setEvents);
    getTodaySchedule().then(setSchedule);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await signOut(auth); } catch (_) {}
    navigate('/');
  }, [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: T.bg, fontFamily: T.sans, color: T.fg1, overflowX: 'hidden' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Gradient header ────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, rgba(55,0,179,0.25) 0%, ${T.bg} 100%)`,
        padding: '44px 18px 20px', flexShrink: 0,
      }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: T.fg3, fontFamily: T.sans }}>{getGreeting()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.fg1, fontFamily: T.sans }}>
              {profile?.name ?? '…'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={22} />
            <Avatar initials={profile?.initials ?? '…'} size={34} onClick={() => setTab('profile')} />
          </div>
        </div>

        {/* Batch + subject pills — home tab only */}
        {profile && tab === 'home' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: T.primary, background: T.primaryCont, padding: '3px 9px', borderRadius: T.rFull, fontWeight: 600, fontFamily: T.sans }}>
              {profile.batch}
            </span>
            {profile.subjects.map(sub => (
              <span key={sub} style={{ fontSize: 11, color: T.fg3, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: T.rFull, fontFamily: T.sans }}>
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: 72 }}>
        {tab === 'home'     && <HomeTab     profile={profile} attendance={attendance} events={events} />}
        {tab === 'schedule' && <ScheduleTab schedule={schedule} />}
        {tab === 'profile'  && <ProfileTab  profile={profile} onLogout={handleLogout} />}
      </div>

      {/* ── Bottom nav ─────────────────────────────────────── */}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

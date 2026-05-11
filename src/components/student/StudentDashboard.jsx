// src/components/student/StudentDashboard.jsx
import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import C, { fonts } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';

const NAV_ITEMS = [
  { id: 'home',     label: 'Overview', icon: I.home },
  { id: 'batches',  label: 'Batches',  icon: I.batch },
  { id: 'schedule', label: 'Schedule', icon: I.cal },
  { id: 'fees',     label: 'Fees',     icon: I.rupee },
];

function StudentSidebar() {
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
          <button key={it.id} style={{ background: on ? C.primary15 : 'transparent', border: 'none', borderRadius: 10, cursor: 'not-allowed', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, color: on ? C.primary : C.text2, fontFamily: fonts.sans, fontSize: 13, fontWeight: on ? 600 : 500, opacity: on ? 1 : 0.5 }}>
            <Ico size={18}/><span>{it.label}</span>
          </button>
        );
      })}
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
          <button key={it.id} style={{ background: 'none', border: 'none', cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 14px', color: on ? C.secondary : C.text2, fontFamily: fonts.sans, opacity: on ? 1 : 0.5 }}>
            <Ico size={22}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center', maxWidth: 360, padding: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: C.primary15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.secondary }}>
          <I.user size={32} stroke={C.secondary}/>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: fonts.sans, marginBottom: 8 }}>Student Dashboard</div>
        <div style={{ fontSize: 14, color: C.text2, fontFamily: fonts.sans, lineHeight: 1.6 }}>Coming soon — your classes, attendance, and fees will appear here.</div>
        {/* TODO: replace with real student stats API call */}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.bg, color: C.text }}>
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1a1a1a' }}>B</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>BatchBook</div>
          <div style={{ marginLeft: 4, fontSize: 10, color: C.text2, fontFamily: fonts.sans }}>Student</div>
        </div>
        <PlaceholderContent/>
        <StudentBottomNav/>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: C.bg, color: C.text }}>
      <StudentSidebar/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.outline}`, background: C.bg }}>
          <div style={{ fontSize: 13, color: C.text2, fontFamily: fonts.sans }}>Student · <strong style={{ color: C.text }}>Overview</strong></div>
        </div>
        <PlaceholderContent/>
      </div>
    </div>
  );
}

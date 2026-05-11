// src/components/teacher/TeacherSidebar.jsx
import React from 'react';
import C, { fonts, radius } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';
import { Avatar } from '../shared/DashboardWidgets';
import { OWNER } from '../../data/teacherMockData';

const NAV_ITEMS = [
  { id: 'home',     label: 'Overview', icon: I.home },
  { id: 'batches',  label: 'Batches',  icon: I.batch },
  { id: 'students', label: 'Students', icon: I.user },
  { id: 'schedule', label: 'Schedule', icon: I.cal },
  { id: 'fees',     label: 'Fees',     icon: I.rupee },
  { id: 'reports',  label: 'Reports',  icon: I.trend },
  { id: 'messages', label: 'Messages', icon: I.msg },
];

export default function TeacherSidebar({ active = 'home' }) {
  return (
    <div style={{
      width: 232, background: C.surface, borderRight: `1px solid ${C.outline}`,
      padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      flexShrink: 0, minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 22px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#1a1a1a' }}>B</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: C.text }}>BatchBook</div>
          <div style={{ fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Teacher</div>
        </div>
      </div>

      {NAV_ITEMS.map(it => {
        const Ico = it.icon;
        const on = it.id === active;
        return (
          <button key={it.id} style={{
            background: on ? C.primary15 : 'transparent',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
            color: on ? C.primary : C.text2,
            fontFamily: fonts.sans, fontSize: 13, fontWeight: on ? 600 : 500,
          }}>
            <Ico size={18}/><span>{it.label}</span>
          </button>
        );
      })}

      <div style={{ flex: 1 }}/>
      <div style={{ background: C.surface2, border: `1px solid ${C.outlineSoft}`, borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={OWNER.name} color={C.primary30} size={32}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{OWNER.name}</div>
            <div style={{ fontSize: 10, color: C.text2 }}>Teacher · {OWNER.institute}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

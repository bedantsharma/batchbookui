// src/components/teacher/TeacherTopBar.jsx
import React from 'react';
import C, { fonts } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';
import { Avatar } from '../shared/DashboardWidgets';
import { OWNER } from '../../data/teacherMockData';

const iconBtn = {
  background: 'transparent', border: `1px solid ${C.outline}`,
  borderRadius: 10, width: 36, height: 36, color: C.text2,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export function TeacherDesktopTopBar() {
  return (
    <div style={{
      height: 64, padding: '0 28px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: `1px solid ${C.outline}`,
      flexShrink: 0, background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>
        <span>Teacher</span>
        <I.chev size={12}/>
        <span style={{ color: C.text, fontWeight: 600 }}>Overview</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: C.surface, border: `1px solid ${C.outline}`,
          borderRadius: 10, padding: '7px 12px', width: 260,
        }}>
          <I.search size={15} stroke={C.text2}/>
          <span style={{ fontSize: 12, color: C.text2, fontFamily: fonts.sans }}>Search students, batches…</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: C.text2, fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', border: `1px solid ${C.outline}`, borderRadius: 4 }}>⌘K</span>
        </div>
        <button style={iconBtn}><I.bell size={16}/></button>
        <button style={iconBtn}><I.settings size={16}/></button>
      </div>
    </div>
  );
}

export function TeacherMobileTopBar() {
  return (
    <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1a1a1a' }}>B</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: fonts.sans }}>BatchBook</div>
          <div style={{ fontSize: 10, color: C.text2, fontFamily: fonts.sans, marginTop: -1 }}>{OWNER.institute} · {OWNER.city}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={iconBtn}><I.bell size={18}/></button>
        <Avatar name={OWNER.name} color={C.primary30} size={32} ring={C.primary50}/>
      </div>
    </div>
  );
}

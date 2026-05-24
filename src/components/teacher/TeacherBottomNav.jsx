// src/components/teacher/TeacherBottomNav.jsx
import React from 'react';
import C, { fonts } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';

const TABS = [
  { id: 'home',    label: 'Home',    icon: I.home },
  { id: 'batches', label: 'Batches', icon: I.batch },
  { id: 'fees',    label: 'Fees',    icon: I.rupee },
  { id: 'profile', label: 'Profile', icon: I.user },
];

export default function TeacherBottomNav({ active = 'home' }) {
  return (
    <div style={{
      flexShrink: 0, background: C.surface, borderTop: `1px solid ${C.outline}`,
      padding: '8px 4px 22px', display: 'flex', justifyContent: 'space-around',
    }}>
      {TABS.map(it => {
        const Ico = it.icon;
        const on = it.id === active;
        return (
          <button key={it.id} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 14px', color: on ? C.primary : C.text2, fontFamily: fonts.sans,
          }}>
            <Ico size={22}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

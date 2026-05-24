// src/components/shared/DashboardWidgets.jsx
import React from 'react';
import C, { fonts, radius } from '../../theme/colors';
import { FEE_HISTORY } from '../../data/teacherMockData';
import { I } from './DashboardIcons';

export function Avatar({ name, color, size = 36, ring }) {
  const initials = (name || '?').split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || C.primary30, color: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      fontFamily: fonts.sans, letterSpacing: '0.02em',
      boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
    }}>{initials}</div>
  );
}

export function Pill({ label, color, bg, sm }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: sm ? '2px 8px' : '3px 10px',
      borderRadius: 999, fontSize: sm ? 10 : 11, fontWeight: 600,
      background: bg, color, lineHeight: 1.2,
      fontFamily: fonts.sans, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export function SecHead({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
      {action && (
        <button onClick={onAction} style={{
          background: 'none', border: 'none', color: C.primary, fontSize: 12,
          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
          fontFamily: fonts.sans,
        }}>{action}<I.chev size={13}/></button>
      )}
    </div>
  );
}

export function KpiTile({ label, value, sub, icon: Ico, accent = C.primary, trend, danger, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} style={{
      background: C.surface,
      border: `1px solid ${danger ? 'rgba(207,102,121,0.30)' : C.outlineSoft}`,
      borderRadius: radius.lg, padding: 16, textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      color: C.text, fontFamily: fonts.sans,
      display: 'flex', flexDirection: 'column', gap: 10, width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${accent}22`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Ico && <Ico size={14}/>}
          </div>
          <div style={{ fontSize: 11, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</div>
        </div>
        {trend !== undefined && trend !== null && (
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
            background: trend > 0 ? 'rgba(76,175,80,0.18)' : 'rgba(207,102,121,0.18)',
            color: trend > 0 ? C.success : C.error,
          }}>{trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%</div>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: danger ? C.warning : C.text, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.3 }}>{sub}</div>}
    </Tag>
  );
}

export function RiskRow({ s, onClick }) {
  const issueBg = s.issue === 'fees' ? 'rgba(251,140,0,0.18)' : s.issue === 'attendance' ? 'rgba(207,102,121,0.18)' : 'rgba(187,134,252,0.18)';
  const issueColor = s.issue === 'fees' ? '#FFAB40' : s.issue === 'attendance' ? C.error : C.primary;
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: C.surface, border: `1px solid ${C.outlineSoft}`,
      borderRadius: radius.md, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      color: C.text, fontFamily: fonts.sans,
    }}>
      <Avatar name={s.name} color={s.avatarColor} size={38}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
        <div style={{ fontSize: 11, color: C.text2 }}>{s.cls} · {s.batch}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <Pill sm label={s.issue} bg={issueBg} color={issueColor}/>
        <div style={{ fontSize: 11, color: C.text2 }}>{s.detail}</div>
      </div>
    </button>
  );
}

export function MiniBar({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 5, background: C.outline, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color }}/>
      </div>
      <span style={{ fontSize: 10, color: C.text2, fontFamily: fonts.mono, width: 22, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function Spark({ data, w = 80, h = 28, color = C.primary }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FeeBars({ data = FEE_HISTORY, h = 140, accent = C.primary }) {
  const max = Math.max(...data.map(d => Math.max(d.collected, d.target)));
  const padT = 14, padB = 22;
  const innerH = h - padT - padB;
  return (
    <div style={{ width: '100%' }}>
    <svg viewBox={`0 0 400 ${h}`} width="100%" height={h} style={{ display: 'block', overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1="0" x2="400" y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke={C.outlineSoft} strokeDasharray="2 4"/>
      ))}
      {data.map((d, i) => {
        const cx = (400 / data.length) * (i + 0.5);
        const bw = (400 / data.length) * 0.35;
        const collH = (d.collected / max) * innerH;
        const tgtH = (d.target / max) * innerH;
        const isLast = i === data.length - 1;
        return (
          <g key={d.m}>
            <rect x={cx - bw / 2} y={padT + innerH - tgtH} width={bw} height={tgtH} rx="3" fill="none" stroke={C.outline} strokeDasharray="3 3"/>
            <rect x={cx - bw / 2} y={padT + innerH - collH} width={bw} height={collH} rx="3" fill={isLast ? accent : C.primary30} opacity={d.partial && !isLast ? 0.5 : 1}/>
            {isLast && (
              <text x={cx} y={padT + innerH - collH - 6} fill={accent} fontSize="10" fontWeight="600" textAnchor="middle">₹{d.collected}k</text>
            )}
            <text x={cx} y={h - 4} fill={C.text2} fontSize="10" textAnchor="middle" fontWeight={isLast ? 600 : 400}>{d.m}</text>
          </g>
        );
      })}
    </svg>
    </div>
  );
}

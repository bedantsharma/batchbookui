// src/components/teacher/TeacherOverview.jsx
import React, { useRef, useState, useEffect } from 'react';
import C, { fonts, radius } from '../../theme/colors';
import { I } from '../shared/DashboardIcons';
import { KpiTile, RiskRow, SecHead, FeeBars, Pill } from '../shared/DashboardWidgets';
import { OWNER, TODAY_SCHEDULE, STUDENTS_AT_RISK } from '../../data/teacherMockData';

// TODO: replace with API call — fetch teacher overview stats
function useTeacherStats() {
  return {
    attendanceToday: { value: '89%', sub: '127 of 142 present · 4 pending', trend: 5 },
    attendanceWeek:  { value: '92%', sub: '↑ 4 pts vs last week',           trend: 4 },
    feesCollected:   { value: '₹2.84L', sub: '86% of ₹3.20L target',       trend: 10 },
    feesPending:     { value: '₹47.2k', sub: '14 students · 7 overdue' },
  };
}

export default function TeacherOverview({ isMobile }) {
  const stats = useTeacherStats();
  const pad = isMobile ? 18 : 28;
  const ref = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, []);

  const greetOpacity = Math.max(0, 1 - scrollY / 60);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div ref={ref} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: C.bg }}>

      {/* Greeting */}
      <div style={{ padding: `${isMobile ? 4 : 26}px ${pad}px ${isMobile ? 16 : 18}px`, opacity: greetOpacity, transition: 'opacity .15s', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: C.text2, marginBottom: 2, fontFamily: fonts.sans }}>Good morning,</div>
          <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.02em', color: C.text, fontFamily: fonts.sans }}>{OWNER.name.split(' ')[0]} sir</div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2, fontFamily: fonts.sans }}>{OWNER.institute} · {OWNER.city} · {today}</div>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ background: 'transparent', color: C.text, border: `1px solid ${C.outline}`, borderRadius: 10, padding: '0 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: fonts.sans }}>
              <I.cal size={14}/> Mark attendance
            </button>
            <button style={{ background: C.primary, color: '#1a1a1a', border: 'none', borderRadius: 10, padding: '0 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: fonts.sans }}>
              <I.plus size={14}/> Record payment
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: `0 ${pad}px ${pad}px`, display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 18 }}>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16 }}>
          <KpiTile label="Today's attendance" value={stats.attendanceToday.value} sub={stats.attendanceToday.sub} icon={I.check} accent={C.primary} trend={stats.attendanceToday.trend}/>
          <KpiTile label="This week" value={stats.attendanceWeek.value} sub={stats.attendanceWeek.sub} icon={I.trend} accent={C.secondary} trend={stats.attendanceWeek.trend}/>
          <KpiTile label="Collected · Apr" value={stats.feesCollected.value} sub={stats.feesCollected.sub} icon={I.rupee} accent={C.success} trend={stats.feesCollected.trend}/>
          <KpiTile label="Pending fees" value={stats.feesPending.value} sub={stats.feesPending.sub} icon={I.alert} accent={C.warning} danger/>
        </div>

        {/* Live now strip (mobile only) */}
        {isMobile && TODAY_SCHEDULE.filter(s => s.status === 'live').map(s => (
          <div key={s.time} style={{ background: C.surface, border: `1px solid rgba(76,175,80,0.30)`, borderRadius: radius.lg, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, boxShadow: `0 0 0 4px rgba(76,175,80,0.20)`, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.success, fontWeight: 700, letterSpacing: '0.10em', fontFamily: fonts.sans }}>LIVE · {s.time}–{s.end}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1, color: C.text, fontFamily: fonts.sans }}>{s.batch}</div>
              <div style={{ fontSize: 11, color: C.text2, fontFamily: fonts.sans }}>{s.room} · {s.students} students</div>
            </div>
            <I.chev size={16} stroke={C.text2}/>
          </div>
        ))}

        {/* Fee chart + at-risk side-by-side (desktop) / stacked (mobile) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: isMobile ? 14 : 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.outlineSoft}`, borderRadius: radius.lg, padding: isMobile ? 14 : 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, fontFamily: fonts.sans }}>Fee collection · 6 months</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: C.text, fontFamily: fonts.sans }}>₹2.84L</span>
                  <span style={{ fontSize: 11, color: C.success, fontWeight: 700, padding: '2px 6px', background: 'rgba(76,175,80,0.18)', borderRadius: 999, fontFamily: fonts.sans }}>+10% MoM</span>
                </div>
              </div>
            </div>
            <FeeBars h={isMobile ? 110 : 220}/>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 10, color: C.text2, fontFamily: fonts.sans }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.primary }}/> Collected</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, border: `1px dashed ${C.text2}` }}/> Target</span>
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.outlineSoft}`, borderRadius: radius.lg, padding: isMobile ? 14 : 20, display: 'flex', flexDirection: 'column' }}>
            <SecHead title="Students at risk" action={`${STUDENTS_AT_RISK.length} students`}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {STUDENTS_AT_RISK.slice(0, isMobile ? 3 : 5).map(s => (
                <RiskRow key={s.name} s={s}/>
              ))}
            </div>
          </div>
        </div>

        {/* Today's schedule */}
        <div style={{ background: C.surface, border: `1px solid ${C.outlineSoft}`, borderRadius: radius.lg, padding: isMobile ? 14 : 20 }}>
          <SecHead title="Today's schedule" action="Open"/>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 10 }}>
            {TODAY_SCHEDULE.map(s => (
              <div key={s.time} style={{
                background: C.surface2, borderRadius: 12, padding: 12,
                border: s.status === 'live' ? `1px solid ${C.success}` : `1px solid ${C.outlineSoft}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 11, color: C.text2 }}>{s.time}–{s.end}</div>
                  {s.status === 'live' && <Pill sm label="LIVE" bg="rgba(76,175,80,0.18)" color={C.success}/>}
                  {s.status === 'done' && <I.check size={12} stroke={C.text3}/>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: s.status === 'done' ? C.text2 : C.text, fontFamily: fonts.sans }}>{s.batch}</div>
                <div style={{ fontSize: 10, color: C.text2, fontFamily: fonts.sans }}>{s.room} · {s.students} students</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

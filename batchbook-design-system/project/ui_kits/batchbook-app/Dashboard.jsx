// BatchBook — Dashboard screen component

function DashboardScreen({ onLogout }) {
  const t = BB_THEME;
  const [activeTab, setActiveTab] = React.useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'batches', label: 'Batches', icon: BatchesIcon },
    { id: 'schedule', label: 'Schedule', icon: ScheduleIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
  ];

  const stats = [
    { label: 'Active Batches', value: '12', trend: '+2', color: t.colors.primary },
    { label: 'Total Students', value: '348', trend: '+15', color: t.colors.secondary },
    { label: 'Sessions Today', value: '6', trend: '—', color: '#FB8C00' },
    { label: 'Pending Tasks', value: '4', trend: '-1', color: t.colors.error },
  ];

  const recentBatches = [
    { name: 'Math Batch A', students: 32, time: '10:00 AM', status: 'active' },
    { name: 'Science B', students: 28, time: '12:30 PM', status: 'active' },
    { name: 'English Advanced', students: 18, time: '3:00 PM', status: 'upcoming' },
    { name: 'Physics Weekend', students: 24, time: 'Sat 9 AM', status: 'upcoming' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background: t.colors.background, fontFamily: t.fonts.sans, color: t.colors.textPrimary }}>
      {/* Top App Bar */}
      <div style={{ background: t.colors.surface, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <img src="../../assets/logo.svg" width="28" height="27" alt="BatchBook" />
          <span style={{ fontSize:'18px', fontWeight:700 }}>BatchBook</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button style={{ background:'none', border:'none', color: t.colors.textSecondary, cursor:'pointer', padding:'4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: t.colors.primaryContainer, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'13px', fontWeight:600, color: t.colors.primary }} onClick={onLogout} title="Logout">
            BD
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:'20px', overflowY:'auto' }}>
        {activeTab === 'home' && (
          <div>
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'13px', color: t.colors.textSecondary }}>Good morning,</div>
              <div style={{ fontSize:'22px', fontWeight:700 }}>Welcome back 👋</div>
            </div>

            {/* Stats grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: t.colors.surface, borderRadius: t.radius.md, padding:'16px', boxShadow: t.shadow.card }}>
                  <div style={{ fontSize:'11px', color: t.colors.textSecondary, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                    <span style={{ fontSize:'28px', fontWeight:700, color: s.color }}>{s.value}</span>
                    <span style={{ fontSize:'12px', color: s.trend.startsWith('+') ? t.colors.success : s.trend === '—' ? t.colors.textSecondary : t.colors.error }}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent batches */}
            <div style={{ marginBottom:'12px', fontSize:'15px', fontWeight:600 }}>Recent Batches</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {recentBatches.map(b => (
                <div key={b.name} style={{ background: t.colors.surface, borderRadius: t.radius.md, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:t.radius.sm, background: t.colors.primaryContainer, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.colors.primary} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:600 }}>{b.name}</div>
                      <div style={{ fontSize:'12px', color: t.colors.textSecondary }}>{b.students} students · {b.time}</div>
                    </div>
                  </div>
                  <div style={{ padding:'3px 10px', borderRadius: t.radius.full, fontSize:'11px', fontWeight:600, background: b.status === 'active' ? 'rgba(76,175,80,0.15)' : 'rgba(187,134,252,0.12)', color: b.status === 'active' ? t.colors.success : t.colors.primary }}>
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'home' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', color: t.colors.textSecondary, gap:'12px' }}>
            <div style={{ fontSize:'40px', opacity:0.3 }}>
              {activeTab === 'batches' && <BatchesIcon size={48} />}
              {activeTab === 'schedule' && <ScheduleIcon size={48} />}
              {activeTab === 'profile' && <ProfileIcon size={48} />}
            </div>
            <div style={{ fontSize:'16px', fontWeight:600, color: t.colors.textPrimary }}>{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}</div>
            <div style={{ fontSize:'13px' }}>This section is a placeholder</div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ background: t.colors.surface, padding:'8px 0 12px', display:'flex', justifyContent:'space-around', boxShadow:'0 -2px 8px rgba(0,0,0,0.4)', borderTop:`1px solid ${t.colors.outline}` }}>
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'6px 16px', color: active ? t.colors.primary : t.colors.textSecondary, transition:'color 0.15s' }}>
              <item.icon size={22} active={active} />
              <span style={{ fontSize:'11px', fontWeight: active ? 600 : 400, fontFamily: t.fonts.sans }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Nav icons
function HomeIcon({ size=20, active }) {
  const t = BB_THEME;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? t.colors.primary : 'none'} stroke={active ? t.colors.primary : 'currentColor'} strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BatchesIcon({ size=20, active }) {
  const t = BB_THEME;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? t.colors.primary : 'currentColor'} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
}
function ScheduleIcon({ size=20, active }) {
  const t = BB_THEME;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? t.colors.primary : 'currentColor'} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ProfileIcon({ size=20, active }) {
  const t = BB_THEME;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? t.colors.primary : 'currentColor'} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

Object.assign(window, { DashboardScreen, HomeIcon, BatchesIcon, ScheduleIcon, ProfileIcon });

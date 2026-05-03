// BatchBook — PhoneLogin screen component
const { useState } = React;

function PhoneLoginScreen({ onSubmit }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = BB_THEME;

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhone(val);
    if (error && val.length === 10) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length !== 10) { setError('Please enter a valid 10-digit Indian phone number.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(phone); }, 1200);
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background: t.colors.background, padding:'16px', fontFamily: t.fonts.sans }}>
      <div style={{ width:'100%', maxWidth:'400px', background: t.colors.surface, borderRadius: t.radius.lg, boxShadow: t.shadow.card, padding:'40px 32px', textAlign:'center' }}>
        {/* Logo */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px' }}>
          <img src="../../assets/logo.svg" width="48" height="46" alt="BatchBook" />
        </div>
        <h1 style={{ margin:'0 0 8px', fontSize:'22px', fontWeight:700, color: t.colors.textPrimary }}>Login with Phone</h1>
        <p style={{ margin:'0 0 28px', fontSize:'14px', color: t.colors.textSecondary, lineHeight:1.5 }}>
          Enter your 10-digit Indian phone number to receive an OTP.
        </p>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Phone input */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color: t.colors.textSecondary, display:'flex', pointerEvents:'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.03 6.03l1.01-1.01a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <input
              type="tel"
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={handleChange}
              maxLength={10}
              disabled={loading}
              style={{
                width:'100%', boxSizing:'border-box',
                background:'transparent',
                border: `1px solid ${error ? t.colors.error : t.colors.outline}`,
                borderRadius: t.radius.md,
                color: t.colors.textPrimary,
                fontSize:'16px', fontFamily: t.fonts.sans,
                padding:'13px 14px 13px 42px',
                outline:'none',
                transition:'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = t.colors.primary; e.target.style.boxShadow = t.shadow.primary; }}
              onBlur={e => { e.target.style.borderColor = error ? t.colors.error : t.colors.outline; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          {error && <div style={{ fontSize:'12px', color: t.colors.error, textAlign:'left', marginTop:'-8px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(187,134,252,0.5)' : t.colors.primary,
              color:'#000', border:'none',
              borderRadius: t.radius.lg,
              padding:'14px', fontSize:'15px', fontWeight:600,
              fontFamily: t.fonts.sans, cursor: loading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              transition:'background 0.2s, box-shadow 0.2s',
              marginTop:'8px',
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.boxShadow = t.shadow.glow; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading
              ? <><Spinner />Sending OTP…</>
              : 'Get OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width:'16px', height:'16px',
      border:'2px solid rgba(0,0,0,0.25)',
      borderTopColor:'#000',
      borderRadius:'50%',
      animation:'bb-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

Object.assign(window, { PhoneLoginScreen, Spinner });

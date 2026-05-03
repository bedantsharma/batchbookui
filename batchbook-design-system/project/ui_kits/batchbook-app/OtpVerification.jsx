// BatchBook — OTP Verification screen component
const { useState, useRef, useEffect } = React;

function OtpVerificationScreen({ phoneNumber, onVerify, onBack }) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);
  const inputRefs = useRef([]);
  const t = BB_THEME;

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(n => n - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
        const next = [...otp]; next[idx - 1] = ''; setOtp(next);
      } else {
        const next = [...otp]; next[idx] = ''; setOtp(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focus = Math.min(pasted.length, 5);
    inputRefs.current[focus]?.focus();
  };

  const full = otp.join('');
  const isComplete = full.length === 6;

  const handleVerify = (e) => {
    e.preventDefault();
    if (!isComplete) { setError('Please enter the 6-digit OTP.'); return; }
    if (full === '123456') { setError('Wrong OTP. Please try again.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onVerify(); }, 1200);
  };

  const handleResend = () => {
    setOtp(Array(6).fill(''));
    setError('');
    setResendTimer(30);
    setResendActive(true);
    setTimeout(() => setResendActive(false), 1500);
    inputRefs.current[0]?.focus();
  };

  const cellStyle = (idx) => ({
    width:'44px', height:'52px',
    border: `1px solid ${error ? t.colors.error : otp[idx] ? 'rgba(187,134,252,0.5)' : t.colors.outline}`,
    borderRadius: t.radius.sm,
    background:'transparent',
    color: t.colors.textPrimary,
    fontSize:'22px', fontWeight:500,
    fontFamily: t.fonts.mono,
    textAlign:'center',
    outline:'none',
    transition:'border-color 0.15s, box-shadow 0.15s',
    caretColor: t.colors.primary,
  });

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background: t.colors.background, padding:'16px', fontFamily: t.fonts.sans }}>
      <style>{`@keyframes bb-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width:'100%', maxWidth:'400px', background: t.colors.surface, borderRadius: t.radius.lg, boxShadow: t.shadow.card, padding:'40px 32px', textAlign:'center' }}>
        {/* Back */}
        <div style={{ textAlign:'left', marginBottom:'16px' }}>
          <button onClick={onBack} style={{ background:'none', border:'none', color: t.colors.primary, cursor:'pointer', fontSize:'13px', fontFamily: t.fonts.sans, padding:'4px 0', display:'flex', alignItems:'center', gap:'6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
          <img src="../../assets/logo.svg" width="40" height="38" alt="BatchBook" />
        </div>
        <h1 style={{ margin:'0 0 8px', fontSize:'22px', fontWeight:700, color: t.colors.textPrimary }}>Verify OTP</h1>
        <p style={{ margin:'0 0 28px', fontSize:'14px', color: t.colors.textSecondary, lineHeight:1.5 }}>
          An OTP has been sent to <span style={{ color: t.colors.primary, fontWeight:600 }}>+91 {phoneNumber}</span>. Enter it below.
        </p>
        <form onSubmit={handleVerify}>
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'16px' }} onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                style={cellStyle(idx)}
                onFocus={e => { e.target.style.borderColor = t.colors.primary; e.target.style.boxShadow = t.shadow.primary; }}
                onBlur={e => { e.target.style.borderColor = error ? t.colors.error : otp[idx] ? 'rgba(187,134,252,0.5)' : t.colors.outline; e.target.style.boxShadow = 'none'; }}
              />
            ))}
          </div>
          {error && <div style={{ fontSize:'12px', color: t.colors.error, marginBottom:'12px' }}>{error}</div>}
          <div style={{ fontSize:'11px', color: t.colors.textSecondary, marginBottom:'20px' }}>
            Hint: use any code except <span style={{fontFamily:t.fonts.mono, color:t.colors.textSecondary}}>123456</span>
          </div>
          <button
            type="submit"
            disabled={loading || !isComplete}
            style={{
              width:'100%', background: (!isComplete || loading) ? 'rgba(187,134,252,0.35)' : t.colors.primary,
              color:'#000', border:'none', borderRadius: t.radius.lg,
              padding:'14px', fontSize:'15px', fontWeight:600, fontFamily: t.fonts.sans,
              cursor: (!isComplete || loading) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              transition:'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { if(isComplete && !loading) e.currentTarget.style.boxShadow = t.shadow.glow; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? <><Spinner />Verifying…</> : 'Verify OTP'}
          </button>
          <div style={{ marginTop:'20px', textAlign:'center' }}>
            {resendTimer > 0
              ? <span style={{ fontSize:'13px', color: t.colors.textSecondary }}>Resend OTP in {resendTimer}s</span>
              : <button type="button" onClick={handleResend} style={{ background:'none', border:'none', color: resendActive ? t.colors.success : t.colors.primary, cursor:'pointer', fontSize:'13px', fontFamily: t.fonts.sans, fontWeight:500 }}>
                  {resendActive ? '✓ OTP Resent' : 'Resend OTP'}
                </button>
            }
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { OtpVerificationScreen });

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ArrowRight, Sparkles } from 'lucide-react';

const T = {
  cream:'#FAF5EE', card:'#FFFFFF', border:'#EDE5D8', brown:'#1A0800',
  brownMid:'#4A2C1A', muted:'#7A5C48', accent:'#C84B00', accentL:'#FEF0E8',
  serif:"Georgia, 'Times New Roman', serif", sans:"'DM Sans', system-ui, sans-serif",
};

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function ResetPasswordPage() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const token           = params.get('token');
  const email           = params.get('email');

  const [pwd,     setPwd]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  // Invalid link check
  if (!token || !email) {
    return (
      <div style={{ minHeight:'100vh', background:T.cream, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.sans }}>
        <div style={{ textAlign:'center', padding:40 }}>
          <AlertCircle size={48} color={T.accent} style={{ margin:'0 auto 16px' }}/>
          <h2 style={{ fontFamily:T.serif, color:T.brown }}>Invalid Reset Link</h2>
          <p style={{ color:T.muted, marginBottom:24 }}>Aa link invalid che ya expire thay gayo che.</p>
          <button onClick={() => navigate('/auth')} style={{ background:T.accent, color:'#fff', border:'none', borderRadius:12, padding:'11px 24px', fontWeight:700, cursor:'pointer', fontFamily:T.sans }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pwd !== confirm) return setError('Passwords match nathi!');
    if (pwd.length < 6)  return setError('Minimum 6 characters required.');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ token, email, newPassword: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setDone(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:T.cream, fontFamily:T.sans, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <style>{`
        @keyframes riseIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float1{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,15px)}}
        @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
        .rp-shimmer{background:linear-gradient(90deg,#C84B00,#E8853A,#D4A853,#C84B00);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
        *{box-sizing:border-box}
      `}</style>

      <div style={{ width:'100%', maxWidth:460, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease' }}>

        {/* Card */}
        <div style={{ background:T.card, borderRadius:24, overflow:'hidden', boxShadow:'0 24px 64px rgba(26,8,0,0.12)', border:`1px solid ${T.border}`, position:'relative' }}>

          {/* Header band */}
          <div style={{ background:'linear-gradient(135deg,#1A0800,#3D1200)', padding:'32px 36px 28px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.25) 0%,transparent 70%)', animation:'float1 7s ease-in-out infinite' }}/>
            <div style={{ position:'absolute', bottom:-30, left:-20, width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle,rgba(212,168,83,0.15) 0%,transparent 70%)', animation:'float2 9s ease-in-out infinite' }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:14, background:'rgba(200,75,0,0.2)', border:'1px solid rgba(200,75,0,0.35)', borderRadius:99, padding:'5px 12px' }}>
                <Sparkles size={11} color="#D4A853"/>
                <span style={{ color:'#D4A853', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Rudra Real Estate</span>
              </div>
              <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:400, color:'#FFF8F0', margin:'0 0 6px' }}>
                Reset <span className="rp-shimmer">Password</span>
              </h2>
              <p style={{ color:'rgba(255,248,240,0.5)', fontSize:13, margin:0 }}>
                {email} mate navo password set karo
              </p>
            </div>
          </div>

          <div style={{ padding:'32px 36px' }}>
            {/* Success state */}
            {done ? (
              <div style={{ textAlign:'center', animation:'riseIn 0.4s ease both' }}>
                <div style={{ width:64, height:64, borderRadius:20, background:'#F0FDF4', border:'1px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <CheckCircle size={30} color="#16A34A"/>
                </div>
                <h3 style={{ fontFamily:T.serif, color:T.brown, fontSize:20, margin:'0 0 8px' }}>Password Reset!</h3>
                <p style={{ color:T.muted, fontSize:14, margin:'0 0 6px' }}>Tamaro password successfully change thayo.</p>
                <p style={{ color:T.muted, fontSize:13 }}>Login page par redirect thay raheya cho...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:11, background:'#FFF1F2', border:'1px solid #FECDD3', display:'flex', gap:9, animation:'riseIn 0.3s ease both' }}>
                    <AlertCircle size={15} color="#DC2626" style={{ flexShrink:0, marginTop:1 }}/>
                    <p style={{ fontSize:13, color:'#991B1B', margin:0, fontWeight:600 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {/* New password */}
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:7 }}>
                      New Password <span style={{ color:T.accent }}>*</span>
                    </label>
                    <div style={{ position:'relative' }}>
                      <Lock size={15} color={T.muted} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                      <input type={showPw?'text':'password'} value={pwd} onChange={e=>setPwd(e.target.value)}
                        placeholder="Min. 6 characters" required
                        style={{ width:'100%', padding:'11px 40px 11px 38px', border:`1.5px solid ${T.border}`, borderRadius:11, outline:'none', fontSize:14, fontFamily:T.sans, color:T.brown, background:T.cream, transition:'all 0.2s' }}
                        onFocus={e=>{ e.target.style.borderColor=T.accent; e.target.style.boxShadow=`0 0 0 3px ${T.accentL}`; e.target.style.background='#fff'; }}
                        onBlur={e =>{ e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; e.target.style.background=T.cream; }}
                      />
                      <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', color:T.muted, display:'flex' }}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {/* Strength indicator */}
                    {pwd.length > 0 && (
                      <div style={{ marginTop:6, display:'flex', gap:4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex:1, height:3, borderRadius:99, background:
                            pwd.length >= i*2
                              ? i <= 1 ? '#EF4444' : i <= 2 ? '#F59E0B' : i <= 3 ? '#22C55E' : '#16A34A'
                              : T.border, transition:'background 0.3s',
                          }}/>
                        ))}
                        <span style={{ fontSize:10, color:T.muted, marginLeft:4, whiteSpace:'nowrap' }}>
                          {pwd.length < 4 ? 'Weak' : pwd.length < 6 ? 'Fair' : pwd.length < 10 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:7 }}>
                      Confirm Password <span style={{ color:T.accent }}>*</span>
                    </label>
                    <div style={{ position:'relative' }}>
                      <Lock size={15} color={T.muted} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                      <input type={showPw?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)}
                        placeholder="Re-enter new password" required
                        style={{ width:'100%', padding:'11px 13px 11px 38px', border:`1.5px solid ${confirm && pwd && confirm===pwd ? '#22C55E' : confirm && pwd && confirm!==pwd ? '#EF4444' : T.border}`, borderRadius:11, outline:'none', fontSize:14, fontFamily:T.sans, color:T.brown, background:T.cream, transition:'all 0.2s' }}
                        onFocus={e=>{ e.target.style.boxShadow=`0 0 0 3px ${T.accentL}`; e.target.style.background='#fff'; }}
                        onBlur={e =>{ e.target.style.boxShadow='none'; e.target.style.background=T.cream; }}
                      />
                      {confirm && pwd && (
                        <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
                          {confirm === pwd
                            ? <CheckCircle size={15} color="#22C55E"/>
                            : <AlertCircle size={15} color="#EF4444"/>
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:loading?T.muted:T.accent, color:'#fff', border:'none', borderRadius:12, padding:'13px 20px', fontFamily:T.sans, fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer', width:'100%', boxShadow:loading?'none':'0 6px 20px rgba(200,75,0,0.28)', transition:'all 0.2s', marginTop:4 }}
                    onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background='#A83A00'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                    onMouseLeave={e=>{ e.currentTarget.style.background=loading?T.muted:T.accent; e.currentTarget.style.transform='translateY(0)'; }}>
                    {loading
                      ? <><Loader size={16} style={{ animation:'spin 0.8s linear infinite' }}/> Resetting…</>
                      : <>Set New Password <ArrowRight size={15}/></>
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:T.muted }}>
          <button onClick={() => navigate('/auth')}
            style={{ color:T.accent, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:T.sans, fontSize:13 }}>
            ← Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
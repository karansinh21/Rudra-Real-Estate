import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  AlertCircle, CheckCircle, FileText, Sparkles,
  ArrowRight, Loader, ArrowLeft, KeyRound,
} from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';

const T = {
  cream:'#FAF5EE', card:'#FFFFFF', border:'#EDE5D8',
  brown:'#1A0800', brownMid:'#4A2C1A', muted:'#7A5C48',
  accent:'#C84B00', accentL:'#FEF0E8', accentB:'rgba(200,75,0,0.18)',
  gold:'#D4A853',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Field = ({ icon: Icon, label, required, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:7, fontFamily:T.sans }}>{label}{required && <span style={{ color:T.accent }}> *</span>}</label>}
    <div style={{ position:'relative' }}>
      {Icon && <Icon size={15} color={T.muted} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>}
      <input {...props} style={{ width:'100%', fontFamily:T.sans, fontSize:14, boxSizing:'border-box', padding:Icon?'11px 13px 11px 38px':'11px 13px', border:`1.5px solid ${T.border}`, borderRadius:11, outline:'none', color:T.brown, background:T.cream, transition:'all 0.2s' }}
        onFocus={e=>{ e.target.style.borderColor=T.accent; e.target.style.boxShadow=`0 0 0 3px ${T.accentL}`; e.target.style.background='#fff'; }}
        onBlur={e =>{ e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; e.target.style.background=T.cream; }} />
    </div>
  </div>
);

const PwdField = ({ label, required, show, onToggle, ...props }) => (
  <div>
    <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:7, fontFamily:T.sans }}>{label}{required && <span style={{ color:T.accent }}> *</span>}</label>
    <div style={{ position:'relative' }}>
      <Lock size={15} color={T.muted} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
      <input type={show?'text':'password'} {...props} style={{ width:'100%', fontFamily:T.sans, fontSize:14, boxSizing:'border-box', padding:'11px 40px 11px 38px', border:`1.5px solid ${T.border}`, borderRadius:11, outline:'none', color:T.brown, background:T.cream, transition:'all 0.2s' }}
        onFocus={e=>{ e.target.style.borderColor=T.accent; e.target.style.boxShadow=`0 0 0 3px ${T.accentL}`; e.target.style.background='#fff'; }}
        onBlur={e =>{ e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; e.target.style.background=T.cream; }} />
      <button type="button" onClick={onToggle} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', color:T.muted, padding:0, display:'flex' }}
        onMouseEnter={e=>e.currentTarget.style.color=T.accent}
        onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
        {show?<EyeOff size={15}/>:<Eye size={15}/>}
      </button>
    </div>
  </div>
);

const TypeCard = ({ active, onClick, icon, title, sub, color }) => (
  <button type="button" onClick={onClick} style={{ flex:1, padding:'14px 8px', borderRadius:13, cursor:'pointer', fontFamily:T.sans, transition:'all 0.25s', textAlign:'center', border:'none', outline:`2px solid ${active?color:T.border}`, background:active?color+'12':T.cream, transform:active?'translateY(-2px)':'translateY(0)', boxShadow:active?`0 6px 18px ${color}30`:'none' }}>
    <div style={{ fontSize:22, marginBottom:5 }}>{icon}</div>
    <p style={{ fontSize:13, fontWeight:700, color:active?color:T.muted, margin:'0 0 2px' }}>{title}</p>
    <p style={{ fontSize:11, color:T.muted, margin:0 }}>{sub}</p>
  </button>
);

const Btn = ({ loading, loadText, children, ...props }) => (
  <button type="submit" disabled={loading} {...props}
    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:loading?T.muted:T.accent, color:'#fff', border:'none', borderRadius:12, padding:'13px 20px', fontFamily:T.sans, fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer', width:'100%', boxShadow:loading?'none':'0 6px 20px rgba(200,75,0,0.28)', transition:'all 0.2s', ...(props.style||{}) }}
    onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background='#A83A00'; e.currentTarget.style.transform='translateY(-1px)'; }}}
    onMouseLeave={e=>{ e.currentTarget.style.background=loading?T.muted:T.accent; e.currentTarget.style.transform='translateY(0)'; }}>
    {loading?<><Loader size={16} style={{ animation:'spin 0.8s linear infinite' }}/> {loadText}</>:children}
  </button>
);

export default function CombinedAuthPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { t }     = useLanguage();

  const [view,    setView]    = useState('login');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [visible, setVisible] = useState(false);
  const [regType, setRegType] = useState('PUBLIC');

  const [loginData, setLoginData] = useState({ email:'', password:'' });
  const [fpEmail,   setFpEmail]   = useState('');
  const [reg, setReg] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', professionalType:'BROKER', licenseNumber:'', experience:'', specialization:'' });

  useEffect(() => { const tm = setTimeout(() => setVisible(true), 60); return () => clearTimeout(tm); }, []);

  const clr = () => { setError(''); setSuccess(''); };
  const go  = (v) => { setView(v); clr(); setShowPw(false); };

  const redirectByRole = (role) => {
    const map = { ADMIN:'/admin/dashboard', BROKER:'/broker/dashboard', LAWYER:'/lawyer/dashboard' };
    navigate(map[role] || '/');
  };

  const handleGoogle = () => {
    setLoading(true); clr();
    const popup = window.open(`${BASE_URL}/auth/google`, 'Google Login', 'width=500,height=600');
    const handler = (ev) => {
      if (ev.origin !== window.location.origin) return;
      if (ev.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, user } = ev.data;
        localStorage.setItem('token', token); login(user, token); popup?.close();
        setSuccess(t('successMsg'));
        setTimeout(() => redirectByRole(user.role), 900);
      } else if (ev.data.type === 'GOOGLE_AUTH_ERROR') {
        setError(ev.data.message || t('errorMsg')); popup?.close();
      }
      window.removeEventListener('message', handler);
      setLoading(false);
    };
    window.addEventListener('message', handler);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); clr(); setLoading(true);
    try {
      if (!loginData.email || !loginData.password) throw new Error(t('required'));
      const res  = await fetch(`${BASE_URL}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(loginData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || t('errorMsg'));
      localStorage.setItem('token', data.token); login(data.user, data.token);
      setSuccess(t('successMsg'));
      setTimeout(() => redirectByRole(data.user.role), 900);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault(); clr(); setLoading(true);
    try {
      if (!fpEmail) throw new Error(t('required'));
      const res  = await fetch(`${BASE_URL}/auth/forgot-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:fpEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || t('errorMsg'));
      setView('forgot-sent');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); clr(); setLoading(true);
    try {
      if (!reg.name || !reg.email || !reg.password) throw new Error(t('required'));
      if (reg.password !== reg.confirmPassword) throw new Error('Passwords do not match');
      if (reg.password.length < 6) throw new Error('Password must be at least 6 characters');
      const finalRole = regType==='PROFESSIONAL' ? reg.professionalType : 'PUBLIC';
      const res = await fetch(`${BASE_URL}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:reg.name, email:reg.email, password:reg.password, phone:reg.phone, role:finalRole, status:regType==='PROFESSIONAL'?'PENDING':'ACTIVE',
          professionalDetails: regType==='PROFESSIONAL' ? { licenseNumber:reg.licenseNumber, experience:reg.experience, specialization:reg.specialization } : null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || t('errorMsg'));
      if (regType === 'PROFESSIONAL') {
        setSuccess(t('successMsg'));
        setTimeout(() => { go('login'); setRegType('PUBLIC'); setReg({ name:'', email:'', password:'', confirmPassword:'', phone:'', professionalType:'BROKER', licenseNumber:'', experience:'', specialization:'' }); }, 4000);
      } else {
        setSuccess(t('successMsg'));
        setTimeout(() => { go('login'); setLoginData({ email:reg.email, password:'' }); }, 2000);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const features = [
    { icon:'🏠', title:`500+ ${t('properties')}`, desc:'Verified listings across Vadodara & Gujarat' },
    { icon:'⚖️', title:t('legalSupport'),          desc:'Expert lawyers for all property matters'    },
    { icon:'👔', title:t('expertBrokers'),          desc:'RERA registered professionals only'         },
    { icon:'🔒', title:'100% Secure',               desc:'End-to-end encrypted transactions'          },
  ];

  return (
    <div style={{ minHeight:'100vh', background:T.cream, fontFamily:T.sans, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 16px' }}>
      <style>{`
        @keyframes riseIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes float1  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-15px,25px) scale(0.97)} }
        @keyframes float2  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.04)} 66%{transform:translate(20px,-15px) scale(0.98)} }
        @keyframes float3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-30px)} }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes gridMove{ 0%{transform:translateY(0)} 100%{transform:translateY(50px)} }
        .auth-shimmer { background:linear-gradient(90deg,#C84B00,#E8853A,#D4A853,#C84B00); background-size:300% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        *{box-sizing:border-box}
      `}</style>

      <div style={{ maxWidth:960, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', background:T.card, borderRadius:26, overflow:'hidden', boxShadow:'0 32px 80px rgba(26,8,0,0.14)', border:`1px solid ${T.border}`, opacity:visible?1:0, transform:visible?'translateY(0) scale(1)':'translateY(28px) scale(0.98)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>

        {/* LEFT */}
        <div style={{ background:'linear-gradient(160deg,#1A0800 0%,#3D1200 55%,#1A0800 100%)', padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', backgroundImage:'linear-gradient(rgba(212,168,83,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.04) 1px,transparent 1px)', backgroundSize:'50px 50px', animation:'gridMove 8s linear infinite' }}/>
          <div style={{ position:'absolute', top:-40, right:-40, width:280, height:280, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(200,75,0,0.25) 0%,transparent 70%)', animation:'float1 8s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-30, width:220, height:220, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(212,168,83,0.15) 0%,transparent 70%)', animation:'float2 10s ease-in-out infinite' }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, marginBottom:24, background:'rgba(200,75,0,0.2)', border:'1px solid rgba(200,75,0,0.4)', borderRadius:99, padding:'6px 14px', animation:visible?'riseIn 0.5s ease 0.1s both':'none' }}>
              <Sparkles size={12} color={T.gold}/>
              <span style={{ color:T.gold, fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Vadodara's #1 Platform</span>
            </div>
            <h2 style={{ fontFamily:T.serif, fontSize:'clamp(24px,2.8vw,36px)', fontWeight:400, color:'#FFF8F0', lineHeight:1.2, margin:'0 0 10px', animation:visible?'riseIn 0.55s ease 0.2s both':'none' }}>
              Rudra<br/><span className="auth-shimmer">Real Estate</span>
            </h2>
            <p style={{ color:'rgba(255,248,240,0.5)', fontSize:13, lineHeight:1.65, margin:0, animation:visible?'riseIn 0.55s ease 0.28s both':'none' }}>
              {t('heroSubtitle')}
            </p>
          </div>

          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:16, marginTop:32 }}>
            {features.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, animation:visible?`riseIn 0.5s ease ${0.35+i*0.08}s both`:'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:'rgba(200,75,0,0.15)', border:'1px solid rgba(200,75,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight:700, color:'#FFF8F0', margin:'0 0 1px', fontSize:13 }}>{f.title}</p>
                  <p style={{ color:'rgba(255,248,240,0.42)', fontSize:11.5, margin:0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position:'relative', zIndex:1, marginTop:32, borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:18, display:'flex', gap:24, animation:visible?'riseIn 0.5s ease 0.75s both':'none' }}>
            {[['500+',t('happyClients')],['120+',t('properties')],['15+',t('lawyers')]].map(([v,l]) => (
              <div key={l}>
                <p style={{ fontFamily:T.serif, fontSize:18, fontWeight:700, color:T.accent, margin:'0 0 2px' }}>{v}</p>
                <p style={{ fontSize:10, color:'rgba(255,248,240,0.35)', margin:0, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ padding:'44px 40px', overflowY:'auto', maxHeight:'96vh' }}>

          {/* Forgot Sent */}
          {view==='forgot-sent' && (
            <div style={{ animation:'riseIn 0.4s ease both', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center', gap:16 }}>
              <div style={{ width:72, height:72, borderRadius:22, background:T.accentL, border:`1px solid ${T.accentB}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Mail size={32} color={T.accent}/>
              </div>
              <h3 style={{ fontFamily:T.serif, fontSize:22, color:T.brown, margin:0 }}>{t('thankYou')}</h3>
              <p style={{ color:T.muted, fontSize:14, lineHeight:1.6, margin:0, maxWidth:280 }}>
                Password reset link <strong style={{ color:T.brownMid }}>{fpEmail}</strong> par moki deedhee che.
              </p>
              <div style={{ marginTop:8, padding:'10px 16px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:11, display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle size={15} color="#16A34A"/>
                <span style={{ fontSize:13, color:'#166534', fontWeight:600 }}>Check your inbox & spam folder</span>
              </div>
              <button onClick={() => go('login')} style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, background:'none', border:`1.5px solid ${T.border}`, color:T.brownMid, padding:'9px 20px', borderRadius:11, cursor:'pointer', fontFamily:T.sans, fontWeight:600, fontSize:13 }}>
                <ArrowLeft size={14}/> {t('back')}
              </button>
            </div>
          )}

          {/* Forgot Form */}
          {view==='forgot' && (
            <div style={{ animation:'slideIn 0.35s ease both' }}>
              <button onClick={() => go('login')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:T.muted, fontFamily:T.sans, fontSize:13, fontWeight:600, padding:0, marginBottom:24 }}
                onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
                <ArrowLeft size={14}/> {t('back')}
              </button>
              <div style={{ marginBottom:28 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:T.accentL, border:`1px solid ${T.accentB}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <KeyRound size={24} color={T.accent}/>
                </div>
                <h3 style={{ fontFamily:T.serif, fontSize:22, fontWeight:400, color:T.brown, margin:'0 0 6px' }}>{t('forgotPassword')}</h3>
              </div>
              {error && <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:11, background:'#FFF1F2', border:'1px solid #FECDD3', display:'flex', alignItems:'flex-start', gap:9 }}><AlertCircle size={15} color="#DC2626" style={{ flexShrink:0, marginTop:1 }}/><p style={{ fontSize:13, color:'#991B1B', margin:0, fontWeight:600 }}>{error}</p></div>}
              <form onSubmit={handleForgot} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <Field icon={Mail} label={t('email')} required type="email" value={fpEmail} onChange={e => { setFpEmail(e.target.value); clr(); }} placeholder={t('email')}/>
                <Btn loading={loading} loadText={t('loading')}>Send Reset Link <ArrowRight size={15}/></Btn>
              </form>
            </div>
          )}

          {/* Login / Register */}
          {(view==='login'||view==='register') && (
            <>
              <div style={{ display:'flex', background:T.cream, borderRadius:13, padding:4, marginBottom:28, border:`1px solid ${T.border}`, animation:visible?'riseIn 0.5s ease 0.25s both':'none' }}>
                {[[t('signIn'),'login'],[t('register'),'register']].map(([label,v]) => (
                  <button key={v} type="button" onClick={() => go(v)}
                    style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', fontFamily:T.sans, fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.25s', background:view===v?T.card:'transparent', color:view===v?T.accent:T.muted, boxShadow:view===v?'0 2px 8px rgba(26,8,0,0.08)':'none' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom:24, animation:'slideIn 0.3s ease both' }}>
                <h3 style={{ fontFamily:T.serif, fontSize:22, fontWeight:400, color:T.brown, margin:'0 0 5px' }}>
                  {view==='login' ? t('loginTitle') : t('registerTitle')}
                </h3>
              </div>

              {success && <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:11, background:'#F0FDF4', border:'1px solid #BBF7D0', display:'flex', alignItems:'flex-start', gap:9 }}><CheckCircle size={15} color="#16A34A" style={{ flexShrink:0, marginTop:1 }}/><p style={{ fontSize:13, color:'#166534', margin:0, fontWeight:600 }}>{success}</p></div>}
              {error   && <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:11, background:'#FFF1F2', border:'1px solid #FECDD3', display:'flex', alignItems:'flex-start', gap:9 }}><AlertCircle size={15} color="#DC2626" style={{ flexShrink:0, marginTop:1 }}/><p style={{ fontSize:13, color:'#991B1B', margin:0, fontWeight:600 }}>{error}</p></div>}

              {view==='login' && (
                <div key="login-form" style={{ animation:'slideIn 0.3s ease both' }}>
                  <button type="button" onClick={handleGoogle} disabled={loading}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'11px 16px', borderRadius:12, border:`1.5px solid ${T.border}`, background:T.card, color:T.brownMid, fontFamily:T.sans, fontWeight:600, fontSize:13.5, cursor:'pointer', transition:'all 0.2s', marginBottom:20, opacity:loading?0.5:1 }}
                    onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background=T.accentL; e.currentTarget.style.borderColor=T.accent; }}}
                    onMouseLeave={e=>{ e.currentTarget.style.background=T.card; e.currentTarget.style.borderColor=T.border; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('loginWithGoogle')}
                  </button>

                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ flex:1, height:1, background:T.border }}/>
                    <span style={{ fontSize:12, color:T.muted, whiteSpace:'nowrap' }}>{t('orContinueWith')}</span>
                    <div style={{ flex:1, height:1, background:T.border }}/>
                  </div>

                  <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <Field icon={Mail} label={t('email')} required type="email" name="email" value={loginData.email} onChange={e=>{ setLoginData({...loginData,email:e.target.value}); clr(); }} placeholder={t('email')}/>
                    <div>
                      <PwdField label={t('password')} required show={showPw} onToggle={()=>setShowPw(s=>!s)} name="password" value={loginData.password} onChange={e=>{ setLoginData({...loginData,password:e.target.value}); clr(); }} placeholder={t('password')}/>
                      <div style={{ textAlign:'right', marginTop:6 }}>
                        <button type="button" onClick={() => go('forgot')} style={{ background:'none', border:'none', cursor:'pointer', color:T.accent, fontFamily:T.sans, fontSize:12, fontWeight:600, padding:0 }}>{t('forgotPassword')}</button>
                      </div>
                    </div>
                    <Btn loading={loading} loadText={t('loading')}>{t('signIn')} <ArrowRight size={15}/></Btn>
                  </form>

                  <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:T.muted }}>
                    {t('noAccount')}{' '}
                    <button type="button" onClick={() => go('register')} style={{ color:T.accent, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:T.sans, fontSize:13 }}>{t('register')}</button>
                  </p>
                </div>
              )}

              {view==='register' && (
                <form key="reg-form" onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14, animation:'slideIn 0.3s ease both' }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:8 }}>{t('register')} As <span style={{ color:T.accent }}>*</span></label>
                    <div style={{ display:'flex', gap:10 }}>
                      <TypeCard active={regType==='PUBLIC'}       color={T.accent} onClick={()=>setRegType('PUBLIC')}       icon="🏠" title={t('home')}    sub="Instant Access"  />
                      <TypeCard active={regType==='PROFESSIONAL'} color="#7C5CFC"  onClick={()=>setRegType('PROFESSIONAL')} icon="👔" title="Professional" sub="Needs Approval" />
                    </div>
                  </div>

                  {regType==='PROFESSIONAL' && (
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.brownMid, marginBottom:8 }}>Professional {t('type')} <span style={{ color:T.accent }}>*</span></label>
                      <div style={{ display:'flex', gap:10 }}>
                        <TypeCard active={reg.professionalType==='BROKER'} color="#0EA5E9" onClick={()=>setReg(d=>({...d,professionalType:'BROKER'}))} icon="🏢" title="Broker" sub="Property Sales"  />
                        <TypeCard active={reg.professionalType==='LAWYER'} color="#7C5CFC" onClick={()=>setReg(d=>({...d,professionalType:'LAWYER'}))} icon="⚖️" title="Lawyer" sub="Legal Services" />
                      </div>
                    </div>
                  )}

                  <Field icon={User}  label={t('fullName')}    required type="text"  value={reg.name}  onChange={e=>{setReg(d=>({...d,name:e.target.value}));clr();}}  placeholder={t('fullName')}/>
                  <Field icon={Mail}  label={t('email')}        required type="email" value={reg.email} onChange={e=>{setReg(d=>({...d,email:e.target.value}));clr();}} placeholder={t('email')}/>
                  <Field icon={Phone} label={t('phoneNumber')}  type="tel" value={reg.phone} onChange={e=>{setReg(d=>({...d,phone:e.target.value}));clr();}} placeholder="+91 98765 43210"/>

                  {regType==='PROFESSIONAL' && (<>
                    <Field icon={FileText} label="License No." required type="text" value={reg.licenseNumber} onChange={e=>{setReg(d=>({...d,licenseNumber:e.target.value}));clr();}} placeholder="License number"/>
                    <Field label={t('experience')} required type="number" value={reg.experience} onChange={e=>{setReg(d=>({...d,experience:e.target.value}));clr();}} placeholder="e.g. 5"/>
                    <Field label={t('specialization')} type="text" value={reg.specialization} onChange={e=>{setReg(d=>({...d,specialization:e.target.value}));clr();}} placeholder="e.g. Residential"/>
                  </>)}

                  <PwdField label={t('password')} required show={showPw} onToggle={()=>setShowPw(s=>!s)} value={reg.password} onChange={e=>{setReg(d=>({...d,password:e.target.value}));clr();}} placeholder="Min. 6 characters"/>
                  <PwdField label={t('confirmPassword')} required show={showPw} onToggle={()=>setShowPw(s=>!s)} value={reg.confirmPassword} onChange={e=>{setReg(d=>({...d,confirmPassword:e.target.value}));clr();}} placeholder="Re-enter password"/>

                  <Btn loading={loading} loadText={t('loading')}>{t('register')} <ArrowRight size={15}/></Btn>

                  <p style={{ textAlign:'center', fontSize:13, color:T.muted, margin:0 }}>
                    {t('alreadyHaveAccount')}{' '}
                    <button type="button" onClick={() => go('login')} style={{ color:T.accent, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:T.sans, fontSize:13 }}>{t('signIn')}</button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
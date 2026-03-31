import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';
import {
  LayoutDashboard, Heart, Calendar, Calculator, Users,
  Settings, LogOut, Menu, X, Camera, Save, CheckCircle,
  Shield, Bell, ChevronRight, Loader2, FileText, Clock,
  Home, AlertCircle, Building2
} from 'lucide-react';

const DS = {
  bg:'#F9F6F2', sidebar:'#FFFFFF', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  shadow:'0 1px 3px rgba(26,8,0,0.05),0 4px 14px rgba(26,8,0,0.04)',
  shadowMd:'0 4px 20px rgba(200,75,0,0.10)',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
  .prd{font-family:'DM Sans',system-ui,sans-serif;} .prd *{box-sizing:border-box;margin:0;padding:0;}
  .prds{font-family:Georgia,'Times New Roman',serif;}
  .prd-h{transition:all 0.18s;} .prd-h:hover{box-shadow:0 6px 24px rgba(200,75,0,0.12);transform:translateY(-1px);}
  .prd-n{transition:all 0.15s;} .prd-n:hover{background:#FEF3EE!important;color:#C84B00!important;}
  .prd-i{transition:border-color 0.15s,box-shadow 0.15s;} .prd-i:focus{outline:none;border-color:#C84B00!important;box-shadow:0 0 0 3px rgba(200,75,0,0.1)!important;}
  @keyframes prd-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .prd-fade{animation:prd-fade 0.35s ease forwards;}
  @keyframes prd-spin{to{transform:rotate(360deg)}} .prd-spin{animation:prd-spin 1s linear infinite;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#EDE8E3;border-radius:4px;}
`;

const Badge = ({ color='gray', children }) => {
  const m = { terra:`${DS.primaryLight},${DS.primary},${DS.primaryBorder}`, gray:'#F9FAFB,#374151,#E5E7EB' };
  const [bg,text,border]=(m[color]||m.gray).split(',');
  return <span style={{ background:bg, color:text, border:`1px solid ${border}`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{children}</span>;
};

const FieldInput = ({ label, disabled, textarea, rows=3, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:DS.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{label}</label>}
    {textarea
      ? <textarea className="prd-i" {...props} rows={rows} disabled={disabled} style={{ width:'100%', background:disabled?'#F5F0EB':DS.card, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', fontSize:14, color:disabled?DS.textMuted:DS.text, resize:'vertical', fontFamily:'inherit' }}/>
      : <input className="prd-i" {...props} disabled={disabled} style={{ width:'100%', background:disabled?'#F5F0EB':DS.card, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', fontSize:14, color:disabled?DS.textMuted:DS.text, cursor:disabled?'not-allowed':'text' }}/>}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{ position:'relative', width:44, height:24, borderRadius:12, background:value?DS.primary:DS.border, border:'none', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ position:'absolute', top:3, left:value?23:3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s' }}/>
  </button>
);

const StatCard = ({ icon:Icon, label, value, color=DS.primary, linkTo, linkLabel }) => (
  <div className="prd-h" style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:'20px 22px', boxShadow:DS.shadow }}>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={18} color={color}/></div>
    </div>
    <p className="prds" style={{ fontSize:30, fontWeight:700, color:DS.text, lineHeight:1 }}>{value}</p>
    <p style={{ fontSize:13, color:DS.textSub, marginTop:5, marginBottom:8 }}>{label}</p>
    {linkTo && <Link to={linkTo} style={{ fontSize:12, color:DS.primary, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>{linkLabel} <ChevronRight size={12}/></Link>}
  </div>
);

const Sidebar = ({ activeView, setView, user, onLogout, navigate, t }) => {
  const navItems = [
    { id:'dashboard', label:t('dashboard'), icon:LayoutDashboard, internal:true },
    { divider:true },
    { id:'wishlist',    label:t('wishlist'),     icon:Heart,      path:'/wishlist' },
    { id:'tours',       label:t('tours'),        icon:Calendar,   path:'/schedule-tour' },
    { id:'calculators', label:t('calculator'),   icon:Calculator, path:'/calculators' },
    { id:'lawyers',     label:t('lawyers'),      icon:Users,      path:'/lawyers' },
    { divider:true },
    { id:'settings', label:`${t('myAccount')} Settings`, icon:Settings, internal:true },
  ];
  return (
    <aside style={{ width:240, minHeight:'100vh', background:DS.sidebar, borderRight:`1px solid ${DS.border}`, display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, zIndex:20 }}>
      <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${DS.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:DS.primary, display:'flex', alignItems:'center', justifyContent:'center' }}><Building2 size={17} color="#fff"/></div>
          <div>
            <p className="prds" style={{ fontSize:15, fontWeight:700, color:DS.text, lineHeight:1.1 }}>Rudra</p>
            <p style={{ fontSize:9, fontWeight:700, color:DS.textMuted, letterSpacing:'0.12em', textTransform:'uppercase', marginTop:1 }}>Legal & Realty</p>
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        {navItems.map((item,i) => {
          if (item.divider) return <div key={i} style={{ height:1, background:DS.border, margin:'8px 0' }}/>;
          const isActive = activeView===item.id;
          return (
            <button key={item.id} onClick={() => { if(item.internal)setView(item.id); else navigate(item.path); }}
              className="prd-n"
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', marginBottom:2, background:isActive?DS.primaryLight:'transparent', color:isActive?DS.primary:DS.textSub, fontWeight:isActive?700:500, fontSize:14, textAlign:'left', borderLeft:isActive?`3px solid ${DS.primary}`:'3px solid transparent' }}>
              <item.icon size={16}/><span style={{ flex:1 }}>{item.label}</span>{isActive&&<ChevronRight size={12}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ borderTop:`1px solid ${DS.border}`, padding:'10px 10px 6px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:4 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:DS.primaryLight, border:`1px solid ${DS.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span className="prds" style={{ fontSize:14, fontWeight:700, color:DS.primary }}>{user?.name?.[0]?.toUpperCase()||'U'}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:DS.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'User'}</p>
            <p style={{ fontSize:11, color:DS.textMuted }}>Property Seeker</p>
          </div>
        </div>
        <button onClick={onLogout} className="prd-n" style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', background:'transparent', color:'#EF4444', fontWeight:600, fontSize:14 }}>
          <LogOut size={15}/> {t('logout')}
        </button>
      </div>
    </aside>
  );
};

const DashboardView = ({ user, setView, navigate, t }) => {
  const stats = { savedProperties:12, scheduledTours:3, enquiriesSent:8, consultationsBooked:2 };
  const recentActivity = [
    { id:1, action:`Saved 3BHK Apartment to ${t('wishlist')}`, time:'2 hours ago', icon:Heart,    color:'#B91C1C' },
    { id:2, action:'Scheduled tour for Villa in Gorwa',          time:'1 day ago',   icon:Calendar, color:'#15803D' },
    { id:3, action:`Sent ${t('enquiries')} for Commercial Space`, time:'2 days ago', icon:FileText, color:DS.primary },
    { id:4, action:'Booked legal consultation',                   time:'3 days ago', icon:Users,    color:'#6D28D9' },
  ];
  const quickActions = [
    { label:t('browseProperties'), icon:Building2, path:'/glass-cards',    color:DS.primary, bg:DS.primaryLight, border:DS.primaryBorder },
    { label:t('scheduleVisit'),    icon:Calendar,  path:'/schedule-tour',  color:'#15803D',  bg:'#F0FDF4',       border:'#BBF7D0' },
    { label:t('calculator'),       icon:Calculator,path:'/calculators',    color:'#6D28D9',  bg:'#F5F3FF',       border:'#DDD6FE' },
    { label:t('findLawyer'),       icon:Users,     path:'/lawyers',        color:'#0369A1',  bg:'#F0F9FF',       border:'#BAE6FD' },
  ];

  return (
    <div className="prd-fade">
      <div style={{ background:`linear-gradient(135deg,${DS.primary} 0%,#8B2500 100%)`, borderRadius:20, padding:'28px 32px', marginBottom:28, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:6 }}>Welcome back,</p>
            <h1 className="prds" style={{ fontSize:28, fontWeight:700, color:'#fff', marginBottom:6 }}>{user?.name||'User'} 👋</h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14 }}>Your property search {t('dashboard')}</p>
          </div>
          <button onClick={()=>setView('settings')} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', padding:'7px 14px', borderRadius:10, cursor:'pointer', fontSize:12, fontWeight:600 }}>
            <Settings size={12}/> {t('edit')} Profile
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon={Heart}    label={t('wishlist')}      value={stats.savedProperties}     color="#B91C1C" linkTo="/wishlist"      linkLabel={t('viewAll')}/>
        <StatCard icon={Calendar} label={t('tours')}         value={stats.scheduledTours}      color="#15803D" linkTo="/schedule-tour" linkLabel={t('viewAll')}/>
        <StatCard icon={FileText} label={t('enquiries')}     value={stats.enquiriesSent}       color={DS.primary}/>
        <StatCard icon={Users}    label={t('bookConsultation')} value={stats.consultationsBooked} color="#6D28D9" linkTo="/lawyers"   linkLabel={t('bookConsultation')}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>
        <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:20, boxShadow:DS.shadow, overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${DS.border}` }}>
            <h2 className="prds" style={{ fontSize:18, fontWeight:700, color:DS.text }}>Quick Actions</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:20 }}>
            {quickActions.map(({label,icon:Icon,path,color,bg,border}) => (
              <Link key={label} to={path} className="prd-h" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:'24px 16px', background:bg, border:`1px solid ${border}`, borderRadius:16, textDecoration:'none', cursor:'pointer' }}>
                <div style={{ width:44, height:44, borderRadius:14, background:color+'14', border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={20} color={color}/></div>
                <span style={{ fontSize:13, fontWeight:700, color:DS.text, textAlign:'center' }}>{label}</span>
              </Link>
            ))}
          </div>
          <div style={{ padding:'0 20px 20px' }}>
            <div style={{ background:`linear-gradient(135deg,${DS.primaryLight},#FDF0E6)`, border:`1px solid ${DS.primaryBorder}`, borderRadius:16, padding:'20px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div>
                <p className="prds" style={{ fontSize:16, fontWeight:700, color:DS.text, marginBottom:4 }}>{t('ctaTitle')}</p>
                <p style={{ fontSize:13, color:DS.textSub }}>{t('ctaSubtitle')}</p>
              </div>
              <Link to="/glass-cards" style={{ display:'flex', alignItems:'center', gap:6, background:DS.primary, color:'#fff', padding:'10px 18px', borderRadius:12, fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap', boxShadow:DS.shadowMd }}>
                <Home size={13}/> {t('browseProperties')}
              </Link>
            </div>
          </div>
        </div>

        <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:20, boxShadow:DS.shadow, overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${DS.border}` }}>
            <h2 className="prds" style={{ fontSize:18, fontWeight:700, color:DS.text }}>Recent Activity</h2>
          </div>
          <div style={{ padding:'12px 16px' }}>
            {recentActivity.map(({id,action,time,icon:Icon,color}) => (
              <div key={id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px', borderRadius:14, marginBottom:8, background:DS.bg, border:`1px solid ${DS.border}` }}>
                <div style={{ width:36, height:36, borderRadius:10, background:color+'14', border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color={color}/>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:DS.text, lineHeight:1.4 }}>{action}</p>
                  <p style={{ fontSize:11, color:DS.textMuted, marginTop:4, display:'flex', alignItems:'center', gap:4 }}><Clock size={10}/>{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ user:authUser, updateUser, t }) => {
  const [tab,     setTab]    = useState('profile');
  const [form,    setForm]   = useState({ name:authUser?.name||'', email:authUser?.email||'', phone:authUser?.phone||'', city:authUser?.city||'', state:authUser?.state||'', address:authUser?.address||'' });
  const [pwd,     setPwd]    = useState({ current:'', next:'', confirm:'' });
  const [notifs,  setNotifs] = useState({ email:true, sms:false, push:true, newProperties:true, priceAlerts:true, tourReminders:true });
  const [saving,  setSaving] = useState(false);
  const [success, setSuccess]= useState(false);
  const [err,     setErr]    = useState('');
  const [preview, setPreview]= useState(authUser?.profileImage||null);
  const fileRef = useRef();

  const NLABELS = { email:t('email'), sms:'SMS', push:'Push Notifications', newProperties:t('properties'), priceAlerts:`${t('price')} Alerts`, tourReminders:`${t('tours')} Reminders` };
  const TABS    = [{ id:'profile', label:'Profile', icon:Users }, { id:'security', label:'Security', icon:Shield }, { id:'notifications', label:'Notifications', icon:Bell }];

  const save = async () => {
    setSaving(true); setErr('');
    try { updateUser({...form,profileImage:preview}); setSaving(false); setSuccess(true); setTimeout(()=>setSuccess(false),2500); }
    catch { setErr(t('errorMsg')); setSaving(false); }
  };

  const changePwd = async () => {
    setErr('');
    if (pwd.next!==pwd.confirm){setErr(`${t('confirmPassword')} match nathi!`);return;}
    if (pwd.next.length<6){setErr('Min 6 characters.');return;}
    setSaving(true);
    try {
      const token=localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/change-password',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({currentPassword:pwd.current,newPassword:pwd.next})});
      setPwd({current:'',next:'',confirm:''}); setSaving(false); setSuccess(true); setTimeout(()=>setSuccess(false),2500);
    } catch { setErr(t('errorMsg')); setSaving(false); }
  };

  return (
    <div className="prd-fade">
      <h1 className="prds" style={{ fontSize:28, fontWeight:700, color:DS.text, marginBottom:6 }}>{t('myAccount')} Settings</h1>
      <p style={{ color:DS.textSub, fontSize:15, marginBottom:28 }}>Manage your profile and notification preferences</p>
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>
        <div>
          <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:20, textAlign:'center', marginBottom:12, boxShadow:DS.shadow }}>
            <div style={{ position:'relative', display:'inline-block', marginBottom:12 }}>
              {preview
                ? <img src={preview} alt="" style={{ width:76, height:76, borderRadius:16, objectFit:'cover', border:`2px solid ${DS.primaryBorder}` }}/>
                : <div style={{ width:76, height:76, borderRadius:16, background:DS.primaryLight, border:`2px solid ${DS.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}><span className="prds" style={{ fontSize:28, fontWeight:700, color:DS.primary }}>{form.name?.[0]?.toUpperCase()||'U'}</span></div>}
              <button onClick={()=>fileRef.current?.click()} style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:9, background:DS.primary, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Camera size={13} color="#fff"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onloadend=()=>setPreview(r.result);r.readAsDataURL(f);}}}/>
            </div>
            <p style={{ fontWeight:700, fontSize:14, color:DS.text, marginBottom:6 }}>{form.name||'User'}</p>
            <Badge color="terra">Property Seeker</Badge>
          </div>
          <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:8, boxShadow:DS.shadow }}>
            {TABS.map(({id,label,icon:Icon})=>(
              <button key={id} onClick={()=>setTab(id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', marginBottom:2, background:tab===id?DS.primaryLight:'transparent', color:tab===id?DS.primary:DS.textSub, fontWeight:tab===id?700:500, fontSize:13, textAlign:'left', borderLeft:tab===id?`3px solid ${DS.primary}`:'3px solid transparent' }}>
                <Icon size={14}/> {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:28, boxShadow:DS.shadow }}>
          {success && <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#15803D', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:14 }}><CheckCircle size={15}/> {t('successMsg')}</div>}
          {err     && <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#B91C1C', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:14 }}><AlertCircle size={15}/> {err}</div>}

          {tab==='profile' && <>
            <h3 className="prds" style={{ fontSize:18, color:DS.text, marginBottom:20 }}>Profile Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FieldInput label={t('fullName')}    value={form.name}   onChange={e=>setForm({...form,name:e.target.value})}   placeholder={t('fullName')}/>
              <FieldInput label={t('email')}        value={form.email}  disabled/>
              <FieldInput label={t('phoneNumber')}  value={form.phone}  onChange={e=>setForm({...form,phone:e.target.value})}  placeholder="+91 98765 43210"/>
              <FieldInput label={t('city')}         value={form.city}   onChange={e=>setForm({...form,city:e.target.value})}   placeholder={t('city')}/>
              <FieldInput label={t('state')}        value={form.state}  onChange={e=>setForm({...form,state:e.target.value})}  placeholder={t('state')}/>
              <FieldInput label="Role" value="User" disabled/>
            </div>
            <div style={{ marginTop:14 }}><FieldInput label={t('address')} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder={t('address')}/></div>
          </>}

          {tab==='security' && <>
            <h3 className="prds" style={{ fontSize:18, color:DS.text, marginBottom:20 }}>Security Settings</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:380 }}>
              <FieldInput label={`Current ${t('password')}`} type="password" value={pwd.current} onChange={e=>setPwd({...pwd,current:e.target.value})} placeholder="••••••••"/>
              <FieldInput label={`New ${t('password')}`}     type="password" value={pwd.next}    onChange={e=>setPwd({...pwd,next:e.target.value})}    placeholder="••••••••"/>
              <FieldInput label={t('confirmPassword')}       type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd,confirm:e.target.value})} placeholder="••••••••"/>
              <button onClick={changePwd} disabled={saving} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#B91C1C', padding:'9px 18px', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                <Shield size={14}/>{saving?t('loading'):`Change ${t('password')}`}
              </button>
            </div>
          </>}

          {tab==='notifications' && <>
            <h3 className="prds" style={{ fontSize:18, color:DS.text, marginBottom:20 }}>Notifications</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {Object.entries(notifs).map(([key,val])=>(
                <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12 }}>
                  <div>
                    <p style={{ fontWeight:600, color:DS.text, fontSize:14 }}>{NLABELS[key]||key}</p>
                    <p style={{ color:DS.textMuted, fontSize:12, marginTop:2 }}>Receive {(NLABELS[key]||key).toLowerCase()}</p>
                  </div>
                  <Toggle value={val} onChange={()=>setNotifs({...notifs,[key]:!val})}/>
                </div>
              ))}
            </div>
          </>}

          {tab!=='security' && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24, paddingTop:18, borderTop:`1px solid ${DS.border}` }}>
              <button onClick={save} disabled={saving} style={{ display:'flex', alignItems:'center', gap:8, background:DS.primary, color:'#fff', padding:'10px 22px', borderRadius:12, fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>
                {saving?<><Loader2 size={14} className="prd-spin"/> {t('loading')}</>:<><Save size={14}/> {t('save')}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PublicUserDashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const { t }                        = useLanguage();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [mob,  setMob]  = useState(false);
  const onLogout = () => { logout(); navigate('/auth'); };

  return (
    <div className="prd" style={{ minHeight:'100vh', background:DS.bg, display:'flex' }}>
      <style>{CSS}</style>
      <div style={{ width:240, flexShrink:0 }}>
        <Sidebar activeView={view} setView={setView} user={user} onLogout={onLogout} navigate={navigate} t={t}/>
      </div>
      {mob && (
        <div style={{ position:'fixed', inset:0, zIndex:40, display:'flex' }}>
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)' }} onClick={()=>setMob(false)}/>
          <div style={{ position:'relative', zIndex:50, width:240 }}>
            <button onClick={()=>setMob(false)} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', color:DS.textMuted }}><X size={18}/></button>
            <Sidebar activeView={view} setView={v=>{setView(v);setMob(false);}} user={user} onLogout={onLogout} navigate={navigate} t={t}/>
          </div>
        </div>
      )}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <header style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 24px', background:DS.sidebar, borderBottom:`1px solid ${DS.border}`, position:'sticky', top:0, zIndex:10 }}>
          <button onClick={()=>setMob(true)} style={{ background:'none', border:'none', cursor:'pointer', color:DS.textSub }}><Menu size={20}/></button>
          <span className="prds" style={{ fontSize:15, fontWeight:700, color:DS.text }}>Rudra</span>
          <span style={{ flex:1 }}/>
          {view!=='settings'
            ? <button onClick={()=>setView('settings')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${DS.border}`, color:DS.textSub, padding:'6px 12px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}><Settings size={13}/> Settings</button>
            : <button onClick={()=>setView('dashboard')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${DS.border}`, color:DS.textSub, padding:'6px 12px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>← {t('dashboard')}</button>}
        </header>
        <main style={{ flex:1, padding:'32px 36px', maxWidth:1200, width:'100%' }}>
          {view==='settings'
            ? <SettingsView user={user} updateUser={updateUser} t={t}/>
            : <DashboardView user={user} setView={setView} navigate={navigate} t={t}/>}
        </main>
      </div>
    </div>
  );
};

export default PublicUserDashboard;
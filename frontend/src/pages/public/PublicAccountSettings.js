import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../utils/AuthContext';
import PublicLayout from './PublicLayout';
import { useLanguage } from '../../utils/LanguageContext';
import { User, Shield, Bell, Camera, Save, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
};

const FieldInput = ({ label, disabled, textarea, rows=3, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:DS.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{label}</label>}
    {textarea
      ? <textarea {...props} rows={rows} disabled={disabled} style={{ width:'100%', background:disabled?'#F5F0EB':DS.card, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', fontSize:14, color:disabled?DS.textMuted:DS.text, resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
      : <input {...props} disabled={disabled} style={{ width:'100%', background:disabled?'#F5F0EB':DS.card, border:`1px solid ${DS.border}`, borderRadius:10, padding:'9px 12px', fontSize:14, color:disabled?DS.textMuted:DS.text, cursor:disabled?'not-allowed':'text', outline:'none', boxSizing:'border-box' }}/>}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{ position:'relative', width:44, height:24, borderRadius:12, background:value?DS.primary:DS.border, border:'none', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ position:'absolute', top:3, left:value?23:3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s' }}/>
  </button>
);

const PublicAccountSettings = () => {
  const { user, updateUser } = useAuth();
  const { t }                = useLanguage();
  const fileRef              = useRef();

  const [tab,     setTab]     = useState('profile');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [err,     setErr]     = useState('');
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({ name:'', email:'', phone:'', city:'', state:'', address:'', role:'' });
  const [pwd,  setPwd]  = useState({ current:'', next:'', confirm:'' });
  const [notifs, setNotifs] = useState({
    email:true, sms:false, push:true, newProperties:true, priceAlerts:true, tourReminders:true
  });

  const NLABELS = {
    email:t('email'), sms:'SMS', push:'Push Notifications',
    newProperties:t('properties'), priceAlerts:`${t('price')} Alerts`, tourReminders:`${t('tours')} Reminders`
  };

  const TABS = [
    { id:'profile',       label:'Profile',       icon:User   },
    { id:'security',      label:'Security',      icon:Shield },
    { id:'notifications', label:'Notifications', icon:Bell   },
  ];

  useEffect(() => {
    if (user) {
      setForm({ name:user.name||'', email:user.email||'', phone:user.phone||'', city:user.city||'', state:user.state||'', address:user.address||'', role:user.role||'' });
      if (user.profileImage) setPreview(user.profileImage);
    }
  }, [user]);

  const showSuccess = () => { setSuccess(true); setTimeout(() => setSuccess(false), 2500); };

  const save = async () => {
    setSaving(true); setErr('');
    try { updateUser({...form, profileImage:preview}); showSuccess(); }
    catch { setErr(t('errorMsg')); }
    finally { setSaving(false); }
  };

  const changePwd = async () => {
    setErr('');
    if (pwd.next!==pwd.confirm) { setErr(`${t('confirmPassword')} match nathi!`); return; }
    if (pwd.next.length<6)      { setErr('Min 6 characters required.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password',{
        method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({currentPassword:pwd.current,newPassword:pwd.next}),
      });
      if (!res.ok) throw new Error('Failed');
      setPwd({current:'',next:'',confirm:''}); showSuccess();
    } catch { setErr(t('errorMsg')); }
    finally { setSaving(false); }
  };

  return (
    <PublicLayout>
      <div style={{ padding:'32px 36px', maxWidth:1000, width:'100%', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
        <h1 style={{ fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:DS.text, marginBottom:4 }}>
          {t('myAccount')} Settings
        </h1>
        <p style={{ color:DS.textSub, fontSize:15, marginBottom:28 }}>Manage your profile and preferences</p>

        <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20, alignItems:'start' }}>
          <div>
            <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:20, textAlign:'center', marginBottom:12, boxShadow:'0 1px 3px rgba(26,8,0,0.05)' }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:12 }}>
                {preview
                  ? <img src={preview} alt="" style={{ width:76, height:76, borderRadius:16, objectFit:'cover', border:`2px solid ${DS.primaryBorder}` }}/>
                  : <div style={{ width:76, height:76, borderRadius:16, background:DS.primaryLight, border:`2px solid ${DS.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontFamily:'Georgia, serif', fontSize:28, fontWeight:700, color:DS.primary }}>{form.name?.[0]?.toUpperCase()||'U'}</span>
                    </div>}
                <button onClick={() => fileRef.current?.click()}
                  style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:9, background:DS.primary, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Camera size={13} color="#fff"/>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader();r.onloadend=()=>setPreview(r.result);r.readAsDataURL(f);} }}/>
              </div>
              <p style={{ fontWeight:700, fontSize:14, color:DS.text, marginBottom:4 }}>{form.name||'User'}</p>
              <span style={{ background:DS.primaryLight, color:DS.primary, border:`1px solid ${DS.primaryBorder}`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>
                Property Seeker
              </span>
            </div>
            <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:8, boxShadow:'0 1px 3px rgba(26,8,0,0.05)' }}>
              {TABS.map(({id,label,icon:Icon}) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', marginBottom:2, background:tab===id?DS.primaryLight:'transparent', color:tab===id?DS.primary:DS.textSub, fontWeight:tab===id?700:500, fontSize:13, textAlign:'left', borderLeft:tab===id?`3px solid ${DS.primary}`:'3px solid transparent' }}>
                  <Icon size={14}/> {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:16, padding:28, boxShadow:'0 1px 3px rgba(26,8,0,0.05)' }}>
            {success && <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#15803D', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:14 }}><CheckCircle size={15}/> {t('successMsg')}</div>}
            {err     && <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#B91C1C', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:14 }}><AlertCircle size={15}/> {err}</div>}

            {tab==='profile' && (
              <>
                <h3 style={{ fontFamily:'Georgia, serif', fontSize:18, color:DS.text, marginBottom:20 }}>Profile Information</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <FieldInput label={t('fullName')}   value={form.name}   onChange={e=>setForm({...form,name:e.target.value})}   placeholder={t('fullName')}/>
                  <FieldInput label={t('email')}       value={form.email}  disabled/>
                  <FieldInput label={t('phoneNumber')} value={form.phone}  onChange={e=>setForm({...form,phone:e.target.value})}  placeholder="+91 98765 43210"/>
                  <FieldInput label={t('city')}        value={form.city}   onChange={e=>setForm({...form,city:e.target.value})}   placeholder={t('city')}/>
                  <FieldInput label={t('state')}       value={form.state}  onChange={e=>setForm({...form,state:e.target.value})}  placeholder={t('state')}/>
                  <FieldInput label="Role"             value={form.role||'USER'} disabled/>
                </div>
                <div style={{ marginTop:14 }}>
                  <FieldInput label={t('address')}     value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder={t('address')}/>
                </div>
              </>
            )}

            {tab==='security' && (
              <>
                <h3 style={{ fontFamily:'Georgia, serif', fontSize:18, color:DS.text, marginBottom:20 }}>Security Settings</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:380 }}>
                  <FieldInput label={`Current ${t('password')}`} type="password" value={pwd.current} onChange={e=>setPwd({...pwd,current:e.target.value})} placeholder="••••••••"/>
                  <FieldInput label={`New ${t('password')}`}     type="password" value={pwd.next}    onChange={e=>setPwd({...pwd,next:e.target.value})}    placeholder="••••••••"/>
                  <FieldInput label={t('confirmPassword')}       type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd,confirm:e.target.value})} placeholder="••••••••"/>
                  <button onClick={changePwd} disabled={saving}
                    style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#B91C1C', padding:'9px 18px', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', opacity:saving?0.6:1 }}>
                    <Lock size={14}/>{saving?t('loading'):`Change ${t('password')}`}
                  </button>
                </div>
              </>
            )}

            {tab==='notifications' && (
              <>
                <h3 style={{ fontFamily:'Georgia, serif', fontSize:18, color:DS.text, marginBottom:20 }}>Notifications</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {Object.entries(notifs).map(([key,val]) => (
                    <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12 }}>
                      <div>
                        <p style={{ fontWeight:600, color:DS.text, fontSize:14 }}>{NLABELS[key]||key}</p>
                        <p style={{ color:DS.textMuted, fontSize:12, marginTop:2 }}>Receive {(NLABELS[key]||key).toLowerCase()}</p>
                      </div>
                      <Toggle value={val} onChange={() => setNotifs({...notifs,[key]:!val})}/>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab!=='security' && (
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24, paddingTop:18, borderTop:`1px solid ${DS.border}` }}>
                <button onClick={save} disabled={saving}
                  style={{ display:'flex', alignItems:'center', gap:8, background:DS.primary, color:'#fff', padding:'10px 22px', borderRadius:12, fontWeight:700, fontSize:14, border:'none', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                  {saving?<><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> {t('loading')}</>:<><Save size={14}/> {t('save')}</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </PublicLayout>
  );
};

export default PublicAccountSettings;
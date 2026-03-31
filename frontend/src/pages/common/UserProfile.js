import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, Camera, Save, CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

/* ─── Design System ──────────────────────────────────────────────── */
const DS = {
  bg:           '#F9F6F2',
  card:         '#FFFFFF',
  border:       '#EDE8E3',
  primary:      '#C84B00',
  primaryLight: '#FEF3EE',
  primaryBorder:'rgba(200,75,0,0.18)',
  text:         '#1A0800',
  textSub:      '#6B5748',
  textMuted:    '#9C8B7A',
  serif:        "Georgia, 'Times New Roman', serif",
  sans:         "'DM Sans', system-ui, sans-serif",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  .up-root { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }
  .up-root * { box-sizing: border-box; }
  .up-input { width:100%; background:#fff; border:1px solid #EDE8E3; border-radius:10px; padding:9px 12px; font-size:14px; color:#1A0800; outline:none; transition:border-color 0.15s, box-shadow 0.15s; font-family:inherit; }
  .up-input:focus { border-color:#C84B00; box-shadow:0 0 0 3px rgba(200,75,0,0.10); }
  .up-input:disabled { background:#F5F0EB; color:#9C8B7A; cursor:not-allowed; }
  .up-tab { width:100%; display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:12px; border:none; cursor:pointer; font-size:14px; font-weight:500; text-align:left; transition:all 0.15s; }
  @keyframes up-fade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .up-fade { animation: up-fade 0.28s ease forwards; }
  @keyframes up-spin { to{transform:rotate(360deg)} }
  .up-spin { animation: up-spin 1s linear infinite; }
`;

const Label = ({ children }) => (
  <label style={{ display:'block', fontSize:11, fontWeight:700, color:DS.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
    {children}
  </label>
);

const Field = ({ label, disabled, textarea, rows=3, ...props }) => (
  <div>
    {label && <Label>{label}</Label>}
    {textarea
      ? <textarea className="up-input" rows={rows} disabled={disabled} {...props}
          style={{ resize:'vertical', fontFamily:'inherit' }} />
      : <input className="up-input" disabled={disabled} {...props} />}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange}
    style={{ position:'relative', width:44, height:24, borderRadius:12, background: value ? DS.primary : DS.border, border:'none', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ position:'absolute', top:3, left: value ? 23 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s' }} />
  </button>
);

const Alert = ({ type, children }) => {
  const styles = {
    success: { bg:'#F0FDF4', border:'#BBF7D0', color:'#15803D', Icon: CheckCircle },
    error:   { bg:'#FEF2F2', border:'#FECACA', color:'#B91C1C', Icon: AlertCircle },
  };
  const { bg, border, color, Icon } = styles[type];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:bg, border:`1px solid ${border}`, color, borderRadius:12, padding:'10px 14px', fontSize:14, marginBottom:20 }}>
      <Icon size={15} />{children}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const UserProfile = () => {
  // Read user from localStorage directly (most reliable)
  const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  };

  const [tab, setTab]         = useState('profile');
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef               = useRef();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', state: '', address: '', bio: '', role: '',
  });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  const [notifs, setNotifs] = useState(() => {
    // Load from localStorage so notifications persist
    try {
      const saved = localStorage.getItem('rudra_notif_prefs');
      return saved ? JSON.parse(saved) : {
        emailAlerts: true, smsAlerts: false, pushNotifications: true,
        newProperties: true, enquiries: true, legalUpdates: false,
      };
    } catch { return { emailAlerts: true, smsAlerts: false, pushNotifications: true, newProperties: true, enquiries: true, legalUpdates: false }; }
  });

  // Load user on mount
  useEffect(() => {
    const u = getStoredUser();
    setForm({
      name:    u.name    || '',
      email:   u.email   || '',
      phone:   u.phone   || '',
      city:    u.city    || '',
      state:   u.state   || '',
      address: u.address || '',
      bio:     u.bio     || '',
      role:    u.role    || '',
    });
    if (u.profileImage) setPreview(u.profileImage);
  }, []);

  // Also try fetching fresh data from backend on mount
  useEffect(() => {
    authAPI.getCurrentUser().then(res => {
      const u = res.data?.user || res.data;
      if (!u) return;
      setForm({
        name:    u.name    || '',
        email:   u.email   || '',
        phone:   u.phone   || '',
        city:    u.city    || '',
        state:   u.state   || '',
        address: u.address || '',
        bio:     u.bio     || '',
        role:    u.role    || '',
      });
      if (u.profileImage) setPreview(u.profileImage);
      // Update localStorage with fresh server data
      const stored = getStoredUser();
      localStorage.setItem('user', JSON.stringify({ ...stored, ...u }));
    }).catch(() => {}); // silently fail — localStorage fallback above
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg); setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  /* ── Save Profile ─────────────────────────────────────────────── */
  const saveProfile = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = { ...form, profileImage: preview };
      const res = await authAPI.updateProfile(payload);
      const updated = res.data?.user || res.data || payload;

      // Update localStorage so it persists after logout/re-login
      const stored = getStoredUser();
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updated, profileImage: preview }));

      showSuccess('Profile saved successfully!');
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || 'Save failed. Please try again.');
    } finally { setSaving(false); }
  };

  /* ── Change Password ──────────────────────────────────────────── */
  const changePassword = async () => {
    setError(''); setSuccess('');
    if (!pwd.current)              { setError('Current password nakho.'); return; }
    if (pwd.next !== pwd.confirm)  { setError('New passwords match nathi!'); return; }
    if (pwd.next.length < 6)       { setError('Min 6 characters required.'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      showSuccess('Password changed successfully!');
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || 'Password change failed.');
    } finally { setSaving(false); }
  };

  /* ── Save Notifications ───────────────────────────────────────── */
  const saveNotifs = () => {
    localStorage.setItem('rudra_notif_prefs', JSON.stringify(notifs));
    showSuccess('Notification preferences saved!');
  };

  const getInitials = () => {
    if (!form.name) return 'U';
    const parts = form.name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const TABS = [
    { id: 'profile',       label: 'Profile',       icon: User   },
    { id: 'security',      label: 'Security',       icon: Shield },
    { id: 'notifications', label: 'Notifications',  icon: Bell   },
  ];

  const NLABELS = {
    emailAlerts:       'Email Alerts',
    smsAlerts:         'SMS Alerts',
    pushNotifications: 'Push Notifications',
    newProperties:     'New Properties',
    enquiries:         'Enquiries',
    legalUpdates:      'Legal Updates',
  };

  return (
    <div className="up-root" style={{ minHeight:'100vh', background:DS.bg, padding:'40px 20px' }}>
      <style>{CSS}</style>

      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:DS.serif, fontSize:32, fontWeight:700, color:DS.text, marginBottom:4 }}>Account Settings</h1>
          <p style={{ color:DS.textSub, fontSize:15 }}>Manage your profile and preferences</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20, alignItems:'start' }}>

          {/* ── Left Panel ──────────────────────────────────── */}
          <div>
            {/* Avatar card */}
            <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:20, padding:24, textAlign:'center', marginBottom:12 }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
                {preview ? (
                  <img src={preview} alt="Profile"
                    style={{ width:88, height:88, borderRadius:20, objectFit:'cover', border:`2px solid ${DS.primaryBorder}` }} />
                ) : (
                  <div style={{ width:88, height:88, borderRadius:20, background:DS.primaryLight, border:`2px solid ${DS.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:DS.serif, fontSize:32, fontWeight:700, color:DS.primary }}>{getInitials()}</span>
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()}
                  style={{ position:'absolute', bottom:-6, right:-6, width:30, height:30, borderRadius:10, background:DS.primary, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Camera size={14} color="#fff" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) { const r = new FileReader(); r.onloadend = () => setPreview(r.result); r.readAsDataURL(f); }
                  }} />
              </div>
              <p style={{ fontFamily:DS.serif, fontSize:16, fontWeight:700, color:DS.text, marginBottom:4 }}>{form.name || 'User'}</p>
              <span style={{ background:DS.primaryLight, color:DS.primary, border:`1px solid ${DS.primaryBorder}`, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>
                {form.role || 'USER'}
              </span>
            </div>

            {/* Tab pills */}
            <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:20, padding:10 }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} className="up-tab" onClick={() => { setTab(id); setError(''); setSuccess(''); }}
                  style={{ background: tab === id ? DS.primaryLight : 'transparent', color: tab === id ? DS.primary : DS.textSub, fontWeight: tab === id ? 700 : 500, borderLeft: tab === id ? `3px solid ${DS.primary}` : '3px solid transparent', marginBottom:4 }}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Panel ─────────────────────────────────── */}
          <div className="up-fade" key={tab} style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:20, padding:32 }}>

            {success && <Alert type="success">{success}</Alert>}
            {error   && <Alert type="error">{error}</Alert>}

            {/* ── Profile Tab ───────────────────────────────── */}
            {tab === 'profile' && (
              <>
                <h2 style={{ fontFamily:DS.serif, fontSize:22, fontWeight:700, color:DS.text, marginBottom:24 }}>Profile Information</h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <Field label="Full Name"  value={form.name}    onChange={e => setForm({...form, name:e.target.value})}    placeholder="Full name" />
                  <Field label="Email"      value={form.email}   disabled />
                  <Field label="Phone"      value={form.phone}   onChange={e => setForm({...form, phone:e.target.value})}   placeholder="+91 98765 43210" type="tel" />
                  <Field label="City"       value={form.city}    onChange={e => setForm({...form, city:e.target.value})}    placeholder="City" />
                  <Field label="State"      value={form.state}   onChange={e => setForm({...form, state:e.target.value})}   placeholder="State" />
                  <Field label="Role"       value={form.role}    disabled />
                  <div style={{ gridColumn:'span 2' }}>
                    <Field label="Address"  value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Full address" />
                  </div>
                  <div style={{ gridColumn:'span 2' }}>
                    <Field label="Bio" textarea value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:28, paddingTop:20, borderTop:`1px solid ${DS.border}` }}>
                  <button onClick={saveProfile} disabled={saving}
                    style={{ display:'flex', alignItems:'center', gap:8, background:DS.primary, color:'#fff', padding:'11px 24px', borderRadius:14, fontWeight:700, fontSize:14, border:'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? <><Loader2 size={15} className="up-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              </>
            )}

            {/* ── Security Tab ──────────────────────────────── */}
            {tab === 'security' && (
              <>
                <h2 style={{ fontFamily:DS.serif, fontSize:22, fontWeight:700, color:DS.text, marginBottom:24 }}>Security Settings</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:380 }}>
                  <Field label="Current Password" type="password" value={pwd.current}  onChange={e => setPwd({...pwd, current:e.target.value})}  placeholder="••••••••" />
                  <Field label="New Password"     type="password" value={pwd.next}     onChange={e => setPwd({...pwd, next:e.target.value})}     placeholder="••••••••" />
                  <Field label="Confirm Password" type="password" value={pwd.confirm}  onChange={e => setPwd({...pwd, confirm:e.target.value})}  placeholder="••••••••" />
                  <button onClick={changePassword} disabled={saving}
                    style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#B91C1C', padding:'9px 18px', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
                    <Lock size={14} />{saving ? 'Changing…' : 'Change Password'}
                  </button>
                </div>

                <div style={{ marginTop:28, padding:20, background:DS.bg, borderRadius:16, border:`1px solid ${DS.border}` }}>
                  <p style={{ fontWeight:700, color:DS.text, marginBottom:4, fontSize:14 }}>Two-Factor Authentication</p>
                  <p style={{ color:DS.textMuted, fontSize:13, marginBottom:14 }}>Add an extra layer of security to your account</p>
                  <button style={{ display:'flex', alignItems:'center', gap:8, background:DS.primaryLight, border:`1px solid ${DS.primaryBorder}`, color:DS.primary, padding:'9px 18px', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    <Shield size={14} /> Enable 2FA
                  </button>
                </div>
              </>
            )}

            {/* ── Notifications Tab ─────────────────────────── */}
            {tab === 'notifications' && (
              <>
                <h2 style={{ fontFamily:DS.serif, fontSize:22, fontWeight:700, color:DS.text, marginBottom:24 }}>Notification Preferences</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {Object.entries(notifs).map(([key, val]) => (
                    <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:14 }}>
                      <div>
                        <p style={{ fontWeight:600, color:DS.text, fontSize:14 }}>{NLABELS[key] || key}</p>
                        <p style={{ color:DS.textMuted, fontSize:12, marginTop:2 }}>Receive {(NLABELS[key] || key).toLowerCase()}</p>
                      </div>
                      <Toggle value={val} onChange={() => setNotifs({...notifs, [key]: !val})} />
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:28, paddingTop:20, borderTop:`1px solid ${DS.border}` }}>
                  <button onClick={saveNotifs}
                    style={{ display:'flex', alignItems:'center', gap:8, background:DS.primary, color:'#fff', padding:'11px 24px', borderRadius:14, fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>
                    <Save size={15} /> Save Preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
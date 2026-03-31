import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI, propertyAPI, enquiryAPI, legalAPI } from '../../services/api';
import {
  LayoutDashboard, Users, Building2, FileText, TrendingUp,
  Settings, LogOut, Menu, X, Camera, Save, CheckCircle,
  Shield, Bell, ChevronRight, Loader2, Activity, BarChart2
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   SHARED DESIGN SYSTEM
   ═══════════════════════════════════════════════ */
export const DS = {
  bg:            '#F9F6F2',
  sidebar:       '#FFFFFF',
  card:          '#FFFFFF',
  border:        '#EDE8E3',
  primary:       '#C84B00',
  primaryLight:  '#FEF3EE',
  primaryBorder: 'rgba(200,75,0,0.18)',
  text:          '#1A0800',
  textSub:       '#6B5748',
  textMuted:     '#9C8B7A',
  shadow:        '0 1px 3px rgba(26,8,0,0.05), 0 4px 14px rgba(26,8,0,0.04)',
  shadowMd:      '0 4px 20px rgba(200,75,0,0.10), 0 1px 4px rgba(26,8,0,0.06)',
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  .rd  { font-family: 'DM Sans', system-ui, sans-serif; }
  .rd * { box-sizing: border-box; margin: 0; padding: 0; }
  .rds { font-family: Georgia, 'Times New Roman', serif; }
  .rd-hover { transition: all 0.18s ease; }
  .rd-hover:hover { box-shadow: 0 6px 24px rgba(200,75,0,0.13); transform: translateY(-1px); }
  .rd-in { transition: border-color 0.15s, box-shadow 0.15s; }
  .rd-in:focus { outline: none; border-color: #C84B00 !important; box-shadow: 0 0 0 3px rgba(200,75,0,0.1) !important; }
  .rd-nav { transition: all 0.15s ease; }
  .rd-nav:hover { background: #FEF3EE !important; color: #C84B00 !important; }
  @keyframes rd-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .rd-fade { animation: rd-fade 0.35s ease forwards; }
  @keyframes rd-spin { to{transform:rotate(360deg)} }
  .rd-spin { animation: rd-spin 1s linear infinite; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: #EDE8E3; border-radius: 4px; }
`;

/* ═══════════════════
   SHARED COMPONENTS
   ═══════════════════ */
export const Badge = ({ color = 'gray', children }) => {
  const map = {
    red:    '#FEF2F2,#B91C1C,#FECACA', blue:  '#EFF6FF,#1D4ED8,#BFDBFE',
    green:  '#F0FDF4,#15803D,#BBF7D0', amber: '#FFFBEB,#B45309,#FDE68A',
    violet: '#F5F3FF,#6D28D9,#DDD6FE', gray:  '#F9FAFB,#374151,#E5E7EB',
    terra:  `${DS.primaryLight},${DS.primary},${DS.primaryBorder}`,
    sky:    '#F0F9FF,#0369A1,#BAE6FD',
  };
  const [bg, text, border] = (map[color] || map.gray).split(',');
  return <span style={{ background: bg, color: text, border: `1px solid ${border}`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{children}</span>;
};

export const FieldInput = ({ label, icon: Icon, disabled, textarea, rows = 3, ...props }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {Icon && !textarea && <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: DS.textMuted, pointerEvents: 'none' }} />}
      {textarea
        ? <textarea className="rd-in" {...props} rows={rows} disabled={disabled}
            style={{ width: '100%', background: disabled ? '#F5F0EB' : DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 14, color: disabled ? DS.textMuted : DS.text, resize: 'vertical', fontFamily: 'inherit' }} />
        : <input className="rd-in" {...props} disabled={disabled}
            style={{ width: '100%', background: disabled ? '#F5F0EB' : DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: `9px 12px 9px ${Icon ? 36 : 12}px`, fontSize: 14, color: disabled ? DS.textMuted : DS.text, cursor: disabled ? 'not-allowed' : 'text' }} />}
    </div>
  </div>
);

export const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, background: value ? DS.primary : DS.border, border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
  </button>
);

export const StatCard = ({ icon: Icon, label, value, sub, color = DS.primary, onClick }) => (
  <div onClick={onClick} className="rd-hover" style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: '20px 22px', cursor: onClick ? 'pointer' : 'default', boxShadow: DS.shadow }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      {sub && <span style={{ fontSize: 11, color: DS.textMuted, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 20, padding: '2px 8px' }}>{sub}</span>}
    </div>
    <p className="rds" style={{ fontSize: 30, fontWeight: 700, color: DS.text, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 13, color: DS.textSub, marginTop: 5 }}>{label}</p>
  </div>
);

export const AvatarUpload = ({ preview, setPreview, name, roleLabel, roleBadgeColor = 'terra' }) => {
  const ref = useRef();
  return (
    <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 12, boxShadow: DS.shadow }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
        {preview
          ? <img src={preview} alt="" style={{ width: 76, height: 76, borderRadius: 16, objectFit: 'cover', border: `2px solid ${DS.primaryBorder}` }} />
          : <div style={{ width: 76, height: 76, borderRadius: 16, background: DS.primaryLight, border: `2px solid ${DS.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="rds" style={{ fontSize: 28, fontWeight: 700, color: DS.primary }}>{name?.[0]?.toUpperCase() || '?'}</span>
            </div>}
        <button onClick={() => ref.current?.click()} style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 9, background: DS.primary, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Camera size={13} color="#fff" />
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => setPreview(r.result); r.readAsDataURL(f); }}} />
      </div>
      <p style={{ fontWeight: 700, fontSize: 14, color: DS.text, marginBottom: 6 }}>{name || 'User'}</p>
      <Badge color={roleBadgeColor}>{roleLabel}</Badge>
    </div>
  );
};

/* ─── ✅ FIX: SidebarShell uses navigate() instead of window.location.href ─── */
export const SidebarShell = ({ navItems, activeView, setView, user, onLogout, roleLabel, navigate }) => (
  <aside style={{ width: 240, minHeight: '100vh', background: DS.sidebar, borderRight: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 20 }}>
    {/* Logo */}
    <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${DS.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={17} color="#fff" />
        </div>
        <div>
          <p className="rds" style={{ fontSize: 15, fontWeight: 700, color: DS.text, lineHeight: 1.1 }}>Rudra</p>
          <p style={{ fontSize: 9, fontWeight: 700, color: DS.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Legal & Realty</p>
        </div>
      </div>
    </div>
    {/* Nav */}
    <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Menu</p>
      {navItems.map(({ id, label, icon: Icon, path, divider }) => {
        if (divider) return <div key={id} style={{ height: 1, background: DS.border, margin: '8px 0' }} />;
        const isActive = activeView === id;
        return (
          <button key={id}
            onClick={() => {
              if (path) {
                // ✅ FIX: navigate() use karo, window.location.href nahi
                navigate(path);
              } else {
                setView(id);
              }
            }}
            className="rd-nav"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: isActive ? DS.primaryLight : 'transparent', color: isActive ? DS.primary : DS.textSub, fontWeight: isActive ? 700 : 500, fontSize: 14, textAlign: 'left', borderLeft: isActive ? `3px solid ${DS.primary}` : '3px solid transparent' }}>
            <Icon size={16} /><span style={{ flex: 1 }}>{label}</span>{isActive && <ChevronRight size={12} />}
          </button>
        );
      })}
    </nav>
    {/* User + Logout */}
    <div style={{ borderTop: `1px solid ${DS.border}`, padding: '10px 10px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="rds" style={{ fontSize: 14, fontWeight: 700, color: DS.primary }}>{user?.name?.[0]?.toUpperCase() || '?'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
          <p style={{ fontSize: 11, color: DS.textMuted }}>{roleLabel}</p>
        </div>
      </div>
      <button onClick={onLogout} className="rd-nav"
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: 14 }}>
        <LogOut size={15} /> Logout
      </button>
    </div>
  </aside>
);

export const SettingsPanel = ({ role, extraProfileFields, notifKeys }) => {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', city: user?.city || '', state: user?.state || '', address: user?.address || '', ...( extraProfileFields || {}) });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const defaultNotifs = {};
  (notifKeys || ['emailAlerts','smsAlerts','pushNotifications','caseUpdates']).forEach(k => defaultNotifs[k] = true);
  const [notifs, setNotifs] = useState(defaultNotifs);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(user?.profileImage || null);

  const save = async () => {
    setSaving(true); setErr('');
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, profileImage: preview }),
      });
      setSaving(false); setSuccess(true); setTimeout(() => setSuccess(false), 2500);
    } catch { setErr('Save karvama error aavi. Try again.'); setSaving(false); }
  };

  const changePwd = async () => {
    setErr('');
    if (pwd.next !== pwd.confirm) { setErr('Passwords match nathi!'); return; }
    if (pwd.next.length < 6) { setErr('Minimum 6 characters joiye.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      setPwd({ current: '', next: '', confirm: '' });
      setSaving(false); setSuccess(true); setTimeout(() => setSuccess(false), 2500);
    } catch { setErr('Password change thaya nahi.'); setSaving(false); }
  };

  const TABS = [{ id: 'profile', label: 'Profile', icon: Users }, { id: 'security', label: 'Security', icon: Shield }, { id: 'notifications', label: 'Notifications', icon: Bell }];
  const NOTIF_LABELS = { emailAlerts: 'Email Alerts', smsAlerts: 'SMS Alerts', pushNotifications: 'Push Notifications', caseUpdates: 'Case Updates', legalUpdates: 'Legal Updates', clientEnquiries: 'Client Enquiries', systemUpdates: 'System Updates', securityAlerts: 'Security Alerts', newProperties: 'New Properties', priceAlerts: 'Price Alerts', tourReminders: 'Tour Reminders' };

  return (
    <div className="rd-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 className="rds" style={{ fontSize: 28, fontWeight: 700, color: DS.text }}>Account Settings</h1>
        <p style={{ color: DS.textSub, marginTop: 6, fontSize: 15 }}>Manage your profile and preferences</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        <div>
          <AvatarUpload preview={preview} setPreview={setPreview} name={form.name} roleLabel={role}
            roleBadgeColor={role === 'ADMIN' ? 'red' : role === 'BROKER' ? 'blue' : role === 'LAWYER' ? 'violet' : 'terra'} />
          <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 8, boxShadow: DS.shadow }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: tab === id ? DS.primaryLight : 'transparent', color: tab === id ? DS.primary : DS.textSub, fontWeight: tab === id ? 700 : 500, fontSize: 13, textAlign: 'left', borderLeft: tab === id ? `3px solid ${DS.primary}` : '3px solid transparent' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 28, boxShadow: DS.shadow }}>
          {success && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 14 }}><CheckCircle size={15} /> Saved successfully!</div>}
          {err && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 14 }}><Shield size={15} /> {err}</div>}

          {tab === 'profile' && (
            <>
              <h3 className="rds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Profile Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FieldInput label="Full Name"  value={form.name}    onChange={e => setForm({...form, name: e.target.value})}    placeholder="Full name" />
                <FieldInput label="Email"      value={form.email}   disabled placeholder="Email" />
                <FieldInput label="Phone"      value={form.phone}   onChange={e => setForm({...form, phone: e.target.value})}   placeholder="+91 98765 43210" />
                <FieldInput label="City"       value={form.city}    onChange={e => setForm({...form, city: e.target.value})}    placeholder="City" />
                <FieldInput label="State"      value={form.state}   onChange={e => setForm({...form, state: e.target.value})}   placeholder="State" />
                <FieldInput label="Role"       value={role}         disabled />
              </div>
              <div style={{ marginTop: 14 }}>
                <FieldInput label="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
              </div>
            </>
          )}

          {tab === 'security' && (
            <>
              <h3 className="rds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
                <FieldInput label="Current Password" type="password" value={pwd.current} onChange={e => setPwd({...pwd, current: e.target.value})} placeholder="••••••••" />
                <FieldInput label="New Password"     type="password" value={pwd.next}    onChange={e => setPwd({...pwd, next: e.target.value})}    placeholder="••••••••" />
                <FieldInput label="Confirm Password" type="password" value={pwd.confirm} onChange={e => setPwd({...pwd, confirm: e.target.value})} placeholder="••••••••" />
                <button onClick={changePwd} disabled={saving} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <Shield size={14} /> {saving ? 'Changing…' : 'Change Password'}
                </button>
              </div>
              <div style={{ marginTop: 24, padding: 20, background: DS.bg, borderRadius: 14, border: `1px solid ${DS.border}` }}>
                <p style={{ fontWeight: 700, color: DS.text, marginBottom: 4, fontSize: 14 }}>Two-Factor Authentication</p>
                <p style={{ color: DS.textMuted, fontSize: 13, marginBottom: 14 }}>Add an extra layer of security</p>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, color: DS.primary, padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Shield size={14} /> Enable 2FA
                </button>
              </div>
            </>
          )}

          {tab === 'notifications' && (
            <>
              <h3 className="rds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(notifs).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: DS.text, fontSize: 14 }}>{NOTIF_LABELS[key] || key}</p>
                      <p style={{ color: DS.textMuted, fontSize: 12, marginTop: 2 }}>Receive {(NOTIF_LABELS[key] || key).toLowerCase()}</p>
                    </div>
                    <Toggle value={val} onChange={() => setNotifs({...notifs, [key]: !val})} />
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 18, borderTop: `1px solid ${DS.border}` }}>
            <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary, color: '#fff', padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              {saving ? <><Loader2 size={14} className="rd-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── ✅ FIX: DashLayout — navigate prop pass karo SidebarShell ma ─── */
export const DashLayout = ({ navItems, activeView, setView, user, onLogout, roleLabel, children }) => {
  const navigate = useNavigate();
  const [mob, setMob] = useState(false);

  return (
    <div className="rd" style={{ minHeight: '100vh', background: DS.bg, display: 'flex' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ✅ FIX: Always show sidebar spacer — window.innerWidth check hatavyu */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <SidebarShell
          navItems={navItems} activeView={activeView} setView={setView}
          user={user} onLogout={onLogout} roleLabel={roleLabel}
          navigate={navigate}
        />
      </div>

      {/* Mobile Overlay */}
      {mob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setMob(false)} />
          <div style={{ position: 'relative', zIndex: 50, width: 240 }}>
            <button onClick={() => setMob(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted }}><X size={18} /></button>
            <SidebarShell
              navItems={navItems} activeView={activeView}
              setView={v => { setView(v); setMob(false); }}
              user={user} onLogout={onLogout} roleLabel={roleLabel}
              navigate={navigate}
            />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: DS.sidebar, borderBottom: `1px solid ${DS.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setMob(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textSub }}><Menu size={20} /></button>
          <span className="rds" style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Rudra</span>
        </header>
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1200, width: '100%' }}>{children}</main>
      </div>
    </div>
  );
};

/* ════════════════════════
   ADMIN DASHBOARD
   ════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ users: { total: 0, brokers: 0, lawyers: 0 }, properties: 0, enquiries: 0, legalRequests: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      const [ur, pr, er, lr] = await Promise.allSettled([userAPI.getAll(), propertyAPI.getAll(), enquiryAPI.getAll(), legalAPI.getAllRequests()]);
      const users = ur.status === 'fulfilled' ? ur.value.data.users || [] : [];
      setStats({ users: { total: users.length, brokers: users.filter(u => u.role === 'BROKER').length, lawyers: users.filter(u => u.role === 'LAWYER').length }, properties: pr.status === 'fulfilled' ? pr.value.data.count || 0 : 0, enquiries: er.status === 'fulfilled' ? er.value.data.count || 0 : 0, legalRequests: lr.status === 'fulfilled' ? lr.value.data.count || 0 : 0 });
      setRecentUsers(users.slice(0, 6));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'div1', divider: true },
    // ✅ FIX: path navigate() thi kaam karshe, reload nahi thase
    { id: 'users',     label: 'Users',        icon: Users,     path: '/admin/panel' },
    { id: 'props',     label: 'Properties',   icon: Building2, path: '/admin/panel' },
    { id: 'reports',   label: 'Reports',      icon: BarChart2, path: '/admin/panel' },
    { id: 'div2', divider: true },
    { id: 'settings',  label: 'Settings',     icon: Settings },
  ];

  const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/auth'); };

  return (
    <DashLayout navItems={navItems} activeView={view} setView={setView} user={user} onLogout={onLogout} roleLabel="Admin">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Loader2 size={28} color={DS.primary} className="rd-spin" /></div>
      ) : view === 'settings' ? (
        <SettingsPanel role="ADMIN" notifKeys={['emailAlerts', 'smsAlerts', 'systemUpdates', 'securityAlerts']} />
      ) : (
        <div className="rd-fade">
          <div style={{ marginBottom: 28 }}>
            <h1 className="rds" style={{ fontSize: 28, fontWeight: 700, color: DS.text }}>Admin Dashboard</h1>
            <p style={{ color: DS.textSub, marginTop: 6, fontSize: 15 }}>Platform overview & management</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon={Users}     label="Total Users"    value={stats.users.total}    sub={`${stats.users.brokers}B · ${stats.users.lawyers}L`} color="#6D28D9" />
            <StatCard icon={Building2} label="Properties"     value={stats.properties}     color={DS.primary} />
            <StatCard icon={FileText}  label="Legal Requests" value={stats.legalRequests}  color="#B45309" />
            <StatCard icon={Activity}  label="Enquiries"      value={stats.enquiries}      color="#0369A1" />
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Manage Users',   icon: Users,      path: '/admin/panel', color: '#6D28D9' },
              { label: 'All Properties', icon: Building2,  path: '/admin/panel', color: DS.primary },
              { label: 'View Reports',   icon: TrendingUp, path: '/admin/panel', color: '#0369A1' },
            ].map(({ label, icon: Icon, path, color }) => (
              <Link key={label} to={path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 14, textDecoration: 'none', color: DS.text, fontWeight: 600, fontSize: 14, boxShadow: DS.shadow }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                {label}
              </Link>
            ))}
          </div>

          {/* System Banner */}
          <div style={{ background: `linear-gradient(135deg, ${DS.primary} 0%, #8B2500 100%)`, borderRadius: 20, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <h2 className="rds" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>System Operational</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>All services running normally</p>
            <div style={{ display: 'flex', gap: 40 }}>
              {[['Total Transactions', stats.properties + stats.legalRequests], ['Active Users', stats.users.total], ['Platform Status', 'Live']].map(([l, v]) => (
                <div key={l}><p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{l}</p><p className="rds" style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{v}</p></div>
              ))}
            </div>
          </div>

          {/* Recent Users Table */}
          <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 20, boxShadow: DS.shadow, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${DS.border}` }}>
              <h2 className="rds" style={{ fontSize: 18, fontWeight: 700, color: DS.text }}>Recent Users</h2>
              <Link to="/admin/panel" style={{ fontSize: 13, color: DS.primary, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ChevronRight size={13} /></Link>
            </div>
            {recentUsers.length === 0
              ? <div style={{ padding: '48px 24px', textAlign: 'center', color: DS.textMuted, fontSize: 14 }}>No users yet</div>
              : <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: DS.bg }}>
                      {['Name', 'Email', 'Role', 'Status', 'Joined'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {recentUsers.map((u, i) => (
                        <tr key={u.id} style={{ borderTop: `1px solid ${DS.border}`, background: i % 2 === 0 ? DS.card : DS.bg }}>
                          <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: DS.text }}>{u.name}</td>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: DS.textSub }}>{u.email}</td>
                          <td style={{ padding: '12px 20px' }}><Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'BROKER' ? 'blue' : 'violet'}>{u.role}</Badge></td>
                          <td style={{ padding: '12px 20px' }}><Badge color={u.isActive ? 'green' : 'gray'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: DS.textMuted }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
          </div>
        </div>
      )}
    </DashLayout>
  );
};

export default AdminDashboard;
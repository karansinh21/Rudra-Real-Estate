// frontend/src/pages/lawyer/LawyerDashboard.jsx
// REPLACE your existing LawyerDashboard.jsx with this file
// Changes: CATEGORIES expanded from 2 → 6 (property, land, legal, business, registration, notary)
// DELETE: LawyerRequests.jsx and LawyerServices.jsx (this file handles both internally)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { legalAPI } from '../../services/api';
import {
  LayoutDashboard, FileText, Star, Settings, LogOut, Menu, X,
  Camera, Save, CheckCircle, Shield, Bell, ChevronRight,
  Loader2, AlertCircle, Clock, Scale, Plus, ArrowUpRight,
  Zap, Lock, User, Search, RefreshCw, ChevronDown, ChevronUp,
  Phone, Mail, Calendar, Home, Layers, Edit2, Trash2,
  IndianRupee, BarChart2, TreePine, BookOpen, Briefcase,
  FileSignature, Stamp, Users
} from 'lucide-react';

// ─── Design System ────────────────────────────────────────────────
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
  .lrd { font-family: 'DM Sans', system-ui, sans-serif; }
  .lrd * { box-sizing: border-box; }
  .lrds { font-family: Georgia, 'Times New Roman', serif; }
  .lrd-h { transition: all 0.18s; }
  .lrd-h:hover { box-shadow: 0 6px 24px rgba(200,75,0,0.10); transform: translateY(-1px); }
  .lrd-n { transition: all 0.15s; }
  .lrd-n:hover { background: #FEF3EE !important; color: #C84B00 !important; }
  .lrd-i { transition: border-color 0.15s, box-shadow 0.15s; }
  .lrd-i:focus { outline: none; border-color: #C84B00 !important; box-shadow: 0 0 0 3px rgba(200,75,0,0.10) !important; }
  @keyframes lrd-fade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  .lrd-fade { animation: lrd-fade 0.32s ease forwards; }
  @keyframes lrd-spin { to { transform: rotate(360deg) } }
  .lrd-spin { animation: lrd-spin 1s linear infinite; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #EDE8E3; border-radius: 4px; }
`;

// ─── ALL 6 SERVICE CATEGORIES ─────────────────────────────────────
// Based on Adv. Krunal B. Parmar business card
const CATEGORIES = [
  { id: 'property',     label: 'Property Legal',     icon: Home,          color: '#C84B00' },
  { id: 'land',         label: 'Land & Plot',         icon: TreePine,      color: '#15803D' },
  { id: 'legal',        label: 'Legal Documents',     icon: FileSignature, color: '#1D4ED8' },
  { id: 'business',     label: 'Business & Contract', icon: Briefcase,     color: '#7C3AED' },
  { id: 'registration', label: 'Registration',        icon: Users,         color: '#B45309' },
  { id: 'notary',       label: 'Notary & Stamping',   icon: Stamp,         color: '#0F766E' },
];

// Service name suggestions per category (shown in modal as hints)
const CATEGORY_HINTS = {
  property:     ['Sale Deed', 'Agreement of Sale', 'Title Clearance Certificate', 'MGVCL Name Transfer', 'Property Card / Index', 'Ashant Dhara Permission'],
  land:         ['NA Permission', 'Land Survey', 'Plot Agreement', 'Agricultural Land Transfer', 'Revenue Record'],
  legal:        ['Power of Attorney', 'Will (Vasiyatnamu)', 'Name / Surname Change', 'Affidavit'],
  business:     ['Partnership Deed', 'Rent Agreement', 'Service Contract', 'Employment Agreement', 'MOU'],
  registration: ['Marriage Registration', 'Society Registration', 'Trust Registration'],
  notary:       ['Notary – Government of India', 'e-Stamping – State of Gujarat', 'Document Attestation', 'Certification'],
};

// ─── Helpers ──────────────────────────────────────────────────────
const Badge = ({ color = 'gray', children }) => {
  const m = {
    red:    '#FEF2F2,#B91C1C,#FECACA',
    blue:   '#EFF6FF,#1D4ED8,#BFDBFE',
    green:  '#F0FDF4,#15803D,#BBF7D0',
    amber:  '#FFFBEB,#B45309,#FDE68A',
    violet: '#F5F3FF,#6D28D9,#DDD6FE',
    gray:   '#F9FAFB,#374151,#E5E7EB',
    terra:  `${DS.primaryLight},${DS.primary},${DS.primaryBorder}`,
    sky:    '#F0F9FF,#0369A1,#BAE6FD',
    teal:   '#F0FDFA,#0F766E,#99F6E4',
  };
  const [bg, text, border] = (m[color] || m.gray).split(',');
  return (
    <span style={{ background: bg, color: text, border: `1px solid ${border}`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
      {children}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:     { c: 'amber',  l: 'Pending'     },
    IN_PROGRESS: { c: 'sky',    l: 'In Progress' },
    COMPLETED:   { c: 'green',  l: 'Completed'   },
    REJECTED:    { c: 'red',    l: 'Rejected'    },
  };
  const s = map[status] || { c: 'gray', l: status };
  return <Badge color={s.c}>{s.l}</Badge>;
};

const StatCard = ({ icon: Icon, label, value, color = DS.primary, sub }) => (
  <div className="lrd-h" style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 3px rgba(26,8,0,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      {sub && <Badge color="green">{sub}</Badge>}
    </div>
    <p className="lrds" style={{ fontSize: 30, fontWeight: 700, color: DS.text, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 13, color: DS.textSub, marginTop: 5 }}>{label}</p>
  </div>
);

const FieldInput = ({ label, disabled, textarea, rows = 3, ...props }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>}
    {textarea
      ? <textarea className="lrd-i" {...props} rows={rows} disabled={disabled} style={{ width: '100%', background: disabled ? '#F5F0EB' : DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 14, color: disabled ? DS.textMuted : DS.text, resize: 'vertical', fontFamily: 'inherit' }} />
      : <input className="lrd-i" {...props} disabled={disabled} style={{ width: '100%', background: disabled ? '#F5F0EB' : DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 14, color: disabled ? DS.textMuted : DS.text, cursor: disabled ? 'not-allowed' : 'text' }} />
    }
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, background: value ? DS.primary : DS.border, border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
  </button>
);

// ─── Sidebar ──────────────────────────────────────────────────────
const Sidebar = ({ activeView, setView, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { divider: true },
    { id: 'requests',   label: 'Requests',   icon: FileText  },
    { id: 'services',   label: 'Services',   icon: Star      },
    { divider: true },
    { id: 'settings',   label: 'Settings',   icon: Settings  },
  ];
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: DS.card, borderRight: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 20 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={17} color="#fff" />
          </div>
          <div>
            <p className="lrds" style={{ fontSize: 15, fontWeight: 700, color: DS.text, lineHeight: 1.1 }}>Rudra</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: DS.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Legal Portal</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Menu</p>
        {navItems.map((item, i) => {
          if (item.divider) return <div key={i} style={{ height: 1, background: DS.border, margin: '8px 0' }} />;
          const isActive = activeView === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} className="lrd-n"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: isActive ? DS.primaryLight : 'transparent', color: isActive ? DS.primary : DS.textSub, fontWeight: isActive ? 700 : 500, fontSize: 14, textAlign: 'left', borderLeft: isActive ? `3px solid ${DS.primary}` : '3px solid transparent' }}>
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={12} />}
            </button>
          );
        })}
      </nav>
      <div style={{ borderTop: `1px solid ${DS.border}`, padding: '10px 10px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="lrds" style={{ fontSize: 14, fontWeight: 700, color: DS.primary }}>{user?.name?.[0]?.toUpperCase() || 'L'}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Lawyer'}</p>
            <p style={{ fontSize: 11, color: DS.textMuted }}>Advocate</p>
          </div>
        </div>
        <button onClick={onLogout} className="lrd-n"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: 14 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
};

// ─── Dashboard View ───────────────────────────────────────────────
const DashboardView = ({ stats, requests, updating, updateStatus, setView, user }) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const circ = 2 * Math.PI * 32;

  // Count by category
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: requests.filter(r => (r.service?.category || r.category) === cat.id).length,
  }));

  return (
    <div className="lrd-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 className="lrds" style={{ fontSize: 28, fontWeight: 700, color: DS.text }}>Good morning 👋</h1>
        <p style={{ color: DS.textSub, marginTop: 6, fontSize: 15 }}>Adv. {user?.name || 'Krunal B. Parmar'} — legal practice overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={FileText}    label="Total Requests" value={stats.total}      color={DS.primary} />
        <StatCard icon={AlertCircle} label="Pending"        value={stats.pending}    color="#B45309" sub={stats.pending > 0 ? 'Action needed' : null} />
        <StatCard icon={Clock}       label="In Progress"    value={stats.inProgress} color="#0369A1" />
        <StatCard icon={CheckCircle} label="Completed"      value={stats.completed}  color="#15803D" />
      </div>

      {/* Performance banner */}
      <div style={{ background: `linear-gradient(135deg,${DS.primary} 0%,#8B2500 100%)`, borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#FCD34D" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Performance Overview</span>
            </div>
            <h2 className="lrds" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>{completionRate}% Completion Rate</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>
              {stats.completed} completed · {stats.inProgress} in progress · {stats.pending} pending
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setView('requests')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: DS.primary, padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                View Requests <ArrowUpRight size={12} />
              </button>
              <button onClick={() => setView('services')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '9px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                My Services
              </button>
            </div>
          </div>
          <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - completionRate / 100)} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{completionRate}%</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 }}>done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category quick stats */}
      <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Requests by Service Category</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {categoryCounts.map(cat => (
            <div key={cat.id} style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <cat.icon size={15} color={cat.color} />
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: DS.text, lineHeight: 1 }}>{cat.count}</p>
                <p style={{ fontSize: 10, color: DS.textMuted, marginTop: 2, lineHeight: 1.2 }}>{cat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${DS.border}` }}>
          <div>
            <h2 className="lrds" style={{ fontSize: 18, fontWeight: 700, color: DS.text }}>Recent Requests</h2>
            <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{requests.length} shown</p>
          </div>
          <button onClick={() => setView('requests')} style={{ fontSize: 13, color: DS.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ChevronRight size={13} />
          </button>
        </div>
        {requests.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: DS.textMuted }}>
            <FileText size={36} color={DS.border} style={{ margin: '0 auto 12px' }} />
            <p>No requests yet</p>
          </div>
        ) : requests.map((req, i) => {
          const cat = CATEGORIES.find(c => c.id === (req.service?.category || req.category));
          return (
            <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 24px', borderTop: `1px solid ${DS.border}`, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: (cat?.color || DS.primary) + '15', border: `1px solid ${(cat?.color || DS.primary)}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {cat ? <cat.icon size={14} color={cat.color} /> : <FileText size={14} color={DS.primary} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: DS.text }}>{req.service?.serviceName || req.service?.name || 'Legal Service'}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p style={{ fontSize: 12, color: DS.textMuted }}>
                    <span style={{ color: DS.textSub, fontWeight: 600 }}>{req.clientName}</span>
                    <span style={{ margin: '0 6px' }}>·</span>{req.clientPhone || req.clientContact}
                    {req.broker?.name && <><span style={{ margin: '0 6px' }}>·</span>via <span style={{ color: DS.textSub, fontWeight: 600 }}>{req.broker.name}</span></>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {req.status === 'PENDING' && (
                  <button disabled={updating === req.id} onClick={() => updateStatus(req.id, 'IN_PROGRESS')}
                    style={{ padding: '7px 16px', background: '#0369A1', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: updating === req.id ? 0.5 : 1 }}>
                    {updating === req.id ? '…' : 'Start Work'}
                  </button>
                )}
                {req.status === 'IN_PROGRESS' && (
                  <button disabled={updating === req.id} onClick={() => updateStatus(req.id, 'COMPLETED')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#15803D', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: updating === req.id ? 0.5 : 1 }}>
                    <CheckCircle size={12} /> {updating === req.id ? '…' : 'Complete'}
                  </button>
                )}
                {req.status === 'COMPLETED' && <Badge color="green">✓ Done</Badge>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Request Card ─────────────────────────────────────────────────
const RequestCard = ({ req, onStatusUpdate, updating }) => {
  const [expanded, setExpanded] = useState(false);
  const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtT = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const serviceName     = req.serviceType || req.service?.name || req.service?.serviceName || 'Legal Service';
  const serviceCategory = req.service?.category || req.category || '';
  const clientName      = req.clientName    || '—';
  const clientContact   = req.clientContact || req.clientPhone || '—';
  const clientEmail     = req.clientEmail   || '—';
  const propertyDetails = req.propertyDetails || req.description || '';
  const brokerName      = req.broker?.name || '—';

  const cat = CATEGORIES.find(c => c.id === serviceCategory);

  const isPending    = req.status === 'PENDING';
  const isInProgress = req.status === 'IN_PROGRESS';
  const isCompleted  = req.status === 'COMPLETED';
  const isRejected   = req.status === 'REJECTED';

  return (
    <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s' }}>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: (cat?.color || DS.primary) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cat ? <cat.icon size={14} color={cat.color} /> : <FileText size={14} color={DS.primary} />}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{serviceName}</p>
              <StatusBadge status={req.status} />
              {cat && (
                <span style={{ background: (cat.color) + '15', color: cat.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  {cat.label}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 12 }}>
              <span style={{ color: DS.textSub }}><span style={{ color: DS.textMuted }}>Client: </span><b style={{ color: DS.text }}>{clientName}</b></span>
              <a href={`tel:${clientContact}`} style={{ color: DS.primary, fontWeight: 600 }}>{clientContact}</a>
              {clientEmail !== '—' && <a href={`mailto:${clientEmail}`} style={{ color: DS.primary, fontWeight: 600 }}>{clientEmail}</a>}
              <span style={{ color: DS.textMuted }}>📅 {fmt(req.createdAt)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {isPending && (
              <>
                <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'IN_PROGRESS')}
                  style={{ padding: '7px 14px', background: DS.primary, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: updating === req.id ? 0.5 : 1 }}>
                  {updating === req.id ? '...' : '▶ Start'}
                </button>
                <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'REJECTED')}
                  style={{ padding: '7px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reject</button>
              </>
            )}
            {isInProgress && (
              <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'COMPLETED')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#15803D', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                <CheckCircle size={12} />{updating === req.id ? '...' : 'Complete'}
              </button>
            )}
            {isCompleted  && <Badge color="green">✓ Done</Badge>}
            {isRejected   && <Badge color="red">Rejected</Badge>}
            <button onClick={() => setExpanded(!expanded)}
              style={{ width: 32, height: 32, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DS.textMuted }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ background: DS.bg, borderTop: `1px solid ${DS.border}`, padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Booking Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Client',     val: clientName },
                  { label: 'Phone',      val: clientContact, phone: true },
                  { label: 'Via Broker', val: brokerName },
                  { label: 'Service',    val: serviceName },
                ].map(({ label, val, phone }) => (
                  <div key={label} style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, color: DS.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                    {phone ? <a href={`tel:${val}`} style={{ color: DS.primary, fontSize: 13, fontWeight: 700 }}>{val}</a>
                           : <p style={{ color: DS.text, fontSize: 13, fontWeight: 700 }}>{val}</p>}
                  </div>
                ))}
                {propertyDetails && (
                  <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '10px 12px', gridColumn: 'span 2' }}>
                    <p style={{ fontSize: 10, color: DS.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Details</p>
                    <p style={{ color: DS.textSub, fontSize: 13 }}>{propertyDetails}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Progress Timeline</p>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 11, top: 6, bottom: 6, width: 1, background: DS.border }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 4 }}>
                  {[
                    { label: 'Request Received', done: true,                           time: `${fmt(req.createdAt)} ${fmtT(req.createdAt)}` },
                    { label: 'Work In Progress', done: isInProgress || isCompleted, active: isInProgress, time: isInProgress || isCompleted ? 'Started' : 'Waiting' },
                    { label: 'Completed',        done: isCompleted,                    time: isCompleted ? fmt(req.updatedAt) : 'Pending' },
                  ].map(({ label, done, active, time }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? DS.primary : active ? DS.primaryLight : DS.card, border: `2px solid ${done ? DS.primary : active ? DS.primary : DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done && <CheckCircle size={12} color="#fff" />}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: done || active ? DS.text : DS.textMuted }}>{label}</p>
                        <p style={{ fontSize: 11, color: DS.textMuted, marginTop: 2 }}>{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Requests View ────────────────────────────────────────────────
const RequestsView = ({ requests, setRequests }) => {
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let data = [...requests];
    if (statusFilter !== 'ALL')   data = data.filter(r => r.status === statusFilter);
    if (categoryFilter !== 'ALL') data = data.filter(r => (r.service?.category || r.category) === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.clientName?.toLowerCase().includes(q) ||
        r.clientContact?.toLowerCase().includes(q) ||
        r.serviceType?.toLowerCase().includes(q) ||
        r.service?.name?.toLowerCase().includes(q) ||
        r.broker?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [requests, search, statusFilter, categoryFilter]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await legalAPI.getAllRequests();
      setRequests(res.data?.requests || res.data || []);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await legalAPI.updateRequest(id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r));
    } catch { alert('Status update failed'); }
    finally { setUpdating(null); }
  };

  const counts = {
    ALL:         requests.length,
    PENDING:     requests.filter(r => r.status === 'PENDING').length,
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
    COMPLETED:   requests.filter(r => r.status === 'COMPLETED').length,
  };

  return (
    <div className="lrd-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="lrds" style={{ fontSize: 28, fontWeight: 700, color: DS.text }}>Client Requests</h1>
          <p style={{ color: DS.textSub, marginTop: 4, fontSize: 15 }}>{requests.length} total · {counts.PENDING} pending action</p>
        </div>
        <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.card, border: `1px solid ${DS.border}`, color: DS.textSub, padding: '8px 14px', borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={14} className={refreshing ? 'lrd-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Status stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total',       count: counts.ALL,         bg: DS.primaryLight, color: DS.primary,  border: DS.primaryBorder },
          { label: 'Pending',     count: counts.PENDING,     bg: '#FFFBEB',       color: '#B45309',   border: '#FDE68A'        },
          { label: 'In Progress', count: counts.IN_PROGRESS, bg: '#EFF6FF',       color: '#1D4ED8',   border: '#BFDBFE'        },
          { label: 'Completed',   count: counts.COMPLETED,   bg: '#F0FDF4',       color: '#15803D',   border: '#BBF7D0'        },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 24, fontWeight: 700 }}>{s.count}</p>
            <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={() => setCategoryFilter('ALL')}
          style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${categoryFilter === 'ALL' ? DS.primary : DS.border}`, background: categoryFilter === 'ALL' ? DS.primary : DS.card, color: categoryFilter === 'ALL' ? '#fff' : DS.textSub, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1px solid ${categoryFilter === cat.id ? cat.color : DS.border}`, background: categoryFilter === cat.id ? cat.color + '15' : DS.card, color: categoryFilter === cat.id ? cat.color : DS.textSub, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
            <cat.icon size={12} />{cat.label}
          </button>
        ))}
      </div>

      {/* Search + status filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color={DS.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Client naam, phone, service..."
            style={{ width: '100%', border: `1px solid ${DS.border}`, background: DS.card, borderRadius: 12, padding: '9px 12px 9px 36px', fontSize: 13, color: DS.text, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'IN_PROGRESS', label: 'In Progress' }, { key: 'COMPLETED', label: 'Completed' }].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              style={{ padding: '8px 14px', borderRadius: 12, border: `1px solid ${statusFilter === f.key ? DS.primary : DS.border}`, background: statusFilter === f.key ? DS.primary : DS.card, color: statusFilter === f.key ? '#fff' : DS.textSub, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {f.label} ({counts[f.key] ?? requests.filter(r => r.status === f.key).length})
            </button>
          ))}
        </div>
      </div>

      {counts.PENDING > 0 && statusFilter === 'ALL' && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={16} color="#B45309" />
          <p style={{ fontSize: 14, color: '#92400E' }}><b>{counts.PENDING} new request{counts.PENDING > 1 ? 's' : ''}</b> pending — action joiye!</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <FileText size={36} color={DS.border} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: DS.text, fontWeight: 600, marginBottom: 4 }}>Koi request nathi</p>
          <p style={{ color: DS.textMuted, fontSize: 13 }}>{search ? 'Search result khali che' : 'Client book karse tyare yahan dikhashe'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => <RequestCard key={req.id} req={req} onStatusUpdate={updateStatus} updating={updating} />)}
        </div>
      )}
    </div>
  );
};

// ─── Service Modal ────────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:        service?.name        || service?.serviceName || '',
    description: service?.description || '',
    price:       service?.price       || '',
    category:    service?.category    || 'property',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const hints = CATEGORY_HINTS[form.category] || [];

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim())                { setError('Service name jaruri che.');  return; }
    if (!form.description.trim())         { setError('Description jaruri che.');   return; }
    if (!form.price || isNaN(form.price)) { setError('Valid price nakho.');        return; }
    setSaving(true);
    try {
      await onSave({ id: service?.id, name: form.name.trim(), description: form.description.trim(), price: parseFloat(form.price), category: form.category });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Save karva ma error aavyo.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 className="lrds" style={{ fontSize: 18, fontWeight: 700, color: DS.text }}>{service ? 'Edit Service' : 'New Service'}</h3>
            <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{service ? 'Update service details' : 'Add a legal service'}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DS.textMuted }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Category selector — all 6 */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 10, border: `2px solid ${form.category === cat.id ? cat.color : DS.border}`, background: form.category === cat.id ? cat.color + '10' : DS.bg, color: form.category === cat.id ? cat.color : DS.textSub, fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                  <cat.icon size={14} />{cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick pick hints */}
          {hints.length > 0 && !service && (
            <div>
              <p style={{ fontSize: 11, color: DS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Quick Pick</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {hints.map(h => (
                  <button key={h} type="button" onClick={() => setForm({ ...form, name: h })}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, border: `1px solid ${DS.primaryBorder}`, background: form.name === h ? DS.primaryLight : DS.bg, color: form.name === h ? DS.primary : DS.textMuted, cursor: 'pointer', fontWeight: 600 }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <FieldInput label="Service Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sale Deed" />
          <FieldInput label="Description *" textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What this service includes..." rows={3} />
          <FieldInput label="Price (₹) *" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="2000" />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, color: DS.primary, borderRadius: 10, padding: '10px 14px', marginTop: 14, fontSize: 13 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${DS.border}`, background: 'transparent', color: DS.textSub, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ flex: 1, padding: '10px', borderRadius: 12, background: DS.primary, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
            <Save size={14} />{saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Services View ────────────────────────────────────────────────
const ServicesView = () => {
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeCat,      setActiveCat]      = useState('property');
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [toast,          setToast]          = useState('');

  useEffect(() => { fetchServices(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await legalAPI.getAllServices();
      const raw = res.data?.services || res.data || [];
      setServices(raw.map(s => ({ ...s, serviceName: s.name || s.serviceName, category: s.category || 'property' })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await legalAPI.updateService(data.id, { name: data.name, description: data.description, price: data.price, category: data.category });
      showToast('✅ Service updated!');
    } else {
      await legalAPI.createService({ name: data.name, description: data.description, price: data.price, category: data.category });
      showToast('✅ Service added!');
    }
    await fetchServices();
  };

  const handleDelete = async (id) => {
    try {
      await legalAPI.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      showToast('🗑️ Deleted!');
    } catch (e) { console.error(e); } finally { setDeleteConfirm(null); }
  };

  const activeCatObj      = CATEGORIES.find(c => c.id === activeCat);
  const filteredServices  = services.filter(s => (s.category || 'property') === activeCat);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Loader2 size={28} color={DS.primary} className="lrd-spin" />
    </div>
  );

  return (
    <div className="lrd-fade">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 70, background: DS.primary, color: '#fff', padding: '10px 18px', borderRadius: 14, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(200,75,0,0.3)' }}>
          <CheckCircle size={15} /> {toast}
        </div>
      )}

      {modalOpen && (
        <ServiceModal service={editingService}
          onClose={() => { setModalOpen(false); setEditingService(null); }}
          onSave={handleSave} />
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 24, padding: 28, maxWidth: 340, width: '100%', margin: '0 16px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={20} color="#EF4444" />
            </div>
            <p className="lrds" style={{ fontSize: 18, fontWeight: 700, color: DS.text, marginBottom: 6 }}>Delete Service?</p>
            <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 24 }}>Aa action undo nahi thay.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${DS.border}`, background: 'transparent', color: DS.textSub, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '10px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="lrds" style={{ fontSize: 28, fontWeight: 700, color: DS.text }}>My Services</h1>
          <p style={{ color: DS.textSub, marginTop: 4, fontSize: 15 }}>{services.length} total services across {CATEGORIES.length} categories</p>
        </div>
        <button onClick={() => { setEditingService(null); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary, color: '#fff', padding: '10px 18px', borderRadius: 14, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      {/* Category tabs — all 6 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat.id;
          const count  = services.filter(s => (s.category || 'property') === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, border: `1px solid ${active ? cat.color : DS.border}`, background: active ? cat.color + '12' : DS.card, color: active ? cat.color : DS.textSub, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .2s' }}>
              <cat.icon size={14} />{cat.label}
              <span style={{ background: active ? cat.color + '20' : DS.bg, color: active ? cat.color : DS.textMuted, padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {filteredServices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: (activeCatObj?.color || DS.primary) + '12', border: `1px solid ${(activeCatObj?.color || DS.primary)}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
            {activeCatObj ? <activeCatObj.icon size={32} color={activeCatObj.color} /> : <Star size={32} color={DS.primary} />}
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, background: DS.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={12} color="#fff" />
            </div>
          </div>
          <p className="lrds" style={{ fontSize: 18, fontWeight: 700, color: DS.text, marginBottom: 6 }}>No services yet</p>
          <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 20 }}>Add services for {activeCatObj?.label}</p>
          <button onClick={() => { setEditingService(null); setModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary, color: '#fff', padding: '10px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            <Plus size={15} /> Add Service
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredServices.map((service, i) => (
            <div key={service.id} className="lrd-h" style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: (activeCatObj?.color || DS.primary) + '12', border: `1px solid ${(activeCatObj?.color || DS.primary)}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: activeCatObj?.color || DS.primary }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{activeCatObj?.label}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingService(service); setModalOpen(true); }}
                    style={{ width: 30, height: 30, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DS.textMuted }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteConfirm(service.id)}
                    style={{ width: 30, height: 30, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: DS.textMuted }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginBottom: 6 }}>{service.serviceName || service.name}</h3>
                {service.description && <p style={{ fontSize: 12, color: DS.textMuted, lineHeight: 1.5 }}>{service.description}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${DS.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 16, color: '#15803D' }}>
                  <IndianRupee size={15} />{Number(service.price).toLocaleString()}
                </div>
                <button onClick={() => { setEditingService(service); setModalOpen(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, color: DS.primary, padding: '6px 14px', borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  <Edit2 size={11} /> Edit
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => { setEditingService(null); setModalOpen(true); }}
            style={{ border: `2px dashed ${DS.border}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 180, cursor: 'pointer', background: 'transparent', transition: 'all 0.2s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: DS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color={DS.textMuted} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: DS.textMuted }}>Add New Service</p>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Settings View ────────────────────────────────────────────────
const SettingsView = ({ user: propUser }) => {
  const [tab,     setTab]     = useState('profile');
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', city: '', state: '', address: '', barCouncilId: '', experience: '', specialization: '', professionalDetails: '' });
  const [pwd,     setPwd]     = useState({ current: '', next: '', confirm: '' });
  const [notifs,  setNotifs]  = useState({ emailAlerts: true, smsAlerts: false, pushNotifications: true, legalUpdates: true, clientEnquiries: true, caseUpdates: true });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [err,     setErr]     = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (propUser) {
      setForm({ name: propUser.name || '', email: propUser.email || '', phone: propUser.phone || '', city: propUser.city || '', state: propUser.state || '', address: propUser.address || '', barCouncilId: propUser.barCouncilId || '', experience: propUser.experience || '', specialization: propUser.specialization || '', professionalDetails: propUser.professionalDetails || '' });
      if (propUser.profileImage) setPreview(propUser.profileImage);
    }
  }, [propUser]);

  const showSuccess = () => { setSuccess(true); setTimeout(() => setSuccess(false), 2500); };

  const save = async () => {
    setSaving(true); setErr('');
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/update-profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, profileImage: preview }),
      });
      showSuccess();
    } catch { setErr('Save failed. Please try again.'); }
    finally { setSaving(false); }
  };

  const changePwd = async () => {
    setErr('');
    if (pwd.next !== pwd.confirm) { setErr('Passwords match nathi!'); return; }
    if (pwd.next.length < 6)      { setErr('Min 6 characters required.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      setPwd({ current: '', next: '', confirm: '' });
      showSuccess();
    } catch { setErr('Password change failed.'); }
    finally { setSaving(false); }
  };

  const TABS = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: Shield }, { id: 'notifications', label: 'Notifications', icon: Bell }];
  const NLABELS = { emailAlerts: 'Email Alerts', smsAlerts: 'SMS Alerts', pushNotifications: 'Push Notifications', legalUpdates: 'Legal Updates', clientEnquiries: 'Client Enquiries', caseUpdates: 'Case Updates' };

  return (
    <div className="lrd-fade">
      <h1 className="lrds" style={{ fontSize: 28, fontWeight: 700, color: DS.text, marginBottom: 6 }}>Account Settings</h1>
      <p style={{ color: DS.textSub, fontSize: 15, marginBottom: 28 }}>Manage your professional profile and preferences</p>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 12 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              {preview
                ? <img src={preview} alt="Profile" style={{ width: 76, height: 76, borderRadius: 16, objectFit: 'cover', border: `2px solid ${DS.primaryBorder}` }} />
                : <div style={{ width: 76, height: 76, borderRadius: 16, background: DS.primaryLight, border: `2px solid ${DS.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="lrds" style={{ fontSize: 28, fontWeight: 700, color: DS.primary }}>{form.name?.[0]?.toUpperCase() || 'L'}</span>
                  </div>}
              <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 9, background: DS.primary, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={13} color="#fff" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => setPreview(r.result); r.readAsDataURL(f); } }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: DS.text, marginBottom: 6 }}>{form.name || 'Lawyer'}</p>
            <Badge color="terra">ADVOCATE</Badge>
          </div>
          <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 8 }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: tab === id ? DS.primaryLight : 'transparent', color: tab === id ? DS.primary : DS.textSub, fontWeight: tab === id ? 700 : 500, fontSize: 13, textAlign: 'left', borderLeft: tab === id ? `3px solid ${DS.primary}` : '3px solid transparent' }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 28 }}>
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 14 }}>
              <CheckCircle size={15} /> Saved successfully!
            </div>
          )}
          {err && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 14 }}>
              <AlertCircle size={15} /> {err}
            </div>
          )}
          {tab === 'profile' && (
            <>
              <h3 className="lrds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Profile Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FieldInput label="Full Name"       value={form.name}         onChange={e => setForm({ ...form, name: e.target.value })}         placeholder="Adv. Krunal B. Parmar" />
                <FieldInput label="Email"           value={form.email}        disabled />
                <FieldInput label="Phone"           value={form.phone}        onChange={e => setForm({ ...form, phone: e.target.value })}         placeholder="+91 99257 88822" />
                <FieldInput label="City"            value={form.city}         onChange={e => setForm({ ...form, city: e.target.value })}          placeholder="Vadodara" />
                <FieldInput label="State"           value={form.state}        onChange={e => setForm({ ...form, state: e.target.value })}         placeholder="Gujarat" />
                <FieldInput label="Bar Council ID"  value={form.barCouncilId} onChange={e => setForm({ ...form, barCouncilId: e.target.value })} placeholder="GJ/1234/2014" />
                <FieldInput label="Experience (Yrs)" value={form.experience}  onChange={e => setForm({ ...form, experience: e.target.value })}    placeholder="10" />
                <FieldInput label="Specialization"  value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Property & Business Law" />
              </div>
              <div style={{ marginTop: 14 }}>
                <FieldInput label="Address"         value={form.address}      onChange={e => setForm({ ...form, address: e.target.value })}       placeholder="B/84, First Floor, Jay Ambe Complex, Vadodara" />
              </div>
              <div style={{ marginTop: 14 }}>
                <FieldInput label="Professional Bio" textarea value={form.professionalDetails} onChange={e => setForm({ ...form, professionalDetails: e.target.value })} placeholder="Brief about your practice..." rows={3} />
              </div>
            </>
          )}
          {tab === 'security' && (
            <>
              <h3 className="lrds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
                <FieldInput label="Current Password" type="password" value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} placeholder="••••••••" />
                <FieldInput label="New Password"     type="password" value={pwd.next}    onChange={e => setPwd({ ...pwd, next: e.target.value })}    placeholder="••••••••" />
                <FieldInput label="Confirm Password" type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} placeholder="••••••••" />
                <button onClick={changePwd} disabled={saving}
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <Lock size={14} /> {saving ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </>
          )}
          {tab === 'notifications' && (
            <>
              <h3 className="lrds" style={{ fontSize: 18, color: DS.text, marginBottom: 20 }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(notifs).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: DS.text, fontSize: 14 }}>{NLABELS[key] || key}</p>
                      <p style={{ color: DS.textMuted, fontSize: 12, marginTop: 2 }}>Receive {(NLABELS[key] || key).toLowerCase()}</p>
                    </div>
                    <Toggle value={val} onChange={() => setNotifs({ ...notifs, [key]: !val })} />
                  </div>
                ))}
              </div>
            </>
          )}
          {tab !== 'security' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 18, borderTop: `1px solid ${DS.border}` }}>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary, color: '#fff', padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Loader2 size={14} className="lrd-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [view,     setView]     = useState('dashboard');
  const [stats,    setStats]    = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [mob,      setMob]      = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    setStats({
      total:      requests.length,
      pending:    requests.filter(r => r.status === 'PENDING').length,
      inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
      completed:  requests.filter(r => r.status === 'COMPLETED').length,
    });
  }, [requests]);

  const fetchData = async () => {
    try {
      const res = await legalAPI.getAllRequests();
      setRequests(res.data?.requests || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await legalAPI.updateRequest(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
    } catch { alert('Update failed'); }
    finally { setUpdating(null); }
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="lrd" style={{ minHeight: '100vh', background: DS.bg, display: 'flex' }}>
      <style>{CSS}</style>

      {/* Desktop Sidebar spacer */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <Sidebar activeView={view} setView={setView} user={user} onLogout={onLogout} />
      </div>

      {/* Mobile Sidebar */}
      {mob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setMob(false)} />
          <div style={{ position: 'relative', zIndex: 50, width: 240 }}>
            <button onClick={() => setMob(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted }}>
              <X size={18} />
            </button>
            <Sidebar activeView={view} setView={v => { setView(v); setMob(false); }} user={user} onLogout={onLogout} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: DS.card, borderBottom: `1px solid ${DS.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMob(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textSub }}>
              <Menu size={20} />
            </button>
            <span className="lrds" style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Rudra Legal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stats.pending > 0 && <Badge color="amber">{stats.pending} pending</Badge>}
            <span style={{ fontSize: 13, color: DS.textMuted }}>Adv. {user?.name || 'Krunal B. Parmar'}</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
              <Loader2 size={28} color={DS.primary} className="lrd-spin" />
            </div>
          ) : view === 'dashboard' ? (
            <DashboardView stats={stats} requests={requests.slice(0, 8)} updating={updating} updateStatus={updateStatus} setView={setView} user={user} />
          ) : view === 'requests' ? (
            <RequestsView requests={requests} setRequests={setRequests} />
          ) : view === 'services' ? (
            <ServicesView />
          ) : (
            <SettingsView user={user} />
          )}
        </main>
      </div>
    </div>
  );
};

export default LawyerDashboard;
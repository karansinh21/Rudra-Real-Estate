import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, Scale, TrendingUp, CheckCircle,
  Trash2, Search, BarChart3, Layers, MapPin, Phone, Clock,
  RefreshCw, UserCheck, XCircle, Home,
  LogOut, Shield, Bell
} from 'lucide-react';

// ── Design Tokens ─────────────────────────────────────────────────
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
};

const API = 'http://localhost:5000/api/admin';

const req = async (url, opts = {}) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const res = await fetch(`${API}${url}`, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const fmt = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  return `₹${(n/1000).toFixed(0)}k`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

// ── Badges ────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const m = {
    ADMIN:  { bg: DS.primaryLight, color: DS.primary,  border: DS.primaryBorder },
    BROKER: { bg: '#EFF6FF',       color: '#1D4ED8',   border: '#BFDBFE'        },
    LAWYER: { bg: '#F5F3FF',       color: '#6D28D9',   border: '#DDD6FE'        },
    PUBLIC: { bg: DS.bg,           color: DS.textMuted,border: DS.border        },
  };
  const s = m[role] || m.PUBLIC;
  return (
    <span style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="px-2.5 py-0.5 text-xs font-bold rounded-full border">{role}</span>
  );
};

const StatusBadge = ({ status }) => {
  const m = {
    ACTIVE:   { bg:'#F0FDF4', color:'#15803D', border:'#BBF7D0', dot:'#22C55E' },
    PENDING:  { bg:'#FFFBEB', color:'#B45309', border:'#FDE68A', dot:'#F59E0B' },
    REJECTED: { bg:'#FEF2F2', color:'#DC2626', border:'#FECACA', dot:'#EF4444' },
    BLOCKED:  { bg: DS.bg,    color: DS.textMuted, border: DS.border, dot: DS.textMuted },
  };
  const s = m[status] || m.ACTIVE;
  return (
    <span style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />{status}
    </span>
  );
};

// ── Nav ───────────────────────────────────────────────────────────
const NAV = [
  { id:'overview',   label:'Overview',          icon:BarChart3  },
  { id:'pending',    label:'Pending Approvals',  icon:UserCheck  },
  { id:'users',      label:'All Users',          icon:Users      },
  { id:'properties', label:'Properties',         icon:Building2  },
  { id:'land',       label:'Land Requirements',  icon:Layers     },
  { id:'legal',      label:'Legal Requests',     icon:Scale      },
  { id:'analytics',  label:'Analytics',          icon:TrendingUp },
];

// ── Sidebar ───────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, pendingCount, adminName, onLogout }) => (
  <aside style={{ background: DS.card, borderColor: DS.border }}
    className="hidden lg:flex flex-col w-64 min-h-screen border-r px-4 py-7">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-8 px-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
        style={{ background: DS.primary }}>
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div>
        <span style={{ color: DS.text, fontFamily: 'Georgia, serif' }}
          className="font-bold text-sm block leading-tight">Rudra Admin</span>
        <span style={{ color: DS.textMuted }}
          className="text-[10px] font-semibold tracking-widest uppercase">Control Panel</span>
      </div>
    </div>

    {/* Pending alert */}
    {pendingCount > 0 && (
      <button onClick={() => setActive('pending')}
        className="flex items-center gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 hover:bg-amber-100 transition-all">
        <Bell className="w-4 h-4 text-amber-500 shrink-0" />
        <div className="text-left">
          <p className="text-xs font-bold text-amber-700">{pendingCount} Pending!</p>
          <p className="text-[10px] text-amber-500">Approval joiye che</p>
        </div>
      </button>
    )}

    <p style={{ color: DS.textMuted }} className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2">Menu</p>
    <nav className="flex-1 space-y-0.5">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActive(id)}
          style={active === id
            ? { background: DS.primary, color: '#fff' }
            : { color: DS.textSub }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left hover:opacity-80">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{label}</span>
          {id === 'pending' && pendingCount > 0 && (
            <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center bg-red-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </nav>

    {/* User card */}
    <div style={{ background: DS.bg, borderColor: DS.border }} className="mt-4 p-3 rounded-2xl border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: DS.primary }}>
          {adminName?.charAt(0) || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: DS.text }} className="text-xs font-bold truncate">{adminName || 'Admin'}</p>
          <p style={{ color: DS.textMuted }} className="text-[10px]">Super Admin</p>
        </div>
        <button onClick={onLogout} style={{ color: DS.textMuted }} className="hover:text-red-400 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </aside>
);

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorStyle, onClick }) => (
  <div onClick={onClick}
    style={{ background: DS.card, borderColor: DS.border }}
    className={`border rounded-2xl p-5 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}>
    <div className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3"
      style={{ background: colorStyle.bg, borderColor: colorStyle.border, color: colorStyle.color }}>
      <Icon className="w-5 h-5" />
    </div>
    <p style={{ color: DS.text }} className="text-2xl font-bold mb-0.5">{value ?? '—'}</p>
    <p style={{ color: DS.textMuted }} className="text-sm font-medium">{label}</p>
  </div>
);

const COLORS = {
  orange: { bg: DS.primaryLight, border: DS.primaryBorder, color: DS.primary      },
  blue:   { bg: '#EFF6FF',       border: '#BFDBFE',        color: '#1D4ED8'       },
  green:  { bg: '#F0FDF4',       border: '#BBF7D0',        color: '#15803D'       },
  purple: { bg: '#F5F3FF',       border: '#DDD6FE',        color: '#6D28D9'       },
  amber:  { bg: '#FFFBEB',       border: '#FDE68A',        color: '#B45309'       },
  sky:    { bg: '#F0F9FF',       border: '#BAE6FD',        color: '#0284C7'       },
};

const Skeleton = ({ rows = 4 }) => (
  <div className="p-6 space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ background: DS.bg }} className="h-12 rounded-xl animate-pulse" />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────
const CompleteAdminPanel = () => {
  const navigate  = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast]         = useState(null);
  const [stats, setStats]         = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [pending, setPending]     = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [users, setUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [landReqs, setLandReqs]   = useState([]);
  const [landLoading, setLandLoading] = useState(false);
  const [landSearch, setLandSearch] = useState('');
  const [landStatusFilter, setLandStatusFilter] = useState('all');
  const [legalReqs, setLegalReqs] = useState([]);
  const [legalLoading, setLegalLoading] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handleLogout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); navigate('/admin/login'); };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { const d = await req('/stats'); setStats(d); } catch (e) { console.error(e); } finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (activeTab === 'pending')    fetchPending();
    if (activeTab === 'users')      fetchUsers();
    if (activeTab === 'properties') fetchProperties();
    if (activeTab === 'land')       fetchLand();
    if (activeTab === 'legal')      fetchLegal();
  }, [activeTab]);
  useEffect(() => { if (activeTab === 'land') fetchLand(); }, [landStatusFilter]);

  const fetchPending = async () => {
    setPendingLoading(true);
    try { const d = await req('/users/pending'); setPending(d.users || []); setStats(s => ({ ...s, pendingApprovals: d.count })); }
    catch (e) { console.error(e); } finally { setPendingLoading(false); }
  };
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      const d = await req(`/users?${params}`); setUsers(d.users || []);
    } catch (e) { console.error(e); } finally { setUsersLoading(false); }
  };
  const fetchProperties = async () => {
    setPropsLoading(true);
    try { const d = await req('/properties'); setProperties(d.properties || []); }
    catch (e) { console.error(e); } finally { setPropsLoading(false); }
  };
  const fetchLand = async () => {
    setLandLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (landStatusFilter !== 'all') params.append('status', landStatusFilter);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const r = await fetch(`http://localhost:5000/api/land/requirements?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const d = await r.json();
      setLandReqs(d.requirements || []);
    } catch (e) { console.error(e); } finally { setLandLoading(false); }
  };
  const fetchLegal = async () => {
    setLegalLoading(true);
    try { const d = await req('/legal-requests'); setLegalReqs(d.requests || []); }
    catch (e) { console.error(e); } finally { setLegalLoading(false); }
  };

  const approveUser = async (id, name) => {
    try {
      await req(`/users/${id}/approve`, { method: 'PUT' });
      setPending(p => p.filter(u => u.id !== id));
      setUsers(u => u.map(x => x.id === id ? { ...x, status: 'ACTIVE', isVerified: true } : x));
      setStats(s => ({ ...s, pendingApprovals: Math.max((s.pendingApprovals || 1) - 1, 0) }));
      showToast(`✅ ${name} approved!`);
    } catch (e) { showToast(e.message, 'error'); }
  };
  const rejectUser = async (id, name) => {
    if (!window.confirm(`${name} ne reject karo?`)) return;
    try {
      await req(`/users/${id}/reject`, { method: 'PUT' });
      setPending(p => p.filter(u => u.id !== id));
      setStats(s => ({ ...s, pendingApprovals: Math.max((s.pendingApprovals || 1) - 1, 0) }));
      showToast(`${name} rejected.`);
    } catch (e) { showToast(e.message, 'error'); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await req(`/users/${id}`, { method: 'DELETE' }); setUsers(u => u.filter(x => x.id !== id)); showToast('Deleted.'); }
    catch (e) { showToast(e.message, 'error'); }
  };
  const deleteProperty = async (id) => {
    if (!window.confirm('Delete property?')) return;
    try { await req(`/properties/${id}`, { method: 'DELETE' }); setProperties(p => p.filter(x => x.id !== id)); showToast('Deleted.'); }
    catch (e) { showToast(e.message, 'error'); }
  };
  const updateLandStatus = async (id, status) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/land/requirement/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setLandReqs(r => r.map(x => x.id === id ? { ...x, status } : x));
    } catch (e) { console.error(e); }
  };
  const updateLegalStatus = async (id, status) => {
    try { await req(`/legal-requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); setLegalReqs(r => r.map(x => x.id === id ? { ...x, status } : x)); }
    catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });
  const filteredLand = landReqs.filter(r => {
    const q = landSearch.toLowerCase();
    return !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.landType?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q);
  });

  // ── Shared input/select style ────────────────────────────────
  const inputStyle = { background: DS.bg, borderColor: DS.border, color: DS.text };

  return (
    <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }} className="flex min-h-screen">
      <Sidebar active={activeTab} setActive={setActiveTab} pendingCount={stats.pendingApprovals || 0}
        adminName={adminUser.name} onLogout={handleLogout} />

      {/* Toast */}
      {toast && (
        <div style={{ background: toast.type === 'error' ? '#EF4444' : DS.primary }}
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-bold text-white">
          <CheckCircle className="w-4 h-4" /> {toast.msg}
        </div>
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header style={{ background: 'rgba(249,246,242,0.85)', borderColor: DS.border }}
          className="sticky top-0 z-10 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between">
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-base font-bold">
              {NAV.find(n => n.id === activeTab)?.label || 'Admin Panel'}
            </h1>
            <p style={{ color: DS.textMuted }} className="text-xs">Rudra Real Estate</p>
          </div>
          <div className="flex items-center gap-2">
            {(stats.pendingApprovals || 0) > 0 && (
              <button onClick={() => setActiveTab('pending')}
                className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-100 transition-all">
                <Bell className="w-3.5 h-3.5" /> {stats.pendingApprovals} Pending
              </button>
            )}
            <button onClick={fetchStats}
              style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
              className="p-2 border rounded-xl transition-all hover:opacity-70">
              <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="px-8 py-7">

          {/* ══ OVERVIEW ══════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Users}     label="Total Users"  value={stats.totalUsers}        colorStyle={COLORS.blue}   onClick={() => setActiveTab('users')} />
                <StatCard icon={Building2} label="Brokers"      value={stats.brokers}           colorStyle={COLORS.sky}    onClick={() => setActiveTab('users')} />
                <StatCard icon={Scale}     label="Lawyers"      value={stats.lawyers}           colorStyle={COLORS.purple} onClick={() => setActiveTab('users')} />
                <StatCard icon={Home}      label="Properties"   value={stats.properties}        colorStyle={COLORS.green}  onClick={() => setActiveTab('properties')} />
                <StatCard icon={Layers}    label="Land Leads"   value={stats.landRequirements}  colorStyle={COLORS.green}  onClick={() => setActiveTab('land')} />
                <StatCard icon={Bell}      label="Pending"      value={stats.pendingApprovals}  colorStyle={COLORS.amber}  onClick={() => setActiveTab('pending')} />
              </div>

              {(stats.pendingApprovals || 0) > 0 && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center">
                      <Bell className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 text-sm">{stats.pendingApprovals} professionals approval mate wait kar raha che!</p>
                      <p className="text-amber-600 text-xs">BROKER/LAWYER registered — approve/reject karo</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('pending')}
                    className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-700 transition-all whitespace-nowrap">
                    Review Now →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div style={{ background: DS.card, borderColor: DS.border }} className="lg:col-span-2 border rounded-2xl p-6">
                  <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold mb-5">Platform Overview</h3>
                  {[
                    { label: 'Brokers',       val: stats.brokers || 0,          max: stats.totalUsers || 1, color: DS.primary },
                    { label: 'Lawyers',        val: stats.lawyers || 0,          max: stats.totalUsers || 1, color: '#6D28D9'  },
                    { label: 'Land Leads',     val: stats.landRequirements || 0, max: 100,                   color: '#15803D'  },
                    { label: 'Legal Requests', val: stats.legalRequests || 0,    max: 100,                   color: '#0284C7'  },
                  ].map(s => (
                    <div key={s.label} className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span style={{ color: DS.textSub }} className="font-medium">{s.label}</span>
                        <span style={{ color: DS.text }} className="font-bold">{s.val}</span>
                      </div>
                      <div style={{ background: DS.bg }} className="h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((s.val / s.max) * 100, 100)}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: DS.primary }} className="rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-5" style={{ fontFamily: 'Georgia, serif' }}>Quick Access</h3>
                  <div className="space-y-2">
                    {NAV.filter(n => n.id !== 'overview' && n.id !== 'analytics').map(n => (
                      <button key={n.id} onClick={() => setActiveTab(n.id)}
                        className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all flex items-center justify-between">
                        <span className="flex items-center gap-2"><n.icon className="w-3.5 h-3.5" />{n.label}</span>
                        <span className="opacity-50">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PENDING APPROVALS ══════════════════════════════ */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">Pending Approvals</h3>
                  <p style={{ color: DS.textMuted }} className="text-sm mt-0.5">{pending.length} professionals waiting</p>
                </div>
                <button onClick={fetchPending}
                  style={{ background: DS.card, borderColor: DS.border, color: DS.textMuted }}
                  className="p-2 border rounded-xl transition-all hover:opacity-70">
                  <RefreshCw className={`w-4 h-4 ${pendingLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {pendingLoading ? <Skeleton rows={3} /> : pending.length === 0 ? (
                <div style={{ background: DS.card, borderColor: DS.border }}
                  className="border rounded-2xl py-20 text-center">
                  <div style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
                    className="w-16 h-16 border rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p style={{ color: DS.text }} className="font-bold mb-1">Sab approve thay gaya! 🎉</p>
                  <p style={{ color: DS.textMuted }} className="text-sm">Koi pending professional nathi.</p>
                </div>
              ) : pending.map(user => {
                const pd = user.professionalDetails || {};
                return (
                  <div key={user.id} style={{ background: DS.card, borderColor: DS.border }}
                    className="border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ background: user.role === 'LAWYER' ? '#6D28D9' : DS.primary }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p style={{ color: DS.text }} className="font-bold">{user.name}</p>
                            <RoleBadge role={user.role} />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">PENDING</span>
                          </div>
                          <p style={{ color: DS.textMuted }} className="text-sm">{user.email}</p>
                          {user.phone && <a href={`tel:${user.phone}`} style={{ color: DS.primary }} className="text-xs flex items-center gap-1 mt-0.5 hover:underline"><Phone className="w-3 h-3" />{user.phone}</a>}
                          <div className="flex flex-wrap gap-3 mt-2">
                            {pd.licenseNumber  && <span style={{ color: DS.textMuted }} className="text-xs">License: <strong style={{ color: DS.textSub }}>{pd.licenseNumber}</strong></span>}
                            {pd.barCouncilId   && <span style={{ color: DS.textMuted }} className="text-xs">Bar Council: <strong style={{ color: DS.textSub }}>{pd.barCouncilId}</strong></span>}
                            {pd.experience     && <span style={{ color: DS.textMuted }} className="text-xs">Experience: <strong style={{ color: DS.textSub }}>{pd.experience} yrs</strong></span>}
                            {pd.specialization && <span style={{ color: DS.textMuted }} className="text-xs">Field: <strong style={{ color: DS.textSub }}>{pd.specialization}</strong></span>}
                          </div>
                          <p style={{ color: DS.textMuted }} className="text-xs mt-1">Registered: {fmtDate(user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => approveUser(user.id, user.name)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => rejectUser(user.id, user.name)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-bold transition-all">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ ALL USERS ══════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl overflow-hidden">
              <div style={{ borderColor: DS.border }} className="px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">All Users ({filteredUsers.length})</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search style={{ color: DS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search..." style={inputStyle}
                      className="border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none w-48" />
                  </div>
                  <select value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); setTimeout(fetchUsers, 100); }}
                    style={inputStyle} className="border rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer">
                    <option value="all">All Roles</option>
                    <option value="BROKER">Broker</option>
                    <option value="LAWYER">Lawyer</option>
                    <option value="PUBLIC">Public</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button onClick={fetchUsers} style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                    className="p-2 border rounded-xl transition-all hover:opacity-70">
                    <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              {usersLoading ? <Skeleton /> : filteredUsers.length === 0 ? (
                <div style={{ color: DS.textMuted }} className="py-16 text-center">Koi user maldo nathi</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: DS.bg, borderColor: DS.border }} className="border-b">
                      <tr>{['User', 'Role', 'Status', 'Phone', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ color: DS.textMuted }} className="px-5 py-3 text-left text-xs font-bold uppercase">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} style={{ borderColor: DS.bg }} className="border-b hover:bg-stone-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: u.role === 'LAWYER' ? '#6D28D9' : u.role === 'BROKER' ? DS.primary : u.role === 'ADMIN' ? '#EF4444' : DS.textMuted }}>
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p style={{ color: DS.text }} className="text-sm font-semibold">{u.name}</p>
                                <p style={{ color: DS.textMuted }} className="text-xs">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                          <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                          <td style={{ color: DS.textSub }} className="px-5 py-4 text-sm">{u.phone || '—'}</td>
                          <td style={{ color: DS.textMuted }} className="px-5 py-4 text-xs">{fmtDate(u.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {u.status === 'PENDING' && (
                                <button onClick={() => approveUser(u.id, u.name)}
                                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => deleteUser(u.id)}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ PROPERTIES ═════════════════════════════════════ */}
          {activeTab === 'properties' && (
            <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl overflow-hidden">
              <div style={{ borderColor: DS.border }} className="px-6 py-4 border-b flex items-center justify-between">
                <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">All Properties ({properties.length})</h3>
                <button onClick={fetchProperties} style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                  className="p-2 border rounded-xl transition-all hover:opacity-70">
                  <RefreshCw className={`w-4 h-4 ${propsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {propsLoading ? <Skeleton /> : properties.length === 0
                ? <div style={{ color: DS.textMuted }} className="py-16 text-center">Koi property nathi</div>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: DS.bg, borderColor: DS.border }} className="border-b">
                        <tr>{['Property', 'Type', 'Purpose', 'Price', 'City', 'Broker', 'Action'].map(h => (
                          <th key={h} style={{ color: DS.textMuted }} className="px-5 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {properties.map(p => (
                          <tr key={p.id} style={{ borderColor: DS.bg }} className="border-b hover:bg-stone-50/50 transition-colors">
                            <td className="px-5 py-4 max-w-[200px]">
                              <p style={{ color: DS.text }} className="text-sm font-semibold truncate">{p.title}</p>
                              <p style={{ color: DS.textMuted }} className="text-xs truncate">{p.address}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span style={['LAND','AGRICULTURAL','INDUSTRIAL'].includes(p.type)
                                ? { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }
                                : { background: DS.primaryLight, color: DS.primary, borderColor: DS.primaryBorder }}
                                className="text-xs font-bold px-2.5 py-1 rounded-full border">{p.type}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span style={p.purpose === 'SALE'
                                ? { background: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' }
                                : { background: '#F0F9FF', color: '#0284C7', borderColor: '#BAE6FD' }}
                                className="text-xs font-bold px-2.5 py-1 rounded-full border">{p.purpose}</span>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-emerald-600 whitespace-nowrap">{fmt(p.price)}</td>
                            <td style={{ color: DS.textMuted }} className="px-5 py-4 text-xs">{p.city || '—'}</td>
                            <td style={{ color: DS.textSub }} className="px-5 py-4 text-xs">{p.broker?.name || '—'}</td>
                            <td className="px-5 py-4">
                              <button onClick={() => deleteProperty(p.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ══ LAND ═══════════════════════════════════════════ */}
          {activeTab === 'land' && (
            <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl overflow-hidden">
              <div style={{ borderColor: DS.border }} className="px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">Land Requirements ({landReqs.length})</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search style={{ color: DS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input value={landSearch} onChange={e => setLandSearch(e.target.value)}
                      placeholder="Search..." style={inputStyle}
                      className="border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none w-40" />
                  </div>
                  <select value={landStatusFilter} onChange={e => setLandStatusFilter(e.target.value)}
                    style={inputStyle} className="border rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer">
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="MATCHED">Matched</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button onClick={fetchLand} style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                    className="p-2 border rounded-xl transition-all hover:opacity-70">
                    <RefreshCw className={`w-4 h-4 ${landLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              {landLoading ? <Skeleton /> : filteredLand.length === 0
                ? <div style={{ color: DS.textMuted }} className="py-16 text-center">Koi land requirement nathi</div>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: DS.bg, borderColor: DS.border }} className="border-b">
                        <tr>{['Client', 'Land Type', 'Area', 'Budget', 'Location', 'Timeline', 'Status'].map(h => (
                          <th key={h} style={{ color: DS.textMuted }} className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {filteredLand.map(r => (
                          <tr key={r.id} style={{ borderColor: DS.bg }} className="border-b hover:bg-stone-50/50 transition-colors">
                            <td className="px-4 py-4">
                              <p style={{ color: DS.text }} className="text-sm font-semibold">{r.name}</p>
                              <p style={{ color: DS.textMuted }} className="text-xs">{r.email}</p>
                              <a href={`tel:${r.phone}`} style={{ color: DS.primary }} className="text-xs flex items-center gap-1 mt-0.5 hover:underline"><Phone className="w-3 h-3" />{r.phone}</a>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 capitalize">{r.landType}</span>
                              <p style={{ color: DS.textMuted }} className="text-xs mt-1 capitalize">{r.purposeType}</p>
                            </td>
                            <td style={{ color: DS.textSub }} className="px-4 py-4 text-sm whitespace-nowrap">{r.minArea}–{r.maxArea} <span style={{ color: DS.textMuted }} className="text-xs">{r.areaUnit}</span></td>
                            <td className="px-4 py-4 text-sm font-bold text-emerald-600 whitespace-nowrap">{fmt(r.minBudget)}–{fmt(r.maxBudget)}</td>
                            <td className="px-4 py-4 text-xs" style={{ color: DS.textMuted }}>
                              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate max-w-[90px]">{r.preferredLocations?.join(', ') || r.city}</span></div>
                            </td>
                            <td className="px-4 py-4"><div className="flex items-center gap-1 text-xs" style={{ color: DS.textMuted }}><Clock className="w-3 h-3" />{r.timeline}</div></td>
                            <td className="px-4 py-4">
                              <select value={r.status} onChange={e => updateLandStatus(r.id, e.target.value)}
                                style={{ borderColor: DS.border }}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none bg-transparent
                                  ${r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    r.status === 'MATCHED' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                    r.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                <option value="ACTIVE">Active</option>
                                <option value="MATCHED">Matched</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ══ LEGAL ══════════════════════════════════════════ */}
          {activeTab === 'legal' && (
            <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl overflow-hidden">
              <div style={{ borderColor: DS.border }} className="px-6 py-4 border-b flex items-center justify-between">
                <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">Legal Requests ({legalReqs.length})</h3>
                <button onClick={fetchLegal} style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                  className="p-2 border rounded-xl transition-all hover:opacity-70">
                  <RefreshCw className={`w-4 h-4 ${legalLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {legalLoading ? <Skeleton /> : legalReqs.length === 0
                ? <div style={{ color: DS.textMuted }} className="py-16 text-center">Koi legal request nathi</div>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: DS.bg, borderColor: DS.border }} className="border-b">
                        <tr>{['Client', 'Service', 'Broker', 'Date', 'Status'].map(h => (
                          <th key={h} style={{ color: DS.textMuted }} className="px-5 py-3 text-left text-xs font-bold uppercase">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {legalReqs.map(r => (
                          <tr key={r.id} style={{ borderColor: DS.bg }} className="border-b hover:bg-stone-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p style={{ color: DS.text }} className="text-sm font-semibold">{r.clientName}</p>
                              <a href={`tel:${r.clientContact}`} style={{ color: DS.primary }} className="text-xs hover:underline">{r.clientContact}</a>
                            </td>
                            <td style={{ color: DS.textSub }} className="px-5 py-4 text-sm">{r.serviceType || r.service?.serviceName}</td>
                            <td style={{ color: DS.textSub }} className="px-5 py-4 text-sm">{r.broker?.name || '—'}</td>
                            <td style={{ color: DS.textMuted }} className="px-5 py-4 text-xs">{fmtDate(r.createdAt)}</td>
                            <td className="px-5 py-4">
                              <select value={r.status} onChange={e => updateLegalStatus(r.id, e.target.value)}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none bg-transparent
                                  ${r.status === 'PENDING'     ? 'bg-amber-50  text-amber-700  border-amber-200'  :
                                    r.status === 'IN_PROGRESS' ? 'bg-sky-50    text-sky-700    border-sky-200'    :
                                    r.status === 'COMPLETED'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-red-50 text-red-600 border-red-200'}`}>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* ══ ANALYTICS ══════════════════════════════════════ */}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}

        </div>
      </main>
    </div>
  );
};

// ── Analytics Tab ─────────────────────────────────────────────────
const AnalyticsTab = ({ stats }) => {
  const lineRef = useRef(null);
  const pieRef  = useRef(null);
  const [timeRange, setTimeRange] = useState('month');

  const trendData = {
    month: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], properties: [4,6,5,8,7,10,9,12,11,13,14,15], legal: [2,3,4,3,5,6,7,8,6,9,10,11], users: [3,5,4,7,6,8,9,10,11,12,13,15] },
    week:  { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], properties: [2,3,1,4,5,3,2], legal: [1,2,3,2,4,1,2], users: [3,4,2,5,6,4,3] },
  };
  const d = trendData[timeRange] || trendData.month;

  useEffect(() => {
    const canvas = lineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const PAD = { top: 20, right: 20, bottom: 36, left: 40 };
    const chartW = W - PAD.left - PAD.right, chartH = H - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, W, H);
    const allVals = [...d.properties, ...d.legal, ...d.users];
    const maxVal = Math.max(...allVals) * 1.2 || 1;
    const n = d.labels.length, xStep = chartW / (n - 1);
    const xPos = i => PAD.left + i * xStep;
    const yPos = v => PAD.top + chartH - (v / maxVal) * chartH;
    ctx.strokeStyle = DS.border; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + chartW, y); ctx.stroke();
      ctx.fillStyle = DS.textMuted; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), PAD.left - 6, y + 3);
    }
    ctx.fillStyle = DS.textMuted; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    d.labels.forEach((lbl, i) => ctx.fillText(lbl, xPos(i), H - 8));
    const drawLine = (data, stroke, fill) => {
      ctx.beginPath(); ctx.moveTo(xPos(0), yPos(data[0]));
      data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
      ctx.lineTo(xPos(data.length - 1), PAD.top + chartH); ctx.lineTo(xPos(0), PAD.top + chartH); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.moveTo(xPos(0), yPos(data[0]));
      data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
      ctx.stroke();
      data.forEach((v, i) => {
        ctx.beginPath(); ctx.arc(xPos(i), yPos(v), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = stroke; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    };
    drawLine(d.properties, DS.primary, 'rgba(200,75,0,0.08)');
    drawLine(d.legal, '#6D28D9', 'rgba(109,40,217,0.08)');
    drawLine(d.users, '#15803D', 'rgba(21,128,61,0.08)');
  }, [timeRange, stats]);

  useEffect(() => {
    const canvas = pieRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, R = 75, r = 38;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pieData = [
      { value: stats.brokers || 0,          color: DS.primary },
      { value: stats.lawyers || 0,          color: '#6D28D9'  },
      { value: stats.pendingApprovals || 0, color: '#F59E0B'  },
      { value: Math.max((stats.totalUsers || 0) - (stats.brokers || 0) - (stats.lawyers || 0) - (stats.pendingApprovals || 0), 0), color: DS.border },
    ].filter(p => p.value > 0);
    const sum = pieData.reduce((a, b) => a + b.value, 0) || 1;
    let angle = -Math.PI / 2;
    pieData.forEach(p => {
      const slice = (p.value / sum) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, angle, angle + slice); ctx.closePath();
      ctx.fillStyle = p.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      angle += slice;
    });
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = DS.text; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(stats.totalUsers || 0, cx, cy - 7);
    ctx.fillStyle = DS.textMuted; ctx.font = '10px sans-serif'; ctx.fillText('Total', cx, cy + 9);
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Users,    label: 'Total Users',    value: stats.totalUsers,       sub: `${stats.brokers||0} Brokers`, color: 'blue'   },
          { icon: Building2,label: 'Properties',     value: stats.properties,       sub: 'All listings',                color: 'green'  },
          { icon: Layers,   label: 'Land Leads',     value: stats.landRequirements, sub: 'Submitted',                   color: 'sky'    },
          { icon: Scale,    label: 'Legal Requests', value: stats.legalRequests,    sub: 'Total',                       color: 'purple' },
        ].map(c => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} colorStyle={COLORS[c.color]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line chart */}
        <div style={{ background: DS.card, borderColor: DS.border }} className="lg:col-span-2 border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold">Activity Trend</h3>
              <p style={{ color: DS.textMuted }} className="text-xs mt-0.5">Properties · Legal · New Users</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3 mr-3">
                {[[DS.primary,'Properties'],['#6D28D9','Legal'],['#15803D','Users']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    <span style={{ color: DS.textMuted }} className="text-xs">{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: DS.bg }} className="flex rounded-xl p-1 gap-1">
                {['week','month'].map(r => (
                  <button key={r} onClick={() => setTimeRange(r)}
                    style={timeRange === r ? { background: DS.card, color: DS.text } : { color: DS.textMuted }}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition-all">
                    {r === 'week' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <canvas ref={lineRef} width={700} height={260} className="w-full" />
        </div>

        {/* Pie chart */}
        <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl p-6 flex flex-col">
          <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold mb-4">User Breakdown</h3>
          <div className="flex justify-center">
            <canvas ref={pieRef} width={200} height={200} />
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              { label: 'Brokers', val: stats.brokers||0, color: DS.primary },
              { label: 'Lawyers', val: stats.lawyers||0, color: '#6D28D9'  },
              { label: 'Pending', val: stats.pendingApprovals||0, color: '#F59E0B' },
              { label: 'Others',  val: Math.max((stats.totalUsers||0)-(stats.brokers||0)-(stats.lawyers||0)-(stats.pendingApprovals||0),0), color: DS.border },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span style={{ color: DS.textSub }} className="text-sm">{s.label}</span>
                </div>
                <span style={{ color: DS.text }} className="text-sm font-bold">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl p-6">
          <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold mb-5">User Distribution</h3>
          {[
            { label: 'Brokers',          val: stats.brokers||0,          max: stats.totalUsers||1, color: DS.primary },
            { label: 'Lawyers',           val: stats.lawyers||0,          max: stats.totalUsers||1, color: '#6D28D9'  },
            { label: 'Pending Approval',  val: stats.pendingApprovals||0, max: stats.totalUsers||1, color: '#F59E0B'  },
          ].map(s => (
            <div key={s.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: DS.textSub }} className="font-medium">{s.label}</span>
                <span style={{ color: DS.text }} className="font-bold">{s.val} <span style={{ color: DS.textMuted }} className="font-normal text-xs">/ {stats.totalUsers||0}</span></span>
              </div>
              <div style={{ background: DS.bg }} className="h-2.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((s.val/(stats.totalUsers||1))*100,100)}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-2xl p-6">
          <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold mb-5">Platform Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label:'Total Users',    val: stats.totalUsers||0,       icon:'👥', bg: DS.primaryLight,  color: DS.primary },
              { label:'Properties',     val: stats.properties||0,       icon:'🏠', bg: '#F0FDF4',        color: '#15803D'  },
              { label:'Land Leads',     val: stats.landRequirements||0, icon:'🌾', bg: '#F0F9FF',        color: '#0284C7'  },
              { label:'Legal Requests', val: stats.legalRequests||0,    icon:'⚖️', bg: '#F5F3FF',        color: '#6D28D9'  },
              { label:'Pending',        val: stats.pendingApprovals||0, icon:'⏳', bg: '#FFFBEB',        color: '#B45309'  },
              { label:'Lawyers',        val: stats.lawyers||0,          icon:'👨‍⚖️', bg: '#F5F3FF',        color: '#6D28D9'  },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: s.bg }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteAdminPanel;
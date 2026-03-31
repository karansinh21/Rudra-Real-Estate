import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { legalAPI } from '../../services/api';
import {
  FileText, CheckCircle, Search, Settings, BarChart2, Star, LogOut, Scale,
  Phone, Mail, User, Calendar, Clock, Building2, ChevronDown, ChevronUp,
  Bell, RefreshCw, Home, Layers
} from 'lucide-react';

const DS = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const Sidebar = ({ active }) => {
  const links = [
    { label: 'Dashboard', to: '/lawyer/dashboard', icon: BarChart2 },
    { label: 'Requests',  to: '/lawyer/requests',  icon: FileText  },
    { label: 'Services',  to: '/lawyer/services',  icon: Star      },
    { label: 'Settings',  to: '/lawyer/settings',  icon: Settings  },
  ];
  return (
    <aside style={{ background: DS.card, borderColor: DS.border }}
      className="hidden lg:flex flex-col w-64 min-h-screen border-r px-5 py-8">
      <div className="flex items-center gap-3 mb-10 px-1">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow" style={{ background: DS.primary }}>
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <span style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-base block leading-none">Rudra</span>
          <span style={{ color: DS.textMuted }} className="text-[10px] font-semibold tracking-widest uppercase">Legal Portal</span>
        </div>
      </div>
      <p style={{ color: DS.textMuted }} className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2">Menu</p>
      <nav className="flex-1 space-y-0.5">
        {links.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to}
            style={active === label ? { background: DS.primary, color: '#fff' } : { color: DS.textSub }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80">
            <Icon className="w-4 h-4" />
            {label}
            {active === label && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
          </Link>
        ))}
      </nav>
      <div style={{ background: DS.bg, borderColor: DS.border }} className="mt-6 p-3 rounded-2xl border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: DS.primary }}>RL</div>
          <div className="flex-1 min-w-0">
            <p style={{ color: DS.text }} className="text-xs font-semibold truncate">Rudra Legal</p>
            <p style={{ color: DS.textMuted }} className="text-[10px]">Advocate</p>
          </div>
          <button style={{ color: DS.textMuted }} className="hover:text-red-400 transition-colors"><LogOut className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </aside>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:     { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'Pending'     },
    IN_PROGRESS: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'In Progress' },
    COMPLETED:   { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Completed'   },
    REJECTED:    { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Rejected'    },
  };
  const s = map[status] || { bg: DS.bg, color: DS.textSub, border: DS.border, label: status };
  return (
    <span style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

const RequestCard = ({ req, onStatusUpdate, updating }) => {
  const [expanded, setExpanded] = useState(false);
  const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtT = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const serviceName     = req.serviceType || req.service?.name || req.service?.serviceName || 'Legal Service';
  const serviceCategory = req.service?.category || '';
  const clientName      = req.clientName    || '—';
  const clientContact   = req.clientContact || req.clientPhone || '—';
  const clientEmail     = req.clientEmail   || '—';
  const propertyDetails = req.propertyDetails || req.description || '';
  const brokerName      = req.broker?.name || '—';

  const isPending    = req.status === 'PENDING';
  const isInProgress = req.status === 'IN_PROGRESS';
  const isCompleted  = req.status === 'COMPLETED';
  const isRejected   = req.status === 'REJECTED';

  return (
    <div style={{ background: DS.card, borderColor: DS.border }}
      className="border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div style={{ background: DS.primaryLight }}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                {serviceCategory === 'land'
                  ? <Layers style={{ color: DS.primary }} className="w-3.5 h-3.5" />
                  : <Home style={{ color: DS.primary }} className="w-3.5 h-3.5" />}
              </div>
              <p style={{ color: DS.text }} className="text-sm font-bold">{serviceName}</p>
              <StatusBadge status={req.status} />
              {serviceCategory && (
                <span style={{ background: DS.primaryLight, color: DS.primary }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {serviceCategory === 'land' ? '🌾 Land' : '🏠 Property'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: DS.textSub }}>
                <User className="w-3 h-3" style={{ color: DS.textMuted }} />
                <span className="font-medium" style={{ color: DS.text }}>{clientName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: DS.textSub }}>
                <Phone className="w-3 h-3" style={{ color: DS.textMuted }} />
                <a href={`tel:${clientContact}`} style={{ color: DS.primary }} className="font-medium hover:underline">{clientContact}</a>
              </div>
              {clientEmail !== '—' && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: DS.textSub }}>
                  <Mail className="w-3 h-3" style={{ color: DS.textMuted }} />
                  <a href={`mailto:${clientEmail}`} style={{ color: DS.primary }} className="font-medium hover:underline">{clientEmail}</a>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs" style={{ color: DS.textMuted }}>
                <Calendar className="w-3 h-3" />
                <span>Requested: {fmt(req.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPending && (
              <>
                <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'IN_PROGRESS')}
                  style={{ background: DS.primary }} className="px-3 py-1.5 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-all">
                  {updating === req.id ? '...' : '▶ Start'}
                </button>
                <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'REJECTED')}
                  className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg disabled:opacity-40 transition-all">Reject</button>
              </>
            )}
            {isInProgress && (
              <button disabled={updating === req.id} onClick={() => onStatusUpdate(req.id, 'COMPLETED')}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg disabled:opacity-40 flex items-center gap-1 transition-all">
                <CheckCircle className="w-3 h-3" />{updating === req.id ? '...' : 'Complete'}
              </button>
            )}
            {isCompleted && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> Done
              </span>
            )}
            {isRejected && (
              <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">Rejected</span>
            )}
            <button onClick={() => setExpanded(!expanded)}
              style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-70 transition-all">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ background: DS.bg, borderColor: DS.border }} className="border-t px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 style={{ color: DS.textMuted }} className="text-xs font-bold uppercase tracking-wider">Booking Details</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Client Name', val: clientName },
                  { label: 'Phone', val: clientContact, isPhone: true },
                  { label: 'Requested By', val: brokerName },
                  { label: 'Service', val: serviceName },
                ].map(({ label, val, isPhone }) => (
                  <div key={label} style={{ background: DS.card, borderColor: DS.border }}
                    className="rounded-xl p-3 border">
                    <p style={{ color: DS.textMuted }} className="text-[10px] font-semibold uppercase mb-1">{label}</p>
                    {isPhone
                      ? <a href={`tel:${val}`} style={{ color: DS.primary }} className="text-sm font-bold hover:underline">{val}</a>
                      : <p style={{ color: DS.text }} className="text-sm font-bold">{val}</p>}
                  </div>
                ))}
                {clientEmail !== '—' && (
                  <div style={{ background: DS.card, borderColor: DS.border }} className="rounded-xl p-3 border col-span-2">
                    <p style={{ color: DS.textMuted }} className="text-[10px] font-semibold uppercase mb-1">Email</p>
                    <a href={`mailto:${clientEmail}`} style={{ color: DS.primary }} className="text-sm font-bold hover:underline">{clientEmail}</a>
                  </div>
                )}
                {propertyDetails && (
                  <div style={{ background: DS.card, borderColor: DS.border }} className="rounded-xl p-3 border col-span-2">
                    <p style={{ color: DS.textMuted }} className="text-[10px] font-semibold uppercase mb-1">Property / Case Details</p>
                    <p style={{ color: DS.textSub }} className="text-sm leading-relaxed">{propertyDetails}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ color: DS.textMuted }} className="text-xs font-bold uppercase tracking-wider mb-4">Progress Timeline</h4>
              <div className="relative">
                <div style={{ background: DS.border }} className="absolute left-3 top-3 bottom-3 w-px" />
                <div className="space-y-5 pl-2">
                  {[
                    { label: 'Request Received', done: true,  active: false, time: `${fmt(req.createdAt)} ${fmtT(req.createdAt)}` },
                    { label: 'Work In Progress', done: isInProgress || isCompleted, active: isInProgress, time: isInProgress || isCompleted ? 'Started' : 'Waiting' },
                    { label: 'Completed',        done: isCompleted, active: false, time: isCompleted ? fmt(req.updatedAt) : 'Pending' },
                  ].map(({ label, done, active, time }) => (
                    <div key={label} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2"
                        style={{
                          background: done ? DS.primary : active ? DS.primaryLight : DS.card,
                          borderColor: done ? DS.primary : active ? DS.primary : DS.border,
                        }}>
                        {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        {active && !done && <span className="w-2 h-2 rounded-full" style={{ background: DS.primary }} />}
                      </div>
                      <div>
                        <p style={{ color: done || active ? DS.text : DS.textMuted }} className="text-xs font-semibold">{label}</p>
                        {time && <p style={{ color: DS.textMuted }} className="text-[10px] mt-0.5">{time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {isPending && (
                <div style={{ background: '#FFFBEB', borderColor: '#FDE68A' }} className="mt-5 rounded-xl p-3 border flex items-start gap-2">
                  <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">New Request!</p>
                    <p className="text-xs text-amber-600 mt-0.5">Client request pending che. "Start" click karo.</p>
                  </div>
                </div>
              )}
              {isCompleted && (
                <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Completed ✓</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Request successfully complete thay gai.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LawyerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    let data = [...requests];
    if (statusFilter !== 'ALL') data = data.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.clientName?.toLowerCase().includes(q) ||
        r.clientContact?.toLowerCase().includes(q) ||
        r.serviceType?.toLowerCase().includes(q) ||
        r.service?.name?.toLowerCase().includes(q) ||
        r.broker?.name?.toLowerCase().includes(q) ||
        r.propertyDetails?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [requests, search, statusFilter]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await legalAPI.getAllRequests();
      const list = res.data?.requests || res.data || [];
      setRequests(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
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
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
  };

  const filterConfig = [
    { key: 'ALL',         label: 'All'         },
    { key: 'PENDING',     label: 'Pending'     },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   },
  ];

  if (loading) return (
    <div style={{ background: DS.bg }} className="flex min-h-screen">
      <Sidebar active="Requests" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: DS.border, borderTopColor: DS.primary }} />
          <p style={{ color: DS.textMuted }} className="text-sm">Loading requests...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }} className="flex min-h-screen">
      <Sidebar active="Requests" />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header style={{ background: 'rgba(249,246,242,0.85)', borderColor: DS.border }}
          className="sticky top-0 z-10 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-base font-bold">Client Requests</h1>
            <p style={{ color: DS.textMuted }} className="text-xs mt-0.5">{requests.length} total · {counts.PENDING} pending action</p>
          </div>
          <button onClick={() => fetchData(true)}
            style={{ background: DS.card, borderColor: DS.border, color: DS.textSub }}
            className="flex items-center gap-2 text-xs border px-3 py-2 rounded-xl transition-all font-medium hover:opacity-70">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <div className="px-6 py-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',       count: counts.ALL,         bg: DS.primaryLight, color: DS.primary, border: DS.primaryBorder },
              { label: 'Pending',     count: counts.PENDING,     bg: '#FFFBEB',       color: '#B45309',  border: '#FDE68A'        },
              { label: 'In Progress', count: counts.IN_PROGRESS, bg: '#EFF6FF',       color: '#1D4ED8',  border: '#BFDBFE'        },
              { label: 'Completed',   count: counts.COMPLETED,   bg: '#F0FDF4',       color: '#15803D',  border: '#BBF7D0'        },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderColor: s.border, color: s.color }}
                className="rounded-2xl border p-4">
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search style={{ color: DS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Client naam, phone, service..."
                style={{ borderColor: DS.border, color: DS.text, background: DS.card }}
                className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterConfig.map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  style={statusFilter === f.key
                    ? { background: DS.primary, borderColor: DS.primary, color: '#fff' }
                    : { background: DS.card, borderColor: DS.border, color: DS.textSub }}
                  className="px-3 py-2 rounded-xl text-xs font-bold border transition-all">
                  {f.label} ({counts[f.key]})
                </button>
              ))}
            </div>
          </div>

          {/* Pending alert */}
          {counts.PENDING > 0 && statusFilter === 'ALL' && (
            <div style={{ background: '#FFFBEB', borderColor: '#FDE68A' }} className="flex items-center gap-3 border rounded-2xl px-4 py-3">
              <Bell className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                <span className="font-bold">{counts.PENDING} new request{counts.PENDING > 1 ? 's' : ''}</span> pending — action joiye!
              </p>
            </div>
          )}

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ background: DS.card, borderColor: DS.border }}
              className="border rounded-2xl py-16 text-center">
              <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
                className="w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-3">
                <FileText style={{ color: DS.primary }} className="w-6 h-6" />
              </div>
              <p style={{ color: DS.text }} className="font-semibold mb-1">Koi request nathi</p>
              <p style={{ color: DS.textMuted }} className="text-sm">
                {search ? 'Search result khali che' : 'Client book karse tyare yahan dikhashe'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(req => (
                <RequestCard key={req.id} req={req} onStatusUpdate={updateStatus} updating={updating} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerRequests;
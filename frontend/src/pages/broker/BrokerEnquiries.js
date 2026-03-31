import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MessageSquare, CheckCircle, Building2,
  Search, AlertCircle, Loader2, X, RefreshCw
} from 'lucide-react';
import BrokerLayout from './BrokerLayout';

const API   = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DS = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const STATUS_META = {
  PENDING:   { label: 'Pending',   bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  CONTACTED: { label: 'Contacted', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  CLOSED:    { label: 'Closed',    bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  NEW:       { label: 'New',       bg: DS.primaryLight, color: DS.primary, border: DS.primaryBorder },
};

const BrokerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filter,    setFilter]    = useState('');
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => { fetchEnquiries(); }, []);
  useEffect(() => {
    let result = [...enquiries];
    if (filter)        result = result.filter(e => e.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.clientName?.toLowerCase().includes(q) ||
        e.clientPhone?.includes(q) ||
        e.clientEmail?.toLowerCase().includes(q) ||
        e.property?.title?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [enquiries, filter, search]);

  const fetchEnquiries = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/brokers/me/enquiries`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setEnquiries(data.enquiries || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Update failed'); }
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err) { setError(err.message); }
    finally { setUpdating(null); }
  };

  const counts = {
    all:       enquiries.length,
    PENDING:   enquiries.filter(e => e.status === 'PENDING').length,
    CONTACTED: enquiries.filter(e => e.status === 'CONTACTED').length,
    CLOSED:    enquiries.filter(e => e.status === 'CLOSED').length,
    NEW:       enquiries.filter(e => e.status === 'NEW').length,
  };

  const tabs = [
    { value: '',          label: 'All',       count: counts.all       },
    { value: 'PENDING',   label: 'Pending',   count: counts.PENDING   },
    { value: 'NEW',       label: 'New',       count: counts.NEW       },
    { value: 'CONTACTED', label: 'Contacted', count: counts.CONTACTED },
    { value: 'CLOSED',    label: 'Closed',    count: counts.CLOSED    },
  ];

  return (
    <BrokerLayout>
      <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }}
        className="px-6 lg:px-10 py-8 max-w-5xl mx-auto min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-2xl font-bold">Enquiries</h1>
            <p style={{ color: DS.textMuted }} className="text-sm mt-0.5">{filtered.length} of {enquiries.length} total</p>
          </div>
          <button onClick={fetchEnquiries}
            style={{ background: DS.card, borderColor: DS.border, color: DS.textSub }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all hover:opacity-70">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              style={filter === tab.value
                ? { background: DS.primary, borderColor: DS.primary, color: '#fff' }
                : { background: DS.card, borderColor: DS.border, color: DS.textSub }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all">
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={filter === tab.value
                  ? { background: 'rgba(255,255,255,0.2)' }
                  : { background: DS.bg, color: DS.textMuted }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search style={{ color: DS.textMuted }} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, property..."
            style={{ background: DS.card, borderColor: DS.border, color: DS.text }}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 placeholder-stone-400 text-sm focus:outline-none transition-all" />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ color: DS.textMuted }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder, color: DS.primary }}
            className="flex items-center gap-2 border px-4 py-3 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 style={{ color: DS.primary }} className="w-8 h-8 animate-spin mb-3" />
            <p style={{ color: DS.textMuted }} className="text-sm">Loading enquiries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: DS.card, borderColor: DS.border }}
            className="rounded-2xl border p-16 text-center">
            <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
              className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-4">
              <MessageSquare style={{ color: DS.primary }} className="w-8 h-8" />
            </div>
            <p style={{ color: DS.text }} className="font-semibold mb-1">
              {filter || search ? 'Koi match nathi' : 'Haju koi enquiry nathi'}
            </p>
            <p style={{ color: DS.textMuted }} className="text-sm">
              {filter || search ? 'Filter change karo' : 'Property list thai jay etle yahan dikhashe'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((enq) => {
              const sm = STATUS_META[enq.status] || STATUS_META.NEW;
              const isUpdating = updating === enq.id;
              return (
                <div key={enq.id} style={{ background: DS.card, borderColor: DS.border }}
                  className="rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
                          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0">
                          <span style={{ color: DS.primary }} className="font-bold text-sm">
                            {enq.clientName?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 style={{ color: DS.text }} className="font-bold text-sm">{enq.clientName}</h3>
                            <span style={{ background: sm.bg, color: sm.color, borderColor: sm.border }}
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full border">{sm.label}</span>
                          </div>
                          <div style={{ color: DS.textMuted }} className="flex items-center gap-1 text-xs mt-0.5">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{enq.property?.title || 'Property'}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: DS.textMuted }} className="text-xs shrink-0">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                      <a href={`tel:${enq.clientPhone}`} style={{ color: DS.primary }}
                        className="flex items-center gap-1.5 text-xs font-medium hover:underline transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {enq.clientPhone}
                      </a>
                      <a href={`mailto:${enq.clientEmail}`} style={{ color: DS.textSub }}
                        className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {enq.clientEmail}
                      </a>
                    </div>

                    {enq.message && (
                      <div style={{ background: DS.bg, borderColor: DS.border }}
                        className="mt-3 border rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare style={{ color: DS.textMuted }} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <p style={{ color: DS.textSub }} className="text-xs leading-relaxed">{enq.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: DS.bg, borderColor: DS.border }}
                    className="px-5 py-3 border-t flex items-center gap-2 flex-wrap">
                    <span style={{ color: DS.textMuted }} className="text-xs font-medium mr-1">Update:</span>

                    {enq.status !== 'CONTACTED' && enq.status !== 'CLOSED' && (
                      <button onClick={() => updateStatus(enq.id, 'CONTACTED')} disabled={isUpdating}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 disabled:opacity-50 transition-all">
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Phone className="w-3 h-3" />}
                        Contacted
                      </button>
                    )}
                    {enq.status !== 'CLOSED' && (
                      <button onClick={() => updateStatus(enq.id, 'CLOSED')} disabled={isUpdating}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-all">
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Close
                      </button>
                    )}
                    {enq.status === 'CLOSED' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Enquiry Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BrokerLayout>
  );
};

export default BrokerEnquiries;
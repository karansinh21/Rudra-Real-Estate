import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, CheckCircle, AlertCircle,
  MapPin, Square, Home, Leaf, Search,
  ChevronLeft, ChevronRight, Loader2, X
} from 'lucide-react';
import BrokerLayout from './BrokerLayout';

const API   = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DS = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const fmt = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${Number(p).toLocaleString()}`;
};

const TYPE_META = {
  RESIDENTIAL:  { label: 'Residential',  emoji: '🏠', bg: DS.primaryLight, color: DS.primary,  border: DS.primaryBorder  },
  COMMERCIAL:   { label: 'Commercial',   emoji: '🏢', bg: '#EFF6FF',       color: '#1D4ED8',    border: '#BFDBFE'         },
  AGRICULTURAL: { label: 'Agricultural', emoji: '🌾', bg: '#F0FDF4',       color: '#15803D',    border: '#BBF7D0'         },
  INDUSTRIAL:   { label: 'Industrial',   emoji: '🏭', bg: '#FFF7ED',       color: '#C2410C',    border: '#FED7AA'         },
  LAND:         { label: 'Land / Plot',  emoji: '🗺️', bg: '#F7FEE7',       color: '#4D7C0F',    border: '#D9F99D'         },
};

const LAND_TYPES     = ['LAND', 'AGRICULTURAL', 'INDUSTRIAL'];
const PROPERTY_TYPES = ['RESIDENTIAL', 'COMMERCIAL'];

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const meta   = TYPE_META[property.type] || TYPE_META.RESIDENTIAL;
  const isLand = LAND_TYPES.includes(property.type);
  let imgSrc = null;
  try {
    const imgs = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    if (Array.isArray(imgs) && imgs.length) imgSrc = imgs[0]?.thumbnail || imgs[0]?.url;
  } catch {}

  return (
    <div style={{ background: DS.card, borderColor: DS.border }}
      className="group border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-stone-100 overflow-hidden shrink-0">
        {imgSrc
          ? <img src={imgSrc} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${DS.bg}, #EDE8E3)` }}>
              <span className="text-5xl">{meta.emoji}</span>
            </div>}
        <div className="absolute top-3 left-3">
          <span style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
            className="text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm">
            {meta.emoji} {meta.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span style={property.purpose === 'SALE'
            ? { background: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' }
            : { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
            className="text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm">
            {property.purpose === 'SALE' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(property.id)}
            style={{ background: 'rgba(255,255,255,0.9)', color: DS.textSub }}
            className="w-8 h-8 flex items-center justify-center rounded-xl shadow-sm hover:text-orange-600 transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(property)}
            style={{ background: 'rgba(255,255,255,0.9)', color: DS.textSub }}
            className="w-8 h-8 flex items-center justify-center rounded-xl shadow-sm hover:text-red-500 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 style={{ color: DS.text }} className="font-bold text-sm mb-1 line-clamp-1">{property.title}</h3>
        <div style={{ color: DS.textMuted }} className="flex items-center gap-1 text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{property.address || property.city}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: DS.primary }} className="font-bold text-base">{fmt(property.price)}</span>
          <div style={{ color: DS.textMuted }} className="flex items-center gap-1 text-xs">
            <Square className="w-3 h-3" />
            {property.area?.toLocaleString()} {isLand ? (property.areaUnit || 'sqft') : 'sqft'}
          </div>
        </div>
        {property.features?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.features.slice(0, 3).map((f, i) => (
              <span key={i} style={{ background: DS.primaryLight, color: DS.primary, borderColor: DS.primaryBorder }}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium border">{f}</span>
            ))}
            {property.features.length > 3 && (
              <span style={{ background: DS.bg, color: DS.textMuted, borderColor: DS.border }}
                className="text-[11px] border px-2 py-0.5 rounded-full">+{property.features.length - 3}</span>
            )}
          </div>
        )}
        <div style={{ borderColor: DS.border }} className="flex gap-2 mt-auto pt-3 border-t">
          <button onClick={() => onEdit(property.id)}
            style={{ borderColor: DS.primaryBorder, color: DS.primary, background: DS.primaryLight }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all hover:opacity-80">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => onDelete(property)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const BrokerProperties = () => {
  const navigate = useNavigate();
  const [mainTab,      setMainTab]      = useState('property');
  const [subFilter,    setSubFilter]    = useState('all');
  const [search,       setSearch]       = useState('');
  const [properties,   setProperties]   = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [toast,        setToast]        = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const propertySubFilters = [
    { value: 'all',         label: 'All',         emoji: '🏘️' },
    { value: 'RESIDENTIAL', label: 'Residential', emoji: '🏠' },
    { value: 'COMMERCIAL',  label: 'Commercial',  emoji: '🏢' },
    { value: 'SALE',        label: 'For Sale',    emoji: '💰' },
    { value: 'RENT',        label: 'For Rent',    emoji: '🔑' },
  ];

  const landSubFilters = [
    { value: 'all',          label: 'All Land',     emoji: '🗺️' },
    { value: 'LAND',         label: 'Plot / Land',  emoji: '🌍' },
    { value: 'AGRICULTURAL', label: 'Agricultural', emoji: '🌾' },
    { value: 'INDUSTRIAL',   label: 'Industrial',   emoji: '🏭' },
  ];

  const fetchProperties = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/properties/my/properties`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Load failed');
      let all = data.properties || [];

      if (mainTab === 'property') {
        all = all.filter(x => PROPERTY_TYPES.includes(x.type));
        if (subFilter === 'SALE') all = all.filter(x => x.purpose === 'SALE');
        else if (subFilter === 'RENT') all = all.filter(x => x.purpose === 'RENT');
        else if (subFilter !== 'all') all = all.filter(x => x.type === subFilter);
      } else {
        all = all.filter(x => LAND_TYPES.includes(x.type));
        if (subFilter !== 'all') all = all.filter(x => x.type === subFilter);
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        all = all.filter(x =>
          x.title?.toLowerCase().includes(q) ||
          x.city?.toLowerCase().includes(q) ||
          x.address?.toLowerCase().includes(q)
        );
      }

      setTotal(all.length);
      const PER = 9;
      const pages = Math.max(1, Math.ceil(all.length / PER));
      setTotalPages(pages);
      const cur = Math.min(p, pages);
      setPage(cur);
      setProperties(all.slice((cur - 1) * PER, cur * PER));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [mainTab, subFilter, search]);

  useEffect(() => { setSubFilter('all'); setPage(1); }, [mainTab]);
  useEffect(() => { fetchProperties(1); }, [mainTab, subFilter]);
  const handleSearch = (e) => { if (e.key === 'Enter') fetchProperties(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res  = await fetch(`${API}/properties/${deleteTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setProperties(prev => prev.filter(p => p.id !== deleteTarget.id));
      setTotal(prev => prev - 1);
      showToast('Property deleted successfully');
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const currentSubFilters = mainTab === 'property' ? propertySubFilters : landSubFilters;

  return (
    <BrokerLayout>
      {/* Toast */}
      {toast && (
        <div style={{ background: DS.primary }}
          className="fixed top-5 right-5 z-50 flex items-center gap-2 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
          <div style={{ background: DS.card, borderColor: DS.border }}
            className="border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-center mb-1">Delete Property?</p>
            <p style={{ color: DS.textMuted }} className="text-sm text-center mb-1 truncate px-4">{deleteTarget.title}</p>
            <p style={{ color: DS.textMuted }} className="text-xs text-center mb-5">Permanent — undo nahi thay</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} style={{ borderColor: DS.border, color: DS.textSub }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:opacity-70 transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50 transition-all">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }}
        className="px-6 lg:px-10 py-8 max-w-7xl mx-auto min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-2xl font-bold">My Listings</h1>
            <p style={{ color: DS.textMuted }} className="text-sm mt-0.5">{total} total listings</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/broker/properties/add?type=land')}
              className="hidden sm:flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md bg-emerald-600 hover:bg-emerald-700">
              <Leaf className="w-4 h-4" /> Add Land
            </button>
            <button onClick={() => navigate('/broker/properties/add')}
              style={{ background: DS.primary }}
              className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-90">
              <Plus className="w-4 h-4" /> Add Property
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{ background: DS.border }} className="inline-flex rounded-xl p-1 mb-5">
          <button onClick={() => setMainTab('property')}
            style={mainTab === 'property'
              ? { background: DS.card, color: DS.primary }
              : { color: DS.textSub }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all">
            <Home className="w-4 h-4" /> Property
          </button>
          <button onClick={() => setMainTab('land')}
            style={mainTab === 'land'
              ? { background: DS.card, color: '#15803D' }
              : { color: DS.textSub }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all">
            <Leaf className="w-4 h-4" /> Land
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search style={{ color: DS.textMuted }} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            placeholder={mainTab === 'property' ? 'Search properties... (Enter)' : 'Search land listings...'}
            style={{ background: DS.card, borderColor: DS.border, color: DS.text }}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 placeholder-stone-400 text-sm focus:outline-none transition-all" />
          {search && (
            <button onClick={() => { setSearch(''); fetchProperties(1); }}
              style={{ color: DS.textMuted }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sub Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {currentSubFilters.map(f => (
            <button key={f.value} onClick={() => setSubFilter(f.value)}
              style={subFilter === f.value
                ? { background: DS.primary, borderColor: DS.primary, color: '#fff' }
                : { background: DS.card, borderColor: DS.border, color: DS.textSub }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border">
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder, color: DS.primary }}
            className="flex items-center gap-2 border px-4 py-3 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: DS.card, borderColor: DS.border }}
                className="border rounded-2xl overflow-hidden animate-pulse">
                <div style={{ background: DS.bg }} className="h-44" />
                <div className="p-4 space-y-3">
                  <div style={{ background: DS.bg }} className="h-4 rounded w-3/4" />
                  <div style={{ background: DS.bg }} className="h-3 rounded w-1/2" />
                  <div style={{ background: DS.bg }} className="h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
              className="w-20 h-20 rounded-3xl border flex items-center justify-center mb-4">
              {mainTab === 'land'
                ? <Leaf className="w-9 h-9 text-emerald-500" />
                : <Home style={{ color: DS.primary }} className="w-9 h-9" />}
            </div>
            <p style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold mb-1">
              {mainTab === 'land' ? 'Koi land listing nathi' : 'Koi property nathi'}
            </p>
            <p style={{ color: DS.textMuted }} className="text-sm mb-6">
              {search ? 'Search result ma koi match nathi' : 'Pehli listing add karo'}
            </p>
            {!search && (
              <button onClick={() => navigate(mainTab === 'land' ? '/broker/properties/add?type=land' : '/broker/properties/add')}
                style={{ background: DS.primary }}
                className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all">
                {mainTab === 'land' ? <><Leaf className="w-4 h-4" /> Add Land</> : <><Plus className="w-4 h-4" /> Add Property</>}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p}
                  onEdit={id => navigate(`/broker/properties/edit/${id}`)}
                  onDelete={setDeleteTarget} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => fetchProperties(page - 1)} disabled={page === 1}
                  style={{ background: DS.card, borderColor: DS.border, color: DS.textMuted }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border disabled:opacity-30 transition-all hover:opacity-70">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => fetchProperties(n)}
                    style={n === page
                      ? { background: DS.primary, color: '#fff', borderColor: DS.primary }
                      : { background: DS.card, color: DS.textSub, borderColor: DS.border }}
                    className="w-9 h-9 rounded-xl text-sm font-bold border transition-all hover:opacity-80">{n}</button>
                ))}
                <button onClick={() => fetchProperties(page + 1)} disabled={page === totalPages}
                  style={{ background: DS.card, borderColor: DS.border, color: DS.textMuted }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border disabled:opacity-30 transition-all hover:opacity-70">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BrokerLayout>
  );
};

export default BrokerProperties;
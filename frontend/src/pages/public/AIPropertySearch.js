import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Sparkles, MapPin, Bed, Bath, Square,
  SlidersHorizontal, X, Heart, ArrowUpRight, Loader2, Flame, ArrowLeft
} from 'lucide-react';
import { propertyAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const fmt = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(1)} L`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = (p) => {
  try {
    const imgs = typeof p.images==='string' ? JSON.parse(p.images) : p.images;
    if (Array.isArray(imgs) && imgs.length) return typeof imgs[0]==='string' ? imgs[0] : imgs[0]?.url;
  } catch {}
  return null;
};

const TYPE_DOT = {
  RESIDENTIAL:'#7c3aed', COMMERCIAL:'#C84B00',
  AGRICULTURAL:'#059669', INDUSTRIAL:'#d97706', LAND:'#16a34a',
};

const LAND_TYPES = new Set(['LAND','AGRICULTURAL','INDUSTRIAL']);

const ResultCard = ({ p, index, wished, onWish, t }) => {
  const navigate = useNavigate();
  const img = getImg(p);
  const dot = TYPE_DOT[p.type] || C.muted;
  const isLand = LAND_TYPES.has(p.type);

  return (
    <div
      onClick={() => navigate(`/property/${p.id}`)}
      style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', transition:'all 0.35s cubic-bezier(.22,1,.36,1)', animation:`cardReveal 0.5s cubic-bezier(.22,1,.36,1) ${index * 60}ms both` }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(26,8,0,0.12)'; e.currentTarget.style.borderColor=C.pBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=C.border; }}
    >
      <div style={{ position:'relative', height:200, background:'#f0ebe4', overflow:'hidden', flexShrink:0 }}>
        {img
          ? <img src={img} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }} onMouseEnter={e=>e.target.style.transform='scale(1.07)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>🏠</div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,8,0,0.45) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', borderRadius:99, padding:'5px 12px', fontSize:11, fontWeight:700, color:C.text, fontFamily:C.sans, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:dot }} /> {p.type}
        </div>
        <button onClick={e => { e.stopPropagation(); onWish(p.id); }}
          style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.96)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
          <Heart size={15} fill={wished?'#ef4444':'none'} color={wished?'#ef4444':C.muted} />
        </button>
        <div style={{ position:'absolute', bottom:12, left:12, right:12, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:10, fontWeight:600, fontFamily:C.sans, marginBottom:2 }}>
              {!isLand && p.purpose ? (p.purpose==='SALE' ? t('forSale').toUpperCase() : t('forRent').toUpperCase()) : t('price').toUpperCase()}
            </p>
            <p style={{ color:'#fff', fontFamily:C.serif, fontWeight:700, fontSize:20, lineHeight:1 }}>{fmt(p.price)}</p>
          </div>
          {p.status === 'AVAILABLE' && (
            <span style={{ display:'flex', alignItems:'center', gap:5, background:'#16a34a', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:99, fontFamily:C.sans }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.8)', animation:'pulse 1.5s ease-in-out infinite' }} /> {t('available').toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding:'16px 20px', flex:1, display:'flex', flexDirection:'column' }}>
        <p style={{ fontFamily:C.serif, fontWeight:700, fontSize:15, color:C.text, margin:'0 0 5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
        <div style={{ display:'flex', alignItems:'center', gap:5, color:C.muted, fontSize:12, marginBottom:12, fontFamily:C.sans }}>
          <MapPin size={12} /> {[p.city, p.state].filter(Boolean).join(', ') || 'Vadodara'}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {p.area && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Square size={10}/> {p.area?.toLocaleString()} {t('sqft')}</span>}
          {!isLand && p.bedrooms && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Bed size={10}/> {p.bedrooms} BHK</span>}
          {!isLand && p.bathrooms && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Bath size={10}/> {p.bathrooms}</span>}
        </div>
      </div>
    </div>
  );
};

export default function AIPropertySearch() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [params]     = useSearchParams();
  const [query,        setQuery]      = useState(params.get('search') || '');
  const [properties,   setProperties] = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [showFilters,  setShowFilters]= useState(false);
  const [wished,       setWished]     = useState(new Set());
  const [filters,      setFilters]    = useState({ type:'all', purpose:'all', minPrice:'', maxPrice:'', bedrooms:'' });
  const [hint,         setHint]       = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true); setHint('');
    try {
      const res = await propertyAPI.getAll({ search: query, limit: 50 });
      let list = res.data?.properties || [];
      if (filters.type !== 'all')    list = list.filter(p => p.type === filters.type);
      if (filters.purpose !== 'all') list = list.filter(p => p.purpose === filters.purpose);
      if (filters.minPrice) list = list.filter(p => p.price >= Number(filters.minPrice));
      if (filters.maxPrice) list = list.filter(p => p.price <= Number(filters.maxPrice));
      if (filters.bedrooms) { const b = parseInt(filters.bedrooms); list = list.filter(p => p.bedrooms >= b); }
      setProperties(list);
      if (query) setHint(`${list.length} ${t('noResults') !== 'No results found' ? '' : 'results'} "${query}"`);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  }, [query, filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const toggleWish = (id) => setWished(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selStyle = { background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'9px 12px', fontSize:13, color:C.text, fontFamily:C.sans, outline:'none', cursor:'pointer' };

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.sans }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,75,0,0.06) 0%, transparent 65%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:800, margin:'0 auto', padding:'20px 20px 0' }}>
          <button onClick={() => navigate(-1)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:13, fontWeight:600, fontFamily:C.sans, padding:0 }}
            onMouseEnter={e => e.currentTarget.style.color=C.primary}
            onMouseLeave={e => e.currentTarget.style.color=C.muted}>
            <ArrowLeft size={15}/> {t('back')}
          </button>
        </div>

        <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 20px 40px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:20, animation:'fadeIn 0.5s ease' }}>
            <Sparkles size={13} color={C.primary} />
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:C.sans }}>Smart Property Search · Rudra Real Estate</span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2rem,5vw,3.2rem)', color:C.text, fontWeight:700, marginBottom:12, lineHeight:1.15, animation:'slideUp 0.6s ease 0.1s both' }}>
            {t('findLawyer') !== 'Find a Lawyer' ? t('searchBtn') : 'Find Your'} <em style={{ fontStyle:'italic', color:C.primary }}>{t('heroTitle2') || 'Perfect Property'}</em>
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, marginBottom:32, animation:'slideUp 0.6s ease 0.2s both' }}>
            {t('heroSubtitle')}
          </p>

          <div style={{ display:'flex', alignItems:'center', background:C.bg, border:`2px solid ${query?C.pBorder:C.border}`, borderRadius:18, overflow:'hidden', maxWidth:580, margin:'0 auto 16px', boxShadow:'0 2px 12px rgba(26,8,0,0.04)', transition:'border 0.2s', animation:'slideUp 0.6s ease 0.3s both' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 16px', gap:8 }}>
              <Search size={18} color={C.muted} style={{ flexShrink:0 }} />
              <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchProperties()}
                placeholder={t('searchPlaceholder')}
                style={{ flex:1, border:'none', outline:'none', fontSize:14, color:C.text, padding:'14px 0', background:'transparent', fontFamily:C.sans }} />
              {query && <button onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, lineHeight:0 }}><X size={16}/></button>}
            </div>
            <button onClick={()=>setShowFilters(v=>!v)} style={{ padding:'0 14px', background:'none', border:'none', borderLeft:`1px solid ${C.border}`, cursor:'pointer', color:showFilters?C.primary:C.muted, transition:'color 0.2s' }}>
              <SlidersHorizontal size={18} />
            </button>
            <button onClick={fetchProperties} style={{ background:C.primary, color:'#fff', border:'none', padding:'0 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:C.sans, height:'100%', minHeight:50 }}>
              {t('searchBtn')}
            </button>
          </div>

          {hint && <p style={{ marginTop:16, fontSize:13, color:C.muted, fontFamily:C.sans, animation:'fadeIn 0.4s ease' }}><span style={{ color:C.primary, fontWeight:700 }}>✦</span> {hint}</p>}
        </div>
      </div>

      {showFilters && (
        <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, animation:'slideDown 0.25s ease' }}>
          <div style={{ maxWidth:900, margin:'0 auto', padding:'16px 20px' }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
              <select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})} style={selStyle}>
                <option value="all">{t('all')} {t('type')}</option>
                {['RESIDENTIAL','COMMERCIAL','AGRICULTURAL','LAND','INDUSTRIAL'].map(tp=><option key={tp} value={tp}>{tp}</option>)}
              </select>
              <select value={filters.purpose} onChange={e=>setFilters({...filters,purpose:e.target.value})} style={selStyle}>
                <option value="all">{t('forBuy')} / {t('forRent')}</option>
                <option value="SALE">{t('forSale')}</option>
                <option value="RENT">{t('forRent')}</option>
              </select>
              <input type="number" placeholder={`Min ₹`} value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})} style={{...selStyle,width:110}} />
              <input type="number" placeholder={`Max ₹`} value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} style={{...selStyle,width:110}} />
              <select value={filters.bedrooms} onChange={e=>setFilters({...filters,bedrooms:e.target.value})} style={selStyle}>
                <option value="">{t('bedrooms')}</option>
                {['1','2','3','4'].map(b=><option key={b} value={b}>{b}+ BHK</option>)}
              </select>
              <button onClick={()=>setFilters({type:'all',purpose:'all',minPrice:'',maxPrice:'',bedrooms:''})} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:12, padding:'9px 16px', fontSize:12, cursor:'pointer', color:C.muted, fontFamily:C.sans }}>{t('clearFilters')}</button>
              <button onClick={()=>{setShowFilters(false);fetchProperties();}} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:12, padding:'9px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, marginLeft:'auto', boxShadow:'0 4px 14px rgba(200,75,0,0.25)' }}>{t('filter')}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:C.text, margin:0 }}>
            {loading ? `${t('loading')}` : <>{properties.length} <em style={{ color:C.primary, fontStyle:'italic' }}>{t('properties')}</em></>}
          </h2>
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 0', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:20, background:C.pLight, display:'flex', alignItems:'center', justifyContent:'center', animation:'searchPulse 1s ease-in-out infinite' }}>
              <Search size={24} color={C.primary} />
            </div>
            <p style={{ color:C.muted, fontSize:14, fontFamily:C.sans }}>{t('loading')}</p>
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ width:64, height:64, borderRadius:20, background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Flame size={28} color={C.primary} />
            </div>
            <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, marginBottom:8 }}>{t('noPropsFound')}</p>
            <p style={{ color:C.muted, fontSize:14, fontFamily:C.sans }}>{t('noPropsSubtitle')}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:22 }}>
            {properties.map((p, i) => <ResultCard key={p.id} p={p} index={i} wished={wished.has(p.id)} onWish={toggleWish} t={t} />)}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown   { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes cardReveal  { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes searchPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.7} }
      `}</style>
    </div>
  );
}
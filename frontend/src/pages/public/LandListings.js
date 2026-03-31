import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { landAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';
import {
  Search, MapPin, Square, Heart, Phone,
  ChevronLeft, ChevronRight, AlertCircle,
  SlidersHorizontal, ArrowUpRight, X, Leaf, Loader2
} from 'lucide-react';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const fmt = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p/10000000).toFixed(1)} Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(1)} L`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = (images) => {
  const FALLBACK = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
  try {
    const arr = typeof images==='string' ? JSON.parse(images) : images;
    if (Array.isArray(arr) && arr.length>0) {
      const u = arr[0];
      return typeof u==='string' ? u : (u?.url||FALLBACK);
    }
  } catch {}
  return FALLBACK;
};

const gid = (obj) => obj?._id || obj?.id;

const TYPE_CFG = {
  AGRICULTURAL: { emoji:'🌾', label:'Agricultural', dot:'#16a34a' },
  LAND:         { emoji:'🗺️', label:'Plot / Land',  dot:'#84cc16' },
  INDUSTRIAL:   { emoji:'🏭', label:'Industrial',   dot:'#d97706' },
};

const Skeleton = () => (
  <div style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden' }}>
    <div style={{ height:200, background:'linear-gradient(90deg,#f0ebe4 25%,#e8e0d5 50%,#f0ebe4 75%)', backgroundSize:'200% 100%', animation:'shimmerBg 1.6s ease-in-out infinite' }} />
    <div style={{ padding:20 }}>
      {[80,55,40].map((w,i) => <div key={i} style={{ height:12, borderRadius:6, marginBottom:10, background:'linear-gradient(90deg,#f0ebe4 25%,#e8e0d5 50%,#f0ebe4 75%)', backgroundSize:'200% 100%', animation:'shimmerBg 1.6s ease-in-out infinite', width:`${w}%`, animationDelay:`${i*0.15}s` }} />)}
    </div>
  </div>
);

const LandCard = ({ land, liked, onToggleLike, index, t }) => {
  const navigate = useNavigate();
  const tc = TYPE_CFG[land.type] || { emoji:'🌿', label:land.type, dot:C.muted };
  const img = getImg(land.images);
  const broker = land.broker?.name || 'Rudra Realty';
  const phone  = land.broker?.phone || '';
  const id = gid(land);

  return (
    <div onClick={() => navigate(`/property/${id}`)}
      style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', transition:'all 0.35s cubic-bezier(.22,1,.36,1)', animation:`slideUp 0.55s cubic-bezier(.22,1,.36,1) ${index*70}ms both` }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(26,8,0,0.12)'; e.currentTarget.style.borderColor=C.pBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=C.border; }}>
      <div style={{ position:'relative', height:200, overflow:'hidden', flexShrink:0 }}>
        <img src={img} alt={land.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }}
          onMouseEnter={e => e.target.style.transform='scale(1.07)'} onMouseLeave={e => e.target.style.transform='scale(1)'}
          onError={e => { e.target.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'; }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,8,0,0.5) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', borderRadius:99, padding:'5px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:tc.dot, flexShrink:0 }} />
          <span style={{ fontSize:11, fontWeight:700, color:C.text, fontFamily:C.sans }}>{tc.label}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onToggleLike(id); }}
          style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
          <Heart size={15} fill={liked?'#ef4444':'none'} color={liked?'#ef4444':C.muted}/>
        </button>
        <div style={{ position:'absolute', bottom:12, left:12, right:12, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:10, fontWeight:600, fontFamily:C.sans, marginBottom:2 }}>{t('price').toUpperCase()}</p>
            <p style={{ color:'#fff', fontFamily:C.serif, fontWeight:700, fontSize:20, lineHeight:1 }}>{fmt(land.price)}</p>
          </div>
          {land.status==='AVAILABLE' && (
            <span style={{ display:'flex', alignItems:'center', gap:5, background:'#16a34a', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:99, fontFamily:C.sans }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.8)', animation:'pulse 1.5s ease-in-out infinite' }} /> {t('available').toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', flex:1 }}>
        <h3 style={{ fontFamily:C.serif, fontSize:15, fontWeight:700, color:C.text, marginBottom:5, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{land.title}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:5, color:C.muted, fontSize:12, marginBottom:12, fontFamily:C.sans }}>
          <MapPin size={12}/>{[land.city, land.state].filter(Boolean).join(', ')||'Gujarat'}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}>
            <Square size={11}/> {land.area?.toLocaleString()||'–'} {t('sqft')}
          </span>
          {(land.features||[]).slice(0,2).map((f,i) => <span key={i} style={{ background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.primary, fontFamily:C.sans }}>{f}</span>)}
          {(land.features?.length||0)>2 && <span style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, color:C.muted, fontFamily:C.sans }}>+{land.features.length-2}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${C.border}`, marginTop:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:C.pLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:C.primary, fontFamily:C.sans }}>{broker.charAt(0)}</div>
            <div>
              <p style={{ fontSize:9, color:C.muted, fontFamily:C.sans, marginBottom:1 }}>LISTED BY</p>
              <p style={{ fontSize:11, fontWeight:700, color:C.sub, fontFamily:C.sans, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{broker}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {phone && <a href={`tel:${phone}`} onClick={e => e.stopPropagation()} style={{ width:32, height:32, borderRadius:10, background:'#16a34a', color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}><Phone size={13}/></a>}
            <button onClick={e => { e.stopPropagation(); navigate(`/property/${id}`); }}
              style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 14px', borderRadius:10, background:C.text, color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:C.sans, transition:'background 0.2s' }}>
              {t('viewDetails')} <ArrowUpRight size={11}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandListings = () => {
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t }          = useLanguage();

  const TYPE_FILTERS = [
    { value:'all',          label:t('all')+' '+t('landPlots'), emoji:'🌍' },
    { value:'land',         label:'Plot / Land',               emoji:'🗺️' },
    { value:'agricultural', label:t('agricultural'),           emoji:'🌾' },
    { value:'industrial',   label:t('industrial'),             emoji:'🏭' },
  ];

  const [listings,   setListings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [liked,      setLiked]      = useState(new Set());
  const [showF,      setShowF]      = useState(false);
  const [filters,    setFilters]    = useState({ landType:'all', minPrice:'', maxPrice:'', search:'' });
  const [applied,    setApplied]    = useState({ landType:'all', minPrice:'', maxPrice:'', search:'' });

  const fetchListings = useCallback(async (f, p=1) => {
    setLoading(true); setError('');
    try {
      const params = { page:p, limit:9 };
      if (f.landType!=='all') params.landType = f.landType.toUpperCase();
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.search)   params.search   = f.search;
      const res = await landAPI.getListings(params);
      setListings(res.data?.listings||[]);
      setTotal(res.data?.count||0);
      setTotalPages(res.data?.pages||1);
      setPage(p);
    } catch { setError(t('errorMsg')); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchListings(applied); }, []); // eslint-disable-line

  const toggleLike = async (id) => {
    const isLiked = liked.has(id);
    setLiked(prev => { const n=new Set(prev); isLiked?n.delete(id):n.add(id); return n; });
    if (isLoggedIn) {
      try { isLiked ? await wishlistAPI.remove(id) : await wishlistAPI.add(id); }
      catch { setLiked(prev => { const n=new Set(prev); isLiked?n.add(id):n.delete(id); return n; }); }
    }
  };

  const apply   = () => { setApplied({...filters}); fetchListings({...filters},1); setShowF(false); };
  const clear   = () => { const d={landType:'all',minPrice:'',maxPrice:'',search:''}; setFilters(d); setApplied(d); fetchListings(d,1); };
  const setType = tp => { const f={...applied,landType:tp}; setFilters(f); setApplied(f); fetchListings(f,1); };
  const hasActive = applied.landType!=='all'||applied.minPrice||applied.maxPrice||applied.search;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.sans }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:800, margin:'0 auto', padding:'56px 20px 44px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:20, animation:'fadeIn 0.5s ease' }}>
            <Leaf size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:C.sans }}>
              {t('landPlots')} · Rudra Real Estate
            </span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2rem,5vw,3.2rem)', color:C.text, fontWeight:700, marginBottom:12, lineHeight:1.15, animation:'slideUp 0.6s ease 0.1s both' }}>
            {t('heroTitle1')} <em style={{ fontStyle:'italic', color:C.primary }}>{t('landPlots')}</em>
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, marginBottom:32, animation:'slideUp 0.6s ease 0.2s both' }}>
            {t('heroSubtitle')}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg, border:`1px solid ${C.border}`, borderRadius:18, padding:'10px 16px', maxWidth:520, margin:'0 auto 24px', boxShadow:'0 2px 12px rgba(26,8,0,0.04)', animation:'slideUp 0.6s ease 0.3s both' }}>
            <Search size={18} color={C.muted} style={{ flexShrink:0 }}/>
            <input value={filters.search} onChange={e => setFilters(p=>({...p,search:e.target.value}))} onKeyDown={e => e.key==='Enter'&&apply()}
              placeholder={t('searchPlaceholder')}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:C.text, fontFamily:C.sans }}/>
            <button onClick={apply} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:12, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 4px 14px rgba(200,75,0,0.28)' }}>{t('searchBtn')}</button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', animation:'slideUp 0.6s ease 0.4s both' }}>
            {TYPE_FILTERS.map(tp => {
              const active = applied.landType===tp.value;
              return (
                <button key={tp.value} onClick={() => setType(tp.value)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:12, fontSize:12, fontWeight:700, fontFamily:C.sans, cursor:'pointer', transition:'all 0.2s', border:`1px solid ${active?C.primary:C.border}`, background:active?C.primary:C.card, color:active?'#fff':C.sub, boxShadow:active?'0 4px 12px rgba(200,75,0,0.22)':'none', transform:active?'translateY(-1px)':'none' }}>
                  {tp.emoji} {tp.label}
                </button>
              );
            })}
            <button onClick={() => setShowF(v=>!v)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:C.sans, transition:'all 0.2s', border:`1px solid ${showF||hasActive?C.text:C.border}`, background:showF||hasActive?C.text:C.card, color:showF||hasActive?'#fff':C.sub }}>
              <SlidersHorizontal size={13}/> {t('filter')} {hasActive&&'●'}
            </button>
          </div>
          {!loading&&total>0&&<p style={{ marginTop:20, fontSize:12, color:C.muted, fontFamily:C.sans, animation:'fadeIn 0.5s ease 0.5s both' }}>
            <strong style={{ color:C.primary }}>{total}</strong> {t('landPlots')}
          </p>}
        </div>
      </div>

      {showF && (
        <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, animation:'slideDown 0.25s ease' }}>
          <div style={{ maxWidth:800, margin:'0 auto', padding:'16px 20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { label:t('type'),        field:'landType',  isSelect:true },
                { label:`${t('minArea')} (₹)`, field:'minPrice', placeholder:'500000' },
                { label:`${t('maxArea')} (₹)`, field:'maxPrice', placeholder:'50000000' },
              ].map(({ label, field, isSelect, placeholder }) => (
                <div key={field}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6, fontFamily:C.sans }}>{label}</label>
                  {isSelect
                    ? <select value={filters[field]} onChange={e => setFilters(p=>({...p,[field]:e.target.value}))} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:13, outline:'none', fontFamily:C.sans }}>
                        {TYPE_FILTERS.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
                      </select>
                    : <input type="number" value={filters[field]} onChange={e => setFilters(p=>({...p,[field]:e.target.value}))} placeholder={placeholder} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontSize:13, outline:'none', fontFamily:C.sans, boxSizing:'border-box' }}/>
                  }
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
              <button onClick={clear} style={{ padding:'8px 18px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.sans }}>{t('clearFilters')}</button>
              <button onClick={apply} style={{ padding:'8px 20px', borderRadius:10, background:C.primary, color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 4px 14px rgba(200,75,0,0.25)' }}>{t('filter')}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 20px' }}>
        {error && <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:16, padding:'12px 16px', marginBottom:20, color:'#DC2626', fontSize:13, fontFamily:C.sans }}><AlertCircle size={16}/> {error}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
          {loading
            ? Array.from({length:6}).map((_,i) => <Skeleton key={i}/>)
            : listings.length===0
              ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px' }}>
                  <div style={{ width:64, height:64, borderRadius:20, background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><Leaf size={28} color={C.primary}/></div>
                  <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, marginBottom:8 }}>{t('noPropsFound')}</p>
                  <p style={{ color:C.muted, fontSize:14, marginBottom:20, fontFamily:C.sans }}>{hasActive ? t('noPropsSubtitle') : ''}</p>
                  {hasActive && <button onClick={clear} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:14, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>{t('clearFilters')}</button>}
                </div>
              : listings.map((land,i) => <LandCard key={gid(land)} land={land} index={i} liked={liked.has(gid(land))} onToggleLike={toggleLike} t={t}/>)
          }
        </div>

        {totalPages>1&&!loading&&(
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:40 }}>
            <button onClick={() => fetchListings(applied,page-1)} disabled={page===1} style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, color:C.muted, cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1 }}><ChevronLeft size={16}/></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => <button key={p} onClick={() => fetchListings(applied,p)} style={{ width:36, height:36, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, border:`1px solid ${p===page?C.primary:C.border}`, background:p===page?C.primary:C.card, color:p===page?'#fff':C.sub, boxShadow:p===page?'0 4px 12px rgba(200,75,0,0.22)':'none' }}>{p}</button>)}
            <button onClick={() => fetchListings(applied,page+1)} disabled={page===totalPages} style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, color:C.muted, cursor:page===totalPages?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===totalPages?0.4:1 }}><ChevronRight size={16}/></button>
          </div>
        )}

        {!loading&&(
          <div style={{ marginTop:48, borderRadius:28, overflow:'hidden', background:`linear-gradient(135deg,${C.primary} 0%,#a33800 100%)`, padding:'36px 40px', display:'flex', flexDirection:'column', gap:20, boxShadow:'0 12px 40px rgba(200,75,0,0.25)', position:'relative' }}>
            <div style={{ position:'absolute', top:'-30%', right:'-5%', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
              <div>
                <h3 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 }}>{t('postRequirement')}</h3>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, fontFamily:C.sans }}>{t('ctaSubtitle')}</p>
              </div>
              <button onClick={() => navigate('/land-requirement')}
                style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', color:C.primary, border:'none', borderRadius:16, padding:'12px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, whiteSpace:'nowrap', flexShrink:0, boxShadow:'0 4px 16px rgba(0,0,0,0.15)', transition:'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                <Leaf size={15}/> {t('postRequirement')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmerBg{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
};

export default LandListings;
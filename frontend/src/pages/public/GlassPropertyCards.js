import React, { useState, useEffect } from 'react';
import { Heart, ArrowUpRight, MapPin, Bed, Bath, Square, Sparkles, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const formatPrice = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p/10000000).toFixed(1)}Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(1)}L`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.thumbnail || null;
};

const TYPE_CONFIG = {
  RESIDENTIAL: { label:'Residential', dot:'#7c3aed', lightBg:'#f5f3ff' },
  COMMERCIAL:  { label:'Commercial',  dot:'#C84B00', lightBg:'#FEF3EE' },
};

const FALLBACK = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
const LAND_TYPES = new Set(['LAND','AGRICULTURAL','INDUSTRIAL']);

const Skeleton = () => (
  <div style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden' }}>
    <div style={{ height:220, background:'linear-gradient(90deg,#f0ebe4 25%,#e8e0d5 50%,#f0ebe4 75%)', backgroundSize:'200% 100%', animation:'shimmerBg 1.6s ease-in-out infinite' }} />
    <div style={{ padding:20 }}>
      {[75,50,40].map((w,i) => (
        <div key={i} style={{ height:11, borderRadius:6, marginBottom:10, width:`${w}%`, background:'linear-gradient(90deg,#f0ebe4 25%,#e8e0d5 50%,#f0ebe4 75%)', backgroundSize:'200% 100%', animation:'shimmerBg 1.6s ease-in-out infinite', animationDelay:`${i*0.15}s` }} />
      ))}
    </div>
  </div>
);

const PropertyCard = ({ property, liked, onLike, onView, index, t }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const cfg = TYPE_CONFIG[property.type] || { label:property.type, dot:C.muted, lightBg:C.bg };
  const isNew = new Date() - new Date(property.createdAt) < 7*24*60*60*1000;

  let imgSrc = FALLBACK;
  try {
    const raw = typeof property.images==='string' ? JSON.parse(property.images) : property.images;
    if (Array.isArray(raw) && raw.length > 0) { const u = getImageUrl(raw[0]); if (u) imgSrc = u; }
  } catch {}

  return (
    <div onClick={() => onView(property.id)}
      style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', transition:'all 0.35s cubic-bezier(.22,1,.36,1)', animation:`slideUp 0.55s cubic-bezier(.22,1,.36,1) ${index*70}ms both` }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(26,8,0,0.12)'; e.currentTarget.style.borderColor=C.pBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=C.border; }}>
      <div style={{ position:'relative', height:220, overflow:'hidden', flexShrink:0, background:'#f0ebe4' }}>
        <img src={imgSrc} alt={property.title}
          onLoad={() => setImgLoaded(true)}
          onError={e => { e.target.src=FALLBACK; }}
          style={{ width:'100%', height:'100%', objectFit:'cover', opacity:imgLoaded?1:0, transition:'transform 0.6s ease, opacity 0.4s' }}
          onMouseEnter={e => e.target.style.transform='scale(1.07)'}
          onMouseLeave={e => e.target.style.transform='scale(1)'} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,8,0,0.45) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6 }}>
          <span style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', borderRadius:99, padding:'5px 12px', fontSize:11, fontWeight:700, color:C.text, fontFamily:C.sans, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:cfg.dot }} />{cfg.label}
          </span>
          {isNew && <span style={{ background:'#16a34a', color:'#fff', borderRadius:99, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:C.sans }}>NEW</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onLike(property.id); }}
          style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.96)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
          <Heart size={15} fill={liked?'#ef4444':'none'} color={liked?'#ef4444':C.muted} />
        </button>
        <div style={{ position:'absolute', bottom:12, left:12, right:12, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:10, fontWeight:600, fontFamily:C.sans, marginBottom:2 }}>
              {property.purpose==='SALE' ? t('forSale').toUpperCase() : t('forRent').toUpperCase()}
            </p>
            <p style={{ color:'#fff', fontFamily:C.serif, fontWeight:700, fontSize:20, lineHeight:1 }}>{formatPrice(property.price)}</p>
          </div>
          {property.status==='AVAILABLE' && (
            <span style={{ display:'flex', alignItems:'center', gap:5, background:'#16a34a', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:99, fontFamily:C.sans }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.8)', animation:'pulse 1.5s ease-in-out infinite' }} /> {t('available').toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', flex:1 }}>
        <h3 style={{ fontFamily:C.serif, fontSize:15, fontWeight:700, color:C.text, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{property.title}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:5, color:C.muted, fontSize:12, marginBottom:12, fontFamily:C.sans }}>
          <MapPin size={12}/>{[property.city, property.state].filter(Boolean).join(', ') || 'Gujarat'}
        </div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
          {property.area && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Square size={10}/> {property.area?.toLocaleString()} {t('sqft')}</span>}
          {property.bedrooms && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Bed size={10}/> {property.bedrooms} BHK</span>}
          {property.bathrooms && <span style={{ display:'flex', alignItems:'center', gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Bath size={10}/> {property.bathrooms}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${C.border}`, marginTop:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:C.pLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:C.primary, fontFamily:C.sans }}>
              {(property.broker?.name||'R').charAt(0)}
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {property.broker?.name||'Rudra Realty'}
            </span>
          </div>
          <button onClick={e => { e.stopPropagation(); onView(property.id); }}
            style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 14px', borderRadius:10, background:C.text, color:'#fff', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:C.sans, transition:'background 0.2s' }}>
            {t('viewDetails')} <ArrowUpRight size={11}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const GlassPropertyCards = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [liked,      setLiked]      = useState(new Set());
  const [filter,     setFilter]     = useState('ALL');

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyAPI.getAll({ limit:9, status:'AVAILABLE' });
      const all = res.data?.properties || [];
      setProperties(all.filter(p => !LAND_TYPES.has(p.type)));
    } catch { setError(t('errorMsg')); }
    finally { setLoading(false); }
  };

  const toggleLike = (id) => setLiked(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const handleView = (id) => navigate(`/property/${id}`);

  const TABS = [
    { val:'ALL',         label:`🏘 ${t('all')}` },
    { val:'RESIDENTIAL', label:`🏠 ${t('residential')}` },
    { val:'COMMERCIAL',  label:`🏢 ${t('commercial')}` },
  ];

  const filtered = filter==='ALL' ? properties : properties.filter(p => p.type===filter);

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.sans }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,75,0,0.06) 0%, transparent 65%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:800, margin:'0 auto', padding:'56px 20px 44px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:20, animation:'fadeIn 0.5s ease' }}>
            <Sparkles size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:C.sans }}>
              {t('liveListings')} · Rudra Real Estate
            </span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2.2rem,5vw,3.5rem)', color:C.text, fontWeight:700, marginBottom:12, lineHeight:1.1, animation:'slideUp 0.6s ease 0.1s both' }}>
            {t('heroTitle1')}{' '}<em style={{ fontStyle:'italic', color:C.primary }}>{t('heroTitle2')}</em>
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, marginBottom:32, animation:'slideUp 0.6s ease 0.2s both' }}>
            {t('heroSubtitle')}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg, border:`1px solid ${C.border}`, borderRadius:18, padding:'10px 16px', maxWidth:500, margin:'0 auto 24px', boxShadow:'0 2px 12px rgba(26,8,0,0.04)', animation:'slideUp 0.6s ease 0.3s both' }}>
            <Search size={18} color={C.muted} style={{ flexShrink:0 }}/>
            <input readOnly placeholder={t('searchPlaceholder')} onClick={() => navigate('/ai-search')}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:C.text, fontFamily:C.sans, cursor:'pointer' }} />
            <button onClick={() => navigate('/ai-search')}
              style={{ background:C.primary, color:'#fff', border:'none', borderRadius:12, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 4px 14px rgba(200,75,0,0.28)' }}>
              {t('searchBtn')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:28 }}>
          <div style={{ display:'flex', background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:5, gap:4 }}>
            {TABS.map(tab => (
              <button key={tab.val} onClick={() => setFilter(tab.val)}
                style={{ padding:'8px 18px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, border:'none', transition:'all 0.2s', background:filter===tab.val?C.text:'transparent', color:filter===tab.val?'#fff':C.muted }}>
                {tab.label}
              </button>
            ))}
          </div>
          <p style={{ color:C.muted, fontSize:13, fontFamily:C.sans }}>
            {loading ? '…' : <><strong style={{ color:C.primary }}>{filtered.length}</strong> {t('properties')}</>}
          </p>
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:16, padding:'12px 16px', marginBottom:20, color:'#DC2626', fontSize:13, fontFamily:C.sans }}>
            <AlertCircle size={15}/> {error}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:22 }}>
          {loading
            ? Array.from({ length:6 }).map((_,i) => <Skeleton key={i}/>)
            : filtered.length===0
              ? (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px' }}>
                  <span style={{ fontSize:48 }}>🏡</span>
                  <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, margin:'16px 0 8px' }}>{t('noPropsFound')}</p>
                  <button onClick={() => setFilter('ALL')} style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontSize:13, fontWeight:700, fontFamily:C.sans }}>{t('clearFilters')}</button>
                </div>
              )
              : filtered.map((p,i) => <PropertyCard key={p.id} property={p} index={i} liked={liked.has(p.id)} onLike={toggleLike} onView={handleView} t={t}/>)
          }
        </div>

        {!loading && filtered.length>0 && (
          <div style={{ marginTop:48, borderRadius:28, overflow:'hidden', background:`linear-gradient(135deg,${C.primary} 0%,#a33800 100%)`, padding:'36px 40px', position:'relative', boxShadow:'0 12px 40px rgba(200,75,0,0.25)' }}>
            <div style={{ position:'absolute', top:'-30%', right:'-5%', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
              <div>
                <h3 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 }}>{t('browseProperties')}</h3>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, fontFamily:C.sans }}>{t('ctaSubtitle')}</p>
              </div>
              <button onClick={() => navigate('/ai-search')}
                style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', color:C.primary, border:'none', borderRadius:16, padding:'12px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, whiteSpace:'nowrap', flexShrink:0, boxShadow:'0 4px 16px rgba(0,0,0,0.15)', transition:'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                {t('viewAll')} <ArrowUpRight size={15}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmerBg{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
};

export default GlassPropertyCards;
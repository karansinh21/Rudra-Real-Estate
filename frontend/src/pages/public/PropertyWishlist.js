import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Trash2, Eye, MapPin, Square, Bed, Bath, Grid, List, Share2, Loader2, ArrowUpRight } from 'lucide-react';
import { wishlistAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia,"Times New Roman",serif',
  sans:"'DM Sans','Segoe UI',system-ui,sans-serif",
};

const fmt = p => {
  if (!p) return '–';
  if (p>=10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p>=100000)   return `₹${(p/100000).toFixed(2)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = img => {
  try {
    const parsed = typeof img==='string' ? JSON.parse(img) : img;
    if (Array.isArray(parsed)&&parsed.length>0) {
      const first = parsed[0];
      return typeof first==='string' ? first : first?.url||first?.thumbnail;
    }
  } catch {}
  return null;
};

const TYPE_DOT = {
  RESIDENTIAL:'#7c3aed', COMMERCIAL:'#C84B00',
  AGRICULTURAL:'#059669', INDUSTRIAL:'#d97706', LAND:'#16a34a',
};

const LAND_TYPES = new Set(['LAND','AGRICULTURAL','INDUSTRIAL']);

export default function PropertyWishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t }    = useLanguage();

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [removing,   setRemoving]   = useState(null);
  const [clearing,   setClearing]   = useState(false);
  const [viewMode,   setViewMode]   = useState('grid');
  const [selected,   setSelected]   = useState([]);
  const [toast,      setToast]      = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const fetchWishlist = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await wishlistAPI.getAll();
      let wishlistData = [];
      if (response.data) {
        wishlistData = response.data.wishlist||response.data.properties||response.data.items||response.data.data||(Array.isArray(response.data)?response.data:[]);
      } else if (Array.isArray(response)) { wishlistData = response; }
      setProperties(wishlistData);
    } catch { showToast(t('errorMsg')); setProperties([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const getPropertyId = p => p._id||p.id||p.propertyId;

  const removeFromWishlist = async property => {
    const propertyId = getPropertyId(property);
    if (!propertyId) { showToast('Invalid property ID'); return; }
    setRemoving(propertyId);
    try {
      await wishlistAPI.remove(propertyId);
      setProperties(prev => prev.filter(p => getPropertyId(p)!==propertyId));
      setSelected(prev => prev.filter(id => id!==propertyId));
      showToast(t('successMsg'));
    } catch { showToast(t('errorMsg')); }
    finally { setRemoving(null); }
  };

  const clearAll = async () => {
    if (!window.confirm(`${t('delete')} entire ${t('wishlist')}?`)) return;
    setClearing(true);
    try {
      await wishlistAPI.clearAll();
      setProperties([]); setSelected([]);
      showToast(t('successMsg'));
    } catch { showToast(t('errorMsg')); }
    finally { setClearing(false); }
  };

  const removeSelected = async () => {
    if (!window.confirm(`${t('delete')} ${selected.length} ${t('properties')}?`)) return;
    try {
      await Promise.all(selected.map(id => wishlistAPI.remove(id)));
      setProperties(prev => prev.filter(p => !selected.includes(getPropertyId(p))));
      showToast(`${selected.length} ${t('properties')} removed`);
      setSelected([]);
    } catch { showToast(t('errorMsg')); }
  };

  const toggleSelect = property => {
    const id = getPropertyId(property);
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  };

  const totalValue = properties.reduce((sum,p) => sum+(p.price||0), 0);
  const avgArea    = properties.length ? Math.round(properties.reduce((sum,p) => sum+(p.area||0),0)/properties.length) : 0;

  if (!user) return (
    <div style={{ background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Heart size={28} color={C.primary}/>
        </div>
        <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, margin:'0 0 8px' }}>{t('signIn')} Required</h2>
        <p style={{ color:C.muted, fontSize:14, marginBottom:24, fontFamily:C.sans }}>{t('signIn')} to view your {t('wishlist')}</p>
        <button onClick={() => navigate('/login')} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:14, padding:'12px 28px', fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
          {t('signIn')} / {t('register')}
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
      <Loader2 size={22} color={C.primary} style={{ animation:'spin 1s linear infinite' }}/>
      <p style={{ color:C.muted, fontSize:14, fontFamily:C.sans }}>{t('loading')}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardWish{from{opacity:0;transform:translateY(24px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes toastSlide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:100, background:C.text, color:'#fff', fontSize:13, fontWeight:600, padding:'10px 18px', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.2)', fontFamily:C.sans, animation:'toastSlide 0.35s cubic-bezier(.22,1,.36,1) both' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'48px 24px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.05) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:14, background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Heart size={18} fill={C.primary} color={C.primary}/>
              </div>
              <h1 style={{ fontFamily:C.serif, fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:C.text, margin:0 }}>
                My <em style={{ fontStyle:'italic', color:C.primary }}>{t('wishlist')}</em>
              </h1>
            </div>
            <p style={{ color:C.muted, fontSize:13, margin:'0 0 0 50px', fontFamily:C.sans }}>
              {properties.length} {properties.length===1?t('properties'):t('properties')} saved
              {selected.length>0 && ` · ${selected.length} selected`}
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <div style={{ display:'flex', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:4, gap:4 }}>
              {[{mode:'grid',Icon:Grid},{mode:'list',Icon:List}].map(({mode,Icon}) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  style={{ padding:'7px 10px', borderRadius:9, border:'none', cursor:'pointer', background:viewMode===mode?C.card:'transparent', boxShadow:viewMode===mode?'0 1px 4px rgba(0,0,0,0.08)':'none', color:viewMode===mode?C.text:C.muted }}>
                  <Icon size={15}/>
                </button>
              ))}
            </div>

            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!'); }}
              style={{ display:'flex', alignItems:'center', gap:6, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'9px 16px', fontSize:13, fontWeight:600, color:C.sub, cursor:'pointer', fontFamily:C.sans }}>
              <Share2 size={14}/> {t('shareProperty')}
            </button>

            {properties.length>0 && (
              <button onClick={clearAll} disabled={clearing}
                style={{ display:'flex', alignItems:'center', gap:6, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'9px 16px', fontSize:13, fontWeight:600, color:'#dc2626', cursor:'pointer', fontFamily:C.sans, opacity:clearing?0.6:1 }}>
                {clearing ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <Trash2 size={13}/>}
                {t('delete')} {t('all')}
              </button>
            )}

            {selected.length>0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:12, padding:'9px 16px' }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.primary, fontFamily:C.sans }}>{selected.length} selected</span>
                <button onClick={() => navigate('/compare',{state:{ids:selected}})}
                  style={{ background:C.primary, color:'#fff', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                  Compare
                </button>
                <button onClick={removeSelected}
                  style={{ background:'#FEF2F2', color:'#dc2626', border:'1px solid #FECACA', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                  {t('delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px' }}>
        {properties.length===0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ width:72, height:72, borderRadius:24, background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <Heart size={28} color={C.primary}/>
            </div>
            <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, margin:'0 0 8px' }}>{t('noPropsFound')}</h2>
            <p style={{ color:C.muted, fontSize:14, marginBottom:28, fontFamily:C.sans }}>{t('noPropsSubtitle')}</p>
            <button onClick={() => navigate('/properties')}
              style={{ background:C.primary, color:'#fff', border:'none', borderRadius:14, padding:'12px 28px', fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
              {t('browseProperties')}
            </button>
          </div>
        ) : (
          <>
            {viewMode==='grid' ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                {properties.map((property,i) => {
                  const id         = getPropertyId(property);
                  const img        = getImg(property.images);
                  const dot        = TYPE_DOT[property.type]||C.muted;
                  const isSelected = selected.includes(id);
                  const isRemoving = removing===id;
                  const isLand     = LAND_TYPES.has(property.type);
                  return (
                    <div key={id||i}
                      style={{ background:C.card, borderRadius:24, border:`2px solid ${isSelected?C.primary:C.border}`, overflow:'hidden', transition:'all 0.35s cubic-bezier(.22,1,.36,1)', opacity:isRemoving?0.4:1, animation:`cardWish 0.5s cubic-bezier(.22,1,.36,1) ${i*60}ms both` }}
                      onMouseEnter={e => { if(!isRemoving){e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(26,8,0,0.1)';} }}
                      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=isSelected?`0 0 0 3px ${C.pBorder}`:'none'; }}>
                      <div style={{ position:'relative', height:200, background:'#f0ebe4', overflow:'hidden' }}>
                        {img
                          ? <img src={img} alt={property.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }} onMouseEnter={e=>e.target.style.transform='scale(1.07)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>🏠</div>}
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(26,8,0,0.35) 0%,transparent 55%)' }}/>
                        <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', borderRadius:99, padding:'4px 10px', fontSize:11, fontWeight:700, color:C.text, fontFamily:C.sans }}>
                          <span style={{ width:7, height:7, borderRadius:'50%', background:dot }}/>
                          {property.type}
                        </div>
                        <button onClick={() => removeFromWishlist(property)} disabled={isRemoving}
                          style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.96)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {isRemoving ? <Loader2 size={13} color="#dc2626" style={{ animation:'spin 1s linear infinite' }}/> : <Heart size={13} fill="#ef4444" color="#ef4444"/>}
                        </button>
                        <button onClick={() => toggleSelect(property)}
                          style={{ position:'absolute', bottom:10, left:10, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:C.sans, background:isSelected?C.primary:'rgba(255,255,255,0.9)', color:isSelected?'#fff':C.sub }}>
                          {isSelected?'✓ Selected':'Select'}
                        </button>
                      </div>
                      <div style={{ padding:'14px 18px' }}>
                        <h3 style={{ fontFamily:C.serif, fontSize:14, fontWeight:700, color:C.text, margin:'0 0 5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{property.title}</h3>
                        <div style={{ display:'flex', alignItems:'center', gap:4, color:C.muted, fontSize:12, marginBottom:10, fontFamily:C.sans }}>
                          <MapPin size={11}/>{[property.city,property.state].filter(Boolean).join(', ')||property.address||'–'}
                        </div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                          {property.area && <span style={{ display:'flex', alignItems:'center', gap:3, background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, padding:'3px 8px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Square size={10}/>{property.area?.toLocaleString()} {t('sqft')}</span>}
                          {!isLand&&property.bedrooms && <span style={{ display:'flex', alignItems:'center', gap:3, background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, padding:'3px 8px', fontSize:11, fontWeight:600, color:C.sub, fontFamily:C.sans }}><Bed size={10}/>{property.bedrooms} BHK</span>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontFamily:C.serif, fontSize:16, fontWeight:700, color:C.primary }}>{fmt(property.price)}</span>
                          <button onClick={() => navigate(`/property/${id}`)}
                            style={{ display:'flex', alignItems:'center', gap:4, background:C.text, color:'#fff', border:'none', borderRadius:9, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                            {t('viewDetails')} <ArrowUpRight size={10}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {properties.map((property,i) => {
                  const id         = getPropertyId(property);
                  const img        = getImg(property.images);
                  const dot        = TYPE_DOT[property.type]||C.muted;
                  const isSelected = selected.includes(id);
                  const isRemoving = removing===id;
                  return (
                    <div key={id||i} style={{ background:C.card, borderRadius:20, border:`2px solid ${isSelected?C.primary:C.border}`, overflow:'hidden', display:'flex', opacity:isRemoving?0.4:1 }}>
                      <div style={{ width:120, flexShrink:0, background:C.bg }}>
                        {img ? <img src={img} alt={property.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🏠</div>}
                      </div>
                      <div style={{ flex:1, padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:4 }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                              <span style={{ width:7, height:7, borderRadius:'50%', background:dot }}/>
                              <span style={{ fontSize:11, color:C.muted, fontFamily:C.sans }}>{property.type}</span>
                            </div>
                            <h3 style={{ fontFamily:C.serif, fontWeight:700, color:C.text, margin:0, fontSize:14 }}>{property.title}</h3>
                          </div>
                          <span style={{ fontFamily:C.serif, fontWeight:700, fontSize:16, color:C.primary, flexShrink:0 }}>{fmt(property.price)}</span>
                        </div>
                        <div style={{ display:'flex', gap:8, marginTop:10 }}>
                          <button onClick={() => toggleSelect(property)} style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${isSelected?C.primary:C.border}`, background:isSelected?C.pLight:'transparent', color:isSelected?C.primary:C.sub, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                            {isSelected?'✓ Selected':'Select'}
                          </button>
                          <button onClick={() => navigate(`/property/${id}`)} style={{ padding:'5px 10px', borderRadius:8, background:C.pLight, border:`1px solid ${C.pBorder}`, color:C.primary, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                            {t('viewDetails')}
                          </button>
                          <button onClick={() => removeFromWishlist(property)} disabled={isRemoving} style={{ padding:'5px 10px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA', color:'#dc2626', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
                            {isRemoving ? <Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/> : t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            <div style={{ marginTop:32, background:C.card, borderRadius:24, border:`1px solid ${C.border}`, padding:28 }}>
              <p style={{ fontFamily:C.serif, fontSize:17, fontWeight:700, color:C.text, margin:'0 0 18px' }}>Wishlist Summary</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
                {[
                  { label:t('totalProperties'),             val:properties.length },
                  { label:`Total ${t('price')}`,            val:fmt(totalValue) },
                  { label:`Avg ${t('price')}`,              val:fmt(Math.round(totalValue/properties.length)) },
                  { label:`Avg ${t('area')}`,               val:avgArea?`${avgArea.toLocaleString()} ${t('sqft')}`:'–' },
                ].map((stat,i) => (
                  <div key={i} style={{ background:C.bg, borderRadius:16, padding:'14px 16px', border:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:11, color:C.muted, margin:'0 0 4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:C.sans }}>{stat.label}</p>
                    <p style={{ fontFamily:C.serif, fontWeight:700, color:C.text, margin:0, fontSize:17 }}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
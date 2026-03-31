import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, enquiryAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';
import {
  MapPin, Phone, Mail, User,
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  Heart, Share2, Video, Box, Calendar, ArrowLeft, Loader2,
  Download
} from 'lucide-react';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const LAND_TYPES = new Set(['LAND','AGRICULTURAL','INDUSTRIAL','COMMERCIAL']);

const TYPE_CONFIG = {
  RESIDENTIAL:  { icon:'🏠', label:'Residential',  dot:'#7c3aed', accent:'#7c3aed', lightBg:'#f5f3ff', lightBorder:'#ddd6fe' },
  COMMERCIAL:   { icon:'🏢', label:'Commercial',   dot:'#C84B00', accent:'#C84B00', lightBg:'#FEF3EE', lightBorder:'rgba(200,75,0,0.2)' },
  AGRICULTURAL: { icon:'🌾', label:'Agricultural', dot:'#059669', accent:'#059669', lightBg:'#ecfdf5', lightBorder:'#a7f3d0' },
  INDUSTRIAL:   { icon:'🏭', label:'Industrial',   dot:'#d97706', accent:'#d97706', lightBg:'#fffbeb', lightBorder:'#fde68a' },
  LAND:         { icon:'🗺️', label:'Land / Plot',  dot:'#16a34a', accent:'#16a34a', lightBg:'#f0fdf4', lightBorder:'#bbf7d0' },
};

const fmt = p => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(2)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const gid = (obj) => obj?._id || obj?.id;

const inp = (border=C.border) => ({
  border:`1px solid ${border}`, borderRadius:10, padding:'10px 12px', fontSize:14,
  color:C.text, outline:'none', width:'100%', boxSizing:'border-box',
  background:C.bg, fontFamily:C.sans,
});

const StatBox = ({ icon, label, val }) => (
  <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px', textAlign:'center', animation:'popIn 0.4s cubic-bezier(.34,1.56,.64,1) both' }}>
    <p style={{ fontSize:22, margin:'0 0 5px' }}>{icon}</p>
    <p style={{ fontSize:10, color:C.muted, margin:'0 0 3px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:C.sans }}>{label}</p>
    <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0, fontFamily:C.sans }}>{val}</p>
  </div>
);

const AREA_COORDS = {
  alkapuri:{lat:22.3072,lng:73.1812},'race course':{lat:22.2950,lng:73.1900},
  gotri:{lat:22.2850,lng:73.1650},manjalpur:{lat:22.2700,lng:73.1800},
  waghodia:{lat:22.3300,lng:73.2500},sama:{lat:22.3200,lng:73.2200},
  gorwa:{lat:22.3350,lng:73.1700},fatehgunj:{lat:22.3100,lng:73.1900},
  karelibaug:{lat:22.3050,lng:73.2100},padra:{lat:22.2355,lng:73.0856},
  karjan:{lat:22.0494,lng:73.1228},vadodara:{lat:22.3072,lng:73.1812},
};

function PropertyMap({ property }) {
  const mapRef=React.useRef(null), instanceRef=React.useRef(null);
  React.useEffect(() => {
    if (!document.getElementById('leaflet-css-pd')) {
      const link=document.createElement('link'); link.id='leaflet-css-pd'; link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    }
    const initMap = () => {
      if (!mapRef.current||instanceRef.current) return;
      const L=window.L;
      let lat,lng;
      if (property.latitude&&property.longitude) { lat=+property.latitude; lng=+property.longitude; }
      else { const key=(property.city||property.address||'').toLowerCase(); const hit=Object.entries(AREA_COORDS).find(([k])=>key.includes(k)); lat=hit?hit[1].lat:22.3072; lng=hit?hit[1].lng:73.1812; }
      const map=L.map(mapRef.current,{center:[lat,lng],zoom:16,zoomControl:true,scrollWheelZoom:false});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',maxZoom:19}).addTo(map);
      const pin=L.divIcon({className:'',iconSize:[40,48],iconAnchor:[20,48],popupAnchor:[0,-50],html:`<div style="position:relative;width:40px;height:48px;filter:drop-shadow(0 4px 8px rgba(200,75,0,0.35))"><svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28S40 35 40 20C40 8.95 31.05 0 20 0z" fill="#C84B00" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="white" opacity="0.95"/></svg><div style="position:absolute;top:11px;left:50%;transform:translateX(-50%);font-size:14px;line-height:1">🏠</div></div>`});
      const fmtP=p=>{if(!p)return '';if(p>=10000000)return '₹'+(p/10000000).toFixed(2)+' Cr';if(p>=100000)return '₹'+(p/100000).toFixed(2)+' Lac';return '₹'+Number(p).toLocaleString('en-IN');};
      const marker=L.marker([lat,lng],{icon:pin}).addTo(map);
      marker.bindPopup(`<div style="font-family:'DM Sans',sans-serif;min-width:200px;padding:10px 6px 6px"><p style="font-weight:700;font-size:13px;color:#1A0800;margin:0 0 4px;line-height:1.35">${property.title}</p><p style="font-size:12px;color:#9C8B7A;margin:0 0 8px">📍 ${[property.address,property.city].filter(Boolean).join(', ')}</p><p style="font-size:16px;font-weight:700;color:#C84B00;margin:0">${fmtP(property.price)}</p></div>`,{className:'rudra-map-popup',maxWidth:260}).openPopup();
      instanceRef.current=map;
    };
    if (window.L) { initMap(); }
    else if (!document.getElementById('leaflet-js-pd')) { const script=document.createElement('script'); script.id='leaflet-js-pd'; script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload=initMap; document.head.appendChild(script); }
    else { const wait=setInterval(()=>{if(window.L){clearInterval(wait);initMap();}},100); }
    return () => { if(instanceRef.current){instanceRef.current.remove();instanceRef.current=null;} };
  }, [property]);
  return (
    <>
      <style>{`.rudra-map-popup .leaflet-popup-content-wrapper{border-radius:16px!important;padding:0!important;box-shadow:0 8px 28px rgba(26,8,0,0.13)!important;border:1px solid #EDE8E3;}.rudra-map-popup .leaflet-popup-content{margin:0!important;}.rudra-map-popup .leaflet-popup-tip{background:#fff!important;}.leaflet-control-attribution a{color:#9C8B7A!important;}`}</style>
      <div ref={mapRef} style={{ width:'100%', height:320 }}/>
    </>
  );
}

export default function PropertyDetail() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { isAuthenticated: isLoggedIn } = useAuth();
  const { t }         = useLanguage();

  const [property,   setProperty]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [formErr,    setFormErr]    = useState('');
  const [wished,     setWished]     = useState(false);
  const [wishing,    setWishing]    = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [form, setForm] = useState({ clientName:'', clientEmail:'', clientPhone:'', message:'' });

  useEffect(() => {
    (async () => {
      try {
        const res  = await propertyAPI.getById(id);
        const prop = res.data?.property || res.data;
        setProperty(prop);
        if (isLoggedIn) {
          try { const wRes=await wishlistAPI.getIds(); const ids=wRes.data?.ids||wRes.data||[]; setWished(ids.includes(id)); } catch {}
        }
      } catch {}
      setLoading(false);
    })();
  }, [id, isLoggedIn]);

  const toggleWish = async () => {
    if (!isLoggedIn) { navigate('/auth'); return; }
    setWishing(true);
    try { if (wished) { await wishlistAPI.remove(id); setWished(false); } else { await wishlistAPI.add(id); setWished(true); } }
    catch {} finally { setWishing(false); }
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title:property?.title, url:window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  const handleDownloadPDF = async () => {
    if (!property) return;
    setPdfLoading(true);
    try {
      const token=localStorage.getItem('token');
      const BASE=process.env.REACT_APP_API_URL||'http://localhost:5000/api';
      const res=await fetch(`${BASE}/properties/${id}/pdf`,{headers:token?{Authorization:`Bearer ${token}`}:{}});
      if (!res.ok) throw new Error('PDF generation failed');
      const blob=await res.blob(); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=`${property.title.replace(/\s+/g,'-')}-report.pdf`; a.click(); URL.revokeObjectURL(url);
    } catch { alert('PDF download failed.'); }
    finally { setPdfLoading(false); }
  };

  const handleEnquiry = async e => {
    e.preventDefault(); setSubmitting(true); setFormErr('');
    try { await enquiryAPI.create({ propertyId:id, ...form }); setSuccess(true); setForm({ clientName:'', clientEmail:'', clientPhone:'', message:'' }); setTimeout(() => setSuccess(false), 5000); }
    catch (err) { setFormErr(err.response?.data?.error || t('errorMsg')); }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:C.bg, flexDirection:'column', gap:14 }}>
      <div style={{ width:56, height:56, borderRadius:20, background:C.pLight, border:`1px solid ${C.pBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Loader2 size={24} color={C.primary} style={{ animation:'spin 1s linear infinite' }}/>
      </div>
      <p style={{ color:C.muted, fontSize:14, fontFamily:C.sans }}>{t('loading')}</p>
    </div>
  );

  if (!property) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:C.bg, flexDirection:'column', gap:12 }}>
      <span style={{ fontSize:56 }}>🏚️</span>
      <h2 style={{ fontFamily:C.serif, fontSize:24, color:C.text, margin:0 }}>{t('noPropsFound')}</h2>
      <button onClick={() => navigate(-1)} style={{ background:C.primary, color:'#fff', border:'none', borderRadius:12, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>{t('back')}</button>
    </div>
  );

  let images=[];
  try { const raw=typeof property.images==='string'?JSON.parse(property.images):property.images; if(Array.isArray(raw)) images=raw.map(i=>typeof i==='string'?i:i?.url).filter(Boolean); } catch {}
  let features=[];
  try { features=Array.isArray(property.features)?property.features:JSON.parse(property.features||'[]'); } catch {}

  const tc=TYPE_CONFIG[property.type]||TYPE_CONFIG.RESIDENTIAL;
  const isLand=LAND_TYPES.has(property.type);
  const landFields=isLand?[
    property.soilType&&{label:t('type'),val:property.soilType},
    property.waterSource&&{label:'Water Source',val:property.waterSource},
    property.roadAccess&&{label:'Road Access',val:property.roadAccess},
    property.areaUnit&&{label:t('area_unit'),val:property.areaUnit},
    property.naPermission!==undefined&&{label:'NA Permission',val:property.naPermission?'✅ Yes':'❌ No'},
    property.clearTitle!==undefined&&{label:'Clear Title',val:property.clearTitle?'✅ Yes':'❌ No'},
    property.approvedLayout!==undefined&&{label:'Approved Layout',val:property.approvedLayout?'✅ Yes':'❌ No'},
  ].filter(Boolean):[];
  const propId=gid(property);

  return (
    <div style={{ background:C.bg, minHeight:'100vh', paddingBottom:60, fontFamily:C.sans }}>
      <div style={{ padding:'16px 24px', maxWidth:1200, margin:'0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:14, fontWeight:600, fontFamily:C.sans }}
          onMouseEnter={e => e.currentTarget.style.color=C.primary} onMouseLeave={e => e.currentTarget.style.color=C.muted}>
          <ArrowLeft size={16}/> {t('back')}
        </button>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Gallery */}
            <div style={{ background:C.card, borderRadius:28, overflow:'hidden', border:`1px solid ${C.border}`, animation:'slideInLeft 0.5s cubic-bezier(.22,1,.36,1) both' }}>
              <div style={{ position:'relative', height:420, background:'#f0ebe4' }}>
                {images.length>0 ? (
                  <>
                    <img src={images[imgIdx]} alt={property.title} key={imgIdx} style={{ width:'100%', height:'100%', objectFit:'cover', animation:'imgFadeIn 0.4s ease both' }} onError={e => e.target.style.display='none'}/>
                    {images.length>1&&(
                      <>
                        <button onClick={() => setImgIdx(i=>(i-1+images.length)%images.length)} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.15)' }}><ChevronLeft size={18}/></button>
                        <button onClick={() => setImgIdx(i=>(i+1)%images.length)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.15)' }}><ChevronRight size={18}/></button>
                        <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>{images.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} style={{ width:i===imgIdx?22:7, height:7, borderRadius:99, border:'none', background:i===imgIdx?'#fff':'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.3s' }}/>)}</div>
                        <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.4)', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:99, fontFamily:C.sans }}>{imgIdx+1}/{images.length}</div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:64 }}>{tc.icon}</span>
                    <p style={{ color:C.muted, fontSize:13, marginTop:12 }}>No photos available</p>
                  </div>
                )}
              </div>
              {images.length>1&&(
                <div style={{ display:'flex', gap:8, padding:'10px 14px', overflowX:'auto' }}>
                  {images.map((src,i)=><button key={i} onClick={()=>setImgIdx(i)} style={{ flexShrink:0, width:68, height:50, borderRadius:10, overflow:'hidden', cursor:'pointer', border:`2px solid ${i===imgIdx?tc.accent:'transparent'}`, opacity:i===imgIdx?1:0.5, transition:'all 0.2s' }}><img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/></button>)}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'slideInLeft 0.5s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
              {[
                { label:'Virtual Tour 360°', icon:<Video size={17}/>,    color:'#7c3aed', bg:null,      action:()=>navigate(`/virtual-tour/${id}`) },
                { label:t('scheduleVisit'),  icon:<Calendar size={17}/>, color:'#7c3aed', border:'#7c3aed', bg:C.card, action:()=>navigate('/schedule-tour') },
                { label:'Compare',           icon:<Box size={17}/>,      color:'#059669', border:'#059669', bg:C.card, action:()=>navigate('/compare') },
              ].map(({ label, icon, color, border, bg, action }) => (
                <button key={label} onClick={action}
                  style={{ flex:1, minWidth:130, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:bg||color, color:bg?color:'#fff', border:border?`2px solid ${border}`:'none', borderRadius:14, padding:'13px 16px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:C.sans, transition:'all 0.2s', boxShadow:bg?'none':`0 4px 14px ${color}40` }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  {icon} {label}
                </button>
              ))}
              <button onClick={handleDownloadPDF} disabled={pdfLoading}
                style={{ flex:1, minWidth:130, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:C.card, color:C.primary, border:`2px solid ${C.pBorder}`, borderRadius:14, padding:'13px 16px', fontWeight:700, fontSize:14, cursor:pdfLoading?'not-allowed':'pointer', fontFamily:C.sans, transition:'all 0.2s', opacity:pdfLoading?0.7:1 }}>
                {pdfLoading?<><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> {t('loading')}</>:<><Download size={17}/> Download PDF</>}
              </button>
            </div>

            {/* Property Info */}
            <div style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, padding:26, animation:'slideInLeft 0.5s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, background:tc.lightBg, color:tc.accent, border:`1px solid ${tc.lightBorder}`, borderRadius:99, padding:'5px 14px', fontSize:12, fontWeight:700, fontFamily:C.sans }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:tc.dot }}/>{tc.icon} {tc.label}
                </span>
                {!isLand&&property.purpose&&(
                  <span style={{ background:property.purpose==='SALE'?'#fef3c7':'#dcfce7', color:property.purpose==='SALE'?'#92400e':'#14532d', borderRadius:99, padding:'5px 14px', fontSize:12, fontWeight:700 }}>
                    {property.purpose==='SALE'?`🏷️ ${t('forSale')}`:`🔑 ${t('forRent')}`}
                  </span>
                )}
                {property.status&&<span style={{ background:property.status==='AVAILABLE'?'#f0fdf4':'#fef2f2', color:property.status==='AVAILABLE'?'#15803d':'#dc2626', borderRadius:99, padding:'5px 14px', fontSize:12, fontWeight:700 }}>{property.status==='AVAILABLE'?'🟢':'🔴'} {property.status==='AVAILABLE'?t('available'):t('sold')}</span>}
              </div>
              <h1 style={{ fontFamily:C.serif, fontSize:28, fontWeight:700, color:C.text, margin:'0 0 8px', lineHeight:1.2 }}>{property.title}</h1>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:C.muted, fontSize:14, marginBottom:18, fontFamily:C.sans }}><MapPin size={14}/>{[property.address, property.city, property.state].filter(Boolean).join(', ')}</div>
              <p style={{ fontFamily:C.serif, fontSize:36, fontWeight:700, color:tc.accent, margin:'0 0 22px' }}>{fmt(property.price)}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:10, marginBottom:22 }}>
                <StatBox icon="📐" label={t('area')} val={`${property.area?.toLocaleString()||'–'} ${property.areaUnit||t('sqft')}`}/>
                <StatBox icon="📍" label={t('city')} val={property.city||'Vadodara'}/>
                {!isLand&&property.bedrooms&&<StatBox icon="🛏" label={t('bedrooms')} val={`${property.bedrooms} BHK`}/>}
                {!isLand&&property.bathrooms&&<StatBox icon="🚿" label={t('bathrooms')} val={property.bathrooms}/>}
                {isLand&&property.roadAccess&&<StatBox icon="🛣️" label="Road Access" val={property.roadAccess}/>}
                {isLand&&property.soilType&&<StatBox icon="🌱" label="Soil Type" val={property.soilType}/>}
              </div>
              {isLand&&landFields.length>0&&(
                <div style={{ marginBottom:22 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:C.sans }}>Land {t('propertyDetails')}</p>
                  <div style={{ background:C.bg, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                    {landFields.map(({label,val},i)=><div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', fontSize:13, borderBottom:i<landFields.length-1?`1px solid ${C.border}`:'none' }}><span style={{ color:C.muted, fontWeight:500, fontFamily:C.sans }}>{label}</span><span style={{ color:C.text, fontWeight:700, fontFamily:C.sans }}>{val}</span></div>)}
                  </div>
                </div>
              )}
              {features.length>0&&(
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10, fontFamily:C.sans }}>{isLand?'🌾 Land Features':`✨ ${t('amenities')}`}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {features.map((f,i)=><span key={i} style={{ fontSize:12, fontWeight:600, padding:'5px 13px', borderRadius:99, background:tc.lightBg, border:`1px solid ${tc.lightBorder}`, color:tc.accent, fontFamily:C.sans }}>{f}</span>)}
                  </div>
                </div>
              )}
              {property.description&&(
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:18 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8, fontFamily:C.sans }}>📋 {t('description')}</p>
                  <p style={{ color:C.muted, fontSize:14, lineHeight:1.8, margin:0, fontFamily:C.serif }}>{property.description}</p>
                </div>
              )}
            </div>

            {/* Map */}
            <div style={{ background:C.card, borderRadius:24, border:`1px solid ${C.border}`, overflow:'hidden', animation:'slideInLeft 0.5s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
              <div style={{ padding:'16px 22px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0, fontFamily:C.sans }}>📍 {t('location')}</p>
                  <p style={{ fontSize:12, color:C.muted, margin:'3px 0 0', fontFamily:C.sans }}>{property.city||'Vadodara'}</p>
                </div>
                <button onClick={() => navigate(`/map?id=${propId}`)} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:C.primary, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:10, padding:'5px 12px', cursor:'pointer', fontFamily:C.sans }}>
                  <MapPin size={12}/> Full Map
                </button>
              </div>
              <div style={{ position:'relative', cursor:'pointer' }} onClick={() => navigate(`/map?id=${propId}`)}>
                <PropertyMap property={property}/>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:24 }}>
            <div style={{ display:'flex', gap:8, animation:'slideInRight 0.5s cubic-bezier(.22,1,.36,1) both' }}>
              <button onClick={toggleWish} disabled={wishing} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:11, cursor:wishing?'not-allowed':'pointer', fontWeight:600, fontSize:13, fontFamily:C.sans, color:wished?'#dc2626':C.muted, transition:'all 0.2s' }}>
                {wishing?<Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>:<Heart size={15} fill={wished?'#dc2626':'none'}/>}
                {wished?t('removeWishlist'):t('addToWishlist')}
              </button>
              <button onClick={share} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:11, cursor:'pointer', color:C.muted, fontWeight:600, fontSize:13, fontFamily:C.sans }}>
                <Share2 size={15}/> {t('shareProperty')}
              </button>
            </div>

            {property.broker&&(
              <div style={{ background:C.card, borderRadius:20, border:`1px solid ${C.border}`, padding:20, animation:'slideInRight 0.5s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:C.sans }}>{t('contactBroker')}</p>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:C.pLight, display:'flex', alignItems:'center', justifyContent:'center' }}><User size={18} color={C.primary}/></div>
                  <div>
                    <p style={{ fontWeight:700, color:C.text, margin:0, fontSize:15, fontFamily:C.serif }}>{property.broker.name}</p>
                    <p style={{ color:C.muted, margin:0, fontSize:12, fontFamily:C.sans }}>Property Broker</p>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {property.broker.phone&&<a href={`tel:${property.broker.phone}`} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, color:'#059669', textDecoration:'none', fontWeight:700, fontSize:14, fontFamily:C.sans }}><Phone size={14}/> {property.broker.phone}</a>}
                  {property.broker.email&&<a href={`mailto:${property.broker.email}`} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, color:C.muted, textDecoration:'none', fontSize:13, fontFamily:C.sans, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}><Mail size={13}/> {property.broker.email}</a>}
                </div>
              </div>
            )}

            <div style={{ background:C.card, borderRadius:20, border:`1px solid ${C.border}`, padding:20, animation:'slideInRight 0.5s cubic-bezier(.22,1,.36,1) 0.18s both' }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:C.sans }}>{t('sendEnquiry')}</p>
              {success&&<div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#059669', fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:6, fontFamily:C.sans }}><CheckCircle size={14}/> {t('successMsg')}</div>}
              {formErr&&<div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:12, display:'flex', alignItems:'center', gap:6, fontFamily:C.sans }}><AlertCircle size={14}/> {formErr}</div>}
              <form onSubmit={handleEnquiry} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[{k:'clientName',t:'text',ph:t('fullName')},{k:'clientEmail',t:'email',ph:t('email')},{k:'clientPhone',t:'tel',ph:t('phoneNumber')}].map(({k,t:tp,ph})=>(
                  <input key={k} type={tp} value={form[k]} placeholder={ph} required onChange={e => setForm(p=>({...p,[k]:e.target.value}))} style={inp()}/>
                ))}
                <textarea rows={3} value={form.message} placeholder={t('description')} onChange={e => setForm(p=>({...p,message:e.target.value}))} style={{ ...inp(), resize:'none' }}/>
                <button type="submit" disabled={submitting} style={{ background:tc.accent, color:'#fff', border:'none', borderRadius:12, padding:12, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:C.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:7, opacity:submitting?0.7:1, transition:'opacity 0.2s', boxShadow:`0 4px 14px ${tc.accent}40` }}>
                  {submitting?<><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> {t('loading')}</> : t('sendEnquiry')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes imgFadeIn    { from{opacity:0;transform:scale(1.03)} to{opacity:1;transform:scale(1)} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn        { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes breathe      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </div>
  );
}
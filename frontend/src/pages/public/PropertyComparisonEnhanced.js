import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, MapPin, TrendingUp, Award, Square, Bed, Bath, Loader2, ArrowUpRight, Download } from 'lucide-react';
import { propertyAPI } from '../../services/api';

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
const getImg = p => {
  try { const a=typeof p.images==='string'?JSON.parse(p.images):p.images; if(Array.isArray(a)&&a.length) return typeof a[0]==='string'?a[0]:a[0]?.url; } catch {}
  return null;
};
const getFeats = f => { try { return Array.isArray(f)?f:JSON.parse(f||'[]'); } catch { return []; } };
const TYPE_DOT = { RESIDENTIAL:'#7c3aed', COMMERCIAL:'#C84B00', AGRICULTURAL:'#059669', INDUSTRIAL:'#d97706', LAND:'#16a34a' };
const TYPE_EM  = { RESIDENTIAL:'🏠', COMMERCIAL:'🏢', AGRICULTURAL:'🌾', INDUSTRIAL:'🏭', LAND:'🗺️' };

/* ── Row ──────────────────────────────────────────── */
const Row = ({ label, Icon, get, cols, highlight }) => (
  <div style={{ display:'grid', gridTemplateColumns:`170px repeat(${cols},1fr)`, gap:12, padding:'11px 0',
    borderBottom:`1px solid ${C.border}`, background:highlight?C.pLight:undefined }}>
    <div style={{ display:'flex', alignItems:'center', gap:7, paddingLeft:6 }}>
      {Icon && <Icon size={13} color={C.muted}/>}
      <span style={{ fontSize:12, fontWeight:600, color:C.muted, fontFamily:C.sans }}>{label}</span>
    </div>
    {get}
  </div>
);

export default function PropertyComparisonEnhanced() {
  const navigate = useNavigate();
  const [all,      setAll]      = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    propertyAPI.getAll({ limit:100 })
      .then(r => setAll(r.data?.properties || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const add    = p => { if (selected.length<3 && !selected.find(x=>x.id===p.id)) setSelected([...selected,p]); };
  const remove = id => setSelected(selected.filter(p=>p.id!==id));
  const avail  = all.filter(p => !selected.find(s=>s.id===p.id) && (!search||p.title?.toLowerCase().includes(search.toLowerCase())||p.city?.toLowerCase().includes(search.toLowerCase())));

  const bestValue = selected.length>1 ? selected.reduce((b,p) => {
    if (!p.price||!p.area) return b;
    return (p.price/p.area) < (b.price/b.area) ? p : b;
  }) : null;

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.sans }}>

      {/* Hero */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'52px 24px 36px',
        textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`,
            borderRadius:99, padding:'7px 18px', marginBottom:20, animation:'fadeIn 0.5s ease' }}>
            <Award size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Compare Tool · Rudra Real Estate
            </span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2rem,5vw,3rem)', color:C.text, fontWeight:700, marginBottom:10,
            lineHeight:1.15, animation:'slideUp 0.6s ease 0.1s both' }}>
            Compare <em style={{ fontStyle:'italic', color:C.primary }}>Properties</em> Side by Side
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, animation:'slideUp 0.6s ease 0.2s both' }}>
            Select up to 3 properties and find the best value.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 20px' }}>

        {/* Status bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12,
          animation:'slideUp 0.5s ease 0.1s both' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:10, padding:'6px 16px' }}>
              <span style={{ color:C.primary, fontWeight:700, fontSize:14, fontFamily:C.sans }}>{selected.length}/3 Selected</span>
            </div>
            {bestValue && (
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0',
                borderRadius:10, padding:'6px 14px' }}>
                <Award size={13} color="#059669"/>
                <span style={{ color:'#059669', fontWeight:600, fontSize:12, fontFamily:C.sans }}>
                  Best Value: {bestValue.title?.substring(0,22)}…
                </span>
              </div>
            )}
          </div>
          {selected.length>0 && (
            <button onClick={() => window.print()}
              style={{ display:'flex', alignItems:'center', gap:6, background:C.card, border:`1px solid ${C.border}`,
                borderRadius:10, padding:'8px 14px', fontSize:12, cursor:'pointer', color:C.sub, fontFamily:C.sans }}>
              <Download size={13}/> Export
            </button>
          )}
        </div>

        {/* Picker */}
        {selected.length<3 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:'24px',
            marginBottom:28, boxShadow:'0 4px 16px rgba(26,8,0,0.04)',
            animation:'slideUp 0.5s ease 0.15s both' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontFamily:C.serif, fontSize:18, color:C.text, fontWeight:700, margin:0 }}>Add Properties</h2>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or city…"
                style={{ border:`1px solid ${C.border}`, borderRadius:12, padding:'8px 14px', fontSize:13,
                  color:C.text, outline:'none', background:C.bg, fontFamily:C.sans, width:220 }}/>
            </div>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40, gap:10, color:C.muted }}>
                <div style={{ width:36,height:36,borderRadius:12,background:C.pLight,border:`1px solid ${C.pBorder}`,
                  display:'flex',alignItems:'center',justifyContent:'center', animation:'breathe 1.4s ease-in-out infinite' }}>
                  <Loader2 size={18} color={C.primary} style={{ animation:'spin 1s linear infinite' }}/>
                </div>
                <span style={{ fontSize:13, fontFamily:C.sans }}>Loading properties…</span>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                {avail.slice(0,9).map((p,i) => {
                  const img=getImg(p), dot=TYPE_DOT[p.type]||C.muted;
                  return (
                    <div key={p.id} onClick={() => add(p)}
                      style={{ background:C.bg, border:`2px solid ${C.border}`, borderRadius:18, overflow:'hidden',
                        cursor:'pointer', transition:'all 0.25s cubic-bezier(.22,1,.36,1)', position:'relative',
                        animation:`pickerCard 0.4s cubic-bezier(.22,1,.36,1) ${i*50}ms both` }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${C.primary}20`; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                      <div style={{ height:110, background:'#f0ebe4', position:'relative', overflow:'hidden' }}>
                        {img ? <img src={img} alt={p.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32 }}>{TYPE_EM[p.type]||'🏘'}</div>}
                        <div style={{ position:'absolute',top:8,left:8,display:'flex',alignItems:'center',gap:4,
                          background:'rgba(255,255,255,0.95)',borderRadius:99,padding:'3px 9px' }}>
                          <div style={{ width:6,height:6,borderRadius:'50%',background:dot }}/>
                          <span style={{ fontSize:10,fontWeight:700,color:C.text,fontFamily:C.sans }}>{p.type}</span>
                        </div>
                        <div style={{ position:'absolute',top:8,right:8,width:26,height:26,borderRadius:'50%',
                          background:'rgba(200,75,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',
                          opacity:0,transition:'opacity 0.2s' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                          <Plus size={14} color="#fff"/>
                        </div>
                      </div>
                      <div style={{ padding:'10px 12px' }}>
                        <p style={{ fontWeight:700,fontSize:13,color:C.text,margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:C.sans }}>{p.title}</p>
                        <div style={{ display:'flex',alignItems:'center',gap:4,color:C.muted,fontSize:11,marginBottom:5,fontFamily:C.sans }}><MapPin size={9}/>{p.city||'–'}</div>
                        <p style={{ fontFamily:C.serif,fontWeight:700,fontSize:14,color:C.primary,margin:0 }}>{fmt(p.price)}</p>
                      </div>
                    </div>
                  );
                })}
                {avail.length===0 && <p style={{ color:C.muted,gridColumn:'1/-1',textAlign:'center',padding:24,fontFamily:C.sans }}>No more properties to add</p>}
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        {selected.length>0 ? (
          <div style={{ animation:'tableReveal 0.5s cubic-bezier(.22,1,.36,1) both' }}>
            {/* Headers */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:24, overflow:'hidden',
              boxShadow:'0 4px 16px rgba(26,8,0,0.05)', marginBottom:16 }}>
              <div style={{ padding:'24px', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:'grid', gridTemplateColumns:`170px repeat(${selected.length},1fr)`, gap:16 }}>
                  <div/>
                  {selected.map((p,si) => {
                    const img=getImg(p), dot=TYPE_DOT[p.type]||C.muted, isBest=bestValue?.id===p.id;
                    return (
                      <div key={p.id} style={{ position:'relative', animation:`headerSlide 0.4s cubic-bezier(.22,1,.36,1) ${si*80}ms both` }}>
                        {isBest && (
                          <div style={{ position:'absolute', top:-10, left:8, display:'flex', alignItems:'center', gap:4,
                            background:'#fbbf24', color:'#fff', fontSize:10, fontWeight:700,
                            padding:'3px 10px', borderRadius:99, zIndex:1, boxShadow:'0 2px 8px rgba(251,191,36,0.4)' }}>
                            <Award size={9}/> Best Value
                          </div>
                        )}
                        <button onClick={() => remove(p.id)}
                          style={{ position:'absolute', top:-8, right:-4, zIndex:2, width:26,height:26,
                            borderRadius:'50%', background:'#FEF2F2', border:'1px solid #FECACA',
                            color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <X size={12}/>
                        </button>
                        <div onClick={() => navigate(`/property/${p.id}`)}
                          style={{ border:`2px solid ${isBest?'#fbbf24':C.border}`, borderRadius:18, overflow:'hidden',
                            cursor:'pointer', transition:'all 0.2s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor=isBest?'#f59e0b':C.primary; e.currentTarget.style.transform='translateY(-2px)'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor=isBest?'#fbbf24':C.border; e.currentTarget.style.transform='translateY(0)'; }}>
                          <div style={{ height:120, background:C.bg, position:'relative', overflow:'hidden' }}>
                            {img ? <img src={img} alt={p.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32 }}>{TYPE_EM[p.type]}</div>}
                            <div style={{ position:'absolute',top:8,left:8,display:'flex',alignItems:'center',gap:4,
                              background:'rgba(255,255,255,0.95)',borderRadius:99,padding:'3px 9px' }}>
                              <div style={{ width:6,height:6,borderRadius:'50%',background:dot }}/>
                              <span style={{ fontSize:10,fontWeight:700,color:C.text,fontFamily:C.sans }}>{p.type}</span>
                            </div>
                          </div>
                          <div style={{ padding:'12px 14px 14px' }}>
                            <p style={{ fontWeight:700,fontSize:13,color:C.text,margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:C.sans }}>{p.title}</p>
                            <div style={{ display:'flex',alignItems:'center',gap:4,color:C.muted,fontSize:11,marginBottom:6,fontFamily:C.sans }}><MapPin size={9}/>{p.city||'–'}</div>
                            <p style={{ fontFamily:C.serif,fontWeight:700,fontSize:16,color:C.primary,margin:'0 0 8px' }}>{fmt(p.price)}</p>
                            <button style={{ display:'flex',alignItems:'center',gap:4,background:C.pLight,border:'none',borderRadius:8,padding:'5px 10px',fontSize:11,color:C.primary,cursor:'pointer',fontWeight:600,fontFamily:C.sans }}>
                              View <ArrowUpRight size={10}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rows */}
              <div style={{ padding:'8px 24px 16px' }}>
                <p style={{ fontFamily:C.serif,fontWeight:700,color:C.text,fontSize:15,margin:'16px 0 12px' }}>
                  Detailed Comparison
                </p>
                {[
                  { label:'Price/sqft', Icon:TrendingUp, highlight:true, vals:selected.map(p=>p.area&&p.price?`₹${Math.round(p.price/p.area).toLocaleString()}`:'–') },
                  { label:'Area',       Icon:Square,     vals:selected.map(p=>p.area?`${p.area.toLocaleString()} sqft`:'–') },
                  { label:'Bedrooms',   Icon:Bed,        vals:selected.map(p=>p.bedrooms?`${p.bedrooms} BHK`:'N/A') },
                  { label:'Bathrooms',  Icon:Bath,       vals:selected.map(p=>p.bathrooms||'–') },
                  { label:'Purpose',                     vals:selected.map(p=>p.purpose||'–') },
                  { label:'Status',                      vals:selected.map(p=>p.status||'–') },
                  { label:'City',       Icon:MapPin,     vals:selected.map(p=>p.city||'–') },
                ].map(({ label, Icon, vals, highlight }) => (
                  <Row key={label} label={label} Icon={Icon} highlight={highlight} cols={selected.length}
                    get={vals.map((v,i) => (
                      <div key={i} style={{ textAlign:'center' }}>
                        <span style={{ fontSize:13,fontWeight:700,color:highlight?C.primary:C.text,fontFamily:C.sans }}>{v}</span>
                      </div>
                    ))}/>
                ))}

                {/* Features */}
                <div style={{ marginTop:16 }}>
                  <p style={{ fontSize:11,fontWeight:700,color:C.muted,marginBottom:10,paddingLeft:6,fontFamily:C.sans,
                    textTransform:'uppercase',letterSpacing:'0.07em' }}>Features</p>
                  <div style={{ display:'grid', gridTemplateColumns:`170px repeat(${selected.length},1fr)`, gap:12 }}>
                    <div/>
                    {selected.map(p => {
                      const feats=getFeats(p.features);
                      return (
                        <div key={p.id} style={{ display:'flex',flexDirection:'column',gap:6 }}>
                          {feats.length>0 ? feats.slice(0,5).map((f,j) => (
                            <div key={j} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.sub,fontFamily:C.sans }}>
                              <Check size={11} color="#059669"/>{f}
                            </div>
                          )) : <span style={{ fontSize:12,color:C.muted,fontFamily:C.sans }}>No features listed</span>}
                          {feats.length>5 && <span style={{ fontSize:11,color:C.muted,fontFamily:C.sans }}>+{feats.length-5} more</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            {bestValue && selected.length>1 && (
              <div style={{ background:`linear-gradient(135deg, ${C.pLight} 0%, #fde8d5 100%)`,
                border:`1px solid ${C.pBorder}`, borderRadius:24, padding:'32px 36px',
                display:'flex', alignItems:'center', gap:20, flexWrap:'wrap',
                animation:'winnerReveal 0.6s cubic-bezier(.34,1.56,.64,1) 0.3s both' }}>
                <div style={{ width:52,height:52,borderRadius:18,background:C.primary,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:`0 6px 20px ${C.primary}40`, flexShrink:0 }}>
                  <Award size={24} color="#fff"/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:C.serif,fontSize:18,fontWeight:700,color:C.text,margin:'0 0 4px' }}>
                    Best Value: {bestValue.title}
                  </p>
                  <p style={{ color:C.muted,fontSize:13,margin:0,fontFamily:C.sans }}>
                    {bestValue.price&&bestValue.area ? `${fmt(Math.round(bestValue.price/bestValue.area))} per sqft — lowest among selected` : 'Best price-to-area ratio'}
                  </p>
                </div>
                <button onClick={() => navigate(`/property/${bestValue.id}`)}
                  style={{ background:C.primary,color:'#fff',border:'none',borderRadius:14,
                    padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:C.sans,
                    boxShadow:`0 4px 14px ${C.primary}40`,display:'flex',alignItems:'center',gap:6 }}>
                  View Property <ArrowUpRight size={13}/>
                </button>
              </div>
            )}
          </div>
        ) : !loading && (
          <div style={{ textAlign:'center', padding:'72px 24px', background:C.card, borderRadius:24,
            border:`1px solid ${C.border}`, animation:'fadeIn 0.5s ease both' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>⚖️</div>
            <h3 style={{ fontFamily:C.serif, fontSize:22, color:C.text, margin:'0 0 8px' }}>
              Select properties to compare
            </h3>
            <p style={{ color:C.muted, fontFamily:C.sans }}>Click any property card above to add it</p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pickerCard  { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes headerSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tableReveal { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes winnerReveal{ from{opacity:0;transform:scale(0.9) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes breathe     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
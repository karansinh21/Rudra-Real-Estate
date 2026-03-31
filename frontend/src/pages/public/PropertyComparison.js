import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, MapPin, TrendingUp, Award } from 'lucide-react';
import { propertyAPI } from '../../services/api';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  serif:'Georgia, serif', sans:"'DM Sans', sans-serif",
};

const fmt = (p) => {
  if (!p) return '–';
  if (p>=10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p>=100000)   return `₹${(p/100000).toFixed(2)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = (img) => {
  if (!img) return null;
  try {
    const arr=typeof img==='string'?JSON.parse(img):img;
    if (Array.isArray(arr)&&arr.length>0){const f=arr[0];return typeof f==='string'?f:f?.url||f?.thumbnail;}
  } catch {}
  return typeof img==='string'?img:null;
};

const getFeats = (f) => { try { const a=Array.isArray(f)?f:JSON.parse(f||'[]'); return Array.isArray(a)?a:[]; } catch { return []; } };

const TC = { RESIDENTIAL:'#C84B00', COMMERCIAL:'#1d4ed8', AGRICULTURAL:'#16a34a', INDUSTRIAL:'#d97706', LAND:'#65a30d' };
const TE = { RESIDENTIAL:'🏠', COMMERCIAL:'🏢', AGRICULTURAL:'🌾', INDUSTRIAL:'🏭', LAND:'🗺️' };

export default function PropertyComparison() {
  const navigate = useNavigate();
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    propertyAPI.getAll({limit:100,status:'AVAILABLE'})
      .then(r=>setProps(r.data?.properties||r.data?.data||[]))
      .catch(()=>setProps([]))
      .finally(()=>setLoading(false));
  }, []);

  const add = (p) => { if (selected.length>=3||selected.find(s=>s.id===p.id)) return; setSelected(x=>[...x,p]); };
  const del = (id) => setSelected(x=>x.filter(p=>p.id!==id));

  const filtered = props.filter(p=>!selected.find(s=>s.id===p.id)&&(!q||p.title?.toLowerCase().includes(q.toLowerCase())||p.city?.toLowerCase().includes(q.toLowerCase())));

  const best = selected.length>1 ? [...selected].sort((a,b)=>(a.price/(a.area||1))-(b.price/(b.area||1)))[0] : null;

  const Row = ({label, val}) => (
    <div style={{display:'grid',gridTemplateColumns:`200px repeat(${selected.length},1fr)`,borderBottom:`1px solid ${DS.border}`}}>
      <div style={{padding:'11px 14px',fontSize:12,fontWeight:600,color:DS.textMuted,display:'flex',alignItems:'center'}}>{label}</div>
      {selected.map(p=>(
        <div key={p.id} style={{padding:'11px 14px',textAlign:'center'}}>
          <span style={{fontSize:13,fontWeight:600,color:DS.text}}>{val(p)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:DS.sans}}>
      <style>{`.pc-card:hover{border-color:${DS.primaryBorder}!important;box-shadow:0 6px 20px rgba(200,75,0,0.08)}`}</style>

      {/* Hero */}
      <div style={{background:DS.card,borderBottom:`1px solid ${DS.border}`,textAlign:'center',padding:'48px 20px 36px'}}>
        <p style={{color:DS.primary,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10}}>Compare</p>
        <h1 style={{fontFamily:DS.serif,fontSize:'clamp(1.8rem,4vw,2.4rem)',color:DS.text,fontWeight:700,marginBottom:8}}>Compare <em>Properties</em> Side by Side</h1>
        <p style={{color:DS.textMuted,fontSize:13}}>Select up to 3 properties to compare</p>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px',display:'flex',flexDirection:'column',gap:24}}>

        {/* Picker */}
        {selected.length<3&&(
          <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:22,padding:'22px 24px',boxShadow:'0 4px 16px rgba(26,8,0,0.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <h2 style={{fontFamily:DS.serif,fontSize:17,color:DS.text,fontWeight:700}}>Add Properties ({selected.length}/3)</h2>
              <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search properties…"
                style={{border:`1px solid ${DS.border}`,borderRadius:12,padding:'8px 14px',fontSize:13,color:DS.text,outline:'none',background:DS.bg,width:200}}/>
            </div>
            {loading
              ? <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>{[0,1,2].map(i=><div key={i} style={{height:140,background:DS.bg,borderRadius:16,animation:'pulse 1.5s infinite'}}/>)}</div>
              : filtered.length===0
                ? <p style={{color:DS.textMuted,fontSize:13,textAlign:'center',padding:'24px 0'}}>No more properties to add.</p>
                : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,maxHeight:360,overflowY:'auto',paddingRight:4}}>
                    {filtered.map(p=>{
                      const img=getImg(p.images), c=TC[p.type]||DS.primary;
                      return (
                        <button key={p.id} onClick={()=>add(p)} className="pc-card"
                          style={{background:DS.bg,border:`2px solid ${DS.border}`,borderRadius:18,overflow:'hidden',textAlign:'left',cursor:'pointer',transition:'all .2s',padding:0}}>
                          <div style={{height:110,background:DS.border,position:'relative',overflow:'hidden'}}>
                            {img?<img src={img} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>{TE[p.type]||'🏘'}</div>}
                            <span style={{position:'absolute',top:8,left:8,fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:999,background:`rgba(255,255,255,0.9)`,color:c}}>{TE[p.type]} {p.type?.charAt(0)+p.type?.slice(1).toLowerCase()}</span>
                          </div>
                          <div style={{padding:'10px 12px'}}>
                            <p style={{color:DS.text,fontWeight:700,fontSize:13,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</p>
                            <div style={{display:'flex',alignItems:'center',gap:4,color:DS.textMuted,fontSize:11,marginBottom:4}}><MapPin size={10}/>{p.city||'–'}</div>
                            <p style={{fontFamily:DS.serif,fontWeight:700,fontSize:14,color:c}}>{fmt(p.price)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
            }
          </div>
        )}

        {selected.length===0&&(
          <div style={{textAlign:'center',padding:'56px 20px'}}>
            <div style={{fontSize:56,marginBottom:16}}>⚖️</div>
            <h3 style={{fontFamily:DS.serif,fontSize:20,color:DS.textSub,fontWeight:700,marginBottom:8}}>Select properties above to compare</h3>
            <p style={{color:DS.textMuted,fontSize:13}}>You can compare up to 3 properties side by side</p>
          </div>
        )}

        {/* Comparison Table */}
        {selected.length>0&&(
          <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:22,boxShadow:'0 4px 16px rgba(26,8,0,0.05)',overflow:'hidden'}}>

            {/* Headers */}
            <div style={{padding:'24px',borderBottom:`1px solid ${DS.border}`}}>
              <div style={{display:'grid',gridTemplateColumns:`200px repeat(${selected.length},1fr)`,gap:16}}>
                <div/>
                {selected.map(p=>{
                  const img=getImg(p.images), c=TC[p.type]||DS.primary, isBest=best?.id===p.id;
                  return (
                    <div key={p.id} style={{position:'relative'}}>
                      <button onClick={()=>del(p.id)} style={{position:'absolute',top:-6,right:-6,width:24,height:24,borderRadius:'50%',background:'#FEF2F2',border:'1px solid rgba(220,38,38,0.2)',color:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:1}}>
                        <X size={12}/>
                      </button>
                      {isBest&&(
                        <div style={{position:'absolute',top:-8,left:4,display:'flex',alignItems:'center',gap:4,background:'#fbbf24',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:999,zIndex:1}}>
                          <Award size={10}/> Best Value
                        </div>
                      )}
                      <div onClick={()=>navigate(`/property/${p.id}`)}
                        style={{border:`2px solid`,borderRadius:18,overflow:'hidden',cursor:'pointer',borderColor:isBest?'#fbbf24':DS.border}}>
                        <div style={{height:120,background:DS.bg,position:'relative'}}>
                          {img?<img src={img} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>{TE[p.type]}</div>}
                          <span style={{position:'absolute',top:8,left:8,fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:999,background:DS.primaryLight,color:c}}>{TE[p.type]} {p.type?.charAt(0)+p.type?.slice(1).toLowerCase()}</span>
                        </div>
                        <div style={{padding:'10px 12px'}}>
                          <p style={{fontFamily:DS.serif,fontWeight:700,color:DS.text,fontSize:13,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</p>
                          <div style={{display:'flex',alignItems:'center',gap:4,color:DS.textMuted,fontSize:11,marginBottom:5}}><MapPin size={10}/>{p.city||'–'}</div>
                          <p style={{fontFamily:DS.serif,fontWeight:700,fontSize:15,color:c}}>{fmt(p.price)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            <div>
              <div style={{padding:'14px 24px 8px',background:DS.bg,borderBottom:`1px solid ${DS.border}`}}>
                <p style={{fontFamily:DS.serif,fontWeight:700,color:DS.text,fontSize:15}}>Detailed Comparison</p>
              </div>
              {[
                ['Price',            p=>fmt(p.price)],
                ['Price / sqft',     p=>p.price&&p.area?fmt(Math.round(p.price/p.area)):'–'],
                ['Area',             p=>p.area?`${p.area.toLocaleString()} sqft`:'–'],
                ['Bedrooms',         p=>p.bedrooms?`${p.bedrooms} BHK`:'N/A'],
                ['Bathrooms',        p=>p.bathrooms||'–'],
                ['City',             p=>p.city||'–'],
                ['Purpose',          p=>p.purpose?(p.purpose==='SALE'?'For Sale':'For Rent'):'–'],
                ['Status',           p=>p.status||'–'],
              ].map(([label,val])=><Row key={label} label={label} val={val}/>)}

              {/* Features row */}
              <div style={{display:'grid',gridTemplateColumns:`200px repeat(${selected.length},1fr)`,padding:'12px 0'}}>
                <div style={{padding:'10px 14px',fontSize:12,fontWeight:600,color:DS.textMuted,display:'flex',alignItems:'flex-start',paddingTop:14}}>Features</div>
                {selected.map(p=>{
                  const feats=getFeats(p.features);
                  return (
                    <div key={p.id} style={{padding:'10px 14px'}}>
                      {feats.length>0
                        ? feats.slice(0,5).map((f,i)=>(
                            <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:DS.textSub,marginBottom:5}}>
                              <Check size={12} color='#16a34a'/>{f}
                            </div>
                          ))
                        : <span style={{fontSize:12,color:DS.textMuted}}>No features listed</span>}
                      {feats.length>5&&<p style={{fontSize:11,color:DS.textMuted,marginTop:4}}>+{feats.length-5} more</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {best&&(
              <div style={{borderTop:`1px solid ${DS.border}`,background:'#fffbeb',padding:'14px 24px',display:'flex',alignItems:'center',gap:12}}>
                <Award size={18} color='#d97706'/>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,color:DS.text,fontSize:13}}>Best Value: {best.title}</p>
                  <p style={{color:DS.textMuted,fontSize:12}}>{best.price&&best.area?`${fmt(Math.round(best.price/best.area))} per sqft — lowest among selected`:'Best price-to-area ratio'}</p>
                </div>
                <button onClick={()=>navigate(`/property/${best.id}`)} style={{background:'#fef3c7',color:'#b45309',border:'1px solid #fde68a',borderRadius:12,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  View →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
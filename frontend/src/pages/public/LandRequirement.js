import React, { useState } from 'react';
import { CheckCircle, Layers, ArrowRight, ArrowLeft, Loader2, X, MapPin } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { landAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia, "Times New Roman", serif',
  sans:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const LAND_TYPES = [
  { id:'AGRICULTURAL', name:'Agricultural', icon:'🌾', desc:'Farming & cultivation'  },
  { id:'COMMERCIAL',   name:'Commercial',   icon:'🏢', desc:'Business purposes'       },
  { id:'RESIDENTIAL',  name:'Residential',  icon:'🏠', desc:'Building homes'          },
  { id:'INDUSTRIAL',   name:'Industrial',   icon:'🏭', desc:'Factories & warehouses'  },
];

const FEATURES = [
  'Water Source','Electricity Available','Road Access','Fenced',
  'Flat Terrain','Trees/Plantation','Well/Borewell','Canal Access',
  'Near Highway','Approved Layout','Clear Title','NA Permission',
];

const DEFAULT_LOCATIONS = [
  'Halol','Dabhoi','Savli','Karjan','Waghodia',
  'Sinor','Padra','Jambusar','Ranoli','Chhota Udaipur',
];

const Label = ({ children, required }) => (
  <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6, fontFamily:C.sans }}>
    {children}{required && <span style={{ color:'#DC2626' }}> *</span>}
  </label>
);

const Input = (props) => (
  <input {...props} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:C.sans, transition:'border 0.2s, box-shadow 0.2s', ...props.style }}
    onFocus={e => { e.target.style.borderColor=C.primary; e.target.style.boxShadow=`0 0 0 3px ${C.pBorder}`; }}
    onBlur={e  => { e.target.style.borderColor=C.border;  e.target.style.boxShadow='none'; }} />
);

const Textarea = (props) => (
  <textarea {...props} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:C.sans, resize:'vertical', minHeight:88, transition:'border 0.2s', ...props.style }}
    onFocus={e => { e.target.style.borderColor=C.primary; e.target.style.boxShadow=`0 0 0 3px ${C.pBorder}`; }}
    onBlur={e  => { e.target.style.borderColor=C.border;  e.target.style.boxShadow='none'; }} />
);

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding:'7px 15px', borderRadius:10, fontSize:13, fontWeight:600, fontFamily:C.sans, cursor:'pointer', transition:'all 0.15s', border:`1px solid ${active?C.primary:C.border}`, background:active?C.pLight:C.card, color:active?C.primary:C.muted, boxShadow:active?`0 0 0 2px ${C.pBorder}`:'none' }}>
    {children}
  </button>
);

export default function LandRequirement() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { t }     = useLanguage();
  const canEdit   = user?.role === 'BROKER';

  const [step,         setStep]         = useState(1);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState('');
  const [locInput,     setLocInput]     = useState('');
  const [allLocations, setAllLocations] = useState(DEFAULT_LOCATIONS);

  const [form, setForm] = useState({
    name:'', email:'', phone:'',
    purposeType:'buy', landType:'AGRICULTURAL',
    minArea:'', maxArea:'', areaUnit:'acres',
    preferredLocations:[], city:'Vadodara', state:'Gujarat',
    minBudget:'', maxBudget:'',
    features:[], timeline:'3months', additionalNotes:'',
  });

  const set    = (k, v) => setForm(p => ({...p, [k]:v}));
  const toggle = (k, v) => setForm(p => ({...p, [k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));

  const addLocation = () => {
    if (!canEdit) return;
    const loc = locInput.trim();
    if (!loc) return;
    if (!allLocations.includes(loc)) setAllLocations(p => [...p, loc]);
    if (!form.preferredLocations.includes(loc)) toggle('preferredLocations', loc);
    setLocInput('');
  };

  const delLocation = (loc) => {
    if (!canEdit) return;
    setAllLocations(p => p.filter(l => l !== loc));
    setForm(p => ({...p, preferredLocations:p.preferredLocations.filter(l => l !== loc)}));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) { setError(t('required')); return; }
    setSubmitting(true); setError('');
    try {
      await landAPI.submitRequirement({...form, minArea:parseFloat(form.minArea)||0, maxArea:parseFloat(form.maxArea)||0, minBudget:parseFloat(form.minBudget)||0, maxBudget:parseFloat(form.maxBudget)||0});
      setSubmitted(true);
    } catch (err) { setError(err?.response?.data?.error || t('errorMsg')); }
    finally { setSubmitting(false); }
  };

  const STEPS = [t('landType'), `${t('location')} & ${t('area')}`, `${t('budget')} & Features`, t('name')];

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:C.sans }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:32, padding:'52px 44px', textAlign:'center', maxWidth:480, width:'100%', boxShadow:'0 24px 64px rgba(26,8,0,0.1)', animation:'popIn 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ width:80, height:80, borderRadius:24, background:`linear-gradient(135deg,${C.primary},#a33800)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 12px 32px rgba(200,75,0,0.3)' }}>
          <CheckCircle size={40} color="#fff"/>
        </div>
        <h2 style={{ fontFamily:C.serif, fontSize:28, color:C.text, marginBottom:10, fontWeight:700 }}>{t('thankYou')}</h2>
        <p style={{ color:C.sub, fontSize:14, marginBottom:32, lineHeight:1.7, fontFamily:C.sans }}>{t('successMsg')}</p>
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:'20px 24px', marginBottom:32, textAlign:'left' }}>
          {[
            [t('landType'),   form.landType],
            ['Purpose',       form.purposeType],
            [t('area'),       `${form.minArea||'–'}–${form.maxArea||'–'} ${form.areaUnit}`],
            [t('budget'),     form.minBudget?`₹${Number(form.minBudget).toLocaleString('en-IN')} – ₹${Number(form.maxBudget||0).toLocaleString('en-IN')}`:'–'],
            [t('location'),   form.preferredLocations.length?form.preferredLocations.join(', '):'Any'],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'9px 0', borderBottom:`1px solid ${C.border}`, gap:8 }}>
              <span style={{ color:C.muted, fontWeight:500, fontFamily:C.sans }}>{k}</span>
              <span style={{ color:C.text, fontWeight:700, fontFamily:C.sans, textAlign:'right', flex:1 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/land-listings')} style={{ flex:1, padding:13, background:'transparent', border:`1px solid ${C.border}`, color:C.sub, borderRadius:16, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.sans }}>{t('landPlots')}</button>
          <button onClick={() => navigate('/')} style={{ flex:1, padding:13, background:C.primary, color:'#fff', border:'none', borderRadius:16, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 4px 16px rgba(200,75,0,0.3)' }}>{t('home')}</button>
        </div>
      </div>
    </div>
  );

  const StepDot = ({ n }) => {
    const done=step>n, current=step===n;
    return (
      <div style={{ display:'flex', alignItems:'center', flex:n<4?1:'none' }}>
        <div style={{ width:40, height:40, borderRadius:14, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, transition:'all 0.3s', background:done||current?C.primary:C.bg, color:done||current?'#fff':C.muted, border:`2px solid ${current?C.primary:done?C.primary:C.border}`, boxShadow:current?'0 6px 20px rgba(200,75,0,0.3)':'none', transform:current?'scale(1.1)':'scale(1)' }}>
          {done?<CheckCircle size={18}/>:n}
        </div>
        {n<4&&<div style={{ height:2, flex:1, margin:'0 6px', marginBottom:20, borderRadius:2, background:done?C.primary:C.border, transition:'background 0.4s' }}/>}
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.sans }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40%', left:'50%', transform:'translateX(-50%)', width:500, height:500, borderRadius:'50%', background:`radial-gradient(circle,${C.pLight} 0%,transparent 65%)`, pointerEvents:'none' }}/>
        <div style={{ maxWidth:700, margin:'0 auto', padding:'52px 20px 40px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:18 }}>
            <Layers size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:C.sans }}>{t('landRequirements')}</span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(1.8rem,4.5vw,2.8rem)', color:C.text, fontWeight:700, marginBottom:10, lineHeight:1.2 }}>
            {t('postRequirement')} <em style={{ fontStyle:'italic', color:C.primary }}>{t('landType')}</em>
          </h1>
          <p style={{ color:C.sub, fontSize:14, fontFamily:C.serif, marginBottom:20 }}>{t('heroSubtitle')}</p>
          <button onClick={() => navigate('/land-listings')} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:`1px solid ${C.border}`, borderRadius:99, padding:'7px 18px', fontSize:13, color:C.muted, cursor:'pointer', fontFamily:C.sans }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; }}>
            <ArrowLeft size={13}/> {t('landPlots')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 20px 60px' }}>
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
            {[1,2,3,4].map(n => <StepDot key={n} n={n}/>)}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            {STEPS.map((s,i) => <span key={s} style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:C.sans, color:step===i+1?C.primary:step>i+1?C.sub:C.border }}>{s}</span>)}
          </div>
        </div>

        <div style={{ background:C.card, borderRadius:28, border:`1px solid ${C.border}`, boxShadow:'0 8px 32px rgba(26,8,0,0.07)', overflow:'hidden' }}>
          <div style={{ padding:'32px 36px' }}>

            {step===1&&(
              <div style={{ animation:'slideUp 0.35s ease' }}>
                <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, fontWeight:700, marginBottom:24 }}>{t('landType')}</h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
                  {LAND_TYPES.map(tp => (
                    <div key={tp.id} onClick={() => set('landType', tp.id)}
                      style={{ borderRadius:20, padding:'24px 18px', cursor:'pointer', textAlign:'center', border:`2px solid ${form.landType===tp.id?C.primary:C.border}`, background:form.landType===tp.id?C.pLight:C.card, boxShadow:form.landType===tp.id?`0 0 0 3px ${C.pBorder}`:'none', transition:'all 0.2s', transform:form.landType===tp.id?'translateY(-2px)':'none' }}>
                      <div style={{ fontSize:40, marginBottom:10 }}>{tp.icon}</div>
                      <p style={{ fontWeight:700, fontSize:14, color:C.text, fontFamily:C.sans, marginBottom:4 }}>{tp.name}</p>
                      <p style={{ color:C.muted, fontSize:12, fontFamily:C.sans }}>{tp.desc}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>{t('purpose')}</Label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['buy','lease','rent'].map(p => <Chip key={p} active={form.purposeType===p} onClick={() => set('purposeType', p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</Chip>)}
                  </div>
                </div>
              </div>
            )}

            {step===2&&(
              <div style={{ animation:'slideUp 0.35s ease' }}>
                <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, fontWeight:700, marginBottom:22 }}>{t('location')} & {t('area')}</h2>
                <Label>{canEdit?`${t('location')} (select & add custom)`:t('location')}</Label>
                {canEdit&&(
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    <Input value={locInput} onChange={e => setLocInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&addLocation()} placeholder={`${t('location')}...`}/>
                    <button onClick={addLocation} style={{ padding:'11px 18px', borderRadius:12, background:C.primary, color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, flexShrink:0 }}>+ {t('save')}</button>
                  </div>
                )}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16, minHeight:44 }}>
                  {allLocations.map(l => {
                    const sel=form.preferredLocations.includes(l);
                    return (
                      <div key={l} style={{ display:'flex', alignItems:'center', borderRadius:10, border:`1px solid ${sel?C.primary:C.border}`, background:sel?C.pLight:C.card, transition:'all 0.15s', boxShadow:sel?`0 0 0 2px ${C.pBorder}`:'none' }}>
                        <button onClick={() => toggle('preferredLocations', l)} style={{ paddingLeft:12, paddingRight:canEdit?6:12, paddingTop:7, paddingBottom:7, background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:sel?C.primary:C.muted, fontFamily:C.sans }}>
                          {sel&&<span style={{ marginRight:4 }}>✓</span>}{l}
                        </button>
                        {canEdit&&<button onClick={() => delLocation(l)} style={{ paddingRight:8, background:'none', border:'none', cursor:'pointer', lineHeight:0 }}><X size={11} color={C.muted}/></button>}
                      </div>
                    );
                  })}
                </div>
                {form.preferredLocations.length>0&&<p style={{ fontSize:12, color:C.primary, fontWeight:600, marginBottom:20, fontFamily:C.sans, display:'flex', alignItems:'center', gap:5 }}><MapPin size={12}/>{form.preferredLocations.length} {t('location')}: {form.preferredLocations.join(', ')}</p>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div><Label>{t('minArea')}</Label><Input type="number" value={form.minArea} onChange={e => set('minArea', e.target.value)} placeholder="e.g. 1"/></div>
                  <div><Label>{t('maxArea')}</Label><Input type="number" value={form.maxArea} onChange={e => set('maxArea', e.target.value)} placeholder="e.g. 5"/></div>
                </div>
                <div>
                  <Label>{t('area_unit')}</Label>
                  <select value={form.areaUnit} onChange={e => set('areaUnit', e.target.value)} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 14px', color:C.text, fontSize:14, outline:'none', fontFamily:C.sans }}>
                    {['acres','sqft','hectares','bigha','guntha'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step===3&&(
              <div style={{ animation:'slideUp 0.35s ease' }}>
                <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, fontWeight:700, marginBottom:24 }}>{t('budget')} & Features</h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
                  <div><Label>{t('budget')} Min (₹)</Label><Input type="number" value={form.minBudget} onChange={e => set('minBudget', e.target.value)} placeholder="1000000"/></div>
                  <div><Label>{t('budget')} Max (₹)</Label><Input type="number" value={form.maxBudget} onChange={e => set('maxBudget', e.target.value)} placeholder="5000000"/></div>
                </div>
                <div style={{ marginBottom:24 }}>
                  <Label>Desired Features</Label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {FEATURES.map(f => <Chip key={f} active={form.features.includes(f)} onClick={() => toggle('features', f)}>{f}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label>{t('timeline')}</Label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                    {[['immediate','Immediate'],['3months','3 Months'],['6months','6 Months'],['1year','1 Year']].map(([v,l]) => <Chip key={v} active={form.timeline===v} onClick={() => set('timeline', v)}>{l}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label>{t('description')}</Label>
                  <Textarea value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} placeholder={`${t('description')}...`}/>
                </div>
              </div>
            )}

            {step===4&&(
              <div style={{ animation:'slideUp 0.35s ease' }}>
                <h2 style={{ fontFamily:C.serif, fontSize:22, color:C.text, fontWeight:700, marginBottom:24 }}>{t('name')}</h2>
                <div style={{ marginBottom:14 }}><Label required>{t('fullName')}</Label><Input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('fullName')}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
                  <div><Label required>{t('email')}</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={t('email')}/></div>
                  <div><Label required>{t('phoneNumber')}</Label><Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210"/></div>
                </div>
                <div style={{ background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:20, padding:'20px 22px' }}>
                  <p style={{ color:C.primary, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, fontFamily:C.sans }}>Summary</p>
                  {[
                    [t('landType'),  form.landType],
                    [t('purpose'),   form.purposeType],
                    [t('area'),      `${form.minArea||'–'}–${form.maxArea||'–'} ${form.areaUnit}`],
                    [t('budget'),    form.minBudget?`₹${Number(form.minBudget).toLocaleString('en-IN')} – ₹${Number(form.maxBudget||0).toLocaleString('en-IN')}`:'–'],
                    [t('location'),  form.preferredLocations.length?form.preferredLocations.join(', '):'Any'],
                    ['Features',     form.features.length?`${form.features.length} selected`:'None'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'8px 0', borderBottom:`1px solid ${C.pBorder}`, gap:8 }}>
                      <span style={{ color:C.muted, fontWeight:500, fontFamily:C.sans }}>{k}</span>
                      <span style={{ color:C.text, fontWeight:700, fontFamily:C.sans, textTransform:'capitalize', textAlign:'right', flex:1 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {error&&<div style={{ marginTop:14, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'10px 14px', color:'#DC2626', fontSize:13, fontFamily:C.sans }}>⚠️ {error}</div>}
              </div>
            )}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 36px', borderTop:`1px solid ${C.border}`, background:C.bg }}>
            {step>1
              ? <button onClick={() => setStep(s => s-1)} style={{ display:'inline-flex', alignItems:'center', gap:6, background:C.card, border:`1px solid ${C.border}`, color:C.sub, borderRadius:14, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.sans }}><ArrowLeft size={14}/> {t('back')}</button>
              : <div/>
            }
            {step<4
              ? <button onClick={() => setStep(s => s+1)} style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.primary, color:'#fff', border:'none', borderRadius:14, padding:'11px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 6px 18px rgba(200,75,0,0.3)' }}>{t('next')} <ArrowRight size={14}/></button>
              : <button onClick={handleSubmit} disabled={submitting||!form.name||!form.email||!form.phone} style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.primary, color:'#fff', border:'none', borderRadius:14, padding:'11px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:C.sans, boxShadow:'0 6px 18px rgba(200,75,0,0.3)', opacity:submitting||!form.name||!form.email||!form.phone?0.5:1 }}>
                  {submitting?<><Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/> {t('loading')}</>:<><CheckCircle size={14}/> {t('submit')}</>}
                </button>
            }
          </div>
        </div>
        <p style={{ textAlign:'center', color:C.muted, fontSize:12, marginTop:16, fontFamily:C.sans }}>{t('next')} {step} of 4 — {STEPS[step-1]}</p>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0}       to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(0.85)} 100%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
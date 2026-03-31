import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, ChevronLeft, ChevronRight, Home, Video, Loader2 } from 'lucide-react';
import { propertyAPI, enquiryAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';

const C = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', pLight:'#FEF3EE', pBorder:'rgba(200,75,0,0.15)',
  text:'#1A0800', sub:'#6B5748', muted:'#9C8B7A',
  serif:'Georgia,"Times New Roman",serif',
  sans:"'DM Sans','Segoe UI',system-ui,sans-serif",
};

const SLOTS  = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const inp = () => ({ width:'100%', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', fontSize:14, color:C.text, background:C.bg, outline:'none', boxSizing:'border-box', fontFamily:C.sans });

export default function PropertyTourScheduler() {
  const navigate = useNavigate();
  const { t }    = useLanguage();

  const [step,          setStep]         = useState(1);
  const [properties,    setProperties]   = useState([]);
  const [loadingProps,  setLoadingProps]  = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [calDate,       setCalDate]      = useState(new Date());
  const [selDate,       setSelDate]      = useState(null);
  const [selTime,       setSelTime]      = useState('');
  const [form, setForm] = useState({ propertyId:'', tourType:'in-person', name:'', email:'', phone:'', notes:'' });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try { const res=await propertyAPI.getAll({limit:50}); setProperties(res.data?.properties||[]); }
      catch { setProperties([]); }
      setLoadingProps(false);
    })();
  }, []);

  const today       = new Date(); today.setHours(0,0,0,0);
  const firstDay    = new Date(calDate.getFullYear(),calDate.getMonth(),1).getDay();
  const daysInMonth = new Date(calDate.getFullYear(),calDate.getMonth()+1,0).getDate();
  const navMonth    = d => { const n=new Date(calDate); n.setMonth(n.getMonth()+d); setCalDate(n); };
  const isSelDate   = d => selDate&&selDate.getFullYear()===calDate.getFullYear()&&selDate.getMonth()===calDate.getMonth()&&selDate.getDate()===d;
  const isToday     = d => today.getFullYear()===calDate.getFullYear()&&today.getMonth()===calDate.getMonth()&&today.getDate()===d;
  const isPast      = d => new Date(calDate.getFullYear(),calDate.getMonth(),d)<today;
  const selProp     = properties.find(p => p.id===form.propertyId||p.id===Number(form.propertyId));

  const handleSubmit = async () => {
    if (!form.name||!form.email||!form.phone) { setError(t('required')); return; }
    setSubmitting(true); setError('');
    try {
      const msg = `Property Tour Request\nType: ${form.tourType}\nDate: ${selDate?.toLocaleDateString()}\nTime: ${selTime}\n${form.notes?`Notes: ${form.notes}`:''}`;
      await enquiryAPI.create({ propertyId:form.propertyId||selProp?.id, clientName:form.name, clientEmail:form.email, clientPhone:form.phone, message:msg });
      setSuccess(true);
    } catch { setError(t('errorMsg')); }
    setSubmitting(false);
  };

  if (success) return (
    <div style={{ background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:C.card, borderRadius:32, padding:'60px 48px', maxWidth:500, width:'100%', textAlign:'center', border:`1px solid ${C.border}`, boxShadow:'0 24px 64px rgba(200,75,0,0.1)', animation:'successBounce 0.7s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div style={{ width:72, height:72, borderRadius:99, background:C.pLight, border:`2px solid ${C.primary}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <CheckCircle size={32} color={C.primary}/>
        </div>
        <h2 style={{ fontFamily:C.serif, fontSize:30, fontWeight:700, color:C.text, margin:'0 0 10px' }}>{t('thankYou')}!</h2>
        <p style={{ color:C.muted, marginBottom:28, fontFamily:C.sans, fontSize:14 }}>{t('successMsg')}</p>
        <div style={{ background:C.bg, borderRadius:16, padding:'18px 22px', textAlign:'left', marginBottom:28 }}>
          {selProp && <p style={{ margin:'0 0 8px', fontSize:14, fontWeight:700, color:C.text, fontFamily:C.serif }}>{selProp.title}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:6, color:C.muted, fontSize:13, marginBottom:5, fontFamily:C.sans }}><Calendar size={13} color={C.primary}/>{selDate?.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:C.muted, fontSize:13, fontFamily:C.sans }}><Clock size={13} color={C.primary}/>{selTime}</div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={() => { setSuccess(false);setStep(1);setForm({propertyId:'',tourType:'in-person',name:'',email:'',phone:'',notes:''});setSelDate(null);setSelTime(''); }}
            style={{ background:C.primary, color:'#fff', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:C.sans }}>
            {t('scheduleVisit')} Again
          </button>
          <button onClick={() => navigate('/')} style={{ background:C.card, color:C.text, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 24px', fontWeight:600, cursor:'pointer', fontFamily:C.sans }}>
            {t('home')}
          </button>
        </div>
      </div>
      <style>{`@keyframes successBounce{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.sans }}>
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:700, margin:'0 auto', padding:'48px 20px 36px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:20 }}>
            <Calendar size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Property Visit · Rudra Real Estate</span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2rem,5vw,3rem)', color:C.text, fontWeight:700, marginBottom:10 }}>
            {t('scheduleVisit')} a <em style={{ fontStyle:'italic', color:C.primary }}>Tour</em>
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, marginBottom:28 }}>{t('heroSubtitle')}</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, maxWidth:360, margin:'0 auto 8px' }}>
            {[1,2,3].map((s,i) => (
              <React.Fragment key={s}>
                <div style={{ width:36, height:36, borderRadius:99, fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', background:step>s?C.primary:step===s?C.pLight:C.bg, color:step>s?'#fff':step===s?C.primary:C.muted, border:`2px solid ${step>=s?C.primary:C.border}`, transition:'all 0.3s' }}>
                  {step>s?'✓':s}
                </div>
                {i<2&&<div style={{ flex:1, height:2, maxWidth:60, background:step>s?C.primary:C.border, transition:'background 0.3s' }}/>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', maxWidth:360, margin:'0 auto', fontSize:11, color:C.muted }}>
            <span>{t('properties')}</span><span>Date &amp; Time</span><span>Your Info</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ background:C.card, borderRadius:28, border:`1px solid ${C.border}`, padding:'36px' }}>

          {step===1 && (
            <div>
              <h2 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:C.text, margin:'0 0 24px' }}>
                {t('properties')} &amp; Tour {t('type')}
              </h2>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>{t('properties')}</label>
                {loadingProps
                  ? <div style={{ padding:'12px 16px', border:`1px solid ${C.border}`, borderRadius:12, color:C.muted, fontSize:13 }}>{t('loading')}</div>
                  : <select value={form.propertyId} onChange={e=>setForm({...form,propertyId:e.target.value})} style={{ ...inp(), cursor:'pointer' }}>
                      <option value="">Choose a {t('properties')}</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.city||'Vadodara'}</option>)}
                    </select>}
              </div>
              {selProp && (
                <div style={{ background:C.pLight, border:`2px solid ${C.pBorder}`, borderRadius:16, padding:'14px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
                  <MapPin size={16} color={C.primary}/>
                  <div>
                    <p style={{ fontWeight:700, color:C.text, fontSize:14, margin:0 }}>{selProp.title}</p>
                    <p style={{ color:C.muted, fontSize:12, margin:0 }}>{selProp.city}</p>
                  </div>
                </div>
              )}
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Tour {t('type')}</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { v:'in-person', Icon:Home,  label:'In-Person Visit', sub:'Visit the property with a broker' },
                  { v:'virtual',   Icon:Video, label:'Virtual Tour',    sub:'Video call with broker' },
                ].map(({v,Icon,label,sub}) => (
                  <button key={v} onClick={() => setForm({...form,tourType:v})}
                    style={{ padding:'20px 16px', borderRadius:16, textAlign:'left', cursor:'pointer', transition:'all 0.2s', border:`2px solid ${form.tourType===v?C.primary:C.border}`, background:form.tourType===v?C.pLight:C.bg, boxShadow:form.tourType===v?'0 4px 12px rgba(200,75,0,0.15)':'none' }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:form.tourType===v?C.primary:C.bg, border:`1px solid ${form.tourType===v?C.primary:C.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                      <Icon size={18} color={form.tourType===v?'#fff':C.muted}/>
                    </div>
                    <p style={{ fontWeight:700, fontSize:14, color:C.text, margin:'0 0 4px', fontFamily:C.serif }}>{label}</p>
                    <p style={{ fontSize:12, color:C.muted, margin:0 }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===2 && (
            <div>
              <h2 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:C.text, margin:'0 0 24px' }}>Choose Date &amp; Time</h2>
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:20, marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <button onClick={() => navMonth(-1)} style={{ width:34,height:34,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronLeft size={16} color={C.muted}/></button>
                  <h3 style={{ fontFamily:C.serif, fontWeight:700, color:C.text, margin:0, fontSize:16 }}>{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</h3>
                  <button onClick={() => navMonth(1)} style={{ width:34,height:34,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronRight size={16} color={C.muted}/></button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
                  {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:C.muted, padding:'6px 0' }}>{d}</div>)}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                  {[...Array(firstDay)].map((_,i) => <div key={i}/>)}
                  {[...Array(daysInMonth)].map((_,i) => {
                    const d=i+1, past=isPast(d), sel=isSelDate(d), tod=isToday(d);
                    return (
                      <button key={d} disabled={past} onClick={() => setSelDate(new Date(calDate.getFullYear(),calDate.getMonth(),d))}
                        style={{ aspectRatio:'1', borderRadius:10, border:'none', fontWeight:600, fontSize:13, cursor:past?'not-allowed':'pointer', transition:'all 0.15s', fontFamily:C.sans, background:sel?C.primary:tod?C.pLight:C.card, color:sel?'#fff':past?'#d1d5db':tod?C.primary:C.text, opacity:past?0.4:1, boxShadow:sel?'0 4px 10px rgba(200,75,0,0.3)':'none' }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                Time Slots {selDate&&`— ${selDate.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}`}
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {SLOTS.map(t2 => (
                  <button key={t2} onClick={() => setSelTime(t2)}
                    style={{ padding:'11px 8px', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:C.sans, transition:'all 0.15s', border:`2px solid ${selTime===t2?C.primary:C.border}`, background:selTime===t2?C.pLight:C.bg, color:selTime===t2?C.primary:C.sub, boxShadow:selTime===t2?'0 4px 10px rgba(200,75,0,0.2)':'none' }}>
                    {t2}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <h2 style={{ fontFamily:C.serif, fontSize:22, fontWeight:700, color:C.text, margin:'0 0 24px' }}>Your Information</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { k:'name',  label:`${t('fullName')} *`,    type:'text',  ph:t('fullName') },
                  { k:'email', label:`${t('email')} *`,        type:'email', ph:t('email') },
                  { k:'phone', label:`${t('phoneNumber')} *`,  type:'tel',   ph:'+91 98765 43210' },
                ].map(({k,label,type,ph}) => (
                  <div key={k}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
                    <input type={type} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph} style={inp()}/>
                  </div>
                ))}
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('description')}</label>
                  <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} placeholder="Any specific requirements…" style={{ ...inp(), resize:'vertical', minHeight:80 }}/>
                </div>
              </div>
              {error && <p style={{ color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', fontSize:13, marginTop:16 }}>{error}</p>}
              <div style={{ background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:16, padding:'16px 20px', marginTop:20 }}>
                <p style={{ fontWeight:700, color:C.text, margin:'0 0 10px', fontSize:13, fontFamily:C.serif }}>Tour Summary</p>
                {selProp && <p style={{ fontSize:12, color:C.sub, margin:'0 0 4px' }}>📍 {selProp.title}</p>}
                {selDate  && <p style={{ fontSize:12, color:C.sub, margin:'0 0 4px' }}>📅 {selDate.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>}
                {selTime  && <p style={{ fontSize:12, color:C.sub, margin:'0 0 4px' }}>🕐 {selTime}</p>}
                <p style={{ fontSize:12, color:C.sub, margin:0 }}>{form.tourType==='in-person'?'🏠 In-Person Visit':'💻 Virtual Tour'}</p>
              </div>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:32, gap:12 }}>
            {step>1
              ? <button onClick={() => setStep(s=>s-1)} style={{ flex:1, padding:13, border:`1px solid ${C.border}`, borderRadius:14, background:C.bg, fontWeight:600, cursor:'pointer', color:C.text, fontFamily:C.sans }}>← {t('back')}</button>
              : <div/>}
            <button
              disabled={(step===1&&!form.propertyId)||(step===2&&(!selDate||!selTime))||submitting}
              onClick={() => step<3?setStep(s=>s+1):handleSubmit()}
              style={{ flex:1, padding:13, border:'none', borderRadius:14, background:C.primary, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:C.sans, opacity:((step===1&&!form.propertyId)||(step===2&&(!selDate||!selTime)))?0.5:1, transition:'all 0.2s', boxShadow:'0 4px 14px rgba(200,75,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {submitting?t('loading'):step===3?`${t('submit')} ✓`:`${t('next')} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { lawyerPublicAPI, legalAPI } from '../../services/api';
import {
  Calendar, Clock, Phone, FileText, IndianRupee,
  CheckCircle, AlertCircle, ArrowLeft, Scale, Sparkles,
  BadgeCheck, ArrowUpRight, Home, TreePine
} from 'lucide-react';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  serif:'Georgia, serif', sans:"'DM Sans', sans-serif",
};

const CAT_CONFIG = {
  property: {
    label:'🏠 Property Legal Services', icon:Home,
    description:'Rent, Sale, Registration & Property Documentation'
  },
  land: {
    label:'🌾 Land & Plot Legal Services', icon:TreePine,
    description:'Land Title, NA Conversion, Mutation & Plot Documentation'
  },
};

const inp = {
  width:'100%', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12,
  padding:'10px 14px', color:DS.text, fontSize:13, outline:'none', boxSizing:'border-box',
  fontFamily:`'DM Sans', sans-serif`, transition:'border-color .2s, box-shadow .2s',
};

const inpFocus = (e) => {
  e.target.style.borderColor = DS.primary;
  e.target.style.boxShadow   = `0 0 0 3px ${DS.primaryLight}`;
  e.target.style.background  = '#fff';
};
const inpBlur  = (e) => {
  e.target.style.borderColor = DS.border;
  e.target.style.boxShadow   = 'none';
  e.target.style.background  = DS.bg;
};

export default function BookConsultation() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const pre       = location.state?.service || null;

  const [step,       setStep]       = useState(pre ? 3 : 1);
  const [prevStep,   setPrevStep]   = useState(null);
  const [lawyer,     setLawyer]     = useState(null);
  const [allSvc,     setAllSvc]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [selCat,     setSelCat]     = useState(pre?.category || null);
  const [selSvc,     setSelSvc]     = useState(pre ? { ...pre, name: pre.name||pre.serviceName } : null);
  const [form,       setForm]       = useState({ date:'', timeSlot:'', name:'', email:'', phone:'', propertyType:'', description:'' });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');
  const [visible,    setVisible]    = useState(false);
  const [slotPick,   setSlotPick]   = useState(null);

  useEffect(() => { fetchData(); setTimeout(() => setVisible(true), 60); }, []);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) { try { const p = JSON.parse(u); setForm(f=>({...f,name:p.name||'',email:p.email||'',phone:p.phone||''})); } catch {} }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.allSettled([
        lawyerPublicAPI.getProfile(),
        legalAPI.getAllServices(),
      ]);
      if (pRes.status==='fulfilled') setLawyer(pRes.value.data?.lawyer || pRes.value.data);
      if (sRes.status==='fulfilled') {
        const raw = sRes.value.data?.services || sRes.value.data || [];
        setAllSvc(raw.map(s=>({...s, name:s.name||s.serviceName, category:s.category||'property'})));
      }
    } catch { setError('Data load error.'); }
    finally { setLoading(false); }
  };

  const goStep = (n) => { setPrevStep(step); setStep(n); };

  const categories = Object.entries(CAT_CONFIG).map(([id,cfg])=>({
    id, ...cfg, services: allSvc.filter(s=>s.category===id)
  })).filter(c=>c.services.length>0);

  const catSvcs = selCat ? allSvc.filter(s=>s.category===selCat) : [];
  const catCfg  = selCat ? CAT_CONFIG[selCat] : null;

  const getDates = () => {
    const dates=[]; const today=new Date();
    for (let i=1; dates.length<5; i++) {
      const d=new Date(today); d.setDate(today.getDate()+i);
      if (d.getDay()!==0) dates.push({
        date:  d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}),
        slots: d.getDay()===6
          ? ['10:00 AM','11:00 AM','12:00 PM']
          : ['10:00 AM','11:00 AM','2:00 PM','3:00 PM','5:00 PM'],
      });
    }
    return dates;
  };

  const handleSubmit = async () => {
    setSubmitErr('');
    if (!form.name||!form.email||!form.phone) { setSubmitErr('Name, email and phone are required.'); return; }
    setSubmitting(true);
    try {
      await legalAPI.createRequest({
        serviceType:     selSvc?.name||'',
        propertyDetails: form.propertyType||'Not specified',
        clientName:      form.name,
        clientContact:   form.phone,
        description:     `Category: ${catCfg?.label||selCat}. Date: ${form.date} at ${form.timeSlot}. ${form.description}`,
      });
      setDone(true);
    } catch(err) { setSubmitErr(err?.response?.data?.error||'Booking error.'); }
    finally { setSubmitting(false); }
  };

  const canProceed = () => {
    if (step===2) return !!selCat;
    if (step===3) return !!selSvc;
    if (step===4) return !!form.date && !!form.timeSlot;
    return true;
  };

  const stepLabels = ['Lawyer','Category','Service','Schedule'];

  if (loading) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',
      justifyContent:'center',fontFamily:DS.sans}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${DS.border}`,
          borderTopColor:DS.primary,animation:'sp .8s linear infinite',margin:'0 auto 10px'}}/>
        <p style={{color:DS.textMuted,fontSize:13}}>Loading…</p>
      </div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (done) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',
      justifyContent:'center',padding:16,fontFamily:DS.sans}}>
      <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:28,
        padding:40,textAlign:'center',maxWidth:460,
        boxShadow:'0 16px 48px rgba(26,8,0,0.08)',
        animation:'bounceIn .6s cubic-bezier(.34,1.56,.64,1) both'}}>
        <div style={{position:'relative',display:'inline-flex',marginBottom:20}}>
          <div style={{width:72,height:72,borderRadius:20,background:'#16a34a',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 8px 24px rgba(22,163,74,0.3)'}}>
            <CheckCircle size={36} color="#fff"/>
          </div>
          <div style={{position:'absolute',top:-6,right:-6,width:26,height:26,borderRadius:8,
            background:DS.primary,display:'flex',alignItems:'center',justifyContent:'center',
            animation:'spin .6s ease .3s both'}}>
            <Sparkles size={13} color="#fff"/>
          </div>
        </div>
        <h2 style={{fontFamily:DS.serif,fontSize:24,color:DS.text,marginBottom:8,
          animation:'riseIn .5s ease .1s both'}}>Booking Confirmed!</h2>
        <p style={{color:DS.textMuted,fontSize:13,marginBottom:24,lineHeight:1.7,
          animation:'riseIn .5s ease .18s both'}}>
          Your consultation has been booked.<br/>Confirmation will be sent to your email.
        </p>
        <div style={{background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:18,
          padding:18,marginBottom:24,textAlign:'left',
          animation:'riseIn .5s ease .25s both'}}>
          {[
            lawyer && ['Lawyer',   lawyer.name],
            catCfg && ['Category', catCfg.label],
            selSvc && ['Service',  selSvc.name],
            form.date && ['Date & Time', `${form.date} · ${form.timeSlot}`],
            selSvc?.price && ['Fee', `₹${Number(selSvc.price).toLocaleString()}`],
          ].filter(Boolean).map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:10}}>
              <span style={{color:DS.textMuted}}>{k}</span>
              <span style={{color:DS.text,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,animation:'riseIn .5s ease .35s both'}}>
          <button onClick={()=>navigate('/lawyers')}
            style={{flex:1,padding:'10px',background:'transparent',
              border:`1px solid ${DS.border}`,color:DS.textSub,borderRadius:14,
              fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=DS.primaryBorder}
            onMouseLeave={e=>e.currentTarget.style.borderColor=DS.border}>
            Directory
          </button>
          <button onClick={()=>navigate('/')}
            style={{flex:1,padding:'10px',background:DS.primary,color:'#fff',border:'none',
              borderRadius:14,fontSize:13,fontWeight:700,cursor:'pointer',
              boxShadow:`0 4px 14px rgba(200,75,0,0.22)`,transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#A83A00';e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=DS.primary;e.currentTarget.style.transform='translateY(0)';}}>
            Go Home
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounceIn { 0%{opacity:0;transform:scale(.8)} 60%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes riseIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { from{transform:rotate(-90deg);opacity:0} to{transform:rotate(0);opacity:1} }
      `}</style>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:DS.sans,paddingBottom:32}}>
      <style>{`
        @keyframes sp        { to { transform:rotate(360deg) } }
        @keyframes riseIn    { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn   { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes selectPop { 0%{transform:scale(1)} 40%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes slotPop   { 0%{transform:scale(1)} 35%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes bounceIn  { 0%{opacity:0;transform:scale(.8)} 60%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        .bc-btn:hover  { opacity:.87; transform:translateY(-2px)!important; box-shadow:0 10px 28px rgba(200,75,0,0.3)!important; }
        .bc-opt:hover  { border-color:${DS.primaryBorder}!important; transform:translateY(-2px); }
        .bc-svc:hover  { border-color:${DS.primaryBorder}!important; transform:translateY(-2px); }
        .bc-slot:hover { border-color:${DS.primaryBorder}!important; color:${DS.primary}!important; transform:translateY(-1px); }
        .bc-inp:focus  { border-color:${DS.primary}!important; box-shadow:0 0 0 3px ${DS.primaryLight}!important; background:#fff!important; }
      `}</style>

      {/* Hero */}
      <div style={{background:DS.card,borderBottom:`1px solid ${DS.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:240,height:240,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 70%)',animation:'float 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:-40,left:-40,width:180,height:180,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(212,168,83,0.04) 0%,transparent 70%)',animation:'float 10s ease-in-out infinite reverse'}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(200,75,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,75,0,0.025) 1px,transparent 1px)',
          backgroundSize:'56px 56px'}}/>
        <div style={{maxWidth:768,margin:'0 auto',padding:'32px 20px 88px',position:'relative'}}>
          <button onClick={()=>navigate(-1)}
            style={{display:'inline-flex',alignItems:'center',gap:6,color:DS.textMuted,fontSize:13,fontWeight:600,
              background:'none',border:'none',cursor:'pointer',marginBottom:20,
              opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(10px)',
              transition:'opacity .4s ease, transform .4s ease'}}
            onMouseEnter={e=>e.currentTarget.style.color=DS.primary}
            onMouseLeave={e=>e.currentTarget.style.color=DS.textMuted}>
            <ArrowLeft size={14}/> Back
          </button>
          <div style={{textAlign:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:DS.primaryLight,
              border:`1px solid ${DS.primaryBorder}`,borderRadius:999,padding:'5px 14px',marginBottom:14,
              opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(12px)',
              transition:'opacity .5s ease .08s, transform .5s ease .08s'}}>
              <Sparkles size={12} color={DS.primary}/>
              <span style={{color:DS.primary,fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>Legal Consultation</span>
            </div>
            <h1 style={{fontFamily:DS.serif,fontSize:'clamp(1.6rem,4vw,2.4rem)',color:DS.text,fontWeight:700,marginBottom:8,
              opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(14px)',
              transition:'opacity .5s ease .16s, transform .5s ease .16s'}}>
              Book a Consultation
            </h1>
            <p style={{color:DS.textMuted,fontSize:13,opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(10px)',
              transition:'opacity .5s ease .22s, transform .5s ease .22s'}}>
              Expert legal advice for your property matters
            </p>
          </div>
        </div>
      </div>

      <div style={{maxWidth:768,margin:'0 auto',padding:'0 20px'}}>

        {/* Stepper */}
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:20,padding:'20px 24px',
          marginTop:-44,marginBottom:20,boxShadow:'0 8px 28px rgba(26,8,0,0.07)',
          opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(18px)',
          transition:'opacity .55s ease .3s, transform .55s ease .3s'}}>
          <div style={{display:'flex',alignItems:'center'}}>
            {stepLabels.map((label,i)=>{
              const s=i+1; const active=step===s; const isDone=step>s;
              return (
                <React.Fragment key={s}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{width:36,height:36,borderRadius:14,display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:13,fontWeight:700,transition:'all .3s',
                      background:isDone?'#16a34a':active?DS.primary:DS.bg,
                      color:isDone||active?'#fff':DS.textMuted,
                      boxShadow:active?`0 4px 14px rgba(200,75,0,0.28)`:isDone?'0 4px 10px rgba(22,163,74,0.2)':'none'}}>
                      {isDone?<CheckCircle size={16}/>:s}
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:active?DS.primary:isDone?'#16a34a':DS.textMuted}}>{label}</span>
                  </div>
                  {s<4&&(
                    <div style={{flex:1,height:2,margin:'0 6px',borderRadius:2,marginBottom:20,
                      transition:'background .4s ease',background:step>s?DS.primary:DS.border}}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main card */}
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:24,
          boxShadow:'0 4px 20px rgba(26,8,0,0.06)',overflow:'hidden',
          opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(16px)',
          transition:'opacity .55s ease .4s, transform .55s ease .4s'}}>

          <div key={step} style={{padding:'24px 28px',animation:'slideIn .32s ease both'}}>

            {/* STEP 1: Lawyer */}
            {step===1&&(
              <div>
                <h2 style={{fontFamily:DS.serif,fontSize:17,color:DS.text,fontWeight:700,marginBottom:4,animation:'riseIn .4s ease both'}}>Our Legal Expert</h2>
                <p style={{color:DS.textMuted,fontSize:12,marginBottom:20,animation:'riseIn .4s ease .06s both'}}>Your consultation will be with</p>
                {!lawyer
                  ? <div style={{textAlign:'center',padding:'40px 0',animation:'fadeIn .5s ease both'}}>
                      <AlertCircle size={28} color={DS.textMuted} style={{margin:'0 auto 10px'}}/>
                      <p style={{color:DS.textMuted,fontSize:13}}>{error||'Lawyer profile not loaded.'}</p>
                    </div>
                  : <div style={{border:`2px solid ${DS.primaryBorder}`,background:DS.primaryLight,borderRadius:20,padding:20,animation:'riseIn .45s ease .1s both'}}>
                      <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                        <div style={{position:'relative',flexShrink:0}}>
                          {lawyer.profileImage
                            ? <img src={lawyer.profileImage} alt={lawyer.name} style={{width:64,height:64,borderRadius:16,objectFit:'cover',border:`2px solid ${DS.border}`}}/>
                            : <div style={{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${DS.primary},#7A2C00)`,
                                display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,fontFamily:DS.serif,fontWeight:700}}>
                                {lawyer.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                              </div>}
                          <div style={{position:'absolute',bottom:-4,right:-4,background:'#16a34a',borderRadius:'50%',padding:4,border:`2px solid ${DS.card}`}}>
                            <CheckCircle size={10} color="#fff"/>
                          </div>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <h3 style={{color:DS.text,fontWeight:700,fontSize:15,fontFamily:DS.serif}}>{lawyer.name}</h3>
                          <p style={{color:DS.primary,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                            <Scale size={12}/>{lawyer.specialization||'Property Legal Professional'}
                          </p>
                          {lawyer.experience&&<p style={{color:DS.textMuted,fontSize:12,marginTop:3}}>{lawyer.experience} years experience</p>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                          {lawyer.phone&&(
                            <div style={{display:'flex',alignItems:'center',gap:6,color:DS.textSub,fontSize:12,background:DS.card,border:`1px solid ${DS.border}`,padding:'4px 10px',borderRadius:8}}>
                              <Phone size={11}/>{lawyer.phone}
                            </div>
                          )}
                          <div style={{display:'inline-flex',alignItems:'center',gap:4,color:'#16a34a',fontSize:11,fontWeight:700,background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'3px 10px',borderRadius:8}}>
                            <BadgeCheck size={11}/> Verified
                          </div>
                        </div>
                      </div>
                    </div>
                }
              </div>
            )}

            {/* STEP 2: Category */}
            {step===2&&(
              <div>
                <h2 style={{fontFamily:DS.serif,fontSize:17,color:DS.text,fontWeight:700,marginBottom:4,animation:'riseIn .4s ease both'}}>Select Category</h2>
                <p style={{color:DS.textMuted,fontSize:12,marginBottom:20,animation:'riseIn .4s ease .06s both'}}>What type of legal help do you need?</p>
                {categories.length===0
                  ? <div style={{textAlign:'center',padding:'40px 0',animation:'fadeIn .5s ease both'}}>
                      <AlertCircle size={28} color={DS.textMuted} style={{margin:'0 auto 10px'}}/>
                      <p style={{color:DS.textMuted,fontSize:13}}>No services available yet.</p>
                    </div>
                  : <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {categories.map((cat,i)=>{
                        const sel=selCat===cat.id; const I=cat.icon;
                        return (
                          <div key={cat.id} className="bc-opt" onClick={()=>{ setSelCat(cat.id); setSelSvc(null); }}
                            style={{cursor:'pointer',borderRadius:20,padding:20,transition:'all .25s',
                              border:`2px solid ${sel?DS.primary:DS.border}`,background:sel?DS.primaryLight:DS.card,
                              animation:`riseIn .4s ease ${i*.09}s both`,boxShadow:sel?`0 6px 20px rgba(200,75,0,0.12)`:'none'}}>
                            <div style={{display:'flex',alignItems:'center',gap:16}}>
                              <div style={{width:52,height:52,borderRadius:16,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .25s',background:sel?DS.primary:DS.bg}}>
                                <I size={24} color={sel?'#fff':DS.textMuted}/>
                              </div>
                              <div style={{flex:1}}>
                                <h3 style={{fontWeight:700,fontSize:15,color:DS.text,marginBottom:4}}>{cat.label}</h3>
                                <p style={{color:DS.textMuted,fontSize:12,lineHeight:1.6}}>{cat.description}</p>
                                <p style={{color:DS.primary,fontSize:12,fontWeight:700,marginTop:6}}>{cat.services.length} services available</p>
                              </div>
                              {sel&&(
                                <div style={{width:28,height:28,borderRadius:'50%',background:DS.primary,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,animation:'bounceIn .35s ease both'}}>
                                  <CheckCircle size={15} color="#fff"/>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                }
              </div>
            )}

            {/* STEP 3: Service */}
            {step===3&&(
              <div>
                <div style={{marginBottom:20}}>
                  {catCfg&&(
                    <span style={{display:'inline-block',background:DS.primaryLight,color:DS.primary,fontSize:11,padding:'3px 12px',borderRadius:999,border:`1px solid ${DS.primaryBorder}`,fontWeight:600,marginBottom:8,animation:'riseIn .4s ease both'}}>
                      {catCfg.label}
                    </span>
                  )}
                  <h2 style={{fontFamily:DS.serif,fontSize:17,color:DS.text,fontWeight:700,marginBottom:4,animation:'riseIn .4s ease .05s both'}}>Select Service</h2>
                  <p style={{color:DS.textMuted,fontSize:12,animation:'riseIn .4s ease .1s both'}}>Choose the service you need</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12,maxHeight:400,overflowY:'auto',paddingRight:4}}>
                  {catSvcs.map((svc,idx)=>{
                    const sel=selSvc?.id===svc.id;
                    return (
                      <div key={svc.id} className="bc-svc" onClick={()=>setSelSvc(svc)}
                        style={{cursor:'pointer',borderRadius:18,padding:16,transition:'all .25s',
                          border:`2px solid ${sel?DS.primary:DS.border}`,background:sel?DS.primaryLight:DS.card,
                          boxShadow:sel?`0 6px 18px rgba(200,75,0,0.12)`:'none',animation:`riseIn .4s ease ${idx*.06}s both`}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                          <div style={{width:28,height:28,borderRadius:10,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,transition:'all .2s',background:sel?DS.primary:DS.bg,color:sel?'#fff':DS.textMuted}}>
                            {String(idx+1).padStart(2,'0')}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <h3 style={{fontWeight:700,fontSize:13,color:DS.text,lineHeight:1.3}}>{svc.name}</h3>
                            {svc.description&&(
                              <p style={{color:DS.textMuted,fontSize:12,marginTop:3,lineHeight:1.55,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                                {svc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{color:'#16a34a',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',gap:2}}>
                            <IndianRupee size={12}/>{Number(svc.price).toLocaleString()}
                          </span>
                          {sel&&(
                            <div style={{width:22,height:22,borderRadius:'50%',background:DS.primary,display:'flex',alignItems:'center',justifyContent:'center',animation:'bounceIn .35s ease both'}}>
                              <CheckCircle size={12} color="#fff"/>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Schedule + Details */}
            {step===4&&(
              <div>
                {selSvc&&(
                  <div style={{background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,borderRadius:16,padding:'12px 16px',marginBottom:24,display:'flex',alignItems:'center',gap:12,animation:'riseIn .4s ease both'}}>
                    <div style={{width:34,height:34,borderRadius:12,background:DS.primary,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <FileText size={15} color="#fff"/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:DS.text,fontWeight:700,fontSize:13}}>{selSvc.name}</p>
                      <p style={{color:'#16a34a',fontWeight:700,fontSize:12}}>₹{Number(selSvc.price).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <h3 style={{fontFamily:DS.serif,fontSize:15,color:DS.text,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8,animation:'riseIn .4s ease .06s both'}}>
                  <Calendar size={15} color={DS.primary}/>Select Date & Time
                </h3>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                  {getDates().map((d,di)=>(
                    <div key={d.date} style={{background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px',animation:`riseIn .4s ease ${.08+di*.07}s both`}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                        <div style={{width:28,height:28,borderRadius:10,background:DS.primaryLight,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Calendar size={12} color={DS.primary}/>
                        </div>
                        <span style={{color:DS.textSub,fontWeight:600,fontSize:13}}>{d.label}</span>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                        {d.slots.map(slot=>{
                          const sel=form.date===d.date&&form.timeSlot===slot;
                          return (
                            <button key={slot} className={sel?'':'bc-slot'}
                              onClick={()=>{ setForm({...form,date:d.date,timeSlot:slot}); setSlotPick(`${d.date}-${slot}`); setTimeout(()=>setSlotPick(null),400); }}
                              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:10,fontSize:12,fontWeight:700,cursor:'pointer',border:'1px solid',transition:'all .2s',
                                background:sel?DS.primary:DS.card,color:sel?'#fff':DS.textSub,borderColor:sel?DS.primary:DS.border,
                                boxShadow:sel?`0 3px 10px rgba(200,75,0,0.22)`:'none',
                                animation:slotPick===`${d.date}-${slot}`?'slotPop .35s ease both':'none'}}>
                              <Clock size={11}/>{slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{fontFamily:DS.serif,fontSize:15,color:DS.text,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8,animation:'riseIn .4s ease .45s both'}}>
                  <FileText size={15} color={DS.primary}/>Your Details
                </h3>
                <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
                  <div style={{animation:'riseIn .4s ease .48s both'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Full Name *</label>
                    <input className="bc-inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" style={inp} onFocus={inpFocus} onBlur={inpBlur}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,animation:'riseIn .4s ease .54s both'}}>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Email *</label>
                      <input type="email" className="bc-inp" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com" style={inp} onFocus={inpFocus} onBlur={inpBlur}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Phone *</label>
                      <input type="tel" className="bc-inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210" style={inp} onFocus={inpFocus} onBlur={inpBlur}/>
                    </div>
                  </div>
                  <div style={{animation:'riseIn .4s ease .6s both'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Property Type</label>
                    <select value={form.propertyType} onChange={e=>setForm({...form,propertyType:e.target.value})} style={inp} onFocus={inpFocus} onBlur={inpBlur}>
                      <option value="">Select property type</option>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Land</option>
                      <option>Agricultural</option>
                    </select>
                  </div>
                  <div style={{animation:'riseIn .4s ease .66s both'}}>
                    <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Description</label>
                    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Describe your legal requirement…" style={{...inp,resize:'none'}} onFocus={inpFocus} onBlur={inpBlur}/>
                  </div>
                </div>

                <div style={{background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:18,padding:'16px 18px',marginBottom:16,animation:'riseIn .4s ease .72s both'}}>
                  <p style={{fontSize:10,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Booking Summary</p>
                  {[
                    lawyer&&['Lawyer',lawyer.name],
                    catCfg&&['Category',catCfg.label],
                    selSvc&&['Service',selSvc.name],
                    form.date&&['Date & Time',`${form.date} · ${form.timeSlot}`],
                    selSvc?.price&&['Fee',`₹${Number(selSvc.price).toLocaleString()}`],
                  ].filter(Boolean).map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${DS.border}`}}>
                      <span style={{color:DS.textMuted}}>{k}</span>
                      <span style={{color:DS.text,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>

                {submitErr&&(
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'#FEF2F2',border:'1px solid rgba(220,38,38,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:14,color:'#dc2626',fontSize:12,animation:'riseIn .35s ease both'}}>
                    <AlertCircle size={13}/>{submitErr}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div style={{display:'flex',justifyContent:'space-between',padding:'16px 28px',borderTop:`1px solid ${DS.border}`,background:DS.bg}}>
            {step>1
              ? <button onClick={()=>goStep(step-1)}
                  style={{display:'inline-flex',alignItems:'center',gap:6,background:DS.card,border:`1px solid ${DS.border}`,color:DS.textSub,borderRadius:14,padding:'10px 18px',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primaryBorder;e.currentTarget.style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.transform='translateY(0)';}}>
                  <ArrowLeft size={13}/> Back
                </button>
              : <div/>
            }
            {step<4
              ? <button className="bc-btn" onClick={()=>goStep(step+1)} disabled={!canProceed()}
                  style={{display:'inline-flex',alignItems:'center',gap:7,background:DS.primary,color:'#fff',border:'none',borderRadius:14,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:canProceed()?'pointer':'not-allowed',transition:'all .2s',boxShadow:`0 4px 14px rgba(200,75,0,0.22)`,opacity:canProceed()?1:.4}}>
                  Continue <ArrowUpRight size={13}/>
                </button>
              : <button className="bc-btn" onClick={handleSubmit}
                  disabled={submitting||!form.name||!form.email||!form.phone||!form.date}
                  style={{display:'inline-flex',alignItems:'center',gap:7,background:'#16a34a',color:'#fff',border:'none',borderRadius:14,padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .2s',boxShadow:'0 4px 14px rgba(22,163,74,0.25)',opacity:submitting||!form.name||!form.email||!form.phone||!form.date?0.4:1}}>
                  {submitting
                    ? <><div style={{width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'sp .8s linear infinite'}}/> Confirming…</>
                    : <><CheckCircle size={14}/> Confirm Booking</>
                  }
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
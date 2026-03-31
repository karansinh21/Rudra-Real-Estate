import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lawyerPublicAPI } from '../../services/api';
import {
  Scale, Award, BookOpen, Star, Phone, Mail, MapPin, Calendar, Clock,
  CheckCircle, TrendingUp, Users, FileText, MessageCircle, Shield,
  ArrowLeft, AlertCircle, IndianRupee, RefreshCw, Sparkles, BadgeCheck
} from 'lucide-react';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  serif:'Georgia, serif', sans:"'DM Sans', sans-serif",
};

const StarRow = ({ rating }) => (
  <div style={{display:'flex',gap:2}}>
    {[1,2,3,4,5].map(s=>(
      <Star key={s} size={13} color={s<=rating?DS.primary:'#EDE8E3'} fill={s<=rating?DS.primary:'#EDE8E3'}/>
    ))}
  </div>
);

export default function LawyerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer,  setLawyer]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('about');
  const [visible, setVisible] = useState(false);   // entrance trigger
  const [barVis,  setBarVis]  = useState(false);   // sticky bar delayed

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => {
    if (!loading && lawyer) {
      setTimeout(() => setVisible(true), 60);
      setTimeout(() => setBarVis(true), 700);
    }
  }, [loading, lawyer]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = id ? await lawyerPublicAPI.getProfileById(id) : await lawyerPublicAPI.getProfile();
      const data = res.data?.lawyer || res.data;
      if (!data) throw new Error('No data');
      setLawyer(data);
    } catch { setError('Could not load lawyer profile.'); }
    finally { setLoading(false); }
  };

  const book = (svc) => {
    if (!localStorage.getItem('token')) { navigate('/auth'); return; }
    navigate('/book-consultation', { state: { lawyerId: lawyer?.id, service: svc } });
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:DS.sans}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid ${DS.border}`,
          borderTopColor:DS.primary,animation:'sp .8s linear infinite',margin:'0 auto 12px'}}/>
        <p style={{color:DS.textMuted,fontSize:13}}>Loading profile…</p>
      </div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Error ── */
  if (error||!lawyer) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',
      justifyContent:'center',padding:16,fontFamily:DS.sans}}>
      <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:24,
        padding:40,textAlign:'center',maxWidth:380,animation:'riseIn .5s ease both'}}>
        <div style={{width:52,height:52,borderRadius:16,background:DS.primaryLight,
          display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <AlertCircle size={22} color={DS.primary}/>
        </div>
        <h2 style={{fontFamily:DS.serif,fontSize:20,color:DS.text,marginBottom:8}}>Profile Not Found</h2>
        <p style={{color:DS.textMuted,fontSize:13,marginBottom:20}}>{error}</p>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <button onClick={fetchData} style={{display:'inline-flex',alignItems:'center',gap:6,
            background:DS.primary,color:'#fff',border:'none',borderRadius:12,
            padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            <RefreshCw size={13}/> Retry
          </button>
          <button onClick={()=>navigate('/lawyers')} style={{background:'transparent',
            border:`1px solid ${DS.border}`,color:DS.textSub,borderRadius:12,
            padding:'9px 18px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Back</button>
        </div>
      </div>
      <style>{`@keyframes riseIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  const services       = lawyer.services       || [];
  const reviews        = lawyer.reviews        || [];
  const education      = lawyer.education      || [];
  const certifications = lawyer.certifications || [];
  const availability   = lawyer.availability   || {};

  const tabs = [
    { id:'about',        label:'About',        icon:Scale    },
    { id:'services',     label:'Services',     icon:FileText },
    { id:'education',    label:'Education',    icon:BookOpen },
    { id:'reviews',      label:'Reviews',      icon:Star     },
    { id:'availability', label:'Availability', icon:Clock    },
  ];

  const statItems = [
    { icon:TrendingUp,  val:lawyer.experience   ?`${lawyer.experience}`   :'—', label:'Years Exp.'   },
    { icon:Users,       val:lawyer.casesHandled ?`${lawyer.casesHandled}+`:`${services.length}`, label:'Cases' },
    { icon:CheckCircle, val:lawyer.successRate  ?`${lawyer.successRate}%` :'—', label:'Success Rate' },
    { icon:Star,        val:lawyer.rating||'—',  label:`${lawyer.totalReviews||reviews.length} Reviews` },
  ];

  return (
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:DS.sans,paddingBottom:100}}>
      <style>{`
        @keyframes sp      { to { transform:rotate(360deg) } }
        @keyframes riseIn  { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes barUp   { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }

        .lp-tab:hover  { background:${DS.primaryLight}!important; color:${DS.primary}!important; }
        .lp-btn:hover  { opacity:.87; transform:translateY(-2px)!important;
                         box-shadow:0 10px 28px rgba(200,75,0,0.32)!important; }
        .lp-svc:hover  { border-color:${DS.primaryBorder}!important;
                         box-shadow:0 6px 20px rgba(200,75,0,0.10)!important; transform:translateY(-3px); }
        .lp-stat:hover { border-color:${DS.primaryBorder}!important; transform:translateY(-2px);
                         box-shadow:0 4px 14px rgba(200,75,0,0.08)!important; }
        .lp-info:hover { border-color:${DS.primaryBorder}!important; transform:translateY(-1px); }
        .lp-cert:hover { border-color:${DS.primaryBorder}!important; transform:translateY(-1px); }
        .lp-pill:hover { background:${DS.bg}!important; border-color:${DS.primaryBorder}!important; }
        .lp-call:hover { border-color:${DS.primaryBorder}!important; color:${DS.primary}!important; }
      `}</style>

      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div style={{background:DS.card,borderBottom:`1px solid ${DS.border}`,
        position:'relative',overflow:'hidden'}}>

        {/* Floating blobs */}
        <div style={{position:'absolute',top:-80,right:-80,width:320,height:320,
          borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(200,75,0,0.07) 0%,transparent 70%)',
          animation:'float 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:-60,left:-60,width:240,height:240,
          borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(212,168,83,0.05) 0%,transparent 70%)',
          animation:'float 11s ease-in-out infinite reverse'}}/>
        {/* Gold grid */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(200,75,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,75,0,0.025) 1px,transparent 1px)',
          backgroundSize:'56px 56px'}}/>

        <div style={{maxWidth:960,margin:'0 auto',padding:'28px 20px 80px',position:'relative'}}>
          {/* Back */}
          <button onClick={()=>navigate('/lawyers')}
            style={{display:'inline-flex',alignItems:'center',gap:6,color:DS.textMuted,
              fontSize:13,fontWeight:600,background:'none',border:'none',cursor:'pointer',
              marginBottom:24,transition:'color .2s',
              opacity:visible?1:0,
              transform:visible?'translateY(0)':'translateY(10px)',
              transition:'opacity .4s ease, transform .4s ease'}}
            onMouseEnter={e=>e.currentTarget.style.color=DS.primary}
            onMouseLeave={e=>e.currentTarget.style.color=DS.textMuted}>
            <ArrowLeft size={14}/> Back to Directory
          </button>

          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:8,
            background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,
            borderRadius:999,padding:'5px 14px',
            opacity:visible?1:0,
            transform:visible?'translateY(0)':'translateY(12px)',
            transition:'opacity .5s ease .1s, transform .5s ease .1s'}}>
            <Sparkles size={12} color={DS.primary}/>
            <span style={{color:DS.primary,fontSize:11,fontWeight:700,
              letterSpacing:'0.08em',textTransform:'uppercase'}}>
              Verified Legal Professional
            </span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'0 20px'}}>

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <div style={{background:DS.card,borderRadius:24,border:`1px solid ${DS.border}`,
          boxShadow:'0 8px 32px rgba(26,8,0,0.07)',marginTop:-48,marginBottom:20,
          overflow:'hidden',
          opacity:visible?1:0,
          transform:visible?'translateY(0)':'translateY(28px)',
          transition:'opacity .55s ease .15s, transform .55s ease .15s'}}>
          <div style={{padding:'28px 28px 24px'}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:24}}>

              {/* Avatar */}
              <div style={{position:'relative',flexShrink:0,alignSelf:'flex-start',
                animation:'riseIn .5s ease .22s both'}}>
                {lawyer.profileImage
                  ? <img src={lawyer.profileImage} alt={lawyer.name}
                      style={{width:100,height:100,borderRadius:20,objectFit:'cover',
                        border:`3px solid ${DS.border}`,
                        boxShadow:'0 6px 20px rgba(26,8,0,0.12)'}}/>
                  : <div style={{width:100,height:100,borderRadius:20,
                      background:`linear-gradient(135deg,${DS.primary},#7A2C00)`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      color:'#fff',fontSize:26,fontFamily:DS.serif,fontWeight:700,
                      boxShadow:`0 8px 24px rgba(200,75,0,0.28)`}}>
                      {lawyer.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>}
                <div style={{position:'absolute',bottom:-6,right:-6,
                  display:'flex',alignItems:'center',gap:3,
                  background:'#16a34a',color:'#fff',padding:'3px 8px',borderRadius:999,
                  fontSize:10,fontWeight:700,border:`2px solid ${DS.card}`}}>
                  <BadgeCheck size={11}/> Verified
                </div>
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',
                  alignItems:'flex-start',gap:14,marginBottom:16}}>

                  <div style={{animation:'riseIn .5s ease .28s both'}}>
                    <h1 style={{fontFamily:DS.serif,fontSize:28,color:DS.text,
                      fontWeight:700,marginBottom:4,lineHeight:1.2}}>{lawyer.name}</h1>
                    <p style={{color:DS.primary,fontSize:13,fontWeight:600,
                      display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                      <Scale size={13}/>{lawyer.specialization||'Legal Professional'}
                    </p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {services.slice(0,3).map((s,i)=>(
                        <span key={i} className="lp-pill"
                          style={{background:DS.primaryLight,color:DS.primary,fontSize:11,
                            padding:'4px 12px',borderRadius:999,
                            border:`1px solid ${DS.primaryBorder}`,fontWeight:600,
                            transition:'all .2s',
                            animation:`riseIn .4s ease ${.36+i*.07}s both`}}>
                          {s.serviceName}
                        </span>
                      ))}
                      {services.length>3&&(
                        <span style={{background:DS.bg,color:DS.textMuted,fontSize:11,
                          padding:'4px 12px',borderRadius:999,
                          border:`1px solid ${DS.border}`,fontWeight:600}}>
                          +{services.length-3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{display:'flex',gap:8,flexShrink:0,
                    animation:'riseIn .5s ease .32s both'}}>
                    <button className="lp-btn" onClick={()=>book(null)}
                      style={{display:'inline-flex',alignItems:'center',gap:8,
                        background:DS.primary,color:'#fff',border:'none',borderRadius:14,
                        padding:'10px 18px',fontSize:13,fontWeight:700,cursor:'pointer',
                        transition:'all .2s',
                        boxShadow:`0 4px 16px rgba(200,75,0,0.22)`}}>
                      <Calendar size={13}/> Book Consultation
                    </button>
                    {lawyer.phone&&(
                      <a href={`tel:${lawyer.phone}`}
                        style={{width:40,height:40,display:'flex',alignItems:'center',
                          justifyContent:'center',background:DS.bg,
                          border:`1px solid ${DS.border}`,borderRadius:12,
                          textDecoration:'none',color:DS.textSub,transition:'all .2s'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primaryBorder;e.currentTarget.style.color=DS.primary;e.currentTarget.style.transform='translateY(-1px)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.textSub;e.currentTarget.style.transform='translateY(0)';}}>
                        <MessageCircle size={16}/>
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats — staggered */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                  {statItems.map(({icon:I,val,label},i)=>(
                    <div key={label} className="lp-stat"
                      style={{textAlign:'center',padding:'12px 8px',background:DS.bg,
                        borderRadius:16,border:`1px solid ${DS.border}`,transition:'all .2s',
                        animation:`riseIn .45s ease ${.34+i*.08}s both`}}>
                      <I size={16} color={DS.primary} style={{margin:'0 auto 4px'}}/>
                      <div style={{fontSize:18,fontWeight:700,color:DS.text,fontFamily:DS.serif}}>{val}</div>
                      <div style={{fontSize:11,color:DS.textMuted,fontWeight:500,marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Card ─────────────────────────────────────────────────── */}
        <div style={{background:DS.card,borderRadius:24,border:`1px solid ${DS.border}`,
          boxShadow:'0 4px 20px rgba(26,8,0,0.05)',overflow:'hidden',
          opacity:visible?1:0,
          transform:visible?'translateY(0)':'translateY(24px)',
          transition:'opacity .55s ease .3s, transform .55s ease .3s'}}>

          {/* Tab bar */}
          <div style={{borderBottom:`1px solid ${DS.border}`,display:'flex',gap:4,
            padding:'10px 16px 0',overflowX:'auto',scrollbarWidth:'none'}}>
            {tabs.map(({id,label,icon:I})=>(
              <button key={id} className={tab===id?'':'lp-tab'} onClick={()=>setTab(id)}
                style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 16px',
                  fontSize:12,fontWeight:700,borderRadius:'12px 12px 0 0',border:'none',
                  cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s',
                  background:tab===id?DS.primary:'transparent',
                  color:tab===id?'#fff':DS.textSub}}>
                <I size={13}/>{label}
              </button>
            ))}
          </div>

          {/* Tab content — key re-triggers animation on switch */}
          <div key={tab} style={{padding:'24px 28px',animation:'slideIn .3s ease both'}}>

            {/* ── ABOUT ── */}
            {tab==='about'&&(
              <div>
                <div style={{background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,
                  borderRadius:20,padding:20,marginBottom:24,
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  flexWrap:'wrap',gap:12,animation:'riseIn .4s ease both'}}>
                  <div>
                    <p style={{color:DS.text,fontWeight:700,fontSize:14,marginBottom:3}}>
                      Ready to get legal help?
                    </p>
                    <p style={{color:DS.textMuted,fontSize:12}}>Book a consultation with {lawyer.name}</p>
                  </div>
                  <button className="lp-btn" onClick={()=>book(null)}
                    style={{display:'inline-flex',alignItems:'center',gap:8,
                      background:DS.primary,color:'#fff',border:'none',borderRadius:13,
                      padding:'10px 18px',fontSize:13,fontWeight:700,cursor:'pointer',
                      transition:'all .2s',boxShadow:`0 4px 14px rgba(200,75,0,0.22)`}}>
                    <Calendar size={13}/> Book Consultation
                  </button>
                </div>

                <div style={{marginBottom:20,animation:'riseIn .4s ease .08s both'}}>
                  <h3 style={{fontFamily:DS.serif,fontSize:15,color:DS.text,fontWeight:700,marginBottom:10}}>About</h3>
                  <p style={{color:DS.textSub,fontSize:13,lineHeight:1.75}}>
                    {lawyer.about||(lawyer.specialization?`Specializing in ${lawyer.specialization}.`:'No details provided yet.')}
                  </p>
                </div>

                <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:20}}>
                  {[
                    lawyer.barCouncilId && { icon:Shield,    label:'Bar Council ID', val:lawyer.barCouncilId, delay:.14 },
                    lawyer.experience   && { icon:TrendingUp, label:'Experience',     val:`${lawyer.experience} years`, delay:.2 },
                  ].filter(Boolean).map(({icon:I,label,val,delay})=>(
                    <div key={label} className="lp-info"
                      style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',
                        background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:16,
                        transition:'all .2s',animation:`riseIn .4s ease ${delay}s both`}}>
                      <I size={15} color={DS.primary}/>
                      <div>
                        <p style={{fontSize:10,color:DS.textMuted,fontWeight:700,
                          textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</p>
                        <p style={{fontSize:13,color:DS.text,fontWeight:700}}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                  {[
                    lawyer.phone && { icon:Phone,  label:'Phone',    val:lawyer.phone,  delay:.26 },
                    lawyer.email && { icon:Mail,   label:'Email',    val:lawyer.email,  delay:.32 },
                    lawyer.city  && { icon:MapPin, label:'Location', val:[lawyer.city,lawyer.state].filter(Boolean).join(', '), delay:.38 },
                  ].filter(Boolean).map(({icon:I,label,val,delay})=>(
                    <div key={label} className="lp-info"
                      style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
                        background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:16,
                        transition:'all .2s',animation:`riseIn .4s ease ${delay}s both`}}>
                      <div style={{width:36,height:36,borderRadius:12,background:DS.primaryLight,
                        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <I size={15} color={DS.primary}/>
                      </div>
                      <div>
                        <p style={{fontSize:10,color:DS.textMuted,fontWeight:700,textTransform:'uppercase'}}>{label}</p>
                        <p style={{fontSize:13,color:DS.text,fontWeight:700,wordBreak:'break-all'}}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SERVICES ── */}
            {tab==='services'&&(
              <div>
                <h3 style={{fontFamily:DS.serif,fontSize:16,color:DS.text,fontWeight:700,
                  marginBottom:20,animation:'riseIn .4s ease both'}}>Legal Services</h3>
                {services.length===0
                  ? <div style={{textAlign:'center',padding:'60px 0',animation:'fadeIn .5s ease both'}}>
                      <FileText size={32} color={DS.border} style={{margin:'0 auto 10px'}}/>
                      <p style={{color:DS.textMuted,fontSize:13}}>No services listed yet.</p>
                    </div>
                  : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
                      {services.map((s,i)=>(
                        <div key={s.id||i} className="lp-svc"
                          style={{border:`2px solid ${DS.border}`,borderRadius:20,padding:18,
                            transition:'all .25s',cursor:'default',
                            animation:`riseIn .45s ease ${i*.07}s both`}}>
                          <div style={{display:'flex',justifyContent:'space-between',
                            alignItems:'flex-start',marginBottom:10}}>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{width:38,height:38,borderRadius:14,
                                background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,
                                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                <FileText size={15} color={DS.primary}/>
                              </div>
                              <div>
                                <h4 style={{fontWeight:700,color:DS.text,fontSize:13}}>{s.serviceName}</h4>
                                {s.duration&&<p style={{color:DS.textMuted,fontSize:11,
                                  display:'flex',alignItems:'center',gap:3,marginTop:2}}>
                                  <Clock size={11}/>{s.duration} days
                                </p>}
                              </div>
                            </div>
                            {s.price&&<span style={{color:'#16a34a',fontWeight:700,fontSize:13,
                              display:'flex',alignItems:'center',gap:1,flexShrink:0}}>
                              <IndianRupee size={12}/>{Number(s.price).toLocaleString()}
                            </span>}
                          </div>
                          {s.description&&<p style={{color:DS.textMuted,fontSize:12,marginBottom:14,
                            lineHeight:1.65,display:'-webkit-box',WebkitLineClamp:2,
                            WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                            {s.description}
                          </p>}
                          <button className="lp-btn" onClick={()=>book(s)}
                            style={{width:'100%',padding:'10px',background:DS.primary,color:'#fff',
                              border:'none',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',
                              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                              transition:'all .2s',boxShadow:`0 3px 12px rgba(200,75,0,0.2)`}}>
                            <Calendar size={13}/> Book Now
                          </button>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}

            {/* ── EDUCATION ── */}
            {tab==='education'&&(
              <div>
                <h3 style={{fontFamily:DS.serif,fontSize:16,color:DS.text,fontWeight:700,
                  marginBottom:16,animation:'riseIn .4s ease both'}}>Education</h3>
                {education.length===0
                  ? <p style={{color:DS.textMuted,fontSize:13,animation:'fadeIn .5s ease both'}}>
                      No education details provided.
                    </p>
                  : <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                      {education.map((edu,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,
                          padding:'14px 16px',background:DS.bg,border:`1px solid ${DS.border}`,
                          borderRadius:16,animation:`riseIn .4s ease ${i*.08}s both`}}>
                          <div style={{width:36,height:36,borderRadius:12,background:DS.primaryLight,
                            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <BookOpen size={15} color={DS.primary}/>
                          </div>
                          <div>
                            <p style={{fontWeight:700,color:DS.text,fontSize:13}}>{edu.degree}</p>
                            <p style={{color:DS.textSub,fontSize:13}}>{edu.institution}</p>
                            <p style={{color:DS.textMuted,fontSize:11,marginTop:2}}>{edu.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                }
                {certifications.length>0&&(
                  <>
                    <h3 style={{fontFamily:DS.serif,fontSize:16,color:DS.text,fontWeight:700,
                      marginBottom:14,animation:'riseIn .4s ease .1s both'}}>Certifications</h3>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                      {certifications.map((cert,i)=>(
                        <div key={i} className="lp-cert"
                          style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',
                            background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:14,
                            transition:'all .2s',
                            animation:`riseIn .4s ease ${.15+i*.06}s both`}}>
                          <Award size={14} color={DS.primary}/>
                          <span style={{fontSize:12,fontWeight:600,color:DS.text}}>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab==='reviews'&&(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  marginBottom:20,animation:'riseIn .4s ease both'}}>
                  <h3 style={{fontFamily:DS.serif,fontSize:16,color:DS.text,fontWeight:700}}>
                    Client Reviews
                  </h3>
                  {lawyer.rating&&(
                    <div style={{display:'flex',alignItems:'center',gap:8,background:DS.primaryLight,
                      border:`1px solid ${DS.primaryBorder}`,padding:'8px 14px',borderRadius:14}}>
                      <Star size={15} color={DS.primary} fill={DS.primary}/>
                      <span style={{fontSize:20,fontWeight:700,color:DS.text,fontFamily:DS.serif}}>
                        {lawyer.rating}
                      </span>
                      <span style={{color:DS.textMuted,fontSize:13}}>/ 5</span>
                    </div>
                  )}
                </div>
                {reviews.length===0
                  ? <div style={{textAlign:'center',padding:'60px 0',animation:'fadeIn .5s ease both'}}>
                      <Star size={32} color={DS.border} style={{margin:'0 auto 10px'}}/>
                      <p style={{color:DS.textMuted,fontSize:13}}>No reviews yet.</p>
                    </div>
                  : <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {reviews.map((r,i)=>(
                        <div key={i} style={{padding:'16px 18px',background:DS.bg,
                          border:`1px solid ${DS.border}`,borderRadius:18,
                          animation:`riseIn .4s ease ${i*.08}s both`}}>
                          <div style={{display:'flex',justifyContent:'space-between',
                            alignItems:'flex-start',marginBottom:8}}>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{width:36,height:36,borderRadius:12,
                                background:DS.primaryLight,display:'flex',alignItems:'center',
                                justifyContent:'center',color:DS.primary,fontWeight:700,
                                fontSize:13,flexShrink:0}}>
                                {(r.name||r.clientName||'?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p style={{fontWeight:700,color:DS.text,fontSize:13}}>
                                  {r.name||r.clientName}
                                </p>
                                <StarRow rating={r.rating}/>
                              </div>
                            </div>
                            <span style={{fontSize:12,color:DS.textMuted}}>{r.date}</span>
                          </div>
                          <p style={{color:DS.textSub,fontSize:13,lineHeight:1.65}}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}

            {/* ── AVAILABILITY ── */}
            {tab==='availability'&&(
              <div>
                <h3 style={{fontFamily:DS.serif,fontSize:16,color:DS.text,fontWeight:700,
                  marginBottom:16,animation:'riseIn .4s ease both'}}>Office Hours</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
                  {(Object.keys(availability).length>0
                    ? Object.entries(availability)
                    : [['Monday','9:00 AM – 6:00 PM'],['Tuesday','9:00 AM – 6:00 PM'],
                       ['Wednesday','9:00 AM – 6:00 PM'],['Thursday','9:00 AM – 6:00 PM'],
                       ['Friday','9:00 AM – 6:00 PM'],['Saturday','10:00 AM – 2:00 PM'],
                       ['Sunday','Closed']]
                  ).map(([day,time],i)=>(
                    <div key={day}
                      style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                        padding:'12px 16px',background:DS.bg,border:`1px solid ${DS.border}`,
                        borderRadius:14,animation:`riseIn .4s ease ${i*.06}s both`}}>
                      <span style={{fontSize:13,fontWeight:600,color:DS.textSub}}>{day}</span>
                      <span style={{fontSize:12,fontWeight:700,padding:'3px 12px',borderRadius:999,
                        border:'1px solid',
                        background:time==='Closed'?'#FEF2F2':DS.primaryLight,
                        color:time==='Closed'?'#dc2626':DS.primary,
                        borderColor:time==='Closed'?'rgba(220,38,38,0.2)':DS.primaryBorder}}>
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,
                  borderRadius:20,padding:20,animation:'riseIn .4s ease .5s both'}}>
                  <p style={{color:DS.text,fontWeight:700,fontSize:14,marginBottom:4}}>
                    Need urgent consultation?
                  </p>
                  <p style={{color:DS.textMuted,fontSize:12,marginBottom:16}}>
                    Call directly for emergency appointments
                  </p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {lawyer.phone
                      ? <a href={`tel:${lawyer.phone}`}
                          style={{display:'inline-flex',alignItems:'center',gap:7,
                            background:DS.primary,color:'#fff',borderRadius:12,
                            padding:'9px 18px',fontSize:13,fontWeight:700,textDecoration:'none'}}>
                          <Phone size={13}/> Call Now
                        </a>
                      : <button className="lp-btn" onClick={()=>book(null)}
                          style={{display:'inline-flex',alignItems:'center',gap:7,
                            background:DS.primary,color:'#fff',border:'none',borderRadius:12,
                            padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                          <Calendar size={13}/> Book
                        </button>
                    }
                    {lawyer.email&&(
                      <a href={`mailto:${lawyer.email}`}
                        style={{display:'inline-flex',alignItems:'center',gap:7,
                          background:DS.card,border:`1px solid ${DS.border}`,color:DS.textSub,
                          borderRadius:12,padding:'9px 16px',fontSize:13,fontWeight:600,
                          textDecoration:'none'}}>
                        <Mail size={13}/> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar — slides up after delay ─────────────────── */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:50,
        background:'rgba(255,246,242,0.96)',backdropFilter:'blur(14px)',
        borderTop:`1px solid ${DS.border}`,boxShadow:'0 -4px 24px rgba(26,8,0,0.08)',
        padding:'12px 20px',
        opacity:barVis?1:0,
        transform:barVis?'translateY(0)':'translateY(40px)',
        transition:'opacity .5s ease, transform .5s ease'}}>
        <div style={{maxWidth:960,margin:'0 auto',display:'flex',alignItems:'center',
          justifyContent:'space-between',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            {lawyer.profileImage
              ? <img src={lawyer.profileImage} alt={lawyer.name}
                  style={{width:36,height:36,borderRadius:12,objectFit:'cover',
                    border:`1px solid ${DS.border}`,flexShrink:0}}/>
              : <div style={{width:36,height:36,borderRadius:12,
                  background:`linear-gradient(135deg,${DS.primary},#7A2C00)`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'#fff',fontSize:12,fontFamily:DS.serif,fontWeight:700,flexShrink:0}}>
                  {lawyer.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>}
            <div style={{minWidth:0}}>
              <p style={{color:DS.text,fontWeight:700,fontSize:13,
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{lawyer.name}</p>
              <p style={{color:DS.textMuted,fontSize:11,
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {lawyer.specialization||'Legal Professional'}
              </p>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {lawyer.phone&&(
              <a href={`tel:${lawyer.phone}`} className="lp-call"
                style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',
                  background:DS.bg,border:`1px solid ${DS.border}`,color:DS.textSub,
                  borderRadius:12,fontSize:12,fontWeight:600,textDecoration:'none',transition:'all .2s'}}>
                <Phone size={13}/> Call
              </a>
            )}
            <button className="lp-btn" onClick={()=>book(null)}
              style={{display:'inline-flex',alignItems:'center',gap:7,background:DS.primary,
                color:'#fff',border:'none',borderRadius:13,padding:'10px 18px',
                fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .2s',
                boxShadow:`0 4px 14px rgba(200,75,0,0.22)`}}>
              <Calendar size={13}/> Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
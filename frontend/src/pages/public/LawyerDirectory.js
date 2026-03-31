import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lawyerPublicAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';
import {
  Search, Star, MapPin, Phone, Mail, Award, Briefcase,
  CheckCircle, Calendar, Scale, AlertCircle, RefreshCw, ArrowUpRight, Sparkles
} from 'lucide-react';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  serif:'Georgia, serif', sans:"'DM Sans', sans-serif",
};

export default function LawyerDirectory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lawyer,  setLawyer]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (!loading && lawyer) setTimeout(() => setVisible(true), 60); }, [loading, lawyer]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = await lawyerPublicAPI.getProfile();
      const data = res.data?.lawyer || res.data;
      if (!data) throw new Error('No data');
      setLawyer(data);
    } catch { setError(t('errorMsg')); }
    finally { setLoading(false); }
  };

  const services = lawyer?.services || [];
  const matches  = !search.trim() ||
    [lawyer?.name, lawyer?.specialization, lawyer?.city, ...services.map(s=>s.serviceName)]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:DS.sans}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${DS.border}`,borderTopColor:DS.primary,animation:'sp .8s linear infinite',margin:'0 auto 10px'}}/>
        <p style={{color:DS.textMuted,fontSize:13}}>{t('loading')}</p>
      </div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error||!lawyer) return (
    <div style={{minHeight:'100vh',background:DS.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:DS.sans}}>
      <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:24,padding:40,textAlign:'center',maxWidth:380,boxShadow:'0 8px 32px rgba(26,8,0,0.06)',animation:'riseIn .5s ease both'}}>
        <div style={{width:52,height:52,borderRadius:16,background:DS.primaryLight,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <AlertCircle size={22} color={DS.primary}/>
        </div>
        <h2 style={{fontFamily:DS.serif,fontSize:20,color:DS.text,marginBottom:8}}>{t('noResults')}</h2>
        <p style={{color:DS.textMuted,fontSize:13,marginBottom:20}}>{error||t('errorMsg')}</p>
        <button onClick={fetchData} style={{display:'inline-flex',alignItems:'center',gap:6,background:DS.primary,color:'#fff',border:'none',borderRadius:12,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          <RefreshCw size={13}/> {t('submit')}
        </button>
      </div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}} @keyframes riseIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:DS.bg,fontFamily:DS.sans}}>
      <style>{`
        @keyframes sp      { to { transform:rotate(360deg) } }
        @keyframes riseIn  { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        .ld-shimmer { background:linear-gradient(90deg,#C84B00,#E8853A,#D4A853,#C84B00); background-size:300% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        .ld-btn:hover  { opacity:.85; transform:translateY(-2px)!important; box-shadow:0 10px 28px rgba(200,75,0,0.3)!important; }
        .ld-card:hover { box-shadow:0 16px 48px rgba(200,75,0,0.10)!important; border-color:${DS.primaryBorder}!important; }
        .ld-svc:hover  { border-color:${DS.primaryBorder}!important; background:${DS.primaryLight}!important; transform:translateY(-1px); }
        .ld-stat:hover { border-color:${DS.primaryBorder}!important; transform:translateY(-2px); }
      `}</style>

      {/* Hero */}
      <div style={{background:DS.card,borderBottom:`1px solid ${DS.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-60,right:-40,width:280,height:280,borderRadius:'50%',pointerEvents:'none',background:'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 70%)',animation:'float 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(200,75,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,75,0,0.025) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        <div style={{maxWidth:900,margin:'0 auto',padding:'56px 20px 44px',textAlign:'center',position:'relative'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,borderRadius:999,padding:'5px 16px',marginBottom:16,opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(12px)',transition:'opacity .5s ease .05s, transform .5s ease .05s'}}>
            <Sparkles size={12} color={DS.primary}/>
            <span style={{color:DS.primary,fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>{t('verifiedBrokers')} {t('legalSupport')}</span>
          </div>
          <h1 style={{fontFamily:DS.serif,fontSize:'clamp(2rem,5vw,2.8rem)',fontWeight:700,lineHeight:1.2,marginBottom:10,opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(14px)',transition:'opacity .5s ease .12s, transform .5s ease .12s'}}>
            <span className="ld-shimmer">{t('findLawyer')}</span>
          </h1>
          <p style={{color:DS.textMuted,fontSize:14,maxWidth:340,margin:'0 auto',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(12px)',transition:'opacity .5s ease .2s, transform .5s ease .2s'}}>
            {t('legalSupportDesc')}
          </p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'0 20px 64px'}}>
        {/* Search */}
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:16,padding:10,margin:'28px 0 24px',boxShadow:'0 2px 12px rgba(26,8,0,0.04)',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(14px)',transition:'opacity .5s ease .28s, transform .5s ease .28s'}}>
          <div style={{position:'relative'}}>
            <Search size={15} color={DS.textMuted} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
              style={{width:'100%',background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:12,padding:'10px 14px 10px 38px',color:DS.text,fontSize:13,outline:'none',boxSizing:'border-box',transition:'all .2s'}}/>
          </div>
        </div>

        {!matches ? (
          <div style={{textAlign:'center',padding:'80px 0',animation:'fadeIn .5s ease both'}}>
            <Search size={32} color={DS.border} style={{margin:'0 auto 10px'}}/>
            <p style={{color:DS.textSub,fontSize:14}}>{t('noResults')}: "<span style={{color:DS.primary}}>{search}</span>"</p>
          </div>
        ) : (
          <div className="ld-card" style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:24,boxShadow:'0 4px 24px rgba(26,8,0,0.05)',overflow:'hidden',transition:'all .3s',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(22px)'}}>
            <div style={{padding:'32px 32px 28px'}}>
              <div style={{display:'flex',flexWrap:'wrap',gap:32}}>
                {/* Avatar + stats */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,width:200,flexShrink:0}}>
                  <div style={{position:'relative',animation:'riseIn .5s ease .4s both'}}>
                    {lawyer.profileImage
                      ? <img src={lawyer.profileImage} alt={lawyer.name} style={{width:128,height:128,borderRadius:20,objectFit:'cover',border:`3px solid ${DS.border}`,boxShadow:'0 6px 20px rgba(26,8,0,0.12)'}}/>
                      : <div style={{width:128,height:128,borderRadius:20,background:`linear-gradient(135deg,${DS.primary},#7A2C00)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:30,fontFamily:DS.serif,fontWeight:700,boxShadow:`0 8px 24px rgba(200,75,0,0.28)`}}>
                          {lawyer.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>}
                    <div style={{position:'absolute',bottom:-6,right:-6,background:'#16a34a',borderRadius:'50%',padding:5,border:`2px solid ${DS.card}`}}>
                      <CheckCircle size={13} color="#fff"/>
                    </div>
                    <div style={{position:'absolute',top:-8,left:-8,padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:700,border:`2px solid ${DS.card}`,background:lawyer.status==='ACTIVE'?'#16a34a':'#ea580c',color:'#fff'}}>
                      {lawyer.status==='ACTIVE'?`● ${t('availableNow')}`:'● Busy'}
                    </div>
                  </div>
                  {[
                    {icon:Briefcase,   val:lawyer.experience?`${lawyer.experience} Yrs`:`${services.length}`, label:lawyer.experience?t('experience'):t('myServices')},
                    {icon:CheckCircle, val:lawyer.casesHandled?`${lawyer.casesHandled}+`:'—',                  label:t('reviews')},
                    {icon:Award,       val:lawyer.successRate?`${lawyer.successRate}%`:'—',                    label:t('successRate')},
                  ].map(({icon:I,val,label},i)=>(
                    <div key={label} className="ld-stat" style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:DS.bg,borderRadius:14,border:`1px solid ${DS.border}`,transition:'all .2s',animation:`riseIn .45s ease ${.46+i*.09}s both`}}>
                      <I size={14} color={DS.primary}/>
                      <div>
                        <p style={{color:DS.text,fontWeight:700,fontSize:13,lineHeight:1}}>{val}</p>
                        <p style={{color:DS.textMuted,fontSize:11,marginTop:2}}>{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:10,marginBottom:14,animation:'riseIn .5s ease .42s both'}}>
                    <div>
                      <h2 style={{fontFamily:DS.serif,fontSize:26,color:DS.text,fontWeight:700,marginBottom:4,lineHeight:1.2}}>{lawyer.name}</h2>
                      <p style={{color:DS.primary,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
                        <Scale size={13}/>{lawyer.specialization||t('specialization')}
                      </p>
                    </div>
                    {lawyer.rating&&(
                      <div style={{display:'flex',alignItems:'center',gap:6,background:DS.primaryLight,padding:'5px 12px',borderRadius:999,border:`1px solid ${DS.primaryBorder}`,alignSelf:'flex-start'}}>
                        <Star size={13} color={DS.primary} fill={DS.primary}/>
                        <span style={{color:DS.primary,fontWeight:700,fontSize:14}}>{lawyer.rating}</span>
                        {lawyer.totalReviews>0&&<span style={{color:DS.textMuted,fontSize:12}}>({lawyer.totalReviews})</span>}
                      </div>
                    )}
                  </div>

                  {services.length>0&&(
                    <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14,animation:'riseIn .5s ease .48s both'}}>
                      {services.slice(0,4).map((s,i)=>(
                        <span key={i} style={{background:DS.primaryLight,color:DS.primary,fontSize:11,padding:'4px 12px',borderRadius:999,border:`1px solid ${DS.primaryBorder}`,fontWeight:600,animation:`riseIn .4s ease ${.5+i*.06}s both`}}>{s.serviceName}</span>
                      ))}
                      {services.length>4&&<span style={{background:DS.bg,color:DS.textMuted,fontSize:11,padding:'4px 12px',borderRadius:999,border:`1px solid ${DS.border}`,fontWeight:600}}>+{services.length-4}</span>}
                    </div>
                  )}

                  {(lawyer.about||lawyer.specialization)&&(
                    <p style={{color:DS.textSub,fontSize:13,lineHeight:1.75,marginBottom:16,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden',animation:'riseIn .5s ease .54s both'}}>
                      {lawyer.about||`${t('specialization')}: ${lawyer.specialization}`}
                    </p>
                  )}

                  <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:20,animation:'riseIn .5s ease .58s both'}}>
                    {(lawyer.city||lawyer.address)&&<div style={{display:'inline-flex',alignItems:'center',gap:8,color:DS.textSub,fontSize:13}}><MapPin size={13} color={DS.textMuted}/>{[lawyer.address,lawyer.city,lawyer.state].filter(Boolean).join(', ')}</div>}
                    {lawyer.phone&&<div style={{display:'inline-flex',alignItems:'center',gap:8,color:DS.textSub,fontSize:13}}><Phone size={13} color={DS.textMuted}/>{lawyer.phone}</div>}
                    {lawyer.email&&<div style={{display:'inline-flex',alignItems:'center',gap:8,color:DS.textSub,fontSize:13}}><Mail size={13} color={DS.textMuted}/>{lawyer.email}</div>}
                  </div>

                  <div style={{display:'flex',gap:10,flexWrap:'wrap',animation:'riseIn .5s ease .64s both'}}>
                    <button className="ld-btn" onClick={()=>navigate(`/lawyer/${lawyer.id}`)} style={{display:'inline-flex',alignItems:'center',gap:8,background:DS.primary,color:'#fff',border:'none',borderRadius:14,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .2s',boxShadow:`0 4px 16px rgba(200,75,0,0.22)`}}>
                      <Calendar size={13}/> {t('bookConsultation')} <ArrowUpRight size={13}/>
                    </button>
                    {lawyer.phone&&<a href={`tel:${lawyer.phone}`} style={{display:'inline-flex',alignItems:'center',gap:8,background:DS.bg,border:`1px solid ${DS.border}`,color:DS.textSub,borderRadius:14,padding:'10px 16px',fontSize:13,fontWeight:600,textDecoration:'none',transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primaryBorder;e.currentTarget.style.color=DS.primary;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.textSub;}}><Phone size={13}/> {t('callNow')}</a>}
                    {lawyer.email&&<a href={`mailto:${lawyer.email}`} style={{display:'inline-flex',alignItems:'center',gap:8,background:DS.bg,border:`1px solid ${DS.border}`,color:DS.textSub,borderRadius:14,padding:'10px 16px',fontSize:13,fontWeight:600,textDecoration:'none',transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primaryBorder;e.currentTarget.style.color=DS.primary;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.textSub;}}><Mail size={13}/> {t('whatsapp')}</a>}
                  </div>
                </div>
              </div>
            </div>

            {services.length>0&&(
              <div style={{borderTop:`1px solid ${DS.border}`,background:DS.bg,padding:'20px 32px',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(10px)',transition:'opacity .5s ease .72s, transform .5s ease .72s'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <p style={{fontSize:10,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.1em'}}>{t('ourServices')} & {t('price')}</p>
                  <span style={{fontSize:11,color:DS.textMuted}}>{services.length} {t('myServices')}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:8}}>
                  {services.map((s,i)=>(
                    <div key={s.id||i} className="ld-svc" style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:12,padding:'9px 13px',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .2s',cursor:'default',animation:`riseIn .4s ease ${.74+i*.05}s both`}}>
                      <span style={{color:DS.text,fontSize:12,fontWeight:600}}>{s.serviceName}</span>
                      {s.price&&<span style={{color:'#16a34a',fontSize:12,fontWeight:700,marginLeft:6,flexShrink:0}}>₹{Number(s.price).toLocaleString()}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
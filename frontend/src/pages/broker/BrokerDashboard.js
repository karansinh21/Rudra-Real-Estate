import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import {
  LayoutDashboard, Building2, MessageSquare, FileText, Settings,
  LogOut, Menu, X, Camera, Save, CheckCircle, Shield, Bell,
  ChevronRight, ChevronDown, Loader2, Plus, MapPin, Phone,
  IndianRupee, Clock, Layers, Activity, List, Eye, AlertCircle, Leaf
} from 'lucide-react';
import BrokerLiveChat from '../../components/chat/BrokerLiveChat';
import PushNotificationBanner from '../../components/common/PushNotificationBanner'; // ✅ NEW

/* ─── Design System (same across all dashboards) ─── */
const DS = {
  bg: '#F9F6F2', sidebar: '#FFFFFF', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
  shadow: '0 1px 3px rgba(26,8,0,0.05),0 4px 14px rgba(26,8,0,0.04)',
  shadowMd: '0 4px 20px rgba(200,75,0,0.10)',
};
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
  .brd { font-family:'DM Sans',system-ui,sans-serif; } .brd *{box-sizing:border-box;margin:0;padding:0;}
  .brds { font-family:Georgia,'Times New Roman',serif; }
  .brd-h{transition:all 0.18s ease;} .brd-h:hover{box-shadow:0 6px 24px rgba(200,75,0,0.12);transform:translateY(-1px);}
  .brd-n{transition:all 0.15s ease;} .brd-n:hover{background:#FEF3EE!important;color:#C84B00!important;}
  .brd-i:focus{outline:none;border-color:#C84B00!important;box-shadow:0 0 0 3px rgba(200,75,0,0.1)!important;}
  @keyframes brd-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .brd-fade{animation:brd-fade 0.35s ease forwards;}
  @keyframes brd-spin{to{transform:rotate(360deg)}} .brd-spin{animation:brd-spin 1s linear infinite;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#EDE8E3;border-radius:4px;}
`;

/* ─── Mini Components ─── */
const Badge = ({ color = 'gray', children }) => {
  const m = { red:'#FEF2F2,#B91C1C,#FECACA', blue:'#EFF6FF,#1D4ED8,#BFDBFE', green:'#F0FDF4,#15803D,#BBF7D0', amber:'#FFFBEB,#B45309,#FDE68A', violet:'#F5F3FF,#6D28D9,#DDD6FE', gray:'#F9FAFB,#374151,#E5E7EB', terra:`${DS.primaryLight},${DS.primary},${DS.primaryBorder}`, sky:'#F0F9FF,#0369A1,#BAE6FD', emerald:'#F0FDF4,#065F46,#A7F3D0' };
  const [bg,text,border] = (m[color]||m.gray).split(',');
  return <span style={{background:bg,color:text,border:`1px solid ${border}`,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700}}>{children}</span>;
};
const FieldInput = ({ label, disabled, textarea, rows=3, ...props }) => (
  <div>
    {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>{label}</label>}
    {textarea
      ? <textarea className="brd-i" {...props} rows={rows} disabled={disabled} style={{width:'100%',background:disabled?'#F5F0EB':DS.card,border:`1px solid ${DS.border}`,borderRadius:10,padding:'9px 12px',fontSize:14,color:disabled?DS.textMuted:DS.text,resize:'vertical',fontFamily:'inherit'}} />
      : <input className="brd-i" {...props} disabled={disabled} style={{width:'100%',background:disabled?'#F5F0EB':DS.card,border:`1px solid ${DS.border}`,borderRadius:10,padding:'9px 12px',fontSize:14,color:disabled?DS.textMuted:DS.text,cursor:disabled?'not-allowed':'text'}} />}
  </div>
);
const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{position:'relative',width:44,height:24,borderRadius:12,background:value?DS.primary:DS.border,border:'none',cursor:'pointer',transition:'background 0.2s',flexShrink:0}}>
    <div style={{position:'absolute',top:3,left:value?23:3,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s'}} />
  </button>
);
const StatCard = ({ icon: Icon, label, value, sub, color=DS.primary, onClick }) => (
  <div onClick={onClick} className="brd-h" style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:16,padding:'20px 22px',cursor:onClick?'pointer':'default',boxShadow:DS.shadow}}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
      <div style={{width:40,height:40,borderRadius:12,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={18} color={color} /></div>
      {sub && <span style={{fontSize:11,color:DS.textMuted,background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:20,padding:'2px 8px'}}>{sub}</span>}
    </div>
    <p className="brds" style={{fontSize:30,fontWeight:700,color:DS.text,lineHeight:1}}>{value}</p>
    <p style={{fontSize:13,color:DS.textSub,marginTop:5}}>{label}</p>
  </div>
);

const fmt = n => { if (!n) return '0'; if (n>=10000000) return `${(n/10000000).toFixed(1)}Cr`; if (n>=100000) return `${(n/100000).toFixed(0)}L`; if (n>=1000) return `${(n/1000).toFixed(0)}k`; return String(n); };

/* ─── Sidebar ─── */
const Sidebar = ({ activeView, setView, user, onLogout, location }) => {
  const isActive = (path) => location?.pathname?.startsWith(path);
  const [propOpen, setPropOpen] = useState(isActive('/broker/properties') || isActive('/broker/enquiries'));

  const navTop = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];
  const propSub = [
    { label: 'My Properties', path: '/broker/properties', icon: List },
    { label: 'Add Property',  path: '/broker/properties/add', icon: Plus },
    { label: 'Enquiries',     path: '/broker/enquiries', icon: MessageSquare },
  ];
  const navBot = [
    { id: 'legal',    label: 'Legal',           icon: FileText, path: '/broker/legal/request' },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const NavBtn = ({ id, label, icon: Icon, path, isAct }) => (
    <button onClick={() => path ? (window.location.href = path) : setView(id)} className="brd-n"
      style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:isAct?DS.primaryLight:'transparent',color:isAct?DS.primary:DS.textSub,fontWeight:isAct?700:500,fontSize:14,textAlign:'left',borderLeft:isAct?`3px solid ${DS.primary}`:'3px solid transparent'}}>
      <Icon size={16} /><span style={{flex:1}}>{label}</span>{isAct && <ChevronRight size={12}/>}
    </button>
  );

  return (
    <aside style={{width:240,minHeight:'100vh',background:DS.sidebar,borderRight:`1px solid ${DS.border}`,display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:20}}>
      <div style={{padding:'22px 20px 18px',borderBottom:`1px solid ${DS.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:DS.primary,display:'flex',alignItems:'center',justifyContent:'center'}}><Building2 size={17} color="#fff"/></div>
          <div>
            <p className="brds" style={{fontSize:15,fontWeight:700,color:DS.text,lineHeight:1.1}}>Rudra</p>
            <p style={{fontSize:9,fontWeight:700,color:DS.textMuted,letterSpacing:'0.12em',textTransform:'uppercase',marginTop:1}}>Realty Portal</p>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:'14px 10px',overflowY:'auto'}}>
        <p style={{fontSize:10,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',padding:'0 8px',marginBottom:8}}>Menu</p>
        <NavBtn id="dashboard" label="Dashboard" icon={LayoutDashboard} isAct={activeView==='dashboard'} />
        {/* Properties folder */}
        <div>
          <button onClick={() => setPropOpen(v=>!v)} className="brd-n"
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:propOpen?DS.primaryLight:'transparent',color:propOpen?DS.primary:DS.textSub,fontWeight:propOpen?600:500,fontSize:14,textAlign:'left',borderLeft:propOpen?`3px solid ${DS.primary}`:'3px solid transparent'}}>
            <Building2 size={16}/><span style={{flex:1}}>Properties</span>{propOpen?<ChevronDown size={12}/>:<ChevronRight size={12}/>}
          </button>
          {propOpen && (
            <div style={{marginLeft:12,paddingLeft:10,borderLeft:`2px solid ${DS.primaryBorder}`,marginBottom:4}}>
              {propSub.map(({label,path,icon:Icon}) => (
                <Link key={path} to={path} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,textDecoration:'none',color:DS.textSub,fontWeight:500,fontSize:13,marginBottom:2}}>
                  <Icon size={13}/> {label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div style={{height:1,background:DS.border,margin:'8px 0'}} />
        {navBot.map(({ id, label, icon: Icon, path }) => (
          <NavBtn key={id} id={id} label={label} icon={Icon} path={path} isAct={activeView===id} />
        ))}
      </nav>
      <div style={{borderTop:`1px solid ${DS.border}`,padding:'10px 10px 6px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',marginBottom:4}}>
          <div style={{width:34,height:34,borderRadius:10,background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span className="brds" style={{fontSize:14,fontWeight:700,color:DS.primary}}>{user?.name?.[0]?.toUpperCase()||'B'}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:600,color:DS.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name||'Broker'}</p>
            <p style={{fontSize:11,color:DS.textMuted}}>Broker</p>
          </div>
        </div>
        <button onClick={onLogout} className="brd-n" style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,border:'none',cursor:'pointer',background:'transparent',color:'#EF4444',fontWeight:600,fontSize:14}}>
          <LogOut size={15}/> Logout
        </button>
      </div>
    </aside>
  );
};

/* ─── Dashboard View ─── */
const DashboardView = ({ stats, props: propList, enqs, lands, navigate, user }) => {
  const LAND_COLOR = { agricultural:'emerald', commercial:'sky', residential:'terra', industrial:'amber' };
  return (
    <div className="brd-fade">

      {/* ✅ Push Notification Banner — sabsi upar */}
      <PushNotificationBanner />

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 className="brds" style={{fontSize:28,fontWeight:700,color:DS.text}}>
            Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'} 👋
          </h1>
          <p style={{color:DS.textSub,marginTop:6,fontSize:15}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
        </div>
        <button onClick={() => navigate('/broker/properties/add')} style={{display:'flex',alignItems:'center',gap:8,background:DS.primary,color:'#fff',padding:'10px 20px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:700,fontSize:14,boxShadow:DS.shadowMd}}>
          <Plus size={15}/> Add Property
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:16,marginBottom:28}}>
        <StatCard icon={Building2}     label="My Properties"   value={stats?.totalProperties??0}   sub={`${stats?.availableProperties??0} available`} color={DS.primary}   onClick={()=>navigate('/broker/properties')} />
        <StatCard icon={MessageSquare} label="Enquiries"        value={stats?.totalEnquiries??0}     sub={`${stats?.pendingEnquiries??0} pending`}   color="#B45309"     onClick={()=>navigate('/broker/enquiries')} />
        <StatCard icon={CheckCircle}   label="Properties Sold"  value={stats?.soldProperties??0}                                                     color="#15803D"     onClick={()=>navigate('/broker/properties')} />
        <StatCard icon={Activity}      label="Active Listings"  value={stats?.availableProperties??0}                                                color="#0369A1"     onClick={()=>navigate('/broker/properties')} />
      </div>

      {/* Hero Banner */}
      <div style={{background:`linear-gradient(135deg,${DS.primary} 0%,#8B2500 100%)`,borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}} />
        <h2 className="brds" style={{fontSize:22,color:'#fff',marginBottom:8}}>Rudra Realty Dashboard</h2>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,marginBottom:20}}>Manage your property portfolio effectively</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {[['Add Property','/broker/properties/add',true],['View Enquiries','/broker/enquiries',false],['Add Land','/broker/properties/add?type=land',false]].map(([l,p,primary]) => (
            <button key={l} onClick={()=>navigate(p)} style={{display:'flex',alignItems:'center',gap:8,background:primary?'#fff':'rgba(255,255,255,0.15)',color:primary?DS.primary:'#fff',border:primary?'none':'1px solid rgba(255,255,255,0.2)',padding:'9px 18px',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Properties + Enquiries */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,marginBottom:24}}>
        {/* Properties */}
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:20,boxShadow:DS.shadow,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:`1px solid ${DS.border}`}}>
            <h2 className="brds" style={{fontSize:17,fontWeight:700,color:DS.text,display:'flex',alignItems:'center',gap:8}}><Building2 size={17} color={DS.primary}/> Recent Properties</h2>
            <Link to="/broker/properties" style={{fontSize:13,color:DS.primary,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>View All <ChevronRight size={13}/></Link>
          </div>
          {propList.length === 0
            ? <div style={{padding:'40px',textAlign:'center',color:DS.textMuted,fontSize:14}}>
                <Building2 size={32} color={DS.border} style={{margin:'0 auto 12px'}}/>
                <p>No properties yet</p>
                <button onClick={()=>navigate('/broker/properties/add')} style={{marginTop:12,display:'inline-flex',alignItems:'center',gap:6,color:DS.primary,background:DS.primaryLight,border:`1px solid ${DS.primaryBorder}`,padding:'8px 16px',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13}}>
                  <Plus size={13}/> Add First Property
                </button>
              </div>
            : <div>
                {propList.map(p => {
                  let img = null;
                  try { const imgs = typeof p.images==='string'?JSON.parse(p.images):p.images; if(Array.isArray(imgs)&&imgs.length) img=imgs[0]?.thumbnail||imgs[0]?.url; } catch{}
                  const isLand = ['LAND','AGRICULTURAL','INDUSTRIAL'].includes(p.type);
                  return (
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 22px',borderBottom:`1px solid ${DS.border}`}}>
                      <div style={{width:52,height:52,borderRadius:12,overflow:'hidden',background:DS.bg,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
                        {img ? <img src={img} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (isLand ? '🌱' : '🏠')}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:14,fontWeight:600,color:DS.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</p>
                        <p style={{fontSize:12,color:DS.textMuted,display:'flex',alignItems:'center',gap:4,marginTop:3}}><MapPin size={11}/>{p.city}, {p.state}</p>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <p style={{fontSize:14,fontWeight:700,color:DS.primary}}>₹{fmt(p.price)}</p>
                        <Badge color={p.purpose==='SALE'?'amber':'sky'}>{p.purpose}</Badge>
                      </div>
                    </div>
                  );
                })}
                <div style={{display:'flex',gap:10,padding:'14px 22px'}}>
                  <button onClick={()=>navigate('/broker/properties/add')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px',borderRadius:10,background:DS.primary,color:'#fff',border:'none',cursor:'pointer',fontWeight:700,fontSize:13}}>
                    <Plus size={13}/> Add Property
                  </button>
                  <button onClick={()=>navigate('/broker/properties/add?type=land')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px',borderRadius:10,background:'#F0FDF4',color:'#065F46',border:'1px solid #A7F3D0',cursor:'pointer',fontWeight:700,fontSize:13}}>
                    <Leaf size={13}/> Add Land
                  </button>
                </div>
              </div>}
        </div>

        {/* Enquiries */}
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:20,boxShadow:DS.shadow,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:`1px solid ${DS.border}`}}>
            <h2 className="brds" style={{fontSize:16,fontWeight:700,color:DS.text,display:'flex',alignItems:'center',gap:8}}><MessageSquare size={15} color="#B45309"/> Enquiries</h2>
            <Link to="/broker/enquiries" style={{fontSize:12,color:DS.primary,fontWeight:600,textDecoration:'none'}}>All →</Link>
          </div>
          {enqs.length === 0
            ? <div style={{padding:'40px 18px',textAlign:'center',color:DS.textMuted,fontSize:13}}><MessageSquare size={24} color={DS.border} style={{margin:'0 auto 8px'}}/> No enquiries yet</div>
            : enqs.map(e => (
              <div key={e.id} style={{padding:'12px 18px',borderBottom:`1px solid ${DS.border}`}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:4}}>
                  <p style={{fontSize:13,fontWeight:600,color:DS.text}}>{e.clientName}</p>
                  <Badge color={e.status==='PENDING'?'amber':e.status==='CLOSED'?'green':'sky'}>{e.status}</Badge>
                </div>
                <p style={{fontSize:12,color:DS.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.property?.title||'Property'}</p>
                <a href={`tel:${e.clientPhone}`} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:DS.primary,textDecoration:'none',marginTop:6,fontWeight:600}}>
                  <Phone size={11}/> {e.clientPhone}
                </a>
              </div>
            ))}
        </div>
      </div>

      {/* Land Requirements */}
      <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:20,boxShadow:DS.shadow,overflow:'hidden',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:`1px solid ${DS.border}`}}>
          <h2 className="brds" style={{fontSize:17,fontWeight:700,color:DS.text,display:'flex',alignItems:'center',gap:8}}><Layers size={17} color="#065F46"/> Land Requirements</h2>
          <Link to="/land-listings" style={{fontSize:13,color:DS.primary,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>View All <ChevronRight size={13}/></Link>
        </div>
        {lands.length === 0
          ? <div style={{padding:'40px',textAlign:'center',color:DS.textMuted,fontSize:14}}><Layers size={28} color={DS.border} style={{margin:'0 auto 8px'}}/> No land requirements yet</div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:0}}>
              {lands.map(req => (
                <div key={req.id} style={{padding:'18px 20px',borderRight:`1px solid ${DS.border}`,borderBottom:`1px solid ${DS.border}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <Badge color={LAND_COLOR[req.landType?.toLowerCase()]||'gray'}>{req.landType}</Badge>
                    <span style={{fontSize:11,color:DS.textMuted}}>{new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  </div>
                  <p style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:10}}>{req.name}</p>
                  {[[MapPin,req.preferredLocations?.length?req.preferredLocations.join(', '):req.city],[IndianRupee,`${fmt(req.minBudget)} – ${fmt(req.maxBudget)}`],[Clock,req.timeline]].map(([Icon,val],i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,fontSize:12,color:DS.textSub}}><Icon size={11} color={DS.textMuted}/>{val}</div>
                  ))}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,marginTop:4,borderTop:`1px solid ${DS.border}`}}>
                    <span style={{fontSize:12,color:DS.textMuted}}>{req.minArea}–{req.maxArea} <b style={{color:DS.text}}>{req.areaUnit}</b></span>
                    <a href={`tel:${req.phone}`} style={{fontSize:12,fontWeight:700,color:DS.primary,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}><Phone size={11}/> Call</a>
                  </div>
                </div>
              ))}
            </div>}
      </div>

      {/* Live Chat */}
      <BrokerLiveChat currentUser={user} />
    </div>
  );
};

/* ─── Profile/Settings View ─── */
const ProfileView = ({ user }) => {
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'', phone:user?.phone||'', city:user?.city||'', state:user?.state||'', address:user?.address||'', experience:'', licenseNo:'', specialization:'', about:'' });
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });
  const [notifs, setNotifs] = useState({ emailAlerts:true, smsAlerts:false, pushNotifications:true, newEnquiries:true, propertyUpdates:true });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(user?.profileImage||null);
  const fileRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/brokers/me/profile', { headers:{ Authorization:`Bearer ${token}` }})
      .then(r => r.json()).then(d => {
        if (d.broker) setForm(f => ({...f, ...d.broker, experience:d.broker.professionalDetails?.experience||'', licenseNo:d.broker.professionalDetails?.licenseNo||'', specialization:d.broker.professionalDetails?.specialization||'', about:d.broker.professionalDetails?.about||'' }));
      }).catch(()=>{});
  }, []);

  const save = async () => {
    setSaving(true); setErr('');
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/brokers/me/profile', { method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ ...form, profileImage:preview, professionalDetails:{ experience:form.experience, licenseNo:form.licenseNo, specialization:form.specialization, about:form.about }}) });
      setSaving(false); setSuccess(true); setTimeout(()=>setSuccess(false),2500);
    } catch { setErr('Save error. Try again.'); setSaving(false); }
  };
  const changePwd = async () => {
    setErr('');
    if (pwd.next !== pwd.confirm) { setErr('Passwords match nathi!'); return; }
    if (pwd.next.length < 6) { setErr('Min 6 characters.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/change-password', { method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ currentPassword:pwd.current, newPassword:pwd.next }) });
      setPwd({ current:'', next:'', confirm:'' }); setSaving(false); setSuccess(true); setTimeout(()=>setSuccess(false),2500);
    } catch { setErr('Password change error.'); setSaving(false); }
  };

  const TABS = [{id:'profile',label:'Profile',icon:Settings},{id:'security',label:'Security',icon:Shield},{id:'notifications',label:'Notifications',icon:Bell}];
  const NLABELS = { emailAlerts:'Email Alerts', smsAlerts:'SMS Alerts', pushNotifications:'Push Notifications', newEnquiries:'New Enquiries', propertyUpdates:'Property Updates' };

  return (
    <div className="brd-fade">
      <h1 className="brds" style={{fontSize:28,fontWeight:700,color:DS.text,marginBottom:6}}>Profile & Settings</h1>
      <p style={{color:DS.textSub,fontSize:15,marginBottom:28}}>Manage your broker profile and account preferences</p>
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:20}}>
        <div>
          <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:16,padding:20,textAlign:'center',marginBottom:12,boxShadow:DS.shadow}}>
            <div style={{position:'relative',display:'inline-block',marginBottom:12}}>
              {preview ? <img src={preview} alt="" style={{width:76,height:76,borderRadius:16,objectFit:'cover',border:`2px solid ${DS.primaryBorder}`}}/> : <div style={{width:76,height:76,borderRadius:16,background:DS.primaryLight,border:`2px solid ${DS.primaryBorder}`,display:'flex',alignItems:'center',justifyContent:'center'}}><span className="brds" style={{fontSize:28,fontWeight:700,color:DS.primary}}>{form.name?.[0]?.toUpperCase()||'B'}</span></div>}
              <button onClick={()=>fileRef.current?.click()} style={{position:'absolute',bottom:-6,right:-6,width:28,height:28,borderRadius:9,background:DS.primary,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <Camera size={13} color="#fff"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ const f=e.target.files[0]; if(f){const r=new FileReader();r.onloadend=()=>setPreview(r.result);r.readAsDataURL(f);}}} />
            </div>
            <p style={{fontWeight:700,fontSize:14,color:DS.text,marginBottom:6}}>{form.name||'Broker'}</p>
            <Badge color="blue">BROKER</Badge>
          </div>
          <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:16,padding:8,boxShadow:DS.shadow}}>
            {TABS.map(({id,label,icon:Icon}) => (
              <button key={id} onClick={()=>setTab(id)} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:10,border:'none',cursor:'pointer',marginBottom:2,background:tab===id?DS.primaryLight:'transparent',color:tab===id?DS.primary:DS.textSub,fontWeight:tab===id?700:500,fontSize:13,textAlign:'left',borderLeft:tab===id?`3px solid ${DS.primary}`:'3px solid transparent'}}>
                <Icon size={14}/> {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:DS.card,border:`1px solid ${DS.border}`,borderRadius:16,padding:28,boxShadow:DS.shadow}}>
          {success && <div style={{display:'flex',alignItems:'center',gap:8,background:'#F0FDF4',border:'1px solid #BBF7D0',color:'#15803D',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:14}}><CheckCircle size={15}/> Saved!</div>}
          {err && <div style={{display:'flex',alignItems:'center',gap:8,background:'#FEF2F2',border:'1px solid #FECACA',color:'#B91C1C',borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:14}}><AlertCircle size={15}/> {err}</div>}

          {tab === 'profile' && <>
            <h3 className="brds" style={{fontSize:18,color:DS.text,marginBottom:20}}>Profile Information</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <FieldInput label="Full Name"  value={form.name}    onChange={e=>setForm({...form,name:e.target.value})}    placeholder="Your name"/>
              <FieldInput label="Email"      value={form.email}   disabled/>
              <FieldInput label="Phone"      value={form.phone}   onChange={e=>setForm({...form,phone:e.target.value})}   placeholder="+91 98765 43210"/>
              <FieldInput label="City"       value={form.city}    onChange={e=>setForm({...form,city:e.target.value})}    placeholder="City"/>
              <FieldInput label="State"      value={form.state}   onChange={e=>setForm({...form,state:e.target.value})}   placeholder="State"/>
              <FieldInput label="Role"       value="BROKER"       disabled/>
            </div>
            <div style={{marginTop:14}}><FieldInput label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Full address"/></div>
            <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${DS.border}`}}>
              <p style={{fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14}}>Professional Details</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <FieldInput label="Experience" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} placeholder="e.g. 5 years"/>
                <FieldInput label="RERA / License No" value={form.licenseNo} onChange={e=>setForm({...form,licenseNo:e.target.value})} placeholder="License number"/>
                <div style={{gridColumn:'span 2'}}><FieldInput label="Specialization" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})} placeholder="e.g. Residential, Commercial"/></div>
                <div style={{gridColumn:'span 2'}}><FieldInput label="About" textarea value={form.about} onChange={e=>setForm({...form,about:e.target.value})} placeholder="Describe your services…"/></div>
              </div>
            </div>
          </>}

          {tab === 'security' && <>
            <h3 className="brds" style={{fontSize:18,color:DS.text,marginBottom:20}}>Security Settings</h3>
            <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:380}}>
              <FieldInput label="Current Password" type="password" value={pwd.current} onChange={e=>setPwd({...pwd,current:e.target.value})} placeholder="••••••••"/>
              <FieldInput label="New Password"     type="password" value={pwd.next}    onChange={e=>setPwd({...pwd,next:e.target.value})}    placeholder="••••••••"/>
              <FieldInput label="Confirm Password" type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd,confirm:e.target.value})} placeholder="••••••••"/>
              <button onClick={changePwd} disabled={saving} style={{alignSelf:'flex-start',display:'flex',alignItems:'center',gap:8,background:'#FEF2F2',border:'1px solid #FECACA',color:'#B91C1C',padding:'9px 18px',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer'}}>
                <Shield size={14}/> {saving?'Changing…':'Change Password'}
              </button>
            </div>
          </>}

          {tab === 'notifications' && <>
            <h3 className="brds" style={{fontSize:18,color:DS.text,marginBottom:20}}>Notification Preferences</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(notifs).map(([key,val]) => (
                <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:12}}>
                  <div>
                    <p style={{fontWeight:600,color:DS.text,fontSize:14}}>{NLABELS[key]||key}</p>
                    <p style={{color:DS.textMuted,fontSize:12,marginTop:2}}>Receive {(NLABELS[key]||key).toLowerCase()}</p>
                  </div>
                  <Toggle value={val} onChange={()=>setNotifs({...notifs,[key]:!val})}/>
                </div>
              ))}
            </div>
          </>}

          {tab !== 'security' && (
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:24,paddingTop:18,borderTop:`1px solid ${DS.border}`}}>
              <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:8,background:DS.primary,color:'#fff',padding:'10px 22px',borderRadius:12,fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                {saving ? <><Loader2 size={14} className="brd-spin"/> Saving…</> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const BrokerDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [props, setProps] = useState([]);
  const [enqs,  setEnqs]  = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mob, setMob] = useState(false);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')||'{}'); } catch { return {}; }})();

  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    const token = localStorage.getItem('token');
    const H = { Authorization:`Bearer ${token}` };
    try {
      const [sr, pr, er, lr] = await Promise.allSettled([
        fetch('http://localhost:5000/api/brokers/me/stats', {headers:H}),
        fetch('http://localhost:5000/api/properties/my/properties?limit=4', {headers:H}),
        fetch('http://localhost:5000/api/brokers/me/enquiries', {headers:H}),
        fetch('http://localhost:5000/api/land/requirements?status=ACTIVE&limit=6', {headers:H}),
      ]);
      if (sr.status==='fulfilled') { const d=await sr.value.json(); setStats(d.stats||null); }
      if (pr.status==='fulfilled') { const d=await pr.value.json(); setProps((d.properties||[]).slice(0,4)); }
      if (er.status==='fulfilled') { const d=await er.value.json(); setEnqs((d.enquiries||[]).slice(0,5)); }
      if (lr.status==='fulfilled') { const d=await lr.value.json(); setLands(d.requirements||[]); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onLogout = () => { logout(); navigate('/auth'); };

  return (
    <div className="brd" style={{minHeight:'100vh',background:DS.bg,display:'flex'}}>
      <style>{CSS}</style>
      <div style={{width:240,flexShrink:0}}>
        <Sidebar activeView={view} setView={setView} user={user} onLogout={onLogout} location={location}/>
      </div>
      {mob && (
        <div style={{position:'fixed',inset:0,zIndex:40,display:'flex'}}>
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)'}} onClick={()=>setMob(false)}/>
          <div style={{position:'relative',zIndex:50,width:240}}>
            <button onClick={()=>setMob(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',cursor:'pointer',color:DS.textMuted}}><X size={18}/></button>
            <Sidebar activeView={view} setView={v=>{setView(v);setMob(false);}} user={user} onLogout={onLogout} location={location}/>
          </div>
        </div>
      )}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <header style={{display:'flex',alignItems:'center',gap:12,padding:'12px 20px',background:DS.sidebar,borderBottom:`1px solid ${DS.border}`,position:'sticky',top:0,zIndex:10}}>
          <button onClick={()=>setMob(true)} style={{background:'none',border:'none',cursor:'pointer',color:DS.textSub}}><Menu size={20}/></button>
          <span className="brds" style={{fontSize:15,fontWeight:700,color:DS.text}}>Rudra Realty</span>
        </header>
        <main style={{flex:1,padding:'32px 36px',maxWidth:1200,width:'100%'}}>
          {loading ? (
            <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Loader2 size={28} color={DS.primary} className="brd-spin"/></div>
          ) : view==='settings' ? (
            <ProfileView user={user}/>
          ) : (
            <DashboardView stats={stats} props={props} enqs={enqs} lands={lands} navigate={navigate} user={user}/>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrokerDashboard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Phone, Mail, User, Heart, Share2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { propertyAPI, enquiryAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';

const formatPrice = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(2)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.thumbnail || null;
};

const TYPE_CONFIG = {
  RESIDENTIAL:  { emoji:'🏠', label:'Residential',  color:'#7c3aed', bg:'#f5f3ff' },
  COMMERCIAL:   { emoji:'🏢', label:'Commercial',   color:'#2563eb', bg:'#eff6ff' },
  AGRICULTURAL: { emoji:'🌾', label:'Agricultural', color:'#059669', bg:'#ecfdf5' },
  INDUSTRIAL:   { emoji:'🏭', label:'Industrial',   color:'#d97706', bg:'#fffbeb' },
  LAND:         { emoji:'🗺️', label:'Land / Plot',  color:'#16a34a', bg:'#f0fdf4' },
};

const isLandType = (type) => ['LAND','AGRICULTURAL'].includes(type);

const Property3DDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const [property,   setProperty]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [imgIndex,   setImgIndex]   = useState(0);
  const [liked,      setLiked]      = useState(false);
  const [liking,     setLiking]     = useState(false);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [form, setForm] = useState({ clientName:'', clientEmail:'', clientPhone:'', message:'' });

  useEffect(() => { if (id) fetchProperty(); }, [id]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await wishlistAPI.getIds();
        const ids = res.data?.ids || res.data || [];
        setLiked(ids.includes(id));
      } catch {}
    })();
  }, [id, isLoggedIn]);

  const fetchProperty = async () => {
    try {
      const res = await propertyAPI.getById(id);
      setProperty(res.data?.property || res.data);
    } catch { setProperty(null); }
    finally  { setLoading(false); }
  };

  const toggleWishlist = async () => {
    if (!isLoggedIn) { navigate('/auth'); return; }
    setLiking(true);
    try {
      if (liked) { await wishlistAPI.remove(id); setLiked(false); }
      else        { await wishlistAPI.add(id);    setLiked(true);  }
    } catch {}
    finally { setLiking(false); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => alert('Link copied!'))
      .catch(() => {});
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await enquiryAPI.create({ propertyId:id, ...form });
      setSuccess(true);
      setForm({ clientName:'', clientEmail:'', clientPhone:'', message:'' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) { setError(err.response?.data?.error || t('errorMsg')); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#f9f8f6' }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-9 h-9 text-violet-500 animate-spin"/>
        <p className="text-stone-400 text-sm">{t('loading')}</p>
      </div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#f9f8f6' }}>
      <div className="text-center">
        <p className="text-5xl mb-3">🏚️</p>
        <h2 className="text-stone-800 font-bold text-xl mb-2" style={{ fontFamily:'Georgia, serif' }}>{t('noPropsFound')}</h2>
        <p className="text-stone-400 text-sm mb-5">{t('noPropsSubtitle')}</p>
        <button onClick={() => navigate('/properties')} className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-violet-700 transition-all text-sm">
          {t('browseProperties')}
        </button>
      </div>
    </div>
  );

  let images = [];
  try {
    const raw = typeof property.images==='string' ? JSON.parse(property.images) : property.images;
    if (Array.isArray(raw)) images = raw.map(getImageUrl).filter(Boolean);
  } catch {}

  let features = [];
  try { features = Array.isArray(property.features) ? property.features : JSON.parse(property.features||'[]'); } catch {}

  const tc = TYPE_CONFIG[property.type] || TYPE_CONFIG.RESIDENTIAL;
  const isLand = isLandType(property.type);
  const inputCls = "w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300/50 focus:border-violet-400 transition-all";

  return (
    <div style={{ minHeight:'100vh', background:'#f9f8f6', fontFamily:'system-ui, sans-serif' }}>

      {/* Back bar */}
      <div className="bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 backdrop-blur bg-white/95">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm font-medium transition-all">
          <ArrowLeft className="h-4 w-4"/> {t('back')}
        </button>
        <span className="text-stone-200">|</span>
        <p className="text-stone-700 text-sm font-medium line-clamp-1">{property.title}</p>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleWishlist} disabled={liking} className={`p-2 rounded-xl transition-all ${liked?'bg-red-50':'hover:bg-stone-100'}`}>
            {liking ? <Loader2 className="h-5 w-5 text-red-400 animate-spin"/> : <Heart className={`h-5 w-5 ${liked?'fill-red-500 text-red-500':'text-stone-400'}`}/>}
          </button>
          <button onClick={handleShare} className="p-2 rounded-xl hover:bg-stone-100 transition-all">
            <Share2 className="h-5 w-5 text-stone-400"/>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm">
              <div className="relative h-80 sm:h-96 bg-stone-100">
                {images.length > 0 ? (
                  <>
                    <img src={images[imgIndex]} alt={property.title} className="w-full h-full object-cover"/>
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setImgIndex(i=>(i-1+images.length)%images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-white transition">
                          <ChevronLeft className="h-5 w-5 text-stone-700"/>
                        </button>
                        <button onClick={() => setImgIndex(i=>(i+1)%images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-white transition">
                          <ChevronRight className="h-5 w-5 text-stone-700"/>
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_,i) => <button key={i} onClick={() => setImgIndex(i)} className={`h-2 rounded-full transition-all ${i===imgIndex?'w-6 bg-white':'w-2 bg-white/50'}`}/>)}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                          {imgIndex+1}/{images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                    <span className="text-6xl mb-2">{tc.emoji}</span>
                    <p className="text-stone-400 text-sm">No photos available</p>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background:tc.color }}>{tc.emoji} {tc.label}</span>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((src,i) => <button key={i} onClick={() => setImgIndex(i)} className={`shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i===imgIndex?'border-violet-500':'border-transparent opacity-60 hover:opacity-100'}`}><img src={src} alt="" className="w-full h-full object-cover"/></button>)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:tc.bg, color:tc.color }}>{tc.emoji} {tc.label}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${property.purpose==='SALE'?'bg-amber-100 text-amber-700':'bg-sky-100 text-sky-700'}`}>
                  {property.purpose==='SALE' ? t('forSale') : t('forRent')}
                </span>
                {property.status && <span className={`text-xs font-bold px-3 py-1 rounded-full ${property.status==='AVAILABLE'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{property.status}</span>}
              </div>

              <h1 className="text-stone-900 font-bold mb-2" style={{ fontFamily:'Georgia, serif', fontSize:'1.6rem' }}>{property.title}</h1>
              <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-4">
                <MapPin className="h-4 w-4 shrink-0"/>
                {[property.address, property.city, property.state].filter(Boolean).join(', ')}
              </div>
              <p className="font-bold mb-5" style={{ fontFamily:'Georgia, serif', fontSize:'1.75rem', color:tc.color }}>{formatPrice(property.price)}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label:t('area'),      val:`${property.area?.toLocaleString()} ${isLand?(property.areaUnit||'sqft'):'sqft'}` },
                  ...(!isLand&&property.bedrooms?[{ label:t('bedrooms'), val:`🛏 ${property.bedrooms}` }]:[]),
                  ...(!isLand&&property.bathrooms?[{ label:t('bathrooms'),val:`🚿 ${property.bathrooms}` }]:[]),
                  { label:t('city'), val:property.city||'–' },
                ].map((s,i) => (
                  <div key={i} className="bg-[#f9f8f6] rounded-2xl p-3 text-center border border-stone-100">
                    <p className="text-xs text-stone-400 mb-1">{s.label}</p>
                    <p className="font-bold text-stone-800 text-sm">{s.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
                {[
                  ['overview',  t('overview')],
                  ['features',  t('amenities')],
                  ['location',  t('location')],
                ].map(([tab,label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab===tab?'bg-white shadow-sm text-stone-900':'text-stone-500'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {activeTab==='overview' && property.description && <p className="text-stone-600 text-sm leading-relaxed">{property.description}</p>}
              {activeTab==='features' && (
                features.length>0
                  ? <div className="flex flex-wrap gap-2">{features.map((f,i) => <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full border" style={isLand?{background:'#ecfdf5',borderColor:'#d1fae5',color:'#059669'}:{background:'#f5f3ff',borderColor:'#ede9fe',color:'#7c3aed'}}>✓ {f}</span>)}</div>
                  : <p className="text-stone-400 text-sm">{t('noResults')}</p>
              )}
              {activeTab==='location' && (
                <div className="bg-[#f9f8f6] rounded-2xl p-6 text-center border border-stone-100">
                  <MapPin className="h-10 w-10 text-violet-300 mx-auto mb-2"/>
                  <p className="text-stone-700 font-semibold text-sm">{[property.address,property.city,property.state].filter(Boolean).join(', ')}</p>
                  {property.city && <a href={`https://maps.google.com/?q=${encodeURIComponent([property.address,property.city,'Gujarat India'].filter(Boolean).join(', '))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-semibold mt-2">Open in Google Maps →</a>}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {property.broker && (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-stone-700 mb-4">🤝 {t('contactBroker')}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center"><User className="h-5 w-5 text-violet-600"/></div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{property.broker.name}</p>
                    <p className="text-stone-400 text-xs">{t('verifiedBrokers')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {property.broker.phone && <a href={`tel:${property.broker.phone}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition text-sm font-semibold"><Phone className="h-4 w-4 shrink-0"/> {property.broker.phone}</a>}
                  {property.broker.email && <a href={`mailto:${property.broker.email}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition text-xs font-medium truncate"><Mail className="h-4 w-4 shrink-0"/> {property.broker.email}</a>}
                </div>
              </div>
            )}

            <button onClick={() => navigate(`/3d-viewer?propertyId=${id}`)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-3xl py-4 text-sm font-bold hover:opacity-90 transition-all">
              🎮 View in 3D
            </button>

            <button onClick={() => navigate(`/schedule-tour?propertyId=${id}`)} className="w-full flex items-center justify-center gap-2 bg-[#f9f8f6] border border-stone-200 rounded-3xl py-4 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-all">
              <Calendar className="h-5 w-5 text-violet-500"/> {t('scheduleVisit')}
            </button>

            {/* Enquiry */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-stone-700 mb-4">📩 {t('sendEnquiry')}</h3>
              {success && <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold"><CheckCircle className="h-4 w-4"/> {t('successMsg')}</div>}
              {error  && <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs"><AlertCircle className="h-4 w-4"/> {error}</div>}
              <form onSubmit={handleEnquiry} className="space-y-3">
                {[
                  { name:'clientName',  label:`${t('fullName')} *`,    type:'text',  ph:t('fullName') },
                  { name:'clientEmail', label:`${t('email')} *`,        type:'email', ph:t('email') },
                  { name:'clientPhone', label:`${t('phoneNumber')} *`,  type:'tel',   ph:'+91 98765 43210' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.name]} name={f.name} required onChange={e => setForm(p=>({...p,[e.target.name]:e.target.value}))} placeholder={f.ph} className={inputCls}/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t('description')}</label>
                  <textarea name="message" rows={3} value={form.message} onChange={e => setForm(p=>({...p,message:e.target.value}))} placeholder={t('description')} className={inputCls+' resize-none'}/>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50" style={{ background:'linear-gradient(to right,#7c3aed,#6d28d9)' }}>
                  {submitting ? t('loading') : t('sendEnquiry')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Property3DDetail;
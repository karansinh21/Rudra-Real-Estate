import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';
import {
  AlertCircle, CheckCircle, ArrowLeft,
  Upload, X, ImagePlus, Loader2, Leaf, Plus,
  MapPin, Navigation, Map
} from 'lucide-react';

const API   = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  serif:'Georgia, serif', sans:"'DM Sans', sans-serif",
};

const isLandType = t => ['LAND','AGRICULTURAL','INDUSTRIAL'].includes(t);

const DEFAULT_LAND_FEATURES = [
  'Road Access','Water Source','Electricity','Fencing',
  'Irrigation','Flat Land','Corner Plot','NA Plot','Clear Title'
];

const Field = ({ label, required, children, hint }) => (
  <div>
    <label style={{ color:DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">
      {label} {required && <span style={{ color:DS.primary }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ color:DS.textMuted }} className="text-[11px] mt-1">{hint}</p>}
  </div>
);

const inputStyle = { background:DS.card, borderColor:DS.border, color:DS.text };

const geocodeAddress = async (address) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=in`);
    const data = await response.json();
    if (data&&data.length>0) return { lat:parseFloat(data[0].lat).toFixed(6), lng:parseFloat(data[0].lon).toFixed(6) };
    return null;
  } catch { return null; }
};

function MapPicker({ lat, lng, onChange }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markerRef   = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadMap = async () => {
      try {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id='leaflet-css'; link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        if (!window.L) {
          await new Promise((resolve, reject) => {
            if (document.getElementById('leaflet-js')) {
              let attempts=0;
              const ci=setInterval(()=>{ attempts++; if(window.L){clearInterval(ci);resolve();}else if(attempts>50){clearInterval(ci);reject(new Error('timeout'));} },100);
            } else {
              const script=document.createElement('script'); script.id='leaflet-js'; script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload=resolve; script.onerror=()=>reject(new Error('Failed')); document.head.appendChild(script);
            }
          });
        }
        if (!isMounted||!mapRef.current||mapInstance.current) return;
        const L=window.L, center=lat&&lng?[parseFloat(lat),parseFloat(lng)]:[22.3072,73.1812];
        const map=L.map(mapRef.current,{center,zoom:lat&&lng?16:12});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(map);
        const createPinIcon=()=>L.divIcon({className:'',iconSize:[40,48],iconAnchor:[20,48],html:`<div style="filter:drop-shadow(0 4px 8px rgba(200,75,0,0.4))"><svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28S40 35 40 20C40 8.95 31.05 0 20 0z" fill="#C84B00" stroke="white" stroke-width="2.5"/><circle cx="20" cy="20" r="9" fill="white" opacity="0.95"/></svg><div style="position:absolute;top:11px;left:50%;transform:translateX(-50%);font-size:14px">📍</div></div>`});
        if (lat&&lng) {
          const marker=L.marker([parseFloat(lat),parseFloat(lng)],{icon:createPinIcon(),draggable:true}).addTo(map);
          marker.on('dragend',e=>{const p=e.target.getLatLng();onChange(p.lat.toFixed(6),p.lng.toFixed(6));});
          markerRef.current=marker;
        }
        map.on('click',e=>{
          const pos=e.latlng;
          if(markerRef.current){markerRef.current.setLatLng(pos);}
          else{const marker=L.marker(pos,{icon:createPinIcon(),draggable:true}).addTo(map);marker.on('dragend',ev=>{const p=ev.target.getLatLng();onChange(p.lat.toFixed(6),p.lng.toFixed(6));});markerRef.current=marker;}
          onChange(pos.lat.toFixed(6),pos.lng.toFixed(6));
        });
        mapInstance.current=map;
        if (isMounted) setLoading(false);
      } catch(err) { if(isMounted){setError(err.message);setLoading(false);} }
    };
    loadMap();
    return () => { isMounted=false; if(mapInstance.current){try{mapInstance.current.remove();mapInstance.current=null;markerRef.current=null;}catch(e){}} };
  }, []);

  useEffect(() => {
    if (!mapInstance.current||!window.L||!lat||!lng) return;
    const L=window.L, newPos=[parseFloat(lat),parseFloat(lng)];
    if (markerRef.current){markerRef.current.setLatLng(newPos);mapInstance.current.flyTo(newPos,16,{duration:0.8});}
  }, [lat,lng,onChange]);

  if (error) return <div style={{ borderRadius:16, border:`1px solid ${DS.border}`, padding:'40px 20px', textAlign:'center', background:'#fffbf8' }}><AlertCircle size={32} color={DS.primary} style={{ margin:'0 auto 12px' }}/><p style={{ color:DS.text, fontWeight:600 }}>Map Loading Failed</p><p style={{ color:DS.textMuted, fontSize:12 }}>{error}</p></div>;
  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${DS.border}`, position:'relative' }}>
      <div ref={mapRef} style={{ width:'100%', height:300 }}/>
      {loading && <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}><Loader2 size={24} color={DS.primary} className="animate-spin"/><p style={{ color:DS.textMuted, fontSize:12 }}>Loading map...</p></div>}
    </div>
  );
}

const AddProperty = ({ defaultType }) => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { id }       = useParams();
  const { t }        = useLanguage();
  const fileInputRef = useRef(null);
  const isEdit       = Boolean(id);

  const [loading,         setLoading]         = useState(false);
  const [fetchingProp,    setFetchingProp]     = useState(isEdit);
  const [uploadingImages, setUploadingImages]  = useState(false);
  const [error,           setError]            = useState('');
  const [success,         setSuccess]          = useState(false);
  const [uploadProgress,  setUploadProgress]   = useState('');
  const [allFeatures,     setAllFeatures]      = useState(DEFAULT_LAND_FEATURES);
  const [featureInput,    setFeatureInput]     = useState('');
  const [showMap,         setShowMap]          = useState(false);
  const [geocoding,       setGeocoding]        = useState(false);

  const queryType   = new URLSearchParams(location.search).get('type');
  const initialType = defaultType||(queryType==='land'?'LAND':'RESIDENTIAL');

  const [form, setForm] = useState({
    title:'', description:'', propertyType:initialType,
    purpose:'SALE', price:'', area:'', areaUnit:'sqft',
    location:'', address:'', city:'Vadodara', state:'Gujarat',
    pincode:'', bedrooms:'', bathrooms:'', landFeatures:[], images:[],
    latitude:'', longitude:'',
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res  = await fetch(`${API}/properties/${id}`,{headers:{Authorization:`Bearer ${token()}`}});
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const p=data.property;
        let imgs=[];
        try{imgs=typeof p.images==='string'?JSON.parse(p.images):(p.images||[]);}catch{}
        const lf=p.features||[];
        setAllFeatures([...new Set([...DEFAULT_LAND_FEATURES,...lf])]);
        setForm({ title:p.title||'', description:p.description||'', propertyType:p.type||initialType, purpose:p.purpose||'SALE', price:p.price||'', area:p.area||'', areaUnit:p.areaUnit||'sqft', location:p.address||'', address:p.address||'', city:p.city||'Vadodara', state:p.state||'Gujarat', pincode:p.pincode||'', bedrooms:p.bedrooms||'', bathrooms:p.bathrooms||'', landFeatures:lf, images:imgs, latitude:p.latitude||'', longitude:p.longitude||'' });
        if (p.latitude&&p.longitude) setShowMap(true);
      } catch(e) { setError('Property load failed: '+e.message); }
      finally { setFetchingProp(false); }
    };
    load();
  }, [id,initialType]);

  const set          = (field,val) => { setForm(p=>({...p,[field]:val})); setError(''); };
  const handleChange = e => set(e.target.name,e.target.value);

  const toggleFeature = f => setForm(p=>({ ...p, landFeatures:p.landFeatures.includes(f)?p.landFeatures.filter(x=>x!==f):[...p.landFeatures,f] }));
  const addFeature    = () => { const f=featureInput.trim(); if(!f)return; if(!allFeatures.includes(f))setAllFeatures(p=>[...p,f]); if(!form.landFeatures.includes(f))toggleFeature(f); setFeatureInput(''); };
  const deleteFeature = f => { setAllFeatures(p=>p.filter(x=>x!==f)); setForm(p=>({...p,landFeatures:p.landFeatures.filter(x=>x!==f)})); };

  const handleGeocode = async () => {
    const addr=`${form.location||form.address}, ${form.city}, ${form.state}, India`.trim();
    if (!form.city){setError(`${t('city')} first enter karo`);return;}
    setGeocoding(true); setError('');
    try {
      const coords=await geocodeAddress(addr);
      if (coords){set('latitude',coords.lat);set('longitude',coords.lng);setShowMap(true);}
      else{setError('Location not found. Click on map manually.');setShowMap(true);}
    } catch{setError('Geocoding failed.');setShowMap(true);}
    finally{setGeocoding(false);}
  };

  const handleFileUpload = async e => {
    const files=Array.from(e.target.files);
    if (!files.length) return;
    if (form.images.length+files.length>10){setError('Maximum 10 images allowed');return;}
    setUploadingImages(true); setUploadProgress(`Uploading ${files.length} image(s)...`);
    try {
      const fd=new FormData();
      files.forEach(f=>fd.append('images',f));
      const res  =await fetch(`${API}/upload/multiple`,{method:'POST',headers:{Authorization:`Bearer ${token()}`},body:fd});
      const data =await res.json();
      if (!res.ok) throw new Error(data.error||'Upload failed');
      setForm(p=>({...p,images:[...p.images,...data.images]}));
      setUploadProgress(`✓ ${data.count} image(s) uploaded`);
      setTimeout(()=>setUploadProgress(''),3000);
    } catch(err){setError(`Upload failed: ${err.message}`);setUploadProgress('');}
    finally{setUploadingImages(false);if(fileInputRef.current)fileInputRef.current.value='';}
  };

  const removeImage = async index => {
    const img=form.images[index];
    setForm(p=>({...p,images:p.images.filter((_,i)=>i!==index)}));
    if (img?.publicId){try{await fetch(`${API}/upload/delete`,{method:'DELETE',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},body:JSON.stringify({publicId:img.publicId})});}catch{}}
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title||!form.price||!form.location){setError(`${t('name')}, ${t('price')} and ${t('location')} are required`);return;}
    setLoading(true);setError('');
    const isLand=isLandType(form.propertyType);
    const payload={
      title:form.title,description:form.description||'',type:form.propertyType,purpose:form.purpose,
      price:Number(form.price),area:Number(form.area),address:form.location||form.address||'',
      city:form.city,state:form.state,pincode:form.pincode||'',
      features:isLand?(form.areaUnit!=='sqft'?[`areaUnit:${form.areaUnit}`,...form.landFeatures]:form.landFeatures):[],
      images:form.images||[],
      latitude:form.latitude?Number(form.latitude):null,longitude:form.longitude?Number(form.longitude):null,
      ...(!isLand&&{bedrooms:form.bedrooms?Number(form.bedrooms):undefined,bathrooms:form.bathrooms?Number(form.bathrooms):undefined}),
    };
    try {
      const url=isEdit?`${API}/properties/${id}`:`${API}/properties`;
      const res=await fetch(url,{method:isEdit?'PUT':'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token()}`},body:JSON.stringify(payload)});
      const data=await res.json();
      if (!res.ok) throw new Error(data.error||'Failed');
      setSuccess(true);
      setTimeout(()=>navigate('/broker/properties'),1800);
    } catch(err){setError(err.message||t('errorMsg'));}
    finally{setLoading(false);}
  };

  const isLand=isLandType(form.propertyType);
  const iC="w-full border rounded-xl px-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none transition-all";
  const sC=iC+" cursor-pointer";

  if (fetchingProp) return <div style={{ background:DS.bg }} className="flex items-center justify-center h-96"><Loader2 style={{ color:DS.primary }} className="w-7 h-7 animate-spin"/></div>;

  return (
    <div style={{ background:DS.bg, fontFamily:DS.sans }} className="px-6 lg:px-10 py-8 max-w-4xl mx-auto min-h-screen">
      <style>{`@keyframes mapSlideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}} @keyframes pinDrop{from{opacity:0;transform:translateY(-20px) scale(0.8)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/broker/properties')} style={{ color:DS.textMuted }} className="p-2 rounded-xl hover:opacity-70"><ArrowLeft className="w-5 h-5"/></button>
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ color:DS.text, fontFamily:DS.serif }} className="text-2xl font-bold">
              {isEdit?`${t('edit')} ${t('properties')}`:`Add ${t('properties')}`}
            </h1>
            {isLand && <span style={{ background:'#F0FDF4', color:'#15803D', borderColor:'#BBF7D0' }} className="flex items-center gap-1 text-xs font-bold px-3 py-1 border rounded-full"><Leaf className="w-3 h-3"/> Land Mode</span>}
          </div>
          <p style={{ color:DS.textMuted }} className="text-sm mt-0.5">{isEdit?`${t('edit')} property details`:`Fill in the details to list a new property`}</p>
        </div>
      </div>

      {error   && <div style={{ background:DS.primaryLight, borderColor:DS.primaryBorder, color:DS.primary }} className="flex items-center gap-2 border px-4 py-3 rounded-xl text-sm mb-5"><AlertCircle className="w-4 h-4 shrink-0"/> {error}</div>}
      {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5"><CheckCircle className="w-4 h-4 shrink-0"/>{isEdit?`${t('edit')}d!`:'Created!'} Redirecting...</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div style={{ background:DS.card, borderColor:DS.border }} className="rounded-2xl border p-6">
          <h2 style={{ color:DS.text, fontFamily:DS.serif, borderColor:DS.border }} className="font-bold text-base mb-5 pb-3 border-b">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label={`${t('properties')} Title`} required>
                <input name="title" value={form.title} onChange={handleChange} required placeholder={isLand?'2 Acre Agricultural Land in Vadodara':'3 BHK Apartment in Alkapuri'} style={inputStyle} className={iC}/>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label={t('description')}>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder={t('description')} style={inputStyle} className={iC+' resize-none'}/>
              </Field>
            </div>
            <Field label={`${t('properties')} Type`} required>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} style={inputStyle} className={sC}>
                <option value="RESIDENTIAL">🏠 {t('residential')}</option>
                <option value="COMMERCIAL">🏢 {t('commercial')}</option>
                <option value="LAND">🌍 Land / Plot</option>
                <option value="AGRICULTURAL">🌱 {t('agricultural')}</option>
                <option value="INDUSTRIAL">🏭 {t('industrial')}</option>
              </select>
            </Field>
            <Field label={t('purpose')} required>
              <select name="purpose" value={form.purpose} onChange={handleChange} style={inputStyle} className={sC}>
                <option value="SALE">{t('forSale')}</option>
                <option value="RENT">{t('forRent')}</option>
              </select>
            </Field>
            <Field label={`${t('price')} (₹)`} required>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" placeholder={isLand?'2500000':'5000000'} required style={inputStyle} className={iC}/>
            </Field>
            <Field label={`${t('area')} (${t('sqft')})`} required>
              <div className="flex gap-2">
                <input type="number" name="area" value={form.area} onChange={handleChange} min="0" placeholder={isLand?'2':'1200'} required style={inputStyle} className={iC}/>
                {isLand && (
                  <select name="areaUnit" value={form.areaUnit} onChange={handleChange} style={{ ...inputStyle, borderColor:DS.border }} className="px-3 py-2.5 border rounded-xl text-sm shrink-0 focus:outline-none cursor-pointer">
                    <option value="sqft">Sq Ft</option><option value="sqmt">Sq Mt</option><option value="acre">Acre</option><option value="bigha">Bigha</option><option value="guntha">Guntha</option><option value="hectare">Hectare</option>
                  </select>
                )}
              </div>
            </Field>
            {!isLand && (<>
              <Field label={t('bedrooms')}><input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} min="0" placeholder="3" style={inputStyle} className={iC}/></Field>
              <Field label={t('bathrooms')}><input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} min="0" placeholder="2" style={inputStyle} className={iC}/></Field>
            </>)}
            {isLand && (
              <div className="md:col-span-2">
                <Field label={t('amenities')}>
                  <div className="flex gap-2 mb-3">
                    <input value={featureInput} onChange={e=>setFeatureInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addFeature())} placeholder="Add custom feature..." style={inputStyle} className={iC}/>
                    <button type="button" onClick={addFeature} style={{ background:DS.primary }} className="flex items-center gap-1.5 px-4 py-2.5 text-white rounded-xl text-xs font-bold shrink-0 hover:opacity-90">
                      <Plus className="w-3.5 h-3.5"/> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allFeatures.map(f => {
                      const checked=form.landFeatures.includes(f);
                      return (
                        <div key={f} style={checked?{background:DS.primaryLight,borderColor:DS.primary,color:DS.primary}:{background:DS.card,borderColor:DS.border,color:DS.textSub}} className="flex items-center rounded-xl border text-xs font-semibold transition-all">
                          <button type="button" onClick={()=>toggleFeature(f)} className="pl-3 pr-2 py-2"><span className="mr-1">{checked?'✓':'○'}</span>{f}</button>
                          <button type="button" onClick={()=>deleteFeature(f)} className="pr-2.5 py-2 hover:text-red-400"><X className="w-3 h-3"/></button>
                        </div>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div style={{ background:DS.card, borderColor:DS.border }} className="rounded-2xl border p-6">
          <h2 style={{ color:DS.text, fontFamily:DS.serif, borderColor:DS.border }} className="font-bold text-base mb-5 pb-3 border-b">{t('location')} Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Area / Locality" required><input type="text" name="location" value={form.location} onChange={handleChange} required placeholder={isLand?'Padra, Karjan':'Alkapuri, Race Course'} style={inputStyle} className={iC}/></Field>
            <Field label={t('city')} required><input type="text" name="city" value={form.city} onChange={handleChange} required style={inputStyle} className={iC}/></Field>
            <Field label={t('state')} required><input type="text" name="state" value={form.state} onChange={handleChange} required style={inputStyle} className={iC}/></Field>
            <Field label="Pincode"><input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="390001" style={inputStyle} className={iC}/></Field>
            <div className="md:col-span-2"><Field label={t('address')}><input type="text" name="address" value={form.address} onChange={handleChange} placeholder={t('address')} style={inputStyle} className={iC}/></Field></div>
          </div>

          <div style={{ marginTop:20, borderTop:`1px solid ${DS.border}`, paddingTop:18 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ color:DS.text }} className="text-sm font-bold flex items-center gap-2">
                  <Map className="w-4 h-4" style={{ color:DS.primary }}/> Map Location
                  {form.latitude&&form.longitude&&<span style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }} className="text-[10px] font-bold px-2 py-0.5 rounded-lg ml-1">📍 Live GPS</span>}
                </p>
                <p style={{ color:DS.textMuted }} className="text-xs mt-0.5">Click on map or auto-detect from {t('address')}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleGeocode} disabled={geocoding} style={{ background:DS.primaryLight, color:DS.primary, borderColor:DS.primaryBorder }} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border rounded-xl hover:opacity-80 disabled:opacity-50">
                  {geocoding?<Loader2 className="w-3 h-3 animate-spin"/>:<Navigation className="w-3 h-3"/>}
                  {geocoding?t('loading'):'Auto-detect'}
                </button>
                <button type="button" onClick={()=>setShowMap(v=>!v)} style={{ background:showMap?DS.primary:DS.card, color:showMap?'#fff':DS.textSub, borderColor:showMap?DS.primary:DS.border }} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border rounded-xl">
                  <MapPin className="w-3 h-3"/>{showMap?'Hide Map':'Open Map'}
                </button>
              </div>
            </div>
            {form.latitude&&form.longitude&&(
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2.5 mb-3 text-xs" style={{ background:DS.bg, border:`1px solid ${DS.border}` }}>
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color:DS.primary }}/>
                <span style={{ color:DS.textSub }} className="font-medium">Lat: <strong style={{ color:DS.text }}>{form.latitude}</strong> · Lng: <strong style={{ color:DS.text }}>{form.longitude}</strong></span>
                <button type="button" onClick={()=>{set('latitude','');set('longitude','');}} style={{ color:DS.textMuted }} className="ml-auto hover:text-red-400"><X className="w-3.5 h-3.5"/></button>
              </div>
            )}
            {showMap && (
              <div style={{ animation:'mapSlideIn 0.3s ease both' }}>
                <MapPicker lat={form.latitude} lng={form.longitude} onChange={(la,lo)=>{set('latitude',la);set('longitude',lo);}}/>
                <p style={{ color:DS.textMuted }} className="text-[11px] mt-2 text-center">Click on map or drag pin (OpenStreetMap)</p>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        <div style={{ background:DS.card, borderColor:DS.border }} className="rounded-2xl border p-6">
          <h2 style={{ color:DS.text, fontFamily:DS.serif }} className="font-bold text-base mb-1">{isLand?'Land':t('properties')} Photos</h2>
          <p style={{ color:DS.textMuted }} className="text-xs mb-4">Up to 10 photos.</p>
          <div onClick={()=>!uploadingImages&&fileInputRef.current?.click()} style={{ borderColor:DS.border }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${uploadingImages?'border-orange-300 bg-orange-50':'hover:border-orange-300 hover:bg-orange-50/20'}`}>
            {uploadingImages
              ? <div className="flex flex-col items-center"><Loader2 style={{ color:DS.primary }} className="w-9 h-9 animate-spin mb-2"/><p style={{ color:DS.primary }} className="font-semibold text-sm">{uploadProgress}</p></div>
              : <div className="flex flex-col items-center"><ImagePlus style={{ color:DS.textMuted }} className="w-10 h-10 mb-2"/><p style={{ color:DS.text }} className="font-semibold text-sm">Click to upload photos</p><p style={{ color:DS.textMuted }} className="text-xs mt-1">JPG, PNG, WebP · Max 5MB</p><div style={{ background:DS.primary }} className="mt-3 px-5 py-2 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"><Upload className="w-3.5 h-3.5"/> Choose Files</div></div>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden"/>
          {uploadProgress&&!uploadingImages&&<p className="mt-2 text-emerald-600 text-xs font-semibold">{uploadProgress}</p>}
          {form.images.length>0&&(
            <div className="mt-4">
              <p style={{ color:DS.textMuted }} className="text-xs font-semibold mb-3">{form.images.length} photo(s) added</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {form.images.map((img,i) => (
                  <div key={i} className="relative group aspect-video bg-stone-100 rounded-xl overflow-hidden">
                    <img src={img.thumbnail||img.url||img} alt={`${i+1}`} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <button type="button" onClick={()=>removeImage(i)} className="bg-red-500 text-white p-1.5 rounded-lg"><X className="w-3.5 h-3.5"/></button>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">{i+1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pb-4">
          <button type="submit" disabled={loading||uploadingImages} style={{ background:DS.primary }}
            className="flex items-center gap-2 text-white font-bold px-7 py-3 rounded-xl text-sm disabled:opacity-50 hover:opacity-90">
            {loading?<><Loader2 className="w-4 h-4 animate-spin"/> {t('loading')}</>:<><CheckCircle className="w-4 h-4"/> {isEdit?`${t('edit')}`:(isLand?'List Land':`Create ${t('properties')}`)}</>}
          </button>
          <button type="button" onClick={()=>navigate('/broker/properties')} style={{ borderColor:DS.border, color:DS.textSub }} className="px-7 py-3 rounded-xl border text-sm font-semibold hover:opacity-70">
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Save, CheckCircle, AlertCircle, Loader2, Camera, Edit3 } from 'lucide-react';
import BrokerLayout from './BrokerLayout';
import { useLanguage } from '../../utils/LanguageContext';

const API   = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const Input = ({ label, icon:Icon, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"/>}
      <input {...props} className={`w-full bg-white border border-stone-200 rounded-xl py-2.5 text-slate-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all ${Icon?'pl-10 pr-4':'px-4'}`}/>
    </div>
  </div>
);

const BrokerProfile = () => {
  const { t } = useLanguage();
  const [profile,  setProfile]  = useState(null);
  const [form,     setForm]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/brokers/me/profile`,{headers:{Authorization:`Bearer ${token()}`}});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to load profile');
      setProfile(data.broker);
      setForm({
        name:data.broker.name||'', phone:data.broker.phone||'',
        address:data.broker.address||'', city:data.broker.city||'',
        state:data.broker.state||'', avatar:data.broker.avatar||'',
        professionalDetails:{
          experience:data.broker.professionalDetails?.experience||'',
          specialization:data.broker.professionalDetails?.specialization||'',
          licenseNo:data.broker.professionalDetails?.licenseNo||'',
          about:data.broker.professionalDetails?.about||'',
        }
      });
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleChange      = (field,value) => { setForm(prev=>({...prev,[field]:value})); setError(''); };
  const handleProfChange  = (field,value) => { setForm(prev=>({...prev,professionalDetails:{...prev.professionalDetails,[field]:value}})); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${API}/brokers/me/profile`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token()}`},body:JSON.stringify(form)});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Update failed');
      setProfile(data.broker); setSuccess(true); setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
      const u = localStorage.getItem('user');
      if (u) localStorage.setItem('user', JSON.stringify({...JSON.parse(u), name:data.broker.name}));
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({ name:profile.name||'', phone:profile.phone||'', address:profile.address||'', city:profile.city||'', state:profile.state||'', avatar:profile.avatar||'', professionalDetails:profile.professionalDetails||{} });
    }
    setEditMode(false); setError('');
  };

  if (loading) return <BrokerLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-7 h-7 text-indigo-400 animate-spin"/></div></BrokerLayout>;

  const STATUS_BADGE = { ACTIVE:'bg-emerald-50 text-emerald-700 border-emerald-200', PENDING:'bg-amber-50 text-amber-700 border-amber-200', REJECTED:'bg-red-50 text-red-700 border-red-200', BLOCKED:'bg-stone-100 text-stone-600 border-stone-200' };

  return (
    <BrokerLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My {t('myAccount')}</h1>
            <p className="text-stone-400 text-sm mt-0.5">Personal ane professional details</p>
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all">
              <Edit3 className="w-4 h-4"/> {t('edit')} Profile
            </button>
          )}
        </div>

        {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5"><CheckCircle className="w-4 h-4 shrink-0"/> {t('successMsg')}</div>}
        {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5"><AlertCircle className="w-4 h-4 shrink-0"/> {error}</div>}

        <div className="space-y-5">
          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-indigo-100">
                  {form.avatar
                    ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-indigo-600 font-bold text-3xl">{profile?.name?.[0]?.toUpperCase()||'B'}</span></div>}
                </div>
                {editMode && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center cursor-pointer"><Camera className="w-3 h-3 text-white"/></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{profile?.name}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[profile?.status]||STATUS_BADGE.PENDING}`}>{profile?.status}</span>
                  {profile?.isVerified && <span className="flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> Verified</span>}
                </div>
                <p className="text-stone-500 text-sm mt-1">{profile?.email}</p>
              </div>
            </div>
            {editMode && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <Input label="Avatar URL" icon={Camera} value={form.avatar} placeholder="https://..." onChange={e=>handleChange('avatar',e.target.value)}/>
              </div>
            )}
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500"/> Personal Details</h3>
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t('fullName')}   icon={User}   value={form.name}    onChange={e=>handleChange('name',e.target.value)}    placeholder={t('fullName')}/>
                <Input label={t('phoneNumber')} icon={Phone}  value={form.phone}   onChange={e=>handleChange('phone',e.target.value)}   placeholder="+91 98765 43210" type="tel"/>
                <Input label={t('city')}        icon={MapPin} value={form.city}    onChange={e=>handleChange('city',e.target.value)}    placeholder={t('city')}/>
                <Input label={t('state')}                     value={form.state}   onChange={e=>handleChange('state',e.target.value)}   placeholder={t('state')}/>
                <div className="sm:col-span-2">
                  <Input label={t('address')}   icon={MapPin} value={form.address} onChange={e=>handleChange('address',e.target.value)} placeholder={t('address')}/>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label:t('email'),       value:profile?.email,   icon:Mail      },
                  { label:t('phoneNumber'), value:profile?.phone,   icon:Phone     },
                  { label:t('city'),        value:profile?.city,    icon:MapPin    },
                  { label:t('state'),       value:profile?.state,   icon:MapPin    },
                  { label:t('address'),     value:profile?.address, icon:Building2, full:true },
                ].map(({label,value,icon:Icon,full}) => (
                  <div key={label} className={full?'sm:col-span-2':''}>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-stone-400 shrink-0"/>
                      <p className="text-sm text-slate-900">{value||<span className="text-stone-400 italic">Not set</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500"/> Professional Details</h3>
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Experience (years)" value={form.professionalDetails?.experience||''} onChange={e=>handleProfChange('experience',e.target.value)} placeholder="e.g. 5 years"/>
                <Input label="License / RERA No." value={form.professionalDetails?.licenseNo||''} onChange={e=>handleProfChange('licenseNo',e.target.value)} placeholder="RERA/Broker License"/>
                <div className="sm:col-span-2">
                  <Input label={t('specialization')} value={form.professionalDetails?.specialization||''} onChange={e=>handleProfChange('specialization',e.target.value)} placeholder="e.g. Residential, Commercial"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">{t('description')}</label>
                  <textarea value={form.professionalDetails?.about||''} onChange={e=>handleProfChange('about',e.target.value)} rows={3} placeholder="Describe yourself..." className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 transition-all resize-none"/>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label:'Experience',         value:profile?.professionalDetails?.experience     },
                  { label:'License / RERA',     value:profile?.professionalDetails?.licenseNo      },
                  { label:t('specialization'),  value:profile?.professionalDetails?.specialization },
                ].map(({label,value}) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-slate-900">{value||<span className="text-stone-400 italic">Not set</span>}</p>
                  </div>
                ))}
                {profile?.professionalDetails?.about && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">{t('description')}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{profile.professionalDetails.about}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {editMode && (
            <div className="flex gap-3 pt-1">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-200 disabled:opacity-50 transition-all">
                {saving?<><Loader2 className="w-4 h-4 animate-spin"/> {t('loading')}</>:<><Save className="w-4 h-4"/> {t('save')}</>}
              </button>
              <button onClick={handleCancel} disabled={saving} className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50 transition-all">
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </BrokerLayout>
  );
};

export default BrokerProfile;
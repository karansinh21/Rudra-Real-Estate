import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Users, Eye, Edit, Trash2,
  LogOut, MapPin, IndianRupee, Layers, TrendingUp
} from 'lucide-react';
import { propertyAPI, enquiryAPI } from '../../services/api';

const formatPrice = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(2)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.thumbnail || null;
};

const Skeleton = () => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-slate-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-8 bg-slate-100 rounded mt-3" />
    </div>
  </div>
);

const InteractiveBrokerDashboard = () => {
  const navigate = useNavigate();

  const [properties,   setProperties]   = useState([]);
  const [enquiries,    setEnquiries]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [user,         setUser]         = useState(null);
  const [deleting,     setDeleting]     = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propRes, enqRes] = await Promise.allSettled([
        propertyAPI.getMyProperties(),
        enquiryAPI.getAll(),
      ]);
      if (propRes.status === 'fulfilled') setProperties(propRes.value.data?.properties || []);
      if (enqRes.status === 'fulfilled')  setEnquiries(enqRes.value.data?.enquiries  || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Property delete karvu che?')) return;
    setDeleting(id);
    try {
      await propertyAPI.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Delete karva ma error aavyo.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = [
    { label: 'Total Properties', value: properties.length,                        icon: Building2,  color: 'bg-blue-50 text-blue-600'   },
    { label: 'Enquiries',        value: enquiries.length,                          icon: Users,      color: 'bg-purple-50 text-purple-600'},
    { label: 'Available',        value: properties.filter(p=>p.status==='AVAILABLE').length, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600'},
    { label: 'Land Properties',  value: properties.filter(p=>['LAND','AGRICULTURAL'].includes(p.type)).length, icon: Layers, color: 'bg-amber-50 text-amber-600'},
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Broker Dashboard</h1>
              <p className="text-xs text-slate-400">Welcome, {user?.name || 'Broker'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/broker/add-property')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" /> Add Property
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Properties section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">My Properties</h2>
          <button onClick={() => navigate('/broker/properties')}
            className="text-sm text-blue-600 hover:underline font-semibold">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Properties Yet</h3>
            <p className="text-slate-400 text-sm mb-5">Properties add karo ane buyers sudhi pahoncho</p>
            <button onClick={() => navigate('/broker/add-property')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
              <Plus className="w-4 h-4" /> Add First Property
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.slice(0, 9).map((property) => {
              let imgSrc = null;
              try {
                const raw = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
                if (Array.isArray(raw) && raw.length > 0) imgSrc = getImageUrl(raw[0]);
              } catch {}

              const isLand = ['LAND','AGRICULTURAL','INDUSTRIAL'].includes(property.type);
              const typeBg = isLand ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';

              return (
                <div key={property.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                  {/* Image */}
                  <div className="relative h-44 bg-slate-100">
                    {imgSrc ? (
                      <img src={imgSrc} alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${typeBg}`}>
                      {property.type?.charAt(0) + property.type?.slice(1).toLowerCase()}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      property.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                    }`}>
                      {property.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{[property.city, property.state].filter(Boolean).join(', ')}</span>
                    </div>
                    <p className="text-blue-600 font-bold text-sm mb-4">{formatPrice(property.price)}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => navigate(`/property/${property.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => navigate(`/broker/edit-property/${property.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold transition-all">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(property.id)} disabled={deleting === property.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-all disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveBrokerDashboard;
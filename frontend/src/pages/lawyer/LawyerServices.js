import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { legalAPI } from '../../services/api';
import {
  FileText, Plus, Edit2, Trash2, CheckCircle, IndianRupee,
  Settings, BarChart2, Star, LogOut, Scale, X, Save, AlertCircle, Home, TreePine
} from 'lucide-react';

const DS = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const CATEGORIES = [
  { id: 'property', label: 'Property Legal', icon: Home },
  { id: 'land',     label: 'Land & Plot',    icon: TreePine },
];

const Sidebar = ({ active }) => {
  const links = [
    { label: 'Dashboard', to: '/lawyer/dashboard', icon: BarChart2 },
    { label: 'Requests',  to: '/lawyer/requests',  icon: FileText  },
    { label: 'Services',  to: '/lawyer/services',  icon: Star      },
    { label: 'Settings',  to: '/lawyer/settings',  icon: Settings  },
  ];
  return (
    <aside style={{ background: DS.card, borderColor: DS.border }}
      className="hidden lg:flex flex-col w-64 min-h-screen border-r px-5 py-8">
      <div className="flex items-center gap-3 mb-10 px-1">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow"
          style={{ background: DS.primary }}>
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <span style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-base block leading-none">Rudra</span>
          <span style={{ color: DS.textMuted }} className="text-[10px] font-semibold tracking-widest uppercase">Legal Portal</span>
        </div>
      </div>
      <p style={{ color: DS.textMuted }} className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2">Menu</p>
      <nav className="flex-1 space-y-0.5">
        {links.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to}
            style={active === label
              ? { background: DS.primary, color: '#fff' }
              : { color: DS.textSub }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80">
            <Icon className="w-4 h-4" />
            {label}
            {active === label && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
          </Link>
        ))}
      </nav>
      <div style={{ background: DS.bg, borderColor: DS.border }} className="mt-6 p-3 rounded-2xl border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: DS.primary }}>RL</div>
          <div className="flex-1 min-w-0">
            <p style={{ color: DS.text }} className="text-xs font-semibold truncate">Rudra Legal</p>
            <p style={{ color: DS.textMuted }} className="text-[10px]">Advocate</p>
          </div>
          <button style={{ color: DS.textMuted }} className="hover:text-red-400 transition-colors"><LogOut className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </aside>
  );
};

const ServiceModal = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: service?.name || service?.serviceName || '',
    description: service?.description || '',
    price: service?.price || '',
    category: service?.category || 'property',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) { setError('Service name jaruri che.'); return; }
    if (!form.description.trim()) { setError('Description jaruri che.'); return; }
    if (!form.price || isNaN(form.price)) { setError('Valid price nakho.'); return; }
    setSaving(true);
    try {
      await onSave({ id: service?.id, name: form.name.trim(), description: form.description.trim(), price: parseFloat(form.price), category: form.category });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Save karva ma error aavyo.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-3xl p-7 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-lg">{service ? 'Edit Service' : 'New Service'}</h3>
            <p style={{ color: DS.textMuted }} className="text-xs mt-0.5">{service ? 'Update service details' : 'Add a legal service'}</p>
          </div>
          <button onClick={onClose} style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
            className="w-8 h-8 flex items-center justify-center rounded-xl border hover:opacity-70 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label style={{ color: DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Service Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Rent Agreement"
              style={{ borderColor: DS.border, color: DS.text }}
              className="w-full bg-white border rounded-xl px-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none" />
          </div>
          <div>
            <label style={{ color: DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Category *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setForm({...form, category: cat.id})}
                  style={form.category === cat.id
                    ? { background: DS.primaryLight, borderColor: DS.primary, color: DS.primary }
                    : { background: DS.bg, borderColor: DS.border, color: DS.textSub }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                  <cat.icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={3} placeholder="What this service includes..."
              style={{ borderColor: DS.border, color: DS.text }}
              className="w-full bg-white border rounded-xl px-4 py-2.5 text-sm placeholder-stone-400 resize-none focus:outline-none" />
          </div>
          <div>
            <label style={{ color: DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Price (₹) *</label>
            <div className="relative">
              <span style={{ color: DS.textMuted }} className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold">₹</span>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                placeholder="2000" style={{ borderColor: DS.border, color: DS.text }}
                className="w-full bg-white border rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        {error && (
          <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder, color: DS.primary }}
            className="flex items-center gap-2 mt-4 text-xs border px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} style={{ borderColor: DS.border, color: DS.textSub }}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:opacity-70 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ background: DS.primary }}
            className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LawyerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('property');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchServices(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await legalAPI.getAllServices();
      const raw = res.data?.services || res.data || [];
      setServices(raw.map(s => ({ ...s, serviceName: s.name || s.serviceName, category: s.category || 'property' })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await legalAPI.updateService(data.id, { name: data.name, description: data.description, price: data.price, category: data.category });
      showToast('✅ Service updated!');
    } else {
      await legalAPI.createService({ name: data.name, description: data.description, price: data.price, category: data.category });
      showToast('✅ Service added!');
    }
    await fetchServices();
  };

  const handleDelete = async (id) => {
    try {
      await legalAPI.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      showToast('🗑️ Deleted!');
    } catch (e) { console.error(e); } finally { setDeleteConfirm(null); }
  };

  const filteredServices = services.filter(s => (s.category || 'property') === activeCat);

  if (loading) return (
    <div style={{ background: DS.bg }} className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: DS.border, borderTopColor: DS.primary }} />
    </div>
  );

  return (
    <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }} className="flex min-h-screen">
      <Sidebar active="Services" />

      {toast && (
        <div style={{ background: DS.primary }}
          className="fixed top-5 right-5 z-50 flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {modalOpen && (
        <ServiceModal service={editingService}
          onClose={() => { setModalOpen(false); setEditingService(null); }}
          onSave={handleSave} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div style={{ background: DS.card, borderColor: DS.border }} className="border rounded-3xl p-7 w-full max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-lg mb-1">Delete Service?</p>
            <p style={{ color: DS.textMuted }} className="text-sm mb-6">Aa action undo nahi thay.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} style={{ borderColor: DS.border, color: DS.textSub }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-sm font-bold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <header style={{ background: 'rgba(249,246,242,0.85)', borderColor: DS.border }}
          className="sticky top-0 z-10 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between">
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-lg font-bold">My Services</h1>
            <p style={{ color: DS.textMuted }} className="text-xs mt-0.5">{services.length} total</p>
          </div>
          <button onClick={() => { setEditingService(null); setModalOpen(true); }}
            style={{ background: DS.primary }}
            className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </header>

        <div className="px-8 py-7">
          {/* Category Tabs */}
          <div className="flex gap-3 mb-6">
            {CATEGORIES.map(cat => {
              const active = activeCat === cat.id;
              const count = services.filter(s => (s.category || 'property') === cat.id).length;
              return (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                  style={active
                    ? { background: DS.primary, borderColor: DS.primary, color: '#fff' }
                    : { background: DS.card, borderColor: DS.border, color: DS.textSub }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border">
                  <cat.icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={active ? { background: 'rgba(255,255,255,0.2)' } : { background: DS.bg, color: DS.textMuted }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info bar */}
          <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
            className="flex items-center justify-between px-5 py-3 rounded-2xl mb-5 border">
            <p style={{ color: DS.primary }} className="text-sm font-bold">
              {CATEGORIES.find(c => c.id === activeCat)?.label}
            </p>
            <span style={{ color: DS.primary, background: DS.primaryLight, borderColor: DS.primaryBorder }}
              className="text-xs font-bold px-3 py-1 rounded-xl border">
              {filteredServices.length} services
            </span>
          </div>

          {/* Grid */}
          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
                className="relative w-20 h-20 rounded-3xl border flex items-center justify-center mb-5">
                <Star style={{ color: DS.primary }} className="w-9 h-9" />
                <div style={{ background: DS.primary }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-base mb-1">No services yet</p>
              <p style={{ color: DS.textMuted }} className="text-sm mb-6">Add services for {CATEGORIES.find(c => c.id === activeCat)?.label}</p>
              <button onClick={() => { setEditingService(null); setModalOpen(true); }}
                style={{ background: DS.primary }} className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service, i) => (
                <div key={service.id} style={{ background: DS.card, borderColor: DS.border }}
                  className="group border rounded-3xl p-5 flex flex-col gap-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ background: DS.primaryLight, color: DS.primary, borderColor: DS.primaryBorder }}
                        className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <p style={{ color: DS.textMuted }} className="text-[10px] font-bold uppercase tracking-widest">Service</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingService(service); setModalOpen(true); }}
                        style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border hover:text-orange-600 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(service.id)}
                        style={{ background: DS.bg, borderColor: DS.border, color: DS.textMuted }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border hover:text-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 style={{ color: DS.text }} className="font-bold text-sm mb-1.5">{service.serviceName || service.name}</h3>
                    {service.description && <p style={{ color: DS.textMuted }} className="text-xs leading-relaxed line-clamp-2">{service.description}</p>}
                  </div>
                  <div style={{ borderColor: DS.border }} className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1 font-bold text-base text-emerald-700">
                      <IndianRupee className="w-4 h-4" />
                      {Number(service.price).toLocaleString()}
                    </div>
                    <button onClick={() => { setEditingService(service); setModalOpen(true); }}
                      style={{ color: DS.primary, background: DS.primaryLight, borderColor: DS.primaryBorder }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border hover:opacity-80 transition-all">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              ))}
              {/* Add card */}
              <button onClick={() => { setEditingService(null); setModalOpen(true); }}
                style={{ borderColor: DS.border }}
                className="group border-2 border-dashed rounded-3xl p-5 flex flex-col items-center justify-center gap-3 min-h-[180px] transition-all hover:border-orange-300">
                <div style={{ background: DS.bg }} className="w-11 h-11 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-orange-50">
                  <Plus style={{ color: DS.textMuted }} className="w-5 h-5 group-hover:text-orange-600 transition-colors" />
                </div>
                <p style={{ color: DS.textMuted }} className="text-sm font-bold group-hover:text-orange-600 transition-colors">Add New Service</p>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerServices;
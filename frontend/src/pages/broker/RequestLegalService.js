import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, AlertCircle, CheckCircle, ArrowLeft, Upload, X,
  User, Phone, CreditCard, MapPin, Calendar, Loader2, Paperclip, File
} from 'lucide-react';
import BrokerLayout from './BrokerLayout';

const API   = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DS = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const Field = ({ label, required, icon: Icon, children }) => (
  <div>
    <label style={{ color: DS.textMuted }} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">
      {Icon && <Icon className="inline w-3.5 h-3.5 mr-1 mb-0.5" />}
      {label} {required && <span style={{ color: DS.primary }}>*</span>}
    </label>
    {children}
  </div>
);

const iC = {
  base: "w-full border rounded-xl px-4 py-2.5 text-sm placeholder-stone-400 focus:outline-none transition-all",
  style: { background: DS.card, borderColor: DS.border, color: DS.text }
};

const Section = ({ title, icon: Icon, subtitle, children }) => (
  <div style={{ background: DS.card, borderColor: DS.border }} className="rounded-2xl border p-6">
    <div style={{ borderColor: DS.border }} className="mb-4 pb-3 border-b">
      <h2 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="font-bold text-base flex items-center gap-2">
        {Icon && <Icon style={{ color: DS.primary }} className="w-4 h-4" />} {title}
      </h2>
      {subtitle && <p style={{ color: DS.textMuted }} className="text-xs mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const RequestLegalService = () => {
  const navigate       = useNavigate();
  const fileInputRef   = useRef(null);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    serviceId:       '',
    clientName:      '',
    clientPhone:     '',
    clientAadhar:    '',
    clientAddress:   '',
    agreementPeriod: '11',
    partyTwoName:    '',
    partyTwoPhone:   '',
    partyTwoAadhar:  '',
    documents:       [],
    notes:           ''
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res  = await fetch(`${API}/legal/services`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setServices(data.services || []);
    } catch (e) { console.error(e); }
    finally { setLoadingServices(false); }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (formData.documents.length + files.length > 5) { setError('Maximum 5 documents allowed'); return; }
    setUploadingDoc(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const res  = await fetch(`${API}/upload/single`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        setFormData(prev => ({ ...prev, documents: [...prev.documents, { name: file.name, url: data.imageUrl, publicId: data.publicId }] }));
      }
    } catch (err) { setError(`Document upload failed: ${err.message}`); }
    finally { setUploadingDoc(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeDocument = async (index) => {
    const doc = formData.documents[index];
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
    if (doc.publicId) {
      try {
        await fetch(`${API}/upload/delete`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: doc.publicId })
        });
      } catch {}
    }
  };

  const handleSubmit = async () => {
    if (!formData.serviceId || !formData.clientName || !formData.clientPhone || !formData.clientAadhar || !formData.clientAddress) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = { ...formData, documents: formData.documents.map(d => d.url) };
      const res  = await fetch(`${API}/legal/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSuccess(true);
      setTimeout(() => navigate('/broker/dashboard'), 2000);
    } catch (err) { setError(err.message || 'Failed to submit request'); }
    finally { setLoading(false); }
  };

  const getServiceLabel = (s) => s.name || s.serviceName || 'Unknown Service';
  const selectedService  = services.find(s => s.id === formData.serviceId);

  if (loadingServices) return (
    <BrokerLayout>
      <div style={{ background: DS.bg }} className="flex items-center justify-center h-96">
        <Loader2 style={{ color: DS.primary }} className="w-7 h-7 animate-spin" />
      </div>
    </BrokerLayout>
  );

  return (
    <BrokerLayout>
      <div style={{ background: DS.bg, fontFamily: 'DM Sans, sans-serif' }}
        className="px-6 lg:px-10 py-8 max-w-4xl mx-auto min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/broker/dashboard')} style={{ color: DS.textMuted }}
            className="p-2 rounded-xl hover:opacity-70 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 style={{ color: DS.text, fontFamily: 'Georgia, serif' }} className="text-2xl font-bold">Request Legal Service</h1>
            <p style={{ color: DS.textMuted }} className="text-sm mt-0.5">Legal documents and agreement requests</p>
          </div>
        </div>

        {error && (
          <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder, color: DS.primary }}
            className="flex items-center gap-2 border px-4 py-3 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5">
            <CheckCircle className="w-4 h-4 shrink-0" /> Request submitted! Redirecting to dashboard...
          </div>
        )}

        <div className="space-y-5">

          {/* Service Selection */}
          <Section title="Select Service" icon={FileText}>
            <Field label="Service" required>
              <select name="serviceId" value={formData.serviceId} onChange={handleChange}
                style={iC.style} className={iC.base + ' cursor-pointer'}>
                <option value="">-- Choose a service --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {getServiceLabel(s)} {s.price ? `— ₹${Number(s.price).toLocaleString('en-IN')}` : ''}
                  </option>
                ))}
              </select>
            </Field>
            {selectedService && (
              <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
                className="mt-3 p-3 border rounded-xl">
                <p style={{ color: DS.text }} className="text-sm font-semibold">{getServiceLabel(selectedService)}</p>
                {selectedService.description && (
                  <p style={{ color: DS.textSub }} className="text-xs mt-1">{selectedService.description}</p>
                )}
                {selectedService.price && (
                  <p style={{ color: DS.primary }} className="text-sm font-bold mt-1">
                    ₹{Number(selectedService.price).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* Client Details */}
          <Section title="Client Details (Party 1)" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client Name" required icon={User}>
                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange}
                  placeholder="Full name" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Phone Number" required icon={Phone}>
                <input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleChange}
                  placeholder="10-digit mobile" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Aadhar Number" required icon={CreditCard}>
                <input type="text" name="clientAadhar" value={formData.clientAadhar} onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Full Address" required icon={MapPin}>
                <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange}
                  placeholder="Complete residential address" style={iC.style} className={iC.base} />
              </Field>
            </div>
          </Section>

          {/* Party 2 */}
          <Section title="Second Party Details" icon={User} subtitle="Optional — fill for agreements between 2 parties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Party 2 Name">
                <input type="text" name="partyTwoName" value={formData.partyTwoName} onChange={handleChange}
                  placeholder="Full name" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Party 2 Phone">
                <input type="tel" name="partyTwoPhone" value={formData.partyTwoPhone} onChange={handleChange}
                  placeholder="10-digit mobile" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Party 2 Aadhar">
                <input type="text" name="partyTwoAadhar" value={formData.partyTwoAadhar} onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX" style={iC.style} className={iC.base} />
              </Field>
              <Field label="Agreement Period (Months)" icon={Calendar}>
                <input type="number" name="agreementPeriod" value={formData.agreementPeriod} onChange={handleChange}
                  placeholder="11" style={iC.style} className={iC.base} />
                <p style={{ color: DS.textMuted }} className="text-[11px] mt-1">Default: 11 months (Leave & License)</p>
              </Field>
            </div>
          </Section>

          {/* Documents */}
          <Section title="Documents" icon={Paperclip} subtitle="Aadhar, Light Bill, Photo — max 5 files">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc || formData.documents.length >= 5}
              style={{ borderColor: DS.primaryBorder, color: DS.primary }}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-80">
              {uploadingDoc
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /> Select Files to Upload</>}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple onChange={handleFileUpload} className="hidden" />
            <p style={{ color: DS.textMuted }} className="text-[11px] mt-2">Accepted: PDF, JPG, PNG, WebP</p>

            {formData.documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.documents.map((doc, i) => (
                  <div key={i} style={{ background: DS.bg, borderColor: DS.border }}
                    className="flex items-center gap-3 p-3 border rounded-xl">
                    <div style={{ background: DS.primaryLight, borderColor: DS.primaryBorder }}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0">
                      <File style={{ color: DS.primary }} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: DS.text }} className="text-xs font-semibold truncate">{doc.name}</p>
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        style={{ color: DS.primary }} className="text-[11px] hover:underline">View uploaded file</a>
                    </div>
                    <button onClick={() => removeDocument(i)} style={{ color: DS.textMuted }}
                      className="p-1.5 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Notes */}
          <Section title="Additional Notes" icon={FileText}>
            <Field label="Notes">
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder="Any special instructions..."
                style={iC.style} className={iC.base + ' resize-none'} />
            </Field>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-4">
            <button onClick={handleSubmit} disabled={loading || uploadingDoc}
              style={{ background: DS.primary }}
              className="flex items-center gap-2 text-white font-bold px-7 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : <><CheckCircle className="w-4 h-4" /> Submit Request</>}
            </button>
            <button onClick={() => navigate('/broker/dashboard')}
              style={{ borderColor: DS.border, color: DS.textSub }}
              className="px-7 py-3 rounded-xl border text-sm font-semibold hover:opacity-70 transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </BrokerLayout>
  );
};

export default RequestLegalService;
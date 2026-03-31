import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, Loader2, ArrowUpRight, X } from 'lucide-react';
import { propertyAPI } from '../../services/api';

const C = {
  bg: '#F9F6F2', card: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', pLight: '#FEF3EE', pBorder: 'rgba(200,75,0,0.15)',
  text: '#1A0800', sub: '#6B5748', muted: '#9C8B7A',
  serif: 'Georgia, "Times New Roman", serif',
  sans: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const fmt = p => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = p => {
  try {
    const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    if (Array.isArray(imgs) && imgs.length)
      return typeof imgs[0] === 'string' ? imgs[0] : imgs[0]?.url;
  } catch {}
  return null;
};

// Vadodara area coordinates
const AREA_COORDS = {
  alkapuri:    { lat: 22.3072, lng: 73.1812 },
  'race course': { lat: 22.2950, lng: 73.1900 },
  gotri:       { lat: 22.2850, lng: 73.1650 },
  manjalpur:   { lat: 22.2700, lng: 73.1800 },
  waghodia:    { lat: 22.3300, lng: 73.2500 },
  sama:        { lat: 22.3200, lng: 73.2200 },
  gorwa:       { lat: 22.3350, lng: 73.1700 },
  fatehgunj:   { lat: 22.3100, lng: 73.1900 },
  karelibaug:  { lat: 22.3050, lng: 73.2100 },
  padra:       { lat: 22.2355, lng: 73.0856 },
  karjan:      { lat: 22.0494, lng: 73.1228 },
  halol:       { lat: 22.5016, lng: 73.4724 },
  vadodara:    { lat: 22.3072, lng: 73.1812 },
};

const getCoords = p => {
  if (p.latitude && p.longitude) return { lat: +p.latitude, lng: +p.longitude };
  const key = (p.city || p.address || '').toLowerCase();
  for (const [k, v] of Object.entries(AREA_COORDS))
    if (key.includes(k)) return v;
  return {
    lat: 22.3072 + (Math.random() - 0.5) * 0.08,
    lng: 73.1812 + (Math.random() - 0.5) * 0.10,
  };
};

const TYPE_CLR = {
  RESIDENTIAL: '#7c3aed', COMMERCIAL: '#C84B00',
  AGRICULTURAL: '#059669', LAND: '#16a34a', INDUSTRIAL: '#d97706',
};

const TYPE_ICON = {
  RESIDENTIAL: '🏠', COMMERCIAL: '🏢',
  AGRICULTURAL: '🌾', LAND: '🗺️', INDUSTRIAL: '🏭',
};

export default function InteractivePropertyMap() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const focusId    = new URLSearchParams(location.search).get('id');
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet CSS + JS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) { 
      setLeafletReady(true); 
      return; 
    }

    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Fetch properties
  useEffect(() => {
    (async () => {
      try {
        const res = await propertyAPI.getAll({ limit: 100 });
        const props = (res.data?.properties || []).map(p => ({
          ...p,
          coords: getCoords(p),
        }));
        setProperties(props);
      } catch { 
        setProperties([]); 
      }
      setLoading(false);
    })();
  }, []);

  // Auto-focus on property from URL param
  useEffect(() => {
    if (!focusId || !properties.length) return;
    const prop = properties.find(p => p.id === focusId);
    if (prop) {
      setSelected(prop);
      if (leafletRef.current) {
        leafletRef.current.flyTo([prop.coords.lat, prop.coords.lng], 15, { duration: 0.8 });
      }
    }
  }, [focusId, properties]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [22.3072, 73.1812],
      zoom: 12,
      zoomControl: true,
    });

    // OpenStreetMap tiles (FREE - No API key needed!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletRef.current = map;
  }, [leafletReady]);

  // Add/update markers
  useEffect(() => {
    if (!leafletReady || !leafletRef.current) return;
    const L = window.L;
    const map = leafletRef.current;

    // Remove old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const visible = properties.filter(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q);
      }
      return true;
    });

    if (!visible.length) return;

    visible.forEach(p => {
      const color = TYPE_CLR[p.type] || C.muted;
      const icon  = TYPE_ICON[p.type] || '🏠';

      // Custom marker
      const svgIcon = L.divIcon({
        className: '',
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
        html: `
          <div style="position:relative;width:36px;height:44px">
            <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
                fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="18" cy="18" r="10" fill="white" opacity="0.9"/>
            </svg>
            <div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:14px;line-height:1">${icon}</div>
          </div>`,
      });

      const marker = L.marker([p.coords.lat, p.coords.lng], { icon: svgIcon });

      // Popup
      const img = getImg(p);
      marker.bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;min-width:200px;padding:0">
          ${img ? `<img src="${img}" style="width:100%;height:110px;object-fit:cover;border-radius:8px 8px 0 0;display:block"/>` : ''}
          <div style="padding:10px 12px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
              <span style="font-size:10px;color:#9C8B7A;font-weight:600;text-transform:uppercase">${p.type}</span>
            </div>
            <p style="font-size:13px;font-weight:700;color:#1A0800;margin:0 0 4px;line-height:1.3">${p.title}</p>
            <p style="font-size:11px;color:#9C8B7A;margin:0 0 8px;display:flex;align-items:center;gap:3px">
              📍 ${p.city || 'Vadodara'}
            </p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:15px;font-weight:700;color:${color}">${fmt(p.price)}</span>
              <a href="/property/${p.id}"
                style="background:#1A0800;color:#fff;padding:5px 11px;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
                View →
              </a>
            </div>
          </div>
        </div>`, {
        maxWidth: 240,
        minWidth: 200,
        className: 'rudra-popup',
      });

      marker.on('click', () => setSelected(p));
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (visible.length > 0) {
      const bounds = L.latLngBounds(visible.map(p => [p.coords.lat, p.coords.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, typeFilter, search, leafletReady]);

  const filtered = properties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ background: C.bg, height: '100vh', display: 'flex',
      flexDirection: 'column', fontFamily: C.sans }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .rudra-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(26,8,0,0.15) !important;
          border: 1px solid #EDE8E3;
        }
        .rudra-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .rudra-popup .leaflet-popup-tip { background: #fff !important; }
        .leaflet-control-attribution { font-size: 10px !important; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sidebarIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: '12px 20px', flexShrink: 0, animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: C.pLight,
              border: `1px solid ${C.pBorder}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={17} color={C.primary} />
            </div>
            <div>
              <h1 style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 700,
                color: C.text, margin: 0 }}>Property Map</h1>
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>
                {loading ? 'Loading…' : (
                  <><strong style={{ color: C.primary }}>{filtered.length}</strong> properties • OpenStreetMap</>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 11, padding: '7px 13px' }}>
              <Search size={14} color={C.muted} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search city or title…"
                style={{ border: 'none', outline: 'none', fontSize: 13,
                  color: C.text, background: 'transparent', width: 150, fontFamily: C.sans }} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer',
                    color: C.muted, padding: 0, lineHeight: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 11,
                padding: '7px 13px', fontSize: 13, color: C.text,
                background: C.bg, outline: 'none', cursor: 'pointer', fontFamily: C.sans }}>
              <option value="all">All Types</option>
              {Object.entries(TYPE_ICON).map(([t, icon]) => (
                <option key={t} value={t}>{icon} {t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 290, background: C.card, borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', flexShrink: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: 48, flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: C.pLight,
                border: `1px solid ${C.pBorder}`, display: 'flex',
                alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={18} color={C.primary}
                  style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <p style={{ color: C.muted, fontSize: 13 }}>Loading properties…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '36px 16px',
              color: C.muted, fontSize: 13 }}>No properties found</p>
          ) : (
            <div style={{ padding: '6px 0' }}>
              {filtered.map((p, i) => {
                const img = getImg(p);
                const sel = selected?.id === p.id;
                const isFocus = p.id === focusId;
                const dot = TYPE_CLR[p.type] || C.muted;
                return (
                  <div key={p.id}
                    onClick={() => {
                      setSelected(sel ? null : p);
                      if (!sel && leafletRef.current) {
                        leafletRef.current.flyTo([p.coords.lat, p.coords.lng], 15, { duration: 0.8 });
                      }
                    }}
                    style={{ display: 'flex', gap: 10, padding: '10px 14px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: sel ? C.pLight : isFocus ? '#fffbf8' : 'transparent',
                      borderLeft: `3px solid ${sel ? C.primary : isFocus ? '#f4a26a' : 'transparent'}`,
                      animation: `sidebarIn 0.35s ease ${i * 25}ms both` }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#faf6f2'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = sel ? C.pLight : isFocus ? '#fffbf8' : 'transparent'; }}>
                    <div style={{ width: 52, height: 46, borderRadius: 10,
                      overflow: 'hidden', background: C.bg, flexShrink: 0 }}>
                      {img
                        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            {TYPE_ICON[p.type] || '🏠'}
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: C.text, margin: '0 0 2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: C.sans }}>
                        {p.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%',
                          background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: C.muted, fontFamily: C.sans }}>
                          {p.type} · {p.city || 'Vadodara'}
                        </span>
                      </div>
                      <p style={{ fontFamily: C.serif, fontWeight: 700, fontSize: 13,
                        color: C.primary, margin: 0 }}>
                        {fmt(p.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Loading overlay */}
          {(!leafletReady || loading) && (
            <div style={{ position: 'absolute', inset: 0, background: '#F0EBE0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 14, zIndex: 999 }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, background: C.pLight,
                border: `1px solid ${C.pBorder}`, display: 'flex',
                alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={22} color={C.primary}
                  style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <p style={{ color: C.muted, fontSize: 14, fontFamily: C.sans }}>
                Loading map…
              </p>
            </div>
          )}

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 28, left: 16, zIndex: 1000,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
            borderRadius: 16, padding: '12px 16px', border: `1px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(26,8,0,0.08)' }}>
            <p style={{ fontWeight: 700, fontSize: 10, color: C.text, margin: '0 0 8px',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: C.sans }}>
              Legend
            </p>
            {Object.entries(TYPE_CLR).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center',
                gap: 7, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                  background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.muted, fontFamily: C.sans }}>
                  {TYPE_ICON[type]} {type}
                </span>
              </div>
            ))}
          </div>

          {/* Selected card */}
          {selected && (
            <div style={{ position: 'absolute', bottom: 28, right: 16, zIndex: 1000,
              width: 300, background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(14px)', borderRadius: 22,
              border: `1px solid ${C.pBorder}`,
              boxShadow: '0 12px 40px rgba(200,75,0,0.15)', overflow: 'hidden',
              animation: 'slideUp 0.35s cubic-bezier(.34,1.56,.64,1) both' }}>
              <button onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center' }}>
                <X size={14} color={C.muted} />
              </button>
              <div style={{ height: 140, overflow: 'hidden', background: C.bg }}>
                {getImg(selected)
                  ? <img src={getImg(selected)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {TYPE_ICON[selected.type] || '🏠'}
                    </div>
                }
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: TYPE_CLR[selected.type] || C.muted }} />
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600,
                    fontFamily: C.sans }}>
                    {selected.type}
                  </span>
                  {selected.id === focusId && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.primary,
                      background: C.pLight, border: `1px solid ${C.pBorder}`,
                      borderRadius: 6, padding: '1px 7px', marginLeft: 'auto' }}>
                      Selected
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: C.serif, fontWeight: 700, fontSize: 15,
                  color: C.text, margin: '0 0 4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.title}
                </p>
                <p style={{ color: C.muted, fontSize: 12, margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: 4, fontFamily: C.sans }}>
                  <MapPin size={11} /> {selected.city || 'Vadodara'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: C.serif, fontWeight: 700,
                    fontSize: 20, color: C.primary }}>
                    {fmt(selected.price)}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selected.id === focusId && (
                      <button onClick={() => navigate(-1)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4,
                          background: C.bg, color: C.muted, border: `1px solid ${C.border}`,
                          borderRadius: 10, padding: '8px 12px', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: C.sans }}>
                        ← Back
                      </button>
                    )}
                    <button onClick={() => navigate(`/property/${selected.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5,
                        background: C.text, color: '#fff', border: 'none', borderRadius: 10,
                        padding: '8px 14px', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', fontFamily: C.sans, transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.primary}
                      onMouseLeave={e => e.currentTarget.style.background = C.text}>
                      View <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RotateCw, ZoomIn, ZoomOut, Navigation,
  ChevronLeft, ChevronRight, MapPin, Info,
  ArrowLeft, Loader2, Image as ImageIcon
} from 'lucide-react';
import { propertyAPI } from '../../services/api';

const C = {
  primary: '#C84B00',
  pLight: 'rgba(200,75,0,0.18)',
  text: '#1A0800',
  serif: 'Georgia,"Times New Roman",serif',
  sans: "'DM Sans','Segoe UI',system-ui,sans-serif",
};

export default function VirtualTour360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const autoRotateRef = useRef(true);
  const animationRef = useRef(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [property, setProperty] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await propertyAPI.getById(id);
        if (res.data?.property) {
          const prop = res.data.property;
          setProperty(prop);
          let propertyImages = [];
          try {
            propertyImages = typeof prop.images === 'string' ? JSON.parse(prop.images) : (Array.isArray(prop.images) ? prop.images : []);
          } catch {}
          const imageUrls = propertyImages.map(img => typeof img === 'string' ? img : img.url || img.thumbnail || null).filter(Boolean);
          setImages(imageUrls);
          if (imageUrls.length > 0) {
            const preloadedImages = await Promise.all(
              imageUrls.map(url => new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
              }))
            ).catch(() => []);
            setLoadedImages(preloadedImages.filter(Boolean));
          }
        }
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      if (loadedImages.length > 0 && loadedImages[currentImageIndex]) {
        const img = loadedImages[currentImageIndex];
        ctx.fillStyle = 'rgba(17, 6, 0, 0.3)';
        ctx.fillRect(0, 0, W, H);
        const offset = (rotRef.current * 0.5) % W;
        const scale = Math.max(W / img.width, H / img.height) * 1.2;
        const scaledW = img.width * scale;
        const scaledH = img.height * scale;
        const x = (W - scaledW) / 2 - offset;
        const y = (H - scaledH) / 2;
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.drawImage(img, x, y, scaledW, scaledH);
        ctx.drawImage(img, x + scaledW, y, scaledW, scaledH);
        ctx.drawImage(img, x - scaledW, y, scaledW, scaledH);
        ctx.restore();
        const vignette = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.6);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(17,6,0,0.5)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, W, 0);
        bgGrad.addColorStop(0, '#2D1200');
        bgGrad.addColorStop(0.5, '#7A3000');
        bgGrad.addColorStop(1, '#C84B00');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
        const vignette = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.6);
        vignette.addColorStop(0, 'rgba(255,255,255,0.06)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      const gridOffset = (rotRef.current * 1.8) % 90;
      for (let x = -90; x < W + 90; x += 90) {
        ctx.beginPath(); ctx.moveTo(x + gridOffset, 0); ctx.lineTo(x + gridOffset, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
        const curve = (y - H/2) * 0.04;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(W/2, y + curve, W, y); ctx.stroke();
      }

      const accentH = 4;
      const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
      accentGrad.addColorStop(0, 'rgba(200,75,0,0)');
      accentGrad.addColorStop(0.4, 'rgba(200,75,0,0.7)');
      accentGrad.addColorStop(0.6, 'rgba(200,75,0,0.7)');
      accentGrad.addColorStop(1, 'rgba(200,75,0,0)');
      ctx.fillStyle = accentGrad;
      ctx.fillRect(0, 0, W, accentH);
      ctx.fillRect(0, H - accentH, W, accentH);

      const hotspots = [
        { x: 25, y: 45, label: 'Details' },
        { x: 50, y: 35, label: 'Feature' },
        { x: 75, y: 50, label: 'View' }
      ];
      ctx.textAlign = 'center';
      hotspots.forEach(({ x, y, label }) => {
        const hx = (x / 100) * W;
        const hy = (y / 100) * H;
        ctx.strokeStyle = 'rgba(200,75,0,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(200,75,0,0.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx, hy, 34, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowColor = 'rgba(200,75,0,0.6)'; ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(200,75,0,0.9)';
        ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 11px DM Sans, sans-serif';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(26,8,0,0.82)';
        ctx.beginPath(); ctx.roundRect(hx - textWidth/2 - 10, hy - 38, textWidth + 20, 22, 6); ctx.fill();
        ctx.fillStyle = 'rgba(254,243,238,0.95)';
        ctx.fillText(label, hx, hy - 22);
      });

      ctx.textAlign = 'left';
      ctx.font = '12px DM Sans, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText('↔ Drag to rotate', 16, H - 16);
    };

    const animate = () => {
      if (autoRotateRef.current && !isDragging) rotRef.current += 0.25;
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentImageIndex, isDragging, loadedImages]);

  const handleMouseDown = (e) => { setIsDragging(true); setLastX(e.clientX); autoRotateRef.current = false; };
  const handleMouseMove = (e) => { if (!isDragging) return; const d = e.clientX - lastX; rotRef.current += d * 0.4; setRotation(rotRef.current); setLastX(e.clientX); };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e) => { setIsDragging(true); setLastX(e.touches[0].clientX); autoRotateRef.current = false; };
  const handleTouchMove = (e) => { if (!isDragging) return; const d = e.touches[0].clientX - lastX; rotRef.current += d * 0.4; setRotation(rotRef.current); setLastX(e.touches[0].clientX); };
  const handleTouchEnd = () => setIsDragging(false);

  const nextImage = () => { if (images.length === 0) return; setCurrentImageIndex(p => (p + 1) % images.length); };
  const prevImage = () => { if (images.length === 0) return; setCurrentImageIndex(p => (p - 1 + images.length) % images.length); };
  const resetRotation = () => { rotRef.current = 0; setRotation(0); autoRotateRef.current = true; };
  const handleZoomIn = () => setZoom(p => Math.min(p + 0.2, 2));
  const handleZoomOut = () => setZoom(p => Math.max(p - 0.2, 0.5));

  const features = (() => {
    if (!property?.features) return [];
    try { return Array.isArray(property.features) ? property.features : JSON.parse(property.features); } catch { return []; }
  })();

  // ✅ FIX: Smart back — navigate(-1) so history loop nahi thay
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(id ? `/property/${id}` : '/properties');
    }
  };

  if (loading) return (
    <div style={{ background:'#110600', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20 }}>
      <Loader2 size={48} color={C.primary} style={{ animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#fff', fontSize:16, fontFamily:C.sans }}>Loading Virtual Tour...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!property) return (
    <div style={{ background:'#110600', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20 }}>
      <ImageIcon size={64} color="rgba(255,255,255,0.3)" />
      <p style={{ color:'#fff', fontSize:18, fontFamily:C.sans }}>Property not found</p>
      <button onClick={() => navigate('/properties')}
        style={{ padding:'12px 24px', background:C.primary, color:'#fff', border:'none', borderRadius:12, cursor:'pointer', fontFamily:C.sans, fontWeight:600 }}>
        Back to Properties
      </button>
    </div>
  );

  return (
    <div style={{ background:'#110600', minHeight:'100vh', position:'relative', overflow:'hidden', fontFamily:C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef}
        style={{ width:'100%', height:'100vh', display:'block', cursor:isDragging?'grabbing':'grab', transform:`scale(${zoom})`, transition:isDragging?'none':'transform 0.2s' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      />

      {/* Top Bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(to bottom, rgba(26,8,0,0.7), transparent)', animation:'fadeIn 0.5s ease both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* ✅ FIX: navigate(-1) — loop fix */}
          <button onClick={goBack}
            style={{ width:38, height:38, borderRadius:12, background:'rgba(200,75,0,0.2)', backdropFilter:'blur(10px)', border:'1px solid rgba(200,75,0,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
            <ArrowLeft size={17} color="#fff" />
          </button>
          <div style={{ background:'rgba(26,8,0,0.5)', backdropFilter:'blur(16px)', border:'1px solid rgba(200,75,0,0.3)', borderRadius:14, padding:'9px 20px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:C.primary, boxShadow:`0 0 8px ${C.primary}` }} />
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{property.title} — Virtual Tour 360°</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { icon:<ZoomOut size={16}/>, action:handleZoomOut },
            { icon:<ZoomIn size={16}/>,  action:handleZoomIn },
            { icon:<RotateCw size={16}/>, action:resetRotation },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              style={{ width:38, height:38, borderRadius:12, background:'rgba(26,8,0,0.45)', backdropFilter:'blur(14px)', border:'1px solid rgba(200,75,0,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'all 0.2s' }}>
              {btn.icon}
            </button>
          ))}
          <button onClick={() => setShowInfo(v => !v)}
            style={{ width:38, height:38, borderRadius:12, background:showInfo?C.pLight:'rgba(26,8,0,0.45)', backdropFilter:'blur(14px)', border:`1px solid ${showInfo?C.primary:'rgba(200,75,0,0.3)'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:showInfo?C.primary:'#fff', transition:'all 0.2s' }}>
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Compass */}
      <div style={{ position:'absolute', top:80, left:20, background:'rgba(26,8,0,0.5)', backdropFilter:'blur(14px)', border:'1px solid rgba(200,75,0,0.3)', borderRadius:99, padding:12, textAlign:'center', animation:'slideInLeft 0.5s ease 0.2s both' }}>
        <Navigation size={26} style={{ color:'#fff', display:'block', transform:`rotate(${rotation * 0.5}deg)`, transition:'transform 0.05s' }} />
        <span style={{ color:'rgba(200,75,0,0.9)', fontSize:10, fontWeight:700, marginTop:2, display:'block' }}>N</span>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div style={{ position:'absolute', top:80, right:20, width:210, background:'rgba(26,8,0,0.55)', backdropFilter:'blur(18px)', border:'1px solid rgba(200,75,0,0.3)', borderRadius:18, padding:18, animation:'slideInRight 0.4s cubic-bezier(.22,1,.36,1) both' }}>
          <p style={{ color:'rgba(200,75,0,0.9)', fontWeight:700, fontSize:11, margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Property Details</p>
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', gap:5, color:'rgba(255,255,255,0.6)', fontSize:12, alignItems:'center', marginBottom:4 }}>
              <MapPin size={11} color={C.primary} /> {property.city || 'Vadodara'}
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, margin:0 }}>{property.type} · {property.area?.toLocaleString()} sqft</p>
            <p style={{ color:C.primary, fontSize:14, fontWeight:700, margin:'6px 0 0', fontFamily:C.serif }}>₹{property.price?.toLocaleString('en-IN')}</p>
          </div>
          {features.length > 0 && (
            <div style={{ paddingTop:12, borderTop:'1px solid rgba(200,75,0,0.2)' }}>
              <p style={{ color:'rgba(200,75,0,0.9)', fontSize:10, fontWeight:700, marginBottom:8, textTransform:'uppercase' }}>Features</p>
              {features.slice(0, 4).map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:C.primary }} /> {f}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(200,75,0,0.2)' }}>
            <p style={{ color:'rgba(200,75,0,0.9)', fontSize:10, fontWeight:700, marginBottom:6, textTransform:'uppercase' }}>Controls</p>
            {['Drag to rotate 360°', 'Use arrows for images'].map((text, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:C.primary, flexShrink:0, marginTop:4 }} />
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 0 && (
        <div style={{ position:'absolute', bottom:108, left:'50%', transform:'translateX(-50%)', textAlign:'center', animation:'slideUp 0.5s ease both' }}>
          <div style={{ background:'rgba(26,8,0,0.6)', backdropFilter:'blur(18px)', border:'1px solid rgba(200,75,0,0.35)', borderRadius:20, padding:'14px 30px', boxShadow:'0 8px 32px rgba(200,75,0,0.15)' }}>
            <p style={{ color:'#fff', fontWeight:700, fontSize:20, margin:0 }}>📸 Image {currentImageIndex + 1} of {images.length}</p>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, margin:'4px 0 0' }}>{property.title}</p>
          </div>
        </div>
      )}

      {/* Image Navigation */}
      {images.length > 1 && (
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, alignItems:'center', animation:'slideUp 0.5s ease 0.1s both' }}>
          <button onClick={prevImage} style={{ width:38, height:38, borderRadius:'50%', background:'rgba(26,8,0,0.5)', backdropFilter:'blur(12px)', border:'1px solid rgba(200,75,0,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronLeft size={19} color="#fff" />
          </button>
          <div style={{ padding:'8px 20px', borderRadius:12, background:'rgba(200,75,0,0.25)', backdropFilter:'blur(12px)', border:'1px solid rgba(200,75,0,0.5)', color:'#fff', fontWeight:600, fontSize:13 }}>
            {currentImageIndex + 1} / {images.length}
          </div>
          <button onClick={nextImage} style={{ width:38, height:38, borderRadius:'50%', background:'rgba(26,8,0,0.5)', backdropFilter:'blur(12px)', border:'1px solid rgba(200,75,0,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronRight size={19} color="#fff" />
          </button>
        </div>
      )}

      {images.length === 0 && (
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', background:'rgba(26,8,0,0.6)', backdropFilter:'blur(18px)', border:'1px solid rgba(200,75,0,0.35)', borderRadius:16, padding:'12px 24px', color:'rgba(255,255,255,0.6)', fontSize:13, animation:'slideUp 0.5s ease both' }}>
          <ImageIcon size={16} style={{ display:'inline', marginRight:8 }} />
          No images available for this property
        </div>
      )}
    </div>
  );
}
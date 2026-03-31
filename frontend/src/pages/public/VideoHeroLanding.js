/**
 * Rudra Real Estate — Video Hero Landing Page
 * Warm Editorial Theme · Georgia serif · All pages linked
 * Uses propertyAPI service (no hardcoded URLs)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, MapPin, Home, Building2, Leaf,
  ChevronDown, Play, Pause, Volume2, VolumeX, Star,
  TrendingUp, Shield, Scale, ArrowUpRight, Loader,
  Map, Calculator, Heart, BarChart3, Phone,
} from 'lucide-react';
import { propertyAPI } from '../../services/api';

// ── Design tokens ──────────────────────────────────────────────────
const T = {
  bg:           '#FAF8F5',
  white:        '#FFFFFF',
  primary:      '#C84B00',
  primaryLight: '#FEF3EE',
  primaryBorder:'rgba(200,75,0,0.22)',
  amber:        '#D97706',
  emerald:      '#15803D',
  text:         '#1A0800',
  sub:          '#6B5748',
  muted:        '#9C8B7A',
  border:       '#EDE8E3',
  serif:        'Georgia, serif',
  sans:         "'DM Sans', system-ui, sans-serif",
  overlay:      'rgba(20,8,0,0.55)',
  overlayDeep:  'rgba(20,8,0,0.72)',
};

// ── Helpers ────────────────────────────────────────────────────────
const formatPrice = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} Lac`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImg = (images) => {
  try {
    const arr = typeof images === 'string' ? JSON.parse(images) : images;
    if (Array.isArray(arr) && arr.length > 0) {
      const f = arr[0];
      return typeof f === 'string' ? f : f?.url || f?.thumbnail;
    }
  } catch {}
  return null;
};

// ── Gradient slides (used as backdrop when no video) ───────────────
const HERO_GRADIENTS = [
  'linear-gradient(135deg, #2D1B00 0%, #8B3A00 45%, #C84B00 100%)',
  'linear-gradient(135deg, #0A1628 0%, #1A3A5C 45%, #2563EB 100%)',
  'linear-gradient(135deg, #0D2818 0%, #1A5233 45%, #15803D 100%)',
  'linear-gradient(135deg, #1A1000 0%, #4A3500 45%, #D97706 100%)',
];

const HERO_WORDS = ['वड़ोदरा', 'Vadodara', 'Heritage', 'Future'];

// ── Nav links ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Properties',   path: '/properties' },
  { label: 'Land',         path: '/land' },
  { label: 'Map View',     path: '/map' },
  { label: 'Legal Help',   path: '/lawyers' },
];

// ── Quick explore cards ────────────────────────────────────────────
const EXPLORE_CARDS = [
  { icon: Home,      label: 'Residential', sub: 'Homes & Villas',    path: '/properties?type=RESIDENTIAL', color: '#7C5CFC' },
  { icon: Building2, label: 'Commercial',  sub: 'Offices & Shops',   path: '/properties?type=COMMERCIAL',  color: '#0EA5E9' },
  { icon: Leaf,      label: 'Agricultural',sub: 'Farmland & Agri',   path: '/properties?type=AGRICULTURAL',color: '#15803D' },
  { icon: MapPin,    label: 'Land / Plot', sub: 'Plots & Open Land',  path: '/land',                        color: T.amber   },
  { icon: BarChart3, label: 'Compare',     sub: 'Side-by-side View',  path: '/compare',                     color: '#E11D48' },
  { icon: Calculator,label: 'Calculators', sub: 'EMI & Stamp Duty',   path: '/calculators',                 color: T.primary },
];

// ══════════════════════════════════════════════════════════════════
export default function VideoHeroLanding() {
  const navigate = useNavigate();

  // Hero state
  const [slide,     setSlide]     = useState(0);
  const [wordIdx,   setWordIdx]   = useState(0);
  const [muted,     setMuted]     = useState(true);
  const [playing,   setPlaying]   = useState(true);
  const [scrolled,  setScrolled]  = useState(false);
  const videoRef = useRef(null);

  // Search state
  const [query,     setQuery]     = useState('');
  const [purpose,   setPurpose]   = useState('');

  // Featured listings
  const [featured,  setFeatured]  = useState([]);
  const [loadingFt, setLoadingFt] = useState(true);

  // Stats
  const [stats,     setStats]     = useState({ total: 0, sold: 0, cities: 0 });
  const [countUp,   setCountUp]   = useState({ total: 0, sold: 0, cities: 0 });

  // ── Data fetch ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await propertyAPI.getAll({ limit: 6, featured: true });
        const list = res.data?.properties || res.data?.data || [];
        setFeatured(list);
        const total = res.data?.total || res.data?.count || list.length;
        setStats({ total, sold: Math.floor(total * 0.62), cities: 12 });
      } catch {
        setFeatured([]);
      } finally {
        setLoadingFt(false);
      }
    })();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!stats.total) return;
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const pct = step / steps;
      const ease = 1 - Math.pow(1 - pct, 3);
      setCountUp({
        total:  Math.floor(stats.total  * ease),
        sold:   Math.floor(stats.sold   * ease),
        cities: Math.floor(stats.cities * ease),
      });
      if (step >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [stats]);

  // Slide cycle
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_GRADIENTS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Word cycle
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Video controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(p => !p);
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted(m => !m);
  }, [muted]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query)   params.set('q',       query);
    if (purpose) params.set('purpose', purpose);
    navigate(`/properties?${params}`);
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, fontFamily: T.sans, minHeight: '100vh' }}>

      {/* ── Sticky Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '10px 40px' : '18px 40px',
        background: scrolled ? 'rgba(250,248,245,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.35s ease',
      }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: scrolled ? T.primary : T.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(200,75,0,0.25)',
          }}>
            <Home size={18} color={scrolled ? T.white : T.primary} strokeWidth={2} />
          </div>
          <span style={{
            fontFamily: T.serif,
            fontSize: 18,
            fontWeight: 700,
            color: scrolled ? T.text : T.white,
            letterSpacing: '-0.3px',
          }}>
            Rudra Real Estate
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.sans, fontSize: 14, fontWeight: 500,
              color: scrolled ? T.sub : 'rgba(255,255,255,0.85)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = scrolled ? T.primary : T.white}
              onMouseLeave={e => e.target.style.color = scrolled ? T.sub : 'rgba(255,255,255,0.85)'}
            >
              {label}
            </button>
          ))}
          <button onClick={() => navigate('/contact')} style={{
            background: T.primary, color: T.white,
            border: 'none', borderRadius: 8,
            padding: '8px 18px', fontFamily: T.sans, fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(200,75,0,0.35)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = '#A83A00'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = T.primary; e.target.style.transform = 'translateY(0)'; }}
          >
            Contact Us
          </button>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', height: '100vh', minHeight: 640,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Gradient backdrop (cycles) */}
        {HERO_GRADIENTS.map((g, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            background: g,
            opacity: slide === i ? 1 : 0,
            transition: 'opacity 1.4s ease',
          }} />
        ))}

        {/* Grain texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(20,8,0,0.55) 100%)',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
          background: `linear-gradient(to bottom, transparent, ${T.bg})`,
        }} />

        {/* Slide indicators */}
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, zIndex: 10,
        }}>
          {HERO_GRADIENTS.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: slide === i ? 28 : 8, height: 8, borderRadius: 4,
              background: slide === i ? T.white : 'rgba(255,255,255,0.35)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.35s ease',
            }} />
          ))}
        </div>

        {/* Video controls */}
        <div style={{
          position: 'absolute', bottom: 100, right: 40,
          display: 'flex', gap: 8, zIndex: 10,
        }}>
          {[
            { icon: playing ? Pause : Play, action: togglePlay },
            { icon: muted   ? VolumeX : Volume2, action: toggleMute },
          ].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: T.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 5, textAlign: 'center',
          padding: '0 24px', maxWidth: 820, animation: 'fadeUp 1s ease both',
        }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ADE80',
              boxShadow: '0 0 6px #4ADE80',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontFamily: T.sans, fontSize: 13, color: T.white, fontWeight: 500, letterSpacing: '0.04em' }}>
              Vadodara's Most Trusted Real Estate Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: T.serif,
            fontSize: 'clamp(42px, 8vw, 80px)',
            fontWeight: 700,
            color: T.white,
            lineHeight: 1.1,
            margin: '0 0 18px',
            letterSpacing: '-1px',
          }}>
            Find Your Home in{' '}
            <span style={{
              display: 'inline-block',
              color: '#FED7AA',
              minWidth: 220,
              borderBottom: '2px solid rgba(254,215,170,0.4)',
              paddingBottom: 2,
              animation: 'wordFade 0.5s ease',
              key: wordIdx,
            }}>
              {HERO_WORDS[wordIdx]}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: T.sans, fontSize: 18, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6, margin: '0 0 40px',
            maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Residential, commercial, agricultural & land listings — all in one place.
            Trusted by thousands across Gujarat.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: 0, maxWidth: 620,
            margin: '0 auto 20px',
            background: T.white,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
              <Search size={18} color={T.muted} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search area, locality, property type…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontFamily: T.sans, fontSize: 15, color: T.text,
                  background: 'transparent', padding: '16px 0',
                }}
              />
            </div>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              style={{
                border: 'none', borderLeft: `1px solid ${T.border}`,
                outline: 'none', padding: '0 16px',
                fontFamily: T.sans, fontSize: 14, color: T.sub,
                background: 'transparent', cursor: 'pointer',
                minWidth: 120,
              }}
            >
              <option value="">Any Purpose</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
              <option value="LEASE">For Lease</option>
            </select>
            <button type="submit" style={{
              background: T.primary, color: T.white,
              border: 'none', padding: '0 24px',
              fontFamily: T.sans, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#A83A00'}
              onMouseLeave={e => e.currentTarget.style.background = T.primary}
            >
              Search <ArrowRight size={16} />
            </button>
          </form>

          {/* Popular tags */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Alkapuri', 'Vadiwadi', 'Gotri', 'Harni', 'Waghodia Road'].map(tag => (
              <button key={tag} onClick={() => navigate(`/properties?q=${tag}`)} style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.85)', borderRadius: 100,
                padding: '5px 14px', fontFamily: T.sans, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = T.white; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'bounce 2s infinite', zIndex: 10,
        }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Explore
          </span>
          <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────── */}
      <section style={{
        background: T.primary, padding: '22px 40px',
        display: 'flex', justifyContent: 'center', gap: 72,
        flexWrap: 'wrap',
      }}>
        {[
          { val: countUp.total,  suffix: '+', label: 'Active Listings' },
          { val: countUp.sold,   suffix: '+', label: 'Properties Sold' },
          { val: countUp.cities, suffix: '',  label: 'Localities Covered' },
          { val: 98,             suffix: '%', label: 'Client Satisfaction' },
        ].map(({ val, suffix, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: T.serif, fontSize: 30, fontWeight: 700,
              color: T.white, lineHeight: 1,
            }}>
              {val}{suffix}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Explore Categories ────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            fontFamily: T.sans, fontSize: 12, fontWeight: 600,
            color: T.primary, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Browse by Category
          </span>
          <h2 style={{
            fontFamily: T.serif, fontSize: 38, color: T.text,
            margin: '12px 0 0', fontWeight: 700, letterSpacing: '-0.5px',
          }}>
            What Are You Looking For?
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {EXPLORE_CARDS.map(({ icon: Icon, label, sub, path, color }) => (
            <button key={label} onClick={() => navigate(path)} style={{
              background: T.white, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: '24px 20px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.1)`;
                e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 700, color: T.text }}>{label}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────────────── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <span style={{
              fontFamily: T.sans, fontSize: 12, fontWeight: 600,
              color: T.primary, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Featured Listings
            </span>
            <h2 style={{
              fontFamily: T.serif, fontSize: 34, color: T.text,
              margin: '10px 0 0', fontWeight: 700, letterSpacing: '-0.5px',
            }}>
              Properties You'll Love
            </h2>
          </div>
          <button onClick={() => navigate('/properties')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '9px 16px',
            fontFamily: T.sans, fontSize: 14, fontWeight: 500,
            color: T.sub, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.color = T.sub; }}
          >
            View All <ArrowUpRight size={15} />
          </button>
        </div>

        {loadingFt ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: T.sans, fontSize: 15 }}>Loading listings…</span>
          </div>
        ) : featured.length === 0 ? (
          <div style={{
            background: T.white, borderRadius: 16, border: `1px solid ${T.border}`,
            padding: '60px 40px', textAlign: 'center',
          }}>
            <Home size={36} color={T.muted} style={{ marginBottom: 16 }} />
            <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, margin: 0 }}>
              No featured listings yet. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {featured.map(prop => {
              const img = getImg(prop.images);
              return (
                <div key={prop._id || prop.id} onClick={() => navigate(`/property/${prop._id || prop.id}`)} style={{
                  background: T.white, borderRadius: 16, overflow: 'hidden',
                  border: `1px solid ${T.border}`, cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                >
                  {/* Image */}
                  <div style={{ height: 210, position: 'relative', overflow: 'hidden', background: '#EDE8E3' }}>
                    {img ? (
                      <img src={img} alt={prop.title} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.primaryLight }}>
                        <Home size={32} color={T.primary} />
                      </div>
                    )}
                    {/* Purpose badge */}
                    {prop.purpose && (
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: prop.purpose === 'SALE' ? T.primary : T.emerald,
                        color: T.white, borderRadius: 100,
                        padding: '3px 10px', fontSize: 11, fontWeight: 600, fontFamily: T.sans,
                      }}>
                        For {prop.purpose === 'RENT' ? 'Rent' : prop.purpose === 'LEASE' ? 'Lease' : 'Sale'}
                      </div>
                    )}
                    {/* Wishlist */}
                    <button onClick={e => { e.stopPropagation(); navigate('/wishlist'); }} style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Heart size={15} color={T.primary} />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <h3 style={{
                        fontFamily: T.serif, fontSize: 16, fontWeight: 700,
                        color: T.text, margin: 0, lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {prop.title || prop.name || 'Untitled Property'}
                      </h3>
                      <div style={{
                        fontFamily: T.serif, fontSize: 17, fontWeight: 700,
                        color: T.primary, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {formatPrice(prop.price)}
                      </div>
                    </div>

                    {prop.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <MapPin size={13} color={T.muted} />
                        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.muted }}>
                          {typeof prop.location === 'object'
                            ? `${prop.location.area || ''}, ${prop.location.city || 'Vadodara'}`
                            : prop.location}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      {prop.bedrooms && (
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.sub }}>
                          🛏 {prop.bedrooms} BHK
                        </span>
                      )}
                      {prop.area && (
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.sub }}>
                          📐 {prop.area} sq.ft
                        </span>
                      )}
                      {prop.propertyType && (
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.sub }}>
                          🏷 {prop.propertyType.charAt(0) + prop.propertyType.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Why Rudra ─────────────────────────────────────────────── */}
      <section style={{
        background: T.text, padding: '80px 40px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              fontFamily: T.sans, fontSize: 12, fontWeight: 600,
              color: '#FED7AA', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Why Choose Us
            </span>
            <h2 style={{
              fontFamily: T.serif, fontSize: 38, color: T.white,
              margin: '12px 0 0', fontWeight: 700, letterSpacing: '-0.5px',
            }}>
              Your Trusted Partner in<br />Every Property Journey
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {[
              { icon: Shield,    color: '#FED7AA', title: 'Verified Listings',  body: 'Every property is physically verified and legally vetted before listing.' },
              { icon: TrendingUp,color: T.primary, title: 'Market Intelligence',body: 'Real-time pricing data from thousands of transactions across Vadodara.' },
              { icon: Scale,     color: '#86EFAC', title: 'Legal Support',      body: 'In-house legal team for property documentation and due diligence.' },
              { icon: Star,      color: '#FDE68A', title: '5-Star Service',     body: 'Dedicated relationship managers who guide you from search to handover.' },
            ].map(({ icon: Icon, color, title, body }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '28px 24px',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={22} color={color} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: 17, color: T.white, margin: '0 0 10px', fontWeight: 700 }}>
                  {title}
                </h3>
                <p style={{ fontFamily: T.sans, fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Access Strip ────────────────────────────────────── */}
      <section style={{ padding: '64px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: T.serif, fontSize: 34, color: T.text, margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            More Tools for You
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: Map,        label: 'Map Search',       path: '/map',              color: '#0EA5E9' },
            { icon: Calculator, label: 'EMI Calculator',   path: '/calculators',      color: T.primary },
            { icon: Heart,      label: 'My Wishlist',      path: '/wishlist',         color: '#E11D48' },
            { icon: Scale,      label: 'Lawyers',          path: '/lawyers',          color: '#7C5CFC' },
            { icon: MapPin,     label: 'Post Requirement', path: '/land-requirement', color: T.amber   },
            { icon: Phone,      label: 'Contact Us',       path: '/contact',          color: T.emerald },
          ].map(({ icon: Icon, label, path, color }) => (
            <button key={label} onClick={() => navigate(path)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: T.white, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: '14px 20px',
              fontFamily: T.sans, fontSize: 14, fontWeight: 500,
              color: T.text, cursor: 'pointer',
              transition: 'all 0.22s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.08)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              <Icon size={18} color={color} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section style={{ padding: '0 40px 80px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          background: `linear-gradient(135deg, ${T.primary} 0%, #8B3A00 100%)`,
          borderRadius: 24, padding: '60px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -60, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: T.serif, fontSize: 36, color: T.white, margin: '0 0 12px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Ready to Find Your Dream Property?
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
              Talk to our experts today — free consultation, no commitment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, position: 'relative', flexShrink: 0 }}>
            <button onClick={() => navigate('/properties')} style={{
              background: T.white, color: T.primary,
              border: 'none', borderRadius: 10, padding: '14px 24px',
              fontFamily: T.sans, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Browse Properties <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/contact')} style={{
              background: 'rgba(255,255,255,0.15)', color: T.white,
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10,
              padding: '14px 24px', fontFamily: T.sans, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        background: '#110800', padding: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home size={15} color={T.white} />
          </div>
          <span style={{ fontFamily: T.serif, fontSize: 16, color: T.white, fontWeight: 700 }}>
            Rudra Real Estate
          </span>
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          © {new Date().getFullYear()} Rudra Real Estate, Vadodara. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Properties', path: '/properties' },
            { label: 'Land',       path: '/land' },
            { label: 'Lawyers',    path: '/lawyers' },
            { label: 'Contact',    path: '/contact' },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.sans, fontSize: 13, color: 'rgba(255,255,255,0.45)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
            >
              {label}
            </button>
          ))}
        </div>
      </footer>

      {/* ── CSS animations ────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
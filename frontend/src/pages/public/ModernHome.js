import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Sparkles, MapPin,
  Star, ChevronDown,
} from 'lucide-react';
import { propertyAPI } from '../../services/api';
import { useLanguage } from '../../utils/LanguageContext';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatPrice = (p) => {
  if (!p) return '–';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${Number(p).toLocaleString('en-IN')}`;
};

const getImageUrl = (img) => {
  if (!img) return null;
  try {
    const arr = typeof img === 'string' ? JSON.parse(img) : img;
    if (Array.isArray(arr) && arr.length > 0) {
      const f = arr[0];
      return typeof f === 'string' ? f : f?.url || f?.thumbnail;
    }
  } catch {}
  return typeof img === 'string' ? img : null;
};

// ── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  cream:    '#FAF5EE',
  card:     '#FFFFFF',
  border:   '#EDE5D8',
  brown:    '#1A0800',
  brownMid: '#4A2C1A',
  muted:    '#7A5C48',
  accent:   '#C84B00',
  accentL:  '#FEF0E8',
  gold:     '#D4A853',
  serif:    'Georgia, "Times New Roman", serif',
  sans:     "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

// ── Page Translations ─────────────────────────────────────────────────────
const PAGE_T = {
  en: {
    badge:            "Vadodara's Premier Real Estate Platform",
    heroTitle1:       'Find Your',
    heroTitle2:       'Dream Property',
    heroSubtitle:     'Premium residential, commercial & land properties across Vadodara — with verified brokers and expert legal support.',
    searchPlaceholder:'Location, type, keyword...',
    searchBtn:        'Search',
    quickLinks: [
      { label: '🏠 Residential', to: '/properties?type=RESIDENTIAL' },
      { label: '🏢 Commercial',  to: '/properties?type=COMMERCIAL'  },
      { label: '🌾 Land',        to: '/land-listings'                },
      { label: '⚖️ Legal Help',  to: '/lawyers'                     },
    ],
    statsLabels:      ['Properties Listed', 'Happy Clients', 'Verified Brokers', 'Success Rate'],
    liveListings:     'Live Listings',
    featuredProps:    'Featured Properties',
    viewAll:          'View All',
    allProps:         'All Properties',
    buy:              '🏷️ Buy',
    rent:             '🔑 Rent / Lease',
    typeLabels:       ['All', 'Residential', 'Commercial', 'Land', 'Agricultural', 'Industrial'],
    forSale:          'For Sale',
    forRent:          'For Rent',
    noProps:          'No properties found',
    noPropsSubtitle:  'Try changing filters or search keyword',
    clearFilters:     'Clear Filters',
    viewAllProps:     'View All',
    ourAdvantage:     'Our Advantage',
    whyTitle:         'Why Choose Rudra Real Estate?',
    whyCards: [
      { icon: '🏙️', title: 'Prime Locations',  desc: 'Vadodara & Gujarat\'s best properties — curated, verified, and always updated.' },
      { icon: '⚖️', title: 'Legal Support',    desc: 'Complete documentation, title verification, and expert legal guidance at every step.' },
      { icon: '💰', title: 'Best Prices',      desc: 'Data-driven pricing ensures you always buy or sell at fair market value.' },
      { icon: '👔', title: 'Expert Brokers',   desc: 'Verified professionals with deep local knowledge guiding every transaction.' },
    ],
    navLinks: [
      { label: '🏠 Browse Properties', to: '/properties',       solid: true  },
      { label: '🌾 Land & Plots',       to: '/land-listings',    solid: false },
      { label: '⚖️ Legal Consultation', to: '/lawyers',          solid: false },
      { label: '📊 Compare Properties', to: '/compare',          solid: false },
      { label: '🔑 Book Consultation',  to: '/book-consultation',solid: false },
    ],
    clientStories:    'Client Stories',
    testimonialsTitle:'What Our Clients Say',
    testimonials: [
      { name: 'Rajesh Patel', role: 'Property Buyer',   stars: 5, text: 'Found my dream home in Alkapuri in just 2 weeks. Professional service and genuine support throughout.' },
      { name: 'Priya Shah',   role: 'Land Investor',    stars: 5, text: 'Agricultural land investment was seamless. The legal guidance provided was truly exceptional.' },
      { name: 'Amit Mehta',   role: 'First-time Buyer', stars: 5, text: 'Legal consultation saved me from a bad deal. Highly recommended for everyone buying property!' },
    ],
    ctaTitle:         'Ready to Find Your Property?',
    ctaSubtitle:      "Join thousands of satisfied clients across Gujarat's finest real estate platform.",
    browseProps:      'Browse Properties',
    bookLegal:        '⚖️ Book Legal Consultation',
    ctaLinks: [
      { label: 'Land & Plots',    to: '/land-listings'     },
      { label: 'Find a Lawyer',   to: '/lawyers'           },
      { label: 'Saved Properties',to: '/wishlist'          },
      { label: 'Calculate EMI',   to: '/calculators'       },
      { label: 'Schedule a Tour', to: '/schedule-tour'     },
    ],
  },

  gu: {
    badge:            'વડોદરાનું પ્રીમિયર રિયલ એસ્ટેટ પ્લેટફોર્મ',
    heroTitle1:       'તમારી',
    heroTitle2:       'સ્વપ્ન પ્રોપર્ટી શોધો',
    heroSubtitle:     'વડોદરામાં ઉત્તમ રહેણાંક, વ્યાવસાયિક અને જમીન મિલકતો — ચકાસાયેલ બ્રોકર અને નિષ્ણાત કાનૂની સહાય સાથે.',
    searchPlaceholder:'સ્થળ, પ્રકાર, કીવર્ડ...',
    searchBtn:        'શોધો',
    quickLinks: [
      { label: '🏠 રહેણાંક',    to: '/properties?type=RESIDENTIAL' },
      { label: '🏢 વ્યાવસાયિક', to: '/properties?type=COMMERCIAL'  },
      { label: '🌾 જમીન',       to: '/land-listings'                },
      { label: '⚖️ કાનૂની',     to: '/lawyers'                     },
    ],
    statsLabels:      ['મિલકત નોંધાઈ', 'ખુશ ગ્રાહકો', 'ચકાસાયેલ બ્રોકર', 'સફળતા દર'],
    liveListings:     'લાઇવ લિસ્ટિંગ',
    featuredProps:    'ફીચર્ડ પ્રોપર્ટી',
    viewAll:          'બધી જુઓ',
    allProps:         'બધી મિલકત',
    buy:              '🏷️ ખરીદો',
    rent:             '🔑 ભાડે',
    typeLabels:       ['બધી', 'રહેણાંક', 'વ્યાવસાયિક', 'જમીન', 'ખેતી', 'ઔદ્યોગિક'],
    forSale:          'વેચાણ માટે',
    forRent:          'ભાડે',
    noProps:          'કોઈ પ્રોપર્ટી મળી નથી',
    noPropsSubtitle:  'ફિલ્ટર બદલો અથવા શોધ બદલો',
    clearFilters:     'ફિલ્ટર સાફ કરો',
    viewAllProps:     'બધી જુઓ',
    ourAdvantage:     'અમારો ફાયદો',
    whyTitle:         'Rudra Real Estate કેમ પસંદ કરો?',
    whyCards: [
      { icon: '🏙️', title: 'પ્રીમ સ્થળો',      desc: 'વડોદરા અને ગુજરાતની શ્રેષ્ઠ મિલકતો — ચકાસાયેલ અને હંમેશા અપ-ટૂ-ડેટ.' },
      { icon: '⚖️', title: 'કાનૂની સહાય',      desc: 'સંપૂર્ણ દસ્તાવેજ, ટાઇટલ ચકાસણી અને દરેક પગલે નિષ્ણાત કાનૂની માર્ગદર્શન.' },
      { icon: '💰', title: 'શ્રેષ્ઠ ભાવ',       desc: 'ડેટા-આધારિત ભાવ સુનિશ્ચિત કરે છે કે તમે હંમેશા ઉચિત બજાર ભાવે ખરીદો-વેચો.' },
      { icon: '👔', title: 'નિષ્ણાત બ્રોકર',   desc: 'ઊંડા સ્થાનિક જ્ઞાન સાથે ચકાસાયેલ વ્યાવસાયિકો દરેક વ્યવહારમાં માર્ગદર્શન આપે.' },
    ],
    navLinks: [
      { label: '🏠 મિલકત જુઓ',      to: '/properties',       solid: true  },
      { label: '🌾 જમીન અને પ્લોટ', to: '/land-listings',    solid: false },
      { label: '⚖️ કાનૂની સલાહ',    to: '/lawyers',          solid: false },
      { label: '📊 મિલકત સરખામણી',  to: '/compare',          solid: false },
      { label: '🔑 સલાહ બુક',        to: '/book-consultation',solid: false },
    ],
    clientStories:    'ગ્રાહક અનુભવ',
    testimonialsTitle:'અમારા ગ્રાહકો શું કહે છે',
    testimonials: [
      { name: 'રાજેશ પટેલ', role: 'મિલકત ખરીદનાર',     stars: 5, text: 'અલ્કાપુરીમાં 2 અઠવાડિયામાં સ્વપ્ન ઘર મળ્યું. વ્યાવસાયિક સેવા, ખરો સહયોગ.' },
      { name: 'પ્રિયા શાહ', role: 'જમીન રોકાણકાર',      stars: 5, text: 'ખેતીની જમીન રોકાણ સરળ રહ્યું. કાનૂની માર્ગદર્શન ઉત્કૃષ્ટ હતું.' },
      { name: 'અમિત મહેતા', role: 'પ્રથમ વખત ખરીદનાર', stars: 5, text: 'કાનૂની સલાહે ખરાબ સોદાથી બચાવ્યો. બધા માટે ભારપૂર્વક ભલામણ!' },
    ],
    ctaTitle:         'તમારી મિલકત શોધવા તૈયાર છો?',
    ctaSubtitle:      'ગુજરાતના શ્રેષ્ઠ રિયલ એસ્ટેટ પ્લેટફોર્મ પર હજારો ખુશ ગ્રાહકો સાથે જોડાઓ.',
    browseProps:      'મિલકત જુઓ',
    bookLegal:        '⚖️ કાનૂની સલાહ બુક',
    ctaLinks: [
      { label: 'જમીન અને પ્લોટ',  to: '/land-listings'     },
      { label: 'વકીલ શોધો',        to: '/lawyers'           },
      { label: 'સેવ કરેલ મિલકત',   to: '/wishlist'          },
      { label: 'EMI ગણો',          to: '/calculators'       },
      { label: 'ટૂર સુનિશ્ચિત',    to: '/schedule-tour'     },
    ],
  },

  hi: {
    badge:            'वडोदरा का प्रीमियर रियल एस्टेट प्लेटफॉर्म',
    heroTitle1:       'अपनी',
    heroTitle2:       'सपनों की प्रॉपर्टी खोजें',
    heroSubtitle:     'वडोदरा में बेहतरीन आवासीय, व्यावसायिक और जमीन की संपत्तियाँ — सत्यापित ब्रोकर और विशेषज्ञ कानूनी सहायता के साथ।',
    searchPlaceholder:'स्थान, प्रकार, कीवर्ड...',
    searchBtn:        'खोजें',
    quickLinks: [
      { label: '🏠 आवासीय',      to: '/properties?type=RESIDENTIAL' },
      { label: '🏢 व्यावसायिक',  to: '/properties?type=COMMERCIAL'  },
      { label: '🌾 ज़मीन',        to: '/land-listings'                },
      { label: '⚖️ कानूनी',      to: '/lawyers'                     },
    ],
    statsLabels:      ['संपत्तियाँ सूचीबद्ध', 'खुश ग्राहक', 'सत्यापित ब्रोकर', 'सफलता दर'],
    liveListings:     'लाइव लिस्टिंग',
    featuredProps:    'फीचर्ड प्रॉपर्टी',
    viewAll:          'सभी देखें',
    allProps:         'सभी संपत्तियाँ',
    buy:              '🏷️ खरीदें',
    rent:             '🔑 किराया',
    typeLabels:       ['सभी', 'आवासीय', 'व्यावसायिक', 'जमीन', 'कृषि', 'औद्योगिक'],
    forSale:          'बिक्री के लिए',
    forRent:          'किराये पर',
    noProps:          'कोई संपत्ति नहीं मिली',
    noPropsSubtitle:  'फ़िल्टर या खोज बदलें',
    clearFilters:     'फ़िल्टर साफ़ करें',
    viewAllProps:     'सभी देखें',
    ourAdvantage:     'हमारा लाभ',
    whyTitle:         'Rudra Real Estate क्यों चुनें?',
    whyCards: [
      { icon: '🏙️', title: 'प्राइम लोकेशन',      desc: 'वडोदरा और गुजरात की सर्वश्रेष्ठ संपत्तियाँ — क्यूरेटेड, सत्यापित और हमेशा अपडेटेड।' },
      { icon: '⚖️', title: 'कानूनी सहायता',      desc: 'पूर्ण दस्तावेज़ीकरण, टाइटल सत्यापन और हर कदम पर विशेषज्ञ कानूनी मार्गदर्शन।' },
      { icon: '💰', title: 'सर्वोत्तम कीमत',     desc: 'डेटा-संचालित मूल्य निर्धारण सुनिश्चित करता है कि आप हमेशा उचित बाजार मूल्य पर खरीदें या बेचें।' },
      { icon: '👔', title: 'विशेषज्ञ ब्रोकर',    desc: 'गहरे स्थानीय ज्ञान के साथ सत्यापित पेशेवर हर लेनदेन में मार्गदर्शन करते हैं।' },
    ],
    navLinks: [
      { label: '🏠 संपत्तियाँ देखें',  to: '/properties',       solid: true  },
      { label: '🌾 ज़मीन और प्लॉट',    to: '/land-listings',    solid: false },
      { label: '⚖️ कानूनी परामर्श',   to: '/lawyers',          solid: false },
      { label: '📊 संपत्ति तुलना',     to: '/compare',          solid: false },
      { label: '🔑 परामर्श बुक',       to: '/book-consultation',solid: false },
    ],
    clientStories:    'ग्राहक अनुभव',
    testimonialsTitle:'हमारे ग्राहक क्या कहते हैं',
    testimonials: [
      { name: 'राजेश पटेल', role: 'संपत्ति खरीदार',      stars: 5, text: 'अलकापुरी में 2 हफ्तों में सपनों का घर मिला। पेशेवर सेवा, सच्चा समर्थन।' },
      { name: 'प्रिया शाह', role: 'भूमि निवेशक',          stars: 5, text: 'कृषि भूमि निवेश सहज रहा। कानूनी मार्गदर्शन असाधारण था।' },
      { name: 'अमित मेहता', role: 'पहली बार खरीदने वाले', stars: 5, text: 'कानूनी परामर्श ने बुरे सौदे से बचाया। सभी के लिए दृढ़ता से अनुशंसित!' },
    ],
    ctaTitle:         'अपनी संपत्ति खोजने के लिए तैयार हैं?',
    ctaSubtitle:      'गुजरात के सबसे बेहतरीन रियल एस्टेट प्लेटफॉर्म पर हजारों संतुष्ट ग्राहकों से जुड़ें।',
    browseProps:      'संपत्तियाँ देखें',
    bookLegal:        '⚖️ कानूनी परामर्श बुक',
    ctaLinks: [
      { label: 'ज़मीन और प्लॉट',   to: '/land-listings'     },
      { label: 'वकील खोजें',       to: '/lawyers'           },
      { label: 'सहेजी संपत्तियाँ', to: '/wishlist'          },
      { label: 'EMI कैलकुलेट',     to: '/calculators'       },
      { label: 'टूर शेड्यूल',      to: '/schedule-tour'     },
    ],
  },
};

const TYPE_CONFIG = {
  RESIDENTIAL:  { icon: '🏠', color: '#7C5CFC' },
  COMMERCIAL:   { icon: '🏢', color: '#0EA5E9' },
  AGRICULTURAL: { icon: '🌾', color: '#16A34A' },
  INDUSTRIAL:   { icon: '🏭', color: '#F59E0B' },
  LAND:         { icon: '🗺️', color: '#84CC16' },
};

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80&fit=crop',
];

function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(String(target).replace(/\D/g, ''), 10);
    const suffix = String(target).replace(/\d/g, '');
    let start = 0;
    const step = Math.max(1, Math.ceil(num / (duration / 16)));
    const id = setInterval(() => {
      start = Math.min(start + step, num);
      setCount(start + suffix);
      if (start >= num) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return count;
}

const StatItem = ({ value, label, border }) => {
  const count = useCountUp(value);
  return (
    <div style={{ textAlign: 'center', padding: '8px 24px', borderRight: border ? `1px solid ${C.border}` : 'none' }}>
      <p style={{ fontFamily: C.serif, fontSize: 38, fontWeight: 700, color: C.accent, margin: '0 0 4px', lineHeight: 1 }}>{count}</p>
      <p style={{ color: C.muted, fontSize: 13, margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    </div>
  );
};

const PropertyCard = ({ property, navigate, index, txt }) => {
  const cfg   = TYPE_CONFIG[property.type] || TYPE_CONFIG.RESIDENTIAL;
  const img   = getImageUrl(property.images);
  const isLand = ['LAND', 'AGRICULTURAL'].includes(property.type);
  return (
    <div onClick={() => navigate(`/property/${property.id}`)}
      style={{ background: C.card, borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(26,8,0,0.06)',
        transition: 'transform 0.25s, box-shadow 0.25s', animation: `riseIn 0.5s ease ${index * 0.07}s both` }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(26,8,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,8,0,0.06)'; }}>
      <div style={{ height: 200, background: C.accentL, position: 'relative', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{cfg.icon}</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,8,0,0.45) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: cfg.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
            {property.type}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: property.purpose === 'SALE' ? '#FEF3C7' : '#E0F2FE',
            color:      property.purpose === 'SALE' ? '#92400E' : '#0369A1' }}>
            {property.purpose === 'SALE' ? txt.forSale : txt.forRent}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <p style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <h3 style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 700, color: C.brown, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 12, marginBottom: 12 }}>
          <MapPin size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[property.city, property.state].filter(Boolean).join(', ') || 'Vadodara'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: C.muted }}>
          {property.area && <span style={{ background: '#F5F0EA', borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>📐 {property.area?.toLocaleString()} {isLand ? (property.areaUnit || 'sqft') : 'sqft'}</span>}
          {!isLand && property.bedrooms && <span style={{ background: '#F5F0EA', borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>🛏 {property.bedrooms} BHK</span>}
          {!isLand && property.bathrooms && <span style={{ background: '#F5F0EA', borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>🚿 {property.bathrooms}</span>}
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export default function ModernHome() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const txt = PAGE_T[language] || PAGE_T.en;

  const [heroIdx,       setHeroIdx]       = useState(0);
  const [properties,    setProperties]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [totalCount,    setTotalCount]    = useState(120);
  const [visible,       setVisible]       = useState(false);
  const [scrollY,       setScrollY]       = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMGS.length), 5500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res  = await propertyAPI.getAll({ limit: 9, status: 'AVAILABLE' });
        const data = res.data;
        setProperties(data?.properties || []);
        setTotalCount(data?.total || data?.count || 120);
      } catch { setProperties([]); }
      finally  { setLoading(false); }
    })();
  }, []);

  const TYPE_FILTERS = [
    { value: 'all',          label: txt.typeLabels[0], icon: '🏘️' },
    { value: 'RESIDENTIAL',  label: txt.typeLabels[1], icon: '🏠' },
    { value: 'COMMERCIAL',   label: txt.typeLabels[2], icon: '🏢' },
    { value: 'LAND',         label: txt.typeLabels[3], icon: '🗺️' },
    { value: 'AGRICULTURAL', label: txt.typeLabels[4], icon: '🌾' },
    { value: 'INDUSTRIAL',   label: txt.typeLabels[5], icon: '🏭' },
  ];

  const filtered = properties.filter(p => {
    const tp  = typeFilter    === 'all' || p.type    === typeFilter;
    const pur = purposeFilter === 'all' || p.purpose === purposeFilter;
    const s   = !search || p.title?.toLowerCase().includes(search.toLowerCase())
      || p.city?.toLowerCase().includes(search.toLowerCase())
      || p.address?.toLowerCase().includes(search.toLowerCase());
    return tp && pur && s;
  });

  const handleSearch = () => {
    if (search.trim()) navigate(`/properties?search=${encodeURIComponent(search)}`);
    else document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: C.sans, background: C.cream, minHeight: '100vh' }}>
      <style>{`
        @keyframes riseIn  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
        .hero-shimmer { background:linear-gradient(90deg,#C84B00,#E8853A,#D4A853,#C84B00); background-size:300% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        .why-card:hover  { transform:translateY(-5px)!important; border-color:rgba(200,75,0,0.35)!important; }
        .pill-btn:hover  { background:${C.accentL}!important; color:${C.accent}!important; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:${C.accent}; border-radius:4px; }
      `}</style>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', minHeight: 600 }}>
        {HERO_IMGS.map((src, i) => (
          <img key={i} src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === heroIdx ? 1 : 0, filter: 'brightness(0.38)', transform: i === heroIdx ? 'scale(1.05)' : 'scale(1)', transition: 'opacity 1.6s ease, transform 8s ease' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,4,0,0.2) 0%, rgba(10,4,0,0.62) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(212,168,83,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.05) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 28 : 8, height: 8, borderRadius: 4, border: 'none', background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', paddingBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(200,75,0,0.25)', border: '1px solid rgba(200,75,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: 99, padding: '8px 20px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.6s ease' }}>
            <Sparkles size={14} color="#D4A853" />
            <span style={{ color: '#D4A853', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{txt.badge}</span>
          </div>

          <h1 style={{ fontFamily: C.serif, fontSize: 'clamp(42px,7vw,86px)', fontWeight: 400, color: '#FFF8F0', lineHeight: 1.1, margin: '0 0 16px', maxWidth: 860, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.1s' }}>
            {txt.heroTitle1}<br /><span className="hero-shimmer">{txt.heroTitle2}</span>
          </h1>

          <p style={{ color: 'rgba(255,248,240,0.78)', fontSize: 'clamp(15px,2vw,19px)', maxWidth: 520, lineHeight: 1.7, margin: '0 0 40px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.2s' }}>
            {txt.heroSubtitle}
          </p>

          <div style={{ display: 'flex', background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 580, width: '100%', boxShadow: '0 24px 56px rgba(0,0,0,0.3)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.3s' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
              <Search size={18} color={C.accent} style={{ flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={txt.searchPlaceholder}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: C.brown, padding: '16px 0', fontFamily: C.sans, background: 'transparent' }} />
            </div>
            <button onClick={handleSearch} style={{ background: C.accent, color: '#fff', border: 'none', padding: '0 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: C.sans, display: 'flex', alignItems: 'center', gap: 8 }}>
              {txt.searchBtn} <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center', opacity: visible ? 1 : 0, transition: 'all 0.7s ease 0.4s' }}>
            {txt.quickLinks.map(({ label, to }) => (
              <button key={to} onClick={() => navigate(to)}
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', borderRadius: 99, padding: '7px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 68, left: '50%', transform: 'translateX(-50%)', opacity: Math.max(0, 1 - scrollY * 0.008), animation: 'bounce 1.8s ease-in-out infinite', textAlign: 'center' }}>
          <ChevronDown size={20} color="rgba(255,255,255,0.6)" />
        </div>
      </section>

      {/* STATS */}
      <div style={{ background: C.card, borderTop: `3px solid ${C.accent}`, borderBottom: `1px solid ${C.border}`, padding: '36px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { value: `${totalCount}+`, label: txt.statsLabels[0], border: true  },
            { value: '500+',           label: txt.statsLabels[1], border: true  },
            { value: '30+',            label: txt.statsLabels[2], border: true  },
            { value: '98%',            label: txt.statsLabels[3], border: false },
          ].map(s => <StatItem key={s.label} {...s} />)}
        </div>
      </div>

      {/* LISTINGS */}
      <div id="listings" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: C.accent, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{txt.liveListings}</p>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,40px)', color: C.brown, margin: 0, fontWeight: 400 }}>{txt.featuredProps}</h2>
          </div>
          <button onClick={() => navigate('/properties')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, background: C.accentL, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {txt.viewAll} <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ v: 'all', l: txt.allProps }, { v: 'SALE', l: txt.buy }, { v: 'RENT', l: txt.rent }].map(f => (
            <button key={f.v} onClick={() => setPurposeFilter(f.v)}
              style={{ padding: '7px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                border:     purposeFilter === f.v ? 'none'   : `1px solid ${C.border}`,
                background: purposeFilter === f.v ? C.accent : C.card,
                color:      purposeFilter === f.v ? '#fff'   : C.muted,
                boxShadow:  purposeFilter === f.v ? '0 4px 14px rgba(200,75,0,0.28)' : 'none' }}>
              {f.l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 36, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)} className="pill-btn"
              style={{ padding: '7px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
                border:     typeFilter === f.value ? 'none'   : `1px solid ${C.border}`,
                background: typeFilter === f.value ? C.accent : C.card,
                color:      typeFilter === f.value ? '#fff'   : C.muted,
                boxShadow:  typeFilter === f.value ? '0 4px 14px rgba(200,75,0,0.28)' : 'none' }}>
              {f.icon} {f.label}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                background: typeFilter === f.value ? 'rgba(255,255,255,0.25)' : '#F5EDE6',
                color:      typeFilter === f.value ? '#fff' : C.accent }}>
                {f.value === 'all' ? properties.length : properties.filter(p => p.type === f.value).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 320, background: '#EDE5D8', borderRadius: 20, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 24px' }}>
            <p style={{ fontSize: 56, marginBottom: 16 }}>🏚️</p>
            <h3 style={{ fontFamily: C.serif, fontSize: 22, color: C.brown, margin: '0 0 8px' }}>{txt.noProps}</h3>
            <p style={{ color: C.muted, marginBottom: 20 }}>{txt.noPropsSubtitle}</p>
            <button onClick={() => { setTypeFilter('all'); setPurposeFilter('all'); setSearch(''); }}
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: C.sans }}>
              {txt.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
              {filtered.slice(0, 9).map((p, i) => <PropertyCard key={p.id} property={p} navigate={navigate} index={i} txt={txt} />)}
            </div>
            {filtered.length > 9 && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button onClick={() => navigate('/properties')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.accent, color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,75,0,0.3)', fontFamily: C.sans }}>
                  {txt.viewAllProps} {filtered.length} <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* WHY CHOOSE US */}
      <div style={{ background: '#1A0800', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: C.accent, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{txt.ourAdvantage}</p>
            <h2 style={{ fontFamily: C.serif, color: '#FFF8F0', fontSize: 'clamp(26px,4vw,42px)', fontWeight: 400, margin: 0 }}>{txt.whyTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {txt.whyCards.map((f, i) => (
              <div key={i} className="why-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,75,0,0.18)', borderRadius: 20, padding: 32, transition: 'all 0.3s', cursor: 'default', animation: `riseIn 0.5s ease ${i * 0.1}s both` }}>
                <div style={{ fontSize: 40, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: C.serif, color: '#FFF8F0', fontSize: 20, fontWeight: 400, margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ color: '#8B6F5C', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            {txt.navLinks.map(({ label, to, solid }) => (
              <button key={to} onClick={() => navigate(to)}
                style={{ padding: '11px 24px', borderRadius: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: C.sans,
                  background: solid ? C.accent : 'transparent',
                  color:      solid ? '#fff'   : '#FFF8F0',
                  border:     solid ? 'none'   : '1px solid rgba(255,255,255,0.25)',
                  boxShadow:  solid ? '0 6px 20px rgba(200,75,0,0.35)' : 'none' }}
                onMouseEnter={e => { if (!solid) e.currentTarget.style.borderColor = 'rgba(200,75,0,0.6)'; }}
                onMouseLeave={e => { if (!solid) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: C.cream, borderTop: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: C.accent, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{txt.clientStories}</p>
            <h2 style={{ fontFamily: C.serif, fontSize: 'clamp(26px,4vw,40px)', color: C.brown, fontWeight: 400, margin: 0 }}>{txt.testimonialsTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {txt.testimonials.map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 28, boxShadow: '0 2px 12px rgba(26,8,0,0.05)', animation: `riseIn 0.6s ease ${i * 0.12}s both` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {Array.from({ length: item.stars }).map((_, j) => <Star key={j} size={14} fill={C.gold} color={C.gold} />)}
                </div>
                <p style={{ color: C.brownMid, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 20px', fontSize: 15, fontFamily: C.serif }}>"{item.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${C.accent},#8B3000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: C.serif, fontWeight: 700, fontSize: 16 }}>
                    {item.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: C.brown, margin: 0, fontSize: 14 }}>{item.name}</p>
                    <p style={{ color: C.muted, margin: 0, fontSize: 12 }}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg,${C.accent} 0%,#8B3000 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: C.serif, color: '#FFF8F0', fontSize: 'clamp(26px,4vw,46px)', fontWeight: 400, margin: '0 0 16px' }}>{txt.ctaTitle}</h2>
          <p style={{ color: 'rgba(255,248,240,0.75)', fontSize: 17, marginBottom: 40, lineHeight: 1.65 }}>{txt.ctaSubtitle}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/properties')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: C.accent, border: 'none', padding: '14px 34px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: C.sans, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
              {txt.browseProps} <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/book-consultation')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#FFF8F0', fontFamily: C.sans, border: '2px solid rgba(255,248,240,0.4)', padding: '14px 30px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {txt.bookLegal}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            {txt.ctaLinks.map(({ label, to }) => (
              <button key={to} onClick={() => navigate(to)}
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,248,240,0.85)', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: C.sans, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
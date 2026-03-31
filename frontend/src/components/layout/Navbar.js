import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';
import {
  Home, Building2, Scale, MapPin, Heart, Calendar, Calculator,
  LayoutDashboard, LogOut, Menu, X, Globe, ChevronDown, MoreHorizontal,
  PlusCircle, List,
} from 'lucide-react';

/* ─── Design System ─────────────────────────────────────────────── */
const DS = {
  bg:      'rgba(255,252,249,0.97)',
  bgBlur:  'rgba(255,252,249,0.88)',
  border:  'rgba(200,150,100,0.12)',
  primary: '#B54000',
  accent:  '#C84B00',
  text:    '#1C0A00',
  sub:     '#7A5540',
  muted:   '#B89882',
  serif:   "'Cormorant Garamond', Georgia, serif",
  sans:    "'DM Sans', sans-serif",
};

/* ─── Translations ──────────────────────────────────────────────── */
const T = {
  en: { home:'Home', properties:'Properties', land:'Land', lawyers:'Lawyers', dashboard:'Dashboard', wishlist:'Wishlist', tours:'Tours', calculator:'Calculator', logout:'Sign Out', signIn:'Sign In', getStarted:'Get Started', more:'More', myProperties:'My Properties' },
  gu: { home:'હોમ', properties:'પ્રોપર્ટી', land:'જમીન', lawyers:'વકીલ', dashboard:'ડૅશ', wishlist:'વિશ', tours:'ટૂર', calculator:'કૅલ્ક', logout:'લૉગઆઉટ', signIn:'સાઇન ઇન', getStarted:'શરૂ', more:'વધુ', myProperties:'મારી પ્રોપર્ટી' },
  hi: { home:'होम', properties:'प्रॉपर्टी', land:'जमीन', lawyers:'वकील', dashboard:'डैश', wishlist:'विश', tours:'टूर', calculator:'कैल', logout:'साइन आउट', signIn:'साइन इन', getStarted:'शुरू', more:'अधिक', myProperties:'मेरी प्रॉपर्टी' },
};

const LANGS = [
  { code:'en', label:'English',  short:'EN' },
  { code:'gu', label:'ગુજરાતી', short:'ગુ' },
  { code:'hi', label:'हिंदी',   short:'हि' },
];

const COMMON = (t) => [
  { to:'/',              label:t('home'),       icon:Home      },
  { to:'/glass-cards',   label:t('properties'), icon:Building2 },
  { to:'/land-listings', label:t('land'),       icon:MapPin    },
  { to:'/lawyers',       label:t('lawyers'),    icon:Scale     },
];

const MORE_ITEMS = (t, role) => {
  const base = [
    { to:'/schedule-tour', label:t('tours'),      icon:Calendar   },
    { to:'/calculators',   label:t('calculator'), icon:Calculator },
  ];

  return base;
};

/* ─── Dropdown ──────────────────────────────────────────────────── */
const Dropdown = ({ trigger, children, align = 'right', wide }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}>{trigger(open)}</div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            background: DS.bg,
            border: `1px solid rgba(200,150,100,0.18)`,
            boxShadow: '0 12px 48px rgba(100,40,0,0.12), 0 2px 8px rgba(100,40,0,0.06)',
            backdropFilter: 'blur(20px)',
          }}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-3 ${wide ? 'w-64' : 'w-52'} rounded-2xl z-50 overflow-hidden py-2`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropItem = ({ to, icon: Icon, label, onClick, danger }) => {
  const color = danger ? '#B54000' : DS.sub;
  const content = (
    <div style={{ color, fontFamily: DS.sans }}
      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-50 cursor-pointer">
      {Icon && <Icon className="w-4 h-4 shrink-0 opacity-70" />}
      <span>{label}</span>
    </div>
  );
  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  return <Link to={to}>{content}</Link>;
};

const DDivider = () => <div style={{ borderColor: 'rgba(200,150,100,0.15)' }} className="border-t mx-4 my-1.5" />;

/* ─── Lang Switcher ─────────────────────────────────────────────── */
const LangSwitcher = ({ language, changeLanguage }) => (
  <Dropdown align="right"
    trigger={(open) => (
      <button style={{
          color: DS.sub,
          background: open ? 'rgba(200,75,0,0.06)' : 'transparent',
          fontFamily: DS.sans,
          border: `1px solid ${open ? 'rgba(200,75,0,0.15)' : 'transparent'}`,
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all">
        <Globe className="w-3.5 h-3.5 opacity-60" />
        <span style={{ fontFamily: DS.serif, fontStyle:'italic', fontSize:13 }}>
          {LANGS.find(l => l.code === language)?.short || 'EN'}
        </span>
      </button>
    )}>
    {LANGS.map(lang => (
      <button key={lang.code} onClick={() => changeLanguage(lang.code)}
        style={{
          background: language === lang.code ? 'rgba(200,75,0,0.06)' : 'transparent',
          color: language === lang.code ? DS.accent : DS.sub,
          fontFamily: DS.sans,
        }}
        className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium transition-all hover:opacity-60">
        <span>{lang.label}</span>
        {language === lang.code && <span style={{ color: DS.accent, fontFamily: DS.serif }} className="text-base">✦</span>}
      </button>
    ))}
  </Dropdown>
);

/* ─── NavLink ───────────────────────────────────────────────────── */
const NavLink = ({ to, label, location }) => {
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link to={to}
      style={{ fontFamily: DS.sans, color: active ? DS.accent : DS.sub, position:'relative' }}
      className="group px-1 py-1 text-[13.5px] font-medium transition-all hover:opacity-60 whitespace-nowrap">
      {label}
      <span style={{
          position:'absolute', bottom:-1, left:0, height:1.5, borderRadius:2,
          background: DS.accent,
          width: active ? '100%' : '0%',
          transition: 'width 0.25s ease',
        }} />
    </Link>
  );
};

/* ─── Main Component ────────────────────────────────────────────── */
const Navbar = () => {
  const { user, logout }             = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const [mobileOpen, setMobileOpen]  = useState(false);
  const [scrolled, setScrolled]      = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const t = (k) => T[language]?.[k] || T.en[k];
  const handleLogout = () => { logout(); navigate('/auth'); setMobileOpen(false); };
  const getDashLink = () => {
    if (user?.role === 'ADMIN')  return '/admin/dashboard';
    if (user?.role === 'BROKER') return '/broker/dashboard';
    if (user?.role === 'LAWYER') return '/lawyer/dashboard';
    return '/public/dashboard';
  };

  // Wishlist: only PUBLIC/USER — NOT broker
  const showWishlist = user && ['PUBLIC', 'USER'].includes(user.role);
  const isBroker     = user?.role === 'BROKER';
  const moreItems    = user ? MORE_ITEMS(t, user.role) : [];
  const common       = COMMON(t);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <nav style={{
          background: scrolled ? DS.bgBlur : DS.bg,
          borderBottom: `1px solid ${scrolled ? 'rgba(200,150,100,0.22)' : 'rgba(200,150,100,0.12)'}`,
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          boxShadow: scrolled ? '0 2px 24px rgba(100,40,0,0.07)' : 'none',
          transition: 'all 0.3s ease',
          fontFamily: DS.sans,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between" style={{ height: 60 }}>

            {/* ── Logo ── ONLY LINES 192-195 CHANGED ── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <img
                src="/rudra-logo.png"
                alt="Rudra Real Estate"
                className="w-9 h-9 rounded-xl object-contain transition-transform duration-300 group-hover:scale-95"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ background: DS.accent, display: 'none' }}
                className="w-8 h-8 rounded-xl items-center justify-center transition-transform duration-300 group-hover:scale-95">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:flex flex-col" style={{ gap: 1 }}>
                <span style={{ fontFamily: DS.serif, color: DS.text, letterSpacing:'-0.01em', lineHeight:1 }}
                  className="text-xl font-semibold">Rudra</span>
                <span style={{ color: DS.muted, fontFamily: DS.sans, letterSpacing:'0.18em', lineHeight:1 }}
                  className="text-[8px] font-medium uppercase">Real Estate</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-6">
              {common.map(link => <NavLink key={link.to} to={link.to} label={link.label} location={location} />)}

              {user && <div style={{ background: 'rgba(200,150,100,0.18)', width: 1, height: 18 }} />}

              {user && (
                <>
                  {/* Wishlist — only PUBLIC/USER */}
                  {showWishlist && <NavLink to="/wishlist" label={t('wishlist')} location={location} />}

                  {/* Broker quick links in top nav */}
                  {isBroker && (
                    <NavLink to="/broker/properties" label={t('myProperties')} location={location} />
                  )}

                  <NavLink to={getDashLink()} label={t('dashboard')} location={location} />

                  <Dropdown wide trigger={(open) => (
                    <button style={{
                        color: open ? DS.accent : DS.sub,
                        background: open ? 'rgba(200,75,0,0.06)' : 'transparent',
                        border: `1px solid ${open ? 'rgba(200,75,0,0.15)' : 'transparent'}`,
                        fontFamily: DS.sans,
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13.5px] font-medium transition-all">
                      <MoreHorizontal className="w-3.5 h-3.5 opacity-70" />
                      {t('more')}
                      <ChevronDown className="w-3 h-3 opacity-50 transition-transform duration-200"
                        style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  )}>
                    {moreItems.map(item => <DropItem key={item.to} {...item} />)}

                    <DDivider />

                    <div style={{ color: DS.muted, fontFamily: DS.sans }}
                      className="px-5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                      Language
                    </div>
                    {LANGS.map(lang => (
                      <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                        style={{
                          background: language === lang.code ? 'rgba(200,75,0,0.06)' : 'transparent',
                          color: language === lang.code ? DS.accent : DS.sub,
                          fontFamily: DS.sans,
                        }}
                        className="w-full flex items-center justify-between px-5 py-2 text-[13px] font-medium transition-all hover:opacity-60">
                        <span className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 opacity-50" />
                          {lang.label}
                        </span>
                        {language === lang.code && <span style={{ color: DS.accent, fontFamily: DS.serif }} className="text-sm">✦</span>}
                      </button>
                    ))}

                    <DDivider />

                    <div className="px-5 py-2.5">
                      <p style={{ color: DS.text, fontFamily: DS.serif }} className="text-[15px] font-semibold leading-none truncate">{user.name}</p>
                      <p style={{ color: DS.muted, fontFamily: DS.sans }} className="text-[11px] mt-0.5 capitalize tracking-wide">{user.role?.toLowerCase()}</p>
                    </div>

                    <DDivider />

                    <DropItem icon={LogOut} label={t('logout')} onClick={handleLogout} danger />
                  </Dropdown>
                </>
              )}

              {!user && (
                <div className="flex items-center gap-3">
                  <LangSwitcher language={language} changeLanguage={changeLanguage} />
                  <div style={{ background: 'rgba(200,150,100,0.18)', width: 1, height: 18 }} />
                  <Link to="/auth" style={{ color: DS.sub, fontFamily: DS.sans }}
                    className="text-[13.5px] font-medium px-2 py-1.5 transition-all hover:opacity-60">
                    {t('signIn')}
                  </Link>
                  <Link to="/auth" style={{ background: DS.accent, fontFamily: DS.sans }}
                    className="text-[13px] font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90">
                    {t('getStarted')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center gap-2">
              {!user && <LangSwitcher language={language} changeLanguage={changeLanguage} />}
              <button onClick={() => setMobileOpen(o => !o)}
                style={{
                  color: DS.sub,
                  background: mobileOpen ? 'rgba(200,75,0,0.06)' : 'transparent',
                  border: `1px solid ${mobileOpen ? 'rgba(200,75,0,0.15)' : 'transparent'}`,
                }}
                className="p-2 rounded-xl transition-all">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div style={{
            borderTop: mobileOpen ? `1px solid rgba(200,150,100,0.12)` : 'none',
            background: DS.bg,
            maxHeight: mobileOpen ? '82vh' : '0px',
            overflow: mobileOpen ? 'auto' : 'hidden',
            transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}
          className="lg:hidden">
          <div className="px-5 py-5">

            <p style={{ color: DS.muted, fontFamily: DS.sans }}
              className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-2">Navigation</p>

            <div className="space-y-0.5">
              {common.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                return (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    style={{
                      color: active ? DS.accent : DS.sub,
                      background: active ? 'rgba(200,75,0,0.05)' : 'transparent',
                      borderLeft: `2px solid ${active ? DS.accent : 'transparent'}`,
                      fontFamily: DS.sans,
                    }}
                    className="flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-r-xl text-[13.5px] font-medium transition-all">
                    <Icon className="w-4 h-4 shrink-0 opacity-60" />{label}
                  </Link>
                );
              })}
            </div>

            {user && (
              <>
                <div style={{ borderColor: 'rgba(200,150,100,0.15)' }} className="border-t my-4" />

                <div className="px-2 mb-3">
                  <p style={{ color: DS.text, fontFamily: DS.serif }} className="text-base font-semibold">{user.name}</p>
                  <p style={{ color: DS.muted, fontFamily: DS.sans }} className="text-[11px] capitalize tracking-wide">{user.role?.toLowerCase()}</p>
                </div>

                <p style={{ color: DS.muted, fontFamily: DS.sans }}
                  className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-2">My Space</p>

                <div className="space-y-0.5">
                  <Link to={getDashLink()} onClick={() => setMobileOpen(false)}
                    style={{ color: DS.sub, borderLeft: '2px solid transparent', fontFamily: DS.sans }}
                    className="flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-r-xl text-[13.5px] font-medium hover:opacity-60 transition-all">
                    <LayoutDashboard className="w-4 h-4 shrink-0 opacity-60" />{t('dashboard')}
                  </Link>

                  {showWishlist && (
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                      style={{ color: DS.sub, borderLeft: '2px solid transparent', fontFamily: DS.sans }}
                      className="flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-r-xl text-[13.5px] font-medium hover:opacity-60 transition-all">
                      <Heart className="w-4 h-4 shrink-0 opacity-60" />{t('wishlist')}
                    </Link>
                  )}

                  {isBroker && (
                    <Link to="/broker/properties" onClick={() => setMobileOpen(false)}
                      style={{ color: DS.sub, borderLeft: '2px solid transparent', fontFamily: DS.sans }}
                      className="flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-r-xl text-[13.5px] font-medium hover:opacity-60 transition-all">
                      <List className="w-4 h-4 shrink-0 opacity-60" />{t('myProperties')}
                    </Link>
                  )}

                  {moreItems
                    .filter(item => item.to !== '/broker/properties' && item.to !== '/broker/add-property')
                    .map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                        style={{ color: DS.sub, borderLeft: '2px solid transparent', fontFamily: DS.sans }}
                        className="flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-r-xl text-[13.5px] font-medium hover:opacity-60 transition-all">
                        <Icon className="w-4 h-4 shrink-0 opacity-60" />{label}
                      </Link>
                    ))}
                </div>

                <div style={{ borderColor: 'rgba(200,150,100,0.15)' }} className="border-t my-4" />

                <p style={{ color: DS.muted, fontFamily: DS.sans }}
                  className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-2">Language</p>
                <div className="flex gap-2 px-2 mb-4">
                  {LANGS.map(lang => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                      style={{
                        fontFamily: DS.serif,
                        background: language === lang.code ? DS.accent : 'transparent',
                        color: language === lang.code ? '#fff' : DS.muted,
                        border: `1px solid ${language === lang.code ? DS.accent : 'rgba(200,150,100,0.2)'}`,
                        fontStyle: 'italic', fontSize: 13,
                      }}
                      className="px-4 py-1.5 rounded-xl font-medium transition-all">
                      {lang.short}
                    </button>
                  ))}
                </div>

                <button onClick={handleLogout}
                  style={{ color: DS.primary, fontFamily: DS.sans }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium hover:opacity-60 transition-all">
                  <LogOut className="w-4 h-4 shrink-0 opacity-70" />{t('logout')}
                </button>
              </>
            )}

            {!user && (
              <>
                <div style={{ borderColor: 'rgba(200,150,100,0.15)' }} className="border-t my-4" />
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  style={{ background: DS.accent, fontFamily: DS.sans }}
                  className="flex items-center justify-center py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90">
                  {t('getStarted')}
                </Link>
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  style={{ color: DS.sub, fontFamily: DS.sans, border: `1px solid rgba(200,150,100,0.2)` }}
                  className="flex items-center justify-center py-3 rounded-xl text-[13.5px] font-medium transition-all hover:opacity-60 mt-2">
                  {t('signIn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
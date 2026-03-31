import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Heart, Calendar, Calculator, Users,
  Settings, LogOut, Menu, X, Building2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const DS = {
  bg: '#F9F6F2', sidebar: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
  .pub-layout { font-family: 'DM Sans', system-ui, sans-serif; }
  .pub-nav-btn { transition: all 0.15s ease; }
  .pub-nav-btn:hover { background: ${DS.primaryLight} !important; color: ${DS.primary} !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #EDE8E3; border-radius: 4px; }
`;

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',        icon: LayoutDashboard, path: '/public/dashboard' },
  { divider: true },
  { id: 'wishlist',    label: 'Saved Properties',  icon: Heart,           path: '/wishlist' },
  { id: 'tours',       label: 'Scheduled Tours',   icon: Calendar,        path: '/schedule-tour' },
  { id: 'calculators', label: 'Calculators',       icon: Calculator,      path: '/calculators' },
  { id: 'lawyers',     label: 'Find Lawyers',      icon: Users,           path: '/lawyers' },
  { divider: true },
  { id: 'settings',    label: 'Account Settings',  icon: Settings,        path: '/account/settings' },
];

const SidebarContent = ({ onNav }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={17} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: DS.text, lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>Rudra</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: DS.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Legal & Realty</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Navigation</p>
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) return <div key={i} style={{ height: 1, background: DS.border, margin: '8px 0' }} />;
          const active = isActive(item.path);
          return (
            <button key={item.id}
              onClick={() => { navigate(item.path); onNav?.(); }}
              className="pub-nav-btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 2, fontSize: 14, fontWeight: active ? 700 : 500, textAlign: 'left',
                background: active ? DS.primaryLight : 'transparent',
                color: active ? DS.primary : DS.textSub,
                borderLeft: active ? `3px solid ${DS.primary}` : '3px solid transparent',
              }}>
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: `1px solid ${DS.border}`, padding: '10px 10px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: DS.primary, fontFamily: 'Georgia, serif' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </p>
            <p style={{ fontSize: 11, color: DS.textMuted }}>Property Seeker</p>
          </div>
        </div>
        <button onClick={handleLogout} className="pub-nav-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: 14 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
};

const PublicLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="pub-layout" style={{ minHeight: '100vh', background: DS.bg, display: 'flex' }}>
      <style>{CSS}</style>

      {/* Desktop Sidebar */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ width: 240, minHeight: '100vh', background: DS.sidebar, borderRight: `1px solid ${DS.border}`, position: 'fixed', top: 0, left: 0, zIndex: 20 }}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 50, width: 240, background: DS.sidebar }}>
            <button onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted }}>
              <X size={18} />
            </button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: DS.sidebar, borderBottom: `1px solid ${DS.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textSub }}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: DS.text, fontFamily: 'Georgia, serif' }}>Rudra</span>
        </header>

        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
};

export default PublicLayout;
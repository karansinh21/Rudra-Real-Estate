import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, MessageSquare, FileText,
  LogOut, Menu, X, ChevronRight, ChevronDown, Plus, List, Settings
} from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const DS = {
  bg: '#F9F6F2', sidebar: '#FFFFFF', border: '#EDE8E3',
  primary: '#C84B00', primaryLight: '#FEF3EE', primaryBorder: 'rgba(200,75,0,0.18)',
  text: '#1A0800', textSub: '#6B5748', textMuted: '#9C8B7A',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
  .brd-layout { font-family:'DM Sans',system-ui,sans-serif; }
  .brd-nav-btn { transition:all 0.15s ease; }
  .brd-nav-btn:hover { background:${DS.primaryLight}!important; color:${DS.primary}!important; }
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#EDE8E3;border-radius:4px;}
`;

const BrokerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(
    location.pathname.startsWith('/broker/properties') ||
    location.pathname.startsWith('/broker/enquiries')
  );

  const handleLogout = () => { logout(); navigate('/auth'); };

  const isActive = (path) => {
    if (path.includes('?view=settings')) {
      return location.pathname === '/broker/dashboard' && location.search === '?view=settings';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const propLinks = [
    { label: 'My Properties', path: '/broker/properties',     icon: List          },
    { label: 'Add Property',  path: '/broker/properties/add', icon: Plus          },
    { label: 'Enquiries',     path: '/broker/enquiries',      icon: MessageSquare },
  ];

  const propFolderActive = propLinks.some(l => isActive(l.path));

  const NavBtn = ({ to, label, icon: Icon }) => {
    const act = isActive(to);
    return (
      <button onClick={() => { setMobileOpen(false); navigate(to); }}
        className="brd-nav-btn"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          marginBottom: 2, fontSize: 14, fontWeight: act ? 700 : 500, textAlign: 'left',
          background: act ? DS.primaryLight : 'transparent',
          color: act ? DS.primary : DS.textSub,
          borderLeft: act ? `3px solid ${DS.primary}` : '3px solid transparent',
        }}>
        <Icon size={16} />
        <span style={{ flex: 1 }}>{label}</span>
        {act && <ChevronRight size={12} />}
      </button>
    );
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={17} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: DS.text, lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>Rudra</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: DS.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Realty Portal</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Menu</p>

        <NavBtn to="/broker/dashboard" label="Dashboard" icon={LayoutDashboard} />

        {/* Properties Folder */}
        <div>
          <button onClick={() => setPropOpen(v => !v)} className="brd-nav-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              marginBottom: 2, fontSize: 14, textAlign: 'left',
              fontWeight: propFolderActive ? 600 : 500,
              background: propFolderActive ? DS.primaryLight : 'transparent',
              color: propFolderActive ? DS.primary : DS.textSub,
              borderLeft: propFolderActive ? `3px solid ${DS.primary}` : '3px solid transparent',
            }}>
            <Building2 size={16} />
            <span style={{ flex: 1 }}>Properties</span>
            {propOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {propOpen && (
            <div style={{ marginLeft: 12, paddingLeft: 10, borderLeft: `2px solid ${DS.primaryBorder}`, marginBottom: 4 }}>
              {propLinks.map(({ label, path, icon: Icon }) => {
                const act = isActive(path);
                return (
                  <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 10, textDecoration: 'none',
                      fontSize: 13, fontWeight: act ? 700 : 500, marginBottom: 2,
                      background: act ? DS.primary : 'transparent',
                      color: act ? '#fff' : DS.textSub,
                    }}>
                    <Icon size={13} /> {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: DS.border, margin: '8px 0' }} />

        <NavBtn to="/broker/legal/request" label="Legal" icon={FileText} />
        <NavBtn to="/broker/dashboard?view=settings" label="Profile & Settings" icon={Settings} />
      </nav>

      {/* ✅ User Card + Logout — bilkul niche, same as dashboard */}
      <div style={{ borderTop: `1px solid ${DS.border}`, padding: '10px 10px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: DS.primary, fontFamily: 'Georgia, serif' }}>
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Broker'}
            </p>
            <p style={{ fontSize: 11, color: DS.textMuted }}>Broker</p>
          </div>
        </div>
        <button onClick={handleLogout} className="brd-nav-btn"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#EF4444', fontWeight: 600, fontSize: 14,
          }}>
          <LogOut size={15} /> Logout
        </button>
      </div>

    </div>
  );

  return (
    <div className="brd-layout" style={{ minHeight: '100vh', background: DS.bg, display: 'flex' }}>
      <style>{CSS}</style>

      {/* ✅ Desktop Sidebar — sirf ekj vaar */}
      <div style={{ width: 240, flexShrink: 0, position: 'relative' }}
        className="hidden lg:block">
        <div style={{
          width: 240, minHeight: '100vh', background: DS.sidebar,
          borderRight: `1px solid ${DS.border}`, display: 'flex',
          flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 20
        }}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 50, width: 240, background: DS.sidebar, display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted }}>
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px', background: DS.sidebar,
          borderBottom: `1px solid ${DS.border}`,
          position: 'sticky', top: 0, zIndex: 10
        }} className="lg:hidden">
          <button onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textSub }}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: DS.text, fontFamily: 'Georgia, serif' }}>Rudra Realty</span>
        </header>

        <main style={{ flex: 1 }}>{children}</main>
      </div>

    </div>
  );
};

export default BrokerLayout;
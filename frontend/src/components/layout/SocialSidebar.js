import React, { useState, useRef } from 'react';

// ✅ Tamara actual links yahan update karo
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/rudrarealestate.vadodara?igsh=Y3lzcXRhZHRiaXdw',
  facebook:  'https://www.facebook.com/share/1GbmxW1Sck/',
  whatsapp:  'https://wa.me/919316040778',
};

const SocialSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Mouse enter — open immediately
  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  // Mouse leave — close after small delay so it feels natural
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 180);
  };

  const socials = [
    {
      id: 'instagram',
      label: 'Instagram',
      url: SOCIAL_LINKS.instagram,
      bg: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
      glow: '0 0 16px rgba(220,39,67,0.55)',
      dot: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: SOCIAL_LINKS.facebook,
      bg: 'linear-gradient(135deg,#1877f2,#0d5dbf)',
      glow: '0 0 16px rgba(24,119,242,0.55)',
      dot: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      url: SOCIAL_LINKS.whatsapp,
      bg: 'linear-gradient(135deg,#25d366,#128c7e)',
      glow: '0 0 16px rgba(37,211,102,0.55)',
      dot: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        /* ── Pulse animation for WhatsApp dot ── */
        @keyframes ss-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }

        /* ── Shimmer sweep on open ── */
        @keyframes ss-sweep {
          0%   { left: -80px; }
          100% { left: 120%; }
        }

        /* ── Wrapper — left edge, centered vertically ── */
        .ss-wrap {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9998;
        }

        /* ── Hover zone — invisible extended area so mouse travel doesn't close early ── */
        .ss-hover-zone {
          display: flex;
          align-items: center;
          padding-right: 12px; /* extra hover catch area to the right */
        }

        /* ── Icons column ── */
        .ss-icons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        /* ── Each icon button — round ── */
        .ss-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;           /* ✅ ROUND */
          border: 2px solid rgba(255,255,255,0.22);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;

          /* CLOSED: half-hidden behind left edge */
          /* translateX controlled by parent .ss-icons */
          transition:
            box-shadow 0.22s ease,
            transform  0.22s ease,
            border-color 0.22s ease;

          box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        }

        /* Shimmer overlay inside button on hover */
        .ss-icon::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 40px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          left: -60px;
          border-radius: 50%;
        }
        .ss-icons.open .ss-icon:hover::after {
          animation: ss-sweep 0.4s ease forwards;
        }

        .ss-icons.open .ss-icon:hover {
          transform: scale(1.12);
          border-color: rgba(255,255,255,0.5);
        }
        .ss-icon:active {
          transform: scale(0.9) !important;
        }

        /* ── Icons slide — CLOSED vs OPEN ──
           CLOSED: show only ~12px of each circle (half peeking)
           OPEN:   fully visible
        */
        .ss-icons {
          transform: translateX(-22px);    /* hide ~half the circle */
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* slight bounce */
        }
        .ss-icons.open {
          transform: translateX(0);
        }

        /* ── Glass card behind icons — appears when open ── */
        .ss-card {
          position: absolute;
          top: -10px; bottom: -10px;
          left: -8px; right: -14px;
          background: rgba(8, 8, 16, 0.5);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.14);
          border-left: none;
          border-radius: 0 20px 20px 0;
          box-shadow:
            8px 0 40px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.1);
          z-index: -1;
          overflow: hidden;

          opacity: 0;
          transition: opacity 0.32s ease;
          pointer-events: none;
        }
        /* Inner shimmer that runs once on open */
        .ss-card::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          left: -80px;
        }
        .ss-icons.open .ss-card {
          opacity: 1;
        }
        .ss-icons.open .ss-card::before {
          animation: ss-sweep 0.55s ease 0.05s forwards;
        }

        /* ── Floating label beside icon ── */
        .ss-label {
          position: absolute;
          left: calc(100% + 10px);
          background: rgba(10,10,20,0.82);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          letter-spacing: 0.04em;
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);

          /* Hidden by default */
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        /* Small arrow pointer */
        .ss-label::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 4px solid transparent;
          border-right-color: rgba(10,10,20,0.82);
        }
        /* Show label on icon hover, only when open */
        .ss-icons.open .ss-icon-wrap:hover .ss-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── WhatsApp live dot ── */
        .ss-dot {
          position: absolute;
          top: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid rgba(255,255,255,0.9);
          z-index: 2;
        }
        .ss-dot::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(34,197,94,0.45);
          animation: ss-pulse 2.2s ease infinite;
        }

        /* Wrapper for icon + label together */
        .ss-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        @media (max-width: 480px) {
          .ss-wrap {
            top: auto;
            bottom: 96px;
            transform: none;
          }
        }
      `}</style>

      <div className="ss-wrap">
        <div
          className="ss-hover-zone"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`ss-icons ${isOpen ? 'open' : ''}`}>

            {/* Glass background card */}
            <div className="ss-card" />

            {socials.map((s) => (
              <div key={s.id} className="ss-icon-wrap">
                <button
                  className="ss-icon"
                  style={{
                    background: s.bg,
                    boxShadow: isOpen
                      ? `2px 2px 14px rgba(0,0,0,0.3), ${s.glow}`
                      : '2px 2px 10px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => openLink(s.url)}
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.dot && <span className="ss-dot" />}
                  {s.icon}
                </button>

                {/* Label — shows on hover when open */}
                <span className="ss-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialSidebar;
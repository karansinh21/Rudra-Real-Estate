// frontend/src/components/common/PushNotificationBanner.jsx
// ─────────────────────────────────────────────────────────────────
// BrokerDashboard + LawyerDashboard ma top par add karo:
//   import PushNotificationBanner from '../../components/common/PushNotificationBanner';
//   <PushNotificationBanner />
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import usePushNotification from '../../hooks/usePushNotification';

const PushNotificationBanner = () => {
  const { subscribeStatus, subscribe } = usePushNotification();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('push_banner_dismissed') === 'true'
  );

  // Already subscribed, dismissed, or unsupported — nothing show nai
  if (subscribeStatus === 'subscribed' || dismissed || subscribeStatus === 'unsupported') {
    return null;
  }

  // Denied — show info message
  if (subscribeStatus === 'denied') {
    return (
      <div style={{
        display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
        borderRadius:12, padding:'10px 14px', marginBottom:16,
        fontSize:13, color:'#fca5a5',
      }}>
        <span>🔕</span>
        <span style={{ flex:1 }}>Notification permission blocked. Enable from browser settings to get instant client messages.</span>
        <button onClick={() => { setDismissed(true); localStorage.setItem('push_banner_dismissed','true'); }}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, padding:'0 4px' }}>
          ✕
        </button>
      </div>
    );
  }

  // Default — ask permission
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
      background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))',
      border:'1px solid rgba(99,102,241,0.3)',
      borderRadius:14, padding:'12px 16px', marginBottom:16,
      backdropFilter:'blur(8px)',
    }}>
      {/* Bell icon with pulse */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <span style={{ fontSize:22 }}>🔔</span>
        <span style={{
          position:'absolute', top:-2, right:-2,
          width:8, height:8, borderRadius:'50%',
          background:'#818cf8',
          boxShadow:'0 0 8px rgba(129,140,248,0.8)',
          animation:'pnb-pulse 2s ease infinite',
        }}/>
      </div>

      <div style={{ flex:1, minWidth:200 }}>
        <p style={{ margin:0, fontWeight:700, fontSize:13.5, color:'#e0e7ff' }}>
          Enable Instant Notifications
        </p>
        <p style={{ margin:'2px 0 0', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          Get notified like WhatsApp when clients send messages — even when browser is closed
        </p>
      </div>

      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
        <button
          onClick={subscribe}
          disabled={subscribeStatus === 'loading'}
          style={{
            background: subscribeStatus==='loading'
              ? 'rgba(129,140,248,0.3)'
              : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color:'#fff', border:'none', borderRadius:10,
            padding:'8px 16px', fontSize:13, fontWeight:700,
            cursor: subscribeStatus==='loading' ? 'not-allowed' : 'pointer',
            boxShadow:'0 4px 14px rgba(99,102,241,0.4)',
            transition:'all 0.2s',
          }}
        >
          {subscribeStatus === 'loading' ? '⏳ Enabling...' : '🔔 Enable Now'}
        </button>

        <button
          onClick={() => { setDismissed(true); localStorage.setItem('push_banner_dismissed','true'); }}
          style={{
            background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:10,
            padding:'8px 12px', fontSize:12, cursor:'pointer',
          }}
        >
          Later
        </button>
      </div>

      <style>{`
        @keyframes pnb-pulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.4); opacity:0.6; }
        }
      `}</style>
    </div>
  );
};

export default PushNotificationBanner;
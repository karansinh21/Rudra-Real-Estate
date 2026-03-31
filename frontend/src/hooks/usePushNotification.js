// frontend/src/hooks/usePushNotification.js
// ─────────────────────────────────────────────────────────────────
// Broker/Lawyer na dashboard ma aak line import karo:
//   import usePushNotification from '../../hooks/usePushNotification';
//   const { subscribeStatus } = usePushNotification();
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function usePushNotification() {
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle|loading|subscribed|denied|unsupported
  const [permissionStatus, setPermissionStatus] = useState('default'); // default|granted|denied
  const hasSubscribed = useRef(false);

  useEffect(() => {
    // Service Worker + Push API support check
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSubscribeStatus('unsupported');
      return;
    }

    // Auto-subscribe when hook mounts (broker/lawyer login thay tyare)
    const token = localStorage.getItem('token');
    if (token && !hasSubscribed.current) {
      hasSubscribed.current = true;
      subscribe();
    }

    // Service worker thi token share karo (sw.js ma GET_TOKEN use thay)
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'GET_TOKEN') {
        const t = localStorage.getItem('token');
        e.ports[0].postMessage({ token: t });
      }
    });
  }, []);

  const subscribe = async () => {
    setSubscribeStatus('loading');
    try {
      // Service Worker register karo
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Permission maango
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        setSubscribeStatus('denied');
        return;
      }

      // VAPID public key fetch karo
      const keyRes = await fetch(`${API_BASE}/api/chat/vapid-public-key`);
      const { publicKey } = await keyRes.json();

      if (!publicKey) {
        console.error('VAPID public key not set on server');
        setSubscribeStatus('idle');
        return;
      }

      // Push subscribe karo
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Backend ma save karo
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/chat/push-subscribe`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      });

      setSubscribeStatus('subscribed');
      console.log('✅ Push notifications enabled');
    } catch (err) {
      console.error('Push subscribe error:', err);
      setSubscribeStatus('idle');
    }
  };

  return { subscribeStatus, permissionStatus, subscribe };
}

// ── VAPID key converter ───────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw      = atob(base64);
  const output   = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}
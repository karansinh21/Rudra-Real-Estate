// public/sw.js  ← frontend/public/ folder ma mukho
// ─────────────────────────────────────────────────────────────────
// Service Worker — browser band hoy to pand push notification aave
// ─────────────────────────────────────────────────────────────────

const CACHE_NAME = 'rudra-v1';

// Install
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// ✅ Push event — notification show karo
self.addEventListener('push', (e) => {
  if (!e.data) return;

  let data = {};
  try { data = e.data.json(); } catch { data = { title: 'New Message', body: e.data.text() }; }

  const title   = data.title   || '💬 Rudra Real Estate';
  const options = {
    body:      data.body    || 'You have a new message',
    icon:      data.icon    || '/logo192.png',
    badge:     data.badge   || '/logo192.png',
    tag:       data.tag     || 'rudra-chat',
    renotify:  true,
    vibrate:   [200, 100, 200],  // WhatsApp jevi vibration pattern
    data:      data.data    || {},
    actions:   data.actions || [
      { action: 'reply',   title: '💬 Reply' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
    // Notification color
    silent: false,
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Notification click — dashboard kholo
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  const action    = e.action;
  const notifData = e.notification.data || {};
  const url       = notifData.url || '/dashboard';

  if (action === 'dismiss') return;

  // "Reply" click ya notification body click — page kholo
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Already open window hoy to te focus karo
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Nai to navi tab kholo
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ✅ Push subscription change (browser auto-refreshes subscription)
self.addEventListener('pushsubscriptionchange', async (e) => {
  const API = self.location.origin;

  e.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: e.newSubscription?.options?.applicationServerKey,
    }).then(async (newSub) => {
      // Token from IndexedDB or cookie (simple approach)
      const token = await getToken();
      if (token && newSub) {
        await fetch(`${API}/api/chat/push-subscribe`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ subscription: newSub }),
        });
      }
    })
  );
});

// Helper — token lavo (localStorage service worker ma nai hoy, so workaround)
async function getToken() {
  try {
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    // Client thi token request karo
    for (const client of allClients) {
      return new Promise(resolve => {
        const mc = new MessageChannel();
        mc.port1.onmessage = e => resolve(e.data.token);
        client.postMessage({ type: 'GET_TOKEN' }, [mc.port2]);
        setTimeout(() => resolve(null), 1000);
      });
    }
  } catch { return null; }
}
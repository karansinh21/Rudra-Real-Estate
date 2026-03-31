// backend/src/services/pushNotificationService.js
// ─────────────────────────────────────────────────────────────────
// Web Push Notifications — WhatsApp jevi browser notification
// ─────────────────────────────────────────────────────────────────
// Install: npm install web-push
// Generate VAPID keys once: node -e "const wp=require('web-push'); console.log(wp.generateVAPIDKeys())"
// Add to .env:
//   VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_EMAIL=mailto:rudrarealestate001@gmail.com
// ─────────────────────────────────────────────────────────────────

const webpush     = require('web-push');
const { PrismaClient } = require('@prisma/client');
const prisma      = new PrismaClient();

// ── Configure VAPID ──────────────────────────────────────────────
webpush.setVapidDetails(
  process.env.VAPID_EMAIL   || 'mailto:rudrarealestate001@gmail.com',
  process.env.VAPID_PUBLIC_KEY  || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// ── In-memory store for push subscriptions ──────────────────────
// Key: userId, Value: PushSubscription object
// (Ek real app ma DB ma save karvu joie, pan aa quick working solution che)
const subscriptions = new Map(); // userId -> [subscription, ...]

// ── Save subscription ─────────────────────────────────────────────
const saveSubscription = (userId, subscription) => {
  if (!subscriptions.has(userId)) subscriptions.set(userId, []);
  const existing = subscriptions.get(userId);

  // Duplicate avoid karo (same endpoint)
  const isDuplicate = existing.some(s => s.endpoint === subscription.endpoint);
  if (!isDuplicate) {
    existing.push(subscription);
  }
  console.log(`✅ Push subscription saved for user: ${userId}`);
};

// ── Remove subscription ───────────────────────────────────────────
const removeSubscription = (userId, endpoint) => {
  if (!subscriptions.has(userId)) return;
  const filtered = subscriptions.get(userId).filter(s => s.endpoint !== endpoint);
  subscriptions.set(userId, filtered);
};

// ── Send push to a specific user ──────────────────────────────────
const sendPushToUser = async (userId, payload) => {
  const userSubs = subscriptions.get(userId) || [];
  if (userSubs.length === 0) return false;

  const payloadStr = JSON.stringify(payload);
  let sent = false;

  for (const sub of userSubs) {
    try {
      await webpush.sendNotification(sub, payloadStr);
      sent = true;
    } catch (err) {
      // Subscription expired — remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        removeSubscription(userId, sub.endpoint);
        console.log('🗑️ Removed expired push subscription');
      }
    }
  }
  return sent;
};

// ── Notify broker/lawyer when user sends message ─────────────────
const notifyOnNewMessage = async ({ sessionId, senderName, messageText, sessionType }) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { assignee: { select: { id: true, name: true } } }
    });
    if (!session) return;

    const notifPayload = {
      title:   `💬 New ${sessionType === 'BROKER' ? 'Property' : 'Legal'} Message`,
      body:    `${senderName}: ${messageText.slice(0, 80)}${messageText.length > 80 ? '...' : ''}`,
      icon:    '/logo192.png',   // tara project nu icon
      badge:   '/badge72.png',
      tag:     `chat-${sessionId}`,  // same session na duplicate notifications nai
      renotify: true,
      data: {
        url:       sessionType === 'BROKER' ? '/broker/dashboard' : '/lawyer/dashboard',
        sessionId,
        sessionType,
      },
      actions: [
        { action: 'reply',   title: '💬 Reply' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    // Assigned broker/lawyer ne notify karo
    if (session.assignedTo) {
      const sent = await sendPushToUser(session.assignedTo, notifPayload);
      if (sent) {
        console.log(`✅ Push sent to assigned ${sessionType}: ${session.assignedTo}`);
        return;
      }
    }

    // Not assigned — notify ALL brokers/lawyers of that type
    const role = sessionType === 'BROKER' ? 'BROKER' : 'LAWYER';
    const staff = await prisma.user.findMany({
      where:  { role, status: 'ACTIVE' },
      select: { id: true }
    });

    let notified = 0;
    for (const member of staff.slice(0, 10)) {
      const sent = await sendPushToUser(member.id, notifPayload);
      if (sent) notified++;
    }

    console.log(`✅ Push sent to ${notified} ${role} staff members`);
  } catch (err) {
    console.error('❌ Push notification error:', err.message);
  }
};

module.exports = { saveSubscription, removeSubscription, sendPushToUser, notifyOnNewMessage };
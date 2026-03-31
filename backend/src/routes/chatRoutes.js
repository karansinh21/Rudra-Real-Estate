const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth');
const { saveSubscription, notifyOnNewMessage } = require('../services/pushNotificationService');

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════
// GET /api/chat/vapid-public-key
// Frontend ne VAPID public key aapvo (subscription mate)
// ════════════════════════════════════════════════════════
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

// ════════════════════════════════════════════════════════
// POST /api/chat/push-subscribe
// Broker/Lawyer register kare che push notifications mate
// ════════════════════════════════════════════════════════
router.post('/push-subscribe', authenticate, (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    saveSubscription(req.user.id, subscription);
    res.json({ success: true, message: 'Push notifications enabled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/chat/session
// ════════════════════════════════════════════════════════
router.post('/session', async (req, res) => {
  try {
    const { userName, userEmail, userPhone, userId, sessionType = 'ADMIN' } = req.body;
    if (!userName) return res.status(400).json({ error: 'userName required' });

    let session = null;
    if (userId) {
      session = await prisma.chatSession.findFirst({
        where:   { userId, sessionType, status: 'ACTIVE' },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userName,
          userEmail:   userEmail   || null,
          userPhone:   userPhone   || null,
          userId:      userId      || null,
          sessionType,
          status: 'ACTIVE',
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    res.json({ session });
  } catch (err) {
    console.error('POST /session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/chat/session/:id/message
// ✅ Push notification triggered here
// ════════════════════════════════════════════════════════
router.post('/session/:sessionId/message', async (req, res) => {
  try {
    const { sessionId }  = req.params;
    const { text, senderName, senderRole = 'USER', senderId } = req.body;

    if (!senderName || !text) {
      return res.status(400).json({ error: 'text and senderName required' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        text,
        senderName,
        senderRole,
        senderId: senderId || null,
        read:     senderRole !== 'USER',
      }
    });

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data:  { updatedAt: new Date() }
    });

    // ✅ Push notification — user message mate broker/lawyer ne notify karo
    if (senderRole === 'USER' && ['BROKER', 'LAWYER'].includes(session.sessionType)) {
      notifyOnNewMessage({
        sessionId,
        senderName,
        messageText:  text,
        sessionType:  session.sessionType,
      }).catch(console.error); // non-blocking
    }

    res.json({ message });
  } catch (err) {
    console.error('POST /message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/chat/sessions
// ════════════════════════════════════════════════════════
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { type, status } = req.query;
    const user = req.user;
    let where  = {};

    if (user.role === 'BROKER') {
      where = { sessionType: 'BROKER', OR: [{ assignedTo: user.id }, { assignedTo: null }] };
    } else if (user.role === 'LAWYER') {
      where = { sessionType: 'LAWYER', OR: [{ assignedTo: user.id }, { assignedTo: null }] };
    } else if (user.role === 'ADMIN') {
      if (type) where.sessionType = type;
    }

    if (status) where.status = status;

    const sessions = await prisma.chatSession.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 60,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/chat/session/:id/messages
// ════════════════════════════════════════════════════════
router.get('/session/:sessionId/messages', authenticate, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where:   { sessionId: req.params.sessionId },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.chatMessage.updateMany({
      where: { sessionId: req.params.sessionId, senderRole: 'USER', read: false },
      data:  { read: true }
    });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PATCH /api/chat/session/:id/close
router.patch('/session/:sessionId/close', authenticate, async (req, res) => {
  try {
    const session = await prisma.chatSession.update({
      where: { id: req.params.sessionId },
      data:  { status: 'CLOSED' }
    });
    req.app.get('io')?.to(req.params.sessionId).emit('session-closed', { sessionId: req.params.sessionId });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close' });
  }
});

// PATCH /api/chat/session/:id/assign
router.patch('/session/:sessionId/assign', authenticate, async (req, res) => {
  try {
    const session = await prisma.chatSession.update({
      where: { id: req.params.sessionId },
      data:  { assignedTo: req.user.id }
    });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign' });
  }
});

// GET /api/chat/stats
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const [total, broker, lawyer, today] = await Promise.all([
      prisma.chatSession.count({ where: { status: 'ACTIVE' } }),
      prisma.chatSession.count({ where: { status: 'ACTIVE', sessionType: 'BROKER' } }),
      prisma.chatSession.count({ where: { status: 'ACTIVE', sessionType: 'LAWYER' } }),
      prisma.chatSession.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } })
    ]);
    res.json({ stats: { total, broker, lawyer, today } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
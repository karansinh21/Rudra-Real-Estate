const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/chat/session — create or get existing session
const createSession = async (req, res) => {
  try {
    const { userName, userEmail, userPhone, userId } = req.body;
    if (!userName) return res.status(400).json({ error: 'userName required' });

    // Agar userId hoy to existing active session check karo
    if (userId) {
      const existing = await prisma.chatSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
      if (existing) return res.json({ session: existing });
    }

    const session = await prisma.chatSession.create({
      data: { userId: userId || null, userName, userEmail, userPhone, status: 'ACTIVE' },
      include: { messages: true }
    });

    res.status(201).json({ session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// GET /api/chat/sessions — admin/broker: badhi active sessions
const getAllSessions = async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// GET /api/chat/session/:id/messages — session na messages
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' }
    });
    // Mark as read
    await prisma.chatMessage.updateMany({
      where: { sessionId: id, senderRole: 'USER', read: false },
      data: { read: true }
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST /api/chat/session/:id/message — message save karo
const saveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, senderName, senderRole, senderId } = req.body;
    if (!text || !senderName) return res.status(400).json({ error: 'text and senderName required' });

    const message = await prisma.chatMessage.create({
      data: { sessionId: id, text, senderName, senderRole: senderRole || 'USER', senderId: senderId || null }
    });

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
};

// PUT /api/chat/session/:id/close
const closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chatSession.update({ where: { id }, data: { status: 'CLOSED' } });
    res.json({ message: 'Session closed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close session' });
  }
};

// GET /api/chat/unread — admin: unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.chatMessage.count({
      where: { senderRole: 'USER', read: false }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = { createSession, getAllSessions, getMessages, saveMessage, closeSession, getUnreadCount };
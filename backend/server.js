require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"]
  }
});

const i18n = require('./src/config/i18n');
const { setLanguage } = require('./src/middleware/language');

require('./src/config/passport')(passport);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(i18n.init);
app.use(setLanguage);

const authRoutes      = require('./src/routes/authRoutes');
const propertyRoutes  = require('./src/routes/propertyRoutes');
const enquiryRoutes   = require('./src/routes/enquiryRoutes');
const legalRoutes     = require('./src/routes/legalRoutes');
const landRoutes      = require('./src/routes/landRoutes');
const uploadRoutes    = require('./src/routes/uploadRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const userRoutes      = require('./src/routes/userRoutes');
const adminRoutes     = require('./src/routes/adminRoutes');
const brokerRoutes    = require('./src/routes/brokerRoutes');
const wishlistRoutes  = require('./src/routes/wishlistRoutes');
const chatRoutes      = require('./src/routes/chatRoutes');

app.get('/', (req, res) => {
  res.json({
    message: req.__('api.title'),
    version: req.__('api.version'),
    status:  req.__('api.status'),
    features: {
      imageUpload: true, emailNotifications: true, analytics: true,
      realtimeChat: true, otpVerification: true, multiLanguage: true,
      pdfReports: true, googleMaps: true, socialAuth: true,
      oauth: { google: true, apple: true },
      liveChat: { broker: true, lawyer: true, admin: true }
    },
    endpoints: {
      auth:       '/api/auth',
      properties: '/api/properties',
      enquiries:  '/api/enquiries',
      legal:      '/api/legal',
      land:       '/api/land',
      upload:     '/api/upload',
      analytics:  '/api/analytics',
      users:      '/api/users',
      brokers:    '/api/brokers',
      wishlist:   '/api/wishlist',
      chat:       '/api/chat',
    }
  });
});

app.use('/api/auth',       authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries',  enquiryRoutes);
app.use('/api/legal',      legalRoutes);
app.use('/api/land',       landRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/brokers',    brokerRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/chat',       chatRoutes);

app.set('io', io);

io.on('connection', (socket) => {
  console.log('👤 Connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`💬 ${socket.id} joined: ${roomId}`);
  });

  socket.on('join-admin', () => {
    socket.join('admin-room');
    socket.join('broker-room');
    socket.join('lawyer-room');
    console.log(`👑 Admin joined admin/broker/lawyer rooms`);
  });

  socket.on('join-broker', (data) => {
    socket.join('broker-room');
    if (data?.brokerId) socket.join(`broker:${data.brokerId}`);
    console.log(`🏠 Broker joined: ${data?.brokerName}`);
  });

  socket.on('join-lawyer', (data) => {
    socket.join('lawyer-room');
    if (data?.lawyerId) socket.join(`lawyer:${data.lawyerId}`);
    console.log(`⚖️ Lawyer joined: ${data?.lawyerName}`);
  });

  socket.on('send-message', (data) => {
    socket.to(data.sessionId || data.roomId).emit('receive-message', data);
    if (data.senderRole === 'USER') {
      const session = data.sessionType || 'ADMIN';
      if (session === 'BROKER')      io.to('broker-room').emit('new-user-message', data);
      else if (session === 'LAWYER') io.to('lawyer-room').emit('new-user-message', data);
      else                           io.to('admin-room').emit('new-user-message', data);
    }
  });

  socket.on('new-session', (data) => {
    const { sessionType = 'ADMIN', sessionId, userName } = data;
    const room = sessionType === 'BROKER'
      ? 'broker-room'
      : sessionType === 'LAWYER'
        ? 'lawyer-room'
        : 'admin-room';
    io.to(room).emit('session-started', {
      sessionId, userName, sessionType,
      createdAt: new Date().toISOString()
    });
    console.log(`✅ New ${sessionType} session: ${sessionId} by ${userName}`);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId || data.sessionId).emit('user-typing', {
      typing: data.typing,
      role:   data.role || 'USER',
    });
  });

  socket.on('messages-seen', (data) => {
    socket.to(data.sessionId).emit('messages-seen', { sessionId: data.sessionId });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('disconnect', () => {
    console.log('👤 Disconnected:', socket.id);
  });
});

prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

app.use((req, res) => {
  res.status(404).json({
    error:   'Route not found ❌',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error:   'Internal server error',
    message: err.message,
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// ✅ '0.0.0.0' — phone ane computer bane par kaam karse
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   🏠 RUDRA REAL ESTATE API                     ║
║   🚀 Server: http://localhost:${PORT}             ║
║   ✅ Status: Running                           ║
║   📊 Database: Connected (Prisma)              ║
║   💬 Live Chat: Admin ✅ Broker ✅ Lawyer ✅   ║
║   ❤️  Wishlist: Enabled ✅                     ║
║   🌐 Multi-language: EN/GU/HI ✅              ║
╚════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Server stopped');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
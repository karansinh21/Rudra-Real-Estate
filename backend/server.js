require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// i18n Configuration
const i18n = require('./src/config/i18n');
const { setLanguage } = require('./src/middleware/language');

// ✅ Passport Configuration (Add this BEFORE middleware)
require('./src/config/passport')(passport);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(i18n.init);
app.use(setLanguage);

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const propertyRoutes = require('./src/routes/propertyRoutes');
const enquiryRoutes = require('./src/routes/enquiryRoutes');
const legalRoutes = require('./src/routes/legalRoutes');
const landRoutes = require('./src/routes/landRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const userRoutes = require('./src/routes/userRoutes'); // ✅ STEP 3 - NEW

// Health Check Route (with i18n support)
app.get('/', (req, res) => {
  res.json({
    message: req.__('api.title'),
    version: req.__('api.version'),
    status: req.__('api.status'),
    features: {
      imageUpload: true,
      emailNotifications: true,
      analytics: true,
      realtimeChat: true,
      otpVerification: true,
      multiLanguage: true,
      pdfReports: true,
      googleMaps: true,
      socialAuth: true,
      oauth: {
        google: true,
        apple: true
      }
    },
    endpoints: {
      auth: '/api/auth (register, login, otp, google, apple)',
      properties: '/api/properties (CRUD)',
      enquiries: '/api/enquiries (submit, manage)',
      legal: '/api/legal (services, requests)',
      land: '/api/land (requirements)',
      upload: '/api/upload (single, multiple, delete)',
      analytics: '/api/analytics (dashboard, stats)',
      users: '/api/users (admin - manage users)' // ✅ STEP 3 - NEW
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/land', landRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes); // ✅ STEP 3 - NEW

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    console.log(`💬 Message in room ${data.roomId}:`, data.message);
    io.to(data.roomId).emit('receive-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Database connection
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found ❌',
    message: `Cannot ${req.method} ${req.path}`,
    tip: 'Check API endpoints at http://localhost:5000'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   🏠 RUDRA REAL ESTATE API                     ║
║   🚀 Server: http://localhost:${PORT}             ║
║   ✅ Status: Running                           ║
║   📊 Database: Connected                       ║
║   📸 Image Upload: Enabled                     ║
║   📧 Email: Enabled                            ║
║   💬 Real-time Chat: Enabled                   ║
║   🔐 OTP Verification: Enabled                 ║
║   🌐 Multi-language: EN/GU                     ║
║   📊 Analytics: Enabled                        ║
║   📄 PDF Reports: Enabled                      ║
║   🔑 OAuth: Google & Apple ✅                  ║
║   👥 User Management: Enabled ✅               ║
╚════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, closing server...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Server stopped by user');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
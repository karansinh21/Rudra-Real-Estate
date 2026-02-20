const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Middleware
const { protect } = require('../middleware/auth');

// OAuth Controllers
const { googleAuth, googleCallback } = require('../controllers/googleAuthController');
const { appleAuth, appleCallback } = require('../controllers/appleAuthController');

// Phone OTP (SMS / Fast2SMS)
const { 
  sendOTP: sendPhoneOTP, 
  verifyOTP: verifyPhoneOTP 
} = require('../controllers/phoneAuthController');

// WhatsApp OTP
const { 
  sendWhatsAppOTP, 
  verifyWhatsAppOTP,
  resendWhatsAppOTP 
} = require('../controllers/whatsappAuthController');

// ============= PUBLIC ROUTES =============
router.post('/register', authController.register);
router.post('/register-user', authController.registerUser);
router.post('/login', authController.login);

// ============= GOOGLE OAUTH =============
router.get('/google', googleAuth);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// ============= APPLE OAUTH =============
router.get('/apple', appleAuth);
router.post(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/login' }),
  appleCallback
);

// ============= PHONE OTP AUTH (SMS) =============
router.post('/phone/send-otp', sendPhoneOTP);
router.post('/phone/verify-otp', verifyPhoneOTP);

// ============= WHATSAPP OTP AUTH =============
router.post('/whatsapp/send-otp', sendWhatsAppOTP);
router.post('/whatsapp/verify-otp', verifyWhatsAppOTP);
router.post('/whatsapp/resend-otp', resendWhatsAppOTP);

// ============= PROTECTED ROUTES =============
router.get('/profile', protect, authController.getProfile);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;

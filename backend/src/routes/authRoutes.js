const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Middleware
const { protect } = require('../middleware/auth');

// OAuth Controllers
const { googleAuth, googleCallback } = require('../controllers/googleAuthController');

// ============= PUBLIC ROUTES =============
router.post('/register',      authController.register);
router.post('/register-user', authController.registerUser);
router.post('/login',         authController.login);

// ============= FORGOT / RESET PASSWORD =============
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

// ============= GOOGLE OAUTH =============
router.get('/google', googleAuth);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// ============= PROTECTED ROUTES =============
router.get('/profile',         protect, authController.getProfile);
router.put('/update-profile',  protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
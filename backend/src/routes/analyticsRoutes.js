const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getDashboardStats,
  getPropertyAnalytics,
  getEnquiryAnalytics
} = require('../controllers/analyticsController');

// All routes are protected
router.get('/dashboard', authenticate, getDashboardStats);
router.get('/properties', authenticate, getPropertyAnalytics);
router.get('/enquiries', authenticate, getEnquiryAnalytics);

module.exports = router;
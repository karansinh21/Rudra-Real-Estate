const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');
const { authenticate, isBroker, isAdmin } = require('../middleware/auth');

// ============================================================
// ⚠️  ORDER MATTERS — Specific paths BEFORE dynamic /:id
// ============================================================

// -------- BROKER (own profile) --------
// GET  /api/brokers/me/profile      → own profile
// PUT  /api/brokers/me/profile      → update own profile
// GET  /api/brokers/me/enquiries    → enquiries on my properties
// GET  /api/brokers/me/stats        → dashboard stats

router.get('/me/profile',   authenticate, isBroker, brokerController.getMyProfile);
router.put('/me/profile',   authenticate, isBroker, brokerController.updateMyProfile);
router.get('/me/enquiries', authenticate, isBroker, brokerController.getMyEnquiries);
router.get('/me/stats',     authenticate, isBroker, brokerController.getMyStats);

// -------- ADMIN --------
// GET    /api/brokers/admin/all          → all brokers (any status)
// PATCH  /api/brokers/admin/:id/status   → approve / reject / block
// DELETE /api/brokers/admin/:id          → permanently delete broker

router.get('/admin/all',              authenticate, isAdmin, brokerController.adminGetAllBrokers);
router.patch('/admin/:id/status',     authenticate, isAdmin, brokerController.adminUpdateBrokerStatus);
router.delete('/admin/:id',           authenticate, isAdmin, brokerController.adminDeleteBroker);

// -------- PUBLIC --------
// GET  /api/brokers              → all active brokers
// GET  /api/brokers/:id          → single broker profile
// GET  /api/brokers/:id/properties → broker's listed properties

router.get('/',                   brokerController.getAllBrokers);
router.get('/:id',                brokerController.getBrokerById);
router.get('/:id/properties',     brokerController.getBrokerProperties);

module.exports = router;
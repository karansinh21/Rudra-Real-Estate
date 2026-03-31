const express = require('express');
const router  = express.Router();

const {
  adminLogin,
  createAdmin,
  getStats,
  getAllUsers,
  getPendingProfessionals,
  approveUser,
  rejectUser,
  blockUser,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getLegalRequests,
  updateLegalStatus,
} = require('../controllers/adminController');

const { authenticate, isAdmin } = require('../middleware/auth');

// ── Public routes (no auth needed) ───────────────────────
router.post('/login',  adminLogin);
router.post('/create', createAdmin);   // one-time setup

// ── Protected admin routes ────────────────────────────────
router.use(authenticate, isAdmin);     // all routes below need ADMIN token

// Stats
router.get('/stats', getStats);

// Users
router.get('/users',         getAllUsers);
router.get('/users/pending', getPendingProfessionals);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject',  rejectUser);
router.put('/users/:id/block',   blockUser);
router.delete('/users/:id',      deleteUser);

// Properties
router.get('/properties',        getAllProperties);
router.delete('/properties/:id', deleteProperty);

// Legal Requests
router.get('/legal-requests',        getLegalRequests);
router.put('/legal-requests/:id',    updateLegalStatus);

module.exports = router;
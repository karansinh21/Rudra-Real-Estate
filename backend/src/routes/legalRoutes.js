const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  // Legal Services
  getAllLegalServices,
  getLegalServiceById,
  createLegalService,
  updateLegalService,
  deleteLegalService,
  
  // Legal Requests
  createLegalRequest,
  getMyLegalRequests,
  getAllLegalRequests,
  getLegalRequestById,
  updateLegalRequestStatus,
  deleteLegalRequest
} = require('../controllers/legalController');

// ==================== LEGAL SERVICES ROUTES ====================
// Public routes
router.get('/services', getAllLegalServices);
router.get('/services/:id', getLegalServiceById);

// Protected routes (Lawyer/User)
router.post('/services', authenticate, createLegalService);
router.put('/services/:id', authenticate, updateLegalService);
router.delete('/services/:id', authenticate, deleteLegalService);

// ==================== LEGAL REQUESTS ROUTES ====================
// Protected routes (Broker)
router.post('/requests', authenticate, createLegalRequest);
router.get('/requests/my-requests', authenticate, getMyLegalRequests);
router.get('/requests/all', authenticate, getAllLegalRequests);
router.get('/requests/:id', authenticate, getLegalRequestById);
router.put('/requests/:id/status', authenticate, updateLegalRequestStatus);
router.delete('/requests/:id', authenticate, deleteLegalRequest);

module.exports = router;
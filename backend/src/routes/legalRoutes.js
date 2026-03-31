const express = require('express');
const router = express.Router();
const { authenticate, isLawyer } = require('../middleware/auth');
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

// ✅ FIX: isLawyer middleware ઉમેર્યો - Lawyer role check
router.post('/services', authenticate, isLawyer, createLegalService);
router.put('/services/:id', authenticate, isLawyer, updateLegalService);
router.delete('/services/:id', authenticate, isLawyer, deleteLegalService);

// ==================== LEGAL REQUESTS ROUTES ====================
// ✅ FIX: GET /requests અને PUT /requests/:id ઉમેર્યા
router.get('/requests', authenticate, getAllLegalRequests);
router.put('/requests/:id', authenticate, updateLegalRequestStatus);

// Original routes
router.post('/requests', authenticate, createLegalRequest);
router.get('/requests/my-requests', authenticate, getMyLegalRequests);
router.get('/requests/all', authenticate, getAllLegalRequests);
router.get('/requests/:id', authenticate, getLegalRequestById);
router.put('/requests/:id/status', authenticate, updateLegalRequestStatus);
router.delete('/requests/:id', authenticate, deleteLegalRequest);

module.exports = router;
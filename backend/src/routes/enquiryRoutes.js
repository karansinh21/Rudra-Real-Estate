const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createEnquiry,
  getBrokerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../controllers/enquiryController');

// Public route - anyone can create enquiry
router.post('/', createEnquiry);

// Protected routes - only for authenticated brokers
router.get('/my-enquiries', authenticate, getBrokerEnquiries);
router.put('/:id/status', authenticate, updateEnquiryStatus);
router.delete('/:id', authenticate, deleteEnquiry);

module.exports = router;
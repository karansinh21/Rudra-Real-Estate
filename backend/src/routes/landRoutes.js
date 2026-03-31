const express = require('express');
const router  = express.Router();
// ✅ auth.js ma authenticate(=verifyToken) + isBroker + isAdmin che
const { verifyToken, isBroker, isAdmin } = require('../middleware/auth');

const {
  createLandRequirement,
  getAllLandRequirements,
  getLandRequirementById,
  updateLandRequirementStatus,
  getLandListings,
} = require('../controllers/landController');

// ── Public (no auth) ──────────────────────────────────────
// POST /api/land/requirement - anyone submit kari shake
router.post('/requirement', createLandRequirement);

// GET /api/land/listings - public land property listings
router.get('/listings', getLandListings);

// ── Broker + Admin ────────────────────────────────────────
// GET /api/land/requirements - all requirements
router.get('/requirements',    verifyToken, isBroker, getAllLandRequirements);

// GET /api/land/requirement/:id - single requirement  
router.get('/requirement/:id', verifyToken, isBroker, getLandRequirementById);

// PUT /api/land/requirement/:id - update status
router.put('/requirement/:id', verifyToken, isBroker, updateLandRequirementStatus);

// ── Admin only ────────────────────────────────────────────
// DELETE /api/land/requirement/:id
router.delete('/requirement/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.landRequirement.delete({ where: { id: req.params.id } });
    await prisma.$disconnect();
    res.json({ message: 'Land requirement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

module.exports = router;
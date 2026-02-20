const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, isBroker } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/land/requirement - Submit land requirement (Public - કોઈ પણ submit કરી શકે)
router.post('/requirement', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      purposeType,
      landType,
      minArea,
      maxArea,
      areaUnit,
      preferredLocations,
      city,
      state,
      minBudget,
      maxBudget,
      features,
      timeline,
      additionalNotes
    } = req.body;

    // Validation
    if (!name || !email || !phone || !purposeType || !landType || !minArea || !maxArea || !minBudget || !maxBudget) {
      return res.status(400).json({ 
        error: 'Name, email, phone, purpose, land type, area range, and budget range are required' 
      });
    }

    // Create requirement
    const requirement = await prisma.landRequirement.create({
      data: {
        name,
        email,
        phone,
        purposeType,
        landType,
        minArea: parseFloat(minArea),
        maxArea: parseFloat(maxArea),
        areaUnit: areaUnit || 'sq.ft',
        preferredLocations: preferredLocations || [],
        city: city || 'Vadodara',
        state: state || 'Gujarat',
        minBudget: parseFloat(minBudget),
        maxBudget: parseFloat(maxBudget),
        features: features || [],
        timeline: timeline || 'Within 3 months',
        additionalNotes: additionalNotes || null
      }
    });

    res.status(201).json({
      message: 'Land requirement submitted successfully. Our team will contact you soon.',
      requirement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit land requirement' });
  }
});

// GET /api/land/requirements - Get all requirements (Broker/Admin only)
router.get('/requirements', verifyToken, isBroker, async (req, res) => {
  try {
    const { status, landType, city } = req.query;

    // Build where condition
    const where = {};
    if (status) where.status = status;
    if (landType) where.landType = landType;
    if (city) where.city = city;

    const requirements = await prisma.landRequirement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      count: requirements.length,
      requirements 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch land requirements' });
  }
});

// GET /api/land/requirement/:id - Get single requirement (Broker/Admin only)
router.get('/requirement/:id', verifyToken, isBroker, async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await prisma.landRequirement.findUnique({
      where: { id }
    });

    if (!requirement) {
      return res.status(404).json({ error: 'Land requirement not found' });
    }

    res.json({ requirement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch land requirement' });
  }
});

// PUT /api/land/requirement/:id - Update requirement status (Broker/Admin only)
router.put('/requirement/:id', verifyToken, isBroker, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const requirement = await prisma.landRequirement.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'Requirement status updated successfully',
      requirement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// DELETE /api/land/requirement/:id - Delete requirement (Admin only)
router.delete('/requirement/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    await prisma.landRequirement.delete({
      where: { id }
    });

    res.json({ message: 'Land requirement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

module.exports = router;

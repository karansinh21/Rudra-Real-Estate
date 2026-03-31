const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ Only these types are valid for land listings
const ALLOWED_LAND_TYPES = ['LAND', 'AGRICULTURAL', 'INDUSTRIAL'];

// Create land requirement (Public)
const createLandRequirement = async (req, res) => {
  try {
    const {
      name, email, phone, purposeType, landType,
      minArea, maxArea, areaUnit, preferredLocations,
      city, state, minBudget, maxBudget, features,
      timeline, additionalNotes
    } = req.body;

    if (!name || !email || !phone || !purposeType || !landType || !minArea || !maxArea) {
      return res.status(400).json({ error: 'Name, email, phone, purpose, land type, and area range are required' });
    }

    const landRequirement = await prisma.landRequirement.create({
      data: {
        name, email, phone, purposeType, landType,
        minArea:    parseFloat(minArea),
        maxArea:    parseFloat(maxArea),
        areaUnit:   areaUnit || 'sq.ft',
        preferredLocations: preferredLocations || [],
        city:       city  || 'Vadodara',
        state:      state || 'Gujarat',
        minBudget:  parseFloat(minBudget),
        maxBudget:  parseFloat(maxBudget),
        features:   features || [],
        timeline:   timeline || 'Flexible',
        additionalNotes: additionalNotes || '',
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      message: 'Land requirement submitted successfully. Our team will contact you soon.',
      requirement: landRequirement
    });
  } catch (error) {
    console.error('Create land requirement error:', error);
    res.status(500).json({ error: 'Failed to create land requirement' });
  }
};

// Get all land requirements (Broker only)
const getAllLandRequirements = async (req, res) => {
  try {
    const { status, city, purposeType, landType } = req.query;
    const where = {};
    if (status)      where.status      = status;
    if (city)        where.city        = city;
    if (purposeType) where.purposeType = purposeType;
    if (landType)    where.landType    = landType;

    const requirements = await prisma.landRequirement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: requirements.length, requirements });
  } catch (error) {
    console.error('Get land requirements error:', error);
    res.status(500).json({ error: 'Failed to fetch land requirements' });
  }
};

// Get single land requirement (Broker only)
const getLandRequirementById = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await prisma.landRequirement.findUnique({ where: { id } });
    if (!requirement) return res.status(404).json({ error: 'Land requirement not found' });
    res.json({ requirement });
  } catch (error) {
    console.error('Get land requirement error:', error);
    res.status(500).json({ error: 'Failed to fetch land requirement' });
  }
};

// Update land requirement status (Broker only)
const updateLandRequirementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'MATCHED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: ACTIVE, MATCHED, or CLOSED' });
    }

    const requirement = await prisma.landRequirement.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    res.json({ message: 'Land requirement status updated successfully', requirement });
  } catch (error) {
    console.error('Update land requirement error:', error);
    res.status(500).json({ error: 'Failed to update land requirement' });
  }
};

// ✅ Get Land Listings (Public)
// Sirf LAND, AGRICULTURAL, INDUSTRIAL — COMMERCIAL kabhi nahi
const getLandListings = async (req, res) => {
  try {
    const { page = 1, limit = 9, landType, minPrice, maxPrice, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ FIX: Only allowed land types — COMMERCIAL pass kare to bhi reject thay
    const typeFilter = landType && ALLOWED_LAND_TYPES.includes(landType.toUpperCase())
      ? [landType.toUpperCase()]
      : ALLOWED_LAND_TYPES;

    const where = {
      type: { in: typeFilter },
      status: 'AVAILABLE',
    };

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      where.OR = [
        { title:   { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city:    { contains: search, mode: 'insensitive' } },
        { state:   { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          broker: {
            select: { id: true, name: true, phone: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      count:    total,
      pages:    Math.ceil(total / parseInt(limit)),
      page:     parseInt(page),
      listings,
    });

  } catch (error) {
    console.error('Get land listings error:', error);
    res.status(500).json({ error: 'Failed to fetch land listings' });
  }
};

module.exports = {
  createLandRequirement,
  getAllLandRequirements,
  getLandRequirementById,
  updateLandRequirementStatus,
  getLandListings,
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * GET /api/brokers
 * Public — Get all ACTIVE & APPROVED brokers
 */
const getAllBrokers = async (req, res) => {
  try {
    const { city, state, search } = req.query;

    const where = {
      role: 'BROKER',
      status: 'ACTIVE',       // Only approved/active brokers
    };

    if (city)   where.city  = { contains: city,   mode: 'insensitive' };
    if (state)  where.state = { contains: state,  mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city:  { contains: search, mode: 'insensitive' } },
      ];
    }

    const brokers = await prisma.user.findMany({
      where,
      select: {
        id:                 true,
        name:               true,
        email:              true,
        phone:              true,
        city:               true,
        state:              true,
        avatar:             true,
        professionalDetails: true,
        createdAt:          true,
        _count: {
          select: { properties: true }   // Total property count
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: brokers.length, brokers });
  } catch (error) {
    console.error('getAllBrokers error:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
};

/**
 * GET /api/brokers/:id
 * Public — Get single broker profile by ID
 */
const getBrokerById = async (req, res) => {
  try {
    const { id } = req.params;

    const broker = await prisma.user.findUnique({
      where: { id },
      select: {
        id:                  true,
        name:                true,
        email:               true,
        phone:               true,
        address:             true,
        city:                true,
        state:               true,
        avatar:              true,
        status:              true,
        role:                true,
        professionalDetails: true,
        createdAt:           true,
        _count: {
          select: { properties: true }
        }
      }
    });

    if (!broker || broker.role !== 'BROKER') {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json({ broker });
  } catch (error) {
    console.error('getBrokerById error:', error);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
};

/**
 * GET /api/brokers/:id/properties
 * Public — Get all properties listed by a specific broker
 */
const getBrokerProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, purpose, status, minPrice, maxPrice } = req.query;

    // Verify broker exists
    const broker = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true }
    });

    if (!broker || broker.role !== 'BROKER') {
      return res.status(404).json({ error: 'Broker not found' });
    }

    const where = { brokerId: id };
    if (type)    where.type    = type;
    if (purpose) where.purpose = purpose;
    if (status)  where.status  = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        broker: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      broker: { id: broker.id, name: broker.name },
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('getBrokerProperties error:', error);
    res.status(500).json({ error: 'Failed to fetch broker properties' });
  }
};

// ============================================================
// BROKER ROUTES (Own profile)
// ============================================================

/**
 * GET /api/brokers/me/profile
 * Broker — Get own full profile
 */
const getMyProfile = async (req, res) => {
  try {
    const broker = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:                  true,
        name:                true,
        email:               true,
        phone:               true,
        address:             true,
        city:                true,
        state:               true,
        avatar:              true,
        status:              true,
        isVerified:          true,
        professionalDetails: true,
        createdAt:           true,
        _count: {
          select: { properties: true, enquiries: true }
        }
      }
    });

    res.json({ broker });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * PUT /api/brokers/me/profile
 * Broker — Update own profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const {
      name, phone, address, city, state, avatar,
      professionalDetails   // JSON: { experience, specialization, licenseNo, about }
    } = req.body;

    // Build update object — only include fields that are sent
    const updateData = {};
    if (name)                updateData.name                = name;
    if (phone)               updateData.phone               = phone;
    if (address)             updateData.address             = address;
    if (city)                updateData.city                = city;
    if (state)               updateData.state               = state;
    if (avatar)              updateData.avatar              = avatar;
    if (professionalDetails) updateData.professionalDetails = professionalDetails;

    const broker = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id:                  true,
        name:                true,
        email:               true,
        phone:               true,
        address:             true,
        city:                true,
        state:               true,
        avatar:              true,
        status:              true,
        professionalDetails: true,
        updatedAt:           true,
      }
    });

    res.json({ message: 'Profile updated successfully', broker });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Phone number already in use' });
    }
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

/**
 * GET /api/brokers/me/enquiries
 * Broker — See all enquiries on own properties
 */
const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: { brokerId: req.user.id },
      include: {
        property: {
          select: { id: true, title: true, city: true, price: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: enquiries.length, enquiries });
  } catch (error) {
    console.error('getMyEnquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

/**
 * GET /api/brokers/me/stats
 * Broker — Dashboard stats
 */
const getMyStats = async (req, res) => {
  try {
    const brokerId = req.user.id;

    const [
      totalProperties,
      availableProperties,
      soldProperties,
      totalEnquiries,
      pendingEnquiries
    ] = await Promise.all([
      prisma.property.count({ where: { brokerId } }),
      prisma.property.count({ where: { brokerId, status: 'AVAILABLE' } }),
      prisma.property.count({ where: { brokerId, status: 'SOLD' } }),
      prisma.enquiry.count({ where: { brokerId } }),
      prisma.enquiry.count({ where: { brokerId, status: 'PENDING' } }),
    ]);

    res.json({
      stats: {
        totalProperties,
        availableProperties,
        soldProperties,
        totalEnquiries,
        pendingEnquiries,
      }
    });
  } catch (error) {
    console.error('getMyStats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ============================================================
// ADMIN ROUTES
// ============================================================

/**
 * GET /api/brokers/admin/all
 * Admin — Get ALL brokers (any status)
 */
const adminGetAllBrokers = async (req, res) => {
  try {
    const { status, city, search } = req.query;

    const where = { role: 'BROKER' };
    if (status) where.status = status;
    if (city)   where.city   = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const brokers = await prisma.user.findMany({
      where,
      select: {
        id:                  true,
        name:                true,
        email:               true,
        phone:               true,
        city:                true,
        state:               true,
        status:              true,
        isVerified:          true,
        avatar:              true,
        professionalDetails: true,
        createdAt:           true,
        _count: {
          select: { properties: true, enquiries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: brokers.length, brokers });
  } catch (error) {
    console.error('adminGetAllBrokers error:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
};

/**
 * PATCH /api/brokers/admin/:id/status
 * Admin — Approve / Reject / Block / Unblock broker
 * Body: { status: 'ACTIVE' | 'REJECTED' | 'BLOCKED' | 'PENDING' }
 */
const adminUpdateBrokerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'REJECTED', 'BLOCKED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Verify it's a broker
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'BROKER') {
      return res.status(404).json({ error: 'Broker not found' });
    }

    const broker = await prisma.user.update({
      where: { id },
      data: {
        status,
        // Auto-mark verified when admin approves
        ...(status === 'ACTIVE' && { isVerified: true }),
      },
      select: {
        id: true, name: true, email: true, status: true, isVerified: true
      }
    });

    const statusMessages = {
      ACTIVE:   'Broker approved successfully',
      REJECTED: 'Broker rejected',
      BLOCKED:  'Broker blocked',
      PENDING:  'Broker set to pending',
    };

    res.json({ message: statusMessages[status], broker });
  } catch (error) {
    console.error('adminUpdateBrokerStatus error:', error);
    res.status(500).json({ error: 'Failed to update broker status', details: error.message });
  }
};

/**
 * DELETE /api/brokers/admin/:id
 * Admin — Permanently delete a broker (and all their properties via Cascade)
 */
const adminDeleteBroker = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'BROKER') {
      return res.status(404).json({ error: 'Broker not found' });
    }

    // Schema has onDelete: Cascade on properties → auto deletes properties+enquiries
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Broker and all related data deleted successfully' });
  } catch (error) {
    console.error('adminDeleteBroker error:', error);
    res.status(500).json({ error: 'Failed to delete broker', details: error.message });
  }
};

module.exports = {
  // Public
  getAllBrokers,
  getBrokerById,
  getBrokerProperties,
  // Broker (own)
  getMyProfile,
  updateMyProfile,
  getMyEnquiries,
  getMyStats,
  // Admin
  adminGetAllBrokers,
  adminUpdateBrokerStatus,
  adminDeleteBroker,
};
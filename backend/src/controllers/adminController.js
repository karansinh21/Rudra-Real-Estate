const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ── Generate JWT ─────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ══════════════════════════════════════════════════════════
// POST /api/admin/login
// Admin login - checks role === ADMIN, saves session
// ══════════════════════════════════════════════════════════
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Admin access only' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// POST /api/admin/create
// Create first admin account (run once from setup)
// ══════════════════════════════════════════════════════════
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    // Protect with setup key from .env
    if (setupKey !== process.env.ADMIN_SETUP_KEY)
      return res.status(403).json({ error: 'Invalid setup key' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password:   hashed,
        role:       'ADMIN',
        status:     'ACTIVE',
        isVerified: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created',
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// GET /api/admin/stats
// Dashboard stats - real data from DB
// ══════════════════════════════════════════════════════════
const getStats = async (req, res) => {
  try {
    const [
      totalUsers, brokers, lawyers, pendingUsers,
      totalProperties, landReqs, legalReqs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BROKER',  status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'LAWYER',  status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING', role: { in: ['BROKER', 'LAWYER'] } } }),
      prisma.property.count(),
      prisma.landRequirement.count(),
      prisma.legalRequest.count(),
    ]);

    res.json({
      totalUsers,
      brokers,
      lawyers,
      pendingApprovals: pendingUsers,
      properties:        totalProperties,
      landRequirements:  landReqs,
      legalRequests:     legalReqs,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// GET /api/admin/users
// Get all users with filters
// ══════════════════════════════════════════════════════════
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;

    const where = {};
    if (role   && role   !== 'all') where.role   = role;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, status: true, isVerified: true,
          avatar: true, city: true, professionalDetails: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip:  (parseInt(page) - 1) * parseInt(limit),
        take:  parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, count });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// GET /api/admin/users/pending
// Pending brokers / lawyers waiting for approval
// ══════════════════════════════════════════════════════════
const getPendingProfessionals = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'PENDING',
        role:   { in: ['BROKER', 'LAWYER'] },
      },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, avatar: true,
        professionalDetails: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' }, // oldest first
    });

    res.json({ users, count: users.length });
  } catch (err) {
    console.error('Pending professionals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// PUT /api/admin/users/:id/approve
// Approve broker or lawyer
// ══════════════════════════════════════════════════════════
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!['BROKER', 'LAWYER'].includes(user.role))
      return res.status(400).json({ error: 'Only BROKER/LAWYER can be approved' });

    const updated = await prisma.user.update({
      where: { id },
      data:  { status: 'ACTIVE', isVerified: true },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, message: `${updated.name} approved!`, user: updated });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// PUT /api/admin/users/:id/reject
// Reject broker or lawyer
// ══════════════════════════════════════════════════════════
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data:  { status: 'REJECTED' },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, message: `${updated.name} rejected.`, user: updated });
  } catch (err) {
    console.error('Reject user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// PUT /api/admin/users/:id/block
// Block any user
// ══════════════════════════════════════════════════════════
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.user.update({
      where: { id },
      data:  { status: 'BLOCKED' },
    });
    res.json({ success: true, message: `${updated.name} blocked.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// DELETE /api/admin/users/:id
// Delete user
// ══════════════════════════════════════════════════════════
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id)
      return res.status(400).json({ error: 'Cannot delete your own account' });

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// GET /api/admin/properties
// All properties
// ══════════════════════════════════════════════════════════
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const [properties, count] = await Promise.all([
      prisma.property.findMany({
        include: {
          broker: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.property.count(),
    ]);

    res.json({ properties, count });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/admin/properties/:id
const deleteProperty = async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════
// GET /api/admin/legal-requests
// All legal requests with lawyer + broker info
// ══════════════════════════════════════════════════════════
const getLegalRequests = async (req, res) => {
  try {
    const requests = await prisma.legalRequest.findMany({
      include: {
        broker: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, serviceName: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error('Legal requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/admin/legal-requests/:id
const updateLegalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.legalRequest.update({
      where: { id: req.params.id },
      data:  { status },
    });
    res.json({ success: true, request: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
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
};
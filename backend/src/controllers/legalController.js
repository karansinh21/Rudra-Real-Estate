const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== LEGAL SERVICES ====================

// Get all legal services (Public)
const getAllLegalServices = async (req, res) => {
  try {
    const services = await prisma.legalService.findMany({
      include: {
        lawyer: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ count: services.length, services });
  } catch (error) {
    console.error('Get legal services error:', error);
    res.status(500).json({ error: 'Failed to fetch legal services' });
  }
};

// Get single legal service (Public)
const getLegalServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.legalService.findUnique({
      where: { id },
      include: {
        lawyer: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
    if (!service) return res.status(404).json({ error: 'Legal service not found' });
    res.json({ service });
  } catch (error) {
    console.error('Get legal service error:', error);
    res.status(500).json({ error: 'Failed to fetch legal service' });
  }
};

// Create legal service (Lawyer)
const createLegalService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;  // ✅ category added
    const lawyerId = req.user.id;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Name, description, and price are required' });
    }

    const service = await prisma.legalService.create({
      data: {
        name,
        description,
        price:    parseFloat(price),
        category: category || 'property',   // ✅ save category, default: property
        lawyerId,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ message: 'Legal service created successfully', service });
  } catch (error) {
    console.error('Create legal service error:', error);
    res.status(500).json({ error: 'Failed to create legal service' });
  }
};

// Update legal service
const updateLegalService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;  // ✅ category added
    const userId = req.user.id;

    const existingService = await prisma.legalService.findFirst({
      where: { id, lawyerId: userId }
    });
    if (!existingService) {
      return res.status(404).json({ error: 'Legal service not found or unauthorized' });
    }

    const service = await prisma.legalService.update({
      where: { id },
      data: {
        ...(name        !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price       !== undefined && { price: parseFloat(price) }),
        ...(category    !== undefined && { category }),   // ✅ update category
      }
    });

    res.json({ message: 'Legal service updated successfully', service });
  } catch (error) {
    console.error('Update legal service error:', error);
    res.status(500).json({ error: 'Failed to update legal service' });
  }
};

// Delete legal service
const deleteLegalService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingService = await prisma.legalService.findFirst({
      where: { id, lawyerId: userId }
    });
    if (!existingService) {
      return res.status(404).json({ error: 'Legal service not found or unauthorized' });
    }

    await prisma.legalService.delete({ where: { id } });
    res.json({ message: 'Legal service deleted successfully' });
  } catch (error) {
    console.error('Delete legal service error:', error);
    res.status(500).json({ error: 'Failed to delete legal service' });
  }
};

// ==================== LEGAL REQUESTS ====================

// Create legal request
const createLegalRequest = async (req, res) => {
  try {
    const { serviceType, propertyDetails, clientName, clientContact, description } = req.body;
    const brokerId = req.user.id;

    if (!serviceType || !propertyDetails || !clientName || !clientContact) {
      return res.status(400).json({ error: 'Service type, property details, client name and contact are required' });
    }

    const legalRequest = await prisma.legalRequest.create({
      data: {
        brokerId,
        serviceType,
        propertyDetails,
        clientName,
        clientContact,
        description: description || '',
        status: 'PENDING'
      },
      include: {
        broker: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.status(201).json({ message: 'Legal request submitted successfully', request: legalRequest });
  } catch (error) {
    console.error('Create legal request error:', error);
    res.status(500).json({ error: 'Failed to create legal request' });
  }
};

// Get broker's own legal requests
const getMyLegalRequests = async (req, res) => {
  try {
    const brokerId = req.user.id;
    const { status } = req.query;
    const where = { brokerId };
    if (status) where.status = status;

    const requests = await prisma.legalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ count: requests.length, requests });
  } catch (error) {
    console.error('Get legal requests error:', error);
    res.status(500).json({ error: 'Failed to fetch legal requests' });
  }
};

// Get all legal requests (lawyer/admin)
const getAllLegalRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const requests = await prisma.legalRequest.findMany({
      where,
      include: {
        broker: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ count: requests.length, requests });
  } catch (error) {
    console.error('Get all legal requests error:', error);
    res.status(500).json({ error: 'Failed to fetch legal requests' });
  }
};

// Get single legal request
const getLegalRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await prisma.legalRequest.findFirst({
      where: { id, brokerId: userId },
      include: {
        broker: { select: { id: true, name: true, email: true, phone: true } }
      }
    });
    if (!request) return res.status(404).json({ error: 'Legal request not found' });
    res.json({ request });
  } catch (error) {
    console.error('Get legal request error:', error);
    res.status(500).json({ error: 'Failed to fetch legal request' });
  }
};

// Update legal request status
const updateLegalRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: PENDING, IN_PROGRESS, COMPLETED, or CANCELLED' });
    }

    const legalRequest = await prisma.legalRequest.update({
      where: { id },
      data: { status }
    });
    res.json({ message: 'Legal request status updated successfully', request: legalRequest });
  } catch (error) {
    console.error('Update legal request error:', error);
    res.status(500).json({ error: 'Failed to update legal request' });
  }
};

// Delete legal request
const deleteLegalRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingRequest = await prisma.legalRequest.findFirst({
      where: { id, brokerId: userId }
    });
    if (!existingRequest) {
      return res.status(404).json({ error: 'Legal request not found or unauthorized' });
    }

    await prisma.legalRequest.delete({ where: { id } });
    res.json({ message: 'Legal request deleted successfully' });
  } catch (error) {
    console.error('Delete legal request error:', error);
    res.status(500).json({ error: 'Failed to delete legal request' });
  }
};

module.exports = {
  getAllLegalServices,
  getLegalServiceById,
  createLegalService,
  updateLegalService,
  deleteLegalService,
  createLegalRequest,
  getMyLegalRequests,
  getAllLegalRequests,
  getLegalRequestById,
  updateLegalRequestStatus,
  deleteLegalRequest
};
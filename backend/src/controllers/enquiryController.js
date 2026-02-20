const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../config/email');
const { enquiryNotification } = require('../utils/emailTemplates');

const prisma = new PrismaClient();

// Create new enquiry (WITH EMAIL)
const createEnquiry = async (req, res) => {
  try {
    const { propertyId, clientName, clientEmail, clientPhone, message } = req.body;

    console.log('📧 Creating enquiry for property:', propertyId);

    // Validate required fields
    if (!propertyId || !clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({ 
        error: 'Property ID, client name, email and phone are required' 
      });
    }

    // Check if property exists અને brokerId લો
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        city: true,
        price: true,
        brokerId: true
      }
    });

    console.log('🏠 Property found:', property);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if brokerId exists
    if (!property.brokerId) {
      console.error('❌ Property has no brokerId:', property);
      return res.status(500).json({ 
        error: 'Property has no associated broker. Please contact support.' 
      });
    }

    // Verify broker exists (check both brokers and users table)
    let broker = await prisma.broker.findUnique({
      where: { id: property.brokerId }
    });

    // If not in brokers table, check users table
    if (!broker) {
      broker = await prisma.user.findUnique({
        where: { id: property.brokerId }
      });
    }

    console.log('👤 Broker found:', broker ? broker.name : 'NOT FOUND');

    if (!broker) {
      console.error('❌ Broker not found for ID:', property.brokerId);
      return res.status(500).json({ 
        error: 'Associated broker not found. Please contact support.' 
      });
    }

    console.log('✅ Creating enquiry with brokerId:', property.brokerId);

    // Create enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId,
        clientName,
        clientEmail,
        clientPhone,
        message: message || '',
        brokerId: property.brokerId,
        status: 'PENDING'
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true
          }
        }
      }
    });

    console.log('🎉 Enquiry created successfully:', enquiry.id);

    // 📧 Send Email Notification to Broker
    try {
      const emailHtml = enquiryNotification(broker.name, enquiry, property);
      await sendEmail(
        broker.email, 
        `New Enquiry for ${property.title} 🏠`, 
        emailHtml
      );
      console.log('✅ Enquiry notification email sent to:', broker.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send enquiry email:', emailError.message);
      // Don't fail enquiry creation if email fails
    }

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      enquiry
    });

  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({ error: 'Failed to create enquiry' });
  }
};

// Get all enquiries for a broker
const getBrokerEnquiries = async (req, res) => {
  try {
    const brokerId = req.user.id;

    const enquiries = await prisma.enquiry.findMany({
      where: { brokerId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      enquiries,
      total: enquiries.length
    });

  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// Update enquiry status
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const brokerId = req.user.id;

    // Validate status
    const validStatuses = ['PENDING', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if enquiry belongs to broker
    const enquiry = await prisma.enquiry.findFirst({
      where: { id, brokerId }
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    // Update status
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: { status },
      include: {
        property: {
          select: {
            title: true
          }
        }
      }
    });

    res.json({
      message: 'Enquiry status updated successfully',
      enquiry: updatedEnquiry
    });

  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
};

// Delete enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const brokerId = req.user.id;

    // Check if enquiry belongs to broker
    const enquiry = await prisma.enquiry.findFirst({
      where: { id, brokerId }
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    await prisma.enquiry.delete({
      where: { id }
    });

    res.json({ message: 'Enquiry deleted successfully' });

  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
};

module.exports = {
  createEnquiry,
  getBrokerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
};
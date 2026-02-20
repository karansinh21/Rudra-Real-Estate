const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary');
const prisma = new PrismaClient();
const { sendEmail } = require('../config/email');
const { propertyAddedEmail } = require('../utils/emailTemplates');

// Get all properties (Public - કોઈ પણ જોઈ શકે)
const getAllProperties = async (req, res) => {
  try {
    // Query parameters માંથી filters લો
    const { type, purpose, city, status, minPrice, maxPrice } = req.query;
    
    // Where condition બનાવો
    const where = {};

    if (type) where.type = type;
    if (purpose) where.purpose = purpose;
    if (city) where.city = city;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Database માંથી properties લાવો
    const properties = await prisma.property.findMany({
      where,
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      count: properties.length,
      properties 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Get single property by ID (Public)
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Create new property (Broker only - માત્ર broker add કરી શકે)
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      purpose,
      price,
      area,
      bedrooms,
      bathrooms,
      address,
      city,
      state,
      pincode,
      features,
      images // 🆕 This will be an array of {url, publicId, thumbnail}
    } = req.body;

    const brokerId = req.user.id;

    // Validation
    if (!title || !type || !purpose || !price || !area || !address || !city || !state) {
      return res.status(400).json({ 
        error: 'Title, type, purpose, price, area, address, city and state are required' 
      });
    }

    // 🆕 Validate images format (if provided)
    let validatedImages = [];
    if (images && Array.isArray(images)) {
      validatedImages = images.filter(img => img.url && img.publicId);
    }

    // Property create કરો (with broker relation)
    const property = await prisma.property.create({
      data: {
        title,
        description: description || '',
        type,
        purpose,
        price: parseFloat(price),
        area: parseFloat(area),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        address,
        city,
        state,
        pincode: pincode || '',
        features: features || [],
        images: validatedImages, // 🆕 JSON array of image objects
        status: 'AVAILABLE',
        brokerId
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
// 📧 Send Property Confirmation Email
    try {
      const broker = await prisma.broker.findUnique({
        where: { id: brokerId }
      });
      
      if (broker) {
        const emailHtml = propertyAddedEmail(broker.name, property);
        await sendEmail(
          broker.email,
          `Property Listed: ${property.title} 🎉`,
          emailHtml
        );
        console.log('✅ Property confirmation email sent to:', broker.email);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send property email:', emailError.message);
    }

    res.status(201).json({
      message: 'Property created successfully',
      property
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ 
      error: 'Failed to create property',
      details: error.message 
    });
  }
};

// Update property (Broker - માત્ર પોતાની property update કરી શકે)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if property exists અને broker ની છે કે નહીં
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if this broker owns this property
    if (existingProperty.brokerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only update your own properties' });
    }

    // 🆕 Handle images update
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.filter(img => img.url && img.publicId);
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.area) updateData.area = parseFloat(updateData.area);
    if (updateData.bedrooms) updateData.bedrooms = parseInt(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms);

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Failed to update property',
      details: error.message 
    });
  }
};

// Delete property (Broker - માત્ર પોતાની property delete કરી શકે)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists અને broker ની છે કે નહીં
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if this broker owns this property
    if (existingProperty.brokerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own properties' });
    }

    // 🆕 Delete images from Cloudinary before deleting property
    try {
      const images = existingProperty.images;
      if (Array.isArray(images) && images.length > 0) {
        console.log(`🗑️ Deleting ${images.length} images from Cloudinary...`);
        
        for (const image of images) {
          if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
            console.log(`✅ Deleted image: ${image.publicId}`);
          }
        }
      }
    } catch (cloudinaryError) {
      console.error('⚠️ Error deleting images from Cloudinary:', cloudinaryError);
      // Continue with property deletion even if image deletion fails
    }

    // Delete property
    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property and images deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Failed to delete property',
      details: error.message 
    });
  }
};

// Get broker's own properties (Broker - પોતાની properties જોવા માટે)
const getMyProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { brokerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      count: properties.length,
      properties 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
};
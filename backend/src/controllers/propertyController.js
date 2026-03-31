const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary');
const prisma = new PrismaClient();
const { sendEmail } = require('../config/email');
const { propertyAddedEmail } = require('../utils/emailTemplates');
const { geocodeAddress } = require('../services/mapsService'); // ✅ MAP

// Land types - aa public property listings ma nahi aava joiye
const LAND_TYPES = ['LAND', 'AGRICULTURAL', 'INDUSTRIAL'];

// Get all properties (Public) - Land types exclude thay by default
const getAllProperties = async (req, res) => {
  try {
    const { type, purpose, city, status, minPrice, maxPrice, limit } = req.query;
    
    const where = {};

    if (type) {
      where.type = type.toUpperCase();
    } else {
      where.type = { notIn: LAND_TYPES };
    }

    if (purpose) where.purpose = purpose;
    if (city) where.city = city;
    if (status) where.status = status;
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
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    res.json({ count: properties.length, properties });
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
          select: { id: true, name: true, email: true, phone: true }
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

// Create new property (Broker only)
const createProperty = async (req, res) => {
  try {
    const {
      title, description, type, purpose, price, area,
      bedrooms, bathrooms, address, city, state, pincode,
      features, images
    } = req.body;

    const brokerId = req.user.id;

    if (!title || !type || !purpose || !price || !area || !address || !city || !state) {
      return res.status(400).json({ 
        error: 'Title, type, purpose, price, area, address, city and state are required' 
      });
    }

    let validatedImages = [];
    if (images && Array.isArray(images)) {
      validatedImages = images.filter(img => img.url && img.publicId);
    }

    // ✅ MAP: Geocode address → lat/lng save karo (Google Maps API key hoy to)
    const { lat, lng } = await geocodeAddress(`${address}, ${city}, ${state}, India`);
    if (lat && lng) console.log(`📍 Geocoded: lat=${lat}, lng=${lng}`);

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
        images: validatedImages,
        status: 'AVAILABLE',
        latitude: lat,    // ✅ MAP
        longitude: lng,   // ✅ MAP
        brokerId
      },
      include: {
        broker: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    try {
      const brokerEmail = req.user.email;
      const brokerName  = req.user.name;
      if (brokerEmail) {
        const emailHtml = propertyAddedEmail(brokerName, property);
        await sendEmail(brokerEmail, `Property Listed: ${property.title} 🎉`, emailHtml);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send property email:', emailError.message);
    }

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property', details: error.message });
  }
};

// Update property (Broker)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existingProperty = await prisma.property.findUnique({ where: { id } });
    if (!existingProperty) return res.status(404).json({ error: 'Property not found' });

    if (existingProperty.brokerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only update your own properties' });
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.filter(img => img.url && img.publicId);
    }

    if (updateData.price)     updateData.price     = parseFloat(updateData.price);
    if (updateData.area)      updateData.area      = parseFloat(updateData.area);
    if (updateData.bedrooms)  updateData.bedrooms  = parseInt(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms);

    // ✅ MAP: Address badlayo hoy to re-geocode karo
    const addrChanged = (updateData.address && updateData.address !== existingProperty.address)
      || (updateData.city  && updateData.city  !== existingProperty.city)
      || (updateData.state && updateData.state !== existingProperty.state);

    if (addrChanged) {
      const fullAddr = `${updateData.address || existingProperty.address}, ${updateData.city || existingProperty.city}, ${updateData.state || existingProperty.state}, India`;
      const { lat, lng } = await geocodeAddress(fullAddr);
      if (lat && lng) {
        updateData.latitude  = lat;
        updateData.longitude = lng;
        console.log(`📍 Re-geocoded: lat=${lat}, lng=${lng}`);
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: { broker: { select: { id: true, name: true, email: true, phone: true } } }
    });

    res.json({ message: 'Property updated successfully', property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update property', details: error.message });
  }
};

// Delete property (Broker)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProperty = await prisma.property.findUnique({ where: { id } });
    if (!existingProperty) return res.status(404).json({ error: 'Property not found' });

    if (existingProperty.brokerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own properties' });
    }

    try {
      const images = existingProperty.images;
      if (Array.isArray(images) && images.length > 0) {
        for (const image of images) {
          if (image.publicId) await cloudinary.uploader.destroy(image.publicId);
        }
      }
    } catch (cloudinaryError) {
      console.error('⚠️ Error deleting images from Cloudinary:', cloudinaryError);
    }

    await prisma.property.delete({ where: { id } });
    res.json({ message: 'Property and images deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete property', details: error.message });
  }
};

// Get broker's own properties
const getMyProperties = async (req, res) => {
  try {
    const { types } = req.query; // 'land' or 'property' or undefined = all

    const where = { brokerId: req.user.id };

    if (types === 'land') {
      where.type = { in: LAND_TYPES };
    } else if (types === 'property') {
      where.type = { notIn: LAND_TYPES };
    }
    // types undefined = all (broker panel ma sab dikhav)

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: properties.length, properties });
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
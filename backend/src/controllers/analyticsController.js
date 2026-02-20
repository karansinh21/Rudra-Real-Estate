const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard overview
const getDashboardStats = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // Total properties
    const totalProperties = await prisma.property.count({
      where: { brokerId }
    });

    // Properties by status
    const availableProperties = await prisma.property.count({
      where: { brokerId, status: 'AVAILABLE' }
    });

    const soldProperties = await prisma.property.count({
      where: { brokerId, status: 'SOLD' }
    });

    const rentedProperties = await prisma.property.count({
      where: { brokerId, status: 'RENTED' }
    });

    // Total enquiries
    const totalEnquiries = await prisma.enquiry.count({
      where: { brokerId }
    });

    // Recent enquiries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEnquiries = await prisma.enquiry.count({
      where: {
        brokerId,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Revenue calculations (SALE properties only)
    const soldPropertiesData = await prisma.property.findMany({
      where: { brokerId, status: 'SOLD', purpose: 'SALE' },
      select: { price: true }
    });

    const totalRevenue = soldPropertiesData.reduce((sum, prop) => sum + prop.price, 0);

    // Average property price
    const allProperties = await prisma.property.findMany({
      where: { brokerId },
      select: { price: true }
    });

    const averagePrice = allProperties.length > 0
      ? allProperties.reduce((sum, prop) => sum + prop.price, 0) / allProperties.length
      : 0;

    res.json({
      stats: {
        totalProperties,
        availableProperties,
        soldProperties,
        rentedProperties,
        totalEnquiries,
        recentEnquiries,
        totalRevenue,
        averagePrice: Math.round(averagePrice)
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get property analytics
const getPropertyAnalytics = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // Properties by type
    const propertiesByType = await prisma.property.groupBy({
      by: ['type'],
      where: { brokerId },
      _count: true
    });

    // Properties by purpose
    const propertiesByPurpose = await prisma.property.groupBy({
      by: ['purpose'],
      where: { brokerId },
      _count: true
    });

    // Properties by city
    const propertiesByCity = await prisma.property.groupBy({
      by: ['city'],
      where: { brokerId },
      _count: true
    });

    res.json({
      analytics: {
        byType: propertiesByType.map(item => ({
          type: item.type,
          count: item._count
        })),
        byPurpose: propertiesByPurpose.map(item => ({
          purpose: item.purpose,
          count: item._count
        })),
        byCity: propertiesByCity.map(item => ({
          city: item.city,
          count: item._count
        }))
      }
    });

  } catch (error) {
    console.error('Get property analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch property analytics' });
  }
};

// Get enquiry analytics
const getEnquiryAnalytics = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // Enquiries by status
    const enquiriesByStatus = await prisma.enquiry.groupBy({
      by: ['status'],
      where: { brokerId },
      _count: true
    });

    // Monthly enquiries (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnquiries = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "enquiries"
      WHERE "brokerId" = ${brokerId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month
    `;

    res.json({
      analytics: {
        byStatus: enquiriesByStatus.map(item => ({
          status: item.status,
          count: item._count
        })),
        monthly: monthlyEnquiries
      }
    });

  } catch (error) {
    console.error('Get enquiry analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch enquiry analytics' });
  }
};

module.exports = {
  getDashboardStats,
  getPropertyAnalytics,
  getEnquiryAnalytics
};
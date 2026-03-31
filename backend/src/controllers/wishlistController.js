const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET /api/wishlist — user na saved properties */
const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: { broker: { select: { id: true, name: true, phone: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ wishlist: wishlist.map(w => w.property).filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

/* POST /api/wishlist — property add karo */
const addToWishlist = async (req, res) => {
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ error: 'propertyId required' });
  try {
    // Property exist che ke nai check
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const item = await prisma.wishlist.upsert({
      where:  { userId_propertyId: { userId: req.user.id, propertyId } },
      create: { userId: req.user.id, propertyId },
      update: {},
    });
    res.json({ message: 'Added to wishlist', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

/* DELETE /api/wishlist/:propertyId — remove */
const removeFromWishlist = async (req, res) => {
  const { propertyId } = req.params;
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, propertyId }
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove' });
  }
};

/* DELETE /api/wishlist — clear all */
const clearWishlist = async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
};

/* GET /api/wishlist/ids — sirf IDs return karo (fast check) */
const getWishlistIds = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true }
    });
    res.json({ ids: items.map(i => i.propertyId) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist IDs' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, getWishlistIds };
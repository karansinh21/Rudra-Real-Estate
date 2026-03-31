const express = require('express');
const router  = express.Router();

// ✅ FIX: 'authenticate' nahi — 'verifyToken' che (same as landRoutes, propertyRoutes)
const { verifyToken } = require('../middleware/auth');

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistIds
} = require('../controllers/wishlistController');

// All wishlist routes require login
router.use(verifyToken);

router.get   ('/',             getWishlist);        // GET    /api/wishlist
router.get   ('/ids',          getWishlistIds);     // GET    /api/wishlist/ids
router.post  ('/',             addToWishlist);      // POST   /api/wishlist
router.delete('/:propertyId',  removeFromWishlist); // DELETE /api/wishlist/:propertyId
router.delete('/',             clearWishlist);      // DELETE /api/wishlist

module.exports = router;
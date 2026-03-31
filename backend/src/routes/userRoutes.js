const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getPendingUsers,
  getUserById,
  getLawyerProfile,   // ✅ NEW
  approveUser,
  rejectUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// ✅ PUBLIC - No auth needed (LawyerDirectory + LawyerProfile pages mate)
// GET /api/users/lawyer-profile        → single lawyer (directory page)
// GET /api/users/lawyer-profile/:id    → by ID (profile page)
router.get('/lawyer-profile', getLawyerProfile);
router.get('/lawyer-profile/:id', getLawyerProfile);

// ✅ Badha baaki routes Admin only che

// GET /api/users - Badha users
router.get('/', protect, isAdmin, getAllUsers);

// GET /api/users/pending - Pending approval wala
router.get('/pending', protect, isAdmin, getPendingUsers);

// GET /api/users/:id - Ek user detail
router.get('/:id', protect, isAdmin, getUserById);

// PUT /api/users/:id - User update
router.put('/:id', protect, isAdmin, updateUser);

// PUT /api/users/:id/approve - User approve
router.put('/:id/approve', protect, isAdmin, approveUser);

// PUT /api/users/:id/reject - User reject
router.put('/:id/reject', protect, isAdmin, rejectUser);

// DELETE /api/users/:id - User delete
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
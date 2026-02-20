const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { verifyToken, isBroker } = require('../middleware/auth');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (Broker only)
router.post('/', verifyToken, isBroker, propertyController.createProperty);
router.get('/my/properties', verifyToken, isBroker, propertyController.getMyProperties);
router.put('/:id', verifyToken, isBroker, propertyController.updateProperty);
router.delete('/:id', verifyToken, isBroker, propertyController.deleteProperty);

module.exports = router;
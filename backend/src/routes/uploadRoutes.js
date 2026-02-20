const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

// Configure multer directly here
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Routes with proper error handling
router.post('/single', authenticate, (req, res, next) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        error: 'File upload error', 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        tip: 'Send file with field name "image"'
      });
    }
    
    // File received successfully, pass to controller
    uploadController.uploadSingleImage(req, res);
  });
});

router.post('/multiple', authenticate, (req, res, next) => {
  const uploadMultiple = upload.array('images', 10);
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        error: 'File upload error', 
        message: err.message 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No files uploaded',
        tip: 'Send files with field name "images"'
      });
    }
    
    uploadController.uploadMultipleImages(req, res);
  });
});

router.delete('/delete', authenticate, uploadController.deleteImage);

module.exports = router;
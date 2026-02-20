const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    console.log('📸 Upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        error: 'No image file provided',
        tip: 'Make sure to send file with key name "image"'
      });
    }

    console.log('✅ File received:', req.file.originalname);

    // Optimize image with sharp
    const optimizedImageBuffer = await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log('✅ Image optimized');

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'rudra-real-estate/properties',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful');
            resolve(result);
          }
        }
      );

      uploadStream.end(optimizedImageBuffer);
    });

    const result = await uploadPromise;

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto'
    });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      thumbnail: thumbnailUrl
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    console.log('📸 Multiple upload request received');
    console.log('Files:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No image files provided',
        tip: 'Make sure to send files with key name "images"'
      });
    }

    console.log(`✅ ${req.files.length} files received`);

    const uploadPromises = req.files.map(async (file) => {
      // Optimize image
      const optimizedImageBuffer = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'rudra-real-estate/properties',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else {
              const thumbnailUrl = cloudinary.url(result.public_id, {
                width: 400,
                height: 300,
                crop: 'fill'
              });
              
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                thumbnail: thumbnailUrl
              });
            }
          }
        );

        uploadStream.end(optimizedImageBuffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    console.log('✅ All images uploaded successfully');

    res.json({
      message: 'Images uploaded successfully',
      count: results.length,
      images: results
    });

  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      message: error.message
    });
  }
};

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};
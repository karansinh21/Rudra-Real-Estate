const express  = require('express');
const router   = express.Router();
const propertyController = require('../controllers/propertyController');
const { verifyToken, isBroker } = require('../middleware/auth');

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/', propertyController.getAllProperties);

// ✅ /my/properties MUST be before /:id — otherwise Express reads 'my' as an id param
router.get('/my/properties', verifyToken, isBroker, propertyController.getMyProperties);

router.get('/:id', propertyController.getPropertyById);

// ── Protected routes (Broker only) ─────────────────────────────────────────
router.post('/',     verifyToken, isBroker, propertyController.createProperty);
router.put('/:id',   verifyToken, isBroker, propertyController.updateProperty);
router.delete('/:id',verifyToken, isBroker, propertyController.deleteProperty);

// ✅ NEW: PDF Download — GET /api/properties/:id/pdf
// No auth required so public users can download property reports
const { generatePropertyPDF } = require('../services/pdfService');
const { PrismaClient }        = require('@prisma/client');
const fs                      = require('fs');
const prisma                  = new PrismaClient();

router.get('/:id/pdf', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { broker: { select: { name: true, email: true, phone: true } } }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const filePath = await generatePropertyPDF(property);

    const fileName = `${property.title.replace(/[^a-zA-Z0-9]/g, '-')}-report.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    // Clean up temp file after sending
    stream.on('end', () => {
      fs.unlink(filePath, () => {}); // silently delete temp file
    });

    stream.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Failed to send PDF' });
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

module.exports = router;
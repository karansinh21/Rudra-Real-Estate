const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate property PDF
const generatePropertyPDF = async (property) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `property-${property.id}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../temp', fileName);

      // Create temp directory if not exists
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text('Rudra Real Estate', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Property Details Report', { align: 'center' });
      doc.moveDown(2);

      // Property details
      doc.fontSize(12);
      doc.text(`Title: ${property.title}`, { continued: false });
      doc.text(`Type: ${property.type}`);
      doc.text(`Purpose: ${property.purpose}`);
      doc.text(`Price: ₹${property.price.toLocaleString('en-IN')}`);
      doc.text(`Area: ${property.area} sq ft`);
      
      if (property.bedrooms) doc.text(`Bedrooms: ${property.bedrooms}`);
      if (property.bathrooms) doc.text(`Bathrooms: ${property.bathrooms}`);
      
      doc.text(`Address: ${property.address}`);
      doc.text(`City: ${property.city}, ${property.state}`);
      doc.text(`Status: ${property.status}`);

      if (property.features && property.features.length > 0) {
        doc.moveDown();
        doc.text('Features:');
        property.features.forEach(feature => {
          doc.text(`• ${feature}`);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePropertyPDF
};
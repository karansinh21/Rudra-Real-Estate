// Welcome Email Template
const welcomeEmail = (brokerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Rudra Real Estate</h1>
          <p>Welcome to the Family!</p>
        </div>
        <div class="content">
          <h2>નમસ્તે ${brokerName}! 🙏</h2>
          <p>Welcome to Rudra Real Estate platform! We're excited to have you on board.</p>
          <p>તમારું account successfully create થઈ ગયું છે. હવે તમે:</p>
          <ul>
            <li>✅ Properties add કરી શકો છો</li>
            <li>✅ Enquiries manage કરી શકો છો</li>
            <li>✅ Legal services request કરી શકો છો</li>
            <li>✅ Land requirements track કરી શકો છો</li>
          </ul>
          <p>Get started by adding your first property!</p>
          <a href="http://localhost:5000" class="button">View Dashboard</a>
        </div>
        <div class="footer">
          <p>© 2025 Rudra Real Estate. All rights reserved.</p>
          <p>📧 Contact: rudrarealestate001@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Enquiry Notification Email
const enquiryNotification = (brokerName, enquiry, property) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Enquiry Received!</h1>
        </div>
        <div class="content">
          <h2>નમસ્તે ${brokerName},</h2>
          <p>તમને એક નવી enquiry મળી છે!</p>
          
          <div class="info-box">
            <h3>🏠 Property Details:</h3>
            <p><strong>Title:</strong> ${property.title}</p>
            <p><strong>City:</strong> ${property.city}</p>
            <p><strong>Price:</strong> ₹${property.price.toLocaleString()}</p>
          </div>

          <div class="info-box">
            <h3>👤 Client Details:</h3>
            <p><strong>Name:</strong> ${enquiry.clientName}</p>
            <p><strong>Email:</strong> ${enquiry.clientEmail}</p>
            <p><strong>Phone:</strong> ${enquiry.clientPhone}</p>
            <p><strong>Message:</strong> ${enquiry.message || 'No message'}</p>
          </div>

          <p><strong>⏰ Received:</strong> ${new Date(enquiry.createdAt).toLocaleString('en-IN')}</p>
          <p>Please contact the client as soon as possible!</p>
        </div>
        <div class="footer">
          <p>© 2025 Rudra Real Estate</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Property Added Confirmation
const propertyAddedEmail = (brokerName, property) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .property-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .badge { display: inline-block; padding: 5px 15px; background: #10b981; color: white; border-radius: 20px; font-size: 12px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Property Listed Successfully!</h1>
        </div>
        <div class="content">
          <h2>નમસ્તે ${brokerName},</h2>
          <p>તમારી property successfully list થઈ ગઈ છે!</p>
          
          <div class="property-card">
            <span class="badge">${property.type}</span>
            <span class="badge">${property.purpose}</span>
            <h3>${property.title}</h3>
            <p>📍 ${property.address}, ${property.city}</p>
            <p>💰 <strong>₹${property.price.toLocaleString()}</strong></p>
            <p>📐 Area: ${property.area} sq.ft</p>
            ${property.bedrooms ? `<p>🛏️ ${property.bedrooms} BHK</p>` : ''}
            <p>✅ Status: ${property.status}</p>
          </div>

          <p>Your property is now visible to potential buyers/renters!</p>
        </div>
        <div class="footer">
          <p>© 2025 Rudra Real Estate</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Legal Request Confirmation
const legalRequestEmail = (brokerName, request) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚖️ Legal Request Submitted</h1>
        </div>
        <div class="content">
          <h2>નમસ્તે ${brokerName},</h2>
          <p>તમારી legal service request successfully submit થઈ ગઈ છે.</p>
          
          <div class="info-box">
            <h3>📋 Request Details:</h3>
            <p><strong>Service Type:</strong> ${request.serviceType}</p>
            <p><strong>Client Name:</strong> ${request.clientName}</p>
            <p><strong>Contact:</strong> ${request.clientContact}</p>
            <p><strong>Property Details:</strong> ${request.propertyDetails}</p>
            <p><strong>Status:</strong> ${request.status}</p>
          </div>

          <p>Our legal team will contact you within 24-48 hours.</p>
        </div>
        <div class="footer">
          <p>© 2025 Rudra Real Estate</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  welcomeEmail,
  enquiryNotification,
  propertyAddedEmail,
  legalRequestEmail
};
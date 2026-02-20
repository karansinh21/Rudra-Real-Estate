const twilio = require('twilio');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Initialize Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs in memory (use Redis in production)
const otpStore = new Map();

// 📱 Send WhatsApp OTP
exports.sendWhatsAppOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      });
    }

    // Clean and format phone number
    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone = cleanPhone;

    // Add India country code if not present
    if (cleanPhone.length === 10) {
      formattedPhone = '91' + cleanPhone;
    }

    // Validate Indian mobile number (starts with 6-9)
    const last10Digits = formattedPhone.slice(-10);
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!phoneRegex.test(last10Digits)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid Indian mobile number (starting with 6-9)' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5 minutes expiry
    otpStore.set(formattedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
      createdAt: new Date().toISOString()
    });

    // Format for WhatsApp
    const whatsappNumber = `whatsapp:+${formattedPhone}`;
    
    console.log(`📱 Sending WhatsApp OTP to: ${whatsappNumber}`);
    console.log(`🔐 OTP (Development): ${otp}`); // Remove in production

    // Send WhatsApp message via Twilio
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: whatsappNumber,
      body: `🏠 *Rudra Real Estate*\n\nYour verification code is: *${otp}*\n\nValid for 5 minutes.\n\n⚠️ Do not share this code with anyone.`
    });

    console.log(`✅ WhatsApp message sent! SID: ${message.sid}`);

    res.status(200).json({ 
      success: true,
      message: 'OTP sent successfully to your WhatsApp',
      phone: formattedPhone,
      expiresIn: 300, // 5 minutes
      messageSid: message.sid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ WhatsApp OTP Send Error:', error);
    
    // Handle Twilio specific errors
    if (error.code === 21608) {
      return res.status(400).json({ 
        success: false,
        message: '⚠️ This number is not connected to Twilio WhatsApp Sandbox.',
        twilioError: true,
        instructions: 'Please send "join <sandbox-code>" to the Twilio WhatsApp number first.',
        sandboxNumber: '+1 415 523 8886'
      });
    }

    if (error.code === 20003) {
      return res.status(401).json({ 
        success: false,
        message: '❌ Twilio authentication failed. Please check your credentials.'
      });
    }

    if (error.code === 21211) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Invalid phone number format.'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ✅ Verify WhatsApp OTP
exports.verifyWhatsAppOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number and OTP are required' 
      });
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    // Get stored OTP data
    const storedData = otpStore.get(formattedPhone);

    if (!storedData) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.' 
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(formattedPhone);
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired. Please request a new one.',
        expired: true
      });
    }

    // Check maximum attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(formattedPhone);
      return res.status(400).json({ 
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
        maxAttemptsReached: true
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.toString().trim()) {
      storedData.attempts += 1;
      
      return res.status(400).json({ 
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempt(s) remaining.`,
        attemptsRemaining: 3 - storedData.attempts
      });
    }

    // OTP verified successfully - clear from store
    otpStore.delete(formattedPhone);
    console.log(`✅ OTP verified successfully for +${formattedPhone}`);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { phone: formattedPhone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isApproved: true,
        createdAt: true
      }
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: `User ${formattedPhone.slice(-4)}`,
          email: `${formattedPhone}@whatsapp.user`,
          password: '', // No password for WhatsApp login
          phone: formattedPhone,
          role: 'PUBLIC',
          isApproved: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isApproved: true,
          createdAt: true
        }
      });
      
      isNewUser = true;
      console.log(`✅ New user created via WhatsApp: ${user.id}`);
    } else {
      console.log(`✅ Existing user logged in via WhatsApp: ${user.id}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        phone: user.phone 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created and logged in successfully!' : 'Login successful!',
      isNewUser,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('❌ WhatsApp OTP Verify Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// 🔄 Resend WhatsApp OTP
exports.resendWhatsAppOTP = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ 
      success: false,
      message: 'Phone number is required' 
    });
  }

  // Format phone
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  // Check if there's a recent OTP request (rate limiting)
  const existingOTP = otpStore.get(formattedPhone);
  if (existingOTP) {
    const timeSinceCreation = Date.now() - new Date(existingOTP.createdAt).getTime();
    
    // Allow resend only after 30 seconds
    if (timeSinceCreation < 30000) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil((30000 - timeSinceCreation) / 1000)} seconds before requesting a new OTP.`,
        waitTime: Math.ceil((30000 - timeSinceCreation) / 1000)
      });
    }
  }

  // Delete old OTP and send new one
  otpStore.delete(formattedPhone);
  
  // Call sendWhatsAppOTP
  return exports.sendWhatsAppOTP(req, res);
};
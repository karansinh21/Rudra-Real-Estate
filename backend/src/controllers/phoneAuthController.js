const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

/**
 * SEND OTP (Fast2SMS)
 */
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (5 minutes)
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Clean Indian number (+91 remove)
    const mobile = phone.replace('+91', '');

    // Send OTP via Fast2SMS
    const response = await axios.get(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          route: 'otp',
          variables_values: otp,
          numbers: mobile
        }
      }
    );

    if (!response.data.return) {
      return res.status(500).json({ message: 'OTP sending failed' });
    }

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes
    });

  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

/**
 * VERIFY OTP
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, clear from store
    otpStore.delete(phone);

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { phone }
    });

    // Create new user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@phone.user`,
          password: '',
          phone,
          role: 'PUBLIC',
          isApproved: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

module.exports = { sendOTP, verifyOTP };

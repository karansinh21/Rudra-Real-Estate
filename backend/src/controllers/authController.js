const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');
const { welcomeEmail } = require('../utils/emailTemplates');
const { sendWelcomeSMS } = require('../services/smsService');

const prisma = new PrismaClient();

// ============= UNIFIED REGISTER (ALL ROLES) =============
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, role, professionalDetails } = req.body;

    console.log('Registration attempt:', { email, role });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Determine role and status
    const userRole = role || 'PUBLIC';
    let userStatus = 'ACTIVE';

    // If BROKER or LAWYER, set status to PENDING (requires admin approval)
    if (userRole === 'BROKER' || userRole === 'LAWYER') {
      userStatus = 'PENDING';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || 'Gujarat',
        role: userRole,
        status: userStatus,
        professionalDetails: professionalDetails || null
      }
    });

    console.log('✅ User created:', { id: user.id, role: user.role, status: user.status });

    // For PENDING users (BROKER/LAWYER), don't send token
    if (user.status === 'PENDING') {
      return res.status(201).json({
        message: 'Registration submitted successfully. Your account is pending admin approval. You will receive an email once verified.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    }

    // For ACTIVE users (PUBLIC), create JWT token and send welcome messages
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 📧 Send Welcome Email
    try {
      const emailHtml = welcomeEmail(user.name);
      await sendEmail(user.email, 'Welcome to Rudra Real Estate! 🏠', emailHtml);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError.message);
    }

    // 📱 Send Welcome SMS (if phone provided)
    if (phone) {
      try {
        await sendWelcomeSMS(user.name, user.phone);
        console.log('📱 Welcome SMS sent to:', user.phone);
      } catch (smsError) {
        console.error('⚠️ Failed to send welcome SMS:', smsError.message);
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// ============= LOGIN (ALL ROLES) =============
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', { email: user.email, role: user.role, status: user.status });

    // Check account status
    if (user.status === 'PENDING') {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval. You will receive an email once verified.' 
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({ 
        error: 'Your account registration was rejected. Please contact support for more information.' 
      });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ 
        error: 'Your account has been blocked. Please contact support.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Password valid, creating token');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// ============= GET PROFILE =============
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        role: true,
        status: true,
        isVerified: true,
        professionalDetails: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ============= LEGACY SUPPORT (Deprecated but kept for compatibility) =============
const registerUser = async (req, res) => {
  // Just redirect to main register function
  return register(req, res);
};

// ============= OTP FUNCTIONS =============
const { generateOTP, storeOTP, verifyOTP } = require('../services/otpService');

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    console.log(`📱 OTP for ${phone}: ${otp}`);

    // In development, return OTP for testing
    res.json({
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTPController = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const result = verifyOTP(phone, otp);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: result.message });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// ============= UPDATE PROFILE =============
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        role: true,
        status: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ============= CHANGE PASSWORD =============
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  registerUser,
  sendOTP,
  verifyOTP: verifyOTPController,
  updateProfile,     
  changePassword      
};
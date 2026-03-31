const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ✅ NEW
const nodemailer = require('nodemailer'); // ✅ NEW
const { sendEmail } = require('../config/email');
const { welcomeEmail } = require('../utils/emailTemplates');
const { sendWelcomeSMS } = require('../services/smsService');

const prisma = new PrismaClient();

// ============= UNIFIED REGISTER (ALL ROLES) =============
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, role, professionalDetails } = req.body;

    console.log('Registration attempt:', { email, role });

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const userRole   = role || 'PUBLIC';
    const userStatus = (userRole === 'BROKER' || userRole === 'LAWYER') ? 'PENDING' : 'ACTIVE';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        phone:    phone    || null,
        address:  address  || null,
        city:     city     || null,
        state:    state    || 'Gujarat',
        role:     userRole,
        status:   userStatus,
        professionalDetails: professionalDetails || null
      }
    });

    console.log('✅ User created:', { id: user.id, role: user.role, status: user.status });

    if (user.status === 'PENDING') {
      return res.status(201).json({
        message: 'Registration submitted successfully. Your account is pending admin approval.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    try {
      const emailHtml = welcomeEmail(user.name);
      await sendEmail(user.email, 'Welcome to Rudra Real Estate! 🏠', emailHtml);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError.message);
    }

    if (phone) {
      try {
        await sendWelcomeSMS(user.name, user.phone);
        console.log('📱 Welcome SMS sent to:', user.phone);
      } catch (smsError) {
        console.error('⚠️ Failed to send welcome SMS:', smsError.message);
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword, token });

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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', { email: user.email, role: user.role, status: user.status });

    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Your account is pending admin approval. You will receive an email once verified.' });
    }
    if (user.status === 'REJECTED') {
      return res.status(403).json({ error: 'Your account registration was rejected. Please contact support.' });
    }
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Password valid, creating token');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword, token });

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
        id: true, name: true, email: true, phone: true,
        address: true, city: true, state: true,
        role: true, status: true, isVerified: true,
        professionalDetails: true, createdAt: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ============= LEGACY SUPPORT =============
const registerUser = async (req, res) => {
  return register(req, res);
};

// ============= OTP FUNCTIONS =============
const { generateOTP, storeOTP, verifyOTP } = require('../services/otpService');

const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    const otp = generateOTP();
    storeOTP(phone, otp);
    console.log(`📱 OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOTPController = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
    const result = verifyOTP(phone, otp);
    if (!result.success) return res.status(400).json({ error: result.message });
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
        name:    name    || undefined,
        phone:   phone   || undefined,
        address: address || undefined,
        city:    city    || undefined,
        state:   state   || undefined
      },
      select: { id: true, name: true, email: true, phone: true, address: true, city: true, state: true, role: true, status: true }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// ============= ✅ FORGOT PASSWORD =============
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });

    // Security: user na hoy to pan same response aapo
    if (!user) {
      return res.json({ message: 'If this email exists, a reset link has been sent.' });
    }

    // Random token generate karo
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Token DB ma save karo (professionalDetails JSON field ma)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        professionalDetails: {
          ...(typeof user.professionalDetails === 'object' && user.professionalDetails !== null
            ? user.professionalDetails : {}),
          resetToken:     token,
          resetExpiresAt: expiresAt.toISOString(),
        }
      }
    });

    // Reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Email send karo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // ✅ .env ma EMAIL_PASSWORD che
      }
    });

    await transporter.sendMail({
      from:    `"Rudra Real Estate" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Password Reset — Rudra Real Estate',
      html: `
        <div style="font-family:'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FAF5EE;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="font-family:Georgia,serif;color:#1A0800;margin:0;">Rudra Real Estate</h2>
            <p style="color:#7A5C48;font-size:13px;margin:4px 0 0;">Vadodara, Gujarat</p>
          </div>
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #EDE5D8;">
            <h3 style="color:#1A0800;margin:0 0 12px;font-family:Georgia,serif;">Password Reset Request</h3>
            <p style="color:#7A5C48;font-size:14px;line-height:1.6;margin:0 0 20px;">
              Hello <strong>${user.name}</strong>,<br/>
              Tamara account mate password reset link niche che. Aa link <strong>1 hour</strong> mate valid che.
            </p>
            <a href="${resetUrl}"
              style="display:block;text-align:center;background:#C84B00;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px;">
              Reset My Password
            </a>
            <p style="color:#9C8B7A;font-size:12px;margin:0;text-align:center;line-height:1.5;">
              Jao tame aa request nathi karyo, to aa email ignore karo.<br/>
              Tamaro password change nahi thase.
            </p>
          </div>
          <p style="text-align:center;color:#9C8B7A;font-size:11px;margin-top:20px;">
            © Rudra Real Estate · Vadodara, Gujarat
          </p>
        </div>
      `
    });

    console.log('✅ Password reset email sent to:', email);
    res.json({ message: 'If this email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// ============= ✅ RESET PASSWORD =============
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword)
      return res.status(400).json({ error: 'Token, email and new password required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const pd = (typeof user.professionalDetails === 'object' && user.professionalDetails !== null)
      ? user.professionalDetails : {};

    if (!pd.resetToken || pd.resetToken !== token)
      return res.status(400).json({ error: 'Invalid reset token' });

    if (!pd.resetExpiresAt || new Date(pd.resetExpiresAt) < new Date())
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Reset token clear karo + password update karo
    const { resetToken, resetExpiresAt, ...restPd } = pd;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        professionalDetails: Object.keys(restPd).length > 0 ? restPd : null,
      }
    });

    console.log('✅ Password reset successful for:', email);
    res.json({ message: 'Password reset successful! Please sign in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ============= EXPORTS =============
module.exports = {
  register,
  login,
  getProfile,
  registerUser,
  sendOTP,
  verifyOTP: verifyOTPController,
  updateProfile,
  changePassword,
  forgotPassword, 
  resetPassword,   
};
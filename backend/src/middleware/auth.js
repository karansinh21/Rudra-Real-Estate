const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Main authentication function - works for both Broker and User
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in Broker table first
    let user = await prisma.broker.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true
      }
    });

    // If not found in Broker table, try User table
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true  // ✅ Add status field
        }
      });
    }

    // If still not found in either table
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }

    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Alias for authenticate (for backward compatibility)
const verifyToken = authenticate;
const protect = authenticate;  // ✅ ADD THIS LINE

// Check if user is a broker
const isBroker = (req, res, next) => {
  if (req.user.role !== 'BROKER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied. Broker or Admin role required.' 
    });
  }
  next();
};

// Check if user is a lawyer
const isLawyer = (req, res, next) => {
  if (req.user.role !== 'LAWYER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied. Lawyer or Admin role required.' 
    });
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.' 
    });
  }
  next();
};

module.exports = {
  authenticate,
  verifyToken,
  protect,        // ✅ ADD THIS
  isBroker,
  isLawyer,
  isAdmin
};
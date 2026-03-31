const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Main authentication function
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX: prisma.broker → prisma.user (schema માં માત્ર User model છે)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:         true,
        name:       true,
        email:      true,
        phone:      true,
        role:       true,
        status:     true,
        isVerified: true,
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    // ✅ Blocked or Pending user ને access ন deny
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Your account has been blocked.' });
    }

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

// Aliases
const verifyToken = authenticate;
const protect     = authenticate;

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
  protect,
  isBroker,
  isLawyer,
  isAdmin
};
const passport = require('passport');
const AppleStrategy = require('passport-apple');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const prisma = new PrismaClient();

// Check if Apple Sign-In is configured
const APPLE_AUTH_ENABLED = 
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY_PATH &&
  process.env.APPLE_CALLBACK_URL;

let privateKeyString = null;

// Only load private key if Apple auth is enabled
if (APPLE_AUTH_ENABLED) {
  try {
    const keyPath = process.env.APPLE_PRIVATE_KEY_PATH;
    if (fs.existsSync(keyPath)) {
      privateKeyString = fs.readFileSync(keyPath, 'utf8');
      console.log('✅ Apple Sign-In: Private key loaded successfully');
    } else {
      console.warn(`⚠️  Apple Sign-In: Private key file not found at ${keyPath}`);
    }
  } catch (error) {
    console.error('⚠️  Apple Sign-In: Error loading private key:', error.message);
  }
}

// Configure Apple Strategy only if enabled and key is loaded
if (APPLE_AUTH_ENABLED && privateKeyString) {
  passport.use(new AppleStrategy({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: privateKeyString,
      callbackURL: process.env.APPLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const email = profile.email;
        
        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.name?.firstName + ' ' + profile.name?.lastName || 'Apple User',
              email: email,
              password: '',
              role: 'PUBLIC',
              isApproved: true,
              appleId: profile.sub
            }
          });
        } else if (!user.appleId) {
          user = await prisma.user.update({
            where: { email },
            data: { appleId: profile.sub }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
  console.log('✅ Apple Sign-In: Strategy configured successfully');
} else {
  console.warn('⚠️  Apple Sign-In: Disabled (missing configuration or private key)');
}

// Middleware to check if Apple auth is available
const checkAppleAuthEnabled = (req, res, next) => {
  if (!APPLE_AUTH_ENABLED || !privateKeyString) {
    return res.status(503).json({
      success: false,
      message: 'Apple Sign-In is not configured on this server'
    });
  }
  next();
};

const appleAuth = [
  checkAppleAuthEnabled,
  passport.authenticate('apple')
];

const appleCallback = async (req, res) => {
  // Check if Apple auth is enabled
  if (!APPLE_AUTH_ENABLED || !privateKeyString) {
    return res.status(503).send(`
      <script>
        window.opener.postMessage({
          type: 'APPLE_AUTH_ERROR',
          message: 'Apple Sign-In is not configured'
        }, '${process.env.FRONTEND_URL || '*'}');
        window.close();
      </script>
    `);
  }

  try {
    const user = req.user;

    if (!user) {
      throw new Error('No user data received');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.send(`
      <script>
        window.opener.postMessage({
          type: 'APPLE_AUTH_SUCCESS',
          token: '${token}',
          user: ${JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          })}
        }, '${process.env.FRONTEND_URL || '*'}');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Apple auth callback error:', error);
    res.send(`
      <script>
        window.opener.postMessage({
          type: 'APPLE_AUTH_ERROR',
          message: 'Authentication failed'
        }, '${process.env.FRONTEND_URL || '*'}');
        window.close();
      </script>
    `);
  }
};

module.exports = { appleAuth, appleCallback };
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value }
      });

      // If user doesn't exist, create new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails[0].value,
            password: '', // No password for OAuth users
            role: 'PUBLIC',
            isApproved: true,
            googleId: profile.id,
            avatar: profile.photos[0]?.value
          }
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { email: profile.emails[0].value },
          data: { googleId: profile.id }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Google Auth Route
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google Callback Route
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success message to parent window
    res.send(`
      <script>
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          token: '${token}',
          user: ${JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          })}
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `);
  } catch (error) {
    res.send(`
      <script>
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          message: 'Authentication failed'
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `);
  }
};

module.exports = { googleAuth, googleCallback };
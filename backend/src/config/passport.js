const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

module.exports = (passport) => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google Strategy - Only configure if credentials exist
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists by googleId or email
            let user = await prisma.user.findFirst({
              where: {
                OR: [
                  { googleId: profile.id },
                  { email: profile.emails[0].value }
                ]
              }
            });

            if (!user) {
              // Create new user
              user = await prisma.user.create({
                data: {
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  googleId: profile.id,
                  avatar: profile.photos[0]?.value,
                  role: 'PUBLIC',
                  status: 'ACTIVE',
                  isVerified: true,
                  password: 'OAUTH_USER' // Placeholder for OAuth users
                }
              });
            } else if (!user.googleId) {
              // Link Google account to existing user
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id }
              });
            }

            return done(null, user);
          } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth: Strategy configured');
  } else {
    console.warn('⚠️  Google OAuth: Missing credentials (disabled)');
  }

  // Apple Strategy - Only configure if all credentials exist
  const APPLE_AUTH_ENABLED = 
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    (process.env.APPLE_PRIVATE_KEY || process.env.APPLE_PRIVATE_KEY_PATH);

  if (APPLE_AUTH_ENABLED) {
    try {
      let privateKeyString;

      // Try to get private key from string first, then from file
      if (process.env.APPLE_PRIVATE_KEY) {
        privateKeyString = process.env.APPLE_PRIVATE_KEY;
      } else if (process.env.APPLE_PRIVATE_KEY_PATH && fs.existsSync(process.env.APPLE_PRIVATE_KEY_PATH)) {
        privateKeyString = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8');
      }

      if (privateKeyString) {
        passport.use(
          new AppleStrategy(
            {
              clientID: process.env.APPLE_CLIENT_ID,
              teamID: process.env.APPLE_TEAM_ID,
              keyID: process.env.APPLE_KEY_ID,
              privateKeyString: privateKeyString,
              callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback'
            },
            async (accessToken, refreshToken, idToken, profile, done) => {
              try {
                // Check if user exists by appleId or email
                let user = await prisma.user.findFirst({
                  where: {
                    OR: [
                      { appleId: profile.id },
                      { email: profile.email }
                    ]
                  }
                });

                if (!user) {
                  // Create new user
                  user = await prisma.user.create({
                    data: {
                      name: profile.name?.firstName 
                        ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
                        : 'Apple User',
                      email: profile.email,
                      appleId: profile.id,
                      role: 'PUBLIC',
                      status: 'ACTIVE',
                      isVerified: true,
                      password: 'OAUTH_USER'
                    }
                  });
                } else if (!user.appleId) {
                  // Link Apple account to existing user
                  user = await prisma.user.update({
                    where: { id: user.id },
                    data: { appleId: profile.id }
                  });
                }

                return done(null, user);
              } catch (error) {
                console.error('Apple OAuth error:', error);
                return done(error, null);
              }
            }
          )
        );
        console.log('✅ Apple OAuth: Strategy configured');
      } else {
        console.warn('⚠️  Apple OAuth: Private key not found (disabled)');
      }
    } catch (error) {
      console.warn('⚠️  Apple OAuth: Configuration error -', error.message);
    }
  } else {
    console.warn('⚠️  Apple OAuth: Missing credentials (disabled)');
  }
};
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Configure Passport to use Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google strategy callback received profile:', {
    id: profile.id,
    displayName: profile.displayName,
    emails: profile.emails ? profile.emails.map(e => e.value) : 'No emails'
  });
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    console.log('User exists in DB:', !!user);

    if (!user) {
      // Create new user if doesn't exist
      console.log('Creating new user');
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: Math.random().toString(36).slice(-8), // Generate random password
        isVerified: true, // Google users are automatically verified
        googleId: profile.id,
        mobile: '01000000000' // Placeholder mobile number, will require update from user
      });
      console.log('New user created with ID:', user._id);
    } else if (!user.googleId) {
      // Update existing user with Google ID
      console.log('Updating existing user with Google ID');
      user.googleId = profile.id;
      user.isVerified = true;
      await user.save();
      console.log('Existing user updated with Google ID');
    }

    return done(null, user);
  } catch (error) {
    console.error('Error in Google strategy:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// @desc    Google OAuth login
// @route   GET /api/auth/google/login
// @access  Public
export const googleLogin = (req, res, next) => {
  const authType = 'login';
  req.session = req.session || {};
  req.session.authType = authType;
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: authType
  })(req, res, next);
};

// @desc    Google OAuth signup
// @route   GET /api/auth/google/signup
// @access  Public
export const googleSignup = (req, res, next) => {
  const authType = 'signup';
  req.session = req.session || {};
  req.session.authType = authType;
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: authType
  })(req, res, next);
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res, next) => {
  const authType = req.query.state || 'login';
  console.log('Google callback received with state:', authType);
  console.log('Query params:', req.query);
  
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Passport authenticate error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed&reason=server_error`);
    }
    
    if (!user) {
      console.error('No user received from Google authentication:', info);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed&reason=no_user`);
    }

    console.log('User authenticated successfully:', user._id);

    try {
      // Generate JWT tokens
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      );

      // Save refresh token to user document
      user.refreshToken = refreshToken;
      user.save();

      // Set cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with tokens
      const redirectPath = '/';
      console.log('Redirecting to:', `${process.env.CLIENT_URL}${redirectPath}?accessToken=${accessToken}`);
      
      return res.redirect(
        `${process.env.CLIENT_URL}${redirectPath}?accessToken=${accessToken}`
      );
    } catch (error) {
      console.error('JWT Token generation error:', error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed&reason=token_error`);
    }
  })(req, res, next);
}; 
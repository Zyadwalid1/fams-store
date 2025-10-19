import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import productCategoryRoutes from './routes/productCategoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import reelRoutes from './routes/reelRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Allow cookies with CORS
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie parser

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

console.log('Passport initialized with session support');
console.log('Google OAuth configuration:', {
  clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  sessionSecret: process.env.SESSION_SECRET ? 'Set' : 'Not set'
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reels', reelRoutes);
// Commented out to prevent route conflicts - using /api/users/addresses instead
 app.use('/api/addresses', addressRoutes);

// Error Handler
app.use(errorHandler);

export default app;

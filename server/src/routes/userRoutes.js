import express from 'express';
import {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses
} from '../controllers/userController.js';
import { 
  getLoginHistory,
  clearLoginHistory 
} from '../controllers/loginHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);

// Address management routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Login history routes
router.get('/login-history', protect, getLoginHistory);
router.delete('/login-history', protect, clearLoginHistory);

export default router;

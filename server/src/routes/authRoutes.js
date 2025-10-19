import express from 'express';
import { googleLogin, googleSignup, googleCallback } from '../controllers/authController.js';

const router = express.Router();

// Google OAuth routes
router.get('/google/login', googleLogin);
router.get('/google/signup', googleSignup);
router.get('/google/callback', googleCallback);

export default router; 
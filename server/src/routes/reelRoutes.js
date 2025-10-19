import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createReel,
  getReels,
  getReel,
  updateReel,
  deleteReel,
  toggleLike,
  uploadReelMedia
} from '../controllers/reelController.js';
import { uploadReelVideo, uploadReelThumbnail } from '../config/cloudinaryConfig.js';

const router = express.Router();

// Public routes
router.get('/', getReels);
router.get('/:id', getReel);

// Protected routes (require authentication)
router.use(protect);
router.post('/like/:id', toggleLike);

// Admin only routes
router.use(admin);
router.post('/', createReel);
router.patch('/:id', updateReel);
router.delete('/:id', deleteReel);

// Upload endpoints
router.post('/upload/video', uploadReelVideo, uploadReelMedia);
router.post('/upload/thumbnail', uploadReelThumbnail, uploadReelMedia);

export default router; 
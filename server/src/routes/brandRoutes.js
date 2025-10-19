import express from 'express';
import {
  createBrand,
  getBrands,
  getGroupedBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/grouped', getGroupedBrands);
router.get('/:id', getBrandById);

// Admin routes
router.post('/', protect, admin, createBrand);
router.put('/:id', protect, admin, updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

export default router; 
import express from 'express';
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all address routes
router.use(protect);

// Address management routes - use the same controller functions from userController
router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router; 
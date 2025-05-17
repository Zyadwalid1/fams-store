import express from 'express';
import { 
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  toggleWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all wishlist routes
router.use(protect);

// Wishlist routes
router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/toggle')
  .post(toggleWishlist);

router.route('/check/:productId')
  .get(checkWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

export default router; 
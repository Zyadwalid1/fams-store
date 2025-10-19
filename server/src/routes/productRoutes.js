import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getRelatedProducts,
  uploadProductImage,
  getProductReviews
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadProductPhotos, uploadSingleProductImage } from '../config/cloudinaryConfig.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);

// Admin routes - Product CRUD
router.post('/', protect, admin, (req, res, next) => {
  console.log('Create product route accessed');
  console.log('User authenticated:', req.user);
  next();
}, createProduct);
router.put('/:id', protect, admin, uploadProductPhotos, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Image upload route
router.post('/upload', protect, admin, uploadSingleProductImage, uploadProductImage);

// Review routes
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews/:reviewId', protect, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);
router.post('/:id/reviews/:reviewId/helpful', protect, markReviewHelpful);

export default router;

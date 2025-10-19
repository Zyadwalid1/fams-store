import express from 'express';
import { 
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderByNumber
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all order routes
router.use(protect);

// User routes
router.route('/')
  .post(createOrder)
  .get(getUserOrders);

// Order number route (specific route before wildcard)
router.route('/number/:orderNumber')
  .get(getOrderByNumber);

// Admin only routes (specific route before wildcard)
router.route('/admin')
  .get(admin, getOrders);

// Routes with ID parameter (wildcard routes after specific routes)
router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/status')
  .put(admin, updateOrderStatus);

export default router; 
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { ErrorResponse } from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// Utility function to generate a unique order number
const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * (999 - 100 + 1) + 100);
  return `ORD-${timestamp}${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { 
    shippingAddress, 
    paymentMethod, 
    shippingFee, 
    estimatedDeliveryTime,
    deliveryRegion,
    notes 
  } = req.body;

  const userId = req.user.id;

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
      !shippingAddress.email || !shippingAddress.phone || !shippingAddress.address || 
      !shippingAddress.city || !shippingAddress.governorate) {
    return next(new ErrorResponse('Complete shipping information is required', 400));
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price photos discount stock'
  });

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  // Verify stock for all items and prepare order items
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    
    // Verify product has sufficient stock
    if (product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
    }
    
    // Calculate discounted price
    const discountedPrice = product.discount > 0 
      ? parseFloat((product.price * (1 - product.discount / 100)).toFixed(2))
      : product.price;
    
    // Add to order items
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      discountedPrice,
      quantity: item.quantity,
      image: product.photos && product.photos.length > 0 ? product.photos[0].secure_url : ''
    });
    
    // Add to total
    itemsTotal += discountedPrice * item.quantity;
  }
  
  // Format to 2 decimal places
  itemsTotal = parseFloat(itemsTotal.toFixed(2));
  const totalAmount = parseFloat((itemsTotal + shippingFee).toFixed(2));

  // Generate unique order number
  const orderNumber = generateOrderNumber();

  // Create the order
  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD', // Default to Cash on Delivery
    shippingFee,
    itemsTotal,
    totalAmount,
    orderNumber,
    estimatedDeliveryTime,
    deliveryRegion,
    notes
  });

  // Update product stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear the user's cart
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } }
  );
  
  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail(order);
    console.log(`Order confirmation email sent for order #${order.orderNumber}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't stop the order process if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber
    }
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filter by status if provided
  const filter = {};
  if (req.query.status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  
  // Ensure ID is valid MongoDB ObjectID
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new ErrorResponse('Invalid order ID', 400));
  }

  const order = await Order.findById(orderId);
  
  // Check if order exists
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // If not admin, ensure user only accesses their own orders
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const orderId = req.params.id;
  
  // Validate status
  if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }

  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Update status
  order.status = status;
  
  // Set timestamps for specific statuses
  if (status === 'delivered') {
    order.deliveredAt = new Date();
  } else if (status === 'cancelled') {
    order.cancelledAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Cancel an order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  // Find order
  const order = await Order.findById(orderId);

  // Check if order exists
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Ensure user only cancels their own orders
  if (order.user.toString() !== userId) {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Verify order is in a state that can be cancelled
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new ErrorResponse('This order cannot be cancelled', 400));
  }

  // Update order status
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();

  // Restore product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
export const getOrderByNumber = asyncHandler(async (req, res, next) => {
  const { orderNumber } = req.params;
  
  const order = await Order.findOne({ orderNumber });
  
  // Check if order exists
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // If not admin, ensure user only accesses their own orders
  if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
}); 
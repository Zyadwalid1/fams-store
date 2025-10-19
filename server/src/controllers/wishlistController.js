import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { ErrorResponse } from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find user and populate wishlist
  const user = await User.findById(userId)
    .populate({
      path: 'wishlist',
      select: 'name price photos discount stock rating'
    });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Format the response
  const wishlistItems = user.wishlist.map(product => {
    const discountedPrice = product.discount > 0 
      ? parseFloat((product.price * (1 - product.discount / 100)).toFixed(2))
      : product.price;
    
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      discountedPrice,
      discount: product.discount,
      image: product.photos && product.photos.length > 0 ? product.photos[0].secure_url : null,
      rating: product.rating ? product.rating.average : 0,
      stock: product.stock
    };
  });

  res.status(200).json({
    success: true,
    count: wishlistItems.length,
    data: wishlistItems
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorResponse('Product ID is required', 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if product is already in wishlist
  if (user.wishlist.includes(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      isInWishlist: true
    });
  }

  // Add product to wishlist
  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    isInWishlist: true
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Remove product from wishlist
  user.wishlist = user.wishlist.filter(
    id => id.toString() !== productId
  );
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    isInWishlist: false
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if product is in wishlist
  const isInWishlist = user.wishlist.some(
    id => id.toString() === productId
  );

  res.status(200).json({
    success: true,
    isInWishlist
  });
});

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorResponse('Product ID is required', 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if product is already in wishlist
  const productIndex = user.wishlist.findIndex(
    id => id.toString() === productId
  );

  let isInWishlist = false;
  let message = '';

  if (productIndex === -1) {
    // Add product to wishlist
    user.wishlist.push(productId);
    isInWishlist = true;
    message = 'Product added to wishlist';
  } else {
    // Remove product from wishlist
    user.wishlist.splice(productIndex, 1);
    isInWishlist = false;
    message = 'Product removed from wishlist';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message,
    isInWishlist
  });
}); 
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { ErrorResponse } from '../utils/errorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  let cart = await Cart.findOne({ user: userId })
                       .populate({
                         path: 'items.product',
                         select: 'name price photos discount stock'
                       });

  if (!cart) {
    // If no cart exists, create a new empty cart
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  // Format the response
  const formattedCart = {
    items: cart.items.map(item => {
      const product = item.product;
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
        quantity: item.quantity,
        stock: product.stock,
        subtotal: parseFloat((discountedPrice * item.quantity).toFixed(2))
      };
    }),
    totalItems: cart.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: cart.calculateTotal()
  };

  res.status(200).json({
    success: true,
    data: formattedCart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  console.log(`Add to cart request: userId=${userId}, productId=${productId}, quantity=${quantity}`);

  if (!productId) {
    console.error('Product ID missing in cart add request');
    return next(new ErrorResponse('Product ID is required', 400));
  }

  // Validate that productId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error(`Invalid product ID format: ${productId}`);
    return next(new ErrorResponse('Invalid product ID format', 400));
  }

  // Validate product existence and stock
  const product = await Product.findById(productId);
  if (!product) {
    console.error(`Product not found: ${productId}`);
    return next(new ErrorResponse('Product not found', 404));
  }

  console.log(`Found product: ${product.name}, stock: ${product.stock}`);

  if (product.stock < quantity) {
    console.error(`Insufficient stock for product ${productId}: requested=${quantity}, available=${product.stock}`);
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  // Find user's cart or create a new one
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    console.log(`Creating new cart for user ${userId}`);
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  // Check if product already exists in cart
  const itemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Update quantity if product exists
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    
    // Check stock for updated quantity
    if (product.stock < newQuantity) {
      console.error(`Insufficient stock for updated quantity: requested=${newQuantity}, available=${product.stock}`);
      return next(new ErrorResponse('Insufficient stock for requested quantity', 400));
    }
    
    console.log(`Updating quantity for existing product: ${quantity} + ${cart.items[itemIndex].quantity} = ${newQuantity}`);
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Add new product to cart
    console.log(`Adding new product to cart: ${productId}, quantity: ${quantity}`);
    cart.items.push({
      product: productId,
      quantity
    });
  }

  // Update cart's lastUpdated field
  cart.updatedAt = Date.now();
  await cart.save();

  // Fetch the updated cart with populated product details
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price photos discount stock'
  });

  console.log(`Cart updated successfully for user ${userId}`);

  // Format the response
  const formattedCart = {
    items: cart.items.map(item => {
      const product = item.product;
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
        quantity: item.quantity,
        stock: product.stock,
        subtotal: parseFloat((discountedPrice * item.quantity).toFixed(2))
      };
    }),
    totalItems: cart.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: cart.calculateTotal()
  };

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: formattedCart
  });
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorResponse('Quantity must be at least 1', 400));
  }

  // Validate product existence and stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Find the product in the cart
  const itemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  cart.updatedAt = Date.now();
  await cart.save();

  // Fetch the updated cart with populated product details
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price photos discount stock'
  });

  // Format the response
  const formattedCart = {
    items: updatedCart.items.map(item => {
      const product = item.product;
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
        quantity: item.quantity,
        stock: product.stock,
        subtotal: parseFloat((discountedPrice * item.quantity).toFixed(2))
      };
    }),
    totalItems: updatedCart.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: updatedCart.calculateTotal()
  };

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    data: formattedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Remove the item from cart
  cart.items = cart.items.filter(item => 
    item.product.toString() !== productId
  );

  cart.updatedAt = Date.now();
  await cart.save();

  // Fetch the updated cart with populated product details
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price photos discount stock'
  });

  // Format the response
  const formattedCart = {
    items: updatedCart.items.map(item => {
      const product = item.product;
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
        quantity: item.quantity,
        stock: product.stock,
        subtotal: parseFloat((discountedPrice * item.quantity).toFixed(2))
      };
    }),
    totalItems: updatedCart.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: updatedCart.calculateTotal()
  };

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: formattedCart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Clear all items
  cart.items = [];
  cart.updatedAt = Date.now();
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      items: [],
      totalItems: 0,
      totalAmount: 0
    }
  });
}); 
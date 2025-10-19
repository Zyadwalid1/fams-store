import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import ProductCategory from '../models/ProductCategory.js';
import asyncHandler from '../middleware/asyncHandler.js';
import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinaryConfig.js';
import { uploadProductPhotos } from '../config/cloudinaryConfig.js';

// @desc    Upload product images to Cloudinary
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadProductImage = asyncHandler(async (req, res) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      file: req.file ? {
        path: req.file.path,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file',
      headers: {
        contentType: req.headers['content-type'],
        authorization: req.headers['authorization'] ? 'Authorization header present' : 'No auth header'
      },
      user: req.user ? `User ID: ${req.user._id}` : 'No authenticated user'
    });
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // The file should now be available in req.file due to the uploadSingleProductImage middleware
    console.log('File uploaded to Cloudinary:', req.file);
    
    // Create a comprehensive result object with multiple possible properties for client compatibility
    const result = {
      url: req.file.path,
      secure_url: req.file.path, // Same as path but for secure_url format compatibility
      path: req.file.path,
      public_id: req.file.filename,
      filename: req.file.filename
    };

    console.log('Uploaded image result to send back:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading image:', error);
    // Check for specific Cloudinary errors or other upload errors
    if (error.http_code) {
      console.error('Cloudinary error details:', {
        http_code: error.http_code,
        name: error.name,
        message: error.message,
      });
    }
    res.status(500).json({ 
      message: 'Image upload failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    console.log('CREATE PRODUCT REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    const { 
      name, 
      price, 
      category,
      type,
      subtype,
      brand,
      stock,
      discount,
      images,
      description,
      shortDescription,
      specifications,
      rating,
      featured,
      bestseller,
      newArrival,
      tags,
      slug,
      photos
    } = req.body;

    console.log('EXTRACTED FIELDS:', { 
      name, price, category, type, subtype, brand, 
      stock, discount, images: Array.isArray(images) ? images.length : 'not an array', 
      description: description ? 'present' : 'missing',
      tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : 'missing',
      slug: slug || 'not provided'
    });

    // Generate a slug if one is not provided
    let productSlug = slug;
    if (!productSlug && name) {
      productSlug = name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w-]+/g, '')
        .replace(/-+/g, '-');
      
      // Check if the generated slug already exists
      const existingProduct = await Product.findOne({ slug: productSlug });
      if (existingProduct) {
        // Add a random string to make it unique
        productSlug = `${productSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }
      
      console.log('Generated slug:', productSlug);
    }

    // Handle photos
    let processedPhotos = [];
    if (Array.isArray(photos) && photos.length > 0) {
      // Photos already in correct format
      processedPhotos = photos;
    } else if (Array.isArray(images) && images.length > 0) {
      // Transform image URLs to Cloudinary photos format if available
      console.log('Processing images:', images);
      processedPhotos = images.map(imageUrl => {
        try {
          // Extract public_id from Cloudinary URL
          // URLs can be in different formats:
          // 1. https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public_id.jpg
          // 2. https://res.cloudinary.com/cloud-name/image/upload/folder/public_id.jpg
          
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          
          // Find the part after 'upload' which should contain the public_id
          let publicIdWithPath = '';
          let uploadIndex = pathParts.findIndex(part => part === 'upload');
          
          if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
            // Check if the next part is a version (v1234567890)
            if (pathParts[uploadIndex + 1].startsWith('v') && /^v\d+$/.test(pathParts[uploadIndex + 1])) {
              // Skip the version part
              publicIdWithPath = pathParts.slice(uploadIndex + 2).join('/');
            } else {
              publicIdWithPath = pathParts.slice(uploadIndex + 1).join('/');
            }
          }
          
          // Remove file extension if present
          const publicId = publicIdWithPath.replace(/\.[^/.]+$/, '');
          
          console.log('Processed image:', { publicId, imageUrl });
          return {
            public_id: publicId,
            secure_url: imageUrl
          };
        } catch (error) {
          console.error('Error parsing image URL:', imageUrl, error);
          // Fallback to simple parsing
          const urlParts = imageUrl.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          const publicId = lastPart.split('.')[0];
          
          return {
            public_id: publicId,
            secure_url: imageUrl
          };
        }
      });
    }

    console.log('Prepared photos array:', processedPhotos);
    
    const productData = {
      name,
      slug: productSlug,
      price: parseFloat(price),
      category,
      type,
      subtype,
      brand,
      stock: parseInt(stock),
      discount: parseFloat(discount || 0),
      photos: processedPhotos,
      description,
      shortDescription,
      specifications: specifications || {},
      rating: rating ? { average: rating, count: 0 } : { average: 0, count: 0 },
      featured: featured || false,
      bestseller: bestseller || false,
      newArrival: newArrival || true,
      tags: tags || []
    };
    
    console.log('ATTEMPTING TO CREATE PRODUCT WITH DATA:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);
    console.log('PRODUCT CREATED SUCCESSFULLY:', product._id);

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      for (const field in error.errors) {
        console.error(`Field ${field}: ${error.errors[field].message}`);
      }
    }
    
    // Check if it's a mongoose error with error code (like duplicate key)
    if (error.code) {
      console.error(`MongoDB error code: ${error.code}`);
    }
    
    res.status(400).json({ 
      message: 'Invalid product data', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
});

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    type,
    subtype,
    brand,
    featured,
    bestseller,
    newArrival,
    minPrice,
    maxPrice,
    inStock,
    search,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  const filter = {};

  // Add filters if they exist - with error handling for each ID
  if (category) {
    try {
      filter.category = new mongoose.Types.ObjectId(category);
    } catch (error) {
      console.error('Invalid category ID:', category, error.message);
      return res.status(400).json({ message: 'Invalid category ID format' });
    }
  }
  
  if (type) {
    try {
      filter.type = new mongoose.Types.ObjectId(type);
    } catch (error) {
      console.error('Invalid type ID:', type, error.message);
      return res.status(400).json({ message: 'Invalid type ID format' });
    }
  }
  
  if (subtype) {
    try {
      filter.subtype = new mongoose.Types.ObjectId(subtype);
    } catch (error) {
      console.error('Invalid subtype ID:', subtype, error.message);
      return res.status(400).json({ message: 'Invalid subtype ID format' });
    }
  }
  
  if (brand) {
    try {
      // Check if the brand parameter is requesting fuzzy matching
      if (brand.startsWith('fuzzy:')) {
        const brandName = brand.substring(6).trim(); // Remove 'fuzzy:' prefix
        console.log('Using fuzzy brand matching for:', brandName);
        
        // Use regex for approximate matching
        // This will match if the brand name contains the search term or vice versa
        // The 'i' flag makes it case-insensitive
        filter.brand = { $regex: brandName, $options: 'i' };
      } 
      // Check if brand is a valid ObjectId (for backward compatibility)
      else if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = new mongoose.Types.ObjectId(brand);
      } 
      // Otherwise use exact string matching
      else {
        filter.brand = brand;
      }
    } catch (error) {
      console.error('Invalid brand format:', brand, error.message);
      return res.status(400).json({ message: 'Invalid brand format' });
    }
  }
  
  if (featured) filter.featured = featured === 'true';
  if (bestseller) filter.bestseller = bestseller === 'true';
  if (newArrival) filter.newArrival = newArrival === 'true';

  // Handle stock filter
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (inStock === 'false') filter.stock = 0;

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle sorting
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'name_asc':
        sortOption = { name: 1 };
        break;
      case 'name_desc':
        sortOption = { name: -1 };
        break;
      case 'rating_desc':
        sortOption = { 'rating.average': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'rating.count': -1 };
        break;
      default:
        break;
    }
  }

  // Calculate pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  console.log('Product filter:', filter);

  // Execute query
  const totalCount = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .populate({
      path: 'brand',
      select: 'name logo category',
      match: { _id: { $exists: true } }
    })
    .populate('category', 'name')
    .populate('type', 'name')
    .populate('subtype', 'name');

  // Convert string brand values to objects for consistent frontend handling
  products.forEach(product => {
    if (product.brand && typeof product.brand === 'string') {
      product._doc.brand = { name: product.brand };
    }
  });

  console.log(`Found ${products.length} products`);

  // Return result with pagination metadata
  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(totalCount / limitNum),
    total: totalCount,
    limit: limitNum
  });
});

// @desc    Get a product by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  console.log(`Getting product by ID: ${req.params.id}`);
  
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'brand',
      select: 'name logo category description',
      // Only populate if brand is an ObjectId (reference)
      match: { _id: { $exists: true } }
    })
    .populate('category', 'name description')
    .populate('type', 'name description')
    .populate('subtype', 'name description')
    .populate({
      path: 'reviews.user',
      select: 'name avatar'
    });

  if (product) {
    // If brand is a string, make sure it's available in the response
    if (product.brand && typeof product.brand === 'string') {
      // If brand wasn't populated (it's a string), create a compatible object structure
      product._doc.brand = { name: product.brand };
    }
    
    console.log('Found product with the following details:');
    console.log(`- Category: ${product.category ? (typeof product.category === 'object' ? product.category.name : product.category) : 'none'}`);
    console.log(`- Type: ${product.type ? (typeof product.type === 'object' ? product.type.name : product.type) : 'none'}`);
    console.log(`- Subtype: ${product.subtype ? (typeof product.subtype === 'object' ? product.subtype.name : product.subtype) : 'none'}`);
    console.log(`- Brand: ${product.brand ? (typeof product.brand === 'object' ? product.brand.name : product.brand) : 'none'}`);
    
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('UPDATE PRODUCT REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    const { 
      name, 
      price, 
      category,
      type,
      subtype,
      brand,
      stock,
      discount,
      images,
      description,
      shortDescription,
      specifications,
      rating,
      featured,
      bestseller,
      newArrival,
      tags,
      slug,
      removedImageUrls,
      photos
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Generate or keep slug
    let productSlug = slug;
    if ((!productSlug || productSlug.trim() === '') && name && name !== product.name) {
      productSlug = name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w-]+/g, '')
        .replace(/-+/g, '-');
      
      // Check if the generated slug already exists
      const existingProduct = await Product.findOne({ slug: productSlug, _id: { $ne: product._id } });
      if (existingProduct) {
        // Add a random string to make it unique
        productSlug = `${productSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }
      
      console.log('Generated slug for update:', productSlug);
    }
    
    // Handle uploaded images if any
    let newPhotos = [];
    
    // Process images or photos array
    if (Array.isArray(photos) && photos.length > 0) {
      // Photos already in correct format
      newPhotos = photos;
    } else if (Array.isArray(images) && images.length > 0) {
      console.log('Processing new images:', images);
      
      newPhotos = images.map(imageUrl => {
        try {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          
          let publicIdWithPath = '';
          let uploadIndex = pathParts.findIndex(part => part === 'upload');
          
          if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
            if (pathParts[uploadIndex + 1].startsWith('v') && /^v\d+$/.test(pathParts[uploadIndex + 1])) {
              publicIdWithPath = pathParts.slice(uploadIndex + 2).join('/');
            } else {
              publicIdWithPath = pathParts.slice(uploadIndex + 1).join('/');
            }
          }
          
          const publicId = publicIdWithPath.replace(/\.[^/.]+$/, '');
          
          return {
            public_id: publicId,
            secure_url: imageUrl
          };
        } catch (error) {
          console.error('Error parsing image URL:', imageUrl, error);
          const urlParts = imageUrl.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          const publicId = lastPart.split('.')[0];
          
          return {
            public_id: publicId,
            secure_url: imageUrl
          };
        }
      });
    }
    
    // Handle removed images
    if (Array.isArray(removedImageUrls) && removedImageUrls.length > 0) {
      console.log(`Removing ${removedImageUrls.length} images from product`);
      
      // Filter out the removed images
      product.photos = product.photos.filter(photo => 
        !removedImageUrls.includes(photo.secure_url)
      );
      
      // Try to delete from Cloudinary
      try {
        for (const imageUrl of removedImageUrls) {
          const parts = imageUrl.split('/');
          const publicId = parts[parts.length - 1].split('.')[0];
          
          if (publicId) {
            await cloudinary.uploader.destroy(publicId)
              .then(result => console.log(`Deleted image ${publicId} from Cloudinary:`, result))
              .catch(err => console.error(`Failed to delete image ${publicId} from Cloudinary:`, err));
          }
        }
      } catch (cloudinaryError) {
        console.error('Error deleting images from Cloudinary:', cloudinaryError);
        // Continue with update even if Cloudinary deletion fails
      }
    }

    // Add new photos to existing ones
    if (newPhotos.length > 0) {
      console.log(`Adding ${newPhotos.length} new photos to product`);
      product.photos = [...product.photos, ...newPhotos];
    }

    // Update other fields
    product.name = name || product.name;
    product.slug = productSlug || product.slug;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.type = type || product.type;
    product.subtype = subtype || product.subtype;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.discount = discount !== undefined ? parseFloat(discount) : product.discount;
    product.description = description || product.description;
    product.shortDescription = shortDescription || product.shortDescription;
    
    if (specifications) {
      product.specifications = specifications;
    }
    
    if (rating) {
      product.rating = {
        average: parseFloat(rating),
        count: product.rating.count || 0
      };
    }
    
    product.featured = featured !== undefined ? featured : product.featured;
    product.bestseller = bestseller !== undefined ? bestseller : product.bestseller;
    product.newArrival = newArrival !== undefined ? newArrival : product.newArrival;
    
    if (tags) {
      product.tags = Array.isArray(tags) ? tags : [];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    if (product.photos && product.photos.length > 0) {
      console.log('Deleting product images from Cloudinary...');
      
      const deletePromises = product.photos.map(photo => {
        if (photo.public_id) {
          console.log('Deleting image with public_id:', photo.public_id);
          return cloudinary.uploader.destroy(photo.public_id);
        }
        return Promise.resolve();
      });
      
      const deleteResults = await Promise.all(deletePromises);
      console.log('Cloudinary delete results:', deleteResults);
    }
    
    // Delete the product
    await product.deleteOne();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed the product
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    title,
    comment,
    helpful: { count: 0, users: [] }
  };

  product.reviews.push(review);
  await product.updateRating();
  
  // Get the ID of the newly created review
  const savedProduct = await Product.findById(productId);
  const newReview = savedProduct.reviews.find(
    (r) => 
      r.user.toString() === req.user._id.toString() && 
      r.title === title && 
      r.comment === comment
  );

  res.status(201).json({ 
    message: 'Review added', 
    reviewId: newReview ? newReview._id : null 
  });
});

// @desc    Update a review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
export const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const { id, reviewId } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find the review
  const reviewIndex = product.reviews.findIndex(
    (r) => r._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if the review belongs to the user
  if (product.reviews[reviewIndex].user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  // Update review fields
  if (rating) product.reviews[reviewIndex].rating = Number(rating);
  if (title) product.reviews[reviewIndex].title = title;
  if (comment) product.reviews[reviewIndex].comment = comment;

  await product.save();
  await product.updateRating();

  res.json({ message: 'Review updated' });
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteProductReview = asyncHandler(async (req, res) => {
  const { id, reviewId } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find the review
  const review = product.reviews.find(
    (r) => r._id.toString() === reviewId
  );

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if the user is the owner or an admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  // Remove the review
  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== reviewId
  );

  await product.save();
  await product.updateRating();

  res.json({ message: 'Review removed' });
});

// @desc    Mark a review as helpful
// @route   POST /api/products/:id/reviews/:reviewId/helpful
// @access  Private
export const markReviewHelpful = asyncHandler(async (req, res) => {
  const { id, reviewId } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Find the review
  const reviewIndex = product.reviews.findIndex(
    (r) => r._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user already marked this review as helpful
  const helpfulIndex = product.reviews[reviewIndex].helpful.users.findIndex(
    (u) => u.toString() === userId.toString()
  );

  if (helpfulIndex !== -1) {
    // User already marked, so remove mark
    product.reviews[reviewIndex].helpful.users.splice(helpfulIndex, 1);
    product.reviews[reviewIndex].helpful.count -= 1;
  } else {
    // User hasn't marked, so add mark
    product.reviews[reviewIndex].helpful.users.push(userId);
    product.reviews[reviewIndex].helpful.count += 1;
  }

  await product.save();

  res.json({
    message: helpfulIndex !== -1 ? 'Removed helpful mark' : 'Marked as helpful',
    helpfulCount: product.reviews[reviewIndex].helpful.count
  });
});

// @desc    Get recommended/related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get related products (same category and type, but different ID)
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    $or: [
      { category: product.category, type: product.type },
      { brand: product.brand }
    ]
  })
    .limit(6)
    .populate('brand', 'name logo category');

  res.json(relatedProducts);
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findById(productId).populate({
    path: 'reviews.user',
    select: 'name avatar'
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product.reviews);
});

export default {
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
  getProductReviews
};

import Reel from '../models/Reel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

// Create a new reel
export const createReel = catchAsync(async (req, res) => {
  const reel = await Reel.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: reel
  });
});

// Get all reels with pagination and filtering
export const getReels = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const query = { isActive: true };
  
  // Add product filter if provided
  if (req.query.product) {
    query.product = req.query.product;
  }
  
  const [reels, total] = await Promise.all([
    Reel.find(query)
      .populate('product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reel.countDocuments(query)
  ]);
  
  res.status(200).json({
    status: 'success',
    data: reels,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Get a single reel by ID
export const getReel = catchAsync(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id)
    .populate('product', 'name price images description');
  
  if (!reel) {
    return next(new AppError('Reel not found', 404));
  }
  
  // Increment views
  reel.views += 1;
  await reel.save();
  
  res.status(200).json({
    status: 'success',
    data: reel
  });
});

// Update a reel
export const updateReel = catchAsync(async (req, res, next) => {
  const reel = await Reel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!reel) {
    return next(new AppError('Reel not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: reel
  });
});

// Delete a reel
export const deleteReel = catchAsync(async (req, res, next) => {
  const reel = await Reel.findByIdAndDelete(req.params.id);
  
  if (!reel) {
    return next(new AppError('Reel not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Like/Unlike a reel
export const toggleLike = catchAsync(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id);
  
  if (!reel) {
    return next(new AppError('Reel not found', 404));
  }
  
  const userId = req.user._id;
  const likeIndex = reel.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    // Like the reel
    reel.likes.push(userId);
  } else {
    // Unlike the reel
    reel.likes.splice(likeIndex, 1);
  }
  
  await reel.save();
  
  res.status(200).json({
    status: 'success',
    data: reel
  });
});

// Upload reel media (video or thumbnail)
export const uploadReelMedia = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Create a comprehensive result object with multiple possible properties for client compatibility
  const result = {
    url: req.file.path,
    secure_url: req.file.path,
    path: req.file.path,
    public_id: req.file.filename,
    filename: req.file.filename
  };

  res.status(200).json({
    status: 'success',
    data: result
  });
}); 
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to generate unique filenames
const generateFilename = (prefix) => {
  return (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    return `${prefix}-${originalName}-${uniqueSuffix}`;
  };
};

// Create storage engine for product photos
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fams/products', // Products folder
    format: 'auto', // Auto-detect format
    public_id: generateFilename('product'),
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

// Create storage engine for reel videos
const reelVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fams/reels/videos',
    resource_type: 'video',
    format: 'auto',
    public_id: generateFilename('reel-video'),
    allowed_formats: ['mp4', 'webm', 'mov'],
    transformation: [
      { width: 1080, height: 1920, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Create storage engine for reel thumbnails
const reelThumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fams/reels/thumbnails',
    format: 'auto',
    public_id: generateFilename('reel-thumb'),
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1080, height: 1920, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Create upload middleware for multiple product photos (up to 10)
const uploadProductPhotos = multer({ storage: productStorage }).array('photos', 10);

// Create upload middleware for single product image
const uploadSingleProductImage = multer({ storage: productStorage }).single('image');

// Create upload middleware for reel video
const uploadReelVideo = multer({
  storage: reelVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}).single('video');

// Create upload middleware for reel thumbnail
const uploadReelThumbnail = multer({
  storage: reelThumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('thumbnail');

export {
  cloudinary,
  uploadProductPhotos,
  uploadSingleProductImage,
  uploadReelVideo,
  uploadReelThumbnail
}; 
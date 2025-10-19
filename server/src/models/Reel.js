import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A reel must have a title'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot be more than 500 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'A reel must have a video URL']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'A reel must be associated with a product']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
reelSchema.index({ product: 1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ views: -1 });

// Virtual field for likes count
reelSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;

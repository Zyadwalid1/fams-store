import mongoose from 'mongoose';

// Image schema for Cloudinary images
const imageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: true
  }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    required: [true, 'Product slug is required'],
    lowercase: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Please add a category']
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please add a type']
  },
  subtype: {
    type: mongoose.Schema.Types.ObjectId
  },
  brand: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please add a brand'],
    validate: {
      validator: function(v) {
        // Accept either an ObjectId or a non-empty string
        return mongoose.Types.ObjectId.isValid(v) || (typeof v === 'string' && v.trim().length > 0);
      },
      message: props => `${props.value} is not a valid brand (must be an ObjectId or non-empty string)`
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  photos: [imageSchema],
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  specifications: {
    type: Map,
    of: String
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [reviewSchema],
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create virtual field for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return parseFloat((this.price - (this.price * this.discount / 100)).toFixed(2));
  }
  return this.price;
});

// Update average rating when a review is added or modified
productSchema.methods.updateRating = function() {
  const reviews = this.reviews;
  if (reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
    this.rating.average = parseFloat((sum / reviews.length).toFixed(1));
    this.rating.count = reviews.length;
  }
  return this.save();
};

export default mongoose.model('Product', productSchema);

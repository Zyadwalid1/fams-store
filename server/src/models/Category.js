import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  subcategories: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    image: String
  }],
  brands: [{
    name: {
      type: String,
      required: true
    },
    image: String
  }],
  filters: {
    type: {
      type: [String],
      default: []
    },
    subtype: {
      type: [String],
      default: []
    },
    brand: {
      type: [String],
      default: []
    },
    price: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 1000
      }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);

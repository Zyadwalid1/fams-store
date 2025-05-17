import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a brand name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please specify if the brand is affordable or luxury'],
    enum: ['affordable', 'luxury', 'local'],
    default: 'affordable'
  },
  featured: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Brand', brandSchema); 
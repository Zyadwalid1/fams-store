import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  types: [{
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      lowercase: true
    },
    description: String,
    subtypes: [{
      name: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        lowercase: true
      },
      description: String
    }]
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  filters: {
    brands: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    }],
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    attributes: [{
      name: String,
      values: [String]
    }]
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slugs from names
productCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
  }
  
  if (this.types) {
    this.types.forEach(type => {
      if (type.isModified && type.isModified('name')) {
        type.slug = type.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      }
      
      if (type.subtypes) {
        type.subtypes.forEach(subtype => {
          if (subtype.isModified && subtype.isModified('name')) {
            subtype.slug = subtype.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
          }
        });
      }
    });
  }
  
  next();
});

export default mongoose.model('ProductCategory', productCategorySchema); 
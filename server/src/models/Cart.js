import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total cart value
cartSchema.methods.calculateTotal = function() {
  let total = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      if (item.product && typeof item.product === 'object') {
        // If product is populated, use the discounted price
        const price = item.product.discount > 0 
          ? (item.product.price * (1 - item.product.discount / 100))
          : item.product.price;
        total += price * item.quantity;
      }
    });
  }
  return parseFloat(total.toFixed(2));
};

export default mongoose.model('Cart', cartSchema); 
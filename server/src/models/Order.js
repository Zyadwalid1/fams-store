import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    governorate: {
      type: String,
      required: true
    },
    postalCode: {
      type: String
    },
    notes: {
      type: String
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD',
    enum: ['COD']  // Cash on Delivery only for now
  },
  shippingFee: {
    type: Number,
    required: true
  },
  itemsTotal: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: String,
    required: true
  },
  deliveryRegion: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  deliveredAt: Date,
  cancelledAt: Date,
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema); 
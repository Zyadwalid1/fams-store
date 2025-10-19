import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isFromCustomer: {
    type: Boolean,
    default: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  productRecommendation: {
    type: Object,
    default: null
  }
}, { _id: true });

const chatConversationSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCustomerCount: {
    type: Number,
    default: 0
  },
  unreadSupportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for performance
// chatConversationSchema.index({ chatId: 1 }); // Removing this as chatId already has unique:true which creates an index
chatConversationSchema.index({ userId: 1 });
chatConversationSchema.index({ lastActivity: -1 });

export default mongoose.model('ChatConversation', chatConversationSchema); 
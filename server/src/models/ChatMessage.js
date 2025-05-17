import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: {
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
  chatId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ChatMessage', chatMessageSchema); 
import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  device: {
    type: String,
    required: true,
    trim: true
  },
  browser: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    default: 'Unknown location'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by user
loginHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema); 
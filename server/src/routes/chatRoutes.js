import express from 'express';
import {
  getChatMessages,
  saveMessage,
  markMessagesAsRead,
  getConversations,
  deleteConversation,
  getConsultantMessages
} from '../controllers/chatController.js';
import { protect, admin, support } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (user must be logged in)
router.get('/messages/:userId', protect, getChatMessages);
router.get('/consultant-messages/:userId', protect, getConsultantMessages);
router.post('/messages', protect, saveMessage);
router.put('/messages/read', protect, markMessagesAsRead);

// Support staff routes
router.get('/conversations', protect, support, getConversations);
router.delete('/conversations/:chatId', protect, support, deleteConversation);

export default router; 
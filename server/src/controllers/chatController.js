import ChatMessage from '../models/ChatMessage.js';
import ChatConversation from '../models/ChatConversation.js';
import asyncHandler from '../middleware/asyncHandler.js';
import mongoose from 'mongoose';

// @desc    Get chat messages for a user
// @route   GET /api/chat/messages/:userId
// @access  Private
export const getChatMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const chatId = `support_${userId}`;
  
  // Find conversation or create if it doesn't exist
  let conversation = await ChatConversation.findOne({ chatId }).populate('userId', 'name email');
  
  if (!conversation) {
    // Return empty messages array if no conversation exists yet
    return res.status(200).json({ messages: [] });
  }
  
  // Map the conversation messages to match the expected format
  const messages = conversation.messages.map(msg => ({
    _id: msg._id,
    userId: msg.senderId,
    content: msg.content,
    isFromCustomer: msg.isFromCustomer,
    isRead: msg.isRead,
    chatId: conversation.chatId,
    createdAt: msg.timestamp,
    updatedAt: msg.timestamp
  }));
  
  res.status(200).json({ messages });
});

// @desc    Save a new chat message
// @route   POST /api/chat/messages
// @access  Private
export const saveMessage = asyncHandler(async (req, res) => {
  const { userId, content, isFromCustomer, chatId } = req.body;
  
  if (!userId || !content || !chatId) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  try {
    // Find existing conversation or create a new one
    let conversation = await ChatConversation.findOne({ chatId });
    
    if (!conversation) {
      // Create new conversation
      conversation = new ChatConversation({
        chatId,
        userId: new mongoose.Types.ObjectId(userId),
        messages: [],
        lastActivity: new Date()
      });
    }
    
    // Create new message
    const newMessage = {
      senderId: new mongoose.Types.ObjectId(userId),
      content,
      isFromCustomer,
      isRead: false,
      timestamp: new Date()
    };
    
    // Add message to conversation
    conversation.messages.push(newMessage);
    
    // Update last activity
    conversation.lastActivity = new Date();
    
    // Update unread counts
    if (isFromCustomer) {
      conversation.unreadSupportCount += 1;
    } else {
      conversation.unreadCustomerCount += 1;
    }
    
    // Save updated conversation
    await conversation.save();
    
    // Get the ID of the newly added message (last in the array)
    const savedMessage = conversation.messages[conversation.messages.length - 1];
    
    // Return in expected format for client
    res.status(201).json({ 
      message: {
        _id: savedMessage._id,
        userId: savedMessage.senderId,
        content: savedMessage.content,
        isFromCustomer: savedMessage.isFromCustomer,
        isRead: savedMessage.isRead,
        chatId,
        createdAt: savedMessage.timestamp,
        updatedAt: savedMessage.timestamp
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500);
    throw new Error(`Failed to save message: ${error.message}`);
  }
});

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/read
// @access  Private
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId, isAdmin } = req.body;
  
  const conversation = await ChatConversation.findOne({ chatId });
  
  if (!conversation) {
    return res.status(200).json({ success: true });
  }
  
  // Update message read status
  conversation.messages.forEach(msg => {
    // Admin reads customer messages, customer reads admin messages
    if (msg.isFromCustomer === !isAdmin && !msg.isRead) {
      msg.isRead = true;
    }
  });
  
  // Reset the appropriate unread counter
  if (isAdmin) {
    conversation.unreadSupportCount = 0;
  } else {
    conversation.unreadCustomerCount = 0;
  }
  
  await conversation.save();
  
  res.status(200).json({ success: true });
});

// @desc    Get all active chat conversations (for admin)
// @route   GET /api/chat/conversations
// @access  Private/Admin
export const getConversations = asyncHandler(async (req, res) => {
  // Get all conversations
  const conversations = await ChatConversation.find()
    .sort({ lastActivity: -1 })
    .populate('userId', 'name email')
    .lean();
  
  // Format the response
  const formattedConversations = conversations.map(conv => {
    // Get the most recent message
    const lastMessageObj = conv.messages.length > 0 
      ? conv.messages[conv.messages.length - 1] 
      : null;
    
    return {
      chatId: conv.chatId,
      userId: conv.userId._id,
      lastMessage: lastMessageObj ? lastMessageObj.content : '',
      lastMessageAt: lastMessageObj ? lastMessageObj.timestamp : conv.lastActivity,
      unreadCount: conv.unreadSupportCount,
      userDetails: {
        name: conv.userId.name,
        email: conv.userId.email
      }
    };
  });
  
  res.status(200).json({ conversations: formattedConversations });
});

// @desc    Delete a chat conversation
// @route   DELETE /api/chat/conversations/:chatId
// @access  Private/Admin
export const deleteConversation = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  
  if (!chatId) {
    res.status(400);
    throw new Error('Chat ID is required');
  }

  // Delete the conversation
  const result = await ChatConversation.deleteOne({ chatId });
  
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Conversation deleted successfully' 
  });
});

// @desc    Get consultant chat messages for a user
// @route   GET /api/chat/consultant-messages/:userId
// @access  Private
export const getConsultantMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const chatId = `consultant_${userId}`;
  
  // Find conversation or create if it doesn't exist
  let conversation = await ChatConversation.findOne({ chatId }).populate('userId', 'name email');
  
  if (!conversation) {
    // Return empty messages array if no conversation exists yet
    return res.status(200).json({ messages: [] });
  }
  
  // Map the conversation messages to match the expected format
  const messages = conversation.messages.map(msg => ({
    _id: msg._id,
    userId: msg.senderId,
    content: msg.content,
    isFromCustomer: msg.isFromCustomer,
    isRead: msg.isRead,
    chatId: conversation.chatId,
    createdAt: msg.timestamp,
    updatedAt: msg.timestamp,
    // Include product recommendation if present
    ...(msg.productRecommendation && { productRecommendation: msg.productRecommendation })
  }));
  
  res.status(200).json({ messages });
}); 
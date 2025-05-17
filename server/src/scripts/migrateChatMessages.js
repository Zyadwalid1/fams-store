import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatMessage from '../models/ChatMessage.js';
import ChatConversation from '../models/ChatConversation.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const migrateMessages = async () => {
  try {
    console.log('Starting migration of chat messages...');
    
    // Get all distinct chatIds
    const chatIds = await ChatMessage.distinct('chatId');
    console.log(`Found ${chatIds.length} chat conversations to migrate`);
    
    // Process each chat
    for (const chatId of chatIds) {
      console.log(`Processing chat: ${chatId}`);
      
      // Get all messages for this chatId, sorted by creation date
      const messages = await ChatMessage.find({ chatId })
        .sort({ createdAt: 1 })
        .lean();
      
      if (messages.length === 0) {
        console.log(`No messages found for chat: ${chatId}`);
        continue;
      }
      
      // Get the user ID from the first message
      const userId = messages[0].userId;
      
      // Check if a conversation for this chatId already exists
      let conversation = await ChatConversation.findOne({ chatId });
      
      if (!conversation) {
        // Create a new conversation
        conversation = new ChatConversation({
          chatId,
          userId: userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId),
          messages: [],
          lastActivity: new Date(),
          unreadCustomerCount: 0,
          unreadSupportCount: 0
        });
      }
      
      // Count unread messages
      let unreadCustomerCount = 0;
      let unreadSupportCount = 0;
      
      // Transform and add each message
      for (const msg of messages) {
        // Transform the message to the new format
        const transformedMessage = {
          senderId: msg.userId instanceof mongoose.Types.ObjectId ? msg.userId : new mongoose.Types.ObjectId(msg.userId),
          content: msg.content,
          isFromCustomer: msg.isFromCustomer,
          isRead: msg.isRead,
          timestamp: msg.createdAt || new Date()
        };
        
        // Update unread counts
        if (msg.isFromCustomer && !msg.isRead) {
          unreadSupportCount++;
        } else if (!msg.isFromCustomer && !msg.isRead) {
          unreadCustomerCount++;
        }
        
        // Add to the new messages array
        conversation.messages.push(transformedMessage);
      }
      
      // Set last activity time to the most recent message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        conversation.lastActivity = lastMessage.createdAt || lastMessage.updatedAt || new Date();
      }
      
      // Set unread counts
      conversation.unreadCustomerCount = unreadCustomerCount;
      conversation.unreadSupportCount = unreadSupportCount;
      
      // Save the conversation
      await conversation.save();
      
      console.log(`Migrated ${messages.length} messages for chat: ${chatId}`);
    }
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration
migrateMessages(); 
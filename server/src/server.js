import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import productCategoryRoutes from './routes/productCategoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ChatConversation from './models/ChatConversation.js';
import passport from 'passport';
import useragent from 'express-useragent';
import orderRoutes from './routes/orderRoutes.js';
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Add request logging middleware with environment-based conditions
app.use((req, res, next) => {
  // Only log detailed request information in development environment
  if (process.env.NODE_ENV !== 'production') {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
    }
  } else {
    // In production, only log basic request information
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reels', reelRoutes);

// Health check endpoint for monitoring and deployment checks
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'up', 
    timestamp: new Date(), 
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a support chat room
  socket.on('join_support_chat', (userId) => {
    socket.join(`support_${userId}`);
    console.log(`User ${userId} joined support chat room`);
  });
  
  // Join a skincare consultant chat room
  socket.on('join_consultant_chat', (userId) => {
    socket.join(`consultant_${userId}`);
    console.log(`User ${userId} joined consultant chat room`);
  });
  
  // Check consultant status
  socket.on('check_consultant_status', () => {
    // This would normally check a database or other state
    // For now, we'll just return a hardcoded status
    socket.emit('consultant_status', 'online');
  });
  
  // Handle new message from client
  socket.on('send_message', async (messageData) => {
    console.log('Message received:', messageData);
    
    try {
      // Validate message data
      if (!messageData.userId || !messageData.content || !messageData.chatId) {
        console.error('Invalid message data:', messageData);
        return;
      }
      
      // Ensure message has a unique ID to prevent duplicates
      if (!messageData.id && !messageData._id) {
        messageData.id = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add serverProcessed flag to prevent re-processing
      messageData.serverProcessed = true;
      
      const isSupportMessage = !messageData.isFromCustomer;
      const chatRoomId = `support_${messageData.userId}`;
      
      // SAVE MESSAGE TO DATABASE - This is the critical addition
      try {
        console.log('Saving message to database for chatId:', messageData.chatId);
        
        // Find or create conversation
        let conversation = await ChatConversation.findOne({ chatId: messageData.chatId });
        
        if (!conversation) {
          // Create new conversation
          console.log('Creating new conversation for chatId:', messageData.chatId);
          try {
            conversation = new ChatConversation({
              chatId: messageData.chatId,
              userId: new mongoose.Types.ObjectId(messageData.userId),
              messages: [],
              lastActivity: new Date()
            });
            console.log('New conversation created successfully');
          } catch (createError) {
            console.error('Error creating conversation:', createError);
            throw createError;
          }
        }
        
        // Create new message
        const newMessage = {
          senderId: new mongoose.Types.ObjectId(messageData.userId),
          content: messageData.content,
          isFromCustomer: messageData.isFromCustomer,
          isRead: false,
          timestamp: new Date()
        };
        
        // Add message to conversation
        conversation.messages.push(newMessage);
        
        // Update last activity
        conversation.lastActivity = new Date();
        
        // Update unread counts
        if (messageData.isFromCustomer) {
          conversation.unreadSupportCount += 1;
        } else {
          conversation.unreadCustomerCount += 1;
        }
        
        // Save to database
        await conversation.save();
        console.log('Message saved to database successfully for chatId:', messageData.chatId);
        
        // Add the database ID to the message data for socket transmission
        const savedMessage = conversation.messages[conversation.messages.length - 1];
        messageData._id = savedMessage._id;
      } catch (dbError) {
        console.error('Error saving message to database:', dbError);
        if (dbError.name === 'ValidationError') {
          console.error('Validation error details:', dbError.errors);
        }
        if (dbError.name === 'CastError') {
          console.error('Cast error details:', dbError.message);
        }
        // We still want to deliver the message even if DB save fails
      }
      
      // EMIT MESSAGES VIA SOCKET
      try {
        if (isSupportMessage) {
          // Message is from support admin to user - only send to the specific user's room
          // and NOT back to admin (since admin UI already shows the message)
          console.log('Support message: sending only to user room', chatRoomId);
          socket.to(chatRoomId).emit('receive_message', messageData);
        } else {
          // Message is from customer to support
          // 1. Send to all admins in the support room (except sender if they're in that room)
          console.log('Customer message: sending to admin_support room');
          socket.to('admin_support').emit('receive_message', messageData);
          
          // 2. Send to the specific user's room (excluding the sender)
          // This ensures other instances of the same user get the message
          console.log('Customer message: sending to user room', chatRoomId);
          socket.to(chatRoomId).emit('receive_message', messageData);
        }
        console.log('Message emitted via socket successfully');
      } catch (socketError) {
        console.error('Error emitting message via socket:', socketError);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle new message from client to consultant
  socket.on('send_consultant_message', async (messageData) => {
    console.log('Consultant message received:', messageData);
    
    try {
      // Validate message data
      if (!messageData.userId || !messageData.content || !messageData.chatId) {
        console.error('Invalid consultant message data:', messageData);
        return;
      }
      
      // Ensure message has a unique ID to prevent duplicates
      if (!messageData.id && !messageData._id) {
        messageData.id = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add serverProcessed flag to prevent re-processing
      messageData.serverProcessed = true;
      
      const isSupportMessage = !messageData.isFromCustomer;
      const chatRoomId = `consultant_${messageData.userId}`;
      
      // SAVE MESSAGE TO DATABASE
      try {
        console.log('Saving consultant message to database for chatId:', messageData.chatId);
        
        // Find or create conversation
        let conversation = await ChatConversation.findOne({ chatId: messageData.chatId });
        
        if (!conversation) {
          // Create new conversation
          console.log('Creating new consultant conversation for chatId:', messageData.chatId);
          try {
            conversation = new ChatConversation({
              chatId: messageData.chatId,
              userId: new mongoose.Types.ObjectId(messageData.userId),
              messages: [],
              lastActivity: new Date()
            });
            console.log('New consultant conversation created successfully');
          } catch (createError) {
            console.error('Error creating consultant conversation:', createError);
            throw createError;
          }
        }
        
        // Create new message
        const newMessage = {
          senderId: new mongoose.Types.ObjectId(messageData.userId),
          content: messageData.content,
          isFromCustomer: messageData.isFromCustomer,
          isRead: false,
          timestamp: new Date()
        };
        
        // Add message to conversation
        conversation.messages.push(newMessage);
        
        // Update last activity
        conversation.lastActivity = new Date();
        
        // Update unread counts
        if (messageData.isFromCustomer) {
          conversation.unreadSupportCount += 1;
        } else {
          conversation.unreadCustomerCount += 1;
        }
        
        // Save to database
        await conversation.save();
        console.log('Consultant message saved to database successfully for chatId:', messageData.chatId);
        
        // Add the database ID to the message data for socket transmission
        const savedMessage = conversation.messages[conversation.messages.length - 1];
        messageData._id = savedMessage._id;
      } catch (dbError) {
        console.error('Error saving consultant message to database:', dbError);
        if (dbError.name === 'ValidationError') {
          console.error('Validation error details:', dbError.errors);
        }
        if (dbError.name === 'CastError') {
          console.error('Cast error details:', dbError.message);
        }
        // We still want to deliver the message even if DB save fails
      }
      
      // EMIT MESSAGES VIA SOCKET
      try {
        if (isSupportMessage) {
          // Message is from consultant/admin to user - only send to the specific user's room
          console.log('Consultant message: sending to user room', chatRoomId);
          socket.to(chatRoomId).emit('receive_message', messageData);
        } else {
          // Message is from customer to consultant
          console.log('Customer message to consultant: sending to consultant room');
          socket.to('consultant_room').emit('receive_message', messageData);
          
          // Also send to the specific user's room (for multiple devices)
          console.log('Customer message: sending to user room', chatRoomId);
          socket.to(chatRoomId).emit('receive_message', messageData);
        }
        console.log('Consultant message emitted via socket successfully');
      } catch (socketError) {
        console.error('Error emitting consultant message via socket:', socketError);
      }
    } catch (error) {
      console.error('Error processing consultant message:', error);
    }
  });
  
  // Handle product recommendation from consultant
  socket.on('send_product_recommendation', async (data) => {
    console.log('Product recommendation received:', data);
    
    try {
      const { userId, productId, productData, chatId, message } = data;
      
      if (!userId || (!productId && !productData) || !chatId) {
        console.error('Invalid product recommendation data:', data);
        return;
      }
      
      let productRecommendation;
      
      // If productData is provided by the client, use it directly
      if (productData) {
        productRecommendation = {
          _id: productData._id,
          name: productData.name,
          price: productData.price,
          image: productData.image || '/images/default-product.jpg',
          rating: productData.rating
        };
      } else {
        // Otherwise fetch product details from database
        const product = await Product.findById(productId);
        
        if (!product) {
          console.error('Product not found:', productId);
          return;
        }
        
        productRecommendation = {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.photos && product.photos.length > 0 
            ? product.photos[0].secure_url
            : '/images/default-product.jpg',
          rating: product.rating
        };
      }
      
      // Create recommendation message
      const recommendationMessage = {
        userId,
        content: message || `I recommend trying ${productRecommendation.name} for your skin concerns.`,
        isFromCustomer: false,
        chatId,
        timestamp: new Date(),
        productRecommendation
      };
      
      // Save to database
      let conversation = await ChatConversation.findOne({ chatId });
      
      if (!conversation) {
        conversation = new ChatConversation({
          chatId,
          userId: new mongoose.Types.ObjectId(userId),
          messages: [],
          lastActivity: new Date()
        });
      }
      
      // Create new message with product recommendation
      const newMessage = {
        senderId: new mongoose.Types.ObjectId(userId),
        content: recommendationMessage.content,
        isFromCustomer: false,
        isRead: false,
        timestamp: new Date(),
        productRecommendation: recommendationMessage.productRecommendation
      };
      
      // Add message to conversation
      conversation.messages.push(newMessage);
      
      // Update last activity and unread count
      conversation.lastActivity = new Date();
      conversation.unreadCustomerCount += 1;
      
      await conversation.save();
      
      // Emit to user's room
      const chatRoomId = `consultant_${userId}`;
      
      // Create the message with the message ID for consistency
      const messageToEmit = {
        ...recommendationMessage,
        _id: newMessage._id
      };
      
      // Emit to the sender to show in their own chat
      socket.emit('receive_message', messageToEmit);
      
      // Emit to the consultant room for other doctors/admins
      socket.to('consultant_room').emit('receive_message', messageToEmit);
      
      // Emit to the user's room (the customer)
      socket.to(chatRoomId).emit('receive_message', messageToEmit);
      
      console.log('Product recommendation sent successfully');
    } catch (error) {
      console.error('Error processing product recommendation:', error);
    }
  });
  
  // Consultant joining room
  socket.on('join_consultant_room', () => {
    socket.join('consultant_room');
    console.log('Consultant joined room');
  });
  
  // Admin joining support room
  socket.on('join_admin_support', () => {
    socket.join('admin_support');
    console.log('Admin joined support room');
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server running on port ${PORT}`);
});

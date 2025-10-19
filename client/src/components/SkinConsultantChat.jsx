import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserMd, FaTimes, FaPaperPlane, FaSpinner, FaShoppingCart, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SkinConsultantChat = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, content: 'Hello! I am Dr. Zyad, your personal skincare consultant. How can I help with your skincare concerns today?', isFromCustomer: false, timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [consultantStatus, setConsultantStatus] = useState('online'); // online, busy, offline
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socket = useRef(null);
  
  // Debug user state
  useEffect(() => {
    console.log('SkinConsultantChat: User state changed', { 
      user, 
      authLoading,
      isUserLoggedIn: !!user,
      userId: user?._id
    });
  }, [user, authLoading]);
  
  // Helper function to get user from context or localStorage
  const getUserData = () => {
    // First try to get from context
    if (user && (user._id || user.id)) {
      return user;
    }
    
    // If not available in context, try localStorage
    try {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('Using user data from localStorage:', userData);
        return userData;
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
    
    return null;
  };
  
  // Get the user ID, handling both _id and id formats
  const getUserId = (userData) => {
    if (!userData) return null;
    return userData._id || userData.id;
  };
  
  // Helper function to get the API base URL
  const getApiBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}/api`;
  };
  
  // Initialize socket connection
  useEffect(() => {
    // Only connect to socket when chat is opened
    if (isOpen && !socket.current) {
      const token = localStorage.getItem('accessToken');
      console.log('Opening consultant chat with token:', token ? 'Token exists' : 'No token');
      
      // Choose server URL based on environment
      const serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log('Connecting to socket server at:', serverUrl);
      
      // Initialize socket
      socket.current = io(serverUrl);
      
      // Get user data from context or localStorage
      const userData = getUserData();
      const userId = getUserId(userData);
      
      // Join skincare consultant chat room if user is logged in
      if (userData && userId) {
        console.log('Joining consultant chat room for user:', userId);
        socket.current.emit('join_consultant_chat', userId);
        fetchMessages(userId);
        
        // Check consultant status
        socket.current.emit('check_consultant_status');
      } else {
        console.log('No user data available for consultant chat');
        // Add welcome message for guests
        setMessages([{
          id: 'welcome',
          content: 'Hello! I am Dr. Zyad, your personal skincare consultant. Please sign in to start your consultation.',
          isFromCustomer: false,
          timestamp: new Date()
        }]);
      }
      
      // Listen for incoming messages
      socket.current.on('receive_message', (data) => {
        console.log('Received message via socket:', data);
        
        // Check if this message already exists in our state to prevent duplicates
        setMessages(prev => {
          // Generate a unique ID for comparison
          const messageId = data.id || data._id;
          
          // Check if this message is already in our state
          const isDuplicate = prev.some(msg => {
            // Check by ID first (most reliable)
            if ((msg.id === messageId || msg._id === messageId) && messageId) {
              return true;
            }
            
            // Fallback to content + sender + timestamp comparison if no ID match
            return (msg.content === data.content && 
                   msg.isFromCustomer === data.isFromCustomer &&
                   Math.abs(new Date(msg.timestamp || msg.createdAt) - new Date(data.timestamp || data.createdAt)) < 3000);
          });
          
          // Special handling for messages from consultant
          if (!data.isFromCustomer) {
            // If it's a duplicate message, don't add it again
            if (isDuplicate) {
              console.log('Duplicate consultant message detected, not adding to UI');
              return prev;
            }
          } 
          // Special handling for messages from customer
          else if (data.isFromCustomer) {
            const userId = getUserId(getUserData());
            
            // If it's our own message and a duplicate, skip it
            if (data.userId === userId && isDuplicate) {
              console.log('Skipping duplicate of own customer message');
              return prev;
            }
          }
          
          // Only add the message if we didn't detect it as a duplicate to handle
          console.log('Adding new message to UI:', data);
          return [...prev, data];
        });
        
        scrollToBottom();
      });
      
      // Listen for consultant status updates
      socket.current.on('consultant_status', (status) => {
        setConsultantStatus(status);
      });
      
      // Listen for product recommendations
      socket.current.on('product_recommendation', (productData) => {
        // Add product recommendation message
        setMessages(prev => [...prev, {
          id: `product_${Date.now()}`,
          content: `I recommend trying this product: ${productData.name}`,
          isFromCustomer: false,
          timestamp: new Date(),
          productRecommendation: productData
        }]);
        
        scrollToBottom();
      });
    }
    
    // Cleanup on unmount or when chat is closed
    return () => {
      if (socket.current) {
        console.log('Disconnecting consultant chat socket');
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [isOpen, user]);
  
  // Fetch previous messages when chat is opened
  const fetchMessages = async (userId) => {
    try {
      console.log('Fetching consultant messages with userId:', userId, typeof userId);
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token || !userId) {
        console.log('Cannot fetch messages: missing token or userId');
        // Add welcome message for guests
        setMessages([{
          id: 'welcome',
          content: 'Hello! I am Dr. Zyad, your personal skincare consultant. Please sign in to start your consultation.',
          isFromCustomer: false,
          timestamp: new Date()
        }]);
        return;
      }
      
      console.log('Fetching consultant messages for user:', userId);
      const response = await fetch(`${getApiBaseUrl()}/chat/consultant-messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch consultant messages');
      }
      
      const data = await response.json();
      console.log('Fetched consultant messages:', data);
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Add welcome message if no previous messages
        setMessages([{
          id: 'welcome',
          content: 'Hello! I am Dr. Zyad, your personal skincare consultant. How can I help with your skincare concerns today?',
          isFromCustomer: false,
          timestamp: new Date()
        }]);
      }
      
      // Mark messages as read
      markMessagesAsRead(`consultant_${userId}`, false);
    } catch (error) {
      console.error('Error fetching consultant messages:', error);
      
      // Add error message
      setMessages([{
        id: 'error',
        content: 'There was an error loading previous messages. Please try again later.',
        isFromCustomer: false,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (chatId, isAdmin) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) return;
      
      await fetch(`${getApiBaseUrl()}/chat/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, isAdmin })
      });
    } catch (error) {
      console.error('Error marking consultant messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log('Submitting message to consultant with user state:', { user });
    
    // Get user data from context or localStorage
    const userData = getUserData();
    const userId = getUserId(userData);
    
    if (!userData || !userId) {
      toast.error('Please sign in to send messages');
      return;
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Authentication error. Please sign in again.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const chatId = `consultant_${userId}`;
      const messageId = `local_${Date.now()}`;
      
      // Create message object
      const messageData = {
        userId,
        content: message,
        isFromCustomer: true,
        chatId,
        timestamp: new Date(),
        id: messageId // Add client-side ID to help with deduplication
      };
      
      console.log('Sending message to consultant:', messageData);
      
      // Add message to UI immediately
      setMessages(prev => [...prev, {
        ...messageData,
        timestamp: new Date()
      }]);
      
      // Clear input
      setMessage('');
      
      // Emit socket event with the same ID
      socket.current.emit('send_consultant_message', messageData);
      
      // No need to save to database separately - socket.io server handles it now
      console.log('Message sent via socket, server will save to database');
    } catch (error) {
      console.error('Error sending message to consultant:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  // Format time for chat messages
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="fixed bottom-6 left-6 consultant-chat-container"
      style={{ 
        zIndex: 999998, 
        transform: 'translateZ(0)'
      }}
    >
      <div className="relative">
        {/* Chat Button */}
        <motion.button
          onClick={toggleChat}
          className="p-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-teal-500/25"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserMd className="w-6 h-6" />
        </motion.button>

        {/* Consultant Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          consultantStatus === 'online' ? 'bg-green-500' :
          consultantStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />

        {/* Chat Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-16 left-0 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FaUserMd className="w-8 h-8" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      consultantStatus === 'online' ? 'bg-green-500' :
                      consultantStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dr. Zyad</h3>
                    <p className="text-xs text-white/80">Skincare Consultant</p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef} 
                className="h-96 overflow-y-auto overflow-x-hidden p-4 space-y-4"
              >
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <FaSpinner className="animate-spin h-8 w-8 text-teal-500" />
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id || msg._id || index}
                      className={`flex ${!msg.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl break-words ${
                          !msg.isFromCustomer
                            ? 'bg-teal-100 dark:bg-teal-800 text-gray-800 dark:text-white rounded-tl-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content || msg.text}</p>
                        
                        {/* Product Recommendation */}
                        {msg.productRecommendation && (
                          <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                {msg.productRecommendation.image ? (
                                  <img 
                                    src={msg.productRecommendation.image} 
                                    alt={msg.productRecommendation.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                    onError={(e) => {
                                      console.error('Image failed to load:', e);
                                      e.target.src = '/images/default-product.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                    <FaShoppingCart className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                                  </div>
                                )}
                                <Link 
                                  to={`/product/${msg.productRecommendation._id}`}
                                  className="absolute -bottom-2 -right-2 bg-teal-500 hover:bg-teal-600 text-white p-1.5 rounded-full shadow-md"
                                  title="View product details"
                                >
                                  <FaExternalLinkAlt className="h-3 w-3" />
                                </Link>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {msg.productRecommendation.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    ${msg.productRecommendation.price}
                                  </p>
                                  {msg.productRecommendation.rating && (
                                    <div className="ml-2 flex items-center">
                                      <FaStar className="text-yellow-500 h-3 w-3" />
                                      <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                                        {typeof msg.productRecommendation.rating === 'object' 
                                          ? (msg.productRecommendation.rating.average || 0).toFixed(1) 
                                          : msg.productRecommendation.rating}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Link 
                                  to={`/product/${msg.productRecommendation._id}`}
                                  className="mt-2 inline-flex items-center text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                                >
                                  <span>View Product</span>
                                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <span className="text-xs opacity-50 mt-1 block">
                          {formatTime(msg.timestamp || msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSending || consultantStatus === 'offline'}
                    placeholder={
                      !getUserData() 
                        ? "Please sign in to chat..." 
                        : consultantStatus === 'offline' 
                        ? "Consultant is offline" 
                        : "Describe your skin concerns..."
                    }
                    className="flex-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSending || !message.trim() || !getUserData() || consultantStatus === 'offline'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl ${
                      isSending || !message.trim() || !getUserData() || consultantStatus === 'offline'
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-500 to-teal-700' 
                    } text-white shadow-lg hover:shadow-teal-500/25`}
                  >
                    {isSending ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      <FaPaperPlane className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
                {!getUserData() && (
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    Please <a href="/login" className="text-teal-500 hover:underline">sign in</a> to chat with our skincare consultant
                  </p>
                )}
                {getUserData() && consultantStatus === 'offline' && (
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    Our consultant is currently offline. Please check back later.
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkinConsultantChat; 
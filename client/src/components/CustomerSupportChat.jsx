import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const CustomerSupportChat = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, content: 'Hello! How can we help you today?', isFromCustomer: false, timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socket = useRef(null);
  
  // Debug user state
  useEffect(() => {
    console.log('CustomerSupportChat: User state changed', { 
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
      console.log('Opening chat with token:', token ? 'Token exists' : 'No token');
      
      // Choose server URL based on environment
      const serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log('Connecting to socket server at:', serverUrl);
      
      // Initialize socket
      socket.current = io(serverUrl);
      
      // Get user data from context or localStorage
      const userData = getUserData();
      const userId = getUserId(userData);
      
      // Join support chat room if user is logged in
      if (userData && userId) {
        console.log('Joining chat room for user:', userId);
        socket.current.emit('join_support_chat', userId);
        fetchMessages(userId);
      } else {
        console.log('No user data available for chat');
        // Add welcome message for guests
        setMessages([{
          id: 'welcome',
          content: 'Hello! How can we help you today? Please sign in to continue the conversation.',
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
          
          // Special handling for messages from admin/support
          if (!data.isFromCustomer) {
            // If it's a duplicate support message, don't add it again
            if (isDuplicate) {
              console.log('Duplicate support message detected, not adding to UI');
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
    }
    
    // Cleanup on unmount or when chat is closed
    return () => {
      if (socket.current) {
        console.log('Disconnecting chat socket');
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [isOpen, user]);
  
  // Fetch previous messages when chat is opened
  const fetchMessages = async (userId) => {
    try {
      console.log('Fetching messages with userId:', userId, typeof userId);
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token || !userId) {
        console.log('Cannot fetch messages: missing token or userId');
        // Add welcome message for guests
        setMessages([{
          id: 'welcome',
          content: 'Hello! How can we help you today? Please sign in to continue the conversation.',
          isFromCustomer: false,
          timestamp: new Date()
        }]);
        return;
      }
      
      console.log('Fetching messages for user:', userId);
      const response = await fetch(`${getApiBaseUrl()}/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      console.log('Fetched messages:', data);
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Add welcome message if no previous messages
        setMessages([{
          id: 'welcome',
          content: 'Hello! How can we help you today?',
          isFromCustomer: false,
          timestamp: new Date()
        }]);
      }
      
      // Mark messages as read
      markMessagesAsRead(`support_${userId}`, false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
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
      console.error('Error marking messages as read:', error);
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
    
    console.log('Submitting message with user state:', { user });
    
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
      const chatId = `support_${userId}`;
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
      
      console.log('Sending message:', messageData);
      
      // Add message to UI immediately
      setMessages(prev => [...prev, {
        ...messageData,
        timestamp: new Date()
      }]);
      
      // Clear input
      setMessage('');
      
      // Emit socket event with the same ID
      socket.current.emit('send_message', messageData);
      
      // No need to save to database separately - socket.io server handles it now
      console.log('Message sent via socket, server will save to database');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="fixed bottom-6 right-6 support-button-container"
      style={{ 
        zIndex: 999999, 
        transform: 'translateZ(0)'
      }}
    >
      <div className="relative">
        {/* Chat Button */}
        <motion.button
          onClick={toggleChat}
          className="p-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:shadow-primary/25"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaComments className="w-6 h-6" />
        </motion.button>

        {/* Chat Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Customer Support</h3>
                  <p className="text-sm text-white/80">We typically reply within minutes</p>
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
                    <FaSpinner className="animate-spin h-8 w-8 text-primary" />
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
                            ? 'bg-gray-300 dark:bg-gray-700 dark:text-white rounded-tl-none'
                            : 'bg-primary text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content || msg.text}</p>
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
                    disabled={isSending}
                    placeholder={getUserData() ? "Type your message..." : "Please sign in to chat..."}
                    className="flex-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSending || !message.trim() || !getUserData()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl ${
                      isSending || !message.trim() || !getUserData()
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary-dark' 
                    } text-white shadow-lg hover:shadow-primary/25`}
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
                    Please <a href="/login" className="text-primary hover:underline">sign in</a> to chat with our support team
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

export default CustomerSupportChat; 
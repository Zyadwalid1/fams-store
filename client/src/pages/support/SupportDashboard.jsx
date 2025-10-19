import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaSpinner, FaPaperPlane, FaSignOutAlt, FaSearch, FaTrash, FaTimesCircle, FaUserMd, FaBoxOpen, FaFilter, FaShoppingCart, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import ProductRecommendation from '../../components/ProductRecommendation';

const SupportDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const socketRef = useRef(null);
  const chatMessagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [userRole, setUserRole] = useState('support'); // default to support
  const [showProductRecommendation, setShowProductRecommendation] = useState(false);
  const [chatViewMode, setChatViewMode] = useState('all'); // 'all', 'support', 'consultant'
  const isAdmin = userRole === 'admin'; // Check if current user is admin
  
  // Get user role from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'support';
    setUserRole(role);
    console.log('User role:', role);
    
    // Set initial chat view mode based on role
    if (role === 'admin') {
      setChatViewMode('all');
    } else if (role === 'doctor') {
      setChatViewMode('consultant');
    } else {
      setChatViewMode('support');
    }
  }, []);

  // Socket.io connection for support staff
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (!socketRef.current) {
      // Initialize socket
      const serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log('Connecting to socket server at:', serverUrl);
      socketRef.current = io(serverUrl);
      
      // Join appropriate rooms based on role
      if (userRole === 'admin') {
        // Admin joins both rooms
        socketRef.current.emit('join_admin_support');
        socketRef.current.emit('join_consultant_room');
      } else if (userRole === 'doctor') {
        // Doctor joins consultant room only
        socketRef.current.emit('join_consultant_room');
      } else {
        // Support staff joins support room only
        socketRef.current.emit('join_admin_support');
      }
      
      // Listen for incoming messages
      socketRef.current.on('receive_message', (data) => {
        console.log('Received message:', data);
        
        // Validate the data
        if (!data || !data.chatId) {
          console.error('Received invalid message data:', data);
          return;
        }
        
        // Make sure we're only receiving messages for the chat type we're supposed to see
        const isSupportChat = data.chatId.startsWith('support_');
        const isConsultantChat = data.chatId.startsWith('consultant_');
        
        // Only process messages if:
        // 1. User is admin (can see all chats)
        // 2. User is doctor and message is for consultant chat
        // 3. User is support and message is for support chat
        if (
          userRole === 'admin' || 
          (userRole === 'doctor' && isConsultantChat) || 
          (userRole === 'support' && isSupportChat)
        ) {
          // If the message is for the current chat, add it to messages
          if (selectedChat && data.chatId === selectedChat.chatId) {
            setChatMessages(prev => {
              const isDuplicate = prev.some(msg => 
                (msg._id && msg._id === data._id) || 
                (msg.id && msg.id === data.id) ||
                (msg.content === data.content && 
                 msg.isFromCustomer === data.isFromCustomer &&
                 Math.abs(new Date(msg.timestamp || msg.createdAt) - new Date(data.timestamp || data.createdAt)) < 3000)
              );
              
              if (isDuplicate) {
                return prev;
              }
              
              return [...prev, {
                ...data,
                createdAt: data.timestamp || data.createdAt || new Date()
              }];
            });
            scrollChatToBottom();
            
            // Mark message as read
            markChatMessagesAsRead(data.chatId, true);
          } else {
            // If not in the current chat, mark the conversation as having unread messages
            setConversations(prev => 
              prev.map(conv => 
                conv.chatId === data.chatId 
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
            
            // Also update the filtered conversations for consistent UI
            setFilteredConversations(prev => 
              prev.map(conv => 
                conv.chatId === data.chatId 
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
          }
          
          // Refresh conversations to show updated message
          fetchChatConversations();
        }
      });
      
      // Listen for product recommendations
      socketRef.current.on('product_recommendation', (data) => {
        console.log('Received product recommendation:', data);
        
        // Validate the data
        if (!data || !data.chatId) {
          console.error('Received invalid product recommendation data:', data);
          return;
        }
        
        // Make sure we're only receiving messages for consultant chats
        const isConsultantChat = data.chatId.startsWith('consultant_');
        
        if (!isConsultantChat) {
          return;
        }
        
        // Only process if:
        // 1. User is admin
        // 2. User is doctor 
        // (Support staff should not receive consultant chat messages)
        if (userRole === 'admin' || userRole === 'doctor') {
          // If the recommendation is for the current chat, add it to messages
          if (selectedChat && data.chatId === selectedChat.chatId) {
            setChatMessages(prev => {
              const isDuplicate = prev.some(msg => 
                (msg._id && msg._id === data._id) || 
                (msg.id && msg.id === data.id)
              );
              
              if (isDuplicate) {
                return prev;
              }
              
              return [...prev, {
                ...data,
                createdAt: data.timestamp || data.createdAt || new Date()
              }];
            });
            scrollChatToBottom();
            
            // Mark message as read
            markChatMessagesAsRead(data.chatId, true);
          } else {
            // If not in the current chat, mark the conversation as having unread messages
            setConversations(prev => 
              prev.map(conv => 
                conv.chatId === data.chatId 
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
            
            // Also update the filtered conversations for consistent UI
            setFilteredConversations(prev => 
              prev.map(conv => 
                conv.chatId === data.chatId 
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
          }
          
          // Refresh conversations to show updated message
          fetchChatConversations();
        }
      });
      
      // Load conversations
      fetchChatConversations();
    }
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedChat, navigate, userRole]);

  // Scroll to bottom of chat messages
  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  const scrollChatToBottom = () => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to get the API base URL
  const getApiBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}/api`;
  };

  // Fetch chat conversations - modified to handle admin view
  const fetchChatConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Get conversations from API
      const response = await fetch(`${getApiBaseUrl()}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      console.log('Conversations response:', data);
      
      // All conversations from API
      const allConversations = data.conversations || [];
      
      // Filter conversations based on user role and view mode
      let filteredByRoleConversations;
      
      if (userRole === 'admin') {
        // Admin can see all conversations, but we filter by view mode
        if (chatViewMode === 'all') {
          filteredByRoleConversations = allConversations;
        } else if (chatViewMode === 'consultant') {
          filteredByRoleConversations = allConversations.filter(conv => 
            conv.chatId.startsWith('consultant_')
          );
        } else { // 'support'
          filteredByRoleConversations = allConversations.filter(conv => 
            conv.chatId.startsWith('support_')
          );
        }
      } else if (userRole === 'doctor') {
        // Doctors can only see consultant chats
        filteredByRoleConversations = allConversations.filter(conv => 
          conv.chatId.startsWith('consultant_')
        );
      } else {
        // Support staff can only see support chats
        filteredByRoleConversations = allConversations.filter(conv => 
          conv.chatId.startsWith('support_')
        );
      }
      
      setConversations(filteredByRoleConversations);
      setFilteredConversations(filteredByRoleConversations);
    } catch (error) {
      toast.error('Failed to load conversations: ' + error.message);
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch chat messages for a user
  const fetchChatMessages = async (userId) => {
    try {
      setIsFetchingMessages(true);
      const token = localStorage.getItem('accessToken');
      
      // Add null check for selectedChat
      if (!selectedChat) {
        setIsFetchingMessages(false);
        toast.error('No chat selected');
        return;
      }
      
      // Determine if this is a consultant chat or support chat
      const isSkinCareChat = selectedChat.chatId.startsWith('consultant_');
      
      // Choose the endpoint based on chat type
      const endpoint = isSkinCareChat
        ? `${getApiBaseUrl()}/chat/consultant-messages/${userId}`
        : `${getApiBaseUrl()}/chat/messages/${userId}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setChatMessages(data.messages || []);
      
      // Mark messages as read - use the actual chat ID
      markChatMessagesAsRead(selectedChat.chatId, true);
    } catch (error) {
      toast.error('Failed to load messages: ' + error.message);
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  // Mark chat messages as read
  const markChatMessagesAsRead = async (chatId, isAdmin) => {
    if (!chatId) {
      console.error('Cannot mark messages as read: Invalid chatId');
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      
      await fetch(`${getApiBaseUrl()}/chat/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, isAdmin })
      });
      
      // Update conversation unread count in state
      if (isAdmin) {
        setConversations(prev => 
          prev.map(conv => 
            conv.chatId === chatId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        setFilteredConversations(prev => 
          prev.map(conv => 
            conv.chatId === chatId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send chat message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!selectedChat) {
      toast.error('No chat selected');
      return;
    }
    
    setIsSendingMessage(true);
    try {
      const token = localStorage.getItem('accessToken');
      const userId = selectedChat.userId;
      
      // Determine if this is a consultant chat or support chat
      const isSkinCareChat = selectedChat.chatId.startsWith('consultant_');
      const chatId = selectedChat.chatId;
      
      // Create message object
      const messageData = {
        userId,
        content: chatMessage,
        isFromCustomer: false,
        chatId,
        timestamp: new Date(),
        id: `${userRole}_${Date.now()}`
      };
      
      // Add message to UI immediately
      setChatMessages(prev => [...prev, {
        ...messageData,
        _id: `local_${Date.now()}`,
        createdAt: new Date()
      }]);
      
      // Clear input
      setChatMessage('');
      
      // Emit correct socket event based on chat type
      if (isSkinCareChat) {
        socketRef.current.emit('send_consultant_message', messageData);
      } else {
        socketRef.current.emit('send_message', messageData);
      }
      
      console.log(`Message sent via socket (${isSkinCareChat ? 'consultant' : 'support'} chat)`);
    } catch (error) {
      toast.error('Failed to send message: ' + error.message);
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (conversation) => {
    if (!conversation || !conversation.chatId || !conversation.userId) {
      toast.error('Invalid conversation data');
      return;
    }
    
    // Set the selected chat state
    setSelectedChat(conversation);
    
    // Reset chat messages before fetching new ones
    setChatMessages([]);
    
    // Fetch messages for this conversation
    fetchChatMessages(conversation.userId);
    
    // Mark messages as read
    markChatMessagesAsRead(conversation.chatId, true);
  };

  // Format date for chat
  const formatChatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Support staff logout
  const supportLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Filter conversations when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = conversations.filter(conv => {
      // Access userDetails properly and handle possible undefined values
      const userName = conv.userDetails?.name?.toLowerCase() || '';
      const userEmail = conv.userDetails?.email?.toLowerCase() || '';
      
      // Improved search logic
      return userName.includes(query) || userEmail.includes(query);
    });
    
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  // Delete a conversation
  const handleDeleteConversation = async (e, chatId) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${getApiBaseUrl()}/chat/conversations/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // If the deleted conversation was selected, clear selection
      if (selectedChat && selectedChat.chatId === chatId) {
        setSelectedChat(null);
        setChatMessages([]);
      }
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.chatId !== chatId));
      setFilteredConversations(prev => prev.filter(conv => conv.chatId !== chatId));
      
      toast.success('Conversation deleted successfully');
    } catch (error) {
      toast.error('Failed to delete conversation: ' + error.message);
      console.error('Error deleting conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Search input component
  const SearchInput = () => (
    <div className="relative mb-3">
      <div className="relative flex items-center">
        <FaSearch className="absolute left-3 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 focus:outline-none"
            aria-label="Clear search"
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {filteredConversations.length === 0 
            ? 'No results found' 
            : `Found ${filteredConversations.length} ${filteredConversations.length === 1 ? 'conversation' : 'conversations'}`
          }
        </div>
      )}
    </div>
  );

  // Get the title based on user role
  const getDashboardTitle = () => {
    return userRole === 'doctor' ? 'Skincare Consultant Dashboard' : 'Customer Support Dashboard';
  };

  // Get the icon based on user role
  const getConversationIcon = () => {
    return userRole === 'doctor' ? <FaUserMd /> : <FaComments />;
  };

  // Get the primary color for the dashboard based on role
  const getPrimaryColor = () => {
    return userRole === 'doctor' ? 'from-teal-500 to-teal-700' : 'from-blue-600 to-blue-700';
  };

  // @desc    Get all active chat conversations (for admin)
  // Inside the SupportDashboard component, add a debug log to check conversation data
  useEffect(() => {
    if (conversations.length > 0) {
      console.log('First conversation data:', conversations[0]);
    }
  }, [conversations]);

  // Handle product recommendation
  const handleRecommendProduct = (recommendationData) => {
    if (!socketRef.current) return;
    
    try {
      // Send product recommendation via socket
      socketRef.current.emit('send_product_recommendation', recommendationData);
      toast.success('Product recommendation sent!');
    } catch (error) {
      console.error('Error sending product recommendation:', error);
      toast.error('Failed to send product recommendation');
    }
  };

  // Rendered product recommendation modal
  const renderProductRecommendation = () => {
    if (!showProductRecommendation || !selectedChat) return null;
    
    return (
      <ProductRecommendation 
        onRecommend={handleRecommendProduct}
        onCancel={() => setShowProductRecommendation(false)}
        userId={selectedChat.userId}
      />
    );
  };

  // Handle changing the chat view mode (for admins)
  const handleChatViewModeChange = (mode) => {
    setChatViewMode(mode);
    // Clear selected chat when switching modes
    setSelectedChat(null);
    setChatMessages([]);
    // Fetch conversations with the new filter
    fetchChatConversations();
  };

  // Get chat type label
  const getChatTypeLabel = (chatId) => {
    if (chatId?.startsWith('consultant_')) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
          Skincare
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Support
      </span>
    );
  };

  // Render chat filter tabs for admin
  const renderChatFilterTabs = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => handleChatViewModeChange('all')}
          className={`px-3 py-1 text-xs rounded-lg ${
            chatViewMode === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All Chats
        </button>
        <button
          onClick={() => handleChatViewModeChange('support')}
          className={`px-3 py-1 text-xs rounded-lg ${
            chatViewMode === 'support'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Support
        </button>
        <button
          onClick={() => handleChatViewModeChange('consultant')}
          className={`px-3 py-1 text-xs rounded-lg ${
            chatViewMode === 'consultant'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Skincare
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'Admin Dashboard' : getDashboardTitle()}
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={supportLogout}
            className={`px-4 py-2 bg-gradient-to-r ${userRole === 'doctor' ? 'from-red-600 to-red-700' : 'from-red-600 to-red-700'} hover:from-red-700 hover:to-red-600 text-white rounded-lg shadow-lg flex items-center space-x-2`}
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span>Logout</span>
          </motion.button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden min-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Conversations List */}
            <div className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {isAdmin 
                    ? chatViewMode === 'all' 
                      ? 'All Conversations' 
                      : chatViewMode === 'consultant' 
                        ? 'Skincare Consultations' 
                        : 'Customer Support' 
                    : userRole === 'doctor' 
                      ? 'Patient Consultations' 
                      : 'Customer Conversations'}
                </h2>
                
                {/* Admin filter tabs */}
                {renderChatFilterTabs()}
                
                {/* Search input */}
                <SearchInput />
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={fetchChatConversations}
                    className={`text-${userRole === 'doctor' ? 'teal' : 'primary'}-500 hover:text-${userRole === 'doctor' ? 'teal' : 'primary'}-700 text-sm flex items-center gap-1`}
                  >
                    <span>Refresh List</span>
                  </button>
                  <span className="text-xs text-gray-500">
                    {conversations.length} total
                  </span>
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(70vh-150px)]">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No matching conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.chatId}
                      onClick={() => handleChatSelect(conversation)}
                      className={`relative p-4 flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                        selectedChat?.chatId === conversation.chatId
                          ? conversation.chatId.startsWith('consultant_')
                            ? 'bg-teal-500/10 dark:bg-teal-500/20'
                            : 'bg-primary/10 dark:bg-primary/20'
                          : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div className={`h-10 w-10 rounded-full ${
                          conversation.chatId.startsWith('consultant_')
                            ? 'bg-teal-500/20 text-teal-500' 
                            : 'bg-primary/20 text-primary'
                        } flex items-center justify-center`}>
                          {conversation.chatId.startsWith('consultant_') ? <FaUserMd /> : <FaComments />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conversation.userDetails?.name || 'Anonymous User'}
                          </p>
                          {/* Show chat type label for admin */}
                          {isAdmin && chatViewMode === 'all' && getChatTypeLabel(conversation.chatId)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatChatDate(conversation.lastMessageAt)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white ${
                            conversation.chatId.startsWith('consultant_') ? 'bg-teal-500' : 'bg-primary'
                          } rounded-full`}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Delete button */}
                      <button 
                        onClick={(e) => handleDeleteConversation(e, conversation.chatId)}
                        disabled={isDeleting}
                        className="absolute top-0 right-0 m-2 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Delete conversation"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col h-[70vh]">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full ${
                        selectedChat.chatId.startsWith('consultant_')
                          ? 'bg-teal-500/20 text-teal-500' 
                          : 'bg-primary/20 text-primary'
                      } flex items-center justify-center mr-3`}>
                        {selectedChat.chatId.startsWith('consultant_') ? <FaUserMd /> : <FaComments />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat.userDetails?.name || 'Anonymous User'}
                          </h3>
                          {/* Always show chat type label in the header */}
                          {getChatTypeLabel(selectedChat.chatId)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedChat.userDetails?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteConversation(e, selectedChat.chatId)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1"
                      title="Delete conversation"
                    >
                      <FaTrash className="h-4 w-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                  
                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {isFetchingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <FaSpinner className={`animate-spin h-8 w-8 ${
                          selectedChat.chatId.startsWith('consultant_') ? 'text-teal-500' : 'text-primary'
                        }`} />
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`flex ${msg.isFromCustomer ? 'justify-start' : 'justify-end'} mb-4`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.isFromCustomer
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                : selectedChat.chatId.startsWith('consultant_')
                                  ? 'bg-teal-500 text-white rounded-br-none'
                                  : 'bg-primary text-white rounded-br-none'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            
                            {/* Product recommendation */}
                            {msg.productRecommendation && (
                              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="flex items-start space-x-3">
                                  {msg.productRecommendation.image ? (
                                    <div className="relative flex-shrink-0">
                                      <img 
                                        src={msg.productRecommendation.image} 
                                        alt={msg.productRecommendation.name}
                                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                        onError={(e) => {
                                          console.error('Image failed to load:', e);
                                          e.target.src = '/images/default-product.jpg';
                                        }}
                                      />
                                      <Link 
                                        to={`/product/${msg.productRecommendation._id}`}
                                        className="absolute -bottom-2 -right-2 bg-teal-500 hover:bg-teal-600 text-white p-1.5 rounded-full shadow-md"
                                        title="View product"
                                      >
                                        <FaShoppingCart className="h-3 w-3" />
                                      </Link>
                                    </div>
                                  ) : (
                                    <div className="relative w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                      <FaShoppingCart className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                                      <Link 
                                        to={`/product/${msg.productRecommendation._id}`}
                                        className="absolute -bottom-2 -right-2 bg-teal-500 hover:bg-teal-600 text-white p-1.5 rounded-full shadow-md"
                                        title="View product"
                                      >
                                        <FaShoppingCart className="h-3 w-3" />
                                      </Link>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                      {msg.productRecommendation.name}
                                    </h4>
                                    <div className="flex items-center mt-1">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        EGP {msg.productRecommendation.price}
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
                                      className="mt-2 inline-flex items-center text-xs font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
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
                            
                            <span className="text-xs opacity-70 mt-1 block">
                              {formatChatDate(msg.createdAt || msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>
                  
                  {/* Input Area - Modified to conditionally show product recommendation button */}
                  <form onSubmit={handleSendChatMessage} className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      {/* Show product recommendation button for doctors or admin in consultant chat */}
                      {(userRole === 'doctor' || (isAdmin && selectedChat?.chatId.startsWith('consultant_'))) && (
                        <button
                          type="button"
                          onClick={() => setShowProductRecommendation(true)}
                          className="p-2 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-800 dark:text-teal-200 dark:hover:bg-teal-700 transition-colors"
                          title="Recommend a product"
                        >
                          <FaBoxOpen className="w-5 h-5" />
                        </button>
                      )}
                      
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={isSendingMessage}
                        placeholder={selectedChat?.chatId.startsWith('consultant_') 
                          ? "Type your skincare advice..." 
                          : "Type your message..."}
                        className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                          selectedChat?.chatId.startsWith('consultant_') ? 'focus:ring-teal-500' : 'focus:ring-primary'
                        }`}
                      />
                      <motion.button
                        type="submit"
                        disabled={isSendingMessage || !chatMessage.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg ${
                          isSendingMessage || !chatMessage.trim()
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                            : selectedChat?.chatId.startsWith('consultant_')
                              ? 'bg-teal-500 hover:bg-teal-600'
                              : 'bg-primary hover:bg-primary-dark'
                        } text-white`}
                      >
                        {isSendingMessage ? (
                          <FaSpinner className="animate-spin w-5 h-5" />
                        ) : (
                          <FaPaperPlane className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  {userRole === 'admin' ? (
                    <>
                      <div className="flex items-center space-x-4 mb-4">
                        <FaComments className="w-12 h-12 text-blue-300 dark:text-blue-600" />
                        <FaUserMd className="w-12 h-12 text-teal-300 dark:text-teal-600" />
                      </div>
                      <p>Select a conversation to start chatting</p>
                      {!filteredConversations.length && (
                        <p className="mt-2 text-sm">No conversations available</p>
                      )}
                    </>
                  ) : userRole === 'doctor' ? (
                    <>
                      <FaUserMd className="w-16 h-16 mb-4 text-teal-300 dark:text-teal-600" />
                      <p>Select a conversation to start chatting</p>
                    </>
                  ) : (
                    <>
                      <FaComments className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Select a conversation to start chatting</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Render the product recommendation modal */}
      {renderProductRecommendation()}
    </div>
  );
};

export default SupportDashboard; 
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaSpinner, FaPaperPlane, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const ChatTab = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const socketRef = useRef(null);
  const chatMessagesEndRef = useRef(null);
  
  // Socket.io connection for admin
  useEffect(() => {
    if (!socketRef.current) {
      const token = localStorage.getItem('adminToken');
      
      // Initialize socket
      socketRef.current = io('http://localhost:5000');
      
      // Join admin support room
      socketRef.current.emit('join_admin_support');
      
      // Listen for incoming messages
      socketRef.current.on('receive_message', (data) => {
        // If the message is for the current chat, add it to messages
        if (selectedChat && data.chatId === `support_${selectedChat.userId}`) {
          setChatMessages(prev => [...prev, data]);
          scrollChatToBottom();
          
          // Mark message as read
          markChatMessagesAsRead(data.chatId, true);
        } else {
          // If not in the current chat, mark the conversation as having unread messages
          setConversations(prev => {
            const updated = prev.map(conv => 
              conv.chatId === data.chatId 
                ? { ...conv, unreadCount: conv.unreadCount + 1 }
                : conv
            );
            
            // Update filtered conversations too
            filterConversations(updated, searchTerm);
            return updated;
          });
        }
      });
      
      // Load conversations
      fetchChatConversations();
    }
    
    // Cleanup on unmount or when changing tabs
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedChat]);

  // Filter conversations when search term changes
  useEffect(() => {
    filterConversations(conversations, searchTerm);
  }, [searchTerm, conversations]);

  // Filter conversations by name or email
  const filterConversations = (conversationsToFilter, term) => {
    if (!term) {
      setFilteredConversations(conversationsToFilter);
      return;
    }

    const filtered = conversationsToFilter.filter(conversation => {
      const userDetail = conversation.userDetails?.[0];
      
      if (!userDetail) return false;
      
      const name = userDetail.name?.toLowerCase() || '';
      const email = userDetail.email?.toLowerCase() || '';
      const searchLower = term.toLowerCase();
      
      return name.includes(searchLower) || email.includes(searchLower);
    });
    
    setFilteredConversations(filtered);
  };

  // Scroll to bottom of chat messages
  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  const scrollChatToBottom = () => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch chat conversations
  const fetchChatConversations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      console.log('Conversations data:', data); // Log the data to see its structure
      
      // Process the conversations to ensure they have proper user details
      const conversationsData = (data.conversations || []).map(conversation => {
        // Log each conversation to inspect structure
        console.log('Conversation:', conversation);
        
        // Format the user details to be consistent
        // The API might be returning userDetails as an object, not an array
        let formattedUserDetails = [];
        
        if (conversation.userDetails) {
          // If it's already in the expected format, use it
          formattedUserDetails = Array.isArray(conversation.userDetails) 
            ? conversation.userDetails 
            : [conversation.userDetails]; // Convert object to array with single item
        }
        
        return {
          ...conversation,
          // Ensure userDetails exists as an array
          userDetails: formattedUserDetails
        };
      });
      
      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
    } catch (error) {
      toast.error('Failed to load conversations: ' + error.message);
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch chat messages for a user
  const fetchChatMessages = async (userId) => {
    try {
      setIsFetchingMessages(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('Fetching messages for user ID:', userId);
      
      const response = await fetch(`http://localhost:5000/api/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      console.log('Chat messages response:', data);
      
      setChatMessages(data.messages || []);
      
      // Mark messages as read
      markChatMessagesAsRead(`support_${userId}`, true);
    } catch (error) {
      toast.error('Failed to load messages: ' + error.message);
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  // Mark chat messages as read
  const markChatMessagesAsRead = async (chatId, isAdmin) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await fetch('http://localhost:5000/api/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, isAdmin })
      });
      
      // Update conversation unread count in state
      if (isAdmin) {
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv.chatId === chatId 
              ? { ...conv, unreadCount: 0 }
              : conv
          );
          
          // Update filtered conversations too
          filterConversations(updated, searchTerm);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      console.log('Fetching user details for ID:', userId);
      
      // First try the specific user endpoint
      let response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If that fails, try the profile endpoint
      if (!response.ok) {
        console.log('Direct user endpoint failed, trying profile endpoint');
        response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (!response.ok) {
        // Try yet another possible endpoint format
        console.log('Profile endpoint failed, trying admin user endpoint');
        response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (!response.ok) {
        console.warn(`Could not fetch details for user ${userId}`);
        return null;
      }
      
      const data = await response.json();
      console.log('User details response:', data);
      
      // The user data could be in various formats depending on the endpoint
      const userData = data.user || data || {};
      
      // Return a standardized user object
      return {
        _id: userData._id || userId,
        name: userData.name || `User ${userId.substring(0, 8)}...`,
        email: userData.email || `ID: ${userId}`,
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {
        _id: userId,
        name: `User ${userId.substring(0, 8)}...`,
        email: `ID: ${userId}`
      };
    }
  };

  // Send chat message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChat) return;
    
    setIsSendingMessage(true);
    try {
      const token = localStorage.getItem('adminToken');
      const userId = selectedChat.userId;
      const chatId = `support_${userId}`;
      
      // Create message object
      const messageData = {
        userId,
        content: chatMessage,
        isFromCustomer: false,
        chatId,
        timestamp: new Date(),
        id: `admin_${Date.now()}`
      };
      
      // Add message to UI immediately
      setChatMessages(prev => [...prev, {
        ...messageData,
        _id: `local_${Date.now()}`,
        createdAt: new Date()
      }]);
      
      // Clear input
      setChatMessage('');
      
      // Emit socket event
      socketRef.current.emit('send_message', messageData);
      
      // No need to save to database separately - socket.io server handles it now
      console.log('Message sent via socket, server will save to database');
    } catch (error) {
      toast.error('Failed to send message: ' + error.message);
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (conversation) => {
    setSelectedChat(conversation);
    fetchChatMessages(conversation.userId);
    
    // Mark messages as read
    markChatMessagesAsRead(conversation.chatId, true);
    
    // Try to fetch more detailed user information
    try {
      // Check if we already have complete user details
      const hasCompleteDetails = 
        conversation.userDetails?.[0]?.name && 
        conversation.userDetails?.[0]?.email;
      
      if (!hasCompleteDetails) {
        const userDetails = await fetchUserDetails(conversation.userId);
        
        if (userDetails) {
          // Update the selected chat with more complete user information
          setSelectedChat(prev => ({
            ...prev,
            userDetails: [userDetails]
          }));
          
          // Also update the conversation in the conversations list
          setConversations(prev => {
            const updated = prev.map(conv => 
              conv.chatId === conversation.chatId 
                ? { ...conv, userDetails: [userDetails] }
                : conv
            );
            
            // Update filtered conversations too
            filterConversations(updated, searchTerm);
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error enhancing user details:', error);
    }
  };

  // Format date for chat
  const formatChatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden min-h-[70vh]">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Conversations List */}
        <div className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">Customer Conversations</h2>
            
            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or email"
                className="pl-10 pr-10 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(70vh-110px)]">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchTerm ? "No matches found" : "No conversations yet"}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.chatId}
                  onClick={() => handleChatSelect(conversation)}
                  className={`p-4 flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                    selectedChat?.chatId === conversation.chatId
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <FaComments className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {/* Try various ways to get the user name */}
                      {(conversation.userDetails?.[0]?.name) || 
                       (conversation.userDetails?.name) ||
                       (conversation.user?.name) || 
                       (conversation.userName) || 
                       conversation.name ||
                       `User ${conversation.userId.substring(0, 8)}...`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {/* Try various ways to get the user email */}
                      {(conversation.userDetails?.[0]?.email) || 
                       (conversation.userDetails?.email) ||
                       (conversation.user?.email) || 
                       (conversation.userEmail) || 
                       conversation.email ||
                       `ID: ${conversation.userId}`}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="ml-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </div>
                  )}
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <FaComments className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {/* Try various ways to get the user name */}
                    {(selectedChat.userDetails?.[0]?.name) || 
                     (selectedChat.userDetails?.name) ||
                     (selectedChat.user?.name) || 
                     (selectedChat.userName) || 
                     selectedChat.name ||
                     `User ${selectedChat.userId.substring(0, 8)}...`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {/* Try various ways to get the user email */}
                    {(selectedChat.userDetails?.[0]?.email) || 
                     (selectedChat.userDetails?.email) ||
                     (selectedChat.user?.email) || 
                     (selectedChat.userEmail) || 
                     selectedChat.email ||
                     `ID: ${selectedChat.userId}`}
                  </p>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {isFetchingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <FaSpinner className="animate-spin h-8 w-8 text-primary" />
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
                            : 'bg-primary text-white rounded-br-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatChatDate(msg.createdAt || msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatMessagesEndRef} />
              </div>
              
              {/* Input Area */}
              <form onSubmit={handleSendChatMessage} className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={isSendingMessage}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSendingMessage || !chatMessage.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg ${
                      isSendingMessage || !chatMessage.trim()
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
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
              <FaComments className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab; 
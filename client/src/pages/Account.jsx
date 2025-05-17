import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaMapMarkerAlt, FaHistory, FaShieldAlt, FaEdit, FaPlus, FaTrash, FaTimes, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Complete list of Egyptian governorates
const egyptianGovernorates = [
  { id: 'alexandria', name: 'Alexandria' },
  { id: 'aswan', name: 'Aswan' },
  { id: 'asyut', name: 'Asyut' },
  { id: 'beheira', name: 'Beheira' },
  { id: 'beni_suef', name: 'Beni Suef' },
  { id: 'cairo', name: 'Cairo' },
  { id: 'dakahlia', name: 'Dakahlia' },
  { id: 'damietta', name: 'Damietta' },
  { id: 'faiyum', name: 'Faiyum' },
  { id: 'gharbia', name: 'Gharbia' },
  { id: 'giza', name: 'Giza' },
  { id: 'ismailia', name: 'Ismailia' },
  { id: 'kafr_el_sheikh', name: 'Kafr El Sheikh' },
  { id: 'luxor', name: 'Luxor' },
  { id: 'matrouh', name: 'Matrouh' },
  { id: 'minya', name: 'Minya' },
  { id: 'monufia', name: 'Monufia' },
  { id: 'new_valley', name: 'New Valley (El Wadi El Gedid)' },
  { id: 'north_sinai', name: 'North Sinai' },
  { id: 'port_said', name: 'Port Said' },
  { id: 'qalyubia', name: 'Qalyubia' },
  { id: 'qena', name: 'Qena' },
  { id: 'red_sea', name: 'Red Sea' },
  { id: 'sharqia', name: 'Sharqia' },
  { id: 'sohag', name: 'Sohag' },
  { id: 'south_sinai', name: 'South Sinai' },
  { id: 'suez', name: 'Suez' }
];

const Modal = ({ isOpen, onClose, title, children, wide = false }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} my-8 relative`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const Account = () => {
  const { 
    user, 
    updateUser, 
    token, 
    updatePassword, 
    getLoginHistory, 
    clearLoginHistory,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getUserOrders,
    cancelOrder
  } = useAuth();
  
  console.log('Account component user data:', user); // Debug log
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  });

  // Modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form states
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    governorate: 'gharbia', // Changed from state to governorate with default value
    postalCode: '',
    isDefault: false,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Data states
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order history states
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 5
  });

  // Login history state
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [loginHistoryError, setLoginHistoryError] = useState(null);
  const [loginHistoryPage, setLoginHistoryPage] = useState(1);
  const [loginHistoryPagination, setLoginHistoryPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API calls
        // const [addressesRes, ordersRes] = await Promise.all([
        //   fetch('/api/user/addresses'),
        //   fetch('/api/user/orders')
        // ]);
        
        // const addressesData = await addressesRes.json();
        // const ordersData = await ordersRes.json();
        
        // setAddresses(addressesData);
        // setOrderHistory(ordersData);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      console.log('Updating form data with user:', user); // Debug log
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  // Fetch addresses when the addresses tab is selected
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, ordersPage]);

  // Function to fetch addresses
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);
      
      const addressList = await getAddresses();
      setAddresses(addressList);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setAddressesError(err.message || 'Failed to load addresses');
      toast.error('Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Validate form
      if (!addressForm.street || !addressForm.city || !addressForm.governorate || !addressForm.postalCode) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      await addAddress(addressForm);
      
      // Reset form
      setAddressForm({
        street: '',
        city: '',
        governorate: 'gharbia',
        postalCode: '',
        isDefault: false,
      });
      
      // Close modal and refresh addresses
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error adding address:', err);
      toast.error(err.message || 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Validate form
      if (!addressForm.street || !addressForm.city || !addressForm.governorate || !addressForm.postalCode) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      await updateAddress(editingAddressId, addressForm);
      
      // Reset form and state
      setAddressForm({
        street: '',
        city: '',
        governorate: 'gharbia',
        postalCode: '',
        isDefault: false,
      });
      setEditingAddressId(null);
      
      // Close modal and refresh addresses
      setIsEditAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error(err.message || 'Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      // First confirm with user
      if (!window.confirm('Are you sure you want to delete this address?')) {
        return;
      }
      
      setIsLoading(true);
      console.log(`Attempting to delete address with ID: ${addressId}`);
      
      try {
        await deleteAddress(addressId);
        toast.success('Address deleted successfully');
        // Refresh the addresses list
        await fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        // Show a more detailed error message
        if (error.message) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error('Failed to delete address. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Error in handleDeleteAddress:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditAddressModal = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      street: address.street,
      city: address.city,
      governorate: address.governorate || 'gharbia',
      postalCode: address.postalCode,
      isDefault: address.isDefault || false,
    });
    setIsEditAddressModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate name length
      if (!formData.name || formData.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters long');
        return;
      }
      
      if (formData.name.trim().length > 50) {
        toast.error('Name cannot exceed 50 characters');
        return;
      }
      
      // Validate mobile number format (Egyptian mobile number)
      const mobileRegex = /^01[0125][0-9]{8}$/;
      if (!mobileRegex.test(formData.mobile)) {
        toast.error('Please enter a valid Egyptian mobile number (e.g., 01012345678)');
        return;
      }
      
      setIsLoading(true);
      console.log('Updating profile with data:', formData); // Debug log
      
      // Only send name and mobile fields to the backend
      const updateData = {
        name: formData.name.trim(),
        mobile: formData.mobile
      };
      
      await updateUser(updateData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      toast.error('Password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      
      // Reset form fields
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsPasswordModalOpen(false);
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error('Password update error in component:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'addresses', label: 'Addresses', icon: FaMapMarkerAlt },
    { id: 'orders', label: 'Order History', icon: FaHistory },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
  ];

  // Fetch login history when the modal is opened
  useEffect(() => {
    if (isLoginHistoryModalOpen) {
      fetchLoginHistory();
    }
  }, [isLoginHistoryModalOpen, loginHistoryPage]);

  // Function to fetch login history
  const fetchLoginHistory = async () => {
    try {
      setLoginHistoryLoading(true);
      setLoginHistoryError(null);
      
      const result = await getLoginHistory(loginHistoryPage, 10);
      
      setLoginHistory(result.data);
      setLoginHistoryPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching login history:', err);
      setLoginHistoryError(err.message || 'Failed to load login history');
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  // Function to handle clearing login history
  const handleClearLoginHistory = async () => {
    try {
      setLoginHistoryLoading(true);
      
      await clearLoginHistory();
      
      // After clearing, fetch updated (empty) history
      fetchLoginHistory();
    } catch (err) {
      console.error('Error clearing login history:', err);
      toast.error(err.message || 'Failed to clear login history');
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      
      const result = await getUserOrders(ordersPage, 5);
      setOrderHistory(result.data);
      setOrdersPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Function to view order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to display status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20";
      case 'processing':
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
      case 'shipped':
        return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20";
      case 'delivered':
        return "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20";
      case 'cancelled':
        return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20";
      default:
        return "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-500/20";
    }
  };

  // Function to handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await cancelOrder(orderId);
      setIsOrderDetailModalOpen(false);
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
            {/* Sidebar */}
            <div className="bg-gray-100 dark:bg-gray-900 p-6 space-y-2">
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary to-primary-dark dark:from-primary dark:to-primary-dark text-white shadow-lg shadow-primary/25'
                      : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-400'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="col-span-3 p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Profile Information
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
                      >
                        <FaEdit className="h-4 w-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Email address cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="01012345678"
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                        {isEditing && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Format: 01X followed by 8 digits (e.g., 01012345678)
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveProfile}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
                        >
                          Save Changes
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Shipping Addresses
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAddressModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
                      >
                        <FaPlus className="h-4 w-4" />
                        <span>Add Address</span>
                      </motion.button>
                    </div>

                    {addressesError && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">
                        {addressesError}
                      </div>
                    )}
                    
                    {addressesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No addresses found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add an address to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <motion.div
                            key={address._id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative group hover:shadow-lg transition-all duration-200"
                          >
                            {address.isDefault && (
                              <span className="absolute top-4 right-4 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20 flex items-center gap-1">
                                <FaCheck className="w-3 h-3" />
                                Default
                              </span>
                            )}
                            <div className="space-y-2 mb-10">
                              <p className="text-gray-600 dark:text-gray-300 font-medium">
                                {address.street}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300">
                                {address.city}, {egyptianGovernorates.find(g => g.id === address.governorate)?.name || address.governorate}, Egypt
                              </p>
                              {address.postalCode && (
                                <p className="text-gray-600 dark:text-gray-300">
                                  Postal Code: {address.postalCode}
                                </p>
                              )}
                            </div>
                            <div className="absolute bottom-4 right-4 flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditAddressModal(address)}
                                className="text-gray-500 hover:text-primary-dark dark:hover:text-primary-light"
                              >
                                <FaEdit className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <FaTrash className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Order History
                      </h2>
                    </div>

                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-16">
                        <p className="text-gray-600 dark:text-gray-400">{ordersError}</p>
                        <button 
                          onClick={() => fetchOrders()} 
                          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : orderHistory.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-flex mx-auto mb-4">
                          <FaHistory className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
                        <a 
                          href="/shop"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
                        >
                          Start Shopping
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderHistory.map(order => (
                          <motion.div
                            key={order._id}
                            whileHover={{ scale: 1.01 }}
                            className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  Order #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {formatDate(order.createdAt)}
                                </p>
                                <p className={`text-sm px-2.5 py-0.5 rounded-lg border ${getStatusBadge(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {order.totalAmount.toFixed(2)} EGP
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {order.orderItems.length} item(s)
                                </p>
                                <button
                                  onClick={() => viewOrderDetails(order)}
                                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-primary text-primary text-sm rounded-md hover:bg-primary-lightest dark:hover:bg-primary/10"
                                >
                                  <FaEye className="mr-1.5 h-3.5 w-3.5" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Pagination */}
                        {ordersPagination.pages > 1 && (
                          <div className="flex justify-center mt-6">
                            <nav className="flex items-center space-x-2">
                              <button
                                onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                                disabled={ordersPage === 1}
                                className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              
                              {Array.from({ length: ordersPagination.pages }, (_, i) => i + 1).map(page => (
                                <button
                                  key={page}
                                  onClick={() => setOrdersPage(page)}
                                  className={`px-3 py-1 rounded-md ${
                                    ordersPage === page
                                      ? 'bg-primary text-white'
                                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                              
                              <button
                                onClick={() => setOrdersPage(prev => Math.min(prev + 1, ordersPagination.pages))}
                                disabled={ordersPage === ordersPagination.pages}
                                className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </nav>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Security Settings
                    </h2>
                    
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                        onClick={() => setIsPasswordModalOpen(true)}
                      >
                        <span className="text-gray-900 dark:text-gray-100">Change Password</span>
                        <FaEdit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                        onClick={() => setIsLoginHistoryModalOpen(true)}
                      >
                        <span className="text-gray-900 dark:text-gray-100">Login History</span>
                        <FaHistory className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          title="Add New Address"
        >
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressFormChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressFormChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Governorate
                </label>
                <select
                  name="governorate"
                  value={addressForm.governorate}
                  onChange={handleAddressFormChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {egyptianGovernorates.map((governorate) => (
                    <option key={governorate.id} value={governorate.id}>
                      {governorate.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleAddressFormChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressFormChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Set as default address
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto"></div>
                ) : "Add Address"}
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Address Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isEditAddressModalOpen}
          onClose={() => setIsEditAddressModalOpen(false)}
          title="Edit Address"
        >
          <form onSubmit={handleEditAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressFormChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressFormChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Governorate
                </label>
                <select
                  name="governorate"
                  value={addressForm.governorate}
                  onChange={handleAddressFormChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {egyptianGovernorates.map((governorate) => (
                    <option key={governorate.id} value={governorate.id}>
                      {governorate.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleAddressFormChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressFormChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Set as default address
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditAddressModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto"></div>
                ) : "Update Address"}
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Change Password"
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showNewPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {passwordForm.newPassword && (
              <div className="mt-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
                  <span className="text-xs font-medium">
                    {passwordStrength === 0 && "Very weak"}
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Good"}
                    {passwordStrength === 4 && "Strong"}
                    {passwordStrength === 5 && "Very strong"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      passwordStrength <= 1 ? 'bg-red-500' :
                      passwordStrength === 2 ? 'bg-orange-500' :
                      passwordStrength === 3 ? 'bg-yellow-500' :
                      passwordStrength === 4 ? 'bg-green-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
              >
                Change Password
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Login History Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isLoginHistoryModalOpen}
          onClose={() => setIsLoginHistoryModalOpen(false)}
          title="Login History"
        >
          <div className="space-y-4 max-h-[80vh] overflow-hidden flex flex-col">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a list of devices that have logged into your account. If you see any unfamiliar activity, please change your password immediately.
            </p>
            
            {loginHistoryError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">
                {loginHistoryError}
              </div>
            )}
            
            {loginHistoryLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No login history found
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(80vh-200px)] custom-scrollbar">
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  {loginHistory.map((session, index) => (
                    <div 
                      key={session._id}
                      className={`p-4 ${
                        index !== loginHistory.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                      } ${
                        session.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800'
                      } transition-colors hover:bg-gray-50 dark:hover:bg-gray-750`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            session.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {session.device}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(new Date(session.createdAt))}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>IP: {session.ipAddress}</div>
                          <div>{session.location}</div>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === 'success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {session.status === 'success' ? 'Successful login' : 'Failed login attempt'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {loginHistoryPagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <button
                  onClick={() => setLoginHistoryPage(prev => Math.max(1, prev - 1))}
                  disabled={loginHistoryPage === 1 || loginHistoryLoading}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light">
                  {loginHistoryPage} of {loginHistoryPagination.pages}
                </span>
                <button
                  onClick={() => setLoginHistoryPage(prev => Math.min(loginHistoryPagination.pages, prev + 1))}
                  disabled={loginHistoryPage === loginHistoryPagination.pages || loginHistoryLoading}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
            
            <div className="flex justify-between mt-auto pt-4">
              <button
                type="button"
                onClick={handleClearLoginHistory}
                disabled={loginHistoryLoading || loginHistory.length === 0}
                className="px-4 py-2 rounded-xl text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear History
              </button>
              
              <button
                type="button"
                onClick={() => setIsLoginHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        <Modal
          isOpen={isOrderDetailModalOpen}
          onClose={() => setIsOrderDetailModalOpen(false)}
          title="Order Details"
          wide={true}
        >
          {selectedOrder && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-lg mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className={`text-sm px-2.5 py-0.5 rounded-lg border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Placed on: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              
              {/* Order Tracking Timeline */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Order Timeline
                </h4>
                
                {selectedOrder.status === 'cancelled' ? (
                  <div className="relative">
                    {/* Timeline track for cancelled order */}
                    <div className="absolute h-full w-0.5 bg-red-200 dark:bg-red-700/50 left-2.5 top-0"></div>
                    
                    {/* Placed then cancelled */}
                    <div className="space-y-6 relative">
                      <div className="flex items-start space-x-3 opacity-100">
                        <div className="h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 bg-primary">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Order Placed</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedOrder.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Your order was received
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 opacity-100">
                        <div className="h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 bg-red-500">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Order Cancelled</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedOrder.cancelledDate ? formatDate(selectedOrder.cancelledDate) : formatDate(selectedOrder.updatedAt)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This order has been cancelled
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline track for active orders */}
                    <div className="absolute h-full w-0.5 bg-gray-200 dark:bg-gray-700 left-2.5 top-0"></div>
                    
                    {/* Timeline steps - only for non-cancelled orders */}
                    <div className="space-y-6 relative">
                      {/* Placed */}
                      <div className="flex items-start space-x-3 opacity-100">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 ${
                          ['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                            ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Order Placed</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedOrder.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Your order has been received and is being processed
                          </p>
                        </div>
                      </div>
                      
                      {/* Processing */}
                      <div className={`flex items-start space-x-3 ${
                        ['processing', 'shipped', 'delivered'].includes(selectedOrder.status) 
                          ? 'opacity-100' : 'opacity-50'
                      }`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 ${
                          ['processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                            ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Processing</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {['processing', 'shipped', 'delivered'].includes(selectedOrder.status) 
                              ? (selectedOrder.processingDate ? formatDate(selectedOrder.processingDate) : formatDate(selectedOrder.updatedAt))
                              : 'Pending'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {['processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'Your order is being prepared for shipping'
                              : 'Waiting to be processed'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Shipped */}
                      <div className={`flex items-start space-x-3 ${
                        ['shipped', 'delivered'].includes(selectedOrder.status) 
                          ? 'opacity-100' : 'opacity-50'
                      }`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 ${
                          ['shipped', 'delivered'].includes(selectedOrder.status)
                            ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Shipped</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {['shipped', 'delivered'].includes(selectedOrder.status)
                              ? (selectedOrder.shippedDate ? formatDate(selectedOrder.shippedDate) : formatDate(selectedOrder.updatedAt))
                              : 'Pending'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {['shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'Your order is on the way to you'
                              : 'Waiting to be shipped'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delivered */}
                      <div className={`flex items-start space-x-3 ${
                        ['delivered'].includes(selectedOrder.status) 
                          ? 'opacity-100' : 'opacity-50'
                      }`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center z-10 mt-0.5 ${
                          ['delivered'].includes(selectedOrder.status)
                            ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Delivered</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {['delivered'].includes(selectedOrder.status)
                              ? (selectedOrder.deliveredDate ? formatDate(selectedOrder.deliveredDate) : formatDate(selectedOrder.updatedAt))
                              : 'Pending'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {['delivered'].includes(selectedOrder.status)
                              ? 'Your order has been delivered successfully'
                              : 'Waiting to be delivered'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Order Items
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded-md border border-gray-100 dark:border-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.quantity} × {item.discountedPrice.toFixed(2)} EGP
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(item.quantity * item.discountedPrice).toFixed(2)} EGP
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Shipping Address
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 h-full">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOrder.shippingAddress.governorate}, Egypt
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Order Summary
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 h-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white text-sm">{selectedOrder.itemsTotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Shipping:</span>
                      <span className="text-gray-900 dark:text-white text-sm">{selectedOrder.shippingFee.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-primary">{selectedOrder.totalAmount.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-start mb-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delivery Details</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedOrder.estimatedDeliveryTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Method</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Cash on Delivery
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Cancel order button - only show for pending orders */}
              {selectedOrder.status === 'pending' && (
                <div className="pt-2">
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    You can only cancel orders that haven't been processed yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
};

// Helper function to format time
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString();
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHr > 0) {
    return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export default Account; 
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBox, FaTruck, FaMoneyBillWave, FaCheck, FaArrowLeft, FaWarehouse, FaPencilAlt, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Egyptian governorates grouped by region for shipping purposes
const governorateRegions = {
  delta: ['gharbia', 'dakahlia', 'kafr_el_sheikh', 'damietta', 'monufia', 'beheira'],
  canal: ['suez', 'ismailia', 'port_said', 'north_sinai', 'south_sinai', 'red_sea'],
  cairo: ['cairo', 'giza', 'qalyubia', 'sharqia'],
  alexandria: ['alexandria', 'matrouh'],
  upperEgypt: ['aswan', 'asyut', 'luxor', 'sohag', 'qena', 'minya', 'beni_suef', 'faiyum', 'new_valley']
};

// Fixed shipping rates per region (in EGP)
const shippingRates = {
  delta: 55,
  canal: 70,
  cairo: 70,
  alexandria: 80,
  upperEgypt: 90
};

// Delivery times per region (in business days) - all set to the same standardized message
const deliveryTimes = {
  delta: '3-8 working days (excluding Friday, Saturday, or any official holidays)',
  canal: '3-8 working days (excluding Friday, Saturday, or any official holidays)',
  cairo: '3-8 working days (excluding Friday, Saturday, or any official holidays)',
  alexandria: '3-8 working days (excluding Friday, Saturday, or any official holidays)',
  upperEgypt: '3-8 working days (excluding Friday, Saturday, or any official holidays)'
};

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

// Function to determine the region for a given governorate
const getGovernorateRegion = (governorateId) => {
  for (const [region, governorates] of Object.entries(governorateRegions)) {
    if (governorates.includes(governorateId)) {
      return region;
    }
  }
  // Default to delta if not found (fallback)
  return 'delta';
};

// Calculate shipping fee based on the region
const calculateShippingFee = (governorateId) => {
  const region = getGovernorateRegion(governorateId);
  return shippingRates[region];
};

// Get delivery time estimate based on the region - now returns the same message for all regions
const getDeliveryTimeEstimate = (governorateId) => {
  return '3-8 working days (excluding Friday, Saturday, or any official holidays)';
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useShop();
  const { user, getAddresses, addAddress } = useAuth();
  const addressesFetched = useRef(false);
  
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    governorate: 'gharbia',
    postalCode: '',
    notes: ''
  });
  const [shippingFee, setShippingFee] = useState(30); // Default to delta rate
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('3-8 working days (excluding Friday, Saturday, or any official holidays)');
  
  // State for saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressLoadError, setAddressLoadError] = useState(null);
  const [saveAddressToFavorites, setSaveAddressToFavorites] = useState(false);
  
  // Add loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Auto-fill form with user data on initial load
  useEffect(() => {
    if (user) {
      // Split name into firstName and lastName if available
      let firstName = '';
      let lastName = '';
      
      if (user.name) {
        const nameParts = user.name.split(' ');
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }
      }
      
      // Auto-fill from user profile data
      setFormData(prevData => ({
        ...prevData,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
        phone: user.mobile || '',
      }));
    }
  }, [user]);

  // Function to fill form with selected address
  const populateFormWithAddress = useCallback((address) => {
    if (!address) return;
    
    setFormData(prevData => ({
      ...prevData,
      firstName: prevData.firstName || address.firstName || '',
      lastName: prevData.lastName || address.lastName || '',
      email: prevData.email || address.email || '',
      phone: prevData.phone || address.phone || '',
      address: address.street || '',
      city: address.city || '',
      governorate: address.governorate || 'gharbia',
      postalCode: address.postalCode || '',
      notes: prevData.notes
    }));
  }, []);

  // Fetch user's saved addresses - store the promise to avoid duplicate calls
  const fetchAddresses = useCallback(async () => {
    if (!user || addressesFetched.current) return;
    
    try {
      setIsLoadingAddresses(true);
      setAddressLoadError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoadingAddresses(false);
        setIsCreatingNewAddress(true);
        addressesFetched.current = true;
        return;
      }
      
      console.log("Fetching addresses once");
      
      // Set fetched flag immediately to prevent concurrent calls
      addressesFetched.current = true;
      
      // Use the getAddresses function from AuthContext
      const addresses = await getAddresses();
      
      if (addresses && Array.isArray(addresses)) {
        setSavedAddresses(addresses);
        
        // Select the default address if exists
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          populateFormWithAddress(defaultAddress);
          setIsCreatingNewAddress(false);
        } else if (addresses.length > 0) {
          // Otherwise select the first address
          setSelectedAddressId(addresses[0]._id);
          populateFormWithAddress(addresses[0]);
          setIsCreatingNewAddress(false);
        } else {
          // If no addresses, default to creating a new one
          setIsCreatingNewAddress(true);
        }
      } else {
        // If no addresses or error, default to creating a new one
        setIsCreatingNewAddress(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressLoadError('Failed to load your saved addresses');
      setIsCreatingNewAddress(true);
      // Reset the fetched flag on error so we can retry
      addressesFetched.current = false;
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user, getAddresses, populateFormWithAddress]);
  
  // Use a more stable dependency array for the useEffect
  useEffect(() => {
    const userId = user?.id;
    
    // Only fetch if user exists and addresses haven't been fetched
    if (userId && !addressesFetched.current) {
      fetchAddresses();
    }
    
    // Reset fetched flag on unmount or when user changes
    return () => {
      addressesFetched.current = false;
    };
  }, [user?.id, fetchAddresses]); // Only depend on user.id, not the entire user object
  
  // Handle address selection
  const handleAddressSelection = useCallback((addressId) => {
    if (addressId === 'new') {
      // For new address, keep user profile data but clear address fields
      setFormData(prevData => ({
        ...prevData,
        address: '',
        city: '',
        governorate: 'gharbia',
        postalCode: ''
      }));
      setSelectedAddressId(null);
      setIsCreatingNewAddress(true);
      setSaveAddressToFavorites(false);
    } else {
      // Set selected address and populate form
      const address = savedAddresses.find(addr => addr._id === addressId);
      if (address) {
        setSelectedAddressId(addressId);
        populateFormWithAddress(address);
        setIsCreatingNewAddress(false);
        setSaveAddressToFavorites(false);
      }
    }
  }, [savedAddresses, populateFormWithAddress]);
  
  // Add function to save a new address
  const handleSaveNewAddress = async () => {
    // Check required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.governorate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSavingAddress(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You must be logged in to save addresses');
        setIsSavingAddress(false);
        return;
      }
      
      const addressData = {
        street: formData.address,
        city: formData.city,
        governorate: formData.governorate,
        postalCode: formData.postalCode,
        isDefault: savedAddresses.length === 0 // Make it default if it's the first address
      };
      
      // Use the addAddress function from AuthContext
      const newAddress = await addAddress(addressData);
      
      if (newAddress) {
        // Add new address to the saved addresses list
        setSavedAddresses(prevAddresses => [...prevAddresses, newAddress]);
        setSelectedAddressId(newAddress._id);
        setIsCreatingNewAddress(false);
        setSaveAddressToFavorites(false);
        toast.success('Address saved successfully');
        
        // Re-fetch addresses on next mount
        addressesFetched.current = false;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('An error occurred while saving the address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Manually reset address fetch state
  const handleRetryAddressFetch = useCallback(() => {
    addressesFetched.current = false;
    setAddressLoadError(null);
    setIsCreatingNewAddress(true);
    fetchAddresses();
  }, [fetchAddresses]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cart, navigate, orderComplete]);

  // Update shipping fee when governorate changes
  useEffect(() => {
    const fee = calculateShippingFee(formData.governorate);
    setShippingFee(fee);
    
    // Update estimated delivery time
    const deliveryEstimate = getDeliveryTimeEstimate(formData.governorate);
    setEstimatedDeliveryDays(deliveryEstimate);
  }, [formData.governorate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (checkoutStep === 1) {
      // Validate shipping info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
          !formData.address || !formData.governorate) {
        alert('Please fill in all required fields');
        return;
      }
      
      // If user requested to save address and is creating new one, save it now
      if (saveAddressToFavorites && isCreatingNewAddress) {
        await handleSaveNewAddress();
      }
      
      // Proceed to review order
      setCheckoutStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (checkoutStep === 2) {
      setIsSubmitting(true);
      
      try {
        // Get current region for shipping
        const region = getGovernorateRegion(formData.governorate);
        
        // Create order object
        const orderData = {
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            governorate: formData.governorate,
            postalCode: formData.postalCode,
            notes: formData.notes
          },
          paymentMethod: 'COD', // Cash on Delivery only for now
          shippingFee: shippingFee,
          estimatedDeliveryTime: estimatedDeliveryDays,
          deliveryRegion: region,
          notes: formData.notes,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name
          }))
        };
        
        // Get user token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('You must be logged in to place an order');
          setIsSubmitting(false);
          return;
        }
        
        // Begin order submission process
        setEmailSending(true);
        toast.loading('Placing your order...');
        
        // Submit order to backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = typeof errorData === 'object' 
            ? (errorData.message || errorData.error || JSON.stringify(errorData)) 
            : 'Failed to place order';
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        // Set order number from response
        setOrderNumber(result.data.orderNumber);
        
        // Show email sending success
        toast.dismiss();
        toast.success('Order placed successfully!');
        setEmailSent(true);
        
        // Clear the cart and complete the order
        clearCart();
        setOrderComplete(true);
      } catch (error) {
        console.error('Error placing order:', error);
        toast.dismiss();
        
        // Extract a meaningful error message
        let errorMessage = 'Failed to place order';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = JSON.stringify(error);
        }
        
        toast.error(`An error occurred: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
        setEmailSending(false);
      }
    }
  };

  // Handle going back
  const goBack = () => {
    if (checkoutStep === 1) {
      navigate('/cart');
    } else {
      setCheckoutStep(checkoutStep - 1);
    }
  };

  // Calculate total with shipping
  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;

  // Make sure we reset the fetch status when the user changes (like on login/logout)
  useEffect(() => {
    // Reset the addresses fetched flag when user changes
    addressesFetched.current = false;
    
    // Clear saved addresses when logging out
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      setIsCreatingNewAddress(true);
    }
  }, [user]);

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5 p-8"
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, 0] }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-5 rounded-full">
                  <FaCheck className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold mb-2 text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Order Confirmed!
              </motion.h2>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Thank you for your order. Your order number is <span className="font-semibold text-primary">#{orderNumber}</span>.
              </motion.p>
              <motion.div
                className="flex items-center justify-center mb-6 text-green-600 dark:text-green-400 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <FaEnvelope className="h-5 w-5" />
                <span>Confirmation email sent to <span className="font-medium">{formData.email}</span></span>
              </motion.div>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                You will be contacted by our delivery team before shipping your order.
              </motion.p>
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Delivery Information</h3>
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-primary">
                    <FaMapMarkerAlt className="h-5 w-5" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</span><br />
                    {formData.address}, <br />
                    {formData.city}, {egyptianGovernorates.find(g => g.id === formData.governorate)?.name || formData.governorate}, Egypt
                  </p>
                </div>
                <div className="flex items-start gap-4 mt-4">
                  <div className="mt-1 text-green-600 dark:text-green-400">
                    <FaMoneyBillWave className="h-5 w-5" />
                  </div>
                <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Payment method:</span><br />
                    Cash on Delivery (COD)
                  </p>
                </div>
                <div className="flex items-start gap-4 mt-4">
                  <div className="mt-1 text-primary">
                    <FaTruck className="h-5 w-5" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Estimated delivery:</span><br />
                    {estimatedDeliveryDays}
                </p>
              </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
              <motion.button
                  whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/shop')}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-colors shadow-lg hover:shadow-primary/25"
              >
                Continue Shopping
              </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Get region for the current governorate for display
  const currentRegion = getGovernorateRegion(formData.governorate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={goBack}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h2>
            </div>

            {/* Checkout Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center w-full max-w-3xl">
                <div className={`flex-1 flex flex-col items-center ${checkoutStep >= 1 ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    checkoutStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <FaMapMarkerAlt className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Shipping</span>
                </div>
                <div className={`flex-1 h-1 ${checkoutStep >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`flex-1 flex flex-col items-center ${checkoutStep >= 2 ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    checkoutStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <FaMoneyBillWave className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Review & Pay</span>
                </div>
              </div>
            </div>

            {/* Checkout Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                <form onSubmit={handleSubmit}>
                  {/* Shipping Information - Step 1 */}
                {checkoutStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                    >
                      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Shipping Information</h3>
                      
                      {/* Saved Addresses Section */}
                      {isLoadingAddresses ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600 dark:text-gray-400 mt-2">Loading your addresses...</span>
                          </div>
                        </div>
                      ) : addressLoadError ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/20">
                          <p className="text-red-600 dark:text-red-400 mb-3">{addressLoadError}</p>
                          <button 
                            onClick={handleRetryAddressFetch}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <>
                          {savedAddresses.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-primary" />
                                Your Saved Addresses
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {savedAddresses.map((address) => (
                                  <motion.div 
                                    key={address._id}
                                    onClick={() => handleAddressSelection(address._id)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                      selectedAddressId === address._id 
                                        ? 'border-primary bg-primary/5 shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                                          {address.firstName || address.name || "Delivery Address"} 
                                          {address.isDefault && (
                                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Default</span>
                                          )}
                                          {selectedAddressId === address._id && (
                                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Selected</span>
                                          )}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                          {address.street}, {address.city}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                          {egyptianGovernorates.find(g => g.id === address.governorate)?.name || address.governorate}, Egypt
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                          {address.phone || user?.mobile}
                                        </p>
                                      </div>
                                      {selectedAddressId === address._id && (
                                        <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center">
                                          <FaCheck className="h-3 w-3" />
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                                
                                <motion.div 
                                  onClick={() => handleAddressSelection('new')}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary flex items-center justify-center ${
                                    isCreatingNewAddress 
                                      ? 'border-primary bg-primary/5 shadow-sm' 
                                      : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 mb-2">
                                      <FaMapMarkerAlt className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">Add New Address</p>
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Address Form - Show when creating new address or no saved addresses */}
                      {(isCreatingNewAddress || savedAddresses.length === 0) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          {savedAddresses.length > 0 && (
                            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                                <FaPencilAlt className="mr-2 text-primary" />
                                Enter New Address
                              </h4>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                                id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                                id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                                id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                                id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                          
                          <div className="mb-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Street Address *
                        </label>
                        <input
                          type="text"
                              id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                        <div>
                              <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Governorate *
                          </label>
                          <select
                                id="governorate"
                            name="governorate"
                            value={formData.governorate}
                            onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                                {egyptianGovernorates.map((governorate) => (
                              <option key={governorate.id} value={governorate.id}>
                                {governorate.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        </div>
                          
                          <div className="mb-6">
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                              id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                          
                          {/* Save Address Checkbox - Only show when creating a new address */}
                          {isCreatingNewAddress && (
                            <div className="mb-6">
                              <div className="flex items-center">
                                <input
                                  id="saveAddress"
                                  name="saveAddress"
                                  type="checkbox"
                                  checked={saveAddressToFavorites}
                                  onChange={() => setSaveAddressToFavorites(!saveAddressToFavorites)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                  Save this address for future orders
                                </label>
                              </div>
                            </div>
                          )}
                          
                          {/* Save Address Button - Only show when creating a new address and checkbox is checked */}
                          {isCreatingNewAddress && saveAddressToFavorites && (
                            <div className="mb-6">
                              <motion.button
                                type="button"
                                onClick={handleSaveNewAddress}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                disabled={isSavingAddress}
                                className="inline-flex items-center px-4 py-2.5 bg-primary-light text-primary font-medium rounded-lg hover:bg-primary-light/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {isSavingAddress ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving Address...
                                  </>
                                ) : (
                                  <>
                                    <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                                    Save Address Now
                                  </>
                                )}
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      )}
                      
                      <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Add any special instructions or notes for your order"
                        ></textarea>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Information</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-3">
                          <FaMoneyBillWave className="mr-2 text-green-600 dark:text-green-500" /> 
                          <span>
                            Cash on Delivery only
                          </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-start">
                          <FaTruck className="mr-2 mt-1 text-primary flex-shrink-0" /> 
                          <span>
                            Delivery time: takes from 3 to 8 working days (excluding Friday, Saturday, or any official holidays)
                          </span>
                        </p>
                        <button onClick={() => setCheckoutStep(2)} className="mt-4 inline-flex items-center px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-300">Continue to Review Order</button>
                  </div>
                    </motion.div>
                )}

                  {/* Review Order - Step 2 */}
                {checkoutStep === 2 && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Review Order</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Shipping Information</h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                          {formData.firstName} {formData.lastName}<br />
                          {formData.address}<br />
                          {formData.city}, {egyptianGovernorates.find(g => g.id === formData.governorate)?.name || formData.governorate}, Egypt<br />
                          {formData.postalCode && `${formData.postalCode}`}<br />
                          {formData.phone}<br />
                          {formData.email}
                        </p>
                        <button
                          onClick={() => setCheckoutStep(1)}
                          className="text-primary hover:text-primary-dark mt-2 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Payment Method</h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <input
                              id="cod"
                              name="paymentMethod"
                              type="radio"
                              checked={true}
                              readOnly
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <label htmlFor="cod" className="ml-2 flex items-center">
                              <FaMoneyBillWave className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                              <span className="text-gray-800 dark:text-gray-200 font-medium">
                          Cash on Delivery (COD)
                              </span>
                            </label>
                      </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 ml-6 pl-1">
                        You will pay in cash when your order is delivered.
                      </p>
                        </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Shipping Method</h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
                          <FaTruck className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="text-gray-900 dark:text-gray-200 font-medium">
                            Standard Shipping
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Estimated delivery: {estimatedDeliveryDays}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              Shipping to {egyptianGovernorates.find(g => g.id === formData.governorate)?.name}: {shippingFee.toFixed(2)} EGP
                          </p>
                          </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                      <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Order Items</h4>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-gray-900 dark:text-white font-medium line-clamp-1">
                                {item.name}
                              </h5>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-gray-900 dark:text-white font-medium">
                              {(item.price * item.quantity).toFixed(2)} EGP
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      onClick={handleSubmit}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl hover:from-primary-dark hover:to-primary transition-colors font-medium shadow-lg hover:shadow-primary/25 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                          {emailSending ? 'Processing Order...' : 'Placing Order...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Place Order</span>
                        </div>
                      )}
                    </motion.button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      By placing your order, you agree to our Terms and Conditions. 
                      A confirmation email will be sent to your email address.
                    </p>
                  </div>
                )}
                </form>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <FaBox className="mr-2 text-primary" />
                    Order Summary
                  </h3>
                  
                  {/* Cart Items Summary */}
                  <div className="max-h-60 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-gray-900 dark:text-white font-medium text-sm line-clamp-1 mb-1">
                            {item.name}
                          </h5>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Qty: {item.quantity} × {item.price.toFixed(2)} EGP
                          </p>
                        </div>
                        <div className="text-gray-900 dark:text-white font-medium text-sm">
                          {(item.price * item.quantity).toFixed(2)} EGP
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Items ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
                      <span className="text-gray-900 dark:text-white">{subtotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">{shippingFee.toFixed(2)} EGP</span>
                    </div>
                    <div className="border-t dark:border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-xl text-primary">{total.toFixed(2)} EGP</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <FaMoneyBillWave className="mr-1 text-green-600 dark:text-green-400" />
                        Cash on Delivery only
                      </p>
                    </div>
                  </div>

                  {/* Continue Shopping Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/shop')}
                    className="w-full text-center py-2.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary-lightest dark:hover:bg-primary-dark/10 transition-colors mt-4"
                  >
                    Continue Shopping
                  </motion.button>

                  {/* Shipping Information */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-4 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FaWarehouse className="text-primary" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Shipping Information</h4>
                    </div>
                    {formData.governorate && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="mb-1.5">
                          <span className="font-medium">Selected Governorate:</span> {egyptianGovernorates.find(g => g.id === formData.governorate)?.name}
                        </div>
                        <div className="mb-1.5">
                          <span className="font-medium">Region:</span> {currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1)}
                        </div>
                        <div className="mb-1.5">
                          <span className="font-medium">Shipping Fee:</span> {shippingFee.toFixed(2)} EGP
                        </div>
                        <div>
                          <span className="font-medium">Estimated Delivery:</span> {estimatedDeliveryDays}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 
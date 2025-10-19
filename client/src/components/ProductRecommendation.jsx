import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaShoppingCart, FaTimes, FaSpinner, FaStar, FaCheck, FaLeaf, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ProductRecommendation = ({ onRecommend, onCancel, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper function to get the API base URL
  const getApiBaseUrl = () => {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api' 
      : `${window.location.origin.replace(/:\d+$/, ':5000')}/api`;
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Use the specific SkinCare category ID to filter products
      // Request a larger number of products (e.g., 100) to ensure we get all skincare products
      const skincareCategoryId = '68156ddd1a8217ac30c358f1';
      const response = await fetch(`${getApiBaseUrl()}/products?category=${skincareCategoryId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      const productsList = data.products || [];
      console.log(`Fetched ${productsList.length} skincare products`);
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const typeMatch = product.type?.name?.toLowerCase().includes(searchLower);
      const subtypeMatch = product.subtype?.name?.toLowerCase().includes(searchLower);
      
      return nameMatch || descriptionMatch || typeMatch || subtypeMatch;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCustomMessage(`I recommend trying ${product.name} for your skin concerns.`);
  };

  // Send product recommendation
  const handleRecommend = async () => {
    if (!selectedProduct || !userId) return;
    
    setIsSending(true);
    try {
      const chatId = `consultant_${userId}`;
      
      // Format product data to ensure no complex objects are sent
      const simplifiedProduct = {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.photos && selectedProduct.photos.length > 0 
          ? selectedProduct.photos[0].secure_url
          : '/images/default-product.jpg', // Use a default image if none available
        rating: typeof selectedProduct.rating === 'object' 
          ? selectedProduct.rating.average
          : selectedProduct.rating
      };
      
      // Create recommendation data object
      const recommendationData = {
        userId,
        productId: selectedProduct._id,
        productData: simplifiedProduct, // Send simplified product data
        chatId,
        message: customMessage
      };
      
      console.log('Sending product recommendation:', recommendationData);
      
      // Call the parent component's onRecommend function
      onRecommend(recommendationData);
      
      // Close the recommendation modal
      onCancel();
    } catch (error) {
      console.error('Error sending product recommendation:', error);
      toast.error('Failed to send product recommendation');
    } finally {
      setIsSending(false);
    }
  };

  // Render product preview card
  const renderProductPreview = () => {
    if (!selectedProduct) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="relative">
          {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
            <img 
              src={selectedProduct.photos[0].secure_url} 
              alt={selectedProduct.name}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <FaShoppingCart className="text-gray-400 dark:text-gray-500 h-12 w-12" />
            </div>
          )}
          
          {selectedProduct.isNew && (
            <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              NEW
            </div>
          )}
          
          {selectedProduct.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {selectedProduct.discount}% OFF
            </div>
          )}
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
              {selectedProduct.name}
            </h3>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">
                <FaStar />
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {typeof selectedProduct.rating === 'object' 
                  ? (selectedProduct.rating.average || 0).toFixed(1) 
                  : selectedProduct.rating || '4.8'}
              </span>
            </div>
          </div>
          
          <div className="mb-2">
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              EGP {selectedProduct.price}
            </span>
            {selectedProduct.originalPrice && (
              <span className="text-gray-500 line-through ml-2 text-sm">
                EGP {selectedProduct.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedProduct.type && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                {selectedProduct.type.name}
              </span>
            )}
            {selectedProduct.subtype && (
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                {selectedProduct.subtype.name}
              </span>
            )}
            {selectedProduct.isNatural && (
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full flex items-center">
                <FaLeaf className="mr-1" /> Natural
              </span>
            )}
          </div>
          
          {selectedProduct.description && (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-3">
              {selectedProduct.description}
            </p>
          )}
          
          <ul className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {selectedProduct.highlights && selectedProduct.highlights.map((highlight, index) => (
              <li key={index} className="flex items-center mb-1">
                <FaCheck className="text-teal-500 mr-1" />
                <span>{highlight}</span>
              </li>
            ))}
            {!selectedProduct.highlights && (
              <>
                <li className="flex items-center mb-1">
                  <FaCheck className="text-teal-500 mr-1" />
                  <span>Dermatologically tested</span>
                </li>
                <li className="flex items-center mb-1">
                  <FaCheck className="text-teal-500 mr-1" />
                  <span>Suitable for all skin types</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommend Product</h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Product List */}
          <div className={`${selectedProduct ? 'hidden md:block' : ''} md:w-1/2 overflow-y-auto border-r border-gray-200 dark:border-gray-700`}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <FaSpinner className="animate-spin h-6 w-6 text-teal-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No products found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className={`p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedProduct?._id === product._id ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {product.photos && product.photos.length > 0 ? (
                      <img 
                        src={product.photos[0].secure_url} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-md mr-3"
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          e.target.src = '/images/default-product.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md mr-3 flex items-center justify-center">
                        <FaShoppingCart className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</h4>
                      <div className="flex text-xs text-gray-500 dark:text-gray-400 space-x-2">
                        <span>EGP {product.price}</span>
                        {product.type && <span>• {product.type.name}</span>}
                        {product.rating && (
                          <span>
                            • <FaStar className="inline text-yellow-500 mr-0.5" />
                            {typeof product.rating === 'object' 
                              ? (product.rating.average || 0).toFixed(1) 
                              : product.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Preview and Message */}
          {selectedProduct && (
            <div className="flex-1 p-4 md:w-1/2 overflow-y-auto">
              <div className="mb-4 md:sticky md:top-0">
                {/* Back button on mobile */}
                <button
                  className="md:hidden mb-3 text-teal-600 dark:text-teal-400 flex items-center text-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  <FaTimes className="mr-1" /> Back to products
                </button>
                
                {/* Preview */}
                {renderProductPreview()}
                
                {/* Message input */}
                <div className="mt-4">
                  <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recommendation Message
                  </label>
                  <textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Add a personal recommendation message..."
                  />
                </div>
                
                {/* Preview of how recommendation will look */}
                <div className="mt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 flex items-start mb-2">
                    <FaInfoCircle className="text-teal-500 mt-0.5 mr-2" />
                    <span>Preview how your recommendation will appear to the customer:</span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="bg-teal-500 text-white p-2 rounded-t-md rounded-br-none rounded-bl-md inline-block mb-2">
                      {customMessage}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                          <img 
                            src={selectedProduct.photos[0].secure_url} 
                            alt={selectedProduct.name}
                            className="w-10 h-10 object-cover rounded-md"
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.target.src = '/images/default-product.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <FaShoppingCart className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {selectedProduct.name}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>EGP {selectedProduct.price}</span>
                            {selectedProduct.rating && (
                              <span className="ml-2 flex items-center">
                                <FaStar className="text-yellow-500 mr-0.5" />
                                {typeof selectedProduct.rating === 'object' 
                                  ? (selectedProduct.rating.average || 0).toFixed(1) 
                                  : selectedProduct.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleRecommend}
              disabled={!selectedProduct || isSending}
              className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-1 ${
                !selectedProduct || isSending
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
              }`}
            >
              {isSending ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaShoppingCart className="h-4 w-4" />
                  <span>Recommend Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductRecommendation; 
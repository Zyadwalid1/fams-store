import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaHeart, FaSpinner } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';
import { useState } from 'react';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart, isLoading } = useShop();
  const [loadingItems, setLoadingItems] = useState({});

  // Handle add to cart with loading state
  const handleAddToCart = async (item) => {
    setLoadingItems(prev => ({ ...prev, [item.id]: { cart: true } }));
    
    try {
      await addToCart(item, 1);
    } finally {
      setLoadingItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], cart: false } }));
    }
  };
  
  // Handle remove from wishlist with loading state
  const handleRemoveFromWishlist = async (item) => {
    setLoadingItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], wishlist: true } }));
    
    try {
      await toggleWishlist(item);
    } finally {
      setLoadingItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], wishlist: false } }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
        <div className="text-center p-8 max-w-md">
          <FaSpinner className="animate-spin h-12 w-12 mx-auto text-primary mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Loading wishlist...</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch your saved items.</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl p-8 shadow-xl"
        >
          <div className="mb-6">
            <FaHeart className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover and save items you love to your wishlist!
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
          >
            Explore Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-12"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Wishlist
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10" />
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                      <Link to={`/product/${item.id}`} className="block relative pt-[100%] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                      <div className="p-6">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {item.name}
                          </h3>
                        </Link>
                        
                        {item && item.discount !== undefined && item.discount !== null && item.discount > 0 ? (
                          <div className="mb-4">
                            <span className="text-gray-900 dark:text-white font-medium mr-2">
                              {(item.price * (1 - item.discount / 100)).toFixed(2)} EGP
                            </span>
                            <span className="text-gray-500 text-sm line-through">
                              {item.price} EGP
                            </span>
                            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                              {item.discount}% OFF
                            </span>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {item.price} EGP
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={loadingItems[item.id]?.cart}
                            className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-6 rounded-xl hover:from-primary-dark hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none"
                          >
                            {loadingItems[item.id]?.cart ? (
                              <FaSpinner className="h-4 w-4 animate-spin" />
                            ) : (
                              <FaShoppingCart className="h-4 w-4" />
                            )}
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(item)}
                            disabled={loadingItems[item.id]?.wishlist}
                            className="p-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transform hover:scale-110 transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:transform-none"
                            aria-label="Remove from wishlist"
                          >
                            {loadingItems[item.id]?.wishlist ? (
                              <FaSpinner className="h-5 w-5 animate-spin" />
                            ) : (
                              <FaTrash className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 
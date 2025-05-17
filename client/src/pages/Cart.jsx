import { motion } from 'framer-motion';
import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { FaTrash, FaMinus, FaPlus, FaSpinner, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, isLoading } = useShop();
  const [loadingItems, setLoadingItems] = useState({});

  // Handle quantity change with loading state
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    setLoadingItems(prev => ({ ...prev, [productId]: { quantity: true } }));
    
    try {
      await updateCartQuantity(productId, newQuantity);
    } finally {
      setLoadingItems(prev => ({ ...prev, [productId]: { ...prev[productId], quantity: false } }));
    }
  };
  
  // Handle item removal with loading state
  const handleRemoveItem = async (productId) => {
    setLoadingItems(prev => ({ ...prev, [productId]: { ...prev[productId], remove: true } }));
    
    try {
      await removeFromCart(productId);
    } finally {
      setLoadingItems(prev => ({ ...prev, [productId]: { ...prev[productId], remove: false } }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
        <div className="text-center p-8 max-w-md">
          <FaSpinner className="animate-spin h-12 w-12 mx-auto text-primary mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Loading your cart...</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch your cart items.</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 max-w-md w-full p-8 m-4">
          <div className="text-center">
            <FaShoppingCart className="w-16 h-16 text-primary/50 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Add some items to your cart to get started!</p>
            <Link to="/shop" className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-8 rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 font-medium shadow-lg hover:shadow-primary/25">
              Explore Products
            </Link>
          </div>
        </div>
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
            className="container mx-auto px-4 py-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Shopping Cart</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="pr-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                      {item.discount > 0 ? (
                        <div>
                          <p className="text-primary dark:text-primary-light text-lg font-medium">
                            {item.discountedPrice} EGP
                            <span className="ml-2 text-gray-500 text-sm line-through">
                              {item.price} EGP
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                          {item.price} EGP
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Subtotal: {((item.discountedPrice || item.price) * item.quantity).toFixed(2)} EGP
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={loadingItems[item.id]?.quantity}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-400 disabled:opacity-50"
                        >
                          <FaMinus className="h-4 w-4" />
                        </motion.button>
                        <span className="w-8 text-center text-gray-900 dark:text-white font-medium text-lg">
                          {loadingItems[item.id]?.quantity ? (
                            <FaSpinner className="h-5 w-5 mx-auto animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loadingItems[item.id]?.quantity}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-400 disabled:opacity-50"
                        >
                          <FaPlus className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loadingItems[item.id]?.remove}
                        className="p-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full disabled:opacity-50"
                      >
                        {loadingItems[item.id]?.remove ? (
                          <FaSpinner className="h-5 w-5 animate-spin" />
                        ) : (
                          <FaTrash className="h-5 w-5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">{getCartTotal().toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">Calculated at checkout</span>
                    </div>
                    <div className="border-t dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-gray-900 dark:text-white">{getCartTotal().toFixed(2)} EGP</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl hover:from-primary-dark hover:to-primary transition-colors font-medium shadow-lg hover:shadow-primary/25"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 
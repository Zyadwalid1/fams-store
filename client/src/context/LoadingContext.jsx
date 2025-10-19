import { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
  >
    <div className="relative flex items-center justify-center">
      {/* Main spinner */}
      <motion.div
        className="w-24 h-24 border-4 border-blue-500 rounded-full"
        style={{ borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ 
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />
      
      {/* Inner spinner */}
      <motion.div
        className="absolute w-16 h-16 border-4 border-blue-300 rounded-full"
        style={{ borderTopColor: 'transparent' }}
        animate={{ rotate: -360 }}
        transition={{ 
          rotate: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />
      
      {/* FAMS text */}
      <motion.div
        className="absolute flex items-center justify-center w-full h-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
          opacity: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
          FAMS
        </span>
      </motion.div>
    </div>
  </motion.div>
);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  const showLoading = (duration = 1000) => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
    // Small delay to ensure clean state
    setTimeout(() => {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, duration);
      setLoadingTimeout(timeout);
    }, 50);
  };

  const hideLoading = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingSpinner />}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}; 
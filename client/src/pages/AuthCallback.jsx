import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Just redirect to home, TokenHandler will take care of the access token
    setTimeout(() => {
      navigate('/');
    }, 1500); // Small delay to show the loading animation
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-lightest via-white to-primary-light/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-primary-dark/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg text-center"
      >
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear" 
            }
          }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Authentication Successful</h2>
        <p className="text-gray-600 dark:text-gray-300">Redirecting you to the homepage...</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback; 
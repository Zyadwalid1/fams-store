import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaLock, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Get email from URL parameters or state
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!email || !otp) {
        throw new Error('Email and verification code are required');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess('Email verified successfully!');
      setTimeout(() => {
        navigate('/login?verified=true');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      toast.success('New verification code sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
      toast.error(err.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-lightest via-white to-primary-light/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-primary-dark/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 dark:opacity-20 opacity-10"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary dark:from-primary dark:to-primary-dark"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            transition: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-light/20 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md w-full space-y-8 relative"
      >
        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative overflow-hidden"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Decorative Elements */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-light to-primary rounded-full blur-3xl opacity-20 -z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          
          <motion.div variants={fadeInUp}>
            <motion.div 
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-lightest dark:bg-primary-dark/30 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <FaEnvelope className="h-8 w-8 text-primary dark:text-primary-light" />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Verify Your Email
            </motion.h2>
            <motion.p
              className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Please enter the verification code sent to your email
            </motion.p>
            {email && (
              <motion.p
                className="text-center font-medium text-primary dark:text-primary-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {email}
              </motion.p>
            )}
          </motion.div>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm backdrop-blur-lg"
                >
                  {error}
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm backdrop-blur-lg"
                >
                  <div className="flex items-center">
                    <FaCheckCircle className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeInUp} className="space-y-4">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-light transition-colors" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Verification Code"
                />
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Verify Email
                    <span className="group-hover:translate-x-1 absolute right-4 transition-transform duration-200">
                      <FaArrowRight className="h-4 w-4" />
                    </span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || !email}
                className="text-sm text-center text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-lightest transition-colors"
              >
                {isResending ? 'Sending...' : 'Didn\'t receive code? Resend'}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP; 
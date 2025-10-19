import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaArrowRight, FaPhone } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';

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

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showLoading } = useLoading();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validation patterns
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Simpler password pattern - at least 8 chars with one uppercase, one lowercase, one number, one special char
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    mobile: /^01[0125][0-9]{8}$/
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value) {
          error = 'Name is required';
        } else if (value.length < 2) {
          error = 'Name must be at least 2 characters long';
        } else if (value.length > 50) {
          error = 'Name cannot exceed 50 characters';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!patterns.email.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        } else if (!patterns.password.test(value)) {
          error = 'Password must include at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'mobile':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!patterns.mobile.test(value)) {
          error = 'Please enter a valid Egyptian mobile number (01X followed by 8 digits)';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update password strength if password field is changed
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate all fields
    const newErrors = {};
    let hasError = false;
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) {
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    
    if (hasError) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Call the register function from AuthContext
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        mobile: formData.mobile
      });

      // Redirect to OTP verification page after successful registration
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error('Registration error in component:', err);
      setFormError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/google/signup`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
      <div className="flex min-h-screen">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
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
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
            className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-light/20 rounded-full blur-3xl"
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
                <motion.h2
                  className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Create Account
                </motion.h2>
                <motion.p
                  className="text-center text-sm text-gray-600 dark:text-gray-400"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent hover:from-primary-dark hover:to-primary transition-all duration-300">
                    Sign in
                  </Link>
                </motion.p>
              </motion.div>

              <motion.form
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="mt-8 space-y-6"
                onSubmit={handleSubmit}
              >
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm backdrop-blur-lg"
                    >
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={fadeInUp} className="space-y-4">
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: errors.name ? 1.0 : 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-light'} transition-colors`} />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
                      placeholder="Full Name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: errors.email ? 1.0 : 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-light'} transition-colors`} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
                      placeholder="Email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: errors.password ? 1.0 : 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-light'} transition-colors`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
                      placeholder="Password"
                    />
                    {formData.password && (
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: errors.confirmPassword ? 1.0 : 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-light'} transition-colors`} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: errors.mobile ? 1.0 : 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className={`h-5 w-5 ${errors.mobile ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-light'} transition-colors`} />
                    </div>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.mobile ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl leading-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md`}
                      placeholder="Mobile number (e.g., 01012345678)"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.mobile}</p>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp} className="pt-2">
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
                        Create Account
                        <span className="group-hover:translate-x-1 absolute right-4 transition-transform duration-200">
                          <FaArrowRight className="h-4 w-4" />
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 transition-all duration-300"
                    >
                      <FaGoogle className="h-5 w-5 mr-2" />
                      Sign up with Google
                    </motion.button>
                  </div>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 
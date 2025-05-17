import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaHeart, FaUser, FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes, FaHome, FaStore } from 'react-icons/fa';
import { GiTrousers } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const PantsIcon = () => (
  <div className="relative inline-flex items-center justify-center translate-y-1">
    <GiTrousers className="w-6 h-6 text-primary dark:text-primary-light" />
  </div>
);

const Logo = () => (
  <div className="flex items-center">
    <span className="text-3xl font-black text-primary dark:text-primary-light">FAMS store</span>
    <div className="flex items-baseline -ml-1">
      <div className="flex items-baseline space-x-0">
        {/* <PantsIcon /> */}
        <span className="text-2xl font-extrabold tracking-tighter -ml-1 text-primary dark:text-primary-light"></span>
      </div>
      <span className="text-xs font-medium ml-0.5 text-primary dark:text-primary-light"></span>
    </div>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart, wishlist } = useShop();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug useEffect to monitor user state in Navbar
  useEffect(() => {
    console.log('Navbar: Current user state:', user);
  }, [user]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';
  const isShopPage = location.pathname === '/shop';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-50 backdrop-blur-lg bg-primary-lightest/80 dark:bg-gray-800/80 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center ml-6 space-x-8">
              <Link
                to="/shop"
                className={`px-6 py-2.5 flex items-center gap-2 transition-colors duration-200 ${
                  isShopPage 
                    ? 'text-primary dark:text-primary-light font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                <FaStore className="w-5 h-5" />
                <span>Shop</span>
              </Link>
              <Link
                to="/"
                className={`px-6 py-2.5 flex items-center gap-2 transition-colors duration-200 ${
                  isHomePage 
                    ? 'text-primary dark:text-primary-light font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                <FaHome className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/about"
                className={`px-6 py-2.5 transition-colors duration-200 ${
                  isAboutPage 
                    ? 'text-primary dark:text-primary-light font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                About Us
              </Link>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-primary-lightest dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </motion.button>

            {user ? (
              <>
                <div className="relative">
                  <Link to="/cart" className="p-2 rounded-full hover:bg-primary-lightest dark:hover:bg-gray-700 relative group block">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <FaShoppingBag className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                    </motion.div>
                    <AnimatePresence>
                      {cartItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        >
                          {cartItemCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
                <div className="relative">
                  <Link to="/wishlist" className="p-2 rounded-full hover:bg-primary-lightest dark:hover:bg-gray-700 relative group block">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <FaHeart className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                    </motion.div>
                    <AnimatePresence>
                      {wishlistItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        >
                          {wishlistItemCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
                <div className="relative group">
                  <Link
                    to="/account"
                    className="p-2 rounded-xl hover:bg-primary-lightest dark:hover:bg-gray-700 flex items-center space-x-2 group"
                  >
                    <FaUser className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                    <span className="text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-dark">
                      {user.name}
                    </span>
                  </Link>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                >
                  <FaSignOutAlt className="h-6 w-6" />
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            {user && (
              <>
                <Link to="/cart" className="relative">
                  <FaShoppingBag className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link to="/wishlist" className="relative">
                  <FaHeart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  {wishlistItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                to="/shop"
                onClick={closeMobileMenu}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isShopPage
                    ? 'text-primary dark:text-primary-light'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700'
                }`}
              >
                <FaStore className="h-5 w-5 mr-2" />
                <span>Shop</span>
              </Link>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700"
              >
                About Us
              </Link>

              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700"
                  >
                    <FaUser className="h-5 w-5 mr-2" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <FaSignOutAlt className="h-5 w-5 mr-2" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary text-center"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              <button
                onClick={() => {
                  toggleDarkMode();
                  closeMobileMenu();
                }}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-lightest dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <>
                    <FaSun className="h-5 w-5 mr-2" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="h-5 w-5 mr-2" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 
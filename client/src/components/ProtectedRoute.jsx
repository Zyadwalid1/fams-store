import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Component to protect routes that require authentication
// Redirects to login page if user is not authenticated
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading, logout } = useAuth();

  // If auth state is still loading, show nothing
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    // For support routes, redirect to support login page
    if (requiredRole === 'support') {
      return <Navigate to="/support/login" replace />;
    }
    // For other routes, redirect to regular login
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && requiredRole === 'support' && 
      user.role !== 'support' && user.role !== 'admin' && user.role !== 'doctor') {
    // Handle logout with function from context
    const handleLogout = () => {
      logout();
      // Navigate is handled in the logout function
    };
    
    // Show access denied page if user doesn't have required role
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FaLock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sorry, {user.name}. You don't have permission to access this page. This area is restricted to {requiredRole} staff only.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FaHome /> Return Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  } else if (requiredRole && requiredRole !== 'support' && 
            user.role !== requiredRole && user.role !== 'admin') {
    // For other roles, maintain the original strict check
    const handleLogout = () => {
      logout();
    };
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FaLock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sorry, {user.name}. You don't have permission to access this page. This area is restricted to {requiredRole} staff only.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FaHome /> Return Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 
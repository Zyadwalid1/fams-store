import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyOTP from '../pages/VerifyOTP';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Wishlist from '../pages/Wishlist';
import Account from '../pages/Account';
import About from '../pages/About';
import Shop from '../pages/Shop';
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import AdminRoute from '../components/AdminRoute';
import AuthCallback from '../pages/AuthCallback';
import ResetPassword from '../pages/ResetPassword';
import SupportDashboard from '../pages/support/SupportDashboard';
import SupportLogin from '../pages/support/SupportLogin';
import ProtectedRoute from '../components/ProtectedRoute';
import OrderHistory from '../pages/OrderHistory';
import Reels from '../pages/Reels';
import TermsAndPolicies from '../pages/TermsAndPolicies';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <main className="flex-1 pt-16">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
          
          {/* Order Routes */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          
          {/* Support Routes */}
          <Route path="/support/login" element={<SupportLogin />} />
          <Route
            path="/support"
            element={
              <ProtectedRoute requiredRole="support">
                <SupportDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </main>
  );
};

export default AppRoutes; 
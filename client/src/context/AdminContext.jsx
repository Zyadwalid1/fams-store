import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check admin authentication status on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if admin token exists in localStorage
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAdmin(false);
          return;
        }
        
        // Verify admin token with backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/users/check-admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem('adminToken');
          setIsAdmin(false);
        }
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      setIsLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      
      // Check if user is admin
      if (data.user.role !== 'admin') {
        throw new Error('You do not have admin privileges');
      }
      
      // Store admin token in localStorage
      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('token', data.accessToken); // Also save as regular token for API calls
      setIsAdmin(true);
      
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Invalid admin credentials');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      setIsLoading(true);
      
      // Clear admin token from localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      
      setIsAdmin(false);
      toast.success('Admin logged out successfully');
      navigate('/admin/login');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAdmin,
    isLoading,
    error,
    adminLogin,
    adminLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 
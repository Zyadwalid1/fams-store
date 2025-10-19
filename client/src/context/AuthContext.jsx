import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug useEffect to monitor user state changes
  useEffect(() => {
    console.log('AuthContext user state changed:', user);
  }, [user]);

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        console.log('Checking auth with token:', accessToken ? 'Token exists' : 'No token'); // Debug log
        
        if (!accessToken) {
          console.log('No access token found'); // Debug log
          setUser(null);
          setToken(null);
          setIsLoading(false);
          return;
        }
        
        setToken(accessToken);

        // Check if we have cached user data in localStorage
        const cachedUserData = localStorage.getItem('user');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            console.log('Using cached user data from localStorage:', userData);
            setUser(userData);
          } catch (e) {
            console.error('Error parsing cached user data:', e);
            localStorage.removeItem('user');
            // Will continue with API fetch below
          }
        }

        // Fetch user data from API to ensure it's up to date
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Profile fetch successful:', userData); // Debug log
          
          // Store the user data in localStorage
          localStorage.setItem('user', JSON.stringify(userData.user));
          
          setUser(userData.user);
        } else {
          console.log('Profile fetch failed, clearing auth'); // Debug log
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Auth check error:', err); // Debug log
        setError(err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.error('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]); // Added token as dependency to re-run when token changes

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login error:', data);
        throw new Error(data.message || 'Login failed');
      }
      
      const { accessToken, refreshToken, user: userData } = data;
      console.log('Login successful, storing tokens and user data');
      
      // Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update context state
      setToken(accessToken);
      setUser(userData);
      
      toast.success('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      // Google OAuth is now handled by direct window redirect in the Login component
      // This method is kept for API consistency
    } catch (err) {
      setError(err.message);
      toast.error('Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out, clearing auth data');
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear context state
      setUser(null);
      setToken(null);
      
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setIsLoading(true);
      const accessToken = token || localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Update user error:', data);
        throw new Error(data.message || 'Failed to update user');
      }
      
      const { user: updatedUser } = data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Update user catch error:', err);
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setIsLoading(true);
      console.log('Updating password...');
      
      const accessToken = token || localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('You must be logged in to change your password');
      }
      
      console.log('Using token for auth:', accessToken);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      
      const data = await response.json();
      console.log('Password update response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }
      
      toast.success('Password updated successfully');
      return true;
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password');
      toast.error(err.message || 'Failed to update password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (!response.ok) {
        console.error('Registration error:', data);
        throw new Error(data.message || 'Registration failed');
      }
      
      toast.success('Registration successful! Please check your email for verification.');
      return data;
    } catch (err) {
      console.error('Registration catch error:', err);
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginHistory = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const accessToken = token || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('You must be logged in to view login history');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/login-history?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch login history');
      }
      
      return data;
    } catch (err) {
      console.error('Get login history error:', err);
      setError(err.message || 'Failed to fetch login history');
      toast.error(err.message || 'Failed to fetch login history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearLoginHistory = async () => {
    try {
      setIsLoading(true);
      const accessToken = token || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('You must be logged in to clear login history');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/login-history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear login history');
      }
      
      toast.success('Login history cleared successfully');
      return data;
    } catch (err) {
      console.error('Clear login history error:', err);
      setError(err.message || 'Failed to clear login history');
      toast.error(err.message || 'Failed to clear login history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAddresses = async () => {
    try {
      // Use a local loading state instead of the global one
      // This prevents triggering re-renders in components that depend on authLoading
      let isAddressFetching = true;
      const accessToken = token || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('You must be logged in to view addresses');
      }
      
      // Log the API URL for debugging
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Fetching addresses from: ${apiUrl}/api/users/addresses`);
      
      const response = await fetch(`${apiUrl}/api/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        let text = '';
        try {
          text = await response.text();
          console.error('Error response text:', text.substring(0, 200) + '...');
        } catch (textError) {
          console.error('Could not read response text:', textError);
        }
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
      
      isAddressFetching = false;
      return data.addresses;
    } catch (err) {
      console.error('Get addresses error:', err);
      setError(err.message || 'Failed to fetch addresses');
      throw err;
    }
  };

  const addAddress = async (addressData) => {
    try {
      setIsLoading(true);
      const accessToken = token || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('You must be logged in to add an address');
      }
      
      // Convert the form data format to match API expectations
      const apiAddressData = {
        street: addressData.street,
        city: addressData.city,
        governorate: addressData.governorate,
        postalCode: addressData.postalCode,
        isDefault: addressData.isDefault
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Adding address at: ${apiUrl}/api/users/addresses`);
      
      const response = await fetch(`${apiUrl}/api/users/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(apiAddressData)
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        let text = '';
        try {
          text = await response.text();
          console.error('Error response text:', text.substring(0, 200) + '...');
        } catch (textError) {
          console.error('Could not read response text:', textError);
        }
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add address');
      }
      
      toast.success('Address added successfully');
      return data.address;
    } catch (err) {
      console.error('Add address error:', err);
      setError(err.message || 'Failed to add address');
      toast.error(err.message || 'Failed to add address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      setIsLoading(true);
      const accessToken = token || localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('You must be logged in to update an address');
      }
      
      // Convert the form data format to match API expectations
      const apiAddressData = {
        street: addressData.street,
        city: addressData.city,
        governorate: addressData.governorate,
        postalCode: addressData.postalCode,
        isDefault: addressData.isDefault
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Updating address at: ${apiUrl}/api/users/addresses/${addressId}`);
      
      const response = await fetch(`${apiUrl}/api/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(apiAddressData)
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        let text = '';
        try {
          text = await response.text();
          console.error('Error response text:', text.substring(0, 200) + '...');
        } catch (textError) {
          console.error('Could not read response text:', textError);
        }
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address');
      }
      
      toast.success('Address updated successfully');
      return data.address;
    } catch (err) {
      console.error('Update address error:', err);
      setError(err.message || 'Failed to update address');
      toast.error(err.message || 'Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      setIsLoading(true);
      
      const accessToken = token || localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('You must be logged in to delete an address');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Deleting address at: ${apiUrl}/api/users/addresses/${addressId}`);
      
      const response = await fetch(`${apiUrl}/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Some DELETE endpoints may not return content
      if (response.status === 204) {
        toast.success('Address deleted successfully');
        return true;
      }
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete address');
        }
        
        toast.success('Address deleted successfully');
        return true;
      } else if (!response.ok) {
        // Non-JSON error response
        let text = '';
        try {
          text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200) + '...');
        } catch (textError) {
          console.error('Could not read error response text:', textError);
        }
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      toast.success('Address deleted successfully');
      return true;
    } catch (err) {
      console.error('Delete address error:', err);
      setError(err.message || 'Failed to delete address');
      toast.error(err.message || 'Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user orders
  const getUserOrders = async (page = 1, limit = 5) => {
    try {
      const accessToken = token || localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('You must be logged in to view your orders');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  // Get order by ID
  const getOrderById = async (orderId) => {
    try {
      const accessToken = token || localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('You must be logged in to view order details');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch order details');
      }
      
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    try {
      setIsLoading(true);
      
      const accessToken = token || localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('You must be logged in to cancel an order');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel order');
      }
      
      toast.success('Order cancelled successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    updatePassword,
    register,
    getLoginHistory,
    clearLoginHistory,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getUserOrders,
    getOrderById,
    cancelOrder,
    setUser,
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
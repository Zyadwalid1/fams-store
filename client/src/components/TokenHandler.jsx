import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const handleTokenInUrl = async () => {
      try {
        // Check if there's an access token in the URL
        const queryParams = new URLSearchParams(location.search);
        const accessToken = queryParams.get('accessToken');
        
        if (!accessToken) {
          return; // No token found, do nothing
        }
        
        console.log('Found token in URL:', accessToken);
        
        // Store the token
        localStorage.setItem('accessToken', accessToken);
        setToken(accessToken);
        
        // Fetch user data with the token
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user data');
        }
        
        const userData = await response.json();
        console.log('User data received in TokenHandler:', userData);
        
        // Set the user data in context
        setUser(userData.user);
        
        // Show success toast
        toast.success('Successfully logged in!');
        
        // Clean the URL by removing the token parameter
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error processing token:', err);
        toast.error('Authentication failed');
      }
    };
    
    handleTokenInUrl();
  }, [location, setToken, setUser, navigate]);
  
  // This component doesn't render anything
  return null;
};

export default TokenHandler; 
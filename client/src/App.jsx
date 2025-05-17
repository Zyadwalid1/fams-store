import { BrowserRouter as Router } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import { LoadingProvider } from './context/LoadingContext';
import { ToastProvider } from './components/ToastProvider';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import CustomerSupportChat from './components/CustomerSupportChat';
import SkinConsultantChat from './components/SkinConsultantChat';

// Inner component that uses the Auth context
const TokenHandlerInner = () => {
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const checkUrlForToken = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const accessToken = queryParams.get('accessToken');
      
      if (accessToken) {
        try {
          console.log('Found access token in URL, processing...');
          
          // Store token in localStorage
          localStorage.setItem('accessToken', accessToken);
          
          // Update token in context
          setToken(accessToken);
          
          // Fetch user data
          console.log('Fetching user profile with token');
          const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('User data fetched successfully:', userData);
            
            // Store user data in localStorage for better persistence
            localStorage.setItem('user', JSON.stringify(userData.user));
            
            // Update user in context
            setUser(userData.user);
          } else {
            console.error('Failed to fetch user profile:', await response.text());
          }
          
          // Clean the URL by removing the token
          const url = new URL(window.location);
          url.searchParams.delete('accessToken');
          window.history.replaceState({}, document.title, url.toString());
        } catch (error) {
          console.error('Error processing access token:', error);
        }
      } else {
        // Check if we have a token and user data in localStorage
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // If we have stored user data, use it to restore the session
            const userData = JSON.parse(storedUser);
            console.log('Restoring user session from localStorage:', userData);
            setUser(userData);
            setToken(storedToken);
          } catch (error) {
            console.error('Error restoring user session:', error);
          }
        }
      }
    };
    
    checkUrlForToken();
  }, [setToken, setUser]);
  
  return null; // This component doesn't render anything
};

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }>
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <ShopProvider>
                <AdminProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                      <TokenHandlerInner />
                      <Navbar />
                      <div className="relative">
                        <AppRoutes />
                        <div className="sticky bottom-0 right-0 w-full">
                          <CustomerSupportChat />
                          <SkinConsultantChat />
                        </div>
                      </div>
                    </div>
                  </ToastProvider>
                </AdminProvider>
              </ShopProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </Suspense>
    </Router>
  );
}

export default App;

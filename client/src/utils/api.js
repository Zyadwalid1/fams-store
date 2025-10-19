// API Configuration utility
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

// Create full API endpoint URL
const createApiUrl = (endpoint) => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
};

// Create auth headers
const createAuthHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const authToken = token || localStorage.getItem('accessToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  return headers;
};

// API request wrapper with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = createApiUrl(endpoint);
  const config = {
    headers: createAuthHeaders(options.token),
    ...options,
  };
  
  // Remove token from options to avoid sending it in the request body
  delete config.token;
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export {
  getApiUrl,
  getSocketUrl,
  createApiUrl,
  createAuthHeaders,
  apiRequest
};

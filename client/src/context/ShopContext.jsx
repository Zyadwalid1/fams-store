import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaMars, FaVenus } from 'react-icons/fa';
import useProductFetch from '../hooks/useProductFetch';
import useCategoryFetch from '../hooks/useCategoryFetch';

// Default categories (now used only as fallback)
export const defaultCategories = [
  { 
    id: 'makeup',
    name: 'Makeup', 
    description: 'Discover our wide range of makeup products',
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80'
  },
  { 
    id: 'fragrances',
    name: 'Fragrances', 
    description: 'Experience luxury scents and perfumes',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80'
  },
  { 
    id: 'tools-and-brushes',
    name: 'Tools & Brushes', 
    description: 'Professional beauty tools and accessories',
    icon: '🖌️',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80'
  }
];

// Define subcategories structure for reference
export const categoryStructure = {
  makeup: {
    types: [
      { id: 'face', name: 'Face', subtypes: ['All face', 'Foundation', 'Concealer', 'Face Primer', 'Highlighter', 'Contour'] },
      { id: 'eye', name: 'Eye', subtypes: ['All eye', 'Mascara', 'Eyeliner', 'Eyebrow', 'Eyeshadow'] },
      { id: 'lip', name: 'Lip', subtypes: ['All lip', 'Lip Gloss', 'Lipstick', 'Lip Oil', 'Liquid Lipstick', 'Lip Liner'] },
      { id: 'cheek', name: 'Cheek', subtypes: ['All cheek', 'Blusher', 'Bronzer', 'Highlighter', 'Contour'] }
    ]
  },
  fragrances: {
    types: [
      { id: 'women', name: 'Women', icon: <FaVenus />, subtypes: ['All Women', 'Perfumes'] },
      { id: 'men', name: 'Men', icon: <FaMars />, subtypes: [] }
    ]
  },
  'tools-and-brushes': {
    types: [
      { id: 'face-brushes', name: 'Face Brushes', subtypes: [] },
      { id: 'eye-brushes', name: 'Eye Brushes', subtypes: [] },
      { id: 'lip-brushes', name: 'Lip Brushes', subtypes: [] },
      { id: 'brush-sets', name: 'Brush Sets', subtypes: [] },
      { id: 'sponges', name: 'Sponges', subtypes: [] },
      { id: 'applicators', name: 'Applicators', subtypes: [] },
      { id: 'lash-tools', name: 'Lash Tools', subtypes: [] },
      { id: 'brush-care', name: 'Brush Care', subtypes: [] }
    ]
  }
};

// List of popular brands for reference
export const popularBrands = [
  'MAC', 'Maybelline', 'L\'Oréal', 'NYX', 'Chanel', 'Dior', 'Estée Lauder', 
  'Fenty Beauty', 'Revlon', 'Clinique', 'Urban Decay', 'NARS', 'Lancôme', 
  'Yves Saint Laurent', 'Benefit'
];

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  // State for cart and wishlist will be managed by backend
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState({});
  const [popularBrands, setPopularBrands] = useState([]);

  // Use the custom hooks for product and category data
  const { 
    products, 
    featuredProducts, 
    newArrivals, 
    isLoading: productsLoading, 
    error: productsError,
    fetchProducts 
  } = useProductFetch();
  
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategoryFetch();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update loading and error states based on products and categories loading
  useEffect(() => {
    if (productsError) {
      setError(productsError);
    } else if (categoriesError) {
      setError(categoriesError);
    }
    
    // Only set loading to false when both products and categories are loaded
    if (!productsLoading && !categoriesLoading) {
      setIsLoading(false);
    }

    // Debug log for popular brands
    console.log('ShopContext popularBrands:', popularBrands);
  }, [productsLoading, productsError, categoriesLoading, categoriesError, popularBrands]);

  // Separate useEffect specifically for fetching popular brands
  useEffect(() => {
    const fetchPopularBrands = async () => {
      try {
        console.log('ShopContext: Fetching popular brands...');
        const brandsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/brands?featured=true`);
        
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          if (brandsData.brands && Array.isArray(brandsData.brands)) {
            setPopularBrands(brandsData.brands);
            console.log('ShopContext: Fetched popular brands successfully:', brandsData.brands.length);
          } else {
            console.error('ShopContext: Unexpected brands API response format:', brandsData);
            // Try fetching all brands as a fallback
            const allBrandsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/brands`);
            if (allBrandsResponse.ok) {
              const allBrandsData = await allBrandsResponse.json();
              if (allBrandsData.brands && Array.isArray(allBrandsData.brands)) {
                setPopularBrands(allBrandsData.brands);
                console.log('ShopContext: Fetched all brands as fallback:', allBrandsData.brands.length);
              } else {
                setDefaultBrands();
              }
            } else {
              setDefaultBrands();
            }
          }
        } else {
          console.error('ShopContext: Failed to fetch popular brands, status:', brandsResponse.status);
          setDefaultBrands();
        }
      } catch (err) {
        console.error('ShopContext: Failed to fetch popular brands:', err);
        setDefaultBrands();
      }
    };

    // Helper function to set default brands if API fails
    const setDefaultBrands = () => {
      console.log('ShopContext: Setting default popular brands');
      const defaultBrands = [
        { _id: '67f70fab7d424ec9e815ab30', name: 'Maybelline', category: 'affordable', featured: true },
        { _id: '67f70fab7d424ec9e815ab31', name: 'L\'Oréal', category: 'affordable', featured: true },
        { _id: '67f70fab7d424ec9e815ab32', name: 'MAC', category: 'luxury', featured: true },
        { _id: '67f70fab7d424ec9e815ab33', name: 'NYX', category: 'affordable', featured: true },
        { _id: '67f70fab7d424ec9e815ab34', name: 'Dior', category: 'luxury', featured: true },
        { _id: '67f70fab7d424ec9e815ab35', name: 'Fenty Beauty', category: 'luxury', featured: true },
        { _id: '67f70fab7d424ec9e815ab36', name: 'Huda Beauty', category: 'luxury', featured: true },
        { _id: '67f70fab7d424ec9e815ab37', name: 'Essence', category: 'affordable', featured: true },
        // Local brands
        { _id: '67f70fab7d424ec9e815ab44', name: 'Mikyajy', category: 'local', featured: true },
        { _id: '67f70fab7d424ec9e815ab45', name: 'Krylon', category: 'local', featured: true },
        { _id: '67f70fab7d424ec9e815ab46', name: 'Delta', category: 'local', featured: true },
        { _id: '67f70fab7d424ec9e815ab47', name: 'Luna', category: 'local', featured: true },
        { _id: '67f70fab7d424ec9e815ab48', name: 'Mora', category: 'local', featured: true }
      ];
      setPopularBrands(defaultBrands);
    };

    fetchPopularBrands();
  }, []);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch cart and wishlist data if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const cartResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              setCart(cartData.data.items || []);
            }
            
            const wishlistResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wishlist`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (wishlistResponse.ok) {
              const wishlistData = await wishlistResponse.json();
              setWishlist(wishlistData.data || []);
            }
          } catch (err) {
            console.error('Failed to fetch cart/wishlist:', err);
          }
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load data');
      }
    };

    fetchInitialData();
  }, []);

  // Search functionality will be handled by backend
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // TODO: Implement backend search
    // const searchProducts = async () => {
    //   try {
    //     const response = await fetch(`/api/products/search?q=${searchQuery}`);
    //     const data = await response.json();
    //     setSearchResults(data);
    //   } catch (err) {
    //     setError(err.message);
    //     toast.error('Search failed');
    //   }
    // };
    
    // searchProducts();
  }, [searchQuery]);

  // Filter products will be handled by backend
  useEffect(() => {
    // TODO: Implement backend filtering
    // const filterProducts = async () => {
    //   try {
    //     const params = new URLSearchParams();
    //     if (selectedCategory !== 'all') params.append('category', selectedCategory);
    //     if (selectedType) params.append('type', selectedType);
    //     if (selectedSubtype) params.append('subtype', selectedSubtype);
    //     if (selectedBrand) params.append('brand', selectedBrand);
        
    //     const response = await fetch(`/api/products?${params.toString()}`);
    //     const data = await response.json();
    //     setFilteredProducts(data);
    //   } catch (err) {
    //     setError(err.message);
    //     toast.error('Failed to filter products');
    //   }
    // };
    
    // filterProducts();
  }, [selectedCategory, selectedType, selectedSubtype, selectedBrand]);

  // Cart operations will be handled by backend
  const addToCart = async (product, quantity = 1) => {
    try {
      // Enhanced validation with more specific checks
      if (!product) {
        console.error('Product is null or undefined');
        toast.error('Invalid product data');
        return;
      }
      
      // Check for product ID (could be id or _id depending on your API)
      const productId = product.id || product._id;
      if (!productId) {
        console.error('Invalid product ID:', product);
        toast.error('Product ID is missing');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to add items to cart');
        return;
      }
      
      // Log token for debugging (remove in production)
      console.log('Using token for cart request:', token.substring(0, 15) + '...');
      console.log('Adding to cart - Product:', productId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity
        })
      });
      
      // Handle server errors more robustly
      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText);
        
        // Try to get error details if possible
        let errorMessage = `Server error (${response.status})`;
        try {
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        toast.error(errorMessage);
        return; // Exit early to prevent further processing
      }
      
      // Process successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse successful response:', parseError);
        toast.error('Unexpected response from server');
        return;
      }
      
      // Safely update cart with null checks
      if (data && data.data && Array.isArray(data.data.items)) {
        setCart(data.data.items);
        toast.success('Added to cart!');
      } else {
        console.error('Invalid response format:', data);
        toast.error('Item added but failed to update cart view');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to manage your cart');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from cart');
      }
      
      const data = await response.json();
      setCart(data.data.items);
      toast.success('Removed from cart!');
    } catch (err) {
      console.error('Remove from cart error:', err);
      toast.error(err.message || 'Failed to remove from cart');
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to manage your cart');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }
      
      const data = await response.json();
      setCart(data.data.items);
    } catch (err) {
      console.error('Update quantity error:', err);
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const toggleWishlist = async (product) => {
    try {
      // Enhanced validation with more specific checks
      if (!product) {
        console.error('Product is null or undefined');
        toast.error('Invalid product data');
        return;
      }
      
      // Check for product ID (could be id or _id depending on your API)
      const productId = product.id || product._id;
      if (!productId) {
        console.error('Invalid product ID:', product);
        toast.error('Product ID is missing');
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to manage your wishlist');
        return;
      }
      
      // Log token for debugging (remove in production)
      console.log('Using token for wishlist request:', token.substring(0, 15) + '...');
      console.log('Toggling wishlist - Product:', productId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId
        })
      });
      
      // Handle server errors more robustly
      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText);
        
        // Try to get error details if possible
        let errorMessage = `Server error (${response.status})`;
        try {
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        toast.error(errorMessage);
        return; // Exit early to prevent further processing
      }
      
      // Process successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse successful response:', parseError);
        toast.error('Unexpected response from server');
        return;
      }
      
      // Refresh wishlist data after toggling
      try {
        const wishlistResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          if (wishlistData && wishlistData.data) {
            setWishlist(wishlistData.data || []);
          } else {
            console.error('Invalid wishlist data format:', wishlistData);
          }
        } else {
          console.error('Failed to fetch updated wishlist:', wishlistResponse.status);
        }
      } catch (refreshError) {
        console.error('Error refreshing wishlist data:', refreshError);
      }
      
      toast.success(data.message || 'Wishlist updated!');
    } catch (err) {
      console.error('Wishlist error:', err);
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to manage your cart');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart');
      }
      
      setCart([]);
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Clear cart error:', err);
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Filter operations
  const applyFilters = (filters) => {
    if (filters.category) {
      setSelectedCategory(filters.category);
    }
    if (filters.type) {
      setSelectedType(filters.type);
    }
    if (filters.subtype) {
      setSelectedSubtype(filters.subtype);
    }
    if (filters.brand) {
      setSelectedBrand(filters.brand);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('');
    setSelectedSubtype('');
    setSelectedBrand('');
  };

  // Product operations will be handled by backend
  const addProduct = async (product) => {
    try {
      // TODO: Implement backend product operations
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product)
      // });
      // const data = await response.json();
      // setProducts(prev => [...prev, data]);
      toast.success('Product added successfully');
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (productId, updatedProduct) => {
    try {
      // TODO: Implement backend product operations
      // const response = await fetch(`/api/products/${productId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProduct)
      // });
      // const data = await response.json();
      // setProducts(prev => prev.map(p => p.id === productId ? data : p));
      toast.success('Product updated successfully');
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      // TODO: Implement backend product operations
      // await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      // setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Review operations will be handled by backend
  const getReviews = async (productId) => {
    try {
      // TODO: Implement backend review operations
      // const response = await fetch(`/api/products/${productId}/reviews`);
      // const data = await response.json();
      // setReviews(prev => ({ ...prev, [productId]: data }));
      return reviews[productId] || [];
    } catch (err) {
      toast.error('Failed to fetch reviews');
      return [];
    }
  };

  const addReview = async (reviewData) => {
    try {
      // TODO: Implement backend review operations
      // const response = await fetch(`/api/products/${reviewData.productId}/reviews`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reviewData)
      // });
      // const data = await response.json();
      // setReviews(prev => ({
      //   ...prev,
      //   [reviewData.productId]: [...(prev[reviewData.productId] || []), data]
      // }));
      toast.success('Review added successfully');
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  const value = {
    // State
    cart,
    wishlist,
    products,
    featuredProducts,
    newArrivals,
    reviews,
    categories,
    categoryStructure,
    popularBrands,
    searchQuery,
    searchResults,
    selectedCategory,
    selectedType,
    selectedSubtype,
    selectedBrand,
    filteredProducts,
    isLoading,
    error,

    // Actions
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    clearCart,
    getCartTotal,
    applyFilters,
    resetFilters,
    addProduct,
    updateProduct,
    deleteProduct,
    getReviews,
    addReview,
    fetchProducts,
    fetchCategories
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}; 
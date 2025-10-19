import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const useProductFetch = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatProduct = (product) => {
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      rating: product.rating?.average || 4.5,
      image: product.photos && product.photos.length > 0 
        ? product.photos[0].secure_url 
        : 'https://via.placeholder.com/300',
      stock: product.stock,
      category: product.category,
      brand: product.brand,
      featured: product.featured,
      newArrival: product.newArrival,
      description: product.description
    };
  };

  const fetchProducts = useCallback(async (limit = 8) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data.products && Array.isArray(data.products)) {
        // Standard response format from our API
        const formattedProducts = data.products.map(formatProduct);
        setProducts(formattedProducts);
        
        // Filter featured products and new arrivals
        setFeaturedProducts(formattedProducts.filter(p => p.featured));
        setNewArrivals(formattedProducts.filter(p => p.newArrival));
      } else if (data.data && Array.isArray(data.data)) {
        // Alternative response format {data: [...]}
        const formattedProducts = data.data.map(formatProduct);
        setProducts(formattedProducts);
        
        setFeaturedProducts(formattedProducts.filter(p => p.featured));
        setNewArrivals(formattedProducts.filter(p => p.newArrival));
      } else if (Array.isArray(data)) {
        // Simple array response format
        const formattedProducts = data.map(formatProduct);
        setProducts(formattedProducts);
        
        setFeaturedProducts(formattedProducts.filter(p => p.featured));
        setNewArrivals(formattedProducts.filter(p => p.newArrival));
      } else {
        // Fallback with mock data if API response is not as expected
        console.warn('API response format unexpected, using fallback data');
        loadFallbackData();
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      toast.error('Failed to load products');
      
      // Load fallback data in case of error
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to load fallback data
  const loadFallbackData = () => {
    const fallbackProducts = [
      {
        id: '1',
        name: 'Premium Lipstick',
        price: 149.99,
        discount: 10,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=500',
        stock: 15,
        category: 'makeup',
        brand: 'MAC',
        featured: true,
        newArrival: true
      },
      {
        id: '2',
        name: 'Foundation',
        price: 249.99,
        discount: 0,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1631214499983-16e4751847e6?auto=format&fit=crop&q=80&w=500',
        stock: 8,
        category: 'makeup',
        brand: 'Maybelline',
        featured: true,
        newArrival: false
      },
      {
        id: '3',
        name: 'Floral Perfume',
        price: 349.99,
        discount: 15,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1619994403073-2cec99c41e9b?auto=format&fit=crop&q=80&w=500',
        stock: 12,
        category: 'fragrances',
        brand: 'Chanel',
        featured: true,
        newArrival: true
      },
      {
        id: '4',
        name: 'Makeup Brushes Set',
        price: 199.99,
        discount: 5,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80&w=500',
        stock: 20,
        category: 'tools-and-brushes',
        brand: 'Sephora',
        featured: false,
        newArrival: true
      }
    ];
    
    setProducts(fallbackProducts);
    setFeaturedProducts(fallbackProducts.filter(p => p.featured));
    setNewArrivals(fallbackProducts.filter(p => p.newArrival));
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    featuredProducts,
    newArrivals,
    isLoading,
    error,
    fetchProducts
  };
};

export default useProductFetch; 
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const useCategoryFetch = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCategory = (category) => {
    return {
      id: category._id || category.id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🛍️',
      image: category.image || `https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80`,
      types: category.types || []
    };
  };

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try fetching from the product-categories endpoint first
      let response = await fetch(`${API_URL}/product-categories`);
      
      // If that fails, try the categories endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/categories`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data.categories && Array.isArray(data.categories)) {
        const formattedCategories = data.categories.map(formatCategory);
        setCategories(formattedCategories);
      } else if (data.data && Array.isArray(data.data)) {
        const formattedCategories = data.data.map(formatCategory);
        setCategories(formattedCategories);
      } else if (Array.isArray(data)) {
        const formattedCategories = data.map(formatCategory);
        setCategories(formattedCategories);
      } else {
        // Fallback with predefined categories
        console.warn('API response format unexpected, using fallback data');
        loadFallbackCategories();
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      // Load fallback data if fetch fails
      loadFallbackCategories();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFallbackCategories = () => {
    const fallbackCategories = [
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
    
    setCategories(fallbackCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories
  };
};

export default useCategoryFetch; 
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { FaFilter, FaSearch, FaStar, FaSprayCan, FaPaintBrush, FaRegEye, FaRegKissWinkHeart, FaRegSmile, FaShoppingBag, FaGem, FaPiggyBank, FaMars, FaVenus, FaTimes, FaHeart } from 'react-icons/fa';
import { IoColorPalette, IoWater } from 'react-icons/io5';
import { PiMaskHappy, PiEyedropper, PiSparkle, PiMaskSad, PiPaintBrushBroad, PiPencil } from 'react-icons/pi';
import { GiLipstick, GiPowder, GiEyelashes, GiPerfumeBottle } from 'react-icons/gi';
import { BsDroplet, BsMagic, BsStars } from 'react-icons/bs';
import { TbSpray, TbBrush } from 'react-icons/tb';
import { useShop } from '../context/ShopContext';

const categoryDefaults = [
  { 
    id: 'brands',
    name: 'Brands', 
    description: 'Shop your favorite luxury beauty brands',
    icon: '✨',
    subcategories: {
      affordable: {
        title: ' Affordable Brands',
        brands: [
          'Essence',
          'L\'Oréal',
          'Maybelline',
          'Golden Rose',
          'Catrice',
          'Cybele',
          'Revolution',
          'NYX',
          'Sheglam'
        ]
      },
      luxury: {
        title: ' Luxury Brands',
        brands: [
          'Dior',
          'Fenty',
          'Kiko',
          'Rhode',
          'YSL',
          'Rare Beauty',
          'Huda Beauty'
        ]
      }
    }
  },
  { 
    id: 'makeup',
    name: 'Makeup', 
    description: 'Discover our wide range of makeup products',
    icon: '💄'
  },
  { 
    id: 'fragrances',
    name: 'Fragrances', 
    description: 'Experience luxury scents and perfumes',
    icon: '🌸'
  },
  { 
    id: 'tools-and-brushes',
    name: 'Tools & Brushes', 
    description: 'Professional beauty tools and accessories',
    icon: '🖌️'
  }
];

const makeupIcons = {
  face: {
    icon: <FaRegSmile className="w-4 h-4" />,
    subcategories: {
      'All face': <PiMaskHappy className="w-4 h-4" />,
      'Foundation': <GiPowder className="w-4 h-4" />,
      'Concealer': <PiMaskSad className="w-4 h-4" />,
      'Face Primer': <BsDroplet className="w-4 h-4" />,
      'Highlighter': <BsStars className="w-4 h-4" />,
      'Contour': <IoColorPalette className="w-4 h-4" />
    }
  },
  eye: {
    icon: <FaRegEye className="w-4 h-4" />,
    subcategories: {
      'All eye': <FaRegEye className="w-4 h-4" />,
      'Mascara': <GiEyelashes className="w-4 h-4" />,
      'Eyeliner': <PiPencil className="w-4 h-4" />,
      'Eyebrow': <PiPaintBrushBroad className="w-4 h-4" />,
      'Eyeshadow': <BsMagic className="w-4 h-4" />
    }
  },
  lip: {
    icon: <FaRegKissWinkHeart className="w-4 h-4" />,
    subcategories: {
      'All lip': <GiLipstick className="w-4 h-4" />,
      'Lip Gloss': <BsDroplet className="w-4 h-4" />,
      'Lipstick': <GiLipstick className="w-4 h-4" />,
      'Lip Oil': <IoWater className="w-4 h-4" />,
      'Liquid Lipstick': <PiEyedropper className="w-4 h-4" />,
      'Lip Liner': <PiPencil className="w-4 h-4" />
    }
  },
  cheek: {
    icon: <PiSparkle className="w-4 h-4" />,
    subcategories: {
      'All cheek': <PiSparkle className="w-4 h-4" />,
      'Blusher': <IoColorPalette className="w-4 h-4" />,
      'Bronzer': <BsMagic className="w-4 h-4" />,
      'Highlighter': <BsStars className="w-4 h-4" />,
      'Contour': <PiPaintBrushBroad className="w-4 h-4" />
    }
  }
};

const CategoryNav = ({ activeCategory, onSelectCategory }) => {
  const { categories, isLoading } = useShop();
  
  // For debugging
  useEffect(() => {
    if (categories && categories.length > 0) {
      console.log('Category Nav Categories:', categories.map(c => ({ 
        id: c._id || c.id, 
        name: c.name 
      })));
    }
  }, [categories]);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Desktop navigation */}
        <div className="hidden sm:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-lg">
          <div className="flex items-center p-1.5 gap-2">
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex-1 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-base">🌟</span>
              <span>All Products</span>
            </button>
            
            {!isLoading && categories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() => onSelectCategory(category._id || category.id)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex-1 ${
                  activeCategory === (category._id || category.id)
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile navigation - vertical layout */}
        <div className="sm:hidden bg-white/90 dark:bg-gray-800/90 shadow-lg rounded-xl">
          <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-700">
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex items-center justify-between p-4 transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-primary/90 to-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${
                  activeCategory === 'all' 
                    ? 'bg-white/20' 
                    : 'bg-primary/10'
                }`}>
                  <span className="text-xl">🌟</span>
                </div>
                <span className="font-medium">All Products</span>
              </div>
              {activeCategory === 'all' && (
                <div className="w-2 h-8 bg-white rounded-full"></div>
              )}
            </button>
            
            {!isLoading && categories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() => onSelectCategory(category._id || category.id)}
                className={`flex items-center justify-between p-4 transition-all duration-300 ${
                  activeCategory === (category._id || category.id)
                    ? 'bg-gradient-to-r from-primary/90 to-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${
                    activeCategory === (category._id || category.id)
                      ? 'bg-white/20' 
                      : 'bg-primary/10'
                  }`}>
                    <span className="text-xl">{category.icon || '🛍️'}</span>
          </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                {activeCategory === (category._id || category.id) && (
                  <div className="w-2 h-8 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);
  
  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    addToCart(product, 1)
      .finally(() => {
        setIsAddingToCart(false);
      });
  };
  
  // Handle toggle wishlist
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingWishlist(true);
    toggleWishlist(product)
      .finally(() => {
        setIsTogglingWishlist(false);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="relative pt-[100%] overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10" />
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 ease-out"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium z-20 shadow-lg">
                {product.discount}% OFF
              </div>
            )}
            
            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              {/* Wishlist button */}
              <button 
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${
                  isInWishlist 
                    ? 'bg-primary/90 text-white' 
                    : 'bg-white/90 text-gray-800 hover:bg-primary/90 hover:text-white'
                }`}
              >
                {isTogglingWishlist ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  <FaHeart className="w-5 h-5" />
                )}
              </button>
              
              {/* Add to cart button */}
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="p-3 bg-white/90 text-gray-800 hover:bg-primary/90 hover:text-white rounded-full shadow-lg backdrop-blur-md transition-all duration-300"
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  <FaShoppingBag className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (product.rating || 5)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="transform group-hover:scale-105 transition-transform duration-300">
                {product.discount > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-primary dark:text-primary-400 font-semibold">
                      {((product.price) * (1 - product.discount / 100)).toFixed(2)} EGP
                    </span>
                    <span className="text-gray-500 text-sm line-through">
                      {product.price} EGP
                    </span>
                  </div>
                ) : (
                  <span className="text-primary dark:text-primary-400 font-semibold">
                    {product.price} EGP
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CategoryFilter = ({ isOpen, onClose, category, searchParams, updateURL }) => {
  const { categories, isLoading } = useShop();
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Get active filters from URL
  const activeType = searchParams.get('type');
  const activeSubtype = searchParams.get('subtype');
  
  // Find the selected category from categories list
  useEffect(() => {
    if (category && categories.length > 0) {
      const foundCategory = categories.find(c => (c._id === category || c.id === category));
      if (foundCategory) {
        setSelectedCategory(foundCategory);
      }
    }
  }, [category, categories]);
  
  if (!isOpen || isLoading || !selectedCategory) return null;
  
  // Handle type selection
  const handleTypeSelect = (typeId) => {
    // If clicking the already active type, deselect it
    if (activeType === typeId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('type');
      newParams.delete('subtype'); // Also clear subtype since type is being cleared
      updateURL(newParams.toString());
    } else {
      updateURL({ type: typeId, subtype: '' });
    }
  };
  
  // Handle subtype selection
  const handleSubtypeSelect = (subtypeId) => {
    // If clicking the already active subtype, deselect it
    if (activeSubtype === subtypeId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('subtype');
      updateURL(newParams.toString());
    } else {
      updateURL({ subtype: subtypeId });
    }
  };
  
  // Get available types for the selected category
  const types = selectedCategory.types || [];
  
  // Get available subtypes for the selected type
  const subtypes = activeType 
    ? types.find(t => t._id === activeType)?.subtypes || []
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
        <button 
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="p-4 divide-y divide-gray-100 dark:divide-gray-700">
        {/* Types */}
        {types.length > 0 && (
          <div className="py-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              {selectedCategory.name} Types
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {types.map((type) => (
                <button
                  key={type._id}
                  onClick={() => handleTypeSelect(type._id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    activeType === type._id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Subtypes - only show if a type is selected */}
        {activeType && subtypes.length > 0 && (
          <div className="py-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Subtypes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subtypes.map((subtype) => (
                <button
                  key={subtype._id}
                  onClick={() => handleSubtypeSelect(subtype._id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    activeSubtype === subtype._id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {subtype.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const Shop = () => {
  const { products: allProducts, categories, popularBrands, isLoading: contextLoading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeNames, setTypeNames] = useState({});
  const [subtypeNames, setSubtypeNames] = useState({});
  const [brandNames, setBrandNames] = useState({});
  const location = useLocation();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 16; // Changed to 16 products per page as requested

  // Get active filters from URL
  const activeType = searchParams.get('type');
  const activeSubtype = searchParams.get('subtype');
  const activeBrand = searchParams.get('brand');

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Update URL with page parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page);
    setSearchParams(newSearchParams);
    
    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle initial URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      // First check if it's a valid MongoDB ObjectID
      const isValidObjectID = /^[0-9a-fA-F]{24}$/.test(categoryParam);
      
      if (isValidObjectID) {
        // It's already a valid MongoDB ObjectID, we can use it directly
        console.log('Using valid ObjectID from URL:', categoryParam);
        setActiveCategory(categoryParam);
        setIsFilterOpen(true);
      } else if (categories && categories.length > 0) {
        // Check if we can find a category with this ID
        const categoryById = categories.find(cat => cat._id === categoryParam);
        
        if (categoryById) {
          console.log('Found category by ID:', categoryById.name);
          setActiveCategory(categoryById._id);
          setIsFilterOpen(true);
        } else {
          // It might be a name, so find by name (case-insensitive)
          const categoryByName = categories.find(cat => 
            cat.name.toLowerCase() === categoryParam.toLowerCase()
          );
          
          if (categoryByName) {
            console.log('Found category by name:', categoryByName.name);
            // Update the URL with the ID instead of name
            const newParams = new URLSearchParams(searchParams);
            newParams.set('category', categoryByName._id);
            setSearchParams(newParams);
            setActiveCategory(categoryByName._id);
            setIsFilterOpen(true);
          } else {
            console.warn('Unknown category:', categoryParam);
            // We'll use it as-is but it likely won't find products
            setActiveCategory(categoryParam);
            setIsFilterOpen(true);
          }
        }
      } else {
        // Categories aren't loaded yet, use as is for now
        console.log('Categories not loaded yet, using param as-is:', categoryParam);
        setActiveCategory(categoryParam);
        setIsFilterOpen(true);
      }
    } else {
      setActiveCategory('all');
      setIsFilterOpen(false);
    }
  }, [searchParams, categories]);

  // Load type, subtype and brand names
  useEffect(() => {
    // Create a map of type IDs to names
    const typesMap = {};
    const subtypesMap = {};
    
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        if (category.types && category.types.length > 0) {
          category.types.forEach(type => {
            typesMap[type._id] = type.name;
            
            // Add subtypes
            if (type.subtypes && type.subtypes.length > 0) {
              type.subtypes.forEach(subtype => {
                subtypesMap[subtype._id] = subtype.name;
              });
            }
          });
        }
      });
    }
    
    setTypeNames(typesMap);
    setSubtypeNames(subtypesMap);
    
    // Create a map of brand IDs to names
    const brandsMap = {};
    if (popularBrands && popularBrands.length > 0) {
      popularBrands.forEach(brand => {
        brandsMap[brand._id || brand.id] = brand.name;
      });
    }
    setBrandNames(brandsMap);
  }, [categories, popularBrands]);

  // Function to get display name for a type ID
  const getTypeName = (typeId) => {
    return typeNames[typeId] || typeId;
  };
  
  // Function to get display name for a subtype ID
  const getSubtypeName = (subtypeId) => {
    return subtypeNames[subtypeId] || subtypeId;
  };
  
  // Function to get display name for a brand ID
  const getBrandName = (brandId) => {
    return brandNames[brandId] || brandId;
  };

  // Function to remove a filter
  const removeFilter = (filterType) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(filterType);
    setSearchParams(newSearchParams);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (activeCategory !== 'all') {
      newSearchParams.set('category', activeCategory);
    }
    setSearchParams(newSearchParams);
    setSearchQuery('');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Ensure we have brands data when no category is selected
  useEffect(() => {
    // Initialize popularBrands with fallback data if empty
    if (!popularBrands || popularBrands.length === 0) {
      console.log('No popular brands available in context, using fallback data');
      // Create a valid MongoDB ObjectID-like string (exactly 24 hex characters)
      const createFakeId = (name, index) => {
        // Start with a fixed prefix to ensure it's consistent
        const prefix = '67f70fab7d424ec9e815ab';
        // Add a suffix based on index to make each ID unique but stable
        const suffix = (30 + index).toString().padStart(2, '0');
        return prefix + suffix;
      };
      
      // Set some default brands directly in the component state
      const defaultBrands = [
        { _id: createFakeId('Maybelline', 0), name: 'Maybelline' },
        { _id: createFakeId('Loreal', 1), name: 'L\'Oréal' },
        { _id: createFakeId('Mac', 2), name: 'MAC' },
        { _id: createFakeId('Nyx', 3), name: 'NYX' },
        { _id: createFakeId('Dior', 4), name: 'Dior' },
        { _id: createFakeId('Fenty', 5), name: 'Fenty Beauty' },
        { _id: createFakeId('Huda', 6), name: 'Huda Beauty' },
        { _id: createFakeId('Essence', 7), name: 'Essence' }
      ];
      
      // Update the brands map for display names
      const brandsMap = {};
      defaultBrands.forEach(brand => {
        brandsMap[brand._id] = brand.name;
      });
      setBrandNames(brandsMap);
      
      // Create a local state for brands if not available from context
      window.shopLocalBrands = defaultBrands;
    } else {
      console.log(`Found ${popularBrands.length} popular brands in context`);
      window.shopLocalBrands = null; // Clear local override if context has brands
    }
  }, [popularBrands]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    console.log('Selected category ID:', categoryId);
    
    // Create new search params
    const newSearchParams = new URLSearchParams();
    
    if (categoryId === 'all') {
      // Clear filters if 'all' is selected
      setIsFilterOpen(false);
      
      // First update the state for immediate UI update
      setActiveCategory('all');
      
      // Then update the URL which will trigger the data fetch
      setSearchParams(newSearchParams);
    } else {
      // First validate that it's a proper MongoDB ObjectID
      if (categoryId && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
        // Set for UI update
        setActiveCategory(categoryId);
        setIsFilterOpen(true);
        
        // Update URL params which will trigger data fetch
      newSearchParams.set('category', categoryId);
        setSearchParams(newSearchParams);
      } else {
        console.warn('Invalid category ID format:', categoryId);
        // Try to find the matching category object
        const category = categories.find(c => c.name === categoryId);
        if (category && category._id) {
          // Set for UI update
          setActiveCategory(category._id);
      setIsFilterOpen(true);
          
          // Update URL params which will trigger data fetch
          newSearchParams.set('category', category._id);
    setSearchParams(newSearchParams);
        } else {
          console.error('Could not find valid category ID for:', categoryId);
        }
      }
    }
  };

  // Update URL without removing existing params
  const updateURL = (params) => {
    if (typeof params === 'string') {
      setSearchParams(params);
      return;
    }
    
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        // Ensure we're using the correct ID format for category-related parameters
        if (key === 'category' || key === 'type' || key === 'subtype' || key === 'brand') {
          // Check if it's a valid MongoDB ObjectID
          if (/^[0-9a-fA-F]{24}$/.test(value)) {
        newSearchParams.set(key, value);
          } else {
            console.warn(`Invalid ${key} ID format:`, value);
            // For category, try to convert name to ID if possible
            if (key === 'category' && categories && categories.length > 0) {
              const categoryByName = categories.find(cat => cat.name === value);
              if (categoryByName && categoryByName._id) {
                newSearchParams.set(key, categoryByName._id);
              } else {
                // Leave it out if we can't match it
                console.error(`Could not find valid ${key} ID for:`, value);
                newSearchParams.delete(key);
              }
            } else {
              // Leave it out to avoid 400 Bad Request
              newSearchParams.delete(key);
            }
          }
        } else {
        newSearchParams.set(key, value);
        }
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  // Fetch products from backend when filters change
  useEffect(() => {
    // Prevent initial double fetch using a ref
    const fetchRef = { current: false };
    
    const fetchProducts = async () => {
      // Skip if this is a duplicate call
      if (fetchRef.current) return;
      fetchRef.current = true;
      
      console.log('Fetching products with active category:', activeCategory);
      setLoading(true);
      try {
        // Build query parameters for API call
        const queryParams = new URLSearchParams();
        
        if (activeCategory && activeCategory !== 'all') {
          // Check if the category ID is a valid MongoDB ObjectID
          const isValidObjectID = /^[0-9a-fA-F]{24}$/.test(activeCategory);
          
          if (isValidObjectID) {
            // It's already a valid MongoDB ObjectID
            queryParams.set('category', activeCategory);
          } else if (categories && categories.length > 0) {
            // Try to find the category by name and use its ID
            const categoryByName = categories.find(cat => 
              cat.name?.toLowerCase() === activeCategory?.toLowerCase()
            );
            
            if (categoryByName && categoryByName._id) {
              console.log('Found category by name:', categoryByName.name, categoryByName._id);
              queryParams.set('category', categoryByName._id);
            } else {
              console.warn('Could not find category ID for:', activeCategory);
              // Don't set the parameter to avoid 400 Bad Request
            }
          } else {
            console.warn('Categories not loaded yet, skipping category filter');
            // Don't set the parameter to avoid 400 Bad Request  
          }
        }
        
        if (activeType) {
          // Check if type is a valid MongoDB ObjectID
          if (/^[0-9a-fA-F]{24}$/.test(activeType)) {
            queryParams.set('type', activeType);
          } else {
            console.warn('Invalid type ID format, skipping type filter');
          }
        }
        
        if (activeSubtype) {
          // Check if subtype is a valid MongoDB ObjectID
          if (/^[0-9a-fA-F]{24}$/.test(activeSubtype)) {
            queryParams.set('subtype', activeSubtype);
          } else {
            console.warn('Invalid subtype ID format, skipping subtype filter');
          }
        }
        
        if (activeBrand) {
          // Decode the brand name from URL encoding
          const decodedBrand = decodeURIComponent(activeBrand);
          // Send the brand parameter with a special prefix to indicate
          // we want fuzzy matching on the server side
          queryParams.set('brand', `fuzzy:${decodedBrand}`);
          console.log('Using fuzzy brand matching for:', decodedBrand);
        }
        
        if (searchQuery) {
          queryParams.set('search', searchQuery);
        }
        
        // Add pagination parameters
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', productsPerPage.toString());
        
        // Add default sort
        queryParams.set('sort', 'newest');
        
        console.log('Fetching products with query params:', queryParams.toString());
        
        // Make API request using fetch
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
          throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.products?.length || 0} products from API`);
        
        // Set pagination data
        if (data.pagination) {
          console.log('Raw pagination data from API:', data.pagination);
          let apiTotalPages = data.pagination.totalPages || 1;
          const apiTotalProducts = data.pagination.totalProducts || 0;
          
          // Safety check: If API returns only 1 page but we have many products,
          // recalculate total pages based on our desired page size
          if (apiTotalPages <= 1 && apiTotalProducts > productsPerPage) {
            apiTotalPages = Math.ceil(apiTotalProducts / productsPerPage);
            console.log('Recalculated totalPages from API data:', apiTotalPages);
          }
          
          console.log('Setting pagination data from API:', {
            totalPages: apiTotalPages,
            totalProducts: apiTotalProducts,
            productsPerPage
          });
          
          setTotalPages(apiTotalPages);
          setTotalProducts(apiTotalProducts);
          console.log('Pagination data from API:', data.pagination);
        } else {
          // If pagination info is not provided, make an estimate
          const calculatedTotalPages = Math.ceil((data.products?.length || 0) / productsPerPage);
          
          // Check if the API provides total count in a different location
          let estimatedTotal = 0;
          
          if (data.totalProducts) {
            estimatedTotal = data.totalProducts;
          } else if (data.meta && data.meta.total) {
            estimatedTotal = data.meta.total;
          } else if (data.total) {
            estimatedTotal = data.total;
          } else {
            // If we can't find a total count anywhere, use the length of products array
            estimatedTotal = data.products?.length || 0;
          }
          
          console.log('Setting calculated pagination data:', {
            totalPages: calculatedTotalPages,
            totalProducts: estimatedTotal,
            productsPerPage
          });
          
          setTotalPages(calculatedTotalPages);
          setTotalProducts(estimatedTotal);
          console.log('Calculated pagination data locally:', {
            calculatedTotalPages,
            totalProducts: estimatedTotal,
            productsPerPage
          });
        }
        
        // Format products if needed
        const formattedProducts = data.products.map(product => ({
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
          brand: product.brand
        }));
        
        setFilteredProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // If API call fails, fall back to local filtering
        let filtered = [...allProducts];
        
        if (activeCategory && activeCategory !== 'all') {
          filtered = filtered.filter(p => 
            p.category === activeCategory || 
            (p.category && typeof p.category === 'object' && p.category._id === activeCategory)
          );
        }
        
        if (activeType) {
          filtered = filtered.filter(p => 
            p.type === activeType || 
            (p.type && typeof p.type === 'object' && p.type._id === activeType)
          );
        }
        
        if (activeSubtype) {
          filtered = filtered.filter(p => 
            p.subtype === activeSubtype || 
            (p.subtype && typeof p.subtype === 'object' && p.subtype._id === activeSubtype)
          );
        }
        
        if (activeBrand) {
          // Approximate brand name matching
          const brandNameLower = activeBrand.toLowerCase();
          filtered = filtered.filter(p => {
            // Handle different ways brand might be stored
            const productBrand = typeof p.brand === 'object' ? p.brand.name : p.brand;
            if (!productBrand) return false;
            
            const productBrandLower = productBrand.toLowerCase();
            
            // Match if either string contains the other
            return productBrandLower.includes(brandNameLower) || 
                   brandNameLower.includes(productBrandLower);
          });
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.description && p.description.toLowerCase().includes(query))
          );
        }
        
        // Handle pagination for local filtering
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        
        setTotalProducts(filtered.length);
        // Use a different variable name here
        const localCalculatedTotalPages = Math.ceil(filtered.length / productsPerPage);
        setTotalPages(localCalculatedTotalPages);
        setFilteredProducts(filtered.slice(startIndex, endIndex));
      } finally {
        setLoading(false);
        // Reset the ref so future fetches can proceed
        fetchRef.current = false;
      }
    };

    // Use a short timeout to prevent double fetches that happen when multiple
    // dependencies change at nearly the same time
    const timeoutId = setTimeout(fetchProducts, 100);
    
    // Clean up the timeout when component unmounts or dependencies change
    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeCategory, activeType, activeSubtype, activeBrand, searchQuery, categories, allProducts, currentPage]);

  // Get page from URL on initial load
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Force pagination to be visible if we have enough products
  useEffect(() => {
    // Safety check: If we have enough products but only one page,
    // recalculate the totalPages
    if (totalPages <= 1 && totalProducts > productsPerPage) {
      const recalculatedPages = Math.ceil(totalProducts / productsPerPage);
      console.log('Force updating totalPages from:', totalPages, 'to:', recalculatedPages);
      setTotalPages(recalculatedPages);
    }
  }, [totalProducts, totalPages, productsPerPage]);

  // Pagination UI component
  const Pagination = () => {
    // Simplified debug logging
    console.log('Pagination info:', { totalPages, currentPage, totalProducts });
    
    // Restore normal pagination behavior - with debug output when not showing
    if (totalPages <= 1) {
      console.log('Pagination hidden because totalPages =', totalPages);
      return null;
    }
    
    const visiblePageCount = 5;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePageCount / 2));
    let endPage = Math.min(totalPages, startPage + visiblePageCount - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < visiblePageCount) {
      startPage = Math.max(1, endPage - visiblePageCount + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-center space-x-2 my-8">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-full 
            ${currentPage === 1 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
            } transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* First page if not visible */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="text-gray-500 dark:text-gray-400">...</span>
            )}
          </>
        )}
        
        {/* Page numbers */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`flex items-center justify-center w-10 h-10 rounded-full 
              ${currentPage === number 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
              } transition-colors`}
          >
            {number}
          </button>
        ))}
        
        {/* Last page if not visible */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-gray-500 dark:text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next button */}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-full 
            ${currentPage === totalPages 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
            } transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100/90 via-white/50 to-sky-100/90 dark:from-pink-500/20 dark:via-purple-500/10 dark:to-sky-500/20 -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-100/50 via-transparent to-rose-100/50 dark:from-purple-500/10 dark:via-transparent dark:to-rose-500/10 -z-10 animate-pulse" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-200/20 via-transparent to-transparent dark:from-pink-500/5 dark:via-transparent dark:to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-sky-200/20 via-transparent to-transparent dark:from-sky-500/5 dark:via-transparent dark:to-transparent -z-10" />
      
      {/* Animated Sparkles */}
      <div className="fixed inset-0 opacity-30 dark:opacity-10 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-200 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-purple-200 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-sky-200 dark:bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Secondary Category Navigation */}
      <CategoryNav activeCategory={activeCategory} onSelectCategory={handleCategorySelect} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeCategory === 'all' ? 'All Products' : 'Category Products'}
            </h1>
            {totalProducts > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Showing {filteredProducts.length} of {totalProducts} products
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
            {activeCategory !== 'all' && (
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-full bg-white dark:bg-gray-800 transition-colors ${
                  isFilterOpen 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FaFilter className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(activeType || activeSubtype || activeBrand || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm font-medium">Search: {searchQuery}</span>
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            {activeBrand && (
              <button
                onClick={() => removeFilter('brand')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm font-medium">{getBrandName(activeBrand)}</span>
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            {activeType && (
              <button
                onClick={() => removeFilter('type')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm font-medium capitalize">{getTypeName(activeType)}</span>
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            {activeSubtype && (
              <button
                onClick={() => removeFilter('subtype')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-sm font-medium capitalize">{getSubtypeName(activeSubtype)}</span>
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-2"
            >
              <span className="text-sm font-medium">Clear All</span>
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        <AnimatePresence>
          {activeCategory !== 'all' && isFilterOpen && (
            <CategoryFilter 
              isOpen={true} 
              onClose={() => setIsFilterOpen(false)} 
              category={activeCategory}
              searchParams={searchParams}
              updateURL={updateURL}
            />
          )}
        </AnimatePresence>

        {/* Debug info */}
        {console.log('Debug brands filter:', { 
          isFilterOpen, 
          popularBrandsExists: !!popularBrands, 
          popularBrandsLength: popularBrands?.length || 0,
          localBrandsExist: !!window.shopLocalBrands,
          shouldShow: !isFilterOpen || activeCategory === 'all'
        })}

        {/* Products Grid - with loading state */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* Pagination component */}
            {(totalPages > 1 || filteredProducts.length < totalProducts) && (
              <>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                    Showing {filteredProducts.length} of {totalProducts} products (Page {currentPage} of {Math.max(1, totalPages)})
                  </p>
                  <Pagination />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No products found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop; 
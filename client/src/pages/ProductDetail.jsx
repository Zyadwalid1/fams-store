import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShoppingCart, FaHeart, FaStar, FaTag, FaBoxOpen, FaStore } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';
import { useState, useEffect } from 'react';
import ProductReviews from '../components/ProductReviews';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-hot-toast';

// Helper function to check if a string is a MongoDB ObjectId
const isMongoId = (id) => {
  return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

// Enhanced helper function to extract a name from a type or subtype
const extractName = (field) => {
  if (!field) return '';
  
  // If it's an object with a name property, use that
  if (typeof field === 'object' && field.name) {
    return field.name;
  }
  
  // If it's a string and looks like an ID, extract part after last '/'
  if (typeof field === 'string') {
    if (field.includes('/')) {
      return field.split('/').pop();
    }
    
    // Comprehensive mappings for all types and subtypes from the category structure
    const typeMap = {
      // Types
      '67f70a3f7d424ec9e815aa6c': 'All Makeup',
      '67f70a5c7d424ec9e815aa73': 'Face',
      '67f70a657d424ec9e815aa7c': 'Eye',
      '67f70a6e7d424ec9e815aa87': 'Lip',
      '67f70a7b7d424ec9e815aa94': 'Cheek',
      '67f70a927d424ec9e815aaa3': 'Brushes & Applicators',
      
      // Face Subtypes
      '67f7aa6d7d424ec9e815ab41': 'All Face',
      '67f7abd67d424ec9e815ab54': 'Foundation',
      '67f7abe87d424ec9e815ab69': 'Concealer',
      '67f7abf67d424ec9e815ab80': 'Face Primer',
      '67f7ac387d424ec9e815ab99': 'Contour',
      
      // Eye Subtypes
      '67f7ac437d424ec9e815abb4': 'All Eye',
      '67f7ac587d424ec9e815abd1': 'Mascara',
      '67f7ac807d424ec9e815abf0': 'Eyeliner',
      '67f7ac917d424ec9e815ac11': 'Eyebrow',
      '67f7aca17d424ec9e815ac34': 'Eyeshadow',
      
      // Lip Subtypes
      '67f7acd67d424ec9e815ac59': 'All lip',
      '67f7acf47d424ec9e815ac80': 'Lip Gloss',
      '67f7ad037d424ec9e815aca9': 'Lipstick',
      '67f7ad137d424ec9e815acd4': 'Lip Oil',
      '67f7ad377d424ec9e815ad01': 'Lip Liner',
      
      // Cheek Subtypes
      '67f7ad477d424ec9e815ad30': 'All Cheek',
      '67f7ad577d424ec9e815ad61': 'Blush',
      '67f7ad627d424ec9e815ad94': 'Bronzer',
      '67f7ad777d424ec9e815adc9': 'Highlighter',
      '67f7ad847d424ec9e815ae00': 'Contour',

      // Main Category Subtypes (the ones you specified)
      '67f709e17d424ec9e815aa5f': 'Makeup',
      '67f709f27d424ec9e815aa60': 'Fragrances',
      '67f709eb7d424ec9e815aa5e': 'Skincare',
      '67f70a017d424ec9e815aa61': 'Brushes & Tools',

      // Common lowercase mappings for backup
      'makeup': 'Makeup',
      'fragrances': 'Fragrances', 
      'skincare': 'Skincare',
      'tools': 'Brushes & Tools',
      'brushes': 'Brushes & Tools'
    };
    
    // Return the mapped name if available, otherwise return the original value
    return typeMap[field] || field;
  }
  
  // If we've reached here, default to a readable string
  return String(field);
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch product details from API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        console.log('Fetched product data:', data);
        
        // Extract category, type, subtype data
        let categoryName = '';
        let typeName = '';
        let subtypeName = '';
        let brandName = '';
        
        // First, try to find type and subtype names directly in the data
        // Some APIs include display names in various fields
        typeName = data.typeName || 
                  data.type_name || 
                  data.type_display || 
                  (data.type && data.type.name) || 
                  '';
                  
        subtypeName = data.subtypeName || 
                     data.subtype_name || 
                     data.subtype_display || 
                     (data.subtype && data.subtype.name) || 
                     '';
        
        console.log('Looking for type/subtype names directly:', {
          typeName,
          subtypeName,
          typeFromData: data.type,
          subtypeFromData: data.subtype
        });
                     
        // If we don't have names yet, try extracting them
        if (!typeName && data.type) {
          typeName = extractName(data.type);
        }
        
        if (!subtypeName && data.subtype) {
          subtypeName = extractName(data.subtype);
        }
        
        // If we still don't have a subtype name and we have a MongoDB ID, try to fetch it from the API
        if ((!subtypeName || subtypeName === data.subtype) && data.subtype && isMongoId(data.subtype)) {
          try {
            // First try to use our mapping function which now has a comprehensive list
            subtypeName = extractName(data.subtype);
            console.log('Found subtype name from mapping:', subtypeName);
            
            // If we still don't have a name, try the API approach
            if (!subtypeName || subtypeName === data.subtype) {
              // We need the category data to navigate the nested structure
              const categoryResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/product-categories`);
              if (categoryResponse.ok) {
                const categoriesData = await categoryResponse.json();
                const categories = categoriesData.categories || categoriesData;
                
                // Loop through all categories
                for (const category of categories) {
                  // Loop through all types in this category
                  for (const type of category.types || []) {
                    // Look for our subtype in this type's subtypes
                    const foundSubtype = (type.subtypes || []).find(st => st._id === data.subtype);
                    if (foundSubtype) {
                      subtypeName = foundSubtype.name;
                      console.log('Found subtype name from API response:', subtypeName);
                      break;
                    }
                  }
                  
                  if (subtypeName && subtypeName !== data.subtype) break;
                }
              }
            }
          } catch (err) {
            console.error('Error resolving subtype details:', err);
            
            // As a fallback, if we still have an ID as the subtype name, 
            // provide a generic name based on the type if available
            if (subtypeName === data.subtype || isMongoId(subtypeName)) {
              if (typeName === 'Face') subtypeName = 'Face Product';
              else if (typeName === 'Eye') subtypeName = 'Eye Product';
              else if (typeName === 'Lip') subtypeName = 'Lip Product';
              else if (typeName === 'Cheek') subtypeName = 'Cheek Product';
              else subtypeName = 'Beauty Product';
            }
          }
        }

        // Similarly for type, fallback if still showing as ID
        if ((!typeName || typeName === data.type) && data.type && isMongoId(data.type)) {
          try {
            // First try to use our mapping function
            typeName = extractName(data.type);
            
            // If still no success, try API
            if (!typeName || typeName === data.type) {
              const categoryResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/product-categories`);
              if (categoryResponse.ok) {
                const categoriesData = await categoryResponse.json();
                const categories = categoriesData.categories || categoriesData;
                
                // Loop through all categories
                for (const category of categories) {
                  // Look for our type in this category's types
                  const foundType = (category.types || []).find(t => t._id === data.type);
                  if (foundType) {
                    typeName = foundType.name;
                    break;
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error resolving type details:', err);
            
            // Last resort fallback for type
            if (typeName === data.type || isMongoId(typeName)) {
              typeName = 'Beauty Product';
            }
          }
        }
        
        // For debugging, log the full object to see available fields
        console.log('Full product object for debugging:', data);
        
        // Handle category
        if (typeof data.category === 'object' && data.category?.name) {
          categoryName = data.category.name;
        } else if (isMongoId(data.category)) {
          try {
            // First try to use our mapping function
            categoryName = extractName(data.category);
            
            if (!categoryName || categoryName === data.category) {
              const categoryResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/product-categories/${data.category}`);
              if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                categoryName = categoryData.name;
              } else {
                console.warn('Category endpoint returned error, using fallback');
                categoryName = data.category || 'Uncategorized';
              }
            }
          } catch (err) {
            console.error('Error fetching category:', err);
            categoryName = data.category || 'Uncategorized';
          }
        } else {
          categoryName = data.category || 'Uncategorized';
        }
        
        // Handle brand
        if (typeof data.brand === 'object' && data.brand?.name) {
          brandName = data.brand.name;
        } else if (isMongoId(data.brand)) {
          try {
            const brandResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/brands/${data.brand}`);
            if (brandResponse.ok) {
              const brandData = await brandResponse.json();
              brandName = brandData.name;
            } else {
              console.warn('Brand endpoint returned error, using fallback');
              brandName = data.brandName || data.brand_name || data.brand || 'MAYBELLINE';
            }
          } catch (err) {
            console.error('Error fetching brand:', err);
            brandName = data.brandName || data.brand_name || data.brand || 'MAYBELLINE';
          }
        } else {
          brandName = data.brand || '';
        }
        
        // Log the full product data first
        console.log('Processed type and subtype:', {
          typeField: data.type,
          typeFieldType: typeof data.type,
          subtypeField: data.subtype,
          subtypeFieldType: typeof data.subtype,
          typeName,
          subtypeName,
          typeResolveMethod: !data.type ? 'empty' : 
                            (data.type && typeof data.type === 'object' && data.type.name) ? 'direct object' :
                            typeName === data.typeName ? 'direct property' :
                            extractName(data.type) !== data.type ? 'mapping' : 'unknown',
          subtypeResolveMethod: !data.subtype ? 'empty' : 
                              (data.subtype && typeof data.subtype === 'object' && data.subtype.name) ? 'direct object' :
                              subtypeName === data.subtypeName ? 'direct property' :
                              extractName(data.subtype) !== data.subtype ? 'mapping' : 'api resolution'
        });
        
        // Format the product data with clean type/subtype handling
        const formattedProduct = {
          id: data._id || data.id,
          name: data.name,
          price: data.price,
          discount: data.discount || 0,
          rating: data.rating?.average || 4.5,
          description: data.description,
          image: data.photos && data.photos.length > 0 
            ? data.photos[0].secure_url 
            : 'https://via.placeholder.com/300',
          stock: data.stock || 0,
          category: categoryName,
          // Use the extracted names, ensure they're not showing as IDs
          type: typeName && !isMongoId(typeName) ? typeName : 'Beauty Product',
          subtype: subtypeName && !isMongoId(subtypeName) ? subtypeName : '',
          brand: brandName,
          // Store original IDs for linking in breadcrumbs
          categoryId: typeof data.category === 'object' ? data.category._id : data.category,
          typeId: typeof data.type === 'object' ? data.type._id : data.type,
          subtypeId: typeof data.subtype === 'object' ? data.subtype._id : data.subtype,
          brandId: typeof data.brand === 'object' ? data.brand._id : data.brand
        };
        
        console.log('Formatted product with type/subtype:', {
          type: formattedProduct.type,
          subtype: formattedProduct.subtype,
          typeId: formattedProduct.typeId,
          subtypeId: formattedProduct.subtypeId
        });
        
        setProduct(formattedProduct);
        
        // Fetch related products - handle missing API
        try {
          const relatedResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}/related`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            
            // Format related products data
            const formattedRelatedProducts = relatedData.map(item => ({
              id: item._id || item.id,
              name: item.name,
              price: item.price,
              discount: item.discount || 0,
              rating: item.rating?.average || 4.5,
              image: item.photos && item.photos.length > 0 
                ? item.photos[0].secure_url 
                : 'https://via.placeholder.com/300',
              stock: item.stock || 0
            }));
            
            setRelatedProducts(formattedRelatedProducts);
          } else {
            console.warn('Related products endpoint returned error, showing empty related products');
            setRelatedProducts([]); // Set empty array if API fails
          }
        } catch (relatedErr) {
          console.error('Failed to fetch related products:', relatedErr);
          setRelatedProducts([]); // Set empty array on error
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
        toast.error('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const isInWishlist = wishlist.some(item => String(item.id) === String(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? 'Error Loading Product' : 'Product Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/shop')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/25"
          >
            <FaArrowLeft className="mr-2" />
            Back to Shop
          </motion.button>
        </div>
      </div>
    );
  }

  // Calculate the final price after discount
  const finalPrice = product.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : product.price;

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  // Handle add to cart with quantity
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    addToCart(product, quantity);
    setQuantity(1);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  // Build the filter URL to go back to similar products
  const getFilterUrl = () => {
    const params = new URLSearchParams();
    if (product.categoryId) {
      params.set('category', product.categoryId);
    }
    if (product.typeId) {
      params.set('type', product.typeId);
    }
    if (product.subtypeId) {
      params.set('subtype', product.subtypeId);
    }
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Navigation section */}
        <div className="flex items-center mb-8 text-sm space-x-2 text-gray-600 dark:text-gray-400">
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop?category=${product.categoryId || (typeof product.category === 'object' ? product.category._id : product.category)}`} className="hover:text-primary">
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          {product.type && (
            <>
              <Link to={`/shop?category=${product.categoryId || (typeof product.category === 'object' ? product.category._id : product.category)}&type=${product.typeId || (typeof product.type === 'object' ? product.type._id : product.type)}`} className="hover:text-primary">
                {product.type}
              </Link>
              <span>/</span>
            </>
          )}
          {product.subtype && (
            <>
              <Link to={`/shop?category=${product.categoryId || (typeof product.category === 'object' ? product.category._id : product.category)}&type=${product.typeId || (typeof product.type === 'object' ? product.type._id : product.type)}&subtype=${product.subtypeId || (typeof product.subtype === 'object' ? product.subtype._id : product.subtype)}`} className="hover:text-primary">
                {product.subtype}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image Section */}
            <div className="relative aspect-square overflow-hidden">
              <motion.img
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium z-20 shadow-lg">
                  {product.discount}% OFF
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md ${
                  isInWishlist
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/20 text-gray-700 hover:bg-primary/20 hover:text-primary'
                } shadow-lg transition-all duration-300`}
              >
                <FaHeart className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Product Info */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>

                {/* Price section */}
                <div className="flex items-center mb-6">
                  {product.discount > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent">
                        {finalPrice} EGP
                      </span>
                      <div className="flex items-center">
                        <span className="text-lg text-gray-500 line-through mr-2">
                          {product.price} EGP
                        </span>
                        <span className="text-sm text-primary">
                          Save {product.discount}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent">
                      {product.price} EGP
                    </span>
                  )}
                </div>

                {/* Rating section */}
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (product.rating || 5)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({product.rating || 5}.0)
                  </span>
                </div>

                {/* Product details section */}
                <div className="mb-6 space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {product.brand && (
                      <div className="flex items-center">
                        <FaStore className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Brand:</span> {product.brand}
                        </span>
                      </div>
                    )}
                    
                    {product.category && (
                      <div className="flex items-center">
                        <FaTag className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Category:</span> {product.category}
                        </span>
                      </div>
                    )}
                    
                    {product.type && (
                      <div className="flex items-center">
                        <FaBoxOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Type:</span> {product.type}
                        </span>
                      </div>
                    )}
                    
                    {product.subtype && (
                      <div className="flex items-center">
                        <FaTag className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Subtype:</span> {product.subtype}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <FaBoxOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className={`${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span className="font-medium">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center mb-6">
                  <span className="text-gray-700 dark:text-gray-300 mr-4">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-gray-800 dark:text-gray-200 border-x border-gray-300 dark:border-gray-600">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                      disabled={quantity >= (product.stock || 10)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/25"
                    disabled={product.stock <= 0}
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(getFilterUrl())}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    <span>Browse Similar Products</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Product Reviews Section */}
        <ProductReviews productId={id} />
        
        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductDetail; 
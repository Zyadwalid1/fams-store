import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaFilter, FaArrowRight, FaArrowLeft, FaSprayCan, FaPaintBrush, FaMagic, FaSmile } from 'react-icons/fa';
import { FaHockeyPuck } from "react-icons/fa6";
import { useState, useRef, useEffect, lazy, Suspense, useMemo } from 'react';
import { useInView } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import BrandSlider from '../components/BrandSlider';
import ReelsSlider from '../components/ReelsSlider';

// Reduced animation complexity for mobile
const SliderButton = ({ direction, onClick, className }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-6' : 'right-6'} 
    z-10 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white 
    transition-all duration-300 border border-white/20 shadow-lg ${className}`}
  >
    {direction === 'left' ? <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> : <FaArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
  </button>
);

const PromoSlide = ({ image, title, description, link }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative h-[60vh] md:h-screen md:max-h-[600px] w-full bg-gray-900 overflow-hidden">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          // Simpler animation for mobile
          style={{
            transform: isMobile ? 'none' : 'scale(1.05)',
            animation: isMobile ? 'none' : 'zoomEffect 10s infinite alternate ease-in-out'
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20 text-primary mb-4 text-sm md:text-base"
            >
              New Collection
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight"
            >
              {title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-none"
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                to={link}
                className="inline-flex items-center space-x-2 px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 
                rounded-full hover:bg-primary hover:text-white transition-all duration-300 
                shadow-lg hover:shadow-primary/25 text-base md:text-lg font-medium"
              >
                <span>Discover Now</span>
                <FaArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced category card with icon-centric design (no images)
const CategoryCard = ({ category, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isMobile = window.innerWidth < 768;
  
  // Get the icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = (categoryName || "").toLowerCase();
    if (name.includes('makeup')) return <FaMagic className="w-10 h-10 md:w-14 md:h-14" />;
    if (name.includes('fragrance')) return <FaSprayCan className="w-10 h-10 md:w-14 md:h-14" />;
    if (name.includes('skin') || name.includes('skincare')) return <FaHockeyPuck className="w-10 h-10 md:w-14 md:h-14" />;
    if (name.includes('tool') || name.includes('brush')) return <FaPaintBrush className="w-10 h-10 md:w-14 md:h-14" />;
    return <FaMagic className="w-10 h-10 md:w-14 md:h-14" />;
  };
  
  // Get category color based on category type
  const getCategoryColor = (categoryName) => {
    const name = (categoryName || "").toLowerCase();
    if (name.includes('makeup')) return "from-pink-500/20 to-purple-500/20 text-pink-600 dark:text-pink-400";
    if (name.includes('fragrance')) return "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400";
    if (name.includes('skin') || name.includes('skincare')) return "from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400";
    if (name.includes('tool') || name.includes('brush')) return "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400";
    return "from-primary/20 to-primary-dark/20 text-primary";
  };
  
  // Simpler animations for mobile
  const getAnimation = () => {
    if (isMobile) return { opacity: 0, y: 30 }; 
    
    const animations = [
      { x: -60, y: 60 },
      { x: 0, y: -60 },
      { x: 60, y: 60 },
      { x: 0, y: 60 }
    ];
    return animations[index % animations.length];
  };
  
  const animation = getAnimation();
  const colorClasses = getCategoryColor(category.name);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: { opacity: 1, x: 0, y: 0 },
        hidden: { 
          opacity: 0, 
          x: isMobile ? 0 : animation.x,
          y: isMobile ? 30 : animation.y
        }
      }}
      transition={{ duration: isMobile ? 0.3 : 0.8, ease: "easeOut" }}
      whileHover={{ scale: isMobile ? 1.02 : 1.05, y: -8 }}
      className="transform-gpu"
    >
      <Link 
        to={`/shop?category=${category._id || category.id}`} 
        className="group flex flex-col items-center h-full bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500"
      >
        {/* Top circular gradient section with icon */}
        <div className={`w-full aspect-square flex items-center justify-center p-6 bg-gradient-to-br ${colorClasses} relative overflow-hidden group-hover:saturate-150 transition-all duration-500`}>
          {/* Decorative circles */}
          <div className="absolute top-1/4 right-1/4 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full transform group-hover:scale-125 transition-all duration-700"></div>
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full transform group-hover:scale-150 transition-all duration-700"></div>
          
          {/* Icon */}
          <div className={`relative z-10 ${colorClasses} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
            {getCategoryIcon(category.name)}
          </div>
        </div>
        
        {/* Category info */}
        <div className="w-full flex-1 flex flex-col p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white text-center mb-2 group-hover:text-primary transition-colors duration-300">
            {category.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center line-clamp-2 mb-auto">
            {category.description || `Explore our ${category.name} collection for premium beauty products.`}
          </p>
          
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/10 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-all duration-300 text-sm font-medium">
              <span>Explore Collection</span>
              <FaArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Simplified product card for better mobile performance
const ProductCard = ({ product, index }) => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isMobile = window.innerWidth < 768;
  
  // Handle cases where product might be null or undefined
  if (!product) {
    return null;
  }
  
  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);
  
  // Simpler animations for mobile
  const getAnimation = () => {
    if (isMobile) return { opacity: 0, y: 30 }; // Even simpler animation for mobile
    
    const animations = [
      { x: 100, y: 50 },
      { x: -100, y: 50 },
      { x: -100, y: -50 },
      { x: 100, y: -50 }
    ];
    return animations[index % animations.length];
  };
  
  const animation = getAnimation();
  
  // Calculate final price based on discount
  const finalPrice = product.discount > 0 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : product.price;
    
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
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: { opacity: 1, x: 0, y: 0 },
        hidden: { 
          opacity: 0, 
          x: isMobile ? 0 : animation.x,
          y: isMobile ? 30 : animation.y
        }
      }}
      transition={{ duration: isMobile ? 0.3 : 1, ease: "easeOut" }}
      whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
      className="transform-gpu overflow-hidden"
    >
      <div className="relative">
        <Link to={`/product/${product.id}`} className="group block">
          <div className="relative rounded-xl md:rounded-[2rem] overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-500">
            <div className="relative pt-[100%] overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10" />
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out"
              />
              {product.discount > 0 && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-primary text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium z-20 shadow-lg">
                  {product.discount}% OFF
                </div>
              )}
              
              {/* Wishlist & Cart buttons */}
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex space-x-2 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  className={`p-2 md:p-3 rounded-full backdrop-blur-md shadow-lg 
                    ${isInWishlist 
                      ? 'bg-primary/90 text-white' 
                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:text-primary'
                    } transition-all duration-300`}
                  disabled={isTogglingWishlist}
                  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isTogglingWishlist ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaHeart className={`w-4 h-4 md:w-5 md:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  className="p-2 md:p-3 rounded-full bg-primary/90 backdrop-blur-md text-white shadow-lg hover:bg-primary transition-all duration-300"
                  disabled={isAddingToCart}
                  aria-label="Add to cart"
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </motion.button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
              <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`h-3 w-3 md:h-4 md:w-4 ${
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
                      <span className="text-base md:text-lg font-bold text-primary-dark dark:text-primary-light">
                        {finalPrice} EGP
                      </span>
                      <span className="text-xs md:text-sm text-gray-500 line-through">
                        {product.price} EGP
                      </span>
                    </div>
                  ) : (
                    <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                      {product.price} EGP
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { products, categories, isLoading: contextLoading } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [isMobile, setIsMobile] = useState(false);

  // Use these variables to hold our featured and new products
  const featuredProducts = useMemo(() => 
    products?.filter(p => p?.featured)?.slice(0, isMobile ? 2 : 4) || []
  , [products, isMobile]);
  
  const newProducts = useMemo(() => 
    products?.filter(p => p?.newArrival)?.slice(0, isMobile ? 2 : 4) || 
    products?.slice(0, isMobile ? 2 : 4) || []
  , [products, isMobile]);

  // Update loading state when context loading changes
  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fix scrollbar issues
  useEffect(() => {
    // Store original styles
    const originalStyles = {
      overflow: document.body.style.overflow,
      overflowX: document.body.style.overflowX,
      position: document.body.style.position,
      width: document.body.style.width
    };
    
    // Fix scrollbar issues by directly applying styles
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.position = 'relative';
    document.body.style.width = '100%';
    
    // Add animation styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes zoomEffect {
        from { transform: scale(1); }
        to { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.overflowX = originalStyles.overflowX;
      document.body.style.position = originalStyles.position;
      document.body.style.width = originalStyles.width;
      
      // Remove animation styles
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle errors in the rendering
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 flex items-center justify-center">
        <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're having trouble loading the home page. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    // Modify the promoSlides creation to include better images and match categories
    const promoSlides = [
      {
        image: 'https://mazaya.eg/_ipx/fit_cover,f_avif,enlarge_true,q_90,s_1500x681/https://www.mazaya.eg/media/offers/1742902255232.jpg',
        title: 'Luxury Makeup Collection',
        description: 'Discover premium makeup products from top beauty brands.',
        link: `/shop?category=${categories.find(c => c.name.toLowerCase().includes('makeup'))?._id || '67f709e17d424ec9e815aa5f'}`
      },
      {
        image: 'https://res.cloudinary.com/dkbnpozos/image/upload/f_auto,q_auto/v1746024762/faces/FACES%20EGYPT/2025/SPRING/DK-Hero-SpringSale-EN-6000.png',
        title: 'Exclusive Fragrances',
        description: 'Experience luxury scents and perfumes for men and women.',
        link: `/shop?category=${categories.find(c => c.name.toLowerCase().includes('fragrance'))?._id || '67f709f27d424ec9e815aa60'}`
      },
      {
        image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Professional Tools',
        description: 'Get the perfect look with our professional-grade beauty tools.',
        link: `/shop?category=${categories.find(c => c.name.toLowerCase().includes('tool') || c.name.toLowerCase().includes('brush'))?._id || '67f70a017d424ec9e815aa61'}`
      }
    ];

    useEffect(() => {
      // Optimized image preloading
      const preloadImages = async () => {
        setIsLoading(true);
        try {
          // Only preload the first slide image and first category image immediately
          // Other images will be loaded lazily
          const criticalPreloads = [
            new Promise((resolve) => {
              if (promoSlides[0]?.image) {
                const img = new Image();
                img.src = promoSlides[0].image;
                img.onload = resolve;
                img.onerror = resolve;
              } else {
                resolve();
              }
            }),
            new Promise((resolve) => {
              if (categories[0]?.image) {
                const img = new Image();
                img.src = categories[0].image;
                img.onload = resolve;
                img.onerror = resolve;
              } else {
                resolve();
              }
            })
          ];
          
          // Wait for critical images to load first
          await Promise.allSettled(criticalPreloads);
          setIsLoading(false);
          
          // Then preload other images in the background
          if (!isMobile) { // Skip unnecessary preloading on mobile
            const otherPreloads = [
              ...promoSlides.slice(1).filter(slide => slide.image).map(slide => {
                return new Promise((resolve) => {
                  const img = new Image();
                  img.src = slide.image;
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              }),
              ...categories.slice(1).filter(category => category?.image).map(category => {
                return new Promise((resolve) => {
                  const img = new Image();
                  img.src = category.image;
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              })
            ];
            
            // These load in the background without blocking rendering
            Promise.allSettled(otherPreloads);
          }
        } catch (error) {
          console.error('Error preloading images:', error);
          setIsLoading(false);
        }
      };

      preloadImages();
    }, [isMobile]);

    // Auto-advance slider - reduced frequency on mobile
    useEffect(() => {
      if (isLoading) return;
      
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
      }, isMobile ? 7000 : 5000); // Longer interval on mobile
      
      return () => clearInterval(timer);
    }, [isLoading, isMobile]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading amazing products...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
        {/* Hero Slider Section */}
        <div ref={heroRef} className="relative overflow-hidden group">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isMobile ? 0.5 : 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {promoSlides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <PromoSlide {...slide} />
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-center items-center gap-3 z-20">
                <div className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                  {promoSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`relative h-1.5 md:h-2 transition-all duration-300 rounded-full ${
                        currentSlide === index ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {!isMobile && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <SliderButton
                    direction="left"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
                  />
                  <SliderButton
                    direction="right"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reels Slider Section */}
        <ReelsSlider />

        {/* Brand Slider */}
        <BrandSlider />

        {/* Rest of the sections */}
        <div className="relative z-10">
          {/* Featured Categories */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-2">COLLECTIONS</span>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Shop by Category</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm md:text-base">Find your perfect beauty products organized by category</p>
              </div>
              <Link
                to="/shop"
                className="hidden md:inline-flex items-center space-x-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all duration-300 text-sm mt-4 md:mt-0"
              >
                <span>View All Categories</span>
                <FaArrowRight className="ml-2 w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))
              ) : (
                <div className="col-span-full py-16 bg-white dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FaMagic className="text-primary w-8 h-8" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-center">No categories available at the moment.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all duration-300 text-sm"
              >
                <span>View All Categories</span>
                <FaArrowRight className="ml-2 w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Featured Products */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors text-sm md:text-base"
              >
                <span>View All</span>
                <FaArrowRight className="text-xs md:text-base" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600 dark:text-gray-400">No featured products available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          {/* New Arrivals */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 overflow-hidden">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors text-sm md:text-base"
              >
                <span>View All</span>
                <FaArrowRight className="text-xs md:text-base" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {newProducts.length > 0 ? (
                newProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600 dark:text-gray-400">No new products available at the moment.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering Home component:", error);
    setHasError(true);
    return null; // This will re-render and show the error UI above
  }
};

export default Home; 
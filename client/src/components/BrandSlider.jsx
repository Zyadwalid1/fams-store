import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const BrandSlider = () => {
  const { popularBrands } = useShop();
  const [brands, setBrands] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLeftControl, setShowLeftControl] = useState(false);
  const [showRightControl, setShowRightControl] = useState(true);
  const sliderRef = useRef(null);
  const localSliderRef = useRef(null);

  useEffect(() => {
    if (popularBrands && popularBrands.length > 0) {
      setBrands(popularBrands);
    } else {
      // Fallback brands if no brands in context
      setBrands([
        { _id: '67f70fab7d424ec9e815ab30', name: 'Maybelline', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab31', name: 'L\'Oréal', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab32', name: 'MAC', category: 'luxury' },
        { _id: '67f70fab7d424ec9e815ab33', name: 'NYX', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab34', name: 'Dior', category: 'luxury' },
        { _id: '67f70fab7d424ec9e815ab35', name: 'Fenty Beauty', category: 'luxury' },
        { _id: '67f70fab7d424ec9e815ab36', name: 'Huda Beauty', category: 'luxury' },
        { _id: '67f70fab7d424ec9e815ab37', name: 'Essence', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab38', name: 'Kiko', category: 'luxury' },
        { _id: '67f70fab7d424ec9e815ab39', name: 'Golden Rose', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab40', name: 'Catrice', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab41', name: 'Cybele', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab42', name: 'Revolution', category: 'affordable' },
        { _id: '67f70fab7d424ec9e815ab43', name: 'YSL', category: 'luxury' },
        // Local brands
        { _id: '67f70fab7d424ec9e815ab44', name: 'Mikyajy', category: 'local' },
        { _id: '67f70fab7d424ec9e815ab45', name: 'Krylon', category: 'local' },
        { _id: '67f70fab7d424ec9e815ab46', name: 'Delta', category: 'local' },
        { _id: '67f70fab7d424ec9e815ab47', name: 'Luna', category: 'local' },
        { _id: '67f70fab7d424ec9e815ab48', name: 'Mora', category: 'local' }
      ]);
    }
  }, [popularBrands]);

  const scroll = (direction, ref) => {
    if (ref.current) {
      const { scrollLeft, clientWidth, scrollWidth } = ref.current;
      
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;
      
      ref.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
      
      // Update controls visibility after scroll animation
      setTimeout(() => {
        if (ref.current) {
          const newScrollLeft = ref.current.scrollLeft;
          setShowLeftControl(newScrollLeft > 0);
          setShowRightControl(newScrollLeft < scrollWidth - clientWidth - 5);
        }
      }, 400);
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
      setShowLeftControl(scrollLeft > 0);
      setShowRightControl(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const luxuryBrands = brands.filter(brand => brand.category === 'luxury');
  const affordableBrands = brands.filter(brand => brand.category === 'affordable');
  const localBrands = brands.filter(brand => brand.category === 'local');

  return (
    <div className="py-16 bg-gradient-to-r from-pink-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 relative inline-block">
            Our Featured Brands
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-400/50 transform -translate-y-2"></div>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and shop from a wide selection of top beauty brands, from luxury to affordable.
          </p>
        </div>

        <div className="relative">
          {/* Luxury Brands Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Luxury Brands</h3>
              <div className="ml-4 h-px bg-gradient-to-r from-pink-300 to-transparent flex-grow"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {luxuryBrands.map((brand) => (
                <Link 
                  key={brand._id} 
                  to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                  className="flex-none"
                >
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-48 h-48 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center justify-center text-center p-4 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/20 dark:to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    
                    <span className="text-4xl mb-4">💎</span>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{brand.name}</h4>
                    <p className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider font-medium">Luxury</p>
                    
                    <div className="absolute bottom-0 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      Shop Now
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Local Brands Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Local Brands</h3>
              <div className="ml-4 h-px bg-gradient-to-r from-amber-300 to-transparent flex-grow"></div>
            </div>
            
            <div className="relative">
              <div className="flex flex-wrap justify-center gap-6">
                {localBrands.map((brand) => (
                  <Link 
                    key={brand._id} 
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="flex-none"
                  >
                    <motion.div 
                      whileHover={{ y: -8, scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-48 h-48 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center justify-center text-center p-4 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 dark:from-amber-600/20 dark:to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      
                      <span className="text-4xl mb-4">🏠</span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{brand.name}</h4>
                      <p className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-medium">Local</p>
                      
                      <div className="absolute bottom-0 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        Shop Now
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Affordable Brands Section */}
          <div>
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Affordable Brands</h3>
              <div className="ml-4 h-px bg-gradient-to-r from-blue-300 to-transparent flex-grow"></div>
            </div>
            
            <div className="relative">
              {showLeftControl && (
                <button 
                  onClick={() => scroll('left', sliderRef)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/50 text-primary rounded-full shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                >
                  <FaArrowLeft />
                </button>
              )}
              
              <div 
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
              >
                {affordableBrands.map((brand) => (
                  <Link 
                    key={brand._id} 
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="flex-none"
                  >
                    <motion.div 
                      whileHover={{ y: -8, scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-48 h-48 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center justify-center text-center p-4 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-green-400/10 dark:from-blue-600/20 dark:to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                      
                      <span className="text-4xl mb-4">✨</span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{brand.name}</h4>
                      <p className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-medium">Affordable</p>
                      
                      <div className="absolute bottom-0 w-full py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        Shop Now
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              
              {showRightControl && (
                <button 
                  onClick={() => scroll('right', sliderRef)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/50 text-primary rounded-full shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                >
                  <FaArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSlider; 
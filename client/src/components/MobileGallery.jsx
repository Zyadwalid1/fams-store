import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const MobileGallery = ({ images = [], mainImage }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialTouch, setInitialTouch] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);

  // Combine main image with additional images if provided
  const allImages = mainImage 
    ? [mainImage, ...(images || [])]
    : images;

  // Handle click on thumbnail
  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  // Toggle fullscreen view
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setInitialTouch(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e) => {
    if (initialTouch !== null) {
      const delta = e.touches[0].clientX - initialTouch;
      setTouchDelta(delta);
    }
  };

  const handleTouchEnd = () => {
    if (touchDelta > 50 && activeIndex > 0) {
      // Swiped right, go to previous image
      setActiveIndex(activeIndex - 1);
    } else if (touchDelta < -50 && activeIndex < allImages.length - 1) {
      // Swiped left, go to next image
      setActiveIndex(activeIndex + 1);
    }
    
    setInitialTouch(null);
    setTouchDelta(0);
  };

  return (
    <div className="md:hidden">
      {/* Main image */}
      <div 
        className="w-full aspect-square relative overflow-hidden rounded-xl mb-3 bg-white dark:bg-gray-800"
        onClick={toggleFullscreen}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img
          src={allImages[activeIndex]}
          alt="Product"
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: touchDelta 
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Image navigation dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeIndex 
                  ? 'bg-primary' 
                  : 'bg-white/50 dark:bg-gray-700/50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleThumbnailClick(index);
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="flex overflow-x-auto scrollbar-none space-x-2 pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
              index === activeIndex 
                ? 'border-primary' 
                : 'border-transparent'
            }`}
            onClick={() => handleThumbnailClick(index)}
          >
            <img 
              src={image} 
              alt={`Thumbnail ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Fullscreen gallery */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={toggleFullscreen}
          >
            <button 
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white"
              onClick={toggleFullscreen}
            >
              <FaTimes className="w-6 h-6" />
            </button>
            
            <div 
              className="w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.img
                src={allImages[activeIndex]}
                alt="Product fullscreen"
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: touchDelta 
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            {/* Fullscreen dots navigation */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === activeIndex 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(index);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileGallery; 
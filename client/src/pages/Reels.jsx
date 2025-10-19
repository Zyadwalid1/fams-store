import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaVolumeMute, FaVolumeUp, FaPlay } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef(null);
  const prevVideoRef = useRef(null);
  const nextVideoRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch reels from the API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching reels...');
        const token = localStorage.getItem('token'); // Get auth token if needed
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/reels`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch reels');
        }
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          console.log('Setting reels:', data.data);
          setReels(data.data);
          
          // If there's a specific reel ID in the URL query, set it as current
          const params = new URLSearchParams(location.search);
          const reelId = params.get('id');
          if (reelId) {
            const index = data.data.findIndex(reel => reel._id === reelId);
            if (index !== -1) {
              setCurrentReelIndex(index);
            }
          }
        } else {
          throw new Error('Invalid reels data format');
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
        setError(error.message);
        toast.error(error.message || 'Failed to load reels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
  }, [location]);

  // Get current reel
  const currentReel = reels[currentReelIndex];

  // Fetch product details when current reel changes
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!currentReel?.product?._id) return;

      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products/${currentReel.product._id}?populate=type,subtype`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        console.log('Fetched product details:', data);
        
        // Format the product data with type and subtype information
        const formattedProduct = {
          ...data,
          type: data.type?.name || '',
          subtype: data.subtype?.name || '',
          typeId: data.type?._id || data.type,
          subtypeId: data.subtype?._id || data.subtype
        };
        
        setProductDetails(formattedProduct);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      }
    };

    fetchProductDetails();
  }, [currentReelIndex, reels]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Current state:', {
      reelsCount: reels.length,
      currentReelIndex,
      currentReel: reels[currentReelIndex],
      isLoading,
      error
    });
    
    // Add detailed product logging
    if (reels[currentReelIndex]?.product) {
      console.log('Product data:', {
        product: reels[currentReelIndex].product,
        photos: reels[currentReelIndex].product.photos,
        hasPhotos: reels[currentReelIndex].product?.photos?.length > 0
      });
    }
  }, [reels, currentReelIndex, isLoading, error]);

  // Handle video initialization when reel changes
  useEffect(() => {
    if (videoRef.current && reels[currentReelIndex]) {
      videoRef.current.load();
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Video playback error:', error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentReelIndex, reels]);

  // Handle play/pause state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Video playback error:', error);
          setIsPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, isMuted]);

  // Check if user has liked the current reel
  useEffect(() => {
    if (!currentReel) return;

    const userId = localStorage.getItem('userId');
    if (userId && currentReel.likes) {
      setIsLiked(currentReel.likes.includes(userId));
    }
  }, [currentReelIndex, reels]);

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    if (currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
      setIsPlaying(true); // Auto-play next reel
    }
  };

  const handlePrevious = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
      setIsPlaying(true); // Auto-play previous reel
    }
  };

  const handleLike = async () => {
    if (!currentReel) return;

    try {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      let userId;
      
      try {
        const userData = JSON.parse(user);
        userId = userData.id;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      if (!token || !userId) {
        toast.error('Please login to like reels');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/reels/like/${currentReel._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like reel');
      }

      const data = await response.json();
      
      // Update the reels state with the new likes array
      setReels(prevReels => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...updatedReels[currentReelIndex],
          likes: data.data.likes
        };
        return updatedReels;
      });

      // Update isLiked state based on whether the user's ID is in the likes array
      const isNowLiked = data.data.likes.includes(userId);
      setIsLiked(isNowLiked);
      toast.success(isNowLiked ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error liking reel:', error);
      toast.error(error.message || 'Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    if (!currentReel) return;

    try {
      const shareData = {
        title: currentReel.title,
        text: currentReel.description,
        url: `${window.location.origin}/reels?id=${currentReel._id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const handleBuyNow = () => {
    if (!productDetails?._id) {
      toast.error('Product details not available');
      return;
    }
    navigate(`/product/${productDetails._id}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black pt-16">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black pt-16">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-white">
            <p className="text-xl">Error: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-16">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-white">
            <p className="text-xl">No reels available</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentReel) {
    console.error('Current reel is undefined:', { currentReelIndex, reels });
    return (
      <main className="min-h-screen bg-black pt-16">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-white">
            <p className="text-xl">Error: Could not load reel</p>
          </div>
        </div>
      </main>
    );
  }

  console.log('Rendering reel:', currentReel);

  return (
    <main className="min-h-screen bg-black pt-16">
      <div className="h-[calc(100vh-64px)]">
        <div className="flex h-full">
          {/* Video Section */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {/* Previous Reels Preview */}
            {currentReelIndex > 0 && (
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-black/50 group-hover:bg-black/70 transition-all">
                  <video
                    ref={prevVideoRef}
                    src={reels[currentReelIndex - 1]?.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                      <FaPlay className="text-white transform rotate-180 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Video */}
            <video
              ref={videoRef}
              src={currentReel?.videoUrl}
              className="max-h-full max-w-full w-auto h-auto object-contain"
              loop
              playsInline
              muted={isMuted}
              controls={false}
              onClick={handleVideoClick}
            />
            
            {/* Next Reels Preview */}
            {currentReelIndex < reels.length - 1 && (
              <div 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-black/50 group-hover:bg-black/70 transition-all">
                  <video
                    ref={nextVideoRef}
                    src={reels[currentReelIndex + 1]?.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                      <FaPlay className="text-white w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Video Overlay - Always visible for controls */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"
              onClick={handleVideoClick}
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.history.back();
                  }}
                  className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={handleVolumeToggle}
                  className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                >
                  {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                </button>
              </div>

              {/* Play/Pause Overlay */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleVideoClick}
              >
                <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
                  <FaPlay className="text-white text-6xl" />
                </div>
              </div>

              {/* Bottom Info */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">{currentReel?.title}</h3>
                  <p className="text-sm text-white/80">{currentReel?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Card Section */}
          {currentReel?.product && (
            <div className="w-96 bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="p-6">
                <div className="aspect-square mb-6">
                  {productDetails?.photos?.length > 0 ? (
                    <img
                      src={productDetails.photos[0].secure_url}
                      alt={productDetails.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        e.target.src = 'https://via.placeholder.com/400?text=Product+Image+Not+Available';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <p className="text-sm mb-2">
                          {productDetails ? 'No product image available' : 'Loading product details...'}
                        </p>
                        <p className="text-xs text-gray-500">Product ID: {currentReel.product._id}</p>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {productDetails?.name || currentReel.product.name}
                </h2>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-semibold text-primary">
                    EGP {(productDetails?.price || currentReel.product.price).toFixed(2)}
                  </div>
                  {productDetails?.discount > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        {productDetails.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>

                {productDetails && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Product Details
                    </h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                      {productDetails.brand && (
                        <p>Brand: {productDetails.brand.name}</p>
                      )}
                      {productDetails.category && (
                        <p>Category: {productDetails.category.name}</p>
                      )}
                      {productDetails.type && (
                        <p>Type: {productDetails.type}</p>
                      )}
                      {productDetails.subtype && (
                        <p>Subtype: {productDetails.subtype}</p>
                      )}
                      {productDetails.stock !== undefined && (
                        <p>Stock: {productDetails.stock} units</p>
                      )}
                      {productDetails.rating && (
                        <p>Rating: {productDetails.rating.average?.toFixed(1) || 'No ratings yet'}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-2 ${
                      isLiked ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                    } hover:text-primary transition-colors`}
                  >
                    <FaHeart className={isLiked ? 'fill-current' : ''} />
                    <span className="ml-2">{currentReel?.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <FaShare />
                    <span className="ml-2">Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Reels; 
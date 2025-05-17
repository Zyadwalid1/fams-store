import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaVolumeMute, FaVolumeUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ReelsSlider = () => {
  const [reels, setReels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reels');
        const data = await response.json();
        
        if (data.status === 'success') {
          setReels(data.data);
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Video playback error:', error);
        });
      } else {
        videoRef.current.pause();
      }
      videoRef.current.muted = isMuted;
    }
  }, [isPlaying, isMuted, currentSlide]);

  const handleNext = () => {
    if (currentSlide < reels.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleVolumeToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Reels</h2>
          <Link
            to="/reels"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary-light transition-colors"
          >
            <span>View All</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="relative" ref={sliderRef}>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {reels.map((reel, index) => (
              <Link
                key={reel._id}
                to={`/reels?id=${reel._id}`}
                className="relative flex-shrink-0 w-[300px] h-[400px] rounded-lg overflow-hidden snap-start"
              >
                <div className="absolute inset-0 bg-black/50 z-10" />
                <video
                  ref={index === currentSlide ? videoRef : null}
                  src={reel.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  onClick={handleVideoClick}
                />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={handleVolumeToggle}
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                    </button>
                  </div>
                  
                  {!isPlaying && index === currentSlide && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaPlay className="text-white text-6xl opacity-50" />
                    </div>
                  )}
                  
                  <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="text-white font-semibold mb-2">{reel.title}</h3>
                    <div className="flex items-center">
                      {reel.product && reel.product.images && reel.product.images.length > 0 ? (
                        <img
                          src={reel.product.images[0]}
                          alt={reel.product?.name || 'Product'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <FaPlay className="text-white text-sm" />
                        </div>
                      )}
                      <div className="ml-2">
                        <p className="text-white text-sm">{reel.product?.name || 'Product Name'}</p>
                        <p className="text-primary-light text-sm">
                          EGP {reel.product?.price || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-30"
            disabled={currentSlide === 0}
          >
            <FaArrowLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-30"
            disabled={currentSlide === reels.length - 1}
          >
            <FaArrowRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReelsSlider; 
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const ReelCard = ({ reel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video playback error:', error);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <Link 
      to={`/reels?id=${reel._id}`}
      className="relative block aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <img
        src={reel.thumbnailUrl || reel.product.images[0]}
        alt={reel.title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video Preview */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        muted={isMuted}
        loop
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60">
        {/* Top Controls */}
        <div className="absolute top-2 right-2">
          {isHovered && (
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </button>
          )}
        </div>

        {/* Play Icon */}
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaPlay className="text-white text-3xl opacity-80" />
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="text-sm font-semibold line-clamp-1">{reel.title}</h3>
          <div className="flex items-center mt-1">
            <img
              src={reel.product.images[0]}
              alt={reel.product.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <p className="ml-2 text-xs line-clamp-1">{reel.product.name}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReelCard; 
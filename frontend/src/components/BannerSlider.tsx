// frontend/src/components/BannerSlider.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getImageForContext } from '../utils/imageOptimization';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  priority: number;
}

interface BannerSliderProps {
  className?: string;
}

const BannerSlider: React.FC<BannerSliderProps> = ({ className = '' }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Fetch active banners
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners`);
      const data = await response.json();
      
      if (data.success && data.banners.length > 0) {
        setBanners(data.banners);
        console.log('✅ Banners fetched successfully:', data.banners.length);
      } else {
        setBanners([]);
        console.log('📭 No active banners found');
      }
    } catch (error) {
      console.error('❌ Failed to fetch banners:', error);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear interval function
  const clearAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-slide function
  const startAutoSlide = useCallback(() => {
    clearAutoSlide();
    if (banners.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 6000);
    }
  }, [banners.length, isPaused, clearAutoSlide]);

  // Auto-slide functionality
  useEffect(() => {
    startAutoSlide();
    return () => clearAutoSlide();
  }, [startAutoSlide]);

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Navigate to specific banner
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    clearAutoSlide();
    
    setTimeout(() => {
      setIsTransitioning(false);
      if (!isPaused) {
        startAutoSlide();
      }
    }, 800);
  }, [isTransitioning, isPaused, clearAutoSlide, startAutoSlide]);

  // Navigate to previous banner (UP)
  const goUp = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide, isTransitioning]);

  // Navigate to next banner (DOWN)
  const goDown = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    const newIndex = (currentIndex + 1) % banners.length;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide, isTransitioning]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY); // ✅ FIXED: Added 
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      goDown();
    } else if (isDownSwipe) {
      goUp();
    }
  };

  // Handle mouse enter (pause)
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    clearAutoSlide();
  }, [clearAutoSlide]);

  // Handle mouse leave (resume)
  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    startAutoSlide();
  }, [startAutoSlide]);

  // Handle CTA click
  const handleCTAClick = (banner: Banner) => {
    console.log('🔗 Banner CTA clicked:', banner.title);
    if (banner.ctaLink) {
      if (banner.ctaLink.startsWith('http') || banner.ctaLink.startsWith('//')) {
        window.open(banner.ctaLink, '_blank');
      } else {
        window.location.href = banner.ctaLink;
      }
    }
  };

  // Don't render anything if loading or no banners
  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-black rounded-3xl p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-700 rounded-2xl mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className={`relative flex items-center space-x-4 ${className}`}>
      {/* ✅ MAIN BANNER CARD */}
      <div 
        ref={bannerRef}
        className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-red-900 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/30 border-2 border-orange-500/40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          minHeight: '400px',  // ✅ MUCH TALLER: From 280px to 400px
          maxHeight: '450px',  // ✅ MUCH TALLER: From 320px to 450px
          height: '425px'      // ✅ MUCH TALLER: From 300px to 425px
        }}


      >
        {/* ✅ ENHANCED: Animated fire border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 animate-pulse"></div>
        
        {/* ✅ NEW: Vertical Progress Bar Animation (Top to Bottom) */}
        {banners.length > 1 && !isPaused && !isTransitioning && (
          <div className="absolute left-0 top-0 w-1 h-full bg-gray-800/50 z-30">
            <div 
              className="w-full bg-gradient-to-b from-orange-500 via-red-500 to-orange-600 shadow-lg shadow-orange-500/50"
              style={{
                height: '0%',
                animation: 'verticalProgress 6s linear infinite',
                transformOrigin: 'top'
              }}
            />
          </div>
        )}

        {/* ✅ RESPONSIVE LAYOUT: Desktop (horizontal) vs Mobile (vertical) */}
        
        {/* DESKTOP & TABLET LAYOUT (lg and above) */}
        <div className="hidden lg:flex relative z-10 items-center h-full p-6 md:p-8">
          {/* Desktop: Left Image Container */}
          {currentBanner.imageUrl && (
            <div className="w-72 h-72 flex-shrink-0 mr-8">
              <div className="relative w-full h-full bg-white rounded-2xl p-4 shadow-2xl shadow-orange-500/20 overflow-hidden">
                <img
                  src={getImageForContext(currentBanner.imageUrl, 'detail')}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                
                {/* Enhanced fire particles */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-bounce opacity-90"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-70" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          )}
          
          {/* Desktop: Right Content Container */}
          <div className={`flex-1 ${currentBanner.imageUrl ? 'text-left' : 'text-center'}`}>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                {currentBanner.title}
              </span>
            </h2>
            
            {currentBanner.description && (
              <p className="text-orange-200 text-base md:text-lg mb-6 leading-relaxed max-w-2xl opacity-90 hover:opacity-100 transition-opacity duration-300">
                {currentBanner.description}
              </p>
            )}
            
            {currentBanner.ctaText && currentBanner.ctaLink && (
              <button
                onClick={() => handleCTAClick(currentBanner)}
                className="group bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-orange-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 border-2 border-orange-400"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="group-hover:animate-bounce">🔥</span>
                  <span>{currentBanner.ctaText}</span>
                  <span className="group-hover:animate-bounce" style={{animationDelay: '0.1s'}}>🚀</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ✅ MOBILE & SMALL TABLET LAYOUT (below lg) */}
        <div className="lg:hidden relative z-10 flex flex-col justify-center h-full p-6 text-center">
          {/* Mobile: Title First */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              {currentBanner.title}
            </span>
          </h2>
          
          {/* Mobile: Image Second */}
          {currentBanner.imageUrl && (
            <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
              <div className="relative w-full h-full bg-white rounded-2xl p-3 shadow-2xl shadow-orange-500/20 overflow-hidden">
                <img
                  src={getImageForContext(currentBanner.imageUrl, 'detail')}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                
                {/* Enhanced fire particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-90"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-500 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping opacity-70" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          )}
          
          {/* Mobile: CTA Button Third */}
          {currentBanner.ctaText && currentBanner.ctaLink && (
            <button
              onClick={() => handleCTAClick(currentBanner)}
              className="group bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-orange-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 border-2 border-orange-400 max-w-xs mx-auto"
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="group-hover:animate-bounce">🔥</span>
                <span className="text-sm sm:text-base">{currentBanner.ctaText}</span>
                <span className="group-hover:animate-bounce" style={{animationDelay: '0.1s'}}>🚀</span>
              </span>
            </button>
          )}
        </div>

        {/* ✅ ENHANCED: Fire Effects */}
        <div className="absolute top-4 right-4 opacity-80 z-10">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-8 right-12 opacity-60 z-10">
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        <div className="absolute bottom-4 left-4 opacity-70 z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* ✅ MOBILE SWIPE INDICATOR
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 lg:hidden z-20">
          <div className="bg-black/50 text-orange-300 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-orange-500/30">
            Swipe ↕️ to navigate
          </div>
        </div> */}

        {/* ✅ CUSTOM CSS for animations */}
        <style>{`
          @keyframes verticalProgress {
            0% { height: 0%; }
            100% { height: 100%; }
          }
        `}</style>
      </div>

      {/* ✅ EXTERNAL NAVIGATION CONTROLS (RIGHT SIDE - OUTSIDE BANNER) */}
      {banners.length > 1 && (
        <div className="flex flex-col space-y-3">
          {/* ✅ UP Button */}
          <button
            onClick={goUp}
            disabled={isTransitioning}
            className={`bg-gradient-to-b from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-orange-400 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:-translate-y-1'
            }`}
            title="Previous Banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          {/* ✅ ENHANCED: Vertical Dot Indicators */}
          <div className="flex flex-col space-y-2 py-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-orange-500 scale-125 shadow-lg shadow-orange-500/50 ring-2 ring-orange-300' 
                    : 'bg-orange-500/50 hover:bg-orange-500/70'
                } ${isTransitioning ? 'cursor-not-allowed' : ''}`}
                title={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
          
          {/* ✅ DOWN Button */}
          <button
            onClick={goDown}
            disabled={isTransitioning}
            className={`bg-gradient-to-b from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-orange-400 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:translate-y-1'
            }`}
            title="Next Banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default BannerSlider;

// frontend/src/components/RecentlyViewed.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recentlyViewedManager } from '../utils/recentlyViewed';
import { getRecentlyViewedImageUrl } from '../utils/imageOptimization';

interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName: string;
}

const RecentlyViewed: React.FC = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});

  // ✅ Enhanced image loading handlers
  const handleImageLoad = useCallback((itemId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  }, []);

  const handleImageError = useCallback((itemId: string, itemName: string) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
    // Update the failed image with a fallback
    setRecentItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(itemName)}&background=f97316&color=fff&size=400` }
        : item
    ));
  }, []);

  useEffect(() => {
    const items = recentlyViewedManager.getRecentlyViewed();
    setRecentItems(items);
    
    // Initialize loading states
    const initialLoadingStates: {[key: string]: boolean} = {};
    items.forEach(item => {
      if (item.imageUrl) {
        initialLoadingStates[item.id] = true;
      }
    });
    setImageLoadingStates(initialLoadingStates);
  }, []);

  // Calculate discount percentage
  const calculateDiscount = useCallback((originalPrice?: number, currentPrice?: number) => {
    if (!originalPrice || !currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-orange-200 mb-4">
          🔥 Continue with these items
        </h2>
        <p className="text-orange-400">
          Products you recently viewed - don't let these deals slip away!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer bg-gradient-to-br from-gray-800 to-black rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/20 border border-orange-500/30 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate(`/product/${item.id}`)}
          >
            {/* ✅ Enhanced Product Image with Loading States */}
            <div className="relative overflow-hidden bg-white p-4">
              {/* Loading Skeleton */}
              {imageLoadingStates[item.id] && (
                <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-2xl text-gray-400">📱</div>
                </div>
              )}
              
              <img
                src={getRecentlyViewedImageUrl(item.imageUrl)} // ✅ Use optimized function
                alt={item.name}
                className={`w-full h-32 object-contain group-hover:scale-105 transition-all duration-300 ${
                  imageLoadingStates[item.id] ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id, item.name)}
                style={{
                  // ✅ FIXED: Only use standard CSS properties
                  imageRendering: 'crisp-edges'
                  // ❌ Removed: WebkitImageRendering is not valid in React inline styles
                }}
              />
              
              {/* Discount Badge */}
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold border border-yellow-400 shadow-lg">
                  🔥 {calculateDiscount(item.originalPrice, item.price)}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-orange-200 mb-2 line-clamp-2 group-hover:text-orange-100 transition-colors">
                {item.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-green-400">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-xs text-gray-500 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Fire icon for visual appeal */}
                <div className="text-orange-500 opacity-70 group-hover:opacity-100 transition-opacity">
                  🔥
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;

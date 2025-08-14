// frontend/src/components/RecentlyViewed.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recentlyViewedManager } from '../utils/recentlyViewed';
import { getImageForContext } from '../utils/imageOptimization';

const RecentlyViewed: React.FC = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const items = recentlyViewedManager.getRecentlyViewed();
    setRecentItems(items);
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
            {/* Product Image */}
            <div className="relative overflow-hidden bg-white p-4">
              <img
                src={getImageForContext(item.imageUrl, 'thumbnail')}
                alt={item.name}
                className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-orange-200 mb-2 line-clamp-2 group-hover:text-orange-100 transition-colors">
                {item.name}
              </h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-400">
                  ₹{item.price.toLocaleString()}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{item.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;

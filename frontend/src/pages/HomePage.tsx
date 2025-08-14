// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';
import RecentlyViewed from '../components/RecentlyViewed'; // ✅ Clean import

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  productCount: number;
  recentProducts: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  affiliateLink: string;
  imageUrl: string;
  tags: string;
  categoryName: string;
  categoryId: string;
  createdAt: string;
}

interface HomepageData {
  categories: Category[];
  featuredProducts: Product[];
  latestProducts: Product[];
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalValue: number;
  };
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for scroll containers
  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch homepage data
  const fetchHomepageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage`);
      const data = await response.json();
      
      if (data.success) {
        setHomepageData(data.data);
      } else {
        toast.error('Failed to load homepage data');
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      toast.error('Failed to load homepage');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchHomepageData();
  }, []);

  // Handle product click
  const handleProductClick = useCallback((product: Product) => {
    console.log(`🔗 Product view: ${product.name} - ${product.categoryName}`);
    navigate(`/product/${product.id}`);
  }, [navigate]);

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    console.log(`Category clicked: ${category.name}`);
    navigate(`/category/${category.id}`);
  };

  // Scroll function for horizontal scrolling
  const scrollContainer = useCallback((
    ref: React.RefObject<HTMLDivElement | null>, 
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const scrollAmount = 300;
      const scrollDirection = direction === 'left' ? -scrollAmount : scrollAmount;
      ref.current.scrollBy({ left: scrollDirection, behavior: 'smooth' });
    }
  }, []);

  // Calculate discount percentage
  const calculateDiscount = (original?: number, current?: number) => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  // Get category emoji
  const getCategoryEmoji = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics') || name.includes('tech')) return '📱';
    if (name.includes('fashion') || name.includes('clothing')) return '👕';
    if (name.includes('books') || name.includes('education')) return '📚';
    if (name.includes('fitness') || name.includes('health')) return '🏋️';
    if (name.includes('accessories')) return '🎧';
    if (name.includes('courses') || name.includes('learning')) return '🎓';
    return '🛍️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-xl font-bold text-orange-200 mb-2">🔥 Loading Fire Deals...</p>
          <p className="text-sm text-orange-400">💥 Preparing the hottest student discounts</p>
        </div>
      </div>
    );
  }

  if (!homepageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">💥</div>
          <h2 className="text-3xl font-bold text-orange-200 mb-4">Something Exploded!</h2>
          <p className="text-orange-400 mb-6">The fire deals are temporarily down</p>
          <button
            onClick={fetchHomepageData}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold border-2 border-orange-500"
          >
            🔥 Reignite the Fire
          </button>
        </div>
      </div>
    );
  }

  // Remove duplicates from products - combine and deduplicate by ID
  const allProducts = [...homepageData.featuredProducts, ...homepageData.latestProducts];
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* ✅ Recently Viewed Products - Above Categories */}
        <RecentlyViewed />
        
        {/* ✅ Categories Section */}
        {homepageData.categories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-orange-200">
                🔥 Fire Categories
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollContainer(categoriesScrollRef, 'left')}
                  className="bg-gray-800 hover:bg-gray-700 text-orange-300 p-3 rounded-full border-2 border-orange-500/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollContainer(categoriesScrollRef, 'right')}
                  className="bg-gray-800 hover:bg-gray-700 text-orange-300 p-3 rounded-full border-2 border-orange-500/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div 
              ref={categoriesScrollRef}
              className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #374151'
              }}
            >
              {homepageData.categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex-shrink-0 w-56 bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4 transform hover:scale-125 transition-transform">
                      {getCategoryEmoji(category.name)}
                    </div>
                    <h3 className="text-xl font-bold text-orange-200 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-orange-400 mb-3">
                      {category.description}
                    </p>
                    <p className="text-sm text-orange-300 font-semibold">
                      🔥 {category.productCount} products
                    </p>
                    {category.recentProducts > 0 && (
                      <div className="mt-2 inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                        💥 +{category.recentProducts} NEW
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ All Products Section */}
        {uniqueProducts.length > 0 && (
          <div id="all-products" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-orange-200 mb-4">
                💥 All Fire Products
              </h2>
              <p className="text-xl text-orange-300 font-semibold">
                🔥 Every single deal we've got - all in one place!
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {uniqueProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={getImageForContext(product.imageUrl, 'card')}
                        alt={product.name}
                        className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-800 to-red-800 flex items-center justify-center">
                        <span className="text-5xl">{getCategoryEmoji(product.categoryName)}</span>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold border border-yellow-500">
                        🔥 {calculateDiscount(product.originalPrice, product.price)}% OFF
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold border border-yellow-500">
                      {product.categoryName}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-orange-200 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-orange-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-gray-500 line-through text-lg">
                            ₹{product.originalPrice}
                          </span>
                        )}
                        <span className="text-green-400 font-bold text-2xl">
                          ₹{product.price}
                        </span>
                      </div>
                      
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-orange-400 font-bold">
                          🔥 Save ₹{product.originalPrice - product.price}!
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags && (
                      <div className="flex flex-wrap gap-2">
                        {product.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="bg-gray-700 text-orange-300 px-2 py-1 rounded-full text-xs border border-orange-500/50"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {uniqueProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">🔥</div>
            <h2 className="text-4xl font-bold text-orange-200 mb-6">
              WELCOME TO THE FIRE!
            </h2>
            <p className="text-xl text-orange-300 mb-10 max-w-3xl mx-auto font-semibold">
              We're building the most INSANE collection of student deals! 
              Get ready for deals so hot they'll melt your mind! 🔥
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/products')}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold text-lg border-2 border-orange-500"
              >
                🔥 ADD FIRE PRODUCTS 💥
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

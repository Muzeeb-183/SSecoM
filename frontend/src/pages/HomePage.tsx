// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getImageForContext, ImageContext } from '../utils/imageOptimization';
import RecentlyViewed from '../components/RecentlyViewed';

// ✅ UPDATED: Category interface with imageUrl field
interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
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

// ✅ ENHANCED: Much larger and better looking CategoryImage component
const CategoryImage: React.FC<{ 
  category: Category; 
  getCategoryEmoji: (name: string) => string; 
  getImageForContext: (url: string, context: ImageContext) => string;
}> = ({ category, getCategoryEmoji, getImageForContext }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (category.imageUrl && !imageError) {
    return (
      // ✅ MUCH LARGER: Increased from w-32 h-32 to w-40 h-40 (160px × 160px) with enhanced styling
      <div className="w-40 h-40 mx-auto mb-6 rounded-2xl overflow-hidden border-3 border-orange-400/40 bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105">
        {imageLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse">
            <div className="text-4xl text-orange-400/60 animate-pulse">
              {getCategoryEmoji(category.name)}
            </div>
          </div>
        )}
        <img
          src={getImageForContext(category.imageUrl, 'card')} // ✅ Using 'card' instead of 'thumbnail' for higher quality
          alt={category.name}
          className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 ${
            imageLoading ? 'opacity-0 absolute' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            console.warn(`❌ Category image failed to load for: ${category.name}`);
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {/* ✅ Enhanced overlay gradient for better visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  } else {
    // ✅ ENHANCED: Much larger emoji with better styling
    return (
      <div className="w-40 h-40 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-3 border-orange-400/40 flex items-center justify-center shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105">
        <div className="text-8xl transform hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
          {getCategoryEmoji(category.name)}
        </div>
      </div>
    );
  }
};

const HomePage: React.FC = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});
  const [imageErrorStates, setImageErrorStates] = useState<{[key: string]: boolean}>({});
  const [dataFetched, setDataFetched] = useState(false);
  
  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);

  const handleImageLoad = useCallback((productId: string) => {
    console.log(`✅ Image loaded successfully for product: ${productId}`);
    setImageLoadingStates(prev => ({ ...prev, [productId]: false }));
    setImageErrorStates(prev => ({ ...prev, [productId]: false }));
  }, []);

  const handleImageError = useCallback((productId: string, productName: string, originalUrl: string) => {
    console.error(`❌ Image failed to load for product: ${productName}`, {
      productId,
      originalUrl,
      optimizedUrl: getImageForContext(originalUrl, 'card')
    });
    setImageLoadingStates(prev => ({ ...prev, [productId]: false }));
    setImageErrorStates(prev => ({ ...prev, [productId]: true }));
  }, []);

  const fetchHomepageData = useCallback(async () => {
    if (dataFetched) {
      console.log('🛑 Data already fetched, skipping API call');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Fetching homepage data...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage`);
      const data = await response.json();
      
      if (data.success) {
        setHomepageData(data.data);
        setDataFetched(true);
        
        const allProducts = [...data.data.featuredProducts, ...data.data.latestProducts];
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        console.log('🔍 Image URLs Debug:', {
          totalProducts: uniqueProducts.length,
          totalCategories: data.data.categories.length,
          categoriesWithImages: data.data.categories.filter((c: Category) => c.imageUrl).length,
          urlAnalysis: uniqueProducts.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            originalUrl: p.imageUrl,
            optimizedUrl: getImageForContext(p.imageUrl, 'card'),
            isImageKit: p.imageUrl.includes('ik.imagekit.io')
          }))
        });
        
        setImageLoadingStates(prevStates => {
          const newStates = { ...prevStates };
          const hasExistingStates = Object.keys(prevStates).length > 0;
          
          if (!hasExistingStates) {
            console.log('🆕 Initializing image loading states');
            uniqueProducts.forEach(product => {
              if (product.imageUrl && product.imageUrl.trim() !== '') {
                newStates[product.id] = true;
              }
            });
          } else {
            console.log('✅ Preserving existing image loading states');
          }
          
          return newStates;
        });
        
        setImageErrorStates(prevStates => {
          const hasExistingStates = Object.keys(prevStates).length > 0;
          if (!hasExistingStates) {
            const newStates: {[key: string]: boolean} = {};
            uniqueProducts.forEach(product => {
              if (product.imageUrl && product.imageUrl.trim() !== '') {
                newStates[product.id] = false;
              }
            });
            return newStates;
          }
          return prevStates;
        });
      } else {
        toast.error('Failed to load homepage data');
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      toast.error('Failed to load homepage');
    } finally {
      setIsLoading(false);
    }
  }, [dataFetched]);

  useEffect(() => {
    if (!dataFetched && !homepageData) {
      console.log('🚀 Component mounted, fetching data...');
      fetchHomepageData();
    }
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    console.log(`🔗 Product view: ${product.name} - ${product.categoryName}`);
    navigate(`/product/${product.id}`);
  }, [navigate]);

  const handleCategoryClick = useCallback((category: Category) => {
    console.log(`Category clicked: ${category.name}`, category.imageUrl ? 'with custom image' : 'with emoji');
    navigate(`/category/${category.id}`);
  }, [navigate]);

  const scrollContainer = useCallback((
    ref: React.RefObject<HTMLDivElement | null>, 
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const scrollAmount = 320; // ✅ Increased scroll amount for larger cards
      const scrollDirection = direction === 'left' ? -scrollAmount : scrollAmount;
      ref.current.scrollBy({ left: scrollDirection, behavior: 'smooth' });
    }
  }, []);

  const calculateDiscount = useCallback((original?: number, current?: number) => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  }, []);

  const getCategoryEmoji = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics') || name.includes('tech')) return '📱';
    if (name.includes('fashion') || name.includes('clothing')) return '👕';
    if (name.includes('books') || name.includes('education')) return '📚';
    if (name.includes('fitness') || name.includes('health')) return '🏋️';
    if (name.includes('accessories')) return '🎧';
    if (name.includes('courses') || name.includes('learning')) return '🎓';
    return '🛍️';
  }, []);

  const hasValidImageUrl = useCallback((imageUrl: string | null | undefined): boolean => {
    return !!(
      imageUrl &&
      typeof imageUrl === 'string' &&
      imageUrl.trim() !== '' &&
      imageUrl !== 'null' &&
      imageUrl !== 'undefined' &&
      (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))
    );
  }, []);

  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    setDataFetched(false);
    setHomepageData(null);
    setImageLoadingStates({});
    setImageErrorStates({});
    await fetchHomepageData();
  }, [fetchHomepageData]);

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
            onClick={handleManualRefresh}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold border-2 border-orange-500"
          >
            🔥 Reignite the Fire
          </button>
        </div>
      </div>
    );
  }

  const allProducts = [...homepageData.featuredProducts, ...homepageData.latestProducts];
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-4 py-8">
        
        <RecentlyViewed />
        
        {/* ✅ ENHANCED: Categories Section with much larger images */}
        {homepageData.categories.length > 0 && (
          <div className="mb-20"> {/* ✅ Increased bottom margin for larger cards */}
            <div className="flex items-center justify-between mb-10"> {/* ✅ Increased margin for better spacing */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-orange-200 mb-2"> {/* ✅ Larger title */}
                  🔥 Fire Categories
                </h2>
                <p className="text-lg text-orange-400/80">
                  Discover amazing deals in every category
                </p>
              </div>
              <div className="flex space-x-3"> {/* ✅ Increased button spacing */}
                <button
                  onClick={() => scrollContainer(categoriesScrollRef, 'left')}
                  className="bg-gray-800 hover:bg-gray-700 text-orange-300 p-4 rounded-full border-2 border-orange-500/50 transition-all hover:border-orange-400 hover:scale-110 shadow-lg hover:shadow-orange-500/30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* ✅ Larger icons */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollContainer(categoriesScrollRef, 'right')}
                  className="bg-gray-800 hover:bg-gray-700 text-orange-300 p-4 rounded-full border-2 border-orange-500/50 transition-all hover:border-orange-400 hover:scale-110 shadow-lg hover:shadow-orange-500/30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* ✅ Larger icons */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div 
              ref={categoriesScrollRef}
              className="flex overflow-x-auto space-x-8 pb-6 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800" // ✅ Increased spacing
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #374151'
              }}
            >
              {homepageData.categories.map((category) => (
                <div 
                  key={category.id}
                  // ✅ MUCH LARGER: Increased from w-64 to w-72 with enhanced styling
                  className="flex-shrink-0 w-72 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl p-8 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/50 transition-all duration-500 cursor-pointer transform hover:-translate-y-3 hover:scale-105 border border-orange-500/30 hover:border-orange-400/60 backdrop-blur-sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="text-center">
                    {/* ✅ ENHANCED: Much larger and better looking images */}
                    <CategoryImage 
                      category={category} 
                      getCategoryEmoji={getCategoryEmoji} 
                      getImageForContext={getImageForContext}
                    />
                    
                    <h3 className="text-2xl font-bold text-orange-200 mb-3 hover:text-orange-100 transition-colors"> {/* ✅ Larger title */}
                      {category.name}
                    </h3>
                    <p className="text-sm text-orange-400/90 mb-4 leading-relaxed"> {/* ✅ Better text styling */}
                      {category.description}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <p className="text-base text-orange-300 font-bold flex items-center justify-center"> {/* ✅ Enhanced product count */}
                        🔥 {category.productCount} products
                      </p>
                      {category.recentProducts > 0 && (
                        <div className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg animate-pulse"> {/* ✅ Enhanced NEW badge */}
                          💥 +{category.recentProducts} NEW
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section - Unchanged */}
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
              {uniqueProducts.map((product) => {
                const isLoading = imageLoadingStates[product.id] ?? true;
                const hasError = imageErrorStates[product.id] ?? false;
                const hasValidUrl = hasValidImageUrl(product.imageUrl);

                return (
                  <div 
                    key={product.id}
                    className="bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative overflow-hidden">
                      {hasValidUrl && !hasError ? (
                        <>
                          {isLoading && (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse flex flex-col items-center justify-center z-10">
                              <div className="text-4xl text-orange-400/50 mb-2">
                                {getCategoryEmoji(product.categoryName)}
                              </div>
                              <div className="text-xs text-orange-300 bg-black/50 px-2 py-1 rounded mb-1">
                                Loading image...
                              </div>
                              <div className="w-20 h-1 bg-gray-600 rounded overflow-hidden">
                                <div className="h-full bg-orange-500 rounded animate-pulse"></div>
                              </div>
                            </div>
                          )}
                          
                          <img 
                            src={getImageForContext(product.imageUrl, 'card')}
                            alt={product.name}
                            className={`w-full h-48 object-cover hover:scale-110 transition-all duration-300 ${
                              isLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                            loading="lazy"
                            onLoad={() => handleImageLoad(product.id)}
                            onError={() => handleImageError(product.id, product.name, product.imageUrl)}
                            style={{
                              imageRendering: 'crisp-edges'
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex flex-col items-center justify-center border-2 border-dashed border-orange-500/30 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-pulse"></div>
                          <span className="text-4xl mb-2 relative z-10">{getCategoryEmoji(product.categoryName)}</span>
                          <span className="text-orange-300 text-sm font-medium relative z-10">
                            {hasError ? 'Image Failed' : 'No Image Available'}
                          </span>
                        </div>
                      )}
                      
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold border border-yellow-500 shadow-lg z-20">
                          🔥 {calculateDiscount(product.originalPrice, product.price)}% OFF
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold border border-yellow-500 z-20">
                        {product.categoryName}
                      </div>

                      {process.env.NODE_ENV === 'development' && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs z-20">
                          {isLoading ? '🔄' : '✅'} {hasError ? '❌' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-3 text-orange-200 line-clamp-2 group-hover:text-orange-100 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-orange-400 text-sm mb-4 line-clamp-2 group-hover:text-orange-300 transition-colors">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-gray-500 line-through text-lg">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-green-400 font-bold text-2xl">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                        
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-sm text-orange-400 font-bold">
                            🔥 Save ₹{(product.originalPrice - product.price).toLocaleString()}!
                          </div>
                        )}
                      </div>

                      {product.tags && (
                        <div className="flex flex-wrap gap-2">
                          {product.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="bg-gray-700 text-orange-300 px-2 py-1 rounded-full text-xs border border-orange-500/50 hover:border-orange-400 transition-colors"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                          {product.tags.split(',').length > 2 && (
                            <span className="text-xs text-orange-400 px-2 py-1">
                              +{product.tags.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Data State */}
        {uniqueProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🔥</div>
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
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold text-lg border-2 border-orange-500 shadow-xl hover:shadow-orange-500/50"
              >
                🔥 ADD FIRE PRODUCTS 💥
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;

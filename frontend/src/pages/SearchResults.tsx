import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface SearchProduct {
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
  relevanceScore: number;
}

interface SearchCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  productCount: number;
  relevanceScore: number;
}

interface SearchResults {
  products: SearchProduct[];
  categories: SearchCategory[];
  totalResults: number;
  searchTime: number;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'categories'>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      console.log(`🔍 Searching for: "${query}"`);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(query)}&type=all&limit=50`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setSuggestions(data.suggestions || []);
        console.log(`✅ Search results: ${data.results.totalResults} found in ${data.results.searchTime}ms`);
      } else {
        toast.error('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, navigate]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Handle product click
  const handleProductClick = (product: SearchProduct) => {
    navigate(`/product/${product.id}`);
  };

  // Handle category click
  const handleCategoryClick = (category: SearchCategory) => {
    navigate(`/category/${category.id}`);
  };

  // Handle add to cart
  const handleAddToCart = async (product: SearchProduct, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await addToCart(product);
      
      if (isAuthenticated) {
        toast.success(`🔥 "${product.name}" added to cart!`, {
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#22c55e',
            border: '1px solid #22c55e',
          },
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Calculate discount
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

  // Filter results based on active tab
  const getFilteredResults = () => {
    if (!results) return { products: [], categories: [] };
    
    switch (activeTab) {
      case 'products':
        return { products: results.products, categories: [] };
      case 'categories':
        return { products: [], categories: results.categories };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const hasResults = results && results.totalResults > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-xl font-bold text-orange-200 mb-2">🔍 Searching Fire Deals...</p>
          <p className="text-sm text-orange-400">💥 Finding the hottest results for "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-orange-300 hover:text-orange-100 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-200 mb-4">
            🔍 Search Results
          </h1>
          <p className="text-xl text-orange-300 font-semibold mb-2">
            Results for: <span className="text-orange-100">"{query}"</span>
          </p>
          {hasResults && (
            <p className="text-orange-400">
              💥 Found {results.totalResults} results in {results.searchTime}ms
            </p>
          )}
        </div>

        {hasResults ? (
          <>
            {/* Filter Tabs */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-2 border-2 border-orange-500/30">
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Results', icon: '🔥', count: results.totalResults },
                    { key: 'products', label: 'Products', icon: '📦', count: results.products.length },
                    { key: 'categories', label: 'Categories', icon: '📁', count: results.categories.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                          : 'text-orange-300 hover:text-orange-100 hover:bg-gray-700/50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.key ? 'bg-white/20' : 'bg-orange-500/20'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Results */}
            {filteredResults.categories.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-orange-200 mb-8 flex items-center">
                  <span className="mr-3">📁</span>
                  Categories ({filteredResults.categories.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400"
                    >
                      <div className="text-center">
                        {category.imageUrl ? (
                          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-orange-400/40">
                            <img
                              src={getImageForContext(category.imageUrl, 'thumbnail')}
                              alt={category.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-400/40 flex items-center justify-center">
                            <span className="text-3xl">{getCategoryEmoji(category.name)}</span>
                          </div>
                        )}
                        
                        <h3 className="text-xl font-bold text-orange-200 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-orange-400 text-sm mb-4">
                          {category.description}
                        </p>
                        <p className="text-orange-300 font-bold">
                          🔥 {category.productCount} products
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {filteredResults.products.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-orange-200 mb-8 flex items-center">
                  <span className="mr-3">📦</span>
                  Products ({filteredResults.products.length})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredResults.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400 group"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={getImageForContext(product.imageUrl, 'card')}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
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
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {product.categoryName}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-3 text-orange-200 line-clamp-2 group-hover:text-orange-100 transition-colors">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-orange-400 text-sm mb-4 line-clamp-2 group-hover:text-orange-300 transition-colors">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Pricing */}
                        <div className="mb-4">
                          <div className="flex items-center space-x-3 mb-2">
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-gray-500 line-through text-sm">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-green-400 font-bold text-xl">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </div>
                          
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-orange-400 font-bold">
                              🔥 Save ₹{(product.originalPrice - product.price).toLocaleString()}!
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105"
                          >
                            View Details
                          </button>
                          
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                            title={!isAuthenticated ? 'Login required to add to cart' : 'Add to cart'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                          </button>
                        </div>

                        {/* Tags */}
                        {product.tags && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {product.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="bg-gray-700 text-orange-300 px-2 py-1 rounded-full text-xs"
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
          </>
        ) : (
          /* No Results State */
          <div className="text-center py-20">
            <div className="text-8xl mb-8">🔍</div>
            <h2 className="text-3xl font-bold text-orange-200 mb-6">
              No Fire Deals Found
            </h2>
            <p className="text-xl text-orange-300 mb-8 max-w-2xl mx-auto">
              We couldn't find any products or categories matching "<span className="text-orange-100 font-semibold">{query}</span>". 
              Try different keywords or browse our categories!
            </p>
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-orange-200 mb-4">💡 Try searching for:</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(suggestion)}`)}
                      className="bg-gray-800 text-orange-300 px-4 py-2 rounded-full hover:bg-gray-700 hover:text-orange-100 transition-all border border-orange-500/30 hover:border-orange-400"
                    >
                      🔥 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold text-lg border-2 border-orange-500"
            >
              🔥 Browse All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

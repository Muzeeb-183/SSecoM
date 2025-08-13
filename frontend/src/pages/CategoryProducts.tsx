// frontend/src/pages/CategoryProducts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  productCount: number;
}

const MAX_RECENT_PRODUCTS = 8;

// Custom hook for localStorage with user-specific keys
const useUserLocalStorage = (key: string, initialValue: any, userId?: string) => {
  const getStorageKey = useCallback(() => {
    return userId ? `${key}_user_${userId}` : `${key}_guest`;
  }, [key, userId]);

  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (!userId) return initialValue;
      const item = localStorage.getItem(getStorageKey());
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: any) => {
    try {
      setStoredValue(value);
      if (userId) {
        localStorage.setItem(getStorageKey(), JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [getStorageKey, userId]);

  return [storedValue, setValue] as const;
};

const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use custom hook for recently visited products with proper persistence
  const [recentlyVisited, setRecentlyVisited] = useUserLocalStorage(
    'recentlyVisitedProducts', 
    [], 
    user?.id
  );

  // Fetch category and its products
  const fetchCategoryProducts = async () => {
    if (!categoryId) {
      toast.error('Category not found');
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        // Set category info from the first product if available
        if (data.products.length > 0) {
          setCategory({
            id: data.products[0].categoryId,
            name: data.products[0].categoryName,
            description: `All products in ${data.products[0].categoryName}`,
            slug: categoryId,
            productCount: data.products.length
          });
        }
      } else {
        toast.error('Failed to load category products');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Failed to load category products');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // Save product to user-specific recently visited
  const saveToRecentlyVisited = useCallback((product: Product) => {
    if (!user?.id) {
      console.log('User not logged in, not saving to recently visited');
      return;
    }

    try {
      const currentRecentlyVisited = Array.isArray(recentlyVisited) ? recentlyVisited : [];
      let updatedRecent = currentRecentlyVisited.filter((p: Product) => p.id !== product.id);
      updatedRecent.unshift(product);
      
      if (updatedRecent.length > MAX_RECENT_PRODUCTS) {
        updatedRecent = updatedRecent.slice(0, MAX_RECENT_PRODUCTS);
      }
      
      setRecentlyVisited(updatedRecent);
      console.log(`✅ Saved to recently visited for user ${user.email}:`, product.name);
    } catch (error) {
      console.error('Error saving to recently visited:', error);
    }
  }, [user?.id, user?.email, recentlyVisited, setRecentlyVisited]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId]);

  // Handle product click
  const handleProductClick = useCallback((product: Product) => {
    console.log(`🔗 Product view: ${product.name} - ${product.categoryName}`);
    saveToRecentlyVisited(product);
    navigate(`/product/${product.id}`, { replace: false });
  }, [navigate, saveToRecentlyVisited]);

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
          <p className="text-xl font-bold text-orange-200 mb-2">🔥 Loading Category Products...</p>
          <p className="text-sm text-orange-400">💥 Preparing fire deals in this category</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">😕</div>
          <h2 className="text-3xl font-bold text-orange-200 mb-4">Category Not Found</h2>
          <p className="text-orange-400 mb-6">This category might not exist or has no products</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold border-2 border-orange-500"
          >
            🔥 Back to Home
          </button>
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
          Back to Categories
        </button>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">
            {getCategoryEmoji(category.name)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-orange-200 mb-4">
            🔥 {category.name} Fire Deals
          </h1>
          <p className="text-xl text-orange-300 font-semibold mb-2">
            {category.description}
          </p>
          <p className="text-orange-400">
            💥 {products.length} hot products in this category
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
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
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">🔍</div>
            <h2 className="text-3xl font-bold text-orange-200 mb-6">
              No Products Found
            </h2>
            <p className="text-xl text-orange-300 mb-10 max-w-3xl mx-auto font-semibold">
              This category doesn't have any products yet. Check back later for fire deals! 🔥
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold text-lg border-2 border-orange-500"
            >
              🔥 Browse All Products
            </button>
          </div>
        )}

        {/* Related Categories or Back to Home */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors border-2 border-purple-400"
          >
            🔥 Explore More Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;

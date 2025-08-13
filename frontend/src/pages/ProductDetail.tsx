// frontend/src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';

interface ProductButton {
  name: string;
  link: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  buttons: ProductButton[];
  tags: string[];
  categoryName: string;
  categoryId: string;
  createdAt: string;
  status: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        // Parse JSON fields if they exist
        const productData = {
          ...data.product,
          images: data.product.images ? JSON.parse(data.product.images) : [data.product.imageUrl].filter(Boolean),
          buttons: data.product.buttons ? JSON.parse(data.product.buttons) : [{ name: 'Buy Now', link: data.product.affiliateLink }],
          tags: data.product.tags ? data.product.tags.split(',').map((tag: string) => tag.trim()) : []
        };
        setProduct(productData);
        
        // Fetch related products from the same category
        fetchRelatedProducts(productData.categoryId, productData.id);
      } else {
        toast.error('Product not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch related products from same category
  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}/products`);
      const data = await response.json();
      
      if (data.success) {
        // Filter out current product and limit to 8 products
        const filtered = data.products
          .filter((prod: any) => prod.id !== currentProductId)
          .slice(0, 8)
          .map((prod: any) => ({
            ...prod,
            images: prod.images ? JSON.parse(prod.images) : [prod.imageUrl].filter(Boolean),
            buttons: prod.buttons ? JSON.parse(prod.buttons) : [{ name: 'Buy Now', link: prod.affiliateLink }],
            tags: prod.tags ? prod.tags.split(',').map((tag: string) => tag.trim()) : []
          }));
        
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle affiliate click tracking
  const handleAffiliateClick = (button: ProductButton) => {
    console.log(`🔗 Affiliate click: ${product?.name} -> ${button.name}`);
    window.open(button.link, '_blank');
  };

  // Handle related product click
  const handleRelatedProductClick = (relatedProduct: Product) => {
    console.log(`🔗 Related product click: ${relatedProduct.name}`);
    navigate(`/product/${relatedProduct.id}`);
  };

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

  // Navigate to previous/next image
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? product!.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === product!.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-orange-200">Loading product details...</p>
          <p className="text-sm text-orange-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-orange-200 mb-2">Product Not Found</h2>
          <p className="text-orange-400 mb-4">This product might not be available anymore</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors"
          >
            ← Back to Home
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
          Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* LEFT: PROFESSIONAL PRODUCT IMAGES */}
          <div className="space-y-6">
            {/* Main Image with Professional Styling */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-orange-500/20 overflow-hidden border-4 border-orange-500/30 p-8">
              {product.images[selectedImageIndex] ? (
                <img
                  src={getImageForContext(product.images[selectedImageIndex], 'detail')} // ✅ Optimized
                  alt={product.name}
                  className="w-full aspect-square object-contain rounded-2xl bg-white shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
                  <span className="text-6xl text-gray-400">{getCategoryEmoji(product.categoryName)}</span>
                </div>
              )}
              
              {/* Discount Badge */}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-yellow-500">
                  🔥 {calculateDiscount(product.originalPrice, product.price)}% OFF
                </div>
              )}

              {/* Image Navigation Buttons - Professional Style */}
              {product.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg border border-gray-200 hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg border border-gray-200 hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm border border-gray-200 shadow-lg">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Image Thumbnails - Professional Style */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 px-2">
                  {/*  For thumbnails: */}
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 shadow-md hover:shadow-lg p-1 bg-white ${
                        selectedImageIndex === index 
                          ? 'border-orange-500 shadow-lg shadow-orange-500/50 scale-105' 
                          : 'border-gray-300 hover:border-orange-400 hover:scale-102'
                      }`}
                    >
                      <img
                        src={getImageForContext(image, 'thumbnail')} // ✅ Small optimized thumbnails
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div className="space-y-8">
            
            {/* Product Header */}
            <div>
              {/* Category Badge */}
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold mb-4 border border-purple-400">
                {getCategoryEmoji(product.categoryName)} {product.categoryName}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-orange-200 mb-4">
                {product.name}
              </h1>

              {/* Description */}
              {product.description && (
                <p className="text-orange-300 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-4xl font-bold text-green-400">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-orange-400 font-bold">
                    🔥 You save ₹{(product.originalPrice - product.price).toLocaleString()}! 💰
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-700 text-orange-300 px-3 py-1 rounded-full text-sm border border-orange-500/50"
                    >
                      🔥 {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buy Buttons Section - Below Images */}
        <div className="mt-12">
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl shadow-orange-500/20 p-8 border border-orange-500/30">
            <h3 className="text-2xl font-bold text-orange-200 mb-6 text-center">
              🔥 Get This Product Now
            </h3>
            
            <div className="max-w-md mx-auto space-y-4">
              {product.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => handleAffiliateClick(button)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg border-2 ${
                    index === 0 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-orange-500/30 border-orange-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/30 border-blue-400'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-green-500/30 border-green-400'
                  }`}
                >
                  {button.name}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-orange-300 text-sm">
                🔒 Safe & Secure • ⚡ Instant Access • ✅ Student Verified
              </p>
              <p className="text-orange-400 text-xs mt-2">
                Added on {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-orange-200 mb-4">
                🔥 More from {product.categoryName}
              </h2>
              <p className="text-orange-300">
                Other awesome products in this category
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <div
                  key={relatedProduct.id}
                  className="group bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-2 border border-orange-500/30 hover:border-orange-400 cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct)}
                >
                  {/* Product Image - Professional Style */}
                  <div className="relative overflow-hidden bg-white rounded-xl p-4">
                    {relatedProduct.images[0] ? (
                      <img 
                        src={relatedProduct.images[0]} 
                        alt={relatedProduct.name}
                        className="w-full h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                        <span className="text-4xl text-gray-400">{getCategoryEmoji(relatedProduct.categoryName)}</span>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold border border-yellow-500">
                        {calculateDiscount(relatedProduct.originalPrice, relatedProduct.price)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-3 text-orange-200 group-hover:text-orange-100 transition-colors line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    
                    {relatedProduct.description && (
                      <p className="text-orange-400 text-sm mb-4 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                    )}
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-gray-500 line-through text-sm">
                            ₹{relatedProduct.originalPrice}
                          </span>
                        )}
                        <span className="text-green-400 font-bold text-xl">
                          ₹{relatedProduct.price}
                        </span>
                      </div>
                      
                      {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                        <div className="text-xs text-orange-400 font-semibold">
                          🔥 Save ₹{relatedProduct.originalPrice - relatedProduct.price}!
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {relatedProduct.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {relatedProduct.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="bg-gray-700 text-orange-300 px-2 py-1 rounded-full text-xs border border-orange-500/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* View Product Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRelatedProductClick(relatedProduct);
                      }}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 border border-orange-400"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show All Category Products Button */}
            <div className="text-center mt-8">
              <button 
                onClick={() => {
                  navigate(`/category/${product.categoryId}`);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors border-2 border-purple-400"
              >
                View All {product.categoryName} Products →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

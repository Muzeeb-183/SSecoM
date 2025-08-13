// frontend/src/utils/imageOptimization.ts

/**
 * Generate optimized ImageKit URL with transformations
 * @param originalUrl - Original ImageKit URL
 * @param width - Target width (default: 400)
 * @param height - Target height (default: 400)
 * @param quality - Image quality 1-100 (default: 80)
 * @returns Optimized ImageKit URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  width: number = 400, 
  height: number = 400,
  quality: number = 80
): string => {
  if (!originalUrl) return '';
  
  // Check if URL is from ImageKit (contains imagekit.io)
  if (!originalUrl.includes('imagekit.io')) {
    return originalUrl; // Return original URL if not ImageKit
  }
  
  // Build transformation parameters
  const transformations = [
    `w-${width}`,           // Width
    `h-${height}`,          // Height  
    'c-maintain_ratio',     // Maintain aspect ratio
    `q-${quality}`,         // Quality
    'f-auto'                // Auto format (WebP when supported)
  ].join(',');
  
  return `${originalUrl}?tr=${transformations}`;
};

/**
 * Generate multiple optimized sizes for responsive images
 */
export const getResponsiveImageUrls = (originalUrl: string) => {
  return {
    thumbnail: getOptimizedImageUrl(originalUrl, 150, 150, 70),    // Small thumbnails
    medium: getOptimizedImageUrl(originalUrl, 400, 400, 80),       // Product cards
    large: getOptimizedImageUrl(originalUrl, 800, 800, 85),        // Product detail
    hero: getOptimizedImageUrl(originalUrl, 1200, 800, 90)         // Hero images
  };
};

/**
 * Generate optimized URL for specific use cases
 */
export const getImageForContext = (originalUrl: string, context: 'thumbnail' | 'card' | 'detail' | 'hero') => {
  const sizes = {
    thumbnail: { width: 64, height: 64, quality: 70 },
    card: { width: 300, height: 300, quality: 80 },
    detail: { width: 600, height: 600, quality: 85 },
    hero: { width: 1200, height: 800, quality: 90 }
  };
  
  const { width, height, quality } = sizes[context];
  return getOptimizedImageUrl(originalUrl, width, height, quality);
};

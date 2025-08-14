// frontend/src/utils/imageOptimization.ts

// ✅ Define the allowed context types
export type ImageContext = 'thumbnail' | 'card' | 'detail' | 'hero' | 'recently-viewed' | 'zoom';

// ✅ Define dimensions interface
interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Generate optimized ImageKit URL with transformations
 * @param originalUrl - Original ImageKit URL
 * @param width - Target width (default: 400)
 * @param height - Target height (default: 400)
 * @param quality - Image quality 1-100 (default: 85)
 * @returns Optimized ImageKit URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  width: number = 400, 
  height: number = 400,
  quality: number = 85
): string => {
  if (!originalUrl) return '';
  
  // Check if URL is from ImageKit (contains imagekit.io)
  if (!originalUrl.includes('imagekit.io')) {
    return originalUrl; // Return original URL if not ImageKit
  }
  
  // ✅ Enhanced transformation parameters for better quality
  const transformations = [
    `w-${width}`,           // Width
    `h-${height}`,          // Height  
    'c-maintain_ratio',     // Maintain aspect ratio
    `q-${quality}`,         // Quality (increased default to 85)
    'f-auto',               // Auto format (WebP when supported)
    'dpr-auto',             // ✅ Auto device pixel ratio for high-res displays
    'fo-auto',              // ✅ Auto focus for better cropping
    'e-sharpen-1',          // ✅ Light sharpening for crispness
    'pr-true'               // ✅ Progressive loading
  ].join(',');
  
  return `${originalUrl}?tr=${transformations}`;
};

/**
 * ✅ NEW: Specific function for recently viewed images with optimal settings
 */
export const getRecentlyViewedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  if (originalUrl.includes('imagekit.io')) {
    // Optimized specifically for recently viewed thumbnails
    const transformations = [
      'w-400',              // 400px width for crisp display
      'h-400',              // 400px height  
      'q-92',               // High quality (92) for sharp images
      'f-auto',             // Auto format selection
      'dpr-auto',           // Auto device pixel ratio
      'c-maintain_ratio',   // Maintain aspect ratio
      'fo-auto',            // Auto focus
      'e-sharpen-1',        // Light sharpening
      'pr-true'             // Progressive loading
    ].join(',');
    
    return `${originalUrl}?tr=${transformations}`;
  }
  
  return originalUrl;
};

/**
 * ✅ Enhanced: Generate multiple optimized sizes for responsive images
 */
export const getResponsiveImageUrls = (originalUrl: string) => {
  return {
    thumbnail: getOptimizedImageUrl(originalUrl, 200, 200, 85),    // ✅ Improved thumbnails
    medium: getOptimizedImageUrl(originalUrl, 400, 400, 87),       // ✅ Better product cards
    large: getOptimizedImageUrl(originalUrl, 800, 800, 90),        // Product detail
    hero: getOptimizedImageUrl(originalUrl, 1200, 800, 92),        // ✅ Enhanced hero images
    zoom: getOptimizedImageUrl(originalUrl, 1600, 1600, 95)        // ✅ NEW: For zoom functionality
  };
};

/**
 * ✅ FIXED: Generate optimized URL for specific use cases with proper typing
 */
export const getImageForContext = (
  originalUrl: string, 
  context: ImageContext
): string => {
  // ✅ Enhanced context settings with higher quality and better parameters
  const contextSettings: Record<ImageContext, { width: number; height: number; quality: number }> = {
    'thumbnail': { width: 300, height: 300, quality: 85 },           // ✅ Improved thumbnails
    'recently-viewed': { width: 400, height: 400, quality: 90 },     // ✅ High quality for recently viewed
    'card': { width: 500, height: 500, quality: 85 },               // ✅ Better product cards
    'detail': { width: 800, height: 800, quality: 90 },             // Product detail pages
    'hero': { width: 1200, height: 800, quality: 92 },              // ✅ Enhanced hero images
    'zoom': { width: 1600, height: 1600, quality: 95 }              // ✅ NEW: High-res zoom images
  };
  
  const settings = contextSettings[context] || contextSettings['card'];
  
  // For ImageKit URLs, add comprehensive optimization parameters
  if (originalUrl && originalUrl.includes('imagekit.io')) {
    const transformations = [
      `w-${settings.width}`,     // Width
      `h-${settings.height}`,    // Height  
      `q-${settings.quality}`,   // Quality
      'f-auto',                  // Auto format (WebP when supported)
      'dpr-auto',                // Auto device pixel ratio for high-res displays
      'c-maintain_ratio',        // Crop mode to maintain aspect ratio
      'fo-auto',                 // Auto focus for better cropping
      'e-sharpen-1',             // ✅ Add slight sharpening for crispness
      'pr-true'                  // ✅ Progressive loading for better UX
    ].join(',');
    
    return `${originalUrl}?tr=${transformations}`;
  }
  
  return originalUrl || '';
};

/**
 * ✅ NEW: Generate optimized URL for profile pictures with circular crop
 */
export const getProfileImageUrl = (originalUrl: string, size: number = 300): string => {
  if (!originalUrl) return '';
  
  if (originalUrl.includes('imagekit.io')) {
    const transformations = [
      `w-${size}`,              // Square dimensions
      `h-${size}`,              
      'q-92',                   // High quality for profile pictures
      'f-auto',                 // Auto format
      'dpr-auto',               // Auto DPR
      'c-maintain_ratio',       // Maintain ratio
      'fo-face',                // Focus on face for better cropping
      'e-sharpen-1',            // Light sharpening
      'pr-true'                 // Progressive loading
    ].join(',');
    
    return `${originalUrl}?tr=${transformations}`;
  }
  
  return originalUrl;
};

/**
 * ✅ NEW: Utility function to check if image is from ImageKit
 */
export const isImageKitUrl = (url: string): boolean => {
  return !!(url && url.includes('imagekit.io'));
};

/**
 * ✅ NEW: Generate fallback image URL for failed loads
 */
export const getFallbackImageUrl = (
  itemName: string, 
  size: number = 400,
  backgroundColor: string = 'f97316',
  textColor: string = 'fff'
): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(itemName)}&background=${backgroundColor}&color=${textColor}&size=${size}`;
};

/**
 * ✅ NEW: Batch optimize multiple images for better performance
 */
export const batchOptimizeImages = (
  images: { url: string; context: ImageContext }[]
): { url: string; optimizedUrl: string; context: ImageContext }[] => {
  return images.map(({ url, context }) => ({
    url,
    optimizedUrl: getImageForContext(url, context),
    context
  }));
};

/**
 * ✅ FIXED: Get image dimensions for layout calculations with proper typing
 */
export const getImageDimensions = (context: ImageContext): ImageDimensions => {
  const dimensions: Record<ImageContext, ImageDimensions> = {
    'thumbnail': { width: 300, height: 300 },
    'recently-viewed': { width: 400, height: 400 },
    'card': { width: 500, height: 500 },
    'detail': { width: 800, height: 800 },
    'hero': { width: 1200, height: 800 },
    'zoom': { width: 1600, height: 1600 }
  };
  
  return dimensions[context] || dimensions['card']; // ✅ No more TypeScript error!
};

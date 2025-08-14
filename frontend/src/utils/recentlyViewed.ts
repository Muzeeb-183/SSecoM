// frontend/src/utils/recentlyViewed.ts
interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName: string;
  viewedAt: Date;
}

class RecentlyViewedManager {
  private storageKey = 'ssecom_recently_viewed';
  private maxItems = 10;

  // Add product to recently viewed
  addProduct(product: any): void {
    const recentItems = this.getRecentlyViewed();
    
    // Remove if already exists (to avoid duplicates)
    const filtered = recentItems.filter(item => item.id !== product.id);
    
    // Add to beginning of array (most recent first)
    const newItem: RecentlyViewedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.images?.[0] || product.imageUrl || '',
      categoryName: product.categoryName,
      viewedAt: new Date()
    };
    
    filtered.unshift(newItem);
    
    // Keep only last 10 items
    const limited = filtered.slice(0, this.maxItems);
    
    // Store in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(limited));
  }

  // Get recently viewed products
  getRecentlyViewed(): RecentlyViewedProduct[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      // Filter out items older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return parsed.filter((item: RecentlyViewedProduct) => 
        new Date(item.viewedAt) > thirtyDaysAgo
      );
    } catch {
      return [];
    }
  }

  // Clear all recently viewed
  clearRecentlyViewed(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const recentlyViewedManager = new RecentlyViewedManager();

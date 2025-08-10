// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  isStudent: boolean;
  studentId?: string;
  university?: string;
  graduationYear?: number;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  isStudent: boolean;
  studentId?: string;
  university?: string;
  graduationYear?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: Category;
  subCategory?: string;
  brand: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  availability: ProductAvailability;
  ratings: ProductRating;
  tags: string[];
  isStudentExclusive: boolean;
  studentDiscount?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  saleEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
  category?: string;
}

export interface ProductAvailability {
  inStock: boolean;
  quantity: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  restockDate?: string;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isStudentCategory: boolean;
  order: number;
  isActive: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariants?: ProductVariant[];
  addedAt: string;
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalOriginalPrice: number;
  totalSavings: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity: number, variants?: ProductVariant[]) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => void;
  appliedCoupon: Coupon | null;
}

export interface ProductVariant {
  type: 'size' | 'color' | 'storage' | 'other';
  name: string;
  value: string;
  priceModifier?: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  payment: PaymentInfo;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string;
  studentDiscount?: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variants?: ProductVariant[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Address Types
export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'home' | 'work' | 'university' | 'other';
}

// Payment Types
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  processedAt?: string;
}

export type PaymentMethod = 
  | 'card'
  | 'paypal'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'student_wallet';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isStudentExclusive: boolean;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  isVerifiedPurchase: boolean;
  isStudentReview: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// Theme Types
export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ColorScheme;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string[];
  rating?: number;
  isOnSale?: boolean;
  isStudentExclusive?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

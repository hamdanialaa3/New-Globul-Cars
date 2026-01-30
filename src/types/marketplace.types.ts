/**
 * Marketplace Types
 * Koli One Parts & Accessories Marketplace
 * Support for Bulgarian market with dropshipping capabilities
 */

import { Timestamp } from 'firebase/firestore';

// ==================== PRODUCT TYPES ====================

export type ProductCategory =
  | 'parts' // قطع غيار
  | 'accessories' // إكسسوارات
  | 'tools' // أدوات
  | 'electronics' // إلكترونيات
  | 'interior' // داخلية
  | 'exterior' // خارجية
  | 'wheels' // عجلات
  | 'lighting' // إضاءة
  | 'audio' // صوتيات
  | 'performance' // تحسين الأداء
  | 'other'; // أخرى

export type ProductCondition = 'new' | 'used' | 'refurbished';

export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'pre_order' | 'dropship';

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSpecs {
  [key: string]: string | number | boolean;
}

export interface CompatibleVehicle {
  make: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface Product {
  id: string;
  sellerId: string; // User numeric ID
  sellerName: string;
  sellerType: 'dealer' | 'private' | 'supplier';
  
  // Product Info
  title: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  partNumber?: string;
  
  // Pricing
  price: number;
  currency: 'BGN' | 'EUR';
  originalPrice?: number; // للعروض
  discount?: number; // نسبة الخصم
  
  // Inventory
  condition: ProductCondition;
  availability: ProductAvailability;
  quantity: number;
  minOrderQuantity?: number;
  
  // Compatibility
  compatibleVehicles?: CompatibleVehicle[];
  universalFit?: boolean; // يناسب كل السيارات
  
  // Media
  images: ProductImage[];
  videoUrl?: string;
  
  // Specs
  specifications?: ProductSpecs;
  warranty?: string;
  weight?: number; // kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Shipping
  shippingCost?: number;
  freeShipping?: boolean;
  shippingDays?: number;
  shipsFrom?: string; // City
  
  // Dropshipping
  isDropship?: boolean;
  supplierName?: string;
  supplierUrl?: string;
  
  // Stats
  views: number;
  sales: number;
  rating: number;
  reviewCount: number;
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  
  // Status
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  featured?: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastRestocked?: Timestamp;
}

// ==================== ORDER TYPES ====================

export type OrderStatus =
  | 'pending' // في انتظار التأكيد
  | 'confirmed' // مؤكد
  | 'processing' // قيد المعالجة
  | 'shipped' // تم الشحن
  | 'delivered' // تم التسليم
  | 'cancelled' // ملغى
  | 'refunded'; // مسترجع

export type PaymentMethod = 'cash_on_delivery' | 'bank_transfer' | 'stripe' | 'revolut';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  isDropship?: boolean;
  supplierOrderId?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  region: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // AUTO-GENERATED (e.g., KO-2026-00001)
  buyerId: string; // User numeric ID
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: 'BGN' | 'EUR';
  
  // Shipping
  shippingAddress: ShippingAddress;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: Timestamp;
  
  // Status
  status: OrderStatus;
  trackingNumber?: string;
  carrierName?: string;
  
  // Notes
  buyerNotes?: string;
  sellerNotes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
}

// ==================== COMMISSION & FEES ====================

export interface MarketplaceFee {
  sellerId: string;
  orderId: string;
  
  // Revenue
  orderTotal: number;
  platformFee: number; // عمولة المنصة (%)
  feeAmount: number; // المبلغ الفعلي للعمولة
  sellerEarnings: number; // أرباح البائع
  
  // Status
  status: 'pending' | 'paid' | 'disputed';
  paidAt?: Timestamp;
  
  createdAt: Timestamp;
}

// ==================== REVIEWS ====================

export interface ProductReview {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  
  helpful: number; // عدد الذين وجدوها مفيدة
  
  verified: boolean; // شراء مؤكد
  sellerResponse?: string;
  
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== SUPPLIER (DROPSHIPPING) ====================

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  
  // Location
  country: string;
  city: string;
  
  // Stats
  rating: number;
  totalOrders: number;
  successfulDeliveries: number;
  
  // Settings
  apiKey?: string;
  apiUrl?: string;
  commissionRate: number; // نسبة العمولة
  
  status: 'active' | 'inactive' | 'suspended';
  
  createdAt: Timestamp;
}

// ==================== CART ====================

export interface CartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  addedAt: Timestamp;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  
  updatedAt: Timestamp;
}

// ==================== WISHLIST ====================

export interface WishlistItem {
  productId: string;
  addedAt: Timestamp;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  
  updatedAt: Timestamp;
}

// ==================== SEARCH FILTERS ====================

export interface MarketplaceFilters {
  category?: ProductCategory;
  subcategory?: string;
  condition?: ProductCondition;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  make?: string; // للتوافق مع السيارات
  model?: string;
  availability?: ProductAvailability;
  freeShipping?: boolean;
  rating?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular' | 'rating';
}

// ==================== ANALYTICS ====================

export interface MarketplaceStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  
  topCategories: { category: ProductCategory; count: number }[];
  topSellers: { sellerId: string; sellerName: string; sales: number }[];
  
  period: 'today' | 'week' | 'month' | 'year' | 'all';
  generatedAt: Timestamp;
}

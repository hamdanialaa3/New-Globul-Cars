/**
 * Cart Service for Koli One Marketplace
 * خدمة سلة التسوق لسوق Koli One
 * 
 * ✅ PRODUCTION READY: Implements full cart functionality with localStorage + Firestore sync
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  titleBg?: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  inStock: boolean;
  category?: string;
  sellerId?: string;
  sellerName?: string;
  maxQuantity?: number;
  addedAt: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
  userId?: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  currency: string;
}

// ==================== CONSTANTS ====================

const CART_STORAGE_KEY = 'koli_one_cart';
const SHIPPING_RATE = 5.99; // BGN flat rate
const FREE_SHIPPING_THRESHOLD = 100; // Free shipping over 100 BGN
const TAX_RATE = 0.20; // 20% VAT for Bulgaria

// ==================== CART SERVICE ====================

class CartService {
  private static instance: CartService;
  private cart: Cart = { items: [], updatedAt: Date.now() };
  private listeners: Set<(cart: Cart) => void> = new Set();
  private firestoreUnsubscribe: Unsubscribe | null = null;
  private currentUserId: string | null = null;

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize cart for user (called after login)
   */
  public async initializeForUser(userId: string): Promise<void> {
    this.currentUserId = userId;
    
    try {
      // Load from Firestore if user is logged in
      const firestoreCart = await this.loadFromFirestore(userId);
      
      if (firestoreCart) {
        // Merge local cart with Firestore cart
        this.mergeCart(firestoreCart);
      } else {
        // Save current local cart to Firestore
        await this.saveToFirestore(userId);
      }

      // Subscribe to real-time updates
      this.subscribeToFirestore(userId);
      
      logger.info('Cart initialized for user', { userId, itemCount: this.cart.items.length });
    } catch (error) {
      logger.error('Failed to initialize cart for user', error as Error, { userId });
    }
  }

  /**
   * Clear user context (called after logout)
   */
  public clearUserContext(): void {
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    this.currentUserId = null;
    this.cart = { items: [], updatedAt: Date.now() };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  // ==================== CART OPERATIONS ====================

  /**
   * Add item to cart
   */
  public addItem(item: Omit<CartItem, 'id' | 'addedAt'>): CartItem {
    const existingIndex = this.cart.items.findIndex(i => i.productId === item.productId);
    
    let cartItem: CartItem;
    
    if (existingIndex >= 0) {
      // Update quantity if item exists
      const existingItem = this.cart.items[existingIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      const maxQty = item.maxQuantity || 99;
      
      cartItem = {
        ...existingItem,
        quantity: Math.min(newQuantity, maxQty),
        price: item.price, // Update price in case it changed
        inStock: item.inStock
      };
      
      this.cart.items[existingIndex] = cartItem;
    } else {
      // Add new item
      cartItem = {
        ...item,
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: Math.min(item.quantity, item.maxQuantity || 99),
        addedAt: Date.now()
      };
      
      this.cart.items.push(cartItem);
    }

    this.cart.updatedAt = Date.now();
    this.persist();
    
    logger.info('Item added to cart', { 
      productId: item.productId, 
      quantity: cartItem.quantity,
      totalItems: this.cart.items.length 
    });
    
    return cartItem;
  }

  /**
   * Update item quantity
   */
  public updateQuantity(itemId: string, quantity: number): boolean {
    const index = this.cart.items.findIndex(i => i.id === itemId);
    
    if (index < 0) return false;
    
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    
    const maxQty = this.cart.items[index].maxQuantity || 99;
    this.cart.items[index].quantity = Math.min(quantity, maxQty);
    this.cart.updatedAt = Date.now();
    this.persist();
    
    return true;
  }

  /**
   * Remove item from cart
   */
  public removeItem(itemId: string): boolean {
    const initialLength = this.cart.items.length;
    this.cart.items = this.cart.items.filter(i => i.id !== itemId);
    
    if (this.cart.items.length < initialLength) {
      this.cart.updatedAt = Date.now();
      this.persist();
      logger.info('Item removed from cart', { itemId });
      return true;
    }
    
    return false;
  }

  /**
   * Clear entire cart
   */
  public clearCart(): void {
    this.cart.items = [];
    this.cart.updatedAt = Date.now();
    this.persist();
    logger.info('Cart cleared');
  }

  // ==================== GETTERS ====================

  /**
   * Get all cart items
   */
  public getItems(): CartItem[] {
    return [...this.cart.items];
  }

  /**
   * Get cart item count
   */
  public getItemCount(): number {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get unique product count
   */
  public getUniqueItemCount(): number {
    return this.cart.items.length;
  }

  /**
   * Get cart summary
   */
  public getSummary(): CartSummary {
    const subtotal = this.cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
    const tax = subtotal * TAX_RATE;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount: this.getItemCount(),
      currency: 'BGN'
    };
  }

  /**
   * Load cart from local storage (used on page init)
   */
  public async loadCart(): Promise<Cart> {
    this.loadFromLocalStorage();
    this.notifyListeners();
    return this.cart;
  }

  /**
   * Sync cart with Firestore for logged-in users
   */
  public async syncWithFirestore(userId: string): Promise<void> {
    if (!userId) return;

    if (this.currentUserId !== userId) {
      await this.initializeForUser(userId);
      return;
    }

    // Ensure Firestore has the latest local data
    await this.saveToFirestore(userId);
  }

  /**
   * Backward-compatible alias used by UI
   */
  public getCartSummary(): CartSummary {
    return this.getSummary();
  }

  /**
   * Backward-compatible alias used by UI
   */
  public updateItemQuantity(itemId: string, quantity: number): boolean {
    return this.updateQuantity(itemId, quantity);
  }

  /**
   * Check if cart is empty
   */
  public isEmpty(): boolean {
    return this.cart.items.length === 0;
  }

  /**
   * Check if product is in cart
   */
  public hasProduct(productId: string): boolean {
    return this.cart.items.some(i => i.productId === productId);
  }

  /**
   * Get quantity of specific product
   */
  public getProductQuantity(productId: string): number {
    const item = this.cart.items.find(i => i.productId === productId);
    return item?.quantity || 0;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate cart before checkout
   */
  public validateForCheckout(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.cart.items.length === 0) {
      errors.push('Cart is empty');
    }
    
    const outOfStockItems = this.cart.items.filter(i => !i.inStock);
    if (outOfStockItems.length > 0) {
      errors.push(`${outOfStockItems.length} item(s) are out of stock`);
    }
    
    const invalidPriceItems = this.cart.items.filter(i => i.price <= 0);
    if (invalidPriceItems.length > 0) {
      errors.push(`${invalidPriceItems.length} item(s) have invalid prices`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==================== PERSISTENCE ====================

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cart = {
          items: parsed.items || [],
          updatedAt: parsed.updatedAt || Date.now()
        };
      }
    } catch (error) {
      logger.error('Failed to load cart from localStorage', error as Error);
      this.cart = { items: [], updatedAt: Date.now() };
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      logger.error('Failed to save cart to localStorage', error as Error);
    }
  }

  private async loadFromFirestore(userId: string): Promise<Cart | null> {
    try {
      const cartDoc = await getDoc(doc(db, 'carts', userId));
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        return {
          items: data.items || [],
          updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
          userId
        };
      }
      return null;
    } catch (error) {
      logger.error('Failed to load cart from Firestore', error as Error, { userId });
      return null;
    }
  }

  private async saveToFirestore(userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'carts', userId), {
        items: this.cart.items,
        updatedAt: serverTimestamp(),
        userId
      });
    } catch (error) {
      logger.error('Failed to save cart to Firestore', error as Error, { userId });
    }
  }

  private subscribeToFirestore(userId: string): void {
    this.firestoreUnsubscribe = onSnapshot(
      doc(db, 'carts', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const firestoreUpdatedAt = data.updatedAt?.toMillis?.() || 0;
          
          // Only update if Firestore has newer data
          if (firestoreUpdatedAt > this.cart.updatedAt) {
            this.cart = {
              items: data.items || [],
              updatedAt: firestoreUpdatedAt,
              userId
            };
            this.saveToLocalStorage();
            this.notifyListeners();
          }
        }
      },
      (error) => {
        logger.error('Firestore cart subscription error', error as Error, { userId });
      }
    );
  }

  private mergeCart(firestoreCart: Cart): void {
    // Merge strategy: Firestore items take precedence, add local-only items
    const firestoreProductIds = new Set(firestoreCart.items.map(i => i.productId));
    const localOnlyItems = this.cart.items.filter(i => !firestoreProductIds.has(i.productId));
    
    this.cart = {
      items: [...firestoreCart.items, ...localOnlyItems],
      updatedAt: Math.max(firestoreCart.updatedAt, this.cart.updatedAt)
    };
    
    this.saveToLocalStorage();
    
    // Save merged cart back to Firestore if we added local items
    if (localOnlyItems.length > 0 && this.currentUserId) {
      this.saveToFirestore(this.currentUserId);
    }
  }

  private persist(): void {
    this.saveToLocalStorage();
    
    if (this.currentUserId) {
      this.saveToFirestore(this.currentUserId);
    }
    
    this.notifyListeners();
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Subscribe to cart changes
   */
  public subscribe(callback: (cart: Cart) => void): () => void {
    this.listeners.add(callback);
    callback(this.cart); // Initial call
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.cart));
  }

  // ==================== CHECKOUT PREPARATION ====================

  /**
   * Prepare cart data for checkout
   */
  public prepareForCheckout(): {
    items: CartItem[];
    summary: CartSummary;
    validation: { valid: boolean; errors: string[] };
  } {
    return {
      items: this.getItems(),
      summary: this.getSummary(),
      validation: this.validateForCheckout()
    };
  }

  /**
   * Clear cart after successful order
   */
  public async onOrderComplete(orderId: string): Promise<void> {
    logger.info('Order completed, clearing cart', { orderId });
    this.clearCart();
    
    // Delete from Firestore
    if (this.currentUserId) {
      try {
        await deleteDoc(doc(db, 'carts', this.currentUserId));
      } catch (error) {
        logger.error('Failed to delete cart from Firestore', error as Error);
      }
    }
  }
}

// Export singleton instance
export const cartService = CartService.getInstance();

import React from 'react';

// React hook helper
export function useCartCount(): number {
  const [count, setCount] = React.useState(cartService.getItemCount());
  
  React.useEffect(() => {
    return cartService.subscribe(() => {
      setCount(cartService.getItemCount());
    });
  }, []);
  
  return count;
}

export default cartService;

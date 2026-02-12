/**
 * Marketplace Product Service
 * Handles all product-related operations
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type {
  Product,
  ProductCategory,
  ProductCondition,
  MarketplaceFilters
} from '@/types/marketplace.types';

const PRODUCTS_COLLECTION = 'marketplace_products';

class MarketplaceProductService {
  private static instance: MarketplaceProductService;

  private constructor() {}

  static getInstance(): MarketplaceProductService {
    if (!MarketplaceProductService.instance) {
      MarketplaceProductService.instance = new MarketplaceProductService();
    }
    return MarketplaceProductService.instance;
  }

  /**
   * Create a new product
   */
  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'sales' | 'rating' | 'reviewCount'>
  ): Promise<string> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      
      const newProduct: Omit<Product, 'id'> = {
        ...productData,
        views: 0,
        sales: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(productsRef, newProduct);
      
      serviceLogger.info('Product created successfully', {
        productId: docRef.id,
        sellerId: productData.sellerId,
        category: productData.category
      });

      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return null;
      }

      // Increment view count
      await updateDoc(productRef, {
        views: increment(1)
      });

      return {
        id: productSnap.id,
        ...productSnap.data()
      } as Product;
    } catch (error) {
      serviceLogger.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      
      await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      serviceLogger.info('Product updated successfully', { productId });
    } catch (error) {
      serviceLogger.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(productRef);

      serviceLogger.info('Product deleted successfully', { productId });
    } catch (error) {
      serviceLogger.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Get products by seller
   */
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef,
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      serviceLogger.error('Error getting seller products:', error);
      throw new Error('Failed to get seller products');
    }
  }

  /**
   * Search products with filters
   */
  async searchProducts(filters: MarketplaceFilters): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      let q = query(productsRef, where('status', '==', 'active'));

      // Apply category filter
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Apply condition filter
      if (filters.condition) {
        q = query(q, where('condition', '==', filters.condition));
      }

      // Apply availability filter
      if (filters.availability) {
        q = query(q, where('availability', '==', filters.availability));
      }

      // Apply free shipping filter
      if (filters.freeShipping) {
        q = query(q, where('freeShipping', '==', true));
      }

      // Apply brand filter
      if (filters.brand) {
        q = query(q, where('brand', '==', filters.brand));
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          q = query(q, orderBy('createdAt', 'desc'));
          break;
        case 'price_low':
          q = query(q, orderBy('price', 'asc'));
          break;
        case 'price_high':
          q = query(q, orderBy('price', 'desc'));
          break;
        case 'popular':
          q = query(q, orderBy('views', 'desc'));
          break;
        case 'rating':
          q = query(q, orderBy('rating', 'desc'));
          break;
        default:
          q = query(q, orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      // Client-side price filtering
      if (filters.priceMin !== undefined) {
        products = products.filter(p => p.price >= filters.priceMin!);
      }
      if (filters.priceMax !== undefined) {
        products = products.filter(p => p.price <= filters.priceMax!);
      }

      // Client-side rating filter
      if (filters.rating !== undefined) {
        products = products.filter(p => p.rating >= filters.rating!);
      }

      return products;
    } catch (error) {
      serviceLogger.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(maxCount: number = 10): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef,
        where('status', '==', 'active'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      serviceLogger.error('Error getting featured products:', error);
      throw new Error('Failed to get featured products');
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: ProductCategory,
    maxCount: number = 20
  ): Promise<Product[]> {
    try {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef,
        where('status', '==', 'active'),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      serviceLogger.error('Error getting products by category:', error);
      throw new Error('Failed to get products by category');
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      
      await updateDoc(productRef, {
        quantity,
        availability: quantity > 0 ? 'in_stock' : 'out_of_stock',
        lastRestocked: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      serviceLogger.info('Product stock updated', { productId, quantity });
    } catch (error) {
      serviceLogger.error('Error updating product stock:', error);
      throw new Error('Failed to update product stock');
    }
  }

  /**
   * Increment product sales
   */
  async incrementSales(productId: string, quantity: number): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      
      await updateDoc(productRef, {
        sales: increment(quantity),
        quantity: increment(-quantity)
      });

      serviceLogger.info('Product sales incremented', { productId, quantity });
    } catch (error) {
      serviceLogger.error('Error incrementing product sales:', error);
      throw new Error('Failed to increment product sales');
    }
  }

  /**
   * Bulk update products (for admin)
   */
  async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<Product>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const productId of productIds) {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        batch.update(productRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      }

      await batch.commit();

      serviceLogger.info('Products bulk updated', { count: productIds.length });
    } catch (error) {
      serviceLogger.error('Error bulk updating products:', error);
      throw new Error('Failed to bulk update products');
    }
  }
}

export const marketplaceProductService = MarketplaceProductService.getInstance();

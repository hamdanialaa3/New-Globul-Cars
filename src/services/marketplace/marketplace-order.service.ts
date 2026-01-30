/**
 * Marketplace Order Service
 * Handles order creation, processing, and management
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { marketplaceProductService } from './marketplace-product.service';
import type {
  Order,
  OrderStatus,
  OrderItem,
  ShippingAddress,
  PaymentMethod
} from '@/types/marketplace.types';

const ORDERS_COLLECTION = 'marketplace_orders';

class MarketplaceOrderService {
  private static instance: MarketplaceOrderService;

  private constructor() {}

  static getInstance(): MarketplaceOrderService {
    if (!MarketplaceOrderService.instance) {
      MarketplaceOrderService.instance = new MarketplaceOrderService();
    }
    return MarketplaceOrderService.instance;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      firestoreLimit(1)
    );
    
    const snapshot = await getDocs(q);
    let lastNumber = 0;

    if (!snapshot.empty) {
      const lastOrder = snapshot.docs[0].data() as Order;
      const lastOrderNumber = lastOrder.orderNumber.split('-')[2];
      lastNumber = parseInt(lastOrderNumber);
    }

    const newNumber = (lastNumber + 1).toString().padStart(5, '0');
    return `KO-${year}-${newNumber}`;
  }

  /**
   * Create new order
   */
  async createOrder(
    buyerId: string,
    buyerName: string,
    buyerEmail: string,
    buyerPhone: string,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod,
    buyerNotes?: string
  ): Promise<string> {
    try {
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const shippingCost = 5; // Default shipping cost (BGN)
      const discount = 0;
      const total = subtotal + shippingCost - discount;

      const orderNumber = await this.generateOrderNumber();

      const newOrder: Omit<Order, 'id'> = {
        orderNumber,
        buyerId,
        buyerName,
        buyerEmail,
        buyerPhone,
        items,
        subtotal,
        shippingCost,
        discount,
        total,
        currency: 'BGN',
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        status: 'pending',
        buyerNotes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const ordersRef = collection(db, ORDERS_COLLECTION);
      const docRef = await addDoc(ordersRef, newOrder);

      // Update product sales
      for (const item of items) {
        await marketplaceProductService.incrementSales(
          item.productId,
          item.quantity
        );
      }

      serviceLogger.info('Order created successfully', {
        orderId: docRef.id,
        orderNumber,
        buyerId,
        total
      });

      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        return null;
      }

      return {
        id: orderSnap.id,
        ...orderSnap.data()
      } as Order;
    } catch (error) {
      serviceLogger.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  /**
   * Get orders by buyer
   */
  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      serviceLogger.error('Error getting buyer orders:', error);
      throw new Error('Failed to get buyer orders');
    }
  }

  /**
   * Get orders by seller (from order items)
   */
  async getOrdersBySeller(sellerId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const q = query(
        ordersRef,
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      // Filter orders that contain seller's products
      return allOrders.filter(order =>
        order.items.some(item => item.sellerId === sellerId)
      );
    } catch (error) {
      serviceLogger.error('Error getting seller orders:', error);
      throw new Error('Failed to get seller orders');
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    carrierName?: string
  ): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const updates: any = {
        status,
        updatedAt: Timestamp.now()
      };

      if (status === 'confirmed') {
        updates.confirmedAt = Timestamp.now();
      } else if (status === 'shipped') {
        updates.shippedAt = Timestamp.now();
        if (trackingNumber) updates.trackingNumber = trackingNumber;
        if (carrierName) updates.carrierName = carrierName;
      } else if (status === 'delivered') {
        updates.deliveredAt = Timestamp.now();
      } else if (status === 'cancelled') {
        updates.cancelledAt = Timestamp.now();
      }

      await updateDoc(orderRef, updates);

      serviceLogger.info('Order status updated', { orderId, status });
    } catch (error) {
      serviceLogger.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'paid' | 'failed' | 'refunded'
  ): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const updates: any = {
        paymentStatus,
        updatedAt: Timestamp.now()
      };

      if (paymentStatus === 'paid') {
        updates.paidAt = Timestamp.now();
      }

      await updateDoc(orderRef, updates);

      serviceLogger.info('Payment status updated', { orderId, paymentStatus });
    } catch (error) {
      serviceLogger.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  /**
   * Add seller notes
   */
  async addSellerNotes(orderId: string, notes: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      
      await updateDoc(orderRef, {
        sellerNotes: notes,
        updatedAt: Timestamp.now()
      });

      serviceLogger.info('Seller notes added', { orderId });
    } catch (error) {
      serviceLogger.error('Error adding seller notes:', error);
      throw new Error('Failed to add seller notes');
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(sellerId?: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }> {
    try {
      let orders: Order[];

      if (sellerId) {
        orders = await this.getOrdersBySeller(sellerId);
      } else {
        const ordersRef = collection(db, ORDERS_COLLECTION);
        const snapshot = await getDocs(ordersRef);
        orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
      }

      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total, 0),
        avgOrderValue: 0
      };

      stats.avgOrderValue = stats.totalOrders > 0
        ? stats.totalRevenue / stats.totalOrders
        : 0;

      return stats;
    } catch (error) {
      serviceLogger.error('Error getting order stats:', error);
      throw new Error('Failed to get order stats');
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error('Cannot cancel order in current status');
      }

      // Restore product quantities
      for (const item of order.items) {
        const productRef = doc(db, 'marketplace_products', item.productId);
        await updateDoc(productRef, {
          quantity: (await getDoc(productRef)).data()?.quantity + item.quantity
        });
      }

      await this.updateOrderStatus(orderId, 'cancelled');

      serviceLogger.info('Order cancelled', { orderId, reason });
    } catch (error) {
      serviceLogger.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }
}

export const marketplaceOrderService = MarketplaceOrderService.getInstance();

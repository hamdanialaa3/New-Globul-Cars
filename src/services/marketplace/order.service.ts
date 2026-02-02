/**
 * Order Service for Koli One Marketplace
 * خدمة الطلبات لسوق Koli One
 * 
 * ✅ PRODUCTION READY: Handles order creation, management, and transaction records
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';

import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { CartItem, CartSummary, cartService } from './cart.service';

// ==================== TYPES ====================

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 
  | 'stripe_card'
  | 'bank_transfer'
  | 'cash_on_delivery';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
}

export interface CreateOrderParams {
  userId: string;
  items: CartItem[];
  summary: CartSummary;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface OrderTransaction {
  id: string;
  orderId: string;
  userId: string;
  type: 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  errorMessage?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// ==================== ORDER SERVICE ====================

class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // ==================== ORDER CREATION ====================

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `KO-${year}${month}${day}-${random}`;
  }

  /**
   * Create a new order
   */
  public async createOrder(params: CreateOrderParams): Promise<Order> {
    const orderId = doc(collection(db, 'orders')).id;
    const orderNumber = this.generateOrderNumber();
    
    const orderItems: OrderItem[] = params.items.map(item => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      sellerId: item.sellerId,
      sellerName: item.sellerName
    }));

    const order: Omit<Order, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {
      id: orderId,
      orderNumber,
      userId: params.userId,
      items: orderItems,
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal: params.summary.subtotal,
      shipping: params.summary.shipping,
      tax: params.summary.tax,
      discount: params.summary.discount,
      total: params.summary.total,
      currency: params.summary.currency,
      notes: params.notes,
      metadata: params.metadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'orders', orderId), order);
    
    logger.info('Order created', { orderId, orderNumber, userId: params.userId, total: params.summary.total });

    return {
      ...order,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ==================== ORDER RETRIEVAL ====================

  /**
   * Get order by ID
   */
  public async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        return null;
      }
      
      const data = orderDoc.data();
      return this.mapOrderFromFirestore(orderId, data);
    } catch (error) {
      logger.error('Failed to get order', error as Error, { orderId });
      return null;
    }
  }

  /**
   * Get order by order number
   */
  public async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('orderNumber', '==', orderNumber),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return this.mapOrderFromFirestore(doc.id, doc.data());
    } catch (error) {
      logger.error('Failed to get order by number', error as Error, { orderNumber });
      return null;
    }
  }

  /**
   * Get user's orders
   */
  public async getUserOrders(userId: string, limitCount: number = 20): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => this.mapOrderFromFirestore(doc.id, doc.data()));
    } catch (error) {
      logger.error('Failed to get user orders', error as Error, { userId });
      return [];
    }
  }

  private mapOrderFromFirestore(id: string, data: any): Order {
    return {
      id,
      orderNumber: data.orderNumber,
      userId: data.userId,
      items: data.items || [],
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      orderStatus: data.orderStatus,
      subtotal: data.subtotal,
      shipping: data.shipping,
      tax: data.tax,
      discount: data.discount,
      total: data.total,
      currency: data.currency,
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeSessionId: data.stripeSessionId,
      transactionId: data.transactionId,
      notes: data.notes,
      metadata: data.metadata,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      paidAt: data.paidAt?.toDate?.(),
      shippedAt: data.shippedAt?.toDate?.(),
      deliveredAt: data.deliveredAt?.toDate?.(),
      cancelledAt: data.cancelledAt?.toDate?.()
    };
  }

  // ==================== ORDER UPDATES ====================

  /**
   * Update order status
   */
  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const updates: Record<string, any> = {
        orderStatus: status,
        updatedAt: serverTimestamp()
      };
      
      // Set timestamp based on status
      if (status === 'shipped') {
        updates.shippedAt = serverTimestamp();
      } else if (status === 'delivered') {
        updates.deliveredAt = serverTimestamp();
      } else if (status === 'cancelled') {
        updates.cancelledAt = serverTimestamp();
      }
      
      await updateDoc(doc(db, 'orders', orderId), updates);
      
      logger.info('Order status updated', { orderId, status });
      return true;
    } catch (error) {
      logger.error('Failed to update order status', error as Error, { orderId, status });
      return false;
    }
  }

  /**
   * Update payment status
   */
  public async updatePaymentStatus(
    orderId: string, 
    paymentStatus: PaymentStatus,
    stripeData?: { paymentIntentId?: string; sessionId?: string }
  ): Promise<boolean> {
    try {
      const updates: Record<string, any> = {
        paymentStatus,
        updatedAt: serverTimestamp()
      };
      
      if (paymentStatus === 'succeeded') {
        updates.paidAt = serverTimestamp();
        updates.orderStatus = 'confirmed';
      }
      
      if (stripeData?.paymentIntentId) {
        updates.stripePaymentIntentId = stripeData.paymentIntentId;
      }
      
      if (stripeData?.sessionId) {
        updates.stripeSessionId = stripeData.sessionId;
      }
      
      await updateDoc(doc(db, 'orders', orderId), updates);
      
      logger.info('Payment status updated', { orderId, paymentStatus });
      return true;
    } catch (error) {
      logger.error('Failed to update payment status', error as Error, { orderId, paymentStatus });
      return false;
    }
  }

  // ==================== TRANSACTIONS ====================

  /**
   * Create transaction record
   */
  public async createTransaction(params: {
    orderId: string;
    userId: string;
    type: 'payment' | 'refund';
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    metadata?: Record<string, any>;
  }): Promise<OrderTransaction> {
    const transactionId = doc(collection(db, 'transactions')).id;
    
    const transaction: Omit<OrderTransaction, 'createdAt'> & { createdAt: any } = {
      id: transactionId,
      orderId: params.orderId,
      userId: params.userId,
      type: params.type,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      paymentMethod: params.paymentMethod,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeChargeId: params.stripeChargeId,
      metadata: params.metadata,
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'transactions', transactionId), transaction);
    
    // Update order with transaction ID
    await updateDoc(doc(db, 'orders', params.orderId), {
      transactionId,
      updatedAt: serverTimestamp()
    });
    
    logger.info('Transaction created', { transactionId, orderId: params.orderId, amount: params.amount });
    
    return {
      ...transaction,
      createdAt: new Date()
    };
  }

  /**
   * Update transaction status
   */
  public async updateTransactionStatus(
    transactionId: string, 
    status: 'completed' | 'failed',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const updates: Record<string, any> = { status };
      
      if (errorMessage) {
        updates.errorMessage = errorMessage;
      }
      
      await updateDoc(doc(db, 'transactions', transactionId), updates);
      
      logger.info('Transaction status updated', { transactionId, status });
      return true;
    } catch (error) {
      logger.error('Failed to update transaction status', error as Error, { transactionId });
      return false;
    }
  }

  // ==================== ORDER COMPLETION ====================

  /**
   * Complete order after successful payment
   */
  public async completeOrder(
    orderId: string,
    stripePaymentIntentId: string
  ): Promise<boolean> {
    try {
      // Update payment status
      await this.updatePaymentStatus(orderId, 'succeeded', { paymentIntentId: stripePaymentIntentId });
      
      // Get order to access transaction
      const order = await this.getOrderById(orderId);
      
      if (order?.transactionId) {
        await this.updateTransactionStatus(order.transactionId, 'completed');
      }
      
      // Clear cart
      await cartService.onOrderComplete(orderId);
      
      logger.info('Order completed successfully', { orderId, stripePaymentIntentId });
      return true;
    } catch (error) {
      logger.error('Failed to complete order', error as Error, { orderId });
      return false;
    }
  }

  /**
   * Cancel order
   */
  public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: 'cancelled',
        paymentStatus: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cancellationReason: reason
      });
      
      logger.info('Order cancelled', { orderId, reason });
      return true;
    } catch (error) {
      logger.error('Failed to cancel order', error as Error, { orderId });
      return false;
    }
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();

export default orderService;

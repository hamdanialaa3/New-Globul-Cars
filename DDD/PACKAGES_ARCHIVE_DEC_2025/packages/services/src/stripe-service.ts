// src/services/stripe-service.ts
// Stripe Payments Service using firestore-stripe-payments extension

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const functions = getFunctions();

// ==================== TYPES ====================

export interface StripePrice {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  type: 'one_time' | 'recurring';
  interval?: 'day' | 'week' | 'month' | 'year';
  interval_count?: number;
  trial_period_days?: number;
  product: string;
  metadata?: Record<string, any>;
}

export interface StripeProduct {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  role?: string;
  images?: string[];
  metadata?: Record<string, any>;
  prices?: StripePrice[];
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  price: StripePrice;
  prices: StripePrice[];
  product: string;
  role: string | null;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  created: number;
  ended_at: number | null;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionParams {
  price?: string; // Price ID for single price
  line_items?: Array<{
    price: string;
    quantity: number;
    tax_rates?: string[];
    dynamic_tax_rates?: string[];
  }>;
  mode?: 'payment' | 'subscription' | 'setup';
  success_url: string;
  cancel_url: string;
  allow_promotion_codes?: boolean;
  promotion_code?: string;
  trial_period_days?: number;
  tax_rates?: string[];
  automatic_tax?: boolean;
  tax_id_collection?: boolean;
  collect_shipping_address?: boolean;
  metadata?: Record<string, any>;
  client?: 'web' | 'mobile';
  amount?: number; // For mobile one-time payments
  currency?: string; // For mobile one-time payments
}

export interface CheckoutSessionResponse {
  url?: string;
  error?: { message: string };
  sessionId?: string;
  // Mobile-specific fields
  paymentIntentClientSecret?: string;
  setupIntentClientSecret?: string;
  ephemeralKeySecret?: string;
  customer?: string;
}

export interface CustomerPortalParams {
  returnUrl: string;
  locale?: string;
  configuration?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

// ==================== SERVICE CLASS ====================

export class StripeService {
  /**
   * Get all active products with their prices
   */
  static async getProducts(): Promise<StripeProduct[]> {
    const productsQuery = query(
      collection(db, 'products'),
      where('active', '==', true)
    );

    const productsSnapshot = await getDocs(productsQuery);
    const products: StripeProduct[] = [];

    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      
      // Get prices for this product
      const pricesSnapshot = await getDocs(
        collection(db, 'products', productDoc.id, 'prices')
      );
      
      const prices: StripePrice[] = pricesSnapshot.docs
        .map(priceDoc => ({
          id: priceDoc.id,
          ...priceDoc.data(),
        } as StripePrice))
        .filter(price => price.active);

      products.push({
        id: productDoc.id,
        ...productData,
        prices,
      } as StripeProduct);
    }

    return products;
  }

  /**
   * Get a specific product by ID
   */
  static async getProduct(productId: string): Promise<StripeProduct | null> {
    const productDoc = await getDocs(
      query(collection(db, 'products'), where('__name__', '==', productId))
    );

    if (productDoc.empty) return null;

    const product = productDoc.docs[0];
    const pricesSnapshot = await getDocs(
      collection(db, 'products', product.id, 'prices')
    );

    const prices: StripePrice[] = pricesSnapshot.docs
      .map(priceDoc => ({
        id: priceDoc.id,
        ...priceDoc.data(),
      } as StripePrice))
      .filter(price => price.active);

    return {
      id: product.id,
      ...product.data(),
      prices,
    } as StripeProduct;
  }

  /**
   * Create a checkout session and redirect to Stripe
   * @returns Unsubscribe function to stop listening
   */
  static async createCheckoutSession(
    params: CheckoutSessionParams,
    onSuccess?: (url: string) => void,
    onError?: (error: string) => void
  ): Promise<Unsubscribe> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated to create checkout session');
    }

    // Create checkout session document
    const sessionRef = await addDoc(
      collection(db, 'customers', user.uid, 'checkout_sessions'),
      {
        ...params,
        client: params.client || 'web',
      }
    );

    // Listen for the extension to update the session with URL or error
    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      const data = snap.data() as CheckoutSessionResponse | undefined;
      
      if (data?.error) {
        onError?.(data.error.message);
      }
      
      if (data?.url) {
        onSuccess?.(data.url);
      }
    });

    return unsubscribe;
  }

  /**
   * Create a checkout session and return the session data (for mobile)
   */
  static async createCheckoutSessionMobile(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResponse> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated to create checkout session');
    }

    const sessionRef = await addDoc(
      collection(db, 'customers', user.uid, 'checkout_sessions'),
      {
        ...params,
        client: 'mobile',
      }
    );

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        const data = snap.data() as CheckoutSessionResponse | undefined;
        
        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }
        
        if (data?.paymentIntentClientSecret || data?.setupIntentClientSecret) {
          unsubscribe();
          resolve(data);
        }
      });
    });
  }

  /**
   * Get user's active subscriptions
   */
  static async getActiveSubscriptions(): Promise<StripeSubscription[]> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated to get subscriptions');
    }

    const subscriptionsQuery = query(
      collection(db, 'customers', user.uid, 'subscriptions'),
      where('status', 'in', ['trialing', 'active'])
    );

    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    return subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StripeSubscription));
  }

  /**
   * Listen to user's subscriptions in real-time
   * @returns Unsubscribe function
   */
  static subscribeToSubscriptions(
    callback: (subscriptions: StripeSubscription[]) => void
  ): Unsubscribe {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.uid) {
      console.warn('[StripeService] subscribeToSubscriptions called with null/undefined user or user.uid - returning no-op unsubscribe');
      return () => {};
    }

    const subscriptionsQuery = query(
      collection(db, 'customers', user.uid, 'subscriptions'),
      where('status', 'in', ['trialing', 'active'])
    );

    return onSnapshot(subscriptionsQuery, (snapshot) => {
      const subscriptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as StripeSubscription));
      
      callback(subscriptions);
    });
  }

  /**
   * Check if user has an active subscription
   */
  static async hasActiveSubscription(): Promise<boolean> {
    const subscriptions = await this.getActiveSubscriptions();
    return subscriptions.length > 0;
  }

  /**
   * Check if user has a specific subscription role
   */
  static async hasSubscriptionRole(role: string): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return false;

    // Force refresh token to get latest custom claims
    await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    
    return tokenResult.claims.stripeRole === role;
  }

  /**
   * Create Stripe Customer Portal link
   */
  static async createPortalLink(
    params: CustomerPortalParams
  ): Promise<string> {
    const createPortalLink = httpsCallable<CustomerPortalParams, CustomerPortalResponse>(
      functions,
      'ext-firestore-stripe-payments-createPortalLink'
    );

    const { data } = await createPortalLink(params);
    return data.url;
  }

  /**
   * Redirect to Stripe Customer Portal
   */
  static async redirectToCustomerPortal(
    returnUrl: string = window.location.origin
  ): Promise<void> {
    const url = await this.createPortalLink({
      returnUrl,
      locale: 'auto',
    });
    
    window.location.assign(url);
  }
}

export default StripeService;

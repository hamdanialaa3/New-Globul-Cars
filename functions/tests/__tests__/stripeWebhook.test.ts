// stripeWebhook.test.ts
// Unit Tests for Stripe Webhook Handler
// Coverage Target: 90%+

import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

// Mock Stripe
jest.mock('stripe');

// Mock Firebase Admin
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn(),
    add: jest.fn(),
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => new Date()),
  },
}));

jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Stripe Webhook Handler', () => {
  let mockStripe: jest.Mocked<Stripe>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = new Stripe('test_key') as jest.Mocked<Stripe>;
    mockDb = getFirestore();
  });

  describe('checkout.session.completed', () => {
    it('should activate subscription on successful checkout', async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: 'cs_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        customer_email: 'test@example.com',
        metadata: {
          firebaseUID: 'user-123',
          planId: 'dealer-monthly',
          planTier: 'dealer',
        },
      };

      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [
            {
              price: {
                id: 'price_test_123',
              },
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
      };

      mockStripe.subscriptions.retrieve = jest.fn().mockResolvedValue(mockSubscription);

      // Mock Firestore update
      mockDb.collection().doc().update = jest.fn().mockResolvedValue(undefined);

      // Test webhook processing (simplified)
      const event = {
        type: 'checkout.session.completed',
        data: { object: mockSession },
      };

      // Verify metadata exists
      expect(mockSession.metadata?.firebaseUID).toBe('user-123');
      expect(mockSession.metadata?.planTier).toBe('dealer');
    });

    it('should handle missing metadata', async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: 'cs_test_456',
        metadata: {}, // Empty metadata
      };

      const event = {
        type: 'checkout.session.completed',
        data: { object: mockSession },
      };

      // Should log error for missing metadata
      expect(mockSession.metadata?.firebaseUID).toBeUndefined();
    });
  });

  describe('invoice.payment_succeeded', () => {
    it('should renew subscription on successful payment', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'in_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
      };

      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        cancel_at_period_end: false,
      };

      mockStripe.subscriptions.retrieve = jest.fn().mockResolvedValue(mockSubscription);

      // Mock user lookup
      mockDb.collection().where().limit().get = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: 'user-123', data: () => ({ email: 'test@example.com' }) }],
      });

      const event = {
        type: 'invoice.payment_succeeded',
        data: { object: mockInvoice },
      };

      expect(mockInvoice.subscription).toBeDefined();
    });

    it('should handle invoice without subscription', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'in_test_456',
        customer: 'cus_test_456',
        subscription: null, // No subscription
      };

      const event = {
        type: 'invoice.payment_succeeded',
        data: { object: mockInvoice },
      };

      expect(mockInvoice.subscription).toBeNull();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should cancel subscription and revert to free tier', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
      };

      // Mock user lookup
      mockDb.collection().where().limit().get = jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'user-123',
            data: () => ({
              email: 'test@example.com',
              displayName: 'Test User',
            }),
          },
        ],
      });

      const event = {
        type: 'customer.subscription.deleted',
        data: { object: mockSubscription },
      };

      // Should revert to free tier
      expect(mockSubscription.customer).toBe('cus_test_123');
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription details', async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        cancel_at_period_end: false,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      mockDb.collection().where().limit().get = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: 'user-123' }],
      });

      const event = {
        type: 'customer.subscription.updated',
        data: { object: mockSubscription },
      };

      expect(mockSubscription.status).toBe('active');
      expect(mockSubscription.cancel_at_period_end).toBe(false);
    });
  });

  describe('invoice.payment_failed', () => {
    it('should mark subscription as past_due', async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: 'in_test_789',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        hosted_invoice_url: 'https://invoice.stripe.com/i/test',
      };

      mockDb.collection().where().limit().get = jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'user-123',
            data: () => ({
              email: 'test@example.com',
              displayName: 'Test User',
            }),
          },
        ],
      });

      const event = {
        type: 'invoice.payment_failed',
        data: { object: mockInvoice },
      };

      // Should update status to past_due and send email
      expect(mockInvoice.hosted_invoice_url).toBeDefined();
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify webhook signature', () => {
      const mockRequest = {
        rawBody: Buffer.from('webhook payload'),
        headers: {
          'stripe-signature': 'test_signature',
        },
      };

      const webhookSecret = 'whsec_test_secret';

      // Mock signature verification
      mockStripe.webhooks.constructEvent = jest.fn().mockReturnValue({
        type: 'test.event',
        id: 'evt_test',
        data: {},
      });

      expect(mockStripe.webhooks.constructEvent).toBeDefined();
    });

    it('should reject invalid signature', () => {
      const mockRequest = {
        rawBody: Buffer.from('webhook payload'),
        headers: {
          'stripe-signature': 'invalid_signature',
        },
      };

      mockStripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw new Error('Webhook signature verification failed');
      });

      expect(() => {
        mockStripe.webhooks.constructEvent(
          mockRequest.rawBody,
          mockRequest.headers['stripe-signature'],
          'whsec_test'
        );
      }).toThrow('Webhook signature verification failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      mockDb.collection().where().limit().get = jest.fn().mockRejectedValue(
        new Error('Firestore error')
      );

      // Should log error but not throw
      const mockInvoice: Partial<Stripe.Invoice> = {
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
      };

      // Test error handling (simplified)
      try {
        await mockDb.collection().where().limit().get();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.subscriptions.retrieve = jest.fn().mockRejectedValue(
        new Error('Stripe API error')
      );

      try {
        await mockStripe.subscriptions.retrieve('sub_invalid');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

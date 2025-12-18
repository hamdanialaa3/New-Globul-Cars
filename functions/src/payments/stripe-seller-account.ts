/**
 * Firebase Cloud Functions - Stripe Seller Account Management
 * Manages Stripe Connect accounts for sellers
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../logger-service';

/**
 * Note: Stripe integration requires:
 * 1. npm install stripe
 * 2. firebase functions:config:set stripe.secret_key="sk_..."
 * 3. Configure webhooks in Stripe Dashboard
 */

interface CreateAccountRequest {
  email: string;
  businessName?: string;
  businessType: 'individual' | 'company';
  country: string;
  returnUrl: string;
  refreshUrl: string;
}

interface AccountLinkRequest {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}

/**
 * Create Stripe Connect Express account for a seller
 * Requires seller role
 */
export const createStripeSellerAccount = functions.https.onCall(
  async (data: CreateAccountRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Check seller role
    if (!context.auth.token.seller) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only sellers can create Stripe accounts'
      );
    }

    const sellerId = context.auth.uid;

    try {
      // Check if seller already has Stripe account
      const sellerDoc = await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .get();

      if (sellerDoc.exists && sellerDoc.data()?.stripeAccountId) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Stripe account already exists for this seller'
        );
      }

      // Initialize Stripe (in production)
      /*
      const Stripe = require('stripe');
      const stripe = new Stripe(functions.config().stripe.secret_key, {
        apiVersion: '2023-10-16'
      });

      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BG', // Bulgaria
        email: data.email,
        default_currency: 'eur',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: data.businessType,
        ...(data.businessName && {
          business_profile: {
            name: data.businessName
          }
        })
      });

      // Save Stripe account ID to seller document
      await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .set({
          stripeAccountId: account.id,
          stripeOnboardingComplete: false,
          payoutsEnabled: false,
          chargesEnabled: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: data.refreshUrl,
        return_url: data.returnUrl,
        type: 'account_onboarding'
      });

      logger.info(`Stripe account created for seller ${sellerId}`, { accountId: account.id });

      return {
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url
      };
      */

      // For now, return mock response
      logger.info(`Would create Stripe account for seller ${sellerId}`);
      
      return {
        success: true,
        message: 'Stripe not configured. Add your Stripe keys to enable payments.',
        accountId: 'acct_mock_' + sellerId,
        onboardingUrl: data.returnUrl
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating Stripe account for seller ${sellerId}`, err);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create Stripe account',
        err.message
      );
    }
  }
);

/**
 * Generate new account link for Stripe onboarding
 * Used when previous link expires or seller needs to complete onboarding
 */
export const createStripeAccountLink = functions.https.onCall(
  async (data: AccountLinkRequest, context) => {
    if (!context.auth || !context.auth.token.seller) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only sellers can access this'
      );
    }

    try {
      /*
      const Stripe = require('stripe');
      const stripe = new Stripe(functions.config().stripe.secret_key, {
        apiVersion: '2023-10-16'
      });

      const accountLink = await stripe.accountLinks.create({
        account: data.accountId,
        refresh_url: data.refreshUrl,
        return_url: data.returnUrl,
        type: 'account_onboarding'
      });

      return {
        success: true,
        url: accountLink.url
      };
      */

      return {
        success: true,
        url: data.returnUrl
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating account link', err);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create account link',
        err.message
      );
    }
  }
);

/**
 * Get Stripe account status for a seller
 */
export const getStripeAccountStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.seller) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only sellers can access this'
      );
    }

    const sellerId = context.auth.uid;

    try {
      const sellerDoc = await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .get();

      if (!sellerDoc.exists) {
        return {
          hasAccount: false,
          onboardingComplete: false
        };
      }

      const sellerData = sellerDoc.data();
      const accountId = sellerData?.stripeAccountId;

      if (!accountId) {
        return {
          hasAccount: false,
          onboardingComplete: false
        };
      }

      /*
      const Stripe = require('stripe');
      const stripe = new Stripe(functions.config().stripe.secret_key);

      const account = await stripe.accounts.retrieve(accountId);

      return {
        hasAccount: true,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements
      };
      */

      return {
        hasAccount: true,
        onboardingComplete: sellerData?.stripeOnboardingComplete || false,
        chargesEnabled: sellerData?.chargesEnabled || false,
        payoutsEnabled: sellerData?.payoutsEnabled || false
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error getting Stripe account status', err);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get account status',
        err.message
      );
    }
  }
);


"use strict";
/**
 * Firebase Cloud Functions - Stripe Seller Account Management
 * Manages Stripe Connect accounts for sellers
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeAccountStatus = exports.createStripeAccountLink = exports.createStripeSellerAccount = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Create Stripe Connect Express account for a seller
 * Requires seller role
 */
exports.createStripeSellerAccount = functions.https.onCall(async (data, context) => {
    var _a;
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check seller role
    if (!context.auth.token.seller) {
        throw new functions.https.HttpsError('permission-denied', 'Only sellers can create Stripe accounts');
    }
    const sellerId = context.auth.uid;
    try {
        // Check if seller already has Stripe account
        const sellerDoc = await admin.firestore()
            .collection('sellers')
            .doc(sellerId)
            .get();
        if (sellerDoc.exists && ((_a = sellerDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeAccountId)) {
            throw new functions.https.HttpsError('already-exists', 'Stripe account already exists for this seller');
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
  
        console.log(`Stripe account created for seller ${sellerId}: ${account.id}`);
  
        return {
          success: true,
          accountId: account.id,
          onboardingUrl: accountLink.url
        };
        */
        // For now, return mock response
        console.log(`Would create Stripe account for seller ${sellerId}`);
        return {
            success: true,
            message: 'Stripe not configured. Add your Stripe keys to enable payments.',
            accountId: 'acct_mock_' + sellerId,
            onboardingUrl: data.returnUrl
        };
    }
    catch (error) {
        console.error(`Error creating Stripe account for seller ${sellerId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to create Stripe account', error.message);
    }
});
/**
 * Generate new account link for Stripe onboarding
 * Used when previous link expires or seller needs to complete onboarding
 */
exports.createStripeAccountLink = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.seller) {
        throw new functions.https.HttpsError('permission-denied', 'Only sellers can access this');
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
    }
    catch (error) {
        console.error('Error creating account link:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create account link', error.message);
    }
});
/**
 * Get Stripe account status for a seller
 */
exports.getStripeAccountStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.seller) {
        throw new functions.https.HttpsError('permission-denied', 'Only sellers can access this');
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
        const accountId = sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeAccountId;
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
            onboardingComplete: (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeOnboardingComplete) || false,
            chargesEnabled: (sellerData === null || sellerData === void 0 ? void 0 : sellerData.chargesEnabled) || false,
            payoutsEnabled: (sellerData === null || sellerData === void 0 ? void 0 : sellerData.payoutsEnabled) || false
        };
    }
    catch (error) {
        console.error('Error getting Stripe account status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get account status', error.message);
    }
});
//# sourceMappingURL=stripe-seller-account.js.map
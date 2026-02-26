import * as notifications from './notifications';
import * as merchantFeedModule from './merchant-feed';
import * as imageOptimizer from './image-optimizer';
import * as sitemapFunc from './sitemap';
import * as googleAdsSync from './google-ads-sync';
import * as facebookAdsSync from './facebook-ads-sync';
import * as newCarNotifications from './notifications/onNewCarPost';
import * as carLifecycle from './triggers/car-lifecycle';

// AI Services (Gemini Chat - NEW) ✅
import * as aiFunctions from './ai-functions';
export const geminiChat = aiFunctions.geminiChat;
export const aiQuotaCheck = aiFunctions.aiQuotaCheck;
export const geminiPriceSuggestion = aiFunctions.geminiPriceSuggestion;
export const analyzeCarImage = aiFunctions.analyzeCarImage;
export const analyzeImageQuality = aiFunctions.analyzeImageQuality;

// Notification triggers (legacy)
export const onNewCarPosted = notifications.onNewCarPosted;
export const onPriceUpdate = notifications.onPriceUpdate;
export const onNewMessage = notifications.onNewMessage;
export const onCarViewed = notifications.onCarViewed;
export const onNewInquiry = notifications.onNewInquiry;
export const onNewOffer = notifications.onNewOffer;
export const onVerificationUpdate = notifications.onVerificationUpdate;
export const dailyReminder = notifications.dailyReminder;

// NEW: Social Notification System (Phase 2)
export const notifyFollowersOnNewCar = newCarNotifications.notifyFollowersOnNewCar;
export const cleanupOldNotifications = newCarNotifications.cleanupOldNotifications;

// Google Merchant Center Feed (for Google Shopping)
// Expose expected function name for hosting rewrite
export const merchantFeed = merchantFeedModule.merchantFeed;
export const merchantFeedGenerator = merchantFeedModule.merchantFeed;
export const updateMerchantFeedCache = merchantFeedModule.updateMerchantFeedCache;

// Image Optimization (automatic WebP conversion & responsive sizes)
export const optimizeUploadedImage = imageOptimizer.optimizeImage;
export const cleanupDeletedImages = imageOptimizer.cleanupOptimizedImages;

// Marketing / SEO
export const sitemap = sitemapFunc.sitemap;
export const scheduledSitemapRegeneration = sitemapFunc.scheduledSitemapRegeneration;
export const manualSitemapRegeneration = sitemapFunc.manualSitemapRegeneration;
export const syncCarsToGoogleAds = googleAdsSync.syncCarsToGoogleAds;
export const syncCarsToFacebookAds = facebookAdsSync.syncCarsToFacebookAds;

// AI Services (DeepSeek Integration - Legacy)
// TEMPORARILY DISABLED - CPU conflict with v2 API cache
// import * as deepSeekProxy from './ai/deepseek-proxy';
// export const aiGenerateText = deepSeekProxy.aiGenerateText;
// export const aiGenerateCarDescription = deepSeekProxy.aiGenerateCarDescription;

// AI Services (Hybrid System - Phase 4.1.2 - NEW) ✅
// TEMPORARILY DISABLED - CPU conflict with v2 API cache
// import * as hybridAI from './ai/hybrid-ai-proxy';
// export const hybridAIProxy = hybridAI.hybridAIProxy;

// SEO & Analytics Strategy (Phase 1 Fixes)
import * as indexing from './seo/indexing-service';
import * as bqAnalytics from './analytics/bigquery-service';
import * as prerender from './seo/prerender';

export const requestIndexing = indexing.requestIndexing;
export const logSearchEvent = bqAnalytics.logSearchEvent;
export const prerenderSEO = prerender.prerender;

// Hybrid AI Engine (Phase 2 - Gemini + DeepSeek) 🧠
import * as functions from "firebase-functions/v1";
// import { AIService } from "./services/ai-service";

const getAiService = () => {
    const { AIService } = require("./services/ai-service");
    // Simple singleton pattern could be implemented here if needed, 
    // but safe dynamic import is key for preventing cold-start crashes.
    return new AIService();
};

export const evaluateCar = functions.https.onCall(async (data, context) => {
    // SECURITY: Require authentication — AI calls are expensive
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required for car evaluation');
    }

    // 1. Validate Inputs
    const { imageBase64, price, marketAvg } = data as {
        imageBase64?: string;
        price?: number;
        marketAvg?: number;
    };

    if (!imageBase64 || typeof imageBase64 !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Image is required for analysis (Base64)');
    }

    // Validate Base64 payload size (max ~5MB encoded)
    if (imageBase64.length > 7_000_000) {
        throw new functions.https.HttpsError('invalid-argument', 'Image too large (max 5MB)');
    }

    try {
        const aiService = getAiService();
        console.log("[evaluateCar] Starting Hybrid AI Analysis...");

        // 2. Phase 1: Gemini (Vision)
        const visualData = await aiService.analyzeImage(imageBase64);
        console.log("[evaluateCar] Visual Analysis Complete:", visualData);

        // Merge price with extracted data
        const carFullData = { ...visualData, price };

        // 3. Phase 2: DeepSeek (Logic)
        // Usng marketAvg provided by client or fallback
        const logicVerdict = await aiService.analyzeMarketLogic(carFullData, marketAvg || 50000);
        console.log("[evaluateCar] Logic Analysis Complete:", logicVerdict);

        // 4. Return Full Report
        return {
            carDetails: visualData,
            marketAnalysis: logicVerdict,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error("[evaluateCar] Error:", error);
        throw new functions.https.HttpsError('internal', 'AI Analysis Failed');
    }
});

// ✅ NEW: Algolia Real-Time Sync (December 2025)
import * as algoliaSync from './syncCarsToAlgolia';
export const syncPassengerCarsToAlgolia = algoliaSync.syncPassengerCarsToAlgolia;
export const syncSuvsToAlgolia = algoliaSync.syncSuvsToAlgolia;
export const syncVansToAlgolia = algoliaSync.syncVansToAlgolia;
export const syncMotorcyclesToAlgolia = algoliaSync.syncMotorcyclesToAlgolia;
export const syncTrucksToAlgolia = algoliaSync.syncTrucksToAlgolia;
export const syncBusesToAlgolia = algoliaSync.syncBusesToAlgolia;
export const batchSyncAllCarsToAlgolia = algoliaSync.batchSyncAllCarsToAlgolia;

// ✅ NEW: Stripe Payment Webhooks (January 2026)
import { stripeWebhooks as stripeWebhooksHandler } from './stripe-webhooks';
export const stripeWebhooks = stripeWebhooksHandler;

// ✅ NEW: Scheduled Cleanup Jobs (January 6, 2026)
import * as archiveJobs from './scheduled/archive-sold-cars';
export const archiveSoldCars = archiveJobs.archiveSoldCars;
export const manualArchiveSoldCars = archiveJobs.manualArchiveSoldCars;
export const cleanupExpiredDrafts = archiveJobs.cleanupExpiredDrafts;

// ✅ NEW: B2B Analytics & Lead Export (January 6, 2026) - Revenue Fix
import * as b2bExports from './analytics/b2b-exports';
export const exportB2BLeads = b2bExports.exportB2BLeads;
export const getB2BAnalytics = b2bExports.getB2BAnalytics;
export const exportB2BAnalytics = b2bExports.exportB2BAnalytics;

// ✅ NEW: Car lifecycle hygiene (stories cascade + sold marker)
export const onPassengerCarDeleted = carLifecycle.onPassengerCarDeleted;
export const onSuvDeleted = carLifecycle.onSuvDeleted;
export const onVanDeleted = carLifecycle.onVanDeleted;
export const onMotorcycleDeleted = carLifecycle.onMotorcycleDeleted;
export const onTruckDeleted = carLifecycle.onTruckDeleted;
export const onBusDeleted = carLifecycle.onBusDeleted;
export const onPassengerCarSold = carLifecycle.onPassengerCarSold;
export const onSuvSold = carLifecycle.onSuvSold;
export const onVanSold = carLifecycle.onVanSold;
export const onMotorcycleSold = carLifecycle.onMotorcycleSold;
export const onTruckSold = carLifecycle.onTruckSold;
export const onBusSold = carLifecycle.onBusSold;

// ✅ NEW: Orphaned Data Cleanup (January 9, 2026)
import * as orphanedCleanup from './triggers/orphaned-data-cleanup';
export const onDeleteCar = orphanedCleanup.onDeleteCar;
export const onDeleteProfile = orphanedCleanup.onDeleteProfile;
export const onDeleteOffer = orphanedCleanup.onDeleteOffer;
export const dailyOrphanedDataCleanup = orphanedCleanup.dailyOrphanedDataCleanup;
export const cleanupOrphanedData = orphanedCleanup.cleanupOrphanedData;

// ✅ NEW: Realtime Messaging Push Notifications (January 8, 2026)
import * as realtimeMessagingNotifications from './notifications/realtime-messaging-notifications';
export const onNewRealtimeMessage = realtimeMessagingNotifications.onNewRealtimeMessage;
export const onOfferStatusChange = realtimeMessagingNotifications.onOfferStatusChange;
export const cleanupExpiredOffers = realtimeMessagingNotifications.cleanupExpiredOffers;

// 🔴 CRITICAL: Firebase Auth User Deletion Trigger (January 2026 - GDPR Compliance)
import { onUserDelete } from './triggers/on-user-delete';
export { onUserDelete };

// ✅ NEW: Manual Payment System (January 9, 2026)
const manualPayments = require('../lib/manual-payment-expiration');
export const checkExpiredManualPayments = manualPayments.checkExpiredManualPayments;
export const sendDailyPaymentSummary = manualPayments.sendDailyPaymentSummary;
export const onPaymentVerified = manualPayments.onPaymentVerified;
export const manualExpirePayments = manualPayments.manualExpirePayments;

// ⚠️ SECURITY: Auth Blocking & Rate Limiting (January 25, 2026)
import * as authBlocking from './blocking/beforeCreate';
export const beforeUserCreated = authBlocking.beforeUserCreated;

// ⚠️ SECURITY: Backend Numeric ID Assignment (January 25, 2026)
import * as userCreateTrigger from './triggers/onUserCreate';
export const onUserCreate = userCreateTrigger.onUserCreate;
export const getUserNumericId = userCreateTrigger.getUserNumericId;

// Guest Identity Restoration (February 6, 2026)
import * as guestToken from './auth/guest-token';
export const getGuestCustomToken = guestToken.getGuestCustomToken;

// Email Notifications System
import * as emailTriggers from './notifications/email-triggers';
export const sendWelcomeEmail = emailTriggers.sendWelcomeEmail;
export const sendAdStatusEmail = emailTriggers.sendAdStatusEmail;
export const sendPaymentReceiptEmail = emailTriggers.sendPaymentReceiptEmail;
export const sendMessageNotificationEmail = emailTriggers.sendMessageNotificationEmail;

// 💳 NEW: Payment Webhooks - iCard, Revolut (February 5, 2026)
import * as icardPayments from './payment-webhooks/icard-webhooks';
import * as revolutPayments from './payment-webhooks/revolut-webhooks';
export const icardWebhooks = icardPayments.icardWebhooks;
export const revolutWebhooks = revolutPayments.revolutWebhooks;

// 📊 NEW: Payment Reconciliation & Monitoring (February 5, 2026)
import * as paymentReconciliation from './services/payment-reconciliation';
export const dailyReconciliation = paymentReconciliation.dailyReconciliation;
export const triggerReconciliation = paymentReconciliation.triggerReconciliation;
export const exportReconciliationReport = paymentReconciliation.exportReconciliationReport;

// 🔔 NEW: Price Drop Alerts System (February 7, 2026 - TASK-07)
import * as priceDropAlerts from './triggers/price-drop-alerts';
export const onCarPriceUpdate = priceDropAlerts.onCarPriceUpdate;
export const cleanupOldPriceAlerts = priceDropAlerts.cleanupOldPriceAlerts;

// 🔄 NEW: Auto-Renewal Cron (February 8, 2026)
import * as autoRenewal from './auto-renewal-cron';
export const dailyAutoRenewal = autoRenewal.dailyAutoRenewal;

// 💳 NEW: ePay & EasyPay Webhooks (February 8, 2026)
import * as paymentWebhook from './payment-webhook';
export const handleEpayWebhook = paymentWebhook.handleEpayWebhook;
export const handleEasypayWebhook = paymentWebhook.handleEasypayWebhook;
export const verifyPaymentStatus = paymentWebhook.verifyPaymentStatus;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVanSold = exports.onSuvSold = exports.onPassengerCarSold = exports.onBusDeleted = exports.onTruckDeleted = exports.onMotorcycleDeleted = exports.onVanDeleted = exports.onSuvDeleted = exports.onPassengerCarDeleted = exports.exportB2BAnalytics = exports.getB2BAnalytics = exports.exportB2BLeads = exports.cleanupExpiredDrafts = exports.manualArchiveSoldCars = exports.archiveSoldCars = exports.stripeWebhooks = exports.batchSyncAllCarsToAlgolia = exports.syncBusesToAlgolia = exports.syncTrucksToAlgolia = exports.syncMotorcyclesToAlgolia = exports.syncVansToAlgolia = exports.syncSuvsToAlgolia = exports.syncPassengerCarsToAlgolia = exports.evaluateCar = exports.prerenderSEO = exports.logSearchEvent = exports.requestIndexing = exports.syncCarsToFacebookAds = exports.syncCarsToGoogleAds = exports.manualSitemapRegeneration = exports.scheduledSitemapRegeneration = exports.sitemap = exports.cleanupDeletedImages = exports.optimizeUploadedImage = exports.updateMerchantFeedCache = exports.merchantFeedGenerator = exports.merchantFeed = exports.cleanupOldNotifications = exports.notifyFollowersOnNewCar = exports.dailyReminder = exports.onVerificationUpdate = exports.onNewOffer = exports.onNewInquiry = exports.onCarViewed = exports.onNewMessage = exports.onPriceUpdate = exports.onNewCarPosted = exports.geminiPriceSuggestion = exports.aiQuotaCheck = exports.geminiChat = void 0;
exports.verifyPaymentStatus = exports.handleEasypayWebhook = exports.handleEpayWebhook = exports.dailyAutoRenewal = exports.cleanupOldPriceAlerts = exports.onCarPriceUpdate = exports.exportReconciliationReport = exports.triggerReconciliation = exports.dailyReconciliation = exports.revolutWebhooks = exports.icardWebhooks = exports.sendMessageNotificationEmail = exports.sendPaymentReceiptEmail = exports.sendAdStatusEmail = exports.sendWelcomeEmail = exports.getGuestCustomToken = exports.getUserNumericId = exports.onUserCreate = exports.beforeUserCreated = exports.manualExpirePayments = exports.onPaymentVerified = exports.sendDailyPaymentSummary = exports.checkExpiredManualPayments = exports.onUserDelete = exports.cleanupExpiredOffers = exports.onOfferStatusChange = exports.onNewRealtimeMessage = exports.cleanupOrphanedData = exports.dailyOrphanedDataCleanup = exports.onDeleteOffer = exports.onDeleteProfile = exports.onDeleteCar = exports.onBusSold = exports.onTruckSold = exports.onMotorcycleSold = void 0;
const notifications = require("./notifications");
const merchantFeedModule = require("./merchant-feed");
const imageOptimizer = require("./image-optimizer");
const sitemapFunc = require("./sitemap");
const googleAdsSync = require("./google-ads-sync");
const facebookAdsSync = require("./facebook-ads-sync");
const newCarNotifications = require("./notifications/onNewCarPost");
const carLifecycle = require("./triggers/car-lifecycle");
// AI Services (Gemini Chat - NEW) ✅
const aiFunctions = require("./ai-functions");
exports.geminiChat = aiFunctions.geminiChat;
exports.aiQuotaCheck = aiFunctions.aiQuotaCheck;
exports.geminiPriceSuggestion = aiFunctions.geminiPriceSuggestion;
// Notification triggers (legacy)
exports.onNewCarPosted = notifications.onNewCarPosted;
exports.onPriceUpdate = notifications.onPriceUpdate;
exports.onNewMessage = notifications.onNewMessage;
exports.onCarViewed = notifications.onCarViewed;
exports.onNewInquiry = notifications.onNewInquiry;
exports.onNewOffer = notifications.onNewOffer;
exports.onVerificationUpdate = notifications.onVerificationUpdate;
exports.dailyReminder = notifications.dailyReminder;
// NEW: Social Notification System (Phase 2)
exports.notifyFollowersOnNewCar = newCarNotifications.notifyFollowersOnNewCar;
exports.cleanupOldNotifications = newCarNotifications.cleanupOldNotifications;
// Google Merchant Center Feed (for Google Shopping)
// Expose expected function name for hosting rewrite
exports.merchantFeed = merchantFeedModule.merchantFeed;
exports.merchantFeedGenerator = merchantFeedModule.merchantFeed;
exports.updateMerchantFeedCache = merchantFeedModule.updateMerchantFeedCache;
// Image Optimization (automatic WebP conversion & responsive sizes)
exports.optimizeUploadedImage = imageOptimizer.optimizeImage;
exports.cleanupDeletedImages = imageOptimizer.cleanupOptimizedImages;
// Marketing / SEO
exports.sitemap = sitemapFunc.sitemap;
exports.scheduledSitemapRegeneration = sitemapFunc.scheduledSitemapRegeneration;
exports.manualSitemapRegeneration = sitemapFunc.manualSitemapRegeneration;
exports.syncCarsToGoogleAds = googleAdsSync.syncCarsToGoogleAds;
exports.syncCarsToFacebookAds = facebookAdsSync.syncCarsToFacebookAds;
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
const indexing = require("./seo/indexing-service");
const bqAnalytics = require("./analytics/bigquery-service");
const prerender = require("./seo/prerender");
exports.requestIndexing = indexing.requestIndexing;
exports.logSearchEvent = bqAnalytics.logSearchEvent;
exports.prerenderSEO = prerender.prerender;
// Hybrid AI Engine (Phase 2 - Gemini + DeepSeek) 🧠
const functions = require("firebase-functions/v1");
// import { AIService } from "./services/ai-service";
const getAiService = () => {
    const { AIService } = require("./services/ai-service");
    // Simple singleton pattern could be implemented here if needed, 
    // but safe dynamic import is key for preventing cold-start crashes.
    return new AIService();
};
exports.evaluateCar = functions.https.onCall(async (data, context) => {
    // 1. Validate Inputs
    const { imageBase64, price, marketAvg } = data;
    if (!imageBase64) {
        throw new functions.https.HttpsError('invalid-argument', 'Image is required for analysis (Base64)');
    }
    try {
        const aiService = getAiService();
        console.log("[evaluateCar] Starting Hybrid AI Analysis...");
        // 2. Phase 1: Gemini (Vision)
        const visualData = await aiService.analyzeImage(imageBase64);
        console.log("[evaluateCar] Visual Analysis Complete:", visualData);
        // Merge price with extracted data
        const carFullData = Object.assign(Object.assign({}, visualData), { price });
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
    }
    catch (error) {
        console.error("[evaluateCar] Error:", error);
        throw new functions.https.HttpsError('internal', 'AI Analysis Failed');
    }
});
// ✅ NEW: Algolia Real-Time Sync (December 2025)
const algoliaSync = require("./syncCarsToAlgolia");
exports.syncPassengerCarsToAlgolia = algoliaSync.syncPassengerCarsToAlgolia;
exports.syncSuvsToAlgolia = algoliaSync.syncSuvsToAlgolia;
exports.syncVansToAlgolia = algoliaSync.syncVansToAlgolia;
exports.syncMotorcyclesToAlgolia = algoliaSync.syncMotorcyclesToAlgolia;
exports.syncTrucksToAlgolia = algoliaSync.syncTrucksToAlgolia;
exports.syncBusesToAlgolia = algoliaSync.syncBusesToAlgolia;
exports.batchSyncAllCarsToAlgolia = algoliaSync.batchSyncAllCarsToAlgolia;
// ✅ NEW: Stripe Payment Webhooks (January 2026)
const stripe_webhooks_1 = require("./stripe-webhooks");
exports.stripeWebhooks = stripe_webhooks_1.stripeWebhooks;
// ✅ NEW: Scheduled Cleanup Jobs (January 6, 2026)
const archiveJobs = require("./scheduled/archive-sold-cars");
exports.archiveSoldCars = archiveJobs.archiveSoldCars;
exports.manualArchiveSoldCars = archiveJobs.manualArchiveSoldCars;
exports.cleanupExpiredDrafts = archiveJobs.cleanupExpiredDrafts;
// ✅ NEW: B2B Analytics & Lead Export (January 6, 2026) - Revenue Fix
const b2bExports = require("./analytics/b2b-exports");
exports.exportB2BLeads = b2bExports.exportB2BLeads;
exports.getB2BAnalytics = b2bExports.getB2BAnalytics;
exports.exportB2BAnalytics = b2bExports.exportB2BAnalytics;
// ✅ NEW: Car lifecycle hygiene (stories cascade + sold marker)
exports.onPassengerCarDeleted = carLifecycle.onPassengerCarDeleted;
exports.onSuvDeleted = carLifecycle.onSuvDeleted;
exports.onVanDeleted = carLifecycle.onVanDeleted;
exports.onMotorcycleDeleted = carLifecycle.onMotorcycleDeleted;
exports.onTruckDeleted = carLifecycle.onTruckDeleted;
exports.onBusDeleted = carLifecycle.onBusDeleted;
exports.onPassengerCarSold = carLifecycle.onPassengerCarSold;
exports.onSuvSold = carLifecycle.onSuvSold;
exports.onVanSold = carLifecycle.onVanSold;
exports.onMotorcycleSold = carLifecycle.onMotorcycleSold;
exports.onTruckSold = carLifecycle.onTruckSold;
exports.onBusSold = carLifecycle.onBusSold;
// ✅ NEW: Orphaned Data Cleanup (January 9, 2026)
const orphanedCleanup = require("./triggers/orphaned-data-cleanup");
exports.onDeleteCar = orphanedCleanup.onDeleteCar;
exports.onDeleteProfile = orphanedCleanup.onDeleteProfile;
exports.onDeleteOffer = orphanedCleanup.onDeleteOffer;
exports.dailyOrphanedDataCleanup = orphanedCleanup.dailyOrphanedDataCleanup;
exports.cleanupOrphanedData = orphanedCleanup.cleanupOrphanedData;
// ✅ NEW: Realtime Messaging Push Notifications (January 8, 2026)
const realtimeMessagingNotifications = require("./notifications/realtime-messaging-notifications");
exports.onNewRealtimeMessage = realtimeMessagingNotifications.onNewRealtimeMessage;
exports.onOfferStatusChange = realtimeMessagingNotifications.onOfferStatusChange;
exports.cleanupExpiredOffers = realtimeMessagingNotifications.cleanupExpiredOffers;
// 🔴 CRITICAL: Firebase Auth User Deletion Trigger (January 2026 - GDPR Compliance)
const on_user_delete_1 = require("./triggers/on-user-delete");
Object.defineProperty(exports, "onUserDelete", { enumerable: true, get: function () { return on_user_delete_1.onUserDelete; } });
// ✅ NEW: Manual Payment System (January 9, 2026)
const manualPayments = require('../lib/manual-payment-expiration');
exports.checkExpiredManualPayments = manualPayments.checkExpiredManualPayments;
exports.sendDailyPaymentSummary = manualPayments.sendDailyPaymentSummary;
exports.onPaymentVerified = manualPayments.onPaymentVerified;
exports.manualExpirePayments = manualPayments.manualExpirePayments;
// ⚠️ SECURITY: Auth Blocking & Rate Limiting (January 25, 2026)
const authBlocking = require("./blocking/beforeCreate");
exports.beforeUserCreated = authBlocking.beforeUserCreated;
// ⚠️ SECURITY: Backend Numeric ID Assignment (January 25, 2026)
const userCreateTrigger = require("./triggers/onUserCreate");
exports.onUserCreate = userCreateTrigger.onUserCreate;
exports.getUserNumericId = userCreateTrigger.getUserNumericId;
// Guest Identity Restoration (February 6, 2026)
const guestToken = require("./auth/guest-token");
exports.getGuestCustomToken = guestToken.getGuestCustomToken;
// Email Notifications System
const emailTriggers = require("./notifications/email-triggers");
exports.sendWelcomeEmail = emailTriggers.sendWelcomeEmail;
exports.sendAdStatusEmail = emailTriggers.sendAdStatusEmail;
exports.sendPaymentReceiptEmail = emailTriggers.sendPaymentReceiptEmail;
exports.sendMessageNotificationEmail = emailTriggers.sendMessageNotificationEmail;
// 💳 NEW: Payment Webhooks - iCard, Revolut (February 5, 2026)
const icardPayments = require("./payment-webhooks/icard-webhooks");
const revolutPayments = require("./payment-webhooks/revolut-webhooks");
exports.icardWebhooks = icardPayments.icardWebhooks;
exports.revolutWebhooks = revolutPayments.revolutWebhooks;
// 📊 NEW: Payment Reconciliation & Monitoring (February 5, 2026)
const paymentReconciliation = require("./services/payment-reconciliation");
exports.dailyReconciliation = paymentReconciliation.dailyReconciliation;
exports.triggerReconciliation = paymentReconciliation.triggerReconciliation;
exports.exportReconciliationReport = paymentReconciliation.exportReconciliationReport;
// 🔔 NEW: Price Drop Alerts System (February 7, 2026 - TASK-07)
const priceDropAlerts = require("./triggers/price-drop-alerts");
exports.onCarPriceUpdate = priceDropAlerts.onCarPriceUpdate;
exports.cleanupOldPriceAlerts = priceDropAlerts.cleanupOldPriceAlerts;
// 🔄 NEW: Auto-Renewal Cron (February 8, 2026)
const autoRenewal = require("./auto-renewal-cron");
exports.dailyAutoRenewal = autoRenewal.dailyAutoRenewal;
// 💳 NEW: ePay & EasyPay Webhooks (February 8, 2026)
const paymentWebhook = require("./payment-webhook");
exports.handleEpayWebhook = paymentWebhook.handleEpayWebhook;
exports.handleEasypayWebhook = paymentWebhook.handleEasypayWebhook;
exports.verifyPaymentStatus = paymentWebhook.verifyPaymentStatus;
//# sourceMappingURL=index.js.map
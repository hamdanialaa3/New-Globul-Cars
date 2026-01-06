"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMotorcycleSold = exports.onVanSold = exports.onSuvSold = exports.onPassengerCarSold = exports.onBusDeleted = exports.onTruckDeleted = exports.onMotorcycleDeleted = exports.onVanDeleted = exports.onSuvDeleted = exports.onPassengerCarDeleted = exports.exportB2BAnalytics = exports.getB2BAnalytics = exports.exportB2BLeads = exports.cleanupExpiredDrafts = exports.manualArchiveSoldCars = exports.archiveSoldCars = exports.stripeWebhooks = exports.batchSyncAllCarsToAlgolia = exports.syncBusesToAlgolia = exports.syncTrucksToAlgolia = exports.syncMotorcyclesToAlgolia = exports.syncVansToAlgolia = exports.syncSuvsToAlgolia = exports.syncPassengerCarsToAlgolia = exports.evaluateCar = exports.prerenderSEO = exports.logSearchEvent = exports.requestIndexing = exports.hybridAIProxy = exports.aiGenerateCarDescription = exports.aiGenerateText = exports.syncCarsToFacebookAds = exports.syncCarsToGoogleAds = exports.manualSitemapRegeneration = exports.scheduledSitemapRegeneration = exports.sitemap = exports.cleanupDeletedImages = exports.optimizeUploadedImage = exports.updateMerchantFeedCache = exports.merchantFeedGenerator = exports.cleanupOldNotifications = exports.notifyFollowersOnNewCar = exports.dailyReminder = exports.onVerificationUpdate = exports.onNewOffer = exports.onNewInquiry = exports.onCarViewed = exports.onNewMessage = exports.onPriceUpdate = exports.onNewCarPosted = void 0;
exports.onBusSold = exports.onTruckSold = void 0;
const notifications = require("./notifications");
const merchantFeed = require("./merchant-feed");
const imageOptimizer = require("./image-optimizer");
const sitemapFunc = require("./sitemap");
const googleAdsSync = require("./google-ads-sync");
const facebookAdsSync = require("./facebook-ads-sync");
const newCarNotifications = require("./notifications/onNewCarPost");
const carLifecycle = require("./triggers/car-lifecycle");
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
exports.merchantFeedGenerator = merchantFeed.merchantFeed;
exports.updateMerchantFeedCache = merchantFeed.updateMerchantFeedCache;
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
const deepSeekProxy = require("./ai/deepseek-proxy");
exports.aiGenerateText = deepSeekProxy.aiGenerateText;
exports.aiGenerateCarDescription = deepSeekProxy.aiGenerateCarDescription;
// AI Services (Hybrid System - Phase 4.1.2 - NEW) ✅
const hybridAI = require("./ai/hybrid-ai-proxy");
exports.hybridAIProxy = hybridAI.hybridAIProxy;
// SEO & Analytics Strategy (Phase 1 Fixes)
const indexing = require("./seo/indexing-service");
const bqAnalytics = require("./analytics/bigquery-service");
const prerender = require("./seo/prerender");
exports.requestIndexing = indexing.requestIndexing;
exports.logSearchEvent = bqAnalytics.logSearchEvent;
exports.prerenderSEO = prerender.prerender;
// Hybrid AI Engine (Phase 2 - Gemini + DeepSeek) 🧠
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const ai_service_1 = require("./services/ai-service");
const aiService = new ai_service_1.AIService();
exports.evaluateCar = (0, https_1.onCall)({ region: "europe-west1", memory: "1GiB" }, async (request) => {
    // 1. Validate Inputs
    const { imageBase64, price, marketAvg } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required for analysis (Base64)');
    }
    try {
        logger.info("Starting Hybrid AI Analysis...");
        // 2. Phase 1: Gemini (Vision)
        const visualData = await aiService.analyzeImage(imageBase64);
        logger.info("Visual Analysis Complete:", visualData);
        // Merge price with extracted data
        const carFullData = Object.assign(Object.assign({}, visualData), { price });
        // 3. Phase 2: DeepSeek (Logic)
        // Usng marketAvg provided by client or fallback
        const logicVerdict = await aiService.analyzeMarketLogic(carFullData, marketAvg || 50000);
        logger.info("Logic Analysis Complete:", logicVerdict);
        // 4. Return Full Report
        return {
            carDetails: visualData,
            marketAnalysis: logicVerdict,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        logger.error("Error in evaluateCar:", error);
        throw new https_1.HttpsError('internal', 'AI Analysis Failed');
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
//# sourceMappingURL=index.js.map
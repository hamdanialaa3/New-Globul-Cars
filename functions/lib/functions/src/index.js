"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchSyncAllCarsToAlgolia = exports.syncBusesToAlgolia = exports.syncTrucksToAlgolia = exports.syncMotorcyclesToAlgolia = exports.syncVansToAlgolia = exports.syncSuvsToAlgolia = exports.syncPassengerCarsToAlgolia = exports.evaluateCar = exports.prerenderSEO = exports.logSearchEvent = exports.requestIndexing = exports.hybridAIProxy = exports.aiGenerateCarDescription = exports.aiGenerateText = exports.syncCarsToFacebookAds = exports.syncCarsToGoogleAds = exports.sitemap = exports.cleanupDeletedImages = exports.optimizeUploadedImage = exports.updateMerchantFeedCache = exports.merchantFeedGenerator = exports.cleanupOldNotifications = exports.notifyFollowersOnNewCar = exports.dailyReminder = exports.onVerificationUpdate = exports.onNewOffer = exports.onNewInquiry = exports.onCarViewed = exports.onNewMessage = exports.onPriceUpdate = exports.onNewCarPosted = void 0;
const notifications = require("./notifications");
const merchantFeed = require("./merchant-feed");
const imageOptimizer = require("./image-optimizer");
const sitemapFunc = require("./sitemap");
const googleAdsSync = require("./google-ads-sync");
const facebookAdsSync = require("./facebook-ads-sync");
const newCarNotifications = require("./notifications/onNewCarPost");
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
//# sourceMappingURL=index.js.map
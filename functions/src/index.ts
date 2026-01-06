import * as notifications from './notifications';
import * as merchantFeed from './merchant-feed';
import * as imageOptimizer from './image-optimizer';
import * as sitemapFunc from './sitemap';
import * as googleAdsSync from './google-ads-sync';
import * as facebookAdsSync from './facebook-ads-sync';
import * as newCarNotifications from './notifications/onNewCarPost';

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
export const merchantFeedGenerator = merchantFeed.merchantFeed;
export const updateMerchantFeedCache = merchantFeed.updateMerchantFeedCache;

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
import * as deepSeekProxy from './ai/deepseek-proxy';
export const aiGenerateText = deepSeekProxy.aiGenerateText;
export const aiGenerateCarDescription = deepSeekProxy.aiGenerateCarDescription;

// AI Services (Hybrid System - Phase 4.1.2 - NEW) ✅
import * as hybridAI from './ai/hybrid-ai-proxy';
export const hybridAIProxy = hybridAI.hybridAIProxy;

// SEO & Analytics Strategy (Phase 1 Fixes)
import * as indexing from './seo/indexing-service';
import * as bqAnalytics from './analytics/bigquery-service';
import * as prerender from './seo/prerender';

export const requestIndexing = indexing.requestIndexing;
export const logSearchEvent = bqAnalytics.logSearchEvent;
export const prerenderSEO = prerender.prerender;

// Hybrid AI Engine (Phase 2 - Gemini + DeepSeek) 🧠
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { AIService } from "./services/ai-service";

const aiService = new AIService();

export const evaluateCar = onCall({ region: "europe-west1", memory: "1GiB" }, async (request) => {
    // 1. Validate Inputs
    const { imageBase64, price, marketAvg } = request.data;

    if (!imageBase64) {
        throw new HttpsError('invalid-argument', 'Image is required for analysis (Base64)');
    }

    try {
        logger.info("Starting Hybrid AI Analysis...");

        // 2. Phase 1: Gemini (Vision)
        const visualData = await aiService.analyzeImage(imageBase64);
        logger.info("Visual Analysis Complete:", visualData);

        // Merge price with extracted data
        const carFullData = { ...visualData, price };

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

    } catch (error) {
        logger.error("Error in evaluateCar:", error);
        throw new HttpsError('internal', 'AI Analysis Failed');
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

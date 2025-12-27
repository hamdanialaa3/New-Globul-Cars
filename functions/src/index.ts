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
export const syncCarsToGoogleAds = googleAdsSync.syncCarsToGoogleAds;
export const syncCarsToFacebookAds = facebookAdsSync.syncCarsToFacebookAds;

// AI Services (DeepSeek Integration - Legacy)
import * as deepSeekProxy from './ai/deepseek-proxy';
export const aiGenerateText = deepSeekProxy.aiGenerateText;
export const aiGenerateCarDescription = deepSeekProxy.aiGenerateCarDescription;

// AI Services (Hybrid System - Phase 4.1.2 - NEW) ✅
import * as hybridAI from './ai/hybrid-ai-proxy';
export const hybridAIProxy = hybridAI.hybridAIProxy;

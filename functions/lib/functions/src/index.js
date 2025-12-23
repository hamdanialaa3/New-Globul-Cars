"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCarsToFacebookAds = exports.syncCarsToGoogleAds = exports.sitemap = exports.cleanupDeletedImages = exports.optimizeUploadedImage = exports.updateMerchantFeedCache = exports.merchantFeedGenerator = exports.dailyReminder = exports.onVerificationUpdate = exports.onNewOffer = exports.onNewInquiry = exports.onCarViewed = exports.onNewMessage = exports.onPriceUpdate = exports.onNewCarPosted = void 0;
const notifications = require("./notifications");
const merchantFeed = require("./merchant-feed");
const imageOptimizer = require("./image-optimizer");
const sitemapFunc = require("./sitemap");
const googleAdsSync = require("./google-ads-sync");
const facebookAdsSync = require("./facebook-ads-sync");
// Notification triggers
exports.onNewCarPosted = notifications.onNewCarPosted;
exports.onPriceUpdate = notifications.onPriceUpdate;
exports.onNewMessage = notifications.onNewMessage;
exports.onCarViewed = notifications.onCarViewed;
exports.onNewInquiry = notifications.onNewInquiry;
exports.onNewOffer = notifications.onNewOffer;
exports.onVerificationUpdate = notifications.onVerificationUpdate;
exports.dailyReminder = notifications.dailyReminder;
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
//# sourceMappingURL=index.js.map
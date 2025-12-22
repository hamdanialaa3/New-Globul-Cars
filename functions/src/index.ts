import * as notifications from './notifications';
import * as merchantFeed from './merchant-feed';
import * as imageOptimizer from './image-optimizer';

// Notification triggers
export const onNewCarPosted = notifications.onNewCarPosted;
export const onPriceUpdate = notifications.onPriceUpdate;
export const onNewMessage = notifications.onNewMessage;
export const onCarViewed = notifications.onCarViewed;
export const onNewInquiry = notifications.onNewInquiry;
export const onNewOffer = notifications.onNewOffer;
export const onVerificationUpdate = notifications.onVerificationUpdate;
export const dailyReminder = notifications.dailyReminder;

// Google Merchant Center Feed (for Google Shopping)
export const merchantFeedGenerator = merchantFeed.merchantFeed;
export const updateMerchantFeedCache = merchantFeed.updateMerchantFeedCache;

// Image Optimization (automatic WebP conversion & responsive sizes)
export const optimizeUploadedImage = imageOptimizer.optimizeImage;
export const cleanupDeletedImages = imageOptimizer.cleanupOptimizedImages;

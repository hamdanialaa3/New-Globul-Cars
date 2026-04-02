import * as notifications from './notifications';
import * as merchantFeedModule from './merchant-feed';
import * as imageOptimizer from './image-optimizer';
import * as sitemapFunc from './sitemap';
import * as googleAdsSync from './google-ads-sync';
import * as facebookAdsSync from './facebook-ads-sync';
import * as newCarNotifications from './notifications/onNewCarPost';
import * as carLifecycle from './triggers/car-lifecycle';
import * as bulkProcess from './bulk/processBulkUpload';
import * as bulkGrouping from './bulk/groupBulkImages';
import * as bulkVin from './bulk/extractVIN';
import * as bulkCloudSync from './bulk/syncCloudFolders';

// AI Services (Gemini Chat - NEW) ✅
import * as aiFunctions from './ai-functions';
export const geminiChat = aiFunctions.geminiChat;
export const aiQuotaCheck = aiFunctions.aiQuotaCheck;
export const geminiPriceSuggestion = aiFunctions.geminiPriceSuggestion;
export const analyzeCarImage = aiFunctions.analyzeCarImage;
export const analyzeImageQuality = aiFunctions.analyzeImageQuality;

// 🆕 V2.0 Engine Functions (April 2026)
// Engine 4: Open Banking Instant Pre-Approval
import * as financingFunctions from './financing/process-loan-application';
export const processLoanApplication = financingFunctions.processLoanApplication;

// Engine 3: Cross-Border Escrow Payment
import * as escrowFunctions from './escrow/process-escrow-payment';
export const processEscrowPayment = escrowFunctions.processEscrowPayment;
export const recordInspectionAndRelease =
  escrowFunctions.recordInspectionAndRelease;
export const expireOldEscrowTransactions =
  escrowFunctions.expireOldEscrowTransactions;

// Engine 8: Omni-Scan VIN Verification
import * as vinFunctions from './ai/vin-verification/verify-vin-external';
export const verifyVINExternal = vinFunctions.verifyVINExternal;

// Notification triggers (legacy)
export const onNewCarPosted = notifications.onNewCarPosted;
export const onPriceUpdate = notifications.onPriceUpdate;
export const onNewMessage = notifications.onNewMessage;
export const onCarViewed = notifications.onCarViewed;
export const onNewInquiry = notifications.onNewInquiry;
export const onNewOffer = notifications.onNewOffer;
export const onVerificationUpdate = notifications.onVerificationUpdate;
export const onNewReview = notifications.onNewReview;
export const onNewFavorite = notifications.onNewFavorite;
export const dailyReminder = notifications.dailyReminder;

// NEW: Social Notification System (Phase 2)
export const notifyFollowersOnNewCar =
  newCarNotifications.notifyFollowersOnNewCar;
export const cleanupOldNotifications =
  newCarNotifications.cleanupOldNotifications;

// Google Merchant Center Feed (for Google Shopping)
// Expose expected function name for hosting rewrite
export const merchantFeed = merchantFeedModule.merchantFeed;
export const merchantFeedGenerator = merchantFeedModule.merchantFeed;
export const updateMerchantFeedCache =
  merchantFeedModule.updateMerchantFeedCache;

// Image Optimization (automatic WebP conversion & responsive sizes)
export const optimizeUploadedImage = imageOptimizer.optimizeImage;
export const cleanupDeletedImages = imageOptimizer.cleanupOptimizedImages;

// Marketing / SEO
export const sitemap = sitemapFunc.sitemap;
export const sitemapRegenerate = sitemapFunc.sitemapRegenerate;
export const scheduledSitemapRegeneration =
  sitemapFunc.scheduledSitemapRegeneration;
export const manualSitemapRegeneration = sitemapFunc.manualSitemapRegeneration;
export const syncCarsToGoogleAds = googleAdsSync.syncCarsToGoogleAds;
export const syncCarsToFacebookAds = facebookAdsSync.syncCarsToFacebookAds;

// Enterprise Bulk Upload Pipeline
export const processBulkUpload = bulkProcess.processBulkUpload;
export const groupBulkImages = bulkGrouping.groupBulkImages;
export const extractVIN = bulkVin.extractVIN;
export const syncCloudFolders = bulkCloudSync.syncCloudFolders;

// AI Services (DeepSeek Integration - Legacy)
// ACTIVATED FOR PRODUCTION - CPU conflict noted but acceptable for live service
import * as deepSeekProxy from './ai/deepseek-proxy';
export const aiGenerateText = deepSeekProxy.aiGenerateText;
export const aiGenerateCarDescription = deepSeekProxy.aiGenerateCarDescription;

// Price Rating (mobile.de-style market comparison)
import * as priceRating from './ai/price-rating';
export const calculatePriceRating = priceRating.calculatePriceRating;

// AI Services (Hybrid System - Phase 4.1.2 - NEW) ✅
// ACTIVATED FOR PRODUCTION - CPU conflict noted but acceptable for live service
import * as hybridAI from './ai/hybrid-ai-proxy';
export const hybridAIProxy = hybridAI.hybridAIProxy;

// SEO & Analytics Strategy (Phase 1 Fixes)
import * as indexing from './seo/indexing-service';
import * as bqAnalytics from './analytics/bigquery-service';
import * as prerender from './seo/prerender';

export const requestIndexing = indexing.requestIndexing;
export const logSearchEvent = bqAnalytics.logSearchEvent;
export const prerenderSEO = prerender.prerender;

import * as dynamicSitemap from './seo/sitemap-generator';
export const sitemapDynamic = dynamicSitemap.sitemapDynamic;

// 🚀 NEW: Google Search Console Auto-Indexing Triggers (March 2026)
import * as seoIndexing from './seo/indexing-triggers';
export const onPassengerCarCreatedIndexing =
  seoIndexing.onPassengerCarCreatedIndexing;
export const onSuvCreatedIndexing = seoIndexing.onSuvCreatedIndexing;
export const onVanCreatedIndexing = seoIndexing.onVanCreatedIndexing;
export const onMotorcycleCreatedIndexing =
  seoIndexing.onMotorcycleCreatedIndexing;
export const onTruckCreatedIndexing = seoIndexing.onTruckCreatedIndexing;
export const onBusCreatedIndexing = seoIndexing.onBusCreatedIndexing;

export const onPassengerCarSoldIndexing =
  seoIndexing.onPassengerCarSoldIndexing;
export const onSuvSoldIndexing = seoIndexing.onSuvSoldIndexing;
export const onVanSoldIndexing = seoIndexing.onVanSoldIndexing;
export const onMotorcycleSoldIndexing = seoIndexing.onMotorcycleSoldIndexing;
export const onTruckSoldIndexing = seoIndexing.onTruckSoldIndexing;
export const onBusSoldIndexing = seoIndexing.onBusSoldIndexing;

// Hybrid AI Engine (Phase 2 - Gemini + DeepSeek) 🧠
import * as functions from 'firebase-functions/v1';
// import { AIService } from "./services/ai-service";

const getAiService = () => {
  const { AIService } = require('./services/ai-service');
  // Simple singleton pattern could be implemented here if needed,
  // but safe dynamic import is key for preventing cold-start crashes.
  return new AIService();
};

export const evaluateCar = functions.https.onCall(async (data, context) => {
  // Auth check — only authenticated users can evaluate cars
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required for car evaluation'
    );
  }

  // 1. Validate Inputs
  const { imageBase64, price, marketAvg } = data as any;

  if (!imageBase64) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image is required for analysis (Base64)'
    );
  }

  try {
    const aiService = getAiService();
    functions.logger.info('[evaluateCar] Starting Hybrid AI Analysis...');

    // 2. Phase 1: Gemini (Vision)
    const visualData = await aiService.analyzeImage(imageBase64);
    functions.logger.info('[evaluateCar] Visual Analysis Complete', {
      visualData,
    });

    // Merge price with extracted data
    const carFullData = { ...visualData, price };

    // 3. Phase 2: DeepSeek (Logic)
    // Usng marketAvg provided by client or fallback
    const logicVerdict = await aiService.analyzeMarketLogic(
      carFullData,
      marketAvg || 50000
    );
    functions.logger.info('[evaluateCar] Logic Analysis Complete', {
      logicVerdict,
    });

    // 4. Return Full Report
    return {
      carDetails: visualData,
      marketAnalysis: logicVerdict,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    functions.logger.error('[evaluateCar] Error', { error });
    throw new functions.https.HttpsError('internal', 'AI Analysis Failed');
  }
});

// ✅ NEW: Algolia Real-Time Sync (December 2025)
import * as algoliaSync from './syncCarsToAlgolia';
export const syncPassengerCarsToAlgolia =
  algoliaSync.syncPassengerCarsToAlgolia;
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

// ✅ Scheduled Firestore Backup (daily 2 AM)
import { scheduledFirestoreBackup as _scheduledFirestoreBackup } from './scheduled/firestore-backup';
export const scheduledFirestoreBackup = _scheduledFirestoreBackup;

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
export const dailyOrphanedDataCleanup =
  orphanedCleanup.dailyOrphanedDataCleanup;
export const cleanupOrphanedData = orphanedCleanup.cleanupOrphanedData;

// ✅ NEW: Realtime Messaging Push Notifications (January 8, 2026)
import * as realtimeMessagingNotifications from './notifications/realtime-messaging-notifications';
export const onNewRealtimeMessage =
  realtimeMessagingNotifications.onNewRealtimeMessage;
export const onOfferStatusChange =
  realtimeMessagingNotifications.onOfferStatusChange;
export const cleanupExpiredOffers =
  realtimeMessagingNotifications.cleanupExpiredOffers;

// 🔴 CRITICAL: Firebase Auth User Deletion Trigger (January 2026 - GDPR Compliance)
import { onUserDelete } from './triggers/on-user-delete';
export { onUserDelete };

// ✅ NEW: Manual Payment System (January 9, 2026)
const manualPayments = require('../lib/manual-payment-expiration');
export const checkExpiredManualPayments =
  manualPayments.checkExpiredManualPayments;
export const sendDailyPaymentSummary = manualPayments.sendDailyPaymentSummary;
export const onPaymentVerified = manualPayments.onPaymentVerified;
export const manualExpirePayments = manualPayments.manualExpirePayments;

// ⚠️ SECURITY: Auth Blocking & Rate Limiting (January 25, 2026)
import * as authBlocking from './blocking/beforeCreate';
export const beforeUserCreated = authBlocking.beforeUserCreated;

// ✅ Subscription Tier Enforcement — Server-side listing limit checks
import * as listingLimits from './subscription/enforce-listing-limits';
export const enforcePassengerCarsLimit =
  listingLimits.enforcePassengerCarsLimit;
export const enforceSuvsLimit = listingLimits.enforceSuvsLimit;
export const enforceVansLimit = listingLimits.enforceVansLimit;
export const enforceMotorcyclesLimit = listingLimits.enforceMotorcyclesLimit;
export const enforceTrucksLimit = listingLimits.enforceTrucksLimit;
export const enforceBusesLimit = listingLimits.enforceBusesLimit;

// ⚠️ SECURITY: Backend Numeric ID Assignment (January 25, 2026)
import * as userCreateTrigger from './triggers/onUserCreate';
export const onUserCreate = userCreateTrigger.onUserCreate;
export const getUserNumericId = userCreateTrigger.getUserNumericId;

// Guest Identity Restoration (February 6, 2026)
import * as guestToken from './auth/guest-token';
export const getGuestCustomToken = guestToken.getGuestCustomToken;

// Super Admin Firebase Auth Token (Page Builder write access)
import * as superAdminToken from './admin/superAdminToken';
export const getSuperAdminToken = superAdminToken.getSuperAdminToken;

// Admin User Management (secure server-side user creation)
import * as managedUser from './admin/createManagedUser';
export const createManagedUser = managedUser.createManagedUser;

// Email Notifications System
import * as emailTriggers from './notifications/email-triggers';
export const sendWelcomeEmail = emailTriggers.sendWelcomeEmail;
export const sendAdStatusEmail = emailTriggers.sendAdStatusEmail;
export const sendPaymentReceiptEmail = emailTriggers.sendPaymentReceiptEmail;
export const sendMessageNotificationEmail =
  emailTriggers.sendMessageNotificationEmail;

// 💳 NEW: Payment Webhooks - iCard, Revolut (February 5, 2026)
import * as icardPayments from './payment-webhooks/icard-webhooks';
import * as revolutPayments from './payment-webhooks/revolut-webhooks';
export const icardWebhooks = icardPayments.icardWebhooks;
export const revolutWebhooks = revolutPayments.revolutWebhooks;

// 📊 NEW: Payment Reconciliation & Monitoring (February 5, 2026)
import * as paymentReconciliation from './services/payment-reconciliation';
export const dailyReconciliation = paymentReconciliation.dailyReconciliation;
export const triggerReconciliation =
  paymentReconciliation.triggerReconciliation;
export const exportReconciliationReport =
  paymentReconciliation.exportReconciliationReport;

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

// 📲 NEW: Social Media Automation - Facebook Multi-Page Publisher (March 2026)
import * as facebookPublisher from './social/facebook-publisher';
export const autoPublishToFacebookPages =
  facebookPublisher.autoPublishToFacebookPages;

// 🛒 NEW: Meta Automotive Inventory Catalog Feed
import * as facebookFeed from './social/facebook-catalog-feed';
export const facebookCatalogFeed = facebookFeed.facebookCatalogFeed;

// 🟢 NEW: WhatsApp Business Cloud API & Webhook (March 2026)
import * as whatsappService from './social/whatsapp-api';
export const whatsappApi = whatsappService.whatsappApi;
export const whatsappWebhook = whatsappService.whatsappWebhook;

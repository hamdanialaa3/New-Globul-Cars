// functions/src/index.ts
// Main entry point for Firebase Functions

// Export verification functions
export {
  approveVerification,
  rejectVerification,
  verifyEIK,
  onVerificationApproved
} from './verification';

// Export reviews functions
export {
  submitReview,
  getReviews,
  getMyReviews,
  markHelpful,
  unmarkHelpful,
  reportReview,
  respondToReview,
  updateReviewResponse,
  deleteReviewResponse,
  updateReviewStatsOnWrite
} from './reviews';

// Export trust score functions
export {
  getTrustScore,
  recalculateTrustScore,
  onReviewStatsUpdated,
  onVerificationUpdated,
  onListingChanged,
  onAnalyticsUpdated,
} from './trustScore';

// Export team management functions
export {
  inviteMember,
  resendInvitation,
  cancelInvitation,
  acceptInvite,
  declineInvite,
  removeMember,
  updateMember,
  leaveTeam,
} from './team';

// Export messaging functions (Advanced P2.1)
export {
  createQuickReply,
  getQuickReplies,
  updateQuickReply,
  deleteQuickReply,
  useQuickReply,
  getAutoResponderSettings,
  updateAutoResponderSettings,
  onNewMessage,
  calculateLeadScore,
  getLeads,
  updateLeadStatus,
  onConversationUpdate,
  assignConversation,
  getSharedInbox,
  addInternalNote,
  getInternalNotes,
} from './messaging';

// Export billing functions (P2.2)
export {
  generateInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
  sendInvoiceEmail,
} from './billing';

// Export commission functions (P2.3)
export {
  onSaleCompleted,
  getCommissionPeriods,
  getCommissionPeriod,
  getAllCommissionPeriods,
  getCommissionRate,
  chargeMonthlyCommissions,
  triggerCommissionCharging,
  markCommissionPaid,
  generateCommissionStatement,
} from './commission';

// Export subscription functions (basic)
export {
  createCheckoutSession,
  stripeWebhook,
  cancelSubscription
} from './subscriptions/index';

// Export analytics functions (real-time tracking)
export {
  trackEvent,
  getUserAnalytics,
  resetDailyCounters,
  resetWeeklyCounters,
  resetMonthlyCounters,
  calculateResponseMetrics,
  calculateConversionRates
} from './analytics/index';

// Export statistics and counter functions
export {
  incrementCarViewCount,
  onCarCreate,
  onCarDelete,
  onUserCreate,
  onUserDelete
} from './stats';

// Export analytics functions
export {
  getAveragePriceByModel,
  getMarketTrends,
  getDealerPerformance,
  getSalesPeakHours,
  getRegionalPriceVariations,
  getSubscriptionStatus,
  getCarValuation
} from './analytics';

// Export subscription functions
export { createB2BSubscription, getB2BSubscription, cancelB2BSubscription, upgradeB2BSubscription } from './subscriptions';

// Export business API functions
export { b2bValuationAPI, b2bMarketInsightsAPI } from './business-apis';

// Export vehicle history functions
export { getVehicleHistoryReport, getCachedVehicleHistory } from './vehicle-history';

// Export EV charging functions
export { findEVChargingStations, getEVChargingRoute, getEVCompatibility, getEVNetworkStats } from './ev-charging';

// Export service network functions
export {
  findServiceCenters,
  getServiceCenterDetails,
  createServiceRequest,
  getCustomerServiceRequests,
  submitServiceReview,
  getServiceCenterReviews,
  getAvailableTimeSlots,
  getServiceNetworkStats
} from './service-network';

// Export certified service functions
export {
  scheduleVehicleInspection,
  getInspectionDetails,
  getCustomerInspections,
  getVehicleCertificate,
  verifyCertificate,
  getCertificationStats
} from './certified-service';

// Export insurance service functions
export {
  getInsuranceQuotes,
  purchaseInsurancePolicy,
  getCustomerPolicies,
  fileInsuranceClaim,
  getClaimDetails,
  getInsuranceProviders,
  getInsuranceMarketStats
} from './insurance-service';

// Export Gloubul Connect functions
export {
  receiveIoTData,
  onEmergencyAlertCreated,
  analyzeMaintenanceNeeds
} from './gloubul-connect';

// Export IoT setup functions
export {
  setupIoTInfrastructure,
  registerIoTDevice,
  getIoTDeviceStats,
  removeIoTDevice
} from './iot-setup';

// Export Digital Twin functions
export {
  getDigitalTwin,
  onLiveDataUpdated,
  syncDigitalTwinToBigQuery,
  analyzeDigitalTwinHealth,
  getDigitalTwinStats,
  resetDigitalTwin
} from './digital-twin';

// Export Proactive Maintenance functions
export {
  createMaintenanceAlert,
  getUserMaintenanceAlerts,
  acceptServiceOffer,
  analyzeProactiveMaintenance,
  sendMaintenanceReminders
} from './proactive-maintenance';

// Export chat notification functions
// export { sendChatNotification } from './notifications';

// Export geolocation functions
export { geocodeAddressOnCarCreate } from './geolocation';

// Export image analysis functions
export { analyzeCarImage } from './vision';

// Export translation functions
export { translateText } from './translation';

// Export reCAPTCHA verification functions
export { verifyRecaptchaToken } from './recaptcha';

// Export Facebook integration functions
export { handleFacebookDataDeletion } from './facebook/data-deletion';
export { messengerWebhook } from './facebook/messenger-webhook';

// Export Multi-Platform Catalog Feeds
export { googleMerchantFeed } from './catalog-feeds/google-feed';
export { instagramShoppingFeed } from './catalog-feeds/instagram-feed';
export { tiktokShoppingFeed } from './catalog-feeds/tiktok-feed';

// Export Firebase Auth user functions
export { 
  getAuthUsersCount, 
  getActiveAuthUsers, 
  syncAuthToFirestore 
} from './get-auth-users-count';

// Export RBAC and Custom Claims functions
export {
  setDefaultUserRole,
  handleTokenRefresh
} from './auth/set-user-claims';

export {
  upgradeToSeller,
  checkSellerEligibility
} from './auth/upgrade-to-seller';

export {
  setUserRole,
  getUserClaims,
  listUsersWithRoles
} from './auth/admin-role-management';

// Export Messaging and Notifications functions
export {
  sendMessageNotification,
  updateMessageReadStatus
} from './messaging/send-message-notification';

// Export Reviews and Ratings functions
export {
  aggregateSellerRating,
  validateReview
} from './reviews/aggregate-seller-ratings';

// Export Seller Dashboard functions
export {
  getSellerMetrics
} from './seller/get-seller-metrics';

// Export Search Engine functions
export {
  syncCarToAlgolia,
  reindexAllCars
} from './search/sync-to-algolia';

// Export Payment functions (Stripe Connect)
export {
  createStripeSellerAccount,
  createStripeAccountLink,
  getStripeAccountStatus
} from './payments/stripe-seller-account';

export {
  createCarPaymentIntent,
  confirmCarPayment
} from './payments/create-payment';

export {
  handleStripeWebhook
} from './payments/webhook-handler';
"use strict";
// functions/src/index.ts
// Main entry point for Firebase Functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSaleCompleted = exports.sendInvoiceEmail = exports.updateInvoiceStatus = exports.getInvoice = exports.getInvoices = exports.generateInvoice = exports.getInternalNotes = exports.addInternalNote = exports.getSharedInbox = exports.assignConversation = exports.onConversationUpdate = exports.updateLeadStatus = exports.getLeads = exports.calculateLeadScore = exports.onNewMessage = exports.updateAutoResponderSettings = exports.getAutoResponderSettings = exports.useQuickReply = exports.deleteQuickReply = exports.updateQuickReply = exports.getQuickReplies = exports.createQuickReply = exports.leaveTeam = exports.updateMember = exports.removeMember = exports.declineInvite = exports.acceptInvite = exports.cancelInvitation = exports.resendInvitation = exports.inviteMember = exports.onAnalyticsUpdated = exports.onListingChanged = exports.onVerificationUpdated = exports.onReviewStatsUpdated = exports.recalculateTrustScore = exports.getTrustScore = exports.updateReviewStatsOnWrite = exports.deleteReviewResponse = exports.updateReviewResponse = exports.respondToReview = exports.reportReview = exports.unmarkHelpful = exports.markHelpful = exports.getMyReviews = exports.getReviews = exports.submitReview = exports.onVerificationApproved = exports.verifyEIK = exports.rejectVerification = exports.approveVerification = void 0;
exports.getServiceNetworkStats = exports.getAvailableTimeSlots = exports.getServiceCenterReviews = exports.submitServiceReview = exports.getCustomerServiceRequests = exports.createServiceRequest = exports.getServiceCenterDetails = exports.findServiceCenters = exports.getEVNetworkStats = exports.getEVCompatibility = exports.getEVChargingRoute = exports.findEVChargingStations = exports.getCachedVehicleHistory = exports.getVehicleHistoryReport = exports.b2bMarketInsightsAPI = exports.b2bValuationAPI = exports.upgradeB2BSubscription = exports.cancelB2BSubscription = exports.getB2BSubscription = exports.createB2BSubscription = exports.getCarValuation = exports.getSubscriptionStatus = exports.getRegionalPriceVariations = exports.getSalesPeakHours = exports.getDealerPerformance = exports.getMarketTrends = exports.getAveragePriceByModel = exports.onUserDelete = exports.onUserCreate = exports.onCarDelete = exports.onCarCreate = exports.incrementCarViewCount = exports.calculateConversionRates = exports.calculateResponseMetrics = exports.resetMonthlyCounters = exports.resetWeeklyCounters = exports.resetDailyCounters = exports.getUserAnalytics = exports.trackEvent = exports.cancelSubscription = exports.stripeWebhook = exports.createCheckoutSession = exports.generateCommissionStatement = exports.markCommissionPaid = exports.triggerCommissionCharging = exports.chargeMonthlyCommissions = exports.getCommissionRate = exports.getAllCommissionPeriods = exports.getCommissionPeriod = exports.getCommissionPeriods = void 0;
exports.listUsersWithRoles = exports.getUserClaims = exports.setUserRole = exports.checkSellerEligibility = exports.upgradeToSeller = exports.handleTokenRefresh = exports.setDefaultUserRole = exports.syncAuthToFirestore = exports.getActiveAuthUsers = exports.getAuthUsersCount = exports.tiktokShoppingFeed = exports.instagramShoppingFeed = exports.googleMerchantFeed = exports.messengerWebhook = exports.handleFacebookDataDeletion = exports.verifyRecaptchaToken = exports.translateText = exports.analyzeCarImage = exports.geocodeAddressOnCarCreate = exports.sendMaintenanceReminders = exports.analyzeProactiveMaintenance = exports.acceptServiceOffer = exports.getUserMaintenanceAlerts = exports.createMaintenanceAlert = exports.resetDigitalTwin = exports.getDigitalTwinStats = exports.analyzeDigitalTwinHealth = exports.syncDigitalTwinToBigQuery = exports.onLiveDataUpdated = exports.getDigitalTwin = exports.removeIoTDevice = exports.getIoTDeviceStats = exports.registerIoTDevice = exports.setupIoTInfrastructure = exports.analyzeMaintenanceNeeds = exports.onEmergencyAlertCreated = exports.receiveIoTData = exports.getInsuranceMarketStats = exports.getInsuranceProviders = exports.getClaimDetails = exports.fileInsuranceClaim = exports.getCustomerPolicies = exports.purchaseInsurancePolicy = exports.getInsuranceQuotes = exports.getCertificationStats = exports.verifyCertificate = exports.getVehicleCertificate = exports.getCustomerInspections = exports.getInspectionDetails = exports.scheduleVehicleInspection = void 0;
exports.handleStripeWebhook = exports.confirmCarPayment = exports.createCarPaymentIntent = exports.getStripeAccountStatus = exports.createStripeAccountLink = exports.createStripeSellerAccount = exports.reindexAllCars = exports.syncCarToAlgolia = exports.getSellerMetrics = exports.validateReview = exports.aggregateSellerRating = exports.updateMessageReadStatus = exports.sendMessageNotification = void 0;
// Export verification functions
var verification_1 = require("./verification");
Object.defineProperty(exports, "approveVerification", { enumerable: true, get: function () { return verification_1.approveVerification; } });
Object.defineProperty(exports, "rejectVerification", { enumerable: true, get: function () { return verification_1.rejectVerification; } });
Object.defineProperty(exports, "verifyEIK", { enumerable: true, get: function () { return verification_1.verifyEIK; } });
Object.defineProperty(exports, "onVerificationApproved", { enumerable: true, get: function () { return verification_1.onVerificationApproved; } });
// Export reviews functions
var reviews_1 = require("./reviews");
Object.defineProperty(exports, "submitReview", { enumerable: true, get: function () { return reviews_1.submitReview; } });
Object.defineProperty(exports, "getReviews", { enumerable: true, get: function () { return reviews_1.getReviews; } });
Object.defineProperty(exports, "getMyReviews", { enumerable: true, get: function () { return reviews_1.getMyReviews; } });
Object.defineProperty(exports, "markHelpful", { enumerable: true, get: function () { return reviews_1.markHelpful; } });
Object.defineProperty(exports, "unmarkHelpful", { enumerable: true, get: function () { return reviews_1.unmarkHelpful; } });
Object.defineProperty(exports, "reportReview", { enumerable: true, get: function () { return reviews_1.reportReview; } });
Object.defineProperty(exports, "respondToReview", { enumerable: true, get: function () { return reviews_1.respondToReview; } });
Object.defineProperty(exports, "updateReviewResponse", { enumerable: true, get: function () { return reviews_1.updateReviewResponse; } });
Object.defineProperty(exports, "deleteReviewResponse", { enumerable: true, get: function () { return reviews_1.deleteReviewResponse; } });
Object.defineProperty(exports, "updateReviewStatsOnWrite", { enumerable: true, get: function () { return reviews_1.updateReviewStatsOnWrite; } });
// Export trust score functions
var trustScore_1 = require("./trustScore");
Object.defineProperty(exports, "getTrustScore", { enumerable: true, get: function () { return trustScore_1.getTrustScore; } });
Object.defineProperty(exports, "recalculateTrustScore", { enumerable: true, get: function () { return trustScore_1.recalculateTrustScore; } });
Object.defineProperty(exports, "onReviewStatsUpdated", { enumerable: true, get: function () { return trustScore_1.onReviewStatsUpdated; } });
Object.defineProperty(exports, "onVerificationUpdated", { enumerable: true, get: function () { return trustScore_1.onVerificationUpdated; } });
Object.defineProperty(exports, "onListingChanged", { enumerable: true, get: function () { return trustScore_1.onListingChanged; } });
Object.defineProperty(exports, "onAnalyticsUpdated", { enumerable: true, get: function () { return trustScore_1.onAnalyticsUpdated; } });
// Export team management functions
var team_1 = require("./team");
Object.defineProperty(exports, "inviteMember", { enumerable: true, get: function () { return team_1.inviteMember; } });
Object.defineProperty(exports, "resendInvitation", { enumerable: true, get: function () { return team_1.resendInvitation; } });
Object.defineProperty(exports, "cancelInvitation", { enumerable: true, get: function () { return team_1.cancelInvitation; } });
Object.defineProperty(exports, "acceptInvite", { enumerable: true, get: function () { return team_1.acceptInvite; } });
Object.defineProperty(exports, "declineInvite", { enumerable: true, get: function () { return team_1.declineInvite; } });
Object.defineProperty(exports, "removeMember", { enumerable: true, get: function () { return team_1.removeMember; } });
Object.defineProperty(exports, "updateMember", { enumerable: true, get: function () { return team_1.updateMember; } });
Object.defineProperty(exports, "leaveTeam", { enumerable: true, get: function () { return team_1.leaveTeam; } });
// Export messaging functions (Advanced P2.1)
var messaging_1 = require("./messaging");
Object.defineProperty(exports, "createQuickReply", { enumerable: true, get: function () { return messaging_1.createQuickReply; } });
Object.defineProperty(exports, "getQuickReplies", { enumerable: true, get: function () { return messaging_1.getQuickReplies; } });
Object.defineProperty(exports, "updateQuickReply", { enumerable: true, get: function () { return messaging_1.updateQuickReply; } });
Object.defineProperty(exports, "deleteQuickReply", { enumerable: true, get: function () { return messaging_1.deleteQuickReply; } });
Object.defineProperty(exports, "useQuickReply", { enumerable: true, get: function () { return messaging_1.useQuickReply; } });
Object.defineProperty(exports, "getAutoResponderSettings", { enumerable: true, get: function () { return messaging_1.getAutoResponderSettings; } });
Object.defineProperty(exports, "updateAutoResponderSettings", { enumerable: true, get: function () { return messaging_1.updateAutoResponderSettings; } });
Object.defineProperty(exports, "onNewMessage", { enumerable: true, get: function () { return messaging_1.onNewMessage; } });
Object.defineProperty(exports, "calculateLeadScore", { enumerable: true, get: function () { return messaging_1.calculateLeadScore; } });
Object.defineProperty(exports, "getLeads", { enumerable: true, get: function () { return messaging_1.getLeads; } });
Object.defineProperty(exports, "updateLeadStatus", { enumerable: true, get: function () { return messaging_1.updateLeadStatus; } });
Object.defineProperty(exports, "onConversationUpdate", { enumerable: true, get: function () { return messaging_1.onConversationUpdate; } });
Object.defineProperty(exports, "assignConversation", { enumerable: true, get: function () { return messaging_1.assignConversation; } });
Object.defineProperty(exports, "getSharedInbox", { enumerable: true, get: function () { return messaging_1.getSharedInbox; } });
Object.defineProperty(exports, "addInternalNote", { enumerable: true, get: function () { return messaging_1.addInternalNote; } });
Object.defineProperty(exports, "getInternalNotes", { enumerable: true, get: function () { return messaging_1.getInternalNotes; } });
// Export billing functions (P2.2)
var billing_1 = require("./billing");
Object.defineProperty(exports, "generateInvoice", { enumerable: true, get: function () { return billing_1.generateInvoice; } });
Object.defineProperty(exports, "getInvoices", { enumerable: true, get: function () { return billing_1.getInvoices; } });
Object.defineProperty(exports, "getInvoice", { enumerable: true, get: function () { return billing_1.getInvoice; } });
Object.defineProperty(exports, "updateInvoiceStatus", { enumerable: true, get: function () { return billing_1.updateInvoiceStatus; } });
Object.defineProperty(exports, "sendInvoiceEmail", { enumerable: true, get: function () { return billing_1.sendInvoiceEmail; } });
// Export commission functions (P2.3)
var commission_1 = require("./commission");
Object.defineProperty(exports, "onSaleCompleted", { enumerable: true, get: function () { return commission_1.onSaleCompleted; } });
Object.defineProperty(exports, "getCommissionPeriods", { enumerable: true, get: function () { return commission_1.getCommissionPeriods; } });
Object.defineProperty(exports, "getCommissionPeriod", { enumerable: true, get: function () { return commission_1.getCommissionPeriod; } });
Object.defineProperty(exports, "getAllCommissionPeriods", { enumerable: true, get: function () { return commission_1.getAllCommissionPeriods; } });
Object.defineProperty(exports, "getCommissionRate", { enumerable: true, get: function () { return commission_1.getCommissionRate; } });
Object.defineProperty(exports, "chargeMonthlyCommissions", { enumerable: true, get: function () { return commission_1.chargeMonthlyCommissions; } });
Object.defineProperty(exports, "triggerCommissionCharging", { enumerable: true, get: function () { return commission_1.triggerCommissionCharging; } });
Object.defineProperty(exports, "markCommissionPaid", { enumerable: true, get: function () { return commission_1.markCommissionPaid; } });
Object.defineProperty(exports, "generateCommissionStatement", { enumerable: true, get: function () { return commission_1.generateCommissionStatement; } });
// Export subscription functions (basic)
var index_1 = require("./subscriptions/index");
Object.defineProperty(exports, "createCheckoutSession", { enumerable: true, get: function () { return index_1.createCheckoutSession; } });
Object.defineProperty(exports, "stripeWebhook", { enumerable: true, get: function () { return index_1.stripeWebhook; } });
Object.defineProperty(exports, "cancelSubscription", { enumerable: true, get: function () { return index_1.cancelSubscription; } });
// Export analytics functions (real-time tracking)
var index_2 = require("./analytics/index");
Object.defineProperty(exports, "trackEvent", { enumerable: true, get: function () { return index_2.trackEvent; } });
Object.defineProperty(exports, "getUserAnalytics", { enumerable: true, get: function () { return index_2.getUserAnalytics; } });
Object.defineProperty(exports, "resetDailyCounters", { enumerable: true, get: function () { return index_2.resetDailyCounters; } });
Object.defineProperty(exports, "resetWeeklyCounters", { enumerable: true, get: function () { return index_2.resetWeeklyCounters; } });
Object.defineProperty(exports, "resetMonthlyCounters", { enumerable: true, get: function () { return index_2.resetMonthlyCounters; } });
Object.defineProperty(exports, "calculateResponseMetrics", { enumerable: true, get: function () { return index_2.calculateResponseMetrics; } });
Object.defineProperty(exports, "calculateConversionRates", { enumerable: true, get: function () { return index_2.calculateConversionRates; } });
// Export statistics and counter functions
var stats_1 = require("./stats");
Object.defineProperty(exports, "incrementCarViewCount", { enumerable: true, get: function () { return stats_1.incrementCarViewCount; } });
Object.defineProperty(exports, "onCarCreate", { enumerable: true, get: function () { return stats_1.onCarCreate; } });
Object.defineProperty(exports, "onCarDelete", { enumerable: true, get: function () { return stats_1.onCarDelete; } });
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return stats_1.onUserCreate; } });
Object.defineProperty(exports, "onUserDelete", { enumerable: true, get: function () { return stats_1.onUserDelete; } });
// Export analytics functions
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "getAveragePriceByModel", { enumerable: true, get: function () { return analytics_1.getAveragePriceByModel; } });
Object.defineProperty(exports, "getMarketTrends", { enumerable: true, get: function () { return analytics_1.getMarketTrends; } });
Object.defineProperty(exports, "getDealerPerformance", { enumerable: true, get: function () { return analytics_1.getDealerPerformance; } });
Object.defineProperty(exports, "getSalesPeakHours", { enumerable: true, get: function () { return analytics_1.getSalesPeakHours; } });
Object.defineProperty(exports, "getRegionalPriceVariations", { enumerable: true, get: function () { return analytics_1.getRegionalPriceVariations; } });
Object.defineProperty(exports, "getSubscriptionStatus", { enumerable: true, get: function () { return analytics_1.getSubscriptionStatus; } });
Object.defineProperty(exports, "getCarValuation", { enumerable: true, get: function () { return analytics_1.getCarValuation; } });
// Export subscription functions
var subscriptions_1 = require("./subscriptions");
Object.defineProperty(exports, "createB2BSubscription", { enumerable: true, get: function () { return subscriptions_1.createB2BSubscription; } });
Object.defineProperty(exports, "getB2BSubscription", { enumerable: true, get: function () { return subscriptions_1.getB2BSubscription; } });
Object.defineProperty(exports, "cancelB2BSubscription", { enumerable: true, get: function () { return subscriptions_1.cancelB2BSubscription; } });
Object.defineProperty(exports, "upgradeB2BSubscription", { enumerable: true, get: function () { return subscriptions_1.upgradeB2BSubscription; } });
// Export business API functions
var business_apis_1 = require("./business-apis");
Object.defineProperty(exports, "b2bValuationAPI", { enumerable: true, get: function () { return business_apis_1.b2bValuationAPI; } });
Object.defineProperty(exports, "b2bMarketInsightsAPI", { enumerable: true, get: function () { return business_apis_1.b2bMarketInsightsAPI; } });
// Export vehicle history functions
var vehicle_history_1 = require("./vehicle-history");
Object.defineProperty(exports, "getVehicleHistoryReport", { enumerable: true, get: function () { return vehicle_history_1.getVehicleHistoryReport; } });
Object.defineProperty(exports, "getCachedVehicleHistory", { enumerable: true, get: function () { return vehicle_history_1.getCachedVehicleHistory; } });
// Export EV charging functions
var ev_charging_1 = require("./ev-charging");
Object.defineProperty(exports, "findEVChargingStations", { enumerable: true, get: function () { return ev_charging_1.findEVChargingStations; } });
Object.defineProperty(exports, "getEVChargingRoute", { enumerable: true, get: function () { return ev_charging_1.getEVChargingRoute; } });
Object.defineProperty(exports, "getEVCompatibility", { enumerable: true, get: function () { return ev_charging_1.getEVCompatibility; } });
Object.defineProperty(exports, "getEVNetworkStats", { enumerable: true, get: function () { return ev_charging_1.getEVNetworkStats; } });
// Export service network functions
var service_network_1 = require("./service-network");
Object.defineProperty(exports, "findServiceCenters", { enumerable: true, get: function () { return service_network_1.findServiceCenters; } });
Object.defineProperty(exports, "getServiceCenterDetails", { enumerable: true, get: function () { return service_network_1.getServiceCenterDetails; } });
Object.defineProperty(exports, "createServiceRequest", { enumerable: true, get: function () { return service_network_1.createServiceRequest; } });
Object.defineProperty(exports, "getCustomerServiceRequests", { enumerable: true, get: function () { return service_network_1.getCustomerServiceRequests; } });
Object.defineProperty(exports, "submitServiceReview", { enumerable: true, get: function () { return service_network_1.submitServiceReview; } });
Object.defineProperty(exports, "getServiceCenterReviews", { enumerable: true, get: function () { return service_network_1.getServiceCenterReviews; } });
Object.defineProperty(exports, "getAvailableTimeSlots", { enumerable: true, get: function () { return service_network_1.getAvailableTimeSlots; } });
Object.defineProperty(exports, "getServiceNetworkStats", { enumerable: true, get: function () { return service_network_1.getServiceNetworkStats; } });
// Export certified service functions
var certified_service_1 = require("./certified-service");
Object.defineProperty(exports, "scheduleVehicleInspection", { enumerable: true, get: function () { return certified_service_1.scheduleVehicleInspection; } });
Object.defineProperty(exports, "getInspectionDetails", { enumerable: true, get: function () { return certified_service_1.getInspectionDetails; } });
Object.defineProperty(exports, "getCustomerInspections", { enumerable: true, get: function () { return certified_service_1.getCustomerInspections; } });
Object.defineProperty(exports, "getVehicleCertificate", { enumerable: true, get: function () { return certified_service_1.getVehicleCertificate; } });
Object.defineProperty(exports, "verifyCertificate", { enumerable: true, get: function () { return certified_service_1.verifyCertificate; } });
Object.defineProperty(exports, "getCertificationStats", { enumerable: true, get: function () { return certified_service_1.getCertificationStats; } });
// Export insurance service functions
var insurance_service_1 = require("./insurance-service");
Object.defineProperty(exports, "getInsuranceQuotes", { enumerable: true, get: function () { return insurance_service_1.getInsuranceQuotes; } });
Object.defineProperty(exports, "purchaseInsurancePolicy", { enumerable: true, get: function () { return insurance_service_1.purchaseInsurancePolicy; } });
Object.defineProperty(exports, "getCustomerPolicies", { enumerable: true, get: function () { return insurance_service_1.getCustomerPolicies; } });
Object.defineProperty(exports, "fileInsuranceClaim", { enumerable: true, get: function () { return insurance_service_1.fileInsuranceClaim; } });
Object.defineProperty(exports, "getClaimDetails", { enumerable: true, get: function () { return insurance_service_1.getClaimDetails; } });
Object.defineProperty(exports, "getInsuranceProviders", { enumerable: true, get: function () { return insurance_service_1.getInsuranceProviders; } });
Object.defineProperty(exports, "getInsuranceMarketStats", { enumerable: true, get: function () { return insurance_service_1.getInsuranceMarketStats; } });
// Export Gloubul Connect functions
var gloubul_connect_1 = require("./gloubul-connect");
Object.defineProperty(exports, "receiveIoTData", { enumerable: true, get: function () { return gloubul_connect_1.receiveIoTData; } });
Object.defineProperty(exports, "onEmergencyAlertCreated", { enumerable: true, get: function () { return gloubul_connect_1.onEmergencyAlertCreated; } });
Object.defineProperty(exports, "analyzeMaintenanceNeeds", { enumerable: true, get: function () { return gloubul_connect_1.analyzeMaintenanceNeeds; } });
// Export IoT setup functions
var iot_setup_1 = require("./iot-setup");
Object.defineProperty(exports, "setupIoTInfrastructure", { enumerable: true, get: function () { return iot_setup_1.setupIoTInfrastructure; } });
Object.defineProperty(exports, "registerIoTDevice", { enumerable: true, get: function () { return iot_setup_1.registerIoTDevice; } });
Object.defineProperty(exports, "getIoTDeviceStats", { enumerable: true, get: function () { return iot_setup_1.getIoTDeviceStats; } });
Object.defineProperty(exports, "removeIoTDevice", { enumerable: true, get: function () { return iot_setup_1.removeIoTDevice; } });
// Export Digital Twin functions
var digital_twin_1 = require("./digital-twin");
Object.defineProperty(exports, "getDigitalTwin", { enumerable: true, get: function () { return digital_twin_1.getDigitalTwin; } });
Object.defineProperty(exports, "onLiveDataUpdated", { enumerable: true, get: function () { return digital_twin_1.onLiveDataUpdated; } });
Object.defineProperty(exports, "syncDigitalTwinToBigQuery", { enumerable: true, get: function () { return digital_twin_1.syncDigitalTwinToBigQuery; } });
Object.defineProperty(exports, "analyzeDigitalTwinHealth", { enumerable: true, get: function () { return digital_twin_1.analyzeDigitalTwinHealth; } });
Object.defineProperty(exports, "getDigitalTwinStats", { enumerable: true, get: function () { return digital_twin_1.getDigitalTwinStats; } });
Object.defineProperty(exports, "resetDigitalTwin", { enumerable: true, get: function () { return digital_twin_1.resetDigitalTwin; } });
// Export Proactive Maintenance functions
var proactive_maintenance_1 = require("./proactive-maintenance");
Object.defineProperty(exports, "createMaintenanceAlert", { enumerable: true, get: function () { return proactive_maintenance_1.createMaintenanceAlert; } });
Object.defineProperty(exports, "getUserMaintenanceAlerts", { enumerable: true, get: function () { return proactive_maintenance_1.getUserMaintenanceAlerts; } });
Object.defineProperty(exports, "acceptServiceOffer", { enumerable: true, get: function () { return proactive_maintenance_1.acceptServiceOffer; } });
Object.defineProperty(exports, "analyzeProactiveMaintenance", { enumerable: true, get: function () { return proactive_maintenance_1.analyzeProactiveMaintenance; } });
Object.defineProperty(exports, "sendMaintenanceReminders", { enumerable: true, get: function () { return proactive_maintenance_1.sendMaintenanceReminders; } });
// Export chat notification functions
// export { sendChatNotification } from './notifications';
// Export geolocation functions
var geolocation_1 = require("./geolocation");
Object.defineProperty(exports, "geocodeAddressOnCarCreate", { enumerable: true, get: function () { return geolocation_1.geocodeAddressOnCarCreate; } });
// Export image analysis functions
var vision_1 = require("./vision");
Object.defineProperty(exports, "analyzeCarImage", { enumerable: true, get: function () { return vision_1.analyzeCarImage; } });
// Export translation functions
var translation_1 = require("./translation");
Object.defineProperty(exports, "translateText", { enumerable: true, get: function () { return translation_1.translateText; } });
// Export reCAPTCHA verification functions
var recaptcha_1 = require("./recaptcha");
Object.defineProperty(exports, "verifyRecaptchaToken", { enumerable: true, get: function () { return recaptcha_1.verifyRecaptchaToken; } });
// Export Facebook integration functions
var data_deletion_1 = require("./facebook/data-deletion");
Object.defineProperty(exports, "handleFacebookDataDeletion", { enumerable: true, get: function () { return data_deletion_1.handleFacebookDataDeletion; } });
var messenger_webhook_1 = require("./facebook/messenger-webhook");
Object.defineProperty(exports, "messengerWebhook", { enumerable: true, get: function () { return messenger_webhook_1.messengerWebhook; } });
// Export Multi-Platform Catalog Feeds
var google_feed_1 = require("./catalog-feeds/google-feed");
Object.defineProperty(exports, "googleMerchantFeed", { enumerable: true, get: function () { return google_feed_1.googleMerchantFeed; } });
var instagram_feed_1 = require("./catalog-feeds/instagram-feed");
Object.defineProperty(exports, "instagramShoppingFeed", { enumerable: true, get: function () { return instagram_feed_1.instagramShoppingFeed; } });
var tiktok_feed_1 = require("./catalog-feeds/tiktok-feed");
Object.defineProperty(exports, "tiktokShoppingFeed", { enumerable: true, get: function () { return tiktok_feed_1.tiktokShoppingFeed; } });
// Export Firebase Auth user functions
var get_auth_users_count_1 = require("./get-auth-users-count");
Object.defineProperty(exports, "getAuthUsersCount", { enumerable: true, get: function () { return get_auth_users_count_1.getAuthUsersCount; } });
Object.defineProperty(exports, "getActiveAuthUsers", { enumerable: true, get: function () { return get_auth_users_count_1.getActiveAuthUsers; } });
Object.defineProperty(exports, "syncAuthToFirestore", { enumerable: true, get: function () { return get_auth_users_count_1.syncAuthToFirestore; } });
// Export RBAC and Custom Claims functions
var set_user_claims_1 = require("./auth/set-user-claims");
Object.defineProperty(exports, "setDefaultUserRole", { enumerable: true, get: function () { return set_user_claims_1.setDefaultUserRole; } });
Object.defineProperty(exports, "handleTokenRefresh", { enumerable: true, get: function () { return set_user_claims_1.handleTokenRefresh; } });
var upgrade_to_seller_1 = require("./auth/upgrade-to-seller");
Object.defineProperty(exports, "upgradeToSeller", { enumerable: true, get: function () { return upgrade_to_seller_1.upgradeToSeller; } });
Object.defineProperty(exports, "checkSellerEligibility", { enumerable: true, get: function () { return upgrade_to_seller_1.checkSellerEligibility; } });
var admin_role_management_1 = require("./auth/admin-role-management");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return admin_role_management_1.setUserRole; } });
Object.defineProperty(exports, "getUserClaims", { enumerable: true, get: function () { return admin_role_management_1.getUserClaims; } });
Object.defineProperty(exports, "listUsersWithRoles", { enumerable: true, get: function () { return admin_role_management_1.listUsersWithRoles; } });
// Export Messaging and Notifications functions
var send_message_notification_1 = require("./messaging/send-message-notification");
Object.defineProperty(exports, "sendMessageNotification", { enumerable: true, get: function () { return send_message_notification_1.sendMessageNotification; } });
Object.defineProperty(exports, "updateMessageReadStatus", { enumerable: true, get: function () { return send_message_notification_1.updateMessageReadStatus; } });
// Export Reviews and Ratings functions
var aggregate_seller_ratings_1 = require("./reviews/aggregate-seller-ratings");
Object.defineProperty(exports, "aggregateSellerRating", { enumerable: true, get: function () { return aggregate_seller_ratings_1.aggregateSellerRating; } });
Object.defineProperty(exports, "validateReview", { enumerable: true, get: function () { return aggregate_seller_ratings_1.validateReview; } });
// Export Seller Dashboard functions
var get_seller_metrics_1 = require("./seller/get-seller-metrics");
Object.defineProperty(exports, "getSellerMetrics", { enumerable: true, get: function () { return get_seller_metrics_1.getSellerMetrics; } });
// Export Search Engine functions
var sync_to_algolia_1 = require("./search/sync-to-algolia");
Object.defineProperty(exports, "syncCarToAlgolia", { enumerable: true, get: function () { return sync_to_algolia_1.syncCarToAlgolia; } });
Object.defineProperty(exports, "reindexAllCars", { enumerable: true, get: function () { return sync_to_algolia_1.reindexAllCars; } });
// Export Payment functions (Stripe Connect)
var stripe_seller_account_1 = require("./payments/stripe-seller-account");
Object.defineProperty(exports, "createStripeSellerAccount", { enumerable: true, get: function () { return stripe_seller_account_1.createStripeSellerAccount; } });
Object.defineProperty(exports, "createStripeAccountLink", { enumerable: true, get: function () { return stripe_seller_account_1.createStripeAccountLink; } });
Object.defineProperty(exports, "getStripeAccountStatus", { enumerable: true, get: function () { return stripe_seller_account_1.getStripeAccountStatus; } });
var create_payment_1 = require("./payments/create-payment");
Object.defineProperty(exports, "createCarPaymentIntent", { enumerable: true, get: function () { return create_payment_1.createCarPaymentIntent; } });
Object.defineProperty(exports, "confirmCarPayment", { enumerable: true, get: function () { return create_payment_1.confirmCarPayment; } });
var webhook_handler_1 = require("./payments/webhook-handler");
Object.defineProperty(exports, "handleStripeWebhook", { enumerable: true, get: function () { return webhook_handler_1.handleStripeWebhook; } });
//# sourceMappingURL=index.js.map
"use strict";
// functions/src/index.ts
// Main entry point for Firebase Functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIoTDevice = exports.setupIoTInfrastructure = exports.analyzeMaintenanceNeeds = exports.onEmergencyAlertCreated = exports.receiveIoTData = exports.getInsuranceMarketStats = exports.getInsuranceProviders = exports.getClaimDetails = exports.fileInsuranceClaim = exports.getCustomerPolicies = exports.purchaseInsurancePolicy = exports.getInsuranceQuotes = exports.getCertificationStats = exports.verifyCertificate = exports.getVehicleCertificate = exports.getCustomerInspections = exports.getInspectionDetails = exports.scheduleVehicleInspection = exports.getServiceNetworkStats = exports.getAvailableTimeSlots = exports.getServiceCenterReviews = exports.submitServiceReview = exports.getCustomerServiceRequests = exports.createServiceRequest = exports.getServiceCenterDetails = exports.findServiceCenters = exports.getEVNetworkStats = exports.getEVCompatibility = exports.getEVChargingRoute = exports.findEVChargingStations = exports.getCachedVehicleHistory = exports.getVehicleHistoryReport = exports.b2bMarketInsightsAPI = exports.b2bValuationAPI = exports.upgradeB2BSubscription = exports.cancelB2BSubscription = exports.getB2BSubscription = exports.createB2BSubscription = exports.getCarValuation = exports.getSubscriptionStatus = exports.getRegionalPriceVariations = exports.getSalesPeakHours = exports.getDealerPerformance = exports.getMarketTrends = exports.getAveragePriceByModel = exports.onUserDelete = exports.onUserCreate = exports.onCarDelete = exports.onCarCreate = exports.incrementCarViewCount = void 0;
exports.syncAuthToFirestore = exports.getActiveAuthUsers = exports.getAuthUsersCount = exports.tiktokShoppingFeed = exports.instagramShoppingFeed = exports.googleMerchantFeed = exports.messengerWebhook = exports.handleFacebookDataDeletion = exports.verifyRecaptchaToken = exports.translateText = exports.analyzeCarImage = exports.geocodeAddressOnCarCreate = exports.sendMaintenanceReminders = exports.analyzeProactiveMaintenance = exports.acceptServiceOffer = exports.getUserMaintenanceAlerts = exports.createMaintenanceAlert = exports.resetDigitalTwin = exports.getDigitalTwinStats = exports.analyzeDigitalTwinHealth = exports.syncDigitalTwinToBigQuery = exports.onLiveDataUpdated = exports.getDigitalTwin = exports.removeIoTDevice = exports.getIoTDeviceStats = void 0;
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
//# sourceMappingURL=index.js.map
// functions/src/index.ts
// Main entry point for Firebase Functions

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
export { facebookCatalogXML, facebookCatalogCSV } from './facebook-catalog';

// Export Firebase Auth user functions
export { 
  getAuthUsersCount, 
  getActiveAuthUsers, 
  syncAuthToFirestore 
} from './get-auth-users-count';
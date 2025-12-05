// Firebase Cloud Functions Entry Point
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// ============================================
// AI Functions (Artificial Intelligence)
// وظائف الذكاء الاصطناعي
// ============================================
export * from './ai';

// Social / OAuth
export { exchangeOAuthToken } from './social-media/oauth-handler';

// Admin/auth counts and sync
export { getAuthUsersCount, getActiveAuthUsers, syncAuthToFirestore } from './get-auth-users-count';

// Super Admin claim management
export { setSuperAdminClaim } from './auth/set-super-admin-claim';

// Marketplace stats bundle (includes new Super Admin analytics)
export { getSuperAdminAnalytics } from './stats';

// Monitoring (Task 6)
export { 
  monitoringAlertWebhook, 
  getMonitoringStats, 
  acknowledgeAlert 
} from './monitoring/alert-webhook';

// Backup System (Task 8)
export { 
  manualBackup, 
  dailyBackup, 
  weeklyBackupCleanup, 
  listBackups, 
  restoreBackup 
} from './backup/backup-functions';

// Saved Search Alert Functions (scheduling + trigger)
export { savedSearchAlertScheduler, savedSearchOnCreate } from './search/saved-search-alert';

// Profile Metrics Aggregation (daily scheduled + on-demand)
export { dailyProfileMetricsAggregation, triggerProfileMetricsAggregation } from './profile/daily-metrics-aggregation';

// ============================================
// Subscription & Billing Functions (Stripe Integration)
// وظائف الاشتراكات والفواتير (تكامل Stripe)
// ============================================
export { createCheckoutSession } from './subscriptions/createCheckoutSession';
export { verifyCheckoutSession } from './subscriptions/verifyCheckoutSession';
export { stripeWebhook } from './subscriptions/stripeWebhook';
export { cancelSubscription } from './subscriptions/cancelSubscription';

// ============================================
// Algolia Search Sync Functions
// وظائف مزامنة البحث مع Algolia
// ============================================

// ❌ DEPRECATED: Old sync (cars only - 14% coverage) - Replaced by sync-all-collections
// Keeping imports commented for backward compatibility check
// export { 
//   onCarCreate, 
//   onCarUpdate, 
//   onCarDelete,
//   syncAllCarsToAlgolia,
//   clearAlgoliaIndex
// } from './algolia/sync-cars';

// ✅ ACTIVE: Sync all 7 collections (100% coverage)
export {
  syncCarsToAlgolia,
  syncPassengerCarsToAlgolia,
  syncSuvsToAlgolia,
  syncVansToAlgolia,
  syncMotorcyclesToAlgolia,
  syncTrucksToAlgolia,
  syncBusesToAlgolia,
  bulkSyncAllCollectionsToAlgolia,
  clearAllAlgoliaIndices
} from './algolia/sync-all-collections-to-algolia';


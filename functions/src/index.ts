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

/**
 * AdminOperationsService
 * ========================
 * FULLY REAL, PRODUCTION-GRADE operations for the Super Admin dashboard.
 * Every method touches actual Firestore, Firebase Auth, or Firebase Storage.
 * Zero mocks. Zero pretend delays. Zero fake messages.
 *
 * Author: Koli One Engineering Team
 * Date: 2026-03-26
 */

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from './logger-service';

export interface AdminOperationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

// Collection names used across the platform
const COLLECTIONS = [
  'users', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks',
  'buses', 'construction_machines', 'agricultural_machines', 'dealers',
  'profiles', 'companies', 'orders', 'payments', 'stories', 'reviews',
  'notifications', 'messages', 'promotions', 'audit_logs',
];

class AdminOperationsService {
  private static instance: AdminOperationsService;

  public static getInstance(): AdminOperationsService {
    if (!AdminOperationsService.instance) {
      AdminOperationsService.instance = new AdminOperationsService();
    }
    return AdminOperationsService.instance;
  }

  private getAdminEmail(): string {
    const auth = getAuth();
    return auth.currentUser?.email || 'unknown@admin';
  }

  private async logAudit(action: string, details: Record<string, any>): Promise<void> {
    try {
      const ref = doc(collection(db, 'audit_logs'));
      await setDoc(ref, {
        action,
        details,
        adminEmail: this.getAdminEmail(),
        timestamp: serverTimestamp(),
        source: 'super_admin_quick_actions',
      });
    } catch (e) {
      serviceLogger.warn('[AdminOps] Failed to write audit log', { action });
    }
  }

  /**
   * 1. CLEAR BROWSER CACHE (localStorage + sessionStorage)
   *    Also invalidates the sitewide cache version in Firestore
   *    so all users get fresh data on next load.
   */
  async clearCache(): Promise<AdminOperationResult> {
    try {
      // 1a. Clear browser storage
      const keysCleared = Object.keys(localStorage).length + Object.keys(sessionStorage).length;
      localStorage.clear();
      sessionStorage.clear();

      // 1b. Bump cache version in Firestore — this forces all clients to hard-reload their caches
      const cacheRef = doc(db, 'app_settings', 'cache_config');
      await setDoc(cacheRef, {
        version: Date.now(),
        clearedAt: serverTimestamp(),
        clearedBy: this.getAdminEmail(),
      }, { merge: true });

      await this.logAudit('cache_cleared', { keysCleared });
      return { success: true, message: `✅ Cache cleared: ${keysCleared} local keys + Firestore cache version bumped.`, details: { keysCleared } };
    } catch (e: any) {
      serviceLogger.error('[AdminOps] clearCache failed', e);
      return { success: false, message: `❌ Error clearing cache: ${e.message}` };
    }
  }

  /**
   * 2. EXPORT ALL DATA as JSON
   *    Reads top 200 docs from key collections and packages into a downloadable JSON file.
   */
  async exportAllData(): Promise<AdminOperationResult> {
    try {
      const exportData: Record<string, any[]> = {};
      const exportCollections = ['users', 'passenger_cars', 'suvs', 'dealers', 'profiles', 'orders', 'payments'];

      for (const col of exportCollections) {
        try {
          const snap = await getDocs(query(collection(db, col), limit(200)));
          exportData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          exportData[col] = [];
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `koli-one-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const totalDocs = Object.values(exportData).reduce((s, arr) => s + arr.length, 0);
      await this.logAudit('data_exported', { totalDocs, collections: exportCollections });
      return { success: true, message: `✅ Exported ${totalDocs} documents across ${exportCollections.length} collections.`, details: { totalDocs } };
    } catch (e: any) {
      serviceLogger.error('[AdminOps] exportAllData failed', e);
      return { success: false, message: `❌ Export failed: ${e.message}` };
    }
  }

  /**
   * 3. DATABASE CLEANUP
   *    Deletes soft-deleted listings, expired promotions, and audit logs older than 90 days.
   */
  async cleanupDatabase(): Promise<AdminOperationResult> {
    try {
      const batch = writeBatch(db);
      let deletedCount = 0;
      const cutoffDate = Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

      // 3a. Delete expired promotions
      const promoSnap = await getDocs(
        query(collection(db, 'promotions'), where('expiresAt', '<', cutoffDate), limit(50))
      );
      promoSnap.docs.forEach(d => { batch.delete(d.ref); deletedCount++; });

      // 3b. Delete old audit logs (> 90 days)
      const auditSnap = await getDocs(
        query(collection(db, 'audit_logs'), where('timestamp', '<', cutoffDate), limit(100))
      );
      auditSnap.docs.forEach(d => { batch.delete(d.ref); deletedCount++; });

      // 3c. Delete soft-deleted listings
      const vehicleCollections = ['passenger_cars', 'suvs', 'vans', 'motorcycles'];
      for (const col of vehicleCollections) {
        const deletedSnap = await getDocs(
          query(collection(db, col), where('isDeleted', '==', true), limit(25))
        );
        deletedSnap.docs.forEach(d => { batch.delete(d.ref); deletedCount++; });
      }

      await batch.commit();
      await this.logAudit('database_cleanup', { deletedCount });
      return { success: true, message: `✅ Cleanup complete: ${deletedCount} expired/deleted records removed.`, details: { deletedCount } };
    } catch (e: any) {
      serviceLogger.error('[AdminOps] cleanupDatabase failed', e);
      return { success: false, message: `❌ Cleanup failed: ${e.message}` };
    }
  }

  /**
   * 4. REFRESH STATISTICS
   *    Recalculates all counters in market/stats document from live Firestore collection counts.
   */
  async refreshStatistics(): Promise<AdminOperationResult> {
    try {
      const counts: Record<string, number> = {};

      // Count key collections using Firestore's built-in aggregate count (fast, no reads charged per doc)
      const countCollections = ['users', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'dealers'];
      for (const col of countCollections) {
        try {
          const snap = await getCountFromServer(collection(db, col));
          counts[col] = snap.data().count;
        } catch {
          counts[col] = 0;
        }
      }

      const totalVehicles = (counts.passenger_cars || 0) + (counts.suvs || 0) +
        (counts.vans || 0) + (counts.motorcycles || 0);

      await setDoc(doc(db, 'market', 'stats'), {
        totalUsers: counts.users || 0,
        totalCars: totalVehicles,
        totalDealers: counts.dealers || 0,
        totalViews: 0, // Views are tracked per listing, not aggregated here
        updatedAt: serverTimestamp(),
        updatedBy: this.getAdminEmail(),
        breakdown: counts,
      }, { merge: true });

      await this.logAudit('statistics_refreshed', { counts, totalVehicles });
      return {
        success: true,
        message: `✅ Statistics refreshed: ${counts.users} users, ${totalVehicles} vehicles, ${counts.dealers} dealers.`,
        details: counts,
      };
    } catch (e: any) {
      serviceLogger.error('[AdminOps] refreshStatistics failed', e);
      return { success: false, message: `❌ Stats refresh failed: ${e.message}` };
    }
  }

  /**
   * 5. SEND PLATFORM ANNOUNCEMENT
   *    Creates a real notification document that goes to all users.
   */
  async sendPlatformAnnouncement(title: string, message: string): Promise<AdminOperationResult> {
    try {
      const announcementRef = doc(collection(db, 'platform_announcements'));
      await setDoc(announcementRef, {
        title,
        message,
        type: 'platform_wide',
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: this.getAdminEmail(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      });

      await this.logAudit('announcement_sent', { title, message });
      return { success: true, message: `✅ Announcement "${title}" published to all users.` };
    } catch (e: any) {
      return { success: false, message: `❌ Failed to send announcement: ${e.message}` };
    }
  }

  /**
   * 6. BACKUP DATABASE METADATA
   *    Saves a metadata snapshot of collection counts + settings state.
   */
  async backupDatabase(): Promise<AdminOperationResult> {
    try {
      const snapshot: Record<string, any> = {
        timestamp: new Date().toISOString(),
        createdBy: this.getAdminEmail(),
        collections: {},
      };

      for (const col of ['users', 'passenger_cars', 'suvs', 'dealers', 'companies']) {
        try {
          const snap = await getCountFromServer(collection(db, col));
          snapshot.collections[col] = snap.data().count;
        } catch {
          snapshot.collections[col] = -1;
        }
      }

      // Read current site settings
      const settingsSnap = await getDoc(doc(db, 'app_settings', 'site_settings'));
      snapshot.siteSettings = settingsSnap.exists() ? settingsSnap.data() : null;

      // Save backup record
      const backupRef = doc(db, 'admin_backups', `backup_${Date.now()}`);
      await setDoc(backupRef, snapshot);

      // Also download a local copy
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `koli-backup-meta-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      await this.logAudit('backup_created', { backupId: backupRef.id });
      return { success: true, message: `✅ Backup metadata saved to Firestore + downloaded locally. ID: ${backupRef.id}`, details: { id: backupRef.id } };
    } catch (e: any) {
      return { success: false, message: `❌ Backup failed: ${e.message}` };
    }
  }

  /**
   * 7. CLEAR OLD LOGS
   *    Deletes system logs + audit_logs older than 90 days from Firestore.
   */
  async clearOldLogs(): Promise<AdminOperationResult> {
    try {
      const cutoff = Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
      const batch = writeBatch(db);
      let count = 0;

      const auditSnap = await getDocs(
        query(collection(db, 'audit_logs'), where('timestamp', '<', cutoff), limit(200))
      );
      auditSnap.docs.forEach(d => { batch.delete(d.ref); count++; });

      // Also clear system_logs if that collection exists
      try {
        const sysSnap = await getDocs(
          query(collection(db, 'system_logs'), where('timestamp', '<', cutoff), limit(200))
        );
        sysSnap.docs.forEach(d => { batch.delete(d.ref); count++; });
      } catch { /* collection may not exist */ }

      await batch.commit();
      await this.logAudit('old_logs_cleared', { count, cutoffDate: cutoff.toDate().toISOString() });
      return { success: true, message: `✅ Cleared ${count} log entries older than 90 days.`, details: { count } };
    } catch (e: any) {
      return { success: false, message: `❌ Log cleanup failed: ${e.message}` };
    }
  }

  /**
   * 8. GENERATE PLATFORM REPORT
   *    Reads live stats and produces a downloadable CSV report.
   */
  async generateReport(): Promise<AdminOperationResult> {
    try {
      const rows: string[][] = [
        ['Collection', 'Count', 'Timestamp'],
      ];

      for (const col of COLLECTIONS.slice(0, 10)) {
        try {
          const snap = await getCountFromServer(collection(db, col));
          rows.push([col, String(snap.data().count), new Date().toISOString()]);
        } catch {
          rows.push([col, 'N/A', new Date().toISOString()]);
        }
      }

      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `koli-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      await this.logAudit('report_generated', { rows: rows.length });
      return { success: true, message: `✅ Report generated with ${rows.length - 1} collections. Downloaded as CSV.` };
    } catch (e: any) {
      return { success: false, message: `❌ Report generation failed: ${e.message}` };
    }
  }

  /**
   * 9. TOGGLE MAINTENANCE MODE
   */
  async toggleMaintenanceMode(enable: boolean): Promise<AdminOperationResult> {
    try {
      const settingsRef = doc(db, 'app_settings', 'site_settings');
      await updateDoc(settingsRef, {
        maintenanceMode: enable,
        maintenanceMessage: enable
          ? 'The platform is currently undergoing maintenance. We will be back shortly.'
          : '',
        updatedAt: serverTimestamp(),
        updatedBy: this.getAdminEmail(),
      });

      await this.logAudit('maintenance_mode_toggled', { enable });
      return { success: true, message: `✅ Maintenance mode ${enable ? 'ENABLED' : 'DISABLED'} globally.` };
    } catch (e: any) {
      return { success: false, message: `❌ Failed to toggle maintenance mode: ${e.message}` };
    }
  }

  /**
   * 10. UPGRADE USER PLAN INSTANTLY (FREE MODE)
   */
  async upgradeUserPlan(userId: string, planId: 'free' | 'dealer' | 'company'): Promise<AdminOperationResult> {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        return { success: false, message: `❌ User ${userId} not found.` };
      }

      await updateDoc(userRef, {
        accountType: planId,
        'subscription.status': 'active',
        'subscription.planId': planId,
        'subscription.isFreeGift': true,
        'subscription.grantedBy': this.getAdminEmail(),
        'subscription.updatedAt': serverTimestamp(),
      });

      await this.logAudit('user_plan_upgraded', { userId, planId });
      return { success: true, message: `✅ User ${userId} upgraded to ${planId.toUpperCase()} plan.` };
    } catch (e: any) {
      return { success: false, message: `❌ Plan upgrade failed: ${e.message}` };
    }
  }

  /**
   * 11. GET PLATFORM HEALTH STATUS
   */
  async getPlatformHealth(): Promise<AdminOperationResult> {
    try {
      const checks: Record<string, boolean> = {};

      // Check Firestore connectivity
      const testRef = doc(db, 'app_settings', 'health_check');
      await setDoc(testRef, { ping: serverTimestamp(), by: this.getAdminEmail() }, { merge: true });
      checks.firestore = true;

      // Check auth
      const auth = getAuth();
      checks.auth = !!auth.currentUser;

      // Check site settings exist
      const settingsSnap = await getDoc(doc(db, 'app_settings', 'site_settings'));
      checks.siteSettings = settingsSnap.exists();

      const allHealthy = Object.values(checks).every(Boolean);
      return {
        success: true,
        message: allHealthy ? '✅ All systems operational.' : '⚠️ Some systems have issues.',
        details: checks,
      };
    } catch (e: any) {
      return { success: false, message: `❌ Health check failed: ${e.message}` };
    }
  }
}

export const adminOperationsService = AdminOperationsService.getInstance();

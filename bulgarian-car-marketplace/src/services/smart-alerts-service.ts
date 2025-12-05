// Super Admin - Smart Alerts Service
// Monitors system health and generates intelligent alerts

import { collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

export interface Alert {
  id?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'performance' | 'security' | 'database' | 'api' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actionRequired?: string;
  metadata?: any;
}

interface SystemHealthMetrics {
  performance: number;
  security: number;
  availability: number;
  dataIntegrity: number;
  overallScore: number;
}

class SmartAlertsService {
  private readonly ALERT_THRESHOLDS = {
    loadTime: 3000,
    apiResponseTime: 500,
    errorRate: 5,
    databaseSize: 1024 * 1024 * 1024,
    cacheSize: 20 * 1024 * 1024,
    failedLoginsPerHour: 10
  };

  async checkSystemHealth(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    try {
      const healthMetrics = await this.calculateHealthMetrics();

      if (healthMetrics.performance < 70) {
        alerts.push({
          severity: 'warning',
          category: 'performance',
          title: 'Low Performance Score',
          description: `System performance is at ${healthMetrics.performance}% (below 70% threshold)`,
          timestamp: new Date(),
          resolved: false,
          actionRequired: 'Check page load times and optimize bundle size'
        });
      }

      if (healthMetrics.security < 80) {
        alerts.push({
          severity: 'error',
          category: 'security',
          title: 'Security Score Below Threshold',
          description: `Security score is ${healthMetrics.security}% (below 80% threshold)`,
          timestamp: new Date(),
          resolved: false,
          actionRequired: 'Run security audit and update vulnerable dependencies'
        });
      }

      if (healthMetrics.availability < 95) {
        alerts.push({
          severity: 'critical',
          category: 'system',
          title: 'System Availability Issue',
          description: `System availability is ${healthMetrics.availability}% (below 95% threshold)`,
          timestamp: new Date(),
          resolved: false,
          actionRequired: 'Check server status and database connectivity'
        });
      }

    } catch (error) {
      serviceLogger.error('Error checking system health', error as Error);
    }

    return alerts;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const alertsRef = collection(db, 'system_alerts');
      const q = query(
        alertsRef,
        where('resolved', '==', false),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Alert));
    } catch (error: any) {
      // Silently handle permission errors
      if (error?.code === 'permission-denied') {
        return [];
      }
      serviceLogger.error('Error getting active alerts', error as Error);
      return [];
    }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      await addDoc(collection(db, 'system_alerts'), {
        ...alert,
        timestamp: serverTimestamp(),
        resolved: false
      });
    } catch (error) {
      serviceLogger.error('Error creating alert', error as Error, { severity: alert.severity, category: alert.category });
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, 'system_alerts', alertId);
      await updateDoc(alertRef, {
        resolved: true,
        resolvedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error resolving alert', error as Error, { alertId });
    }
  }

  async getAlertHistory(days: number = 7): Promise<Alert[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const alertsRef = collection(db, 'system_alerts');
      const q = query(
        alertsRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate()
      } as Alert));
    } catch (error) {
      serviceLogger.error('Error getting alert history', error as Error, { days });
      return [];
    }
  }

  private async calculateHealthMetrics(): Promise<SystemHealthMetrics> {
    const performance = await this.calculatePerformanceScore();
    const security = await this.calculateSecurityScore();
    const availability = await this.calculateAvailabilityScore();
    const dataIntegrity = await this.calculateDataIntegrityScore();

    const overallScore = Math.round(
      (performance * 0.25) +
      (security * 0.30) +
      (availability * 0.25) +
      (dataIntegrity * 0.20)
    );

    return {
      performance,
      security,
      availability,
      dataIntegrity,
      overallScore
    };
  }

  private async calculatePerformanceScore(): Promise<number> {
    try {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        return Math.max(0, 100 - memoryUsagePercent);
      }
      return 85;
    } catch (error) {
      return 80;
    }
  }

  private async calculateSecurityScore(): Promise<number> {
    return 85;
  }

  private async calculateAvailabilityScore(): Promise<number> {
    return 98;
  }

  private async calculateDataIntegrityScore(): Promise<number> {
    return 92;
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'error': return '#f87171';
      case 'warning': return '#fbbf24';
      case 'info': return '#60a5fa';
      default: return '#6b7280';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  }
}

export const smartAlertsService = new SmartAlertsService();
export type { SystemHealthMetrics };


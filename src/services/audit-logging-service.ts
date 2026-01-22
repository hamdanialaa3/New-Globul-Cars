import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// Audit Logging Interfaces
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security';
  location?: {
    country: string;
    city: string;
    region: string;
  };
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: 'login_success' | 'login_failed' | 'logout' | 'permission_denied' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  activeUsers: number;
  totalLogins: number;
  failedLogins: number;
  securityEvents: number;
  dataAccessCount: number;
  dataModificationCount: number;
  systemErrors: number;
  performanceMetrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

class AuditLoggingService {
  private static instance: AuditLoggingService;

  private constructor() {}

  public static getInstance(): AuditLoggingService {
    if (!AuditLoggingService.instance) {
      AuditLoggingService.instance = new AuditLoggingService();
    }
    return AuditLoggingService.instance;
  }

  // Log user action
  public async logUserAction(
    userId: string,
    userEmail: string,
    userName: string,
    action: string,
    resource: string,
    resourceId?: string,
    resourceName?: string,
    details: string = '',
    success: boolean = true,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' = 'data_access',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'audit_logs'));
      const auditLog: Omit<AuditLog, 'id'> = {
        timestamp: serverTimestamp() as any,
        userId,
        userEmail,
        userName,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        success,
        severity,
        category,
        location: await this.getLocationInfo(),
        metadata
      };
      
      await setDoc(logRef, auditLog);
    } catch (error) {
      serviceLogger.error('Error logging user action', error as Error, { userId, action, resource });
    }
  }

  // Log security event
  public async logSecurityEvent(
    eventType: SecurityEvent['eventType'],
    details: string,
    userId?: string,
    userEmail?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const eventRef = doc(collection(db, 'security_events'));
      const securityEvent: Omit<SecurityEvent, 'id'> = {
        timestamp: serverTimestamp() as any,
        eventType,
        userId,
        userEmail,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        details,
        severity,
        resolved: false
      };
      
      await setDoc(eventRef, securityEvent);
      
      // If critical, send immediate alert
      if (severity === 'critical') {
        await this.sendSecurityAlert(securityEvent);
      }
    } catch (error) {
      serviceLogger.error('Error logging security event', error as Error, { eventType, severity });
    }
  }

  // Get audit logs with filtering
  public async getAuditLogs(
    page: number = 1,
    limitCount: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      category?: string;
      severity?: string;
      dateFrom?: Date;
      dateTo?: Date;
      success?: boolean;
    }
  ): Promise<{ logs: AuditLog[]; total: number; hasMore: boolean }> {
    try {
      let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
      
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters?.action) {
        q = query(q, where('action', '==', filters.action));
      }
      
      if (filters?.resource) {
        q = query(q, where('resource', '==', filters.resource));
      }
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      
      if (filters?.success !== undefined) {
        q = query(q, where('success', '==', filters.success));
      }
      
      if (filters?.dateFrom) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      
      if (filters?.dateTo) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
      }
      
      q = query(q, limit(limitCount * page));
      
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc: any) => ({ 
        ...doc.data(), 
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as AuditLog));
      
      return {
        logs: logs.slice((page - 1) * limitCount, page * limitCount),
        total: logs.length,
        hasMore: logs.length >= limitCount
      };
    } catch (error) {
      serviceLogger.error('Error getting audit logs', error as Error, { page, limitCount, filters });
      return { logs: [], total: 0, hasMore: false };
    }
  }

  // Get security events
  public async getSecurityEvents(
    page: number = 1,
    limitCount: number = 50,
    filters?: {
      eventType?: string;
      severity?: string;
      resolved?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ events: SecurityEvent[]; total: number; hasMore: boolean }> {
    try {
      let q = query(collection(db, 'security_events'), orderBy('timestamp', 'desc'));
      
      if (filters?.eventType) {
        q = query(q, where('eventType', '==', filters.eventType));
      }
      
      if (filters?.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      
      if (filters?.resolved !== undefined) {
        q = query(q, where('resolved', '==', filters.resolved));
      }
      
      if (filters?.dateFrom) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      
      if (filters?.dateTo) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
      }
      
      q = query(q, limit(limitCount * page));
      
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc: any) => ({ 
        ...doc.data(), 
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate()
      } as SecurityEvent));
      
      return {
        events: events.slice((page - 1) * limitCount, page * limitCount),
        total: events.length,
        hasMore: events.length >= limitCount
      };
    } catch (error) {
      serviceLogger.error('Error getting security events', error as Error, { page, limitCount, filters });
      return { events: [], total: 0, hasMore: false };
    }
  }

  // Resolve security event
  public async resolveSecurityEvent(
    eventId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    try {
      const eventRef = doc(db, 'security_events', eventId);
      await updateDoc(eventRef, {
        resolved: true,
        resolvedBy,
        resolvedAt: serverTimestamp(),
        resolution
      });
    } catch (error) {
      serviceLogger.error('Error resolving security event', error as Error, { eventId, resolvedBy });
      throw error;
    }
  }

  // Get system metrics
  public async getSystemMetrics(
    dateFrom: Date,
    dateTo: Date
  ): Promise<SystemMetrics[]> {
    try {
      const q = query(
        collection(db, 'system_metrics'),
        where('timestamp', '>=', Timestamp.fromDate(dateFrom)),
        where('timestamp', '<=', Timestamp.fromDate(dateTo)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as SystemMetrics));
    } catch (error) {
      serviceLogger.error('Error getting system metrics', error as Error);
      return [];
    }
  }

  // Record system metrics
  public async recordSystemMetrics(metrics: Omit<SystemMetrics, 'timestamp'>): Promise<void> {
    try {
      const metricsRef = doc(collection(db, 'system_metrics'));
      const systemMetrics: Omit<SystemMetrics, 'id'> = {
        ...metrics,
        timestamp: serverTimestamp() as any
      };
      
      await setDoc(metricsRef, systemMetrics);
    } catch (error) {
      serviceLogger.error('Error recording system metrics', error as Error);
    }
  }

  // Get audit statistics
  public async getAuditStatistics(
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    securityEvents: number;
    criticalEvents: number;
    topActions: { action: string; count: number }[];
    topUsers: { userId: string; userName: string; count: number }[];
    topResources: { resource: string; count: number }[];
  }> {
    try {
      const logsQuery = query(
        collection(db, 'audit_logs'),
        where('timestamp', '>=', Timestamp.fromDate(dateFrom)),
        where('timestamp', '<=', Timestamp.fromDate(dateTo))
      );
      
      const eventsQuery = query(
        collection(db, 'security_events'),
        where('timestamp', '>=', Timestamp.fromDate(dateFrom)),
        where('timestamp', '<=', Timestamp.fromDate(dateTo))
      );
      
      const [logsSnapshot, eventsSnapshot] = await Promise.all([
        getDocs(logsQuery),
        getDocs(eventsQuery)
      ]);
      
      const logs = logsSnapshot.docs.map((doc: any) => doc.data() as AuditLog);
      const events = eventsSnapshot.docs.map((doc: any) => doc.data() as SecurityEvent);
      
      // Calculate statistics
      const totalActions = logs.length;
      const successfulActions = logs.filter(log => log.success).length;
      const failedActions = logs.filter(log => !log.success).length;
      const securityEvents = events.length;
      const criticalEvents = events.filter(event => event.severity === 'critical').length;
      
      // Top actions
      const actionCounts: Record<string, number> = {};
      logs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Top users
      const userCounts: Record<string, { userName: string; count: number }> = {};
      logs.forEach(log => {
        if (!userCounts[log.userId]) {
          userCounts[log.userId] = { userName: log.userName, count: 0 };
        }
        userCounts[log.userId].count++;
      });
      const topUsers = Object.entries(userCounts)
        .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Top resources
      const resourceCounts: Record<string, number> = {};
      logs.forEach(log => {
        resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
      });
      const topResources = Object.entries(resourceCounts)
        .map(([resource, count]) => ({ resource, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalActions,
        successfulActions,
        failedActions,
        securityEvents,
        criticalEvents,
        topActions,
        topUsers,
        topResources
      };
    } catch (error) {
      serviceLogger.error('Error getting audit statistics', error as Error);
      return {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        securityEvents: 0,
        criticalEvents: 0,
        topActions: [],
        topUsers: [],
        topResources: []
      };
    }
  }

  // Export audit logs
  public async exportAuditLogs(
    dateFrom: Date,
    dateTo: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs(1, 10000, { dateFrom, dateTo });
      
      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else {
        // Convert to CSV
        const headers = ['timestamp', 'userId', 'userEmail', 'userName', 'action', 'resource', 'resourceId', 'details', 'success', 'severity', 'category'];
        const csvContent = [
          headers.join(','),
          ...logs.map(log => 
            headers.map(header => 
              JSON.stringify((log as any)[header] || '')
            ).join(',')
          )
        ].join('\n');
        return csvContent;
      }
    } catch (error) {
      serviceLogger.error('Error exporting audit logs', error as Error, { format });
      throw error;
    }
  }

  // Private helper methods
  private getClientIP(): string {
    // In production, get from request headers
    return 'N/A';
  }

  private getSessionId(): string {
    return localStorage.getItem('sessionId') || 'N/A';
  }

  private async getLocationInfo(): Promise<{ country: string; city: string; region: string } | undefined> {
    // In production, get from IP geolocation service
    return {
      country: 'Bulgaria',
      city: 'Sofia',
      region: 'Sofia'
    };
  }

  private async sendSecurityAlert(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    // In production, send email/SMS alerts
    serviceLogger.warn('Critical security event detected', { 
      eventType: event.eventType, 
      severity: event.severity,
      userId: event.userId 
    });
  }
}

export const auditLoggingService = AuditLoggingService.getInstance();

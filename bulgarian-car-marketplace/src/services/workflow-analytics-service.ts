// Workflow Analytics Service - Track user behavior in sell workflow
// خدمة تحليلات سير العمل - تتبع سلوك المستخدم في عملية البيع

import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';

export interface WorkflowEvent {
  userId?: string;
  sessionId: string;
  step: number;
  stepName: string;
  action: 'entered' | 'exited' | 'completed' | 'abandoned' | 'error';
  duration?: number; // milliseconds
  data?: Record<string, any>;
  errorMessage?: string;
  timestamp: Timestamp;
}

export interface FunnelStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  conversionRate: number;
  stepStats: Array<{
    step: number;
    stepName: string;
    entered: number;
    completed: number;
    abandoned: number;
    averageDuration: number;
    dropOffRate: number;
  }>;
}

export class WorkflowAnalyticsService {
  private static collectionName = 'workflow_analytics';
  private static sessionId: string;

  /**
   * Initialize session
   */
  static initSession(): string {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return this.sessionId;
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string {
    if (!this.sessionId) {
      this.initSession();
    }
    return this.sessionId;
  }

  /**
   * Log workflow event
   */
  static async logEvent(
    step: number,
    stepName: string,
    action: WorkflowEvent['action'],
    options: {
      userId?: string;
      duration?: number;
      data?: Record<string, any>;
      errorMessage?: string;
    } = {}
  ): Promise<void> {
    try {
      const event: Omit<WorkflowEvent, 'timestamp'> = {
        userId: options.userId,
        sessionId: this.getSessionId(),
        step,
        stepName,
        action,
        duration: options.duration,
        data: options.data,
        errorMessage: options.errorMessage
      };

      await addDoc(collection(db, this.collectionName), {
        ...event,
        timestamp: serverTimestamp()
      });

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Analytics event logged', { step, stepName, action });
      }
    } catch (error) {
      // Don't break the main flow if analytics fails
      logger.warn('Analytics logging failed', { error: (error as Error).message, step, stepName, action });
    }
  }

  /**
   * Log step entered
   */
  static async logStepEntered(
    step: number,
    stepName: string,
    userId?: string
  ): Promise<number> {
    await this.logEvent(step, stepName, 'entered', { userId });
    return Date.now(); // Return start time for duration calculation
  }

  /**
   * Log step exited
   */
  static async logStepExited(
    step: number,
    stepName: string,
    startTime: number,
    userId?: string
  ): Promise<void> {
    const duration = Date.now() - startTime;
    await this.logEvent(step, stepName, 'exited', { userId, duration });
  }

  /**
   * Log step completed
   */
  static async logStepCompleted(
    step: number,
    stepName: string,
    data?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.logEvent(step, stepName, 'completed', { userId, data });
  }

  /**
   * Log step abandoned
   */
  static async logStepAbandoned(
    step: number,
    stepName: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(step, stepName, 'abandoned', { userId });
  }

  /**
   * Log error
   */
  static async logError(
    step: number,
    stepName: string,
    errorMessage: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(step, stepName, 'error', { userId, errorMessage });
  }

  /**
   * Get funnel statistics (for admin dashboard)
   */
  static async getFunnelStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelStats> {
    try {
      let q = query(collection(db, this.collectionName));

      if (startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
      }

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data() as WorkflowEvent);

      // Calculate stats
      const sessions = new Set(events.map(e => e.sessionId));
      const completedSessions = new Set(
        events
          .filter(e => e.action === 'completed' && e.step === 7)
          .map(e => e.sessionId)
      );
      const abandonedSessions = new Set(
        events
          .filter(e => e.action === 'abandoned')
          .map(e => e.sessionId)
      );

      const stepNames = [
        'Vehicle Type',
        'Seller Type',
        'Vehicle Data',
        'Equipment',
        'Images',
        'Pricing',
        'Contact',
        'Publish'
      ];

      const stepStats = stepNames.map((name, index) => {
        const stepEvents = events.filter(e => e.step === index);
        const entered = stepEvents.filter(e => e.action === 'entered').length;
        const completed = stepEvents.filter(e => e.action === 'completed').length;
        const abandoned = stepEvents.filter(e => e.action === 'abandoned').length;
        const durations = stepEvents
          .filter(e => e.action === 'exited' && e.duration)
          .map(e => e.duration!);
        const averageDuration = durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
        const dropOffRate = entered > 0 ? (abandoned / entered) * 100 : 0;

        return {
          step: index,
          stepName: name,
          entered,
          completed,
          abandoned,
          averageDuration,
          dropOffRate
        };
      });

      return {
        totalSessions: sessions.size,
        completedSessions: completedSessions.size,
        abandonedSessions: abandonedSessions.size,
        conversionRate: sessions.size > 0 
          ? (completedSessions.size / sessions.size) * 100 
          : 0,
        stepStats
      };
    } catch (error) {
      logger.error('Error getting funnel stats', error as Error);
      throw error;
    }
  }

  /**
   * Clear session (after completion or cancellation)
   */
  static clearSession(): void {
    this.sessionId = '';
  }
}

export default WorkflowAnalyticsService;


// Logger Service - Unified Logging System
// خدمة السجلات الموحدة - بديل لـ console.log/error/warn

/**
 * Unified Logger Service
 * 
 * Purpose:
 * - Replace all console.log/error/warn in production
 * - Send errors to Sentry (when configured)
 * - Log to Firebase Analytics (optional)
 * - Provide structured logging
 * 
 * Usage:
 * ```typescript
 * import { logger } from './services/logger-service';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Payment failed', error, { orderId: '456' });
 * logger.warn('Deprecated API used', { api: 'old-endpoint' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class LoggerService {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
  }

  /**
   * Set current user ID for logging context
   */
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Debug level - development only
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, undefined, context);
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  /**
   * Error level - errors that need attention
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
    
    // Send to error tracking service (Sentry)
    this.sendToErrorTracking(message, error, context);
  }

  /**
   * Fatal level - critical errors that stop execution
   */
  fatal(message: string, error?: Error, context?: LogContext) {
    this.log('fatal', message, error, context);
    
    // Send to error tracking service with high priority
    this.sendToErrorTracking(message, error, { ...context, severity: 'fatal' });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    // 1. Console output (development only or errors in production)
    if (this.isDevelopment || level === 'error' || level === 'fatal') {
      this.logToConsole(entry);
    }

    // 2. Send to Firebase Analytics (optional)
    if (this.isProduction && (level === 'error' || level === 'fatal')) {
      this.logToFirebase(entry);
    }

    // 3. Store critical logs locally (for debugging)
    if (level === 'error' || level === 'fatal') {
      this.storeLocally(entry);
    }
  }

  /**
   * Log to console with colors and formatting
   */
  private logToConsole(entry: LogEntry) {
    const { level, message, timestamp, context, error } = entry;
    
    const colors = {
      debug: '\x1b[36m',   // Cyan
      info: '\x1b[32m',    // Green
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      fatal: '\x1b[35m'    // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[level];
    
    const timeStr = timestamp.toISOString();
    const prefix = `${color}[${level.toUpperCase()}]${reset} ${timeStr}`;
    
    console.log(`${prefix} ${message}`);
    
    if (context && Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
    
    if (error) {
      console.error('Error:', error);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    }
  }

  /**
   * Send to Firebase Analytics
   */
  private async logToFirebase(entry: LogEntry) {
    try {
      // Only in production and when Firebase is available
      if (!this.isProduction) return;
      
      const { logEvent } = await import('firebase/analytics');
      const { analytics } = await import('../firebase/firebase-config');
      
      if (analytics) {
        logEvent(analytics, 'app_log', {
          level: entry.level,
          message: entry.message,
          user_id: entry.userId,
          session_id: entry.sessionId,
          ...entry.context
        });
      }
    } catch (error) {
      // Fail silently - don't break the app
      if (this.isDevelopment) {
        console.error('Failed to log to Firebase:', error);
      }
    }
  }

  /**
   * Send to error tracking service (Sentry)
   * This will only work when Sentry is configured
   */
  private sendToErrorTracking(
    message: string,
    error?: Error,
    context?: LogContext
  ) {
    try {
      // Check if Sentry is available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry;
        
        if (error) {
          Sentry.captureException(error, {
            tags: {
              logger: 'custom',
              ...context
            },
            extra: {
              message,
              userId: this.userId,
              sessionId: this.sessionId
            }
          });
        } else {
          Sentry.captureMessage(message, {
            level: 'error',
            tags: context,
            extra: {
              userId: this.userId,
              sessionId: this.sessionId
            }
          });
        }
      }
    } catch (err) {
      // Fail silently
      if (this.isDevelopment) {
        console.error('Failed to send to error tracking:', err);
      }
    }
  }

  /**
   * Store logs locally for debugging
   */
  private storeLocally(entry: LogEntry) {
    try {
      const key = 'app_error_logs';
      const stored = localStorage.getItem(key);
      const logs = stored ? JSON.parse(stored) : [];
      
      // Keep only last 50 logs
      logs.push({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        error: entry.error ? {
          message: entry.error.message,
          stack: entry.error.stack
        } : undefined
      });
      
      if (logs.length > 50) {
        logs.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      // LocalStorage might be full or disabled
      // Fail silently
    }
  }

  /**
   * Get stored logs (for debugging)
   */
  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_error_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs() {
    try {
      localStorage.removeItem('app_error_logs');
    } catch {
      // Fail silently
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Performance timing helper
   */
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * Performance timing end helper
   */
  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Singleton instance
export const logger = new LoggerService();

// Default export
export default logger;

// Helper type for typed logging
export type { LogLevel, LogContext, LogEntry };

// Logger Service - Unified Logging System
// خدمة السجلات الموحدة - بديل لـ console.log/error/warn
// (no React imports needed in logger-service)

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
  [key: string]: string | number | boolean | null | undefined | unknown;
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

// ==================== ERROR TRACKING INTEGRATION ====================

export function sendToErrorTracking(
  message: string,
  error?: Error,
  context?: Record<string, unknown>,
  extra?: Record<string, unknown>
) {
  try {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      if (error) {
        Sentry.captureException(error, {
          tags: { logger: 'custom', ...(context || {}) },
          extra: extra || {},
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          tags: context,
          extra: extra || {},
        });
      }
    }
  } catch (err) {
    // Silent failure
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Failed to send to error tracking:', err);
    }
  }
}

// ==================== LOCAL STORAGE HELPERS ====================

export interface StoredLogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const STORAGE_KEY = 'app_error_logs';

export function storeLocally(entry: StoredLogEntry) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const logs: StoredLogEntry[] = stored ? JSON.parse(stored) : [];
    logs.push(entry);
    if (logs.length > 50) logs.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export function getStoredLogs(): StoredLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearStoredLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ==================== SERVICE LOGGER WRAPPER ====================

export const serviceLogger = {
  /**
   * Log error - Always logged
   */
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    logger.error(message, error, context);
  },

  /**
   * Log info - Production safe
   */
  info: (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
  },

  /**
   * Log warning - Production safe
   */
  warn: (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  },

  /**
   * Log debug - Development only
   */
  debug: (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
  },

  /**
   * Log fatal - Critical errors
   */
  fatal: (message: string, error?: Error, context?: Record<string, any>) => {
    logger.fatal(message, error, context);
  },
};

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

class LoggerService {
  private static instance: LoggerService | null = null;
  private isDevelopment: boolean;
  private isProduction: boolean;
  private sessionId: string;
  private userId: string | null = null;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
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
    sendToErrorTracking(message, error, context, { userId: this.userId || undefined, sessionId: this.sessionId });
  }

  /**
   * Fatal level - critical errors that stop execution
   */
  fatal(message: string, error?: Error, context?: LogContext) {
    this.log('fatal', message, error, context);
    // Send to error tracking service with high priority
    sendToErrorTracking(message, error, { ...context, severity: 'fatal' }, { userId: this.userId || undefined, sessionId: this.sessionId });
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
      storeLocally({
        level,
        message,
        timestamp: entry.timestamp.toISOString(),
        context,
        error: entry.error ? { message: entry.error.message, stack: entry.error.stack } : undefined,
      });
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
    // ✅ FIX: Prevent "Missing or insufficient permissions" errors
    try {
      // Only in production and when Firebase is available
      if (!this.isProduction) return;
      
      // ✅ NEW: Check if user is authenticated first
      // Analytics events from guest users may fail silently
      const { auth } = await import('../firebase/firebase-config');
      if (!auth?.currentUser) {
        // Silent return - guest users don't send analytics
        // This prevents "Missing or insufficient permissions" errors
        return;
      }
      
      const { logEvent } = await import('firebase/analytics');
      const { analytics } = await import('../firebase/firebase-config');
      
      if (analytics) {
        // ✅ FIX: Use custom event name instead of 'app_log'
        // Truncate message to prevent data size issues
        logEvent(analytics, 'custom_app_log', {
          level: entry.level,
          message: entry.message.substring(0, 100), // Max 100 chars
          user_id: entry.userId,
          session_id: entry.sessionId,
          // ✅ Flatten context to avoid nested objects
          ...(entry.context && typeof entry.context === 'object' 
            ? Object.fromEntries(
                Object.entries(entry.context)
                  .filter(([_, v]) => typeof v !== 'object')
                  .slice(0, 5) // Max 5 context fields
              )
            : {})
        });
      }
    } catch (error) {
      // ✅ CRITICAL: Fail silently - logging should NEVER break the app
      // Don't log this error to avoid infinite loop
      // Silent failure is acceptable for analytics
    }
  }

  /**
   * Get stored logs (for debugging)
   */
  getStoredLogs(): LogEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem('bm_logger_buffer');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as LogEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (this.isDevelopment) {
        console.warn('Failed to read stored logs', error);
      }
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('bm_logger_buffer');
    } catch (error) {
      if (this.isDevelopment) {
        console.warn('Failed to clear stored logs', error);
      }
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

// Export singleton instance (use getInstance for proper singleton)
export const logger = LoggerService.getInstance();

// Also export class for type checking
export { LoggerService };

// Default export
export default logger;

// Helper type for typed logging
export type { LogLevel, LogContext, LogEntry };

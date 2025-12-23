"use strict";
// Logger Service - Unified Logging System
// خدمة السجلات الموحدة - بديل لـ console.log/error/warn
// (no React imports needed in logger-service)
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = exports.logger = exports.serviceLogger = exports.clearStoredLogs = exports.getStoredLogs = exports.storeLocally = exports.sendToErrorTracking = void 0;
// ==================== ERROR TRACKING INTEGRATION ====================
function sendToErrorTracking(message, error, context, extra) {
    try {
        if (typeof window !== 'undefined' && window.Sentry) {
            const Sentry = window.Sentry;
            if (error) {
                Sentry.captureException(error, {
                    tags: Object.assign({ logger: 'custom' }, (context || {})),
                    extra: extra || {},
                });
            }
            else {
                Sentry.captureMessage(message, {
                    level: 'error',
                    tags: context,
                    extra: extra || {},
                });
            }
        }
    }
    catch (err) {
        // Silent failure
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Failed to send to error tracking:', err);
        }
    }
}
exports.sendToErrorTracking = sendToErrorTracking;
const STORAGE_KEY = 'app_error_logs';
function storeLocally(entry) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const logs = stored ? JSON.parse(stored) : [];
        logs.push(entry);
        if (logs.length > 50)
            logs.shift();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
    catch (_a) {
        // ignore
    }
}
exports.storeLocally = storeLocally;
function getStoredLogs() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
    catch (_a) {
        return [];
    }
}
exports.getStoredLogs = getStoredLogs;
function clearStoredLogs() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    }
    catch (_a) {
        // ignore
    }
}
exports.clearStoredLogs = clearStoredLogs;
// ==================== SERVICE LOGGER WRAPPER ====================
exports.serviceLogger = {
    /**
     * Log error - Always logged
     */
    error: (message, error, context) => {
        exports.logger.error(message, error, context);
    },
    /**
     * Log info - Production safe
     */
    info: (message, context) => {
        exports.logger.info(message, context);
    },
    /**
     * Log warning - Production safe
     */
    warn: (message, context) => {
        exports.logger.warn(message, context);
    },
    /**
     * Log debug - Development only
     */
    debug: (message, context) => {
        exports.logger.debug(message, context);
    },
    /**
     * Log fatal - Critical errors
     */
    fatal: (message, error, context) => {
        exports.logger.fatal(message, error, context);
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
    constructor() {
        this.userId = null;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isProduction = process.env.NODE_ENV === 'production';
        this.sessionId = this.generateSessionId();
    }
    static getInstance() {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }
    /**
     * Set current user ID for logging context
     */
    setUserId(userId) {
        this.userId = userId;
    }
    /**
     * Debug level - development only
     */
    debug(message, context) {
        if (this.isDevelopment) {
            this.log('debug', message, undefined, context);
        }
    }
    /**
     * Info level - general information
     */
    info(message, context) {
        this.log('info', message, undefined, context);
    }
    /**
     * Warning level - something unexpected but not critical
     */
    warn(message, context) {
        this.log('warn', message, undefined, context);
    }
    /**
     * Error level - errors that need attention
     */
    error(message, error, context) {
        this.log('error', message, error, context);
        // Send to error tracking service (Sentry)
        sendToErrorTracking(message, error, context, { userId: this.userId || undefined, sessionId: this.sessionId });
    }
    /**
     * Fatal level - critical errors that stop execution
     */
    fatal(message, error, context) {
        this.log('fatal', message, error, context);
        // Send to error tracking service with high priority
        sendToErrorTracking(message, error, Object.assign(Object.assign({}, context), { severity: 'fatal' }), { userId: this.userId || undefined, sessionId: this.sessionId });
    }
    /**
     * Core logging method
     */
    log(level, message, error, context) {
        const entry = {
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
    logToConsole(entry) {
        const { level, message, timestamp, context, error } = entry;
        const colors = {
            debug: '\x1b[36m',
            info: '\x1b[32m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            fatal: '\x1b[35m' // Magenta
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
    async logToFirebase(entry) {
        try {
            // Only in production and when Firebase is available
            if (!this.isProduction)
                return;
            const { logEvent } = await Promise.resolve().then(() => require('firebase/analytics'));
            const { analytics } = await Promise.resolve().then(() => require('../firebase/firebase-config'));
            if (analytics) {
                logEvent(analytics, 'app_log', Object.assign({ level: entry.level, message: entry.message, user_id: entry.userId, session_id: entry.sessionId }, entry.context));
            }
        }
        catch (error) {
            // Fail silently - don't break the app
            if (this.isDevelopment) {
                console.error('Failed to log to Firebase:', error);
            }
        }
    }
    /**
     * Get stored logs (for debugging)
     */
    getStoredLogs() {
        // Return empty array for now - can be implemented with local storage later
        return [];
    }
    /**
     * Clear stored logs
     */
    clearStoredLogs() {
        // No-op for now - can be implemented with local storage later
    }
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Performance timing helper
     */
    time(label) {
        if (this.isDevelopment) {
            console.time(label);
        }
    }
    /**
     * Performance timing end helper
     */
    timeEnd(label) {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }
}
exports.LoggerService = LoggerService;
LoggerService.instance = null;
// Export singleton instance (use getInstance for proper singleton)
exports.logger = LoggerService.getInstance();
// Default export
exports.default = exports.logger;
//# sourceMappingURL=logger-service.js.map
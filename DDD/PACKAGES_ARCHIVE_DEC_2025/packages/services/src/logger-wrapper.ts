/**
 * Service Logger Wrapper
 * استخدم هذا بدلاً من console في جميع Services
 */

import { logger } from './logger-service';

/**
 * Service Logger Wrapper
 * 
 * Usage in Services:
 * ```typescript
 * import { serviceLogger } from './logger-wrapper';
 * 
 * try {
 *   // ... code
 * } catch (error) {
 *   serviceLogger.error('Operation failed', error as Error, { 
 *     userId, 
 *     operation: 'fetchData' 
 *   });
 * }
 * ```
 */

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
  }
};

// Export for backward compatibility
export default serviceLogger;

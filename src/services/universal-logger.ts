/**
 * Universal Error Handler Wrapper
 * يلتف حول logger.error لقبول unknown types
 */

import { logger as baseLogger } from '@/services/logger-service';
import { normalizeError } from '@/utils/error-helpers';

export const logger = {
  /**
   * Enhanced error logging that accepts unknown types
   */
  error: (message: string, error?: unknown, context?: any) => {
    const normalizedError = error ? normalizeError(error) : undefined;
    return baseLogger.error(message, normalizedError, context);
  },
  
  /**
   * Enhanced warn logging
   */
  warn: (message: string, error?: unknown, context?: any) => {
    const normalizedError = error ? normalizeError(error) : undefined;
    return baseLogger.warn(message, {
      ...(context || {}),
      ...(normalizedError ? { error: normalizedError } : {}),
    });
  },
  
  /**
   * Pass through other methods
   */
  info: (message: string, context?: any) => baseLogger.info(message, context),
  debug: (message: string, context?: any) => baseLogger.debug(message, context),
};

export default logger;

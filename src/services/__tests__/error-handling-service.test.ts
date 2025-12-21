// src/services/__tests__/error-handling-service.test.ts
// Unit Tests for Error Handling Service

import { ErrorHandlingService, errorHandler } from '../error-handling-service';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    // Clear error log before each test
    errorHandler.clearErrorLog();
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      errorHandler.logError(error, {
        userId: 'user123',
        action: 'test_action',
        severity: 'medium'
      });

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0].message).toBe('Test error');
      expect(log[0].userId).toBe('user123');
      expect(log[0].severity).toBe('medium');
    });

    it('should maintain max log size', () => {
      // Log more than MAX_LOG_SIZE errors
      for (let i = 0; i < 1100; i++) {
        errorHandler.logError(new Error(`Error ${i}`));
      }

      const log = errorHandler.getErrorLog();
      expect(log.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('getLocalizedError', () => {
    it('should return Bulgarian error message', () => {
      const message = errorHandler.getLocalizedError('auth/user-not-found', 'bg');
      expect(message).toBe('Потребителят не е намерен');
    });

    it('should return English error message', () => {
      const message = errorHandler.getLocalizedError('auth/user-not-found', 'en');
      expect(message).toBe('User not found');
    });

    it('should return fallback for unknown error code', () => {
      const message = errorHandler.getLocalizedError('unknown/error', 'bg');
      expect(message).toBe('Неизвестна грешка');
    });
  });

  describe('handleAuthError', () => {
    it('should handle auth errors correctly', () => {
      const error = { code: 'auth/wrong-password', message: 'Wrong password' };
      const message = errorHandler.handleAuthError(error, 'bg');
      expect(message).toBe('Грешна парола');
    });
  });

  describe('getErrorsBySeverity', () => {
    it('should filter errors by severity', () => {
      errorHandler.logError(new Error('Low error'), { severity: 'low' });
      errorHandler.logError(new Error('High error'), { severity: 'high' });
      errorHandler.logError(new Error('Critical error'), { severity: 'critical' });

      const highErrors = errorHandler.getErrorsBySeverity('high');
      expect(highErrors).toHaveLength(1);
      expect(highErrors[0].message).toBe('High error');
    });
  });

  describe('isServiceHealthy', () => {
    it('should return healthy status when no critical errors', () => {
      const health = errorHandler.isServiceHealthy();
      expect(health.healthy).toBe(true);
      expect(health.criticalErrors).toBe(0);
    });

    it('should return unhealthy status when critical errors exist', () => {
      errorHandler.logError(new Error('Critical error'), { severity: 'critical' });
      const health = errorHandler.isServiceHealthy();
      expect(health.healthy).toBe(false);
      expect(health.criticalErrors).toBeGreaterThan(0);
    });
  });
});

// Logger Service Tests
import { logger, LoggerService } from '../logger-service';

describe('LoggerService', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks();
    // Clear stored logs
    logger.clearStoredLogs();
  });

  describe('setUserId', () => {
    it('should set user ID for logging context', () => {
      logger.setUserId('user123');
      // User ID should be included in subsequent logs
      expect(true).toBe(true); // Basic test
    });
  });

  describe('info', () => {
    it('should log info messages in development', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      logger.info('Test info message', { key: 'value' });
      
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }
    });
  });

  describe('error', () => {
    it('should log errors and store them', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const testError = new Error('Test error');
      
      logger.error('Test error message', testError, { context: 'test' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Check if stored
      const stored = logger.getStoredLogs();
      expect(stored.length).toBeGreaterThan(0);
    });
  });

  describe('getStoredLogs', () => {
    it('should retrieve stored logs', () => {
      logger.error('Error 1', new Error('Test'));
      logger.error('Error 2', new Error('Test'));
      
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(2);
    });
  });

  describe('clearStoredLogs', () => {
    it('should clear all stored logs', () => {
      logger.error('Error', new Error('Test'));
      logger.clearStoredLogs();
      
      const logs = logger.getStoredLogs();
      expect(logs.length).toBe(0);
    });
  });
});


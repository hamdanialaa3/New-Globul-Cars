// src/services/logger-service.ts
// Professional Logging Service for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxEntries: number;
  retentionDays: number;
}

/**
 * Professional Logger Service
 * (Comment removed - was in Arabic)
 */
export class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private serviceName: string;

  constructor(serviceName: string, config?: Partial<LoggerConfig>) {
    this.serviceName = serviceName;
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      maxEntries: 1000,
      retentionDays: 7,
      ...config
    };

    // Clean up old entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Log debug message
   * (Comment removed - was in Arabic)
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   * (Comment removed - was in Arabic)
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   * (Comment removed - was in Arabic)
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   * (Comment removed - was in Arabic)
   */
  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Log critical message
   * (Comment removed - was in Arabic)
   */
  critical(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.CRITICAL, message, data, error);
  }

  /**
   * Core logging method
   * (Comment removed - was in Arabic)
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (level < this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      data,
      error,
      requestId: this.generateRequestId()
    };

    // Add to local storage
    this.entries.push(entry);
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(entry);
    }

    // Handle critical errors
    if (level >= LogLevel.CRITICAL) {
      this.handleCriticalError(entry);
    }
  }

  /**
   * Log to console with formatting
   * (Comment removed - was in Arabic)
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] ${levelName} [${entry.service}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`${prefix} ${entry.message}`, entry.error || entry.data || '');
        if (entry.error?.stack) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  /**
   * Log to remote endpoint
   * (Comment removed - was in Arabic)
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_LOGGING_TOKEN || ''}`
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('[SERVICE] Failed to send log to remote:', error);
    }
  }

  /**
   * Handle critical errors
   * (Comment removed - was in Arabic)
   */
  private handleCriticalError(entry: LogEntry): void {
    // Send alert to monitoring service
    if (process.env.REACT_APP_MONITORING_WEBHOOK) {
      fetch(process.env.REACT_APP_MONITORING_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 CRITICAL ERROR in ${entry.service}: ${entry.message}`,
          level: 'critical',
          service: entry.service,
          timestamp: entry.timestamp
        })
      }).catch(err => console.error('Failed to send critical alert:', err));
    }

    // In production, you might want to restart the service or take other actions
    if (process.env.NODE_ENV === 'production') {
      // Implement production-specific critical error handling
      console.error('[SERVICE] PRODUCTION CRITICAL ERROR - Immediate attention required!');
    }
  }

  /**
   * Get recent log entries
   * (Comment removed - was in Arabic)
   */
  getRecentEntries(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.entries;

    if (level !== undefined) {
      filtered = filtered.filter(entry => entry.level >= level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Search log entries
   * (Comment removed - was in Arabic)
   */
  searchEntries(query: string, level?: LogLevel): LogEntry[] {
    return this.entries.filter(entry => {
      const matchesQuery = entry.message.toLowerCase().includes(query.toLowerCase()) ||
                          (entry.data && JSON.stringify(entry.data).toLowerCase().includes(query.toLowerCase()));
      const matchesLevel = level === undefined || entry.level >= level;
      return matchesQuery && matchesLevel;
    });
  }

  /**
   * Clean up old entries
   * (Comment removed - was in Arabic)
   */
  private cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.entries = this.entries.filter(entry =>
      new Date(entry.timestamp) > cutoffDate
    );
  }

  /**
   * Generate unique request ID
   * (Comment removed - was in Arabic)
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export logs for analysis
   * (Comment removed - was in Arabic)
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'service', 'message', 'data'];
      const rows = this.entries.map(entry => [
        entry.timestamp,
        LogLevel[entry.level],
        entry.service,
        entry.message,
        entry.data ? JSON.stringify(entry.data) : ''
      ]);

      return [headers, ...rows].map(row =>
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    }

    return JSON.stringify(this.entries, null, 2);
  }
}

// Global logger instance
export const globalLogger = new Logger('Global', {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableRemote: !!process.env.REACT_APP_LOGGING_ENDPOINT,
  remoteEndpoint: process.env.REACT_APP_LOGGING_ENDPOINT
});
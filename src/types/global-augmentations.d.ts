/**
 * Global Type Augmentation
 * يعيد تعريف الأنواع الشاملة لتجنب أخطاء TypeScript
 */

declare global {
  interface Array<T> {
    /** Helper method for safe access */
    at(index: number): T | undefined;
  }
  
  interface Error {
    /** Optional error code */
    code?: string | number;
  }
}

// Extend global types to accept unknown in common patterns
declare module '@/services/logger-service' {
  interface ILogger {
    error(message: string, error?: Error | unknown, context?: any): void;
    warn(message: string, error?: Error | unknown, context?: any): void;
  }
}

export {};

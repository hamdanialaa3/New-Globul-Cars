// TypeScript augmentation to relax logger method signatures across the app
// This matches real-world usage: error(message, error?) OR error(message, context?)

declare module '@/services/logger-service' {
  // Keep context permissive to avoid leaking types across callers
  export interface LogContext {
    [key: string]: unknown;
  }

  export const serviceLogger: {
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (
      message: string,
      errorOrContext?: unknown,
      context?: LogContext
    ) => void;
    debug: (message: string, context?: LogContext) => void;
  };

  export const logger: {
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (
      message: string,
      errorOrContext?: unknown,
      context?: LogContext
    ) => void;
    debug: (message: string, context?: LogContext) => void;
  };

  // Preserve default export if present
  const _default: typeof logger;
  export default _default;
}

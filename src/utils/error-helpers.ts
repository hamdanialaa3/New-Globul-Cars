/**
 * Error Handling Helpers
 * Utilities for normalizing unknown errors to Error type
 */

/**
 * Normalize unknown error to Error instance
 * تحويل الخطأ من نوع unknown إلى Error
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      const err = new Error(error.message);
      if ('code' in error) {
        (err as any).code = error.code;
      }
      if ('stack' in error) {
        err.stack = String(error.stack);
      }
      return err;
    }
  }
  
  return new Error('Unknown error occurred');
}

/**
 * Get error message from unknown error
 * استخراج رسالة الخطأ من unknown error
 */
export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}

/**
 * Get error code from unknown error (if exists)
 * استخراج كود الخطأ من unknown error
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  return undefined;
}

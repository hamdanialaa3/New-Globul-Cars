/**
 * Type Guards Utility
 * حل مشكلة أخطاء TypeScript للـ unknown types
 */

/**
 * Check if value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Convert unknown error to Error object
 */
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  return new Error('Unknown error occurred');
}

/**
 * Check if value has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

/**
 * Safely get error message
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (hasProperty(error, 'message')) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Safely get error code
 */
export function getErrorCode(error: unknown): string | undefined {
  if (hasProperty(error, 'code')) {
    return String(error.code);
  }
  return undefined;
}

/**
 * Check if value is a Firebase error with code
 */
export function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return hasProperty(error, 'code') && hasProperty(error, 'message');
}

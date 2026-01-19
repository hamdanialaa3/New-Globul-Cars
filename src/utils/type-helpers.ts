/**
 * Comprehensive Type Fixes
 * يضيف أنواع ناقصة للمتغيرات والمعاملات
 */

// 1. Generic Error Wrapper Types
export type ErrorLike = Error | unknown;

export function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error(String(error));
}

// 2. Generic Data Types for Common Patterns
export interface DataWithId {
  id?: string | number;
}

export interface DataWithName {
  name?: string;
  displayName?: string;
  text?: string;
}

export interface DataWithLocation {
  locationData?: {
    cityName?: string;
    regionName?: string;
  };
  location?: {
    city?: string;
    region?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DataWithError {
  error?: Error | null;
  message?: string;
}

// 3. Safe Data Access Helpers
export function safeAccess<T, K extends PropertyKey>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as any)[key];
  }
  return defaultValue;
}

export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === undefined) return [];
  return [value];
}

export function ensureString(value: unknown, defaultValue = ''): string {
  if (typeof value === 'string') return value;
  return defaultValue;
}

export function ensureNumber(value: unknown, defaultValue = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// 4. Type Guards
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

// 5. Assertion Helpers
export function assertNonNull<T>(value: T | null | undefined, message = 'Value is null or undefined'): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}

export function assertType<T>(value: unknown, type: string): T {
  if (typeof value !== type) {
    throw new Error(`Expected ${type} but got ${typeof value}`);
  }
  return value as T;
}

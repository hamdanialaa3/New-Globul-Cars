/**
 * Timestamp Converter Utilities
 * Phase 2 (P2.1): Reduce duplication in timestamp conversions
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Convert various timestamp formats to Date
 */
export function convertTimestamp(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds !== undefined) {
    // Firestore Timestamp object
    return new Date(ts.seconds * 1000);
  }
  if (typeof ts === 'number') return new Date(ts);
  if (typeof ts === 'string') return new Date(ts);
  
  return new Date();
}

/**
 * Convert multiple timestamp fields in an object
 */
export function convertTimestamps<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = convertTimestamp(result[field]) as any;
    }
  }
  
  return result;
}

/**
 * Convert Date to Firestore Timestamp
 */
export function toTimestamp(date: Date | string | number): Timestamp {
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  if (typeof date === 'number') {
    return Timestamp.fromMillis(date);
  }
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  return Timestamp.now();
}

/**
 * Safely convert timestamp with fallback
 */
export function safeConvertTimestamp(ts: any, fallback: Date = new Date()): Date {
  try {
    return convertTimestamp(ts);
  } catch (error) {
    return fallback;
  }
}


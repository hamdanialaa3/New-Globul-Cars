/**
 * Unified Firebase Data Service
 * 
 * This module consolidates Firebase-related services:
 * - firebase-real-data-service
 * - firebase-data-operations
 * 
 * Purpose: Provide a single entry point for all Firebase data operations
 * without breaking existing imports.
 * 
 * @module services/firebase
 */

// Re-export everything from firebase-real-data-service
export * from '../firebase-real-data-service';

// Re-export everything from firebase-data-operations
export * from '../firebase-data-operations';

// Re-export types
export type {
  FirebaseDataType,
  FirebaseQueryOptions,
  FirebaseUpdateOptions
} from '../firebase-real-data-service';

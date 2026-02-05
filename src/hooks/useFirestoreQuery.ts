/**
 * 🔒 useFirestoreQuery - Unified Safe Firestore Hook
 * ================================================
 * 
 * This hook solves the critical memory leak problem in the application.
 * 
 * ⚠️ CRITICAL: Use this hook instead of direct onSnapshot calls
 * to prevent memory leaks and ensure proper cleanup.
 * 
 * Features:
 * - Automatic listener cleanup on unmount
 * - isActive guard to prevent state updates after unmount
 * - Error handling with logger
 * - Loading states
 * - TypeScript generics for type safety
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date February 4, 2026
 * @constitution Compliant with Koli One Constitution
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  query,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Query,
  DocumentReference,
  Unsubscribe,
  FirestoreError,
  CollectionReference,
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';

// ==================== TYPES ====================

export interface UseFirestoreQueryOptions<T> {
  /** Transform raw Firestore data to your type */
  transform?: (data: DocumentData, id: string) => T;
  /** Enable/disable the query (useful for conditional fetching) */
  enabled?: boolean;
  /** Callback when data changes */
  onData?: (data: T[]) => void;
  /** Callback on error */
  onError?: (error: FirestoreError) => void;
}

export interface UseFirestoreDocOptions<T> {
  /** Transform raw Firestore data to your type */
  transform?: (data: DocumentData, id: string) => T;
  /** Enable/disable the listener */
  enabled?: boolean;
  /** Callback when data changes */
  onData?: (data: T | null) => void;
  /** Callback on error */
  onError?: (error: FirestoreError) => void;
}

export interface FirestoreQueryResult<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
  /** Force refresh the data */
  refresh: () => void;
}

export interface FirestoreDocResult<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
  exists: boolean;
  /** Force refresh the data */
  refresh: () => void;
}

// ==================== COLLECTION QUERY HOOK ====================

/**
 * 🔥 useFirestoreQuery
 * 
 * Safe hook for listening to Firestore collection queries.
 * Automatically cleans up listeners and prevents memory leaks.
 * 
 * @example
 * ```tsx
 * const { data: cars, loading, error } = useFirestoreQuery<Car>(
 *   'passenger_cars',
 *   [where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(20)],
 *   { transform: (data, id) => ({ id, ...data } as Car) }
 * );
 * ```
 */
export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseFirestoreQueryOptions<T> = {}
): FirestoreQueryResult<T> {
  const {
    transform = (data, id) => ({ id, ...data } as unknown as T),
    enabled = true,
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // 🔒 CRITICAL: isActive guard to prevent updates after unmount
  const isActiveRef = useRef(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const refreshKeyRef = useRef(0);

  const refresh = useCallback(() => {
    refreshKeyRef.current += 1;
    setLoading(true);
  }, []);

  useEffect(() => {
    // Reset active flag on mount
    isActiveRef.current = true;

    // Skip if disabled
    if (!enabled) {
      setData([]);
      setLoading(false);
      return;
    }

    // Clean up previous listener if exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setLoading(true);
    setError(null);

    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 
        ? query(collectionRef, ...constraints) 
        : query(collectionRef);

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          // 🔒 CRITICAL: Check if component is still mounted
          if (!isActiveRef.current) {
            logger.warn(`[useFirestoreQuery] Skipped update for unmounted component: ${collectionName}`);
            return;
          }

          const items = snapshot.docs.map((doc) => 
            transform(doc.data(), doc.id)
          );

          setData(items);
          setLoading(false);
          setError(null);

          if (onData) {
            onData(items);
          }
        },
        (err) => {
          // 🔒 CRITICAL: Check if component is still mounted
          if (!isActiveRef.current) return;

          logger.error(`[useFirestoreQuery] Error in ${collectionName}:`, err);
          setError(err);
          setLoading(false);

          if (onError) {
            onError(err);
          }
        }
      );
    } catch (err) {
      if (!isActiveRef.current) return;
      
      logger.error(`[useFirestoreQuery] Failed to setup listener for ${collectionName}:`, err);
      setLoading(false);
      setError(err as FirestoreError);
    }

    // 🔒 CRITICAL: Cleanup function
    return () => {
      isActiveRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [collectionName, JSON.stringify(constraints), enabled, refreshKeyRef.current]);

  return { data, loading, error, refresh };
}

// ==================== DOCUMENT HOOK ====================

/**
 * 🔥 useFirestoreDoc
 * 
 * Safe hook for listening to a single Firestore document.
 * Automatically cleans up listeners and prevents memory leaks.
 * 
 * @example
 * ```tsx
 * const { data: user, loading, exists } = useFirestoreDoc<User>(
 *   'users',
 *   userId,
 *   { transform: (data, id) => ({ id, ...data } as User) }
 * );
 * ```
 */
export function useFirestoreDoc<T = DocumentData>(
  collectionName: string,
  documentId: string | undefined | null,
  options: UseFirestoreDocOptions<T> = {}
): FirestoreDocResult<T> {
  const {
    transform = (data, id) => ({ id, ...data } as unknown as T),
    enabled = true,
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [exists, setExists] = useState(false);

  // 🔒 CRITICAL: isActive guard
  const isActiveRef = useRef(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const refreshKeyRef = useRef(0);

  const refresh = useCallback(() => {
    refreshKeyRef.current += 1;
    setLoading(true);
  }, []);

  useEffect(() => {
    isActiveRef.current = true;

    // Skip if disabled or no document ID
    if (!enabled || !documentId) {
      setData(null);
      setLoading(false);
      setExists(false);
      return;
    }

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);

      unsubscribeRef.current = onSnapshot(
        docRef,
        (snapshot) => {
          // 🔒 CRITICAL: Check if component is still mounted
          if (!isActiveRef.current) {
            logger.warn(`[useFirestoreDoc] Skipped update for unmounted component: ${collectionName}/${documentId}`);
            return;
          }

          if (snapshot.exists()) {
            const item = transform(snapshot.data()!, snapshot.id);
            setData(item);
            setExists(true);

            if (onData) {
              onData(item);
            }
          } else {
            setData(null);
            setExists(false);

            if (onData) {
              onData(null);
            }
          }

          setLoading(false);
          setError(null);
        },
        (err) => {
          if (!isActiveRef.current) return;

          logger.error(`[useFirestoreDoc] Error in ${collectionName}/${documentId}:`, err);
          setError(err);
          setLoading(false);

          if (onError) {
            onError(err);
          }
        }
      );
    } catch (err) {
      if (!isActiveRef.current) return;

      logger.error(`[useFirestoreDoc] Failed to setup listener for ${collectionName}/${documentId}:`, err);
      setLoading(false);
      setError(err as FirestoreError);
    }

    // 🔒 CRITICAL: Cleanup function
    return () => {
      isActiveRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [collectionName, documentId, enabled, refreshKeyRef.current]);

  return { data, loading, error, exists, refresh };
}

// ==================== CUSTOM QUERY HOOK ====================

/**
 * 🔥 useFirestoreCustomQuery
 * 
 * For advanced use cases where you need to pass a pre-built Query object.
 * 
 * @example
 * ```tsx
 * const myQuery = query(collection(db, 'cars'), where('make', '==', 'BMW'));
 * const { data } = useFirestoreCustomQuery<Car>(myQuery);
 * ```
 */
export function useFirestoreCustomQuery<T = DocumentData>(
  firestoreQuery: Query | null,
  options: UseFirestoreQueryOptions<T> = {}
): FirestoreQueryResult<T> {
  const {
    transform = (data, id) => ({ id, ...data } as unknown as T),
    enabled = true,
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const isActiveRef = useRef(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const refreshKeyRef = useRef(0);

  const refresh = useCallback(() => {
    refreshKeyRef.current += 1;
    setLoading(true);
  }, []);

  useEffect(() => {
    isActiveRef.current = true;

    if (!enabled || !firestoreQuery) {
      setData([]);
      setLoading(false);
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setLoading(true);
    setError(null);

    try {
      unsubscribeRef.current = onSnapshot(
        firestoreQuery,
        (snapshot) => {
          if (!isActiveRef.current) return;

          const items = snapshot.docs.map((doc) =>
            transform(doc.data(), doc.id)
          );

          setData(items);
          setLoading(false);
          setError(null);

          if (onData) {
            onData(items);
          }
        },
        (err) => {
          if (!isActiveRef.current) return;

          logger.error('[useFirestoreCustomQuery] Error:', err);
          setError(err);
          setLoading(false);

          if (onError) {
            onError(err);
          }
        }
      );
    } catch (err) {
      if (!isActiveRef.current) return;

      logger.error('[useFirestoreCustomQuery] Failed to setup listener:', err);
      setLoading(false);
      setError(err as FirestoreError);
    }

    return () => {
      isActiveRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [firestoreQuery, enabled, refreshKeyRef.current]);

  return { data, loading, error, refresh };
}

// ==================== EXPORTS ====================

export default {
  useFirestoreQuery,
  useFirestoreDoc,
  useFirestoreCustomQuery,
};

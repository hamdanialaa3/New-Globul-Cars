/**
 * Search Worker Hook
 * React hook for using search web worker
 * Provides non-blocking search operations
 * 
 * @example
 * const { search, results, loading } = useSearchWorker();
 * 
 * // Perform search
 * search(cars, { query: 'BMW', filters: { yearFrom: 2020 } });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CarListing } from '@/types/CarListing';

interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResults {
  results: CarListing[];
  count: number;
  processingTime?: number;
}

interface UseSearchWorkerReturn {
  search: (cars: CarListing[], params: SearchParams) => void;
  results: CarListing[];
  loading: boolean;
  error: string | null;
  count: number;
  processingTime: number;
}

/**
 * Hook for using search web worker
 */
export function useSearchWorker(): UseSearchWorkerReturn {
  const [results, setResults] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/search.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'SEARCH_RESULTS':
            setResults(payload.results);
            setCount(payload.count);
            setProcessingTime(payload.processingTime || 0);
            setLoading(false);
            setError(null);
            break;

          case 'FILTER_RESULTS':
            setResults(payload.results);
            setCount(payload.count);
            setLoading(false);
            setError(null);
            break;

          case 'SORT_RESULTS':
            setResults(payload.results);
            setLoading(false);
            setError(null);
            break;

          case 'ERROR':
            setError(payload.error);
            setLoading(false);
            break;

          default:
            console.warn('Unknown message type from worker:', type);
        }
      };

      workerRef.current.onerror = (err) => {
        setError(err.message);
        setLoading(false);
      };
    } catch (err) {
      console.error('Failed to initialize search worker:', err);
      setError('Failed to initialize search worker');
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Search function
  const search = useCallback((cars: CarListing[], params: SearchParams) => {
    if (!workerRef.current) {
      setError('Worker not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    workerRef.current.postMessage({
      type: 'SEARCH',
      payload: {
        cars,
        params,
        startTime: Date.now()
      }
    });
  }, []);

  return {
    search,
    results,
    loading,
    error,
    count,
    processingTime
  };
}

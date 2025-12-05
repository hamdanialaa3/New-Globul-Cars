// useAlgoliaSearch.ts
// Custom hook for Algolia search operations

import { useState, useCallback } from 'react';
import { carsIndex } from '../services/algolia/algolia-client';
import { logger } from '../services/logger-service';

interface UseAlgoliaSearchReturn {
  search: (query: string, filters?: any) => Promise<any>;
  loading: boolean;
  error: string | null;
  results: any[];
  totalResults: number;
}

export const useAlgoliaSearch = (): UseAlgoliaSearchReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (query: string, filters: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await carsIndex.search(query, {
        hitsPerPage: 20,
        filters: 'status:active',
        ...filters
      });

      setResults(response.hits);
      setTotalResults(response.nbHits);
      
      logger.info('Algolia search completed', {
        query,
        nbHits: response.nbHits,
        processingTimeMS: response.processingTimeMS
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      logger.error('Algolia search error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    loading,
    error,
    results,
    totalResults
  };
};

export default useAlgoliaSearch;


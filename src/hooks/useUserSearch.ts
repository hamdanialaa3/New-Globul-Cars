// src/hooks/useUserSearch.ts
// User Search Hook — manages search state, debounce, pagination, and filters

import { useState, useCallback, useRef, useEffect } from 'react';
import { userSearchService } from '@/services/search/user-search.service';
import type {
  UserSearchResult,
  UserSearchFilters,
  UserSearchSort,
} from '@/types/user-search.types';

interface UseUserSearchReturn {
  results: UserSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  filters: UserSearchFilters;
  sort: UserSearchSort;
  totalHits: number;
  totalPages: number;
  page: number;
  setQuery: (q: string) => void;
  setFilters: (f: UserSearchFilters) => void;
  setSort: (s: UserSearchSort) => void;
  loadMore: () => void;
  reset: () => void;
}

export function useUserSearch(debounceMs: number = 200): UseUserSearchReturn {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryRaw] = useState('');
  const [filters, setFilters] = useState<UserSearchFilters>({});
  const [sort, setSort] = useState<UserSearchSort>('relevance');
  const [page, setPage] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(0); // Simple generation-based cancellation
  const hasSearchedRef = useRef(false);

  const doSearch = useCallback(
    async (
      q: string,
      f: UserSearchFilters,
      s: UserSearchSort,
      p: number,
      append: boolean
    ) => {
      const gen = ++abortRef.current;
      setLoading(true);
      setError(null);

      try {
        const { hits, nbHits, nbPages } = await userSearchService.searchUsers(
          q,
          f,
          s,
          p
        );

        // Abort if a newer search was triggered
        if (gen !== abortRef.current) return;

        setResults(prev => (append ? [...prev, ...hits] : hits));
        setTotalHits(nbHits);
        setTotalPages(nbPages);
      } catch (err) {
        if (gen !== abortRef.current) return;
        setError((err as Error).message);
      } finally {
        if (gen === abortRef.current) setLoading(false);
      }
    },
    []
  );

  // Debounced search on query changes
  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      setPage(0);
      hasSearchedRef.current = true;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        doSearch(q, filters, sort, 0, false);
      }, debounceMs);
    },
    [filters, sort, debounceMs, doSearch]
  );

  // Immediate search on filter / sort changes
  useEffect(() => {
    // Skip on mount before any explicit search
    if (!hasSearchedRef.current) return;

    setPage(0);
    doSearch(query, filters, sort, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  const loadMore = useCallback(() => {
    if (page + 1 >= totalPages || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, filters, sort, nextPage, true);
  }, [page, totalPages, loading, query, filters, sort, doSearch]);

  const reset = useCallback(() => {
    setQueryRaw('');
    setFilters({});
    setSort('relevance');
    setPage(0);
    setResults([]);
    setTotalHits(0);
    setTotalPages(0);
    setError(null);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    results,
    loading,
    error,
    query,
    filters,
    sort,
    totalHits,
    totalPages,
    page,
    setQuery,
    setFilters,
    setSort,
    loadMore,
    reset,
  };
}

export default useUserSearch;

/**
 * 🔍 useSearchData — React hook for search page data
 * Connects the search page to the production Firestore service.
 * Handles: filter options loading, search execution, debouncing, pagination
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFavorites } from '../../../hooks/useFavorites';
import {
    getFilterOptions,
    searchCarsFromDB,
    getModelsForMake,
    detectMissingFields,
    DynamicFilterOptions,
    SearchRequest,
    SearchResponse,
    FirestoreCarResult,
} from './searchService';

// ─── Filter State ───
export interface SearchFiltersState {
    make: string;
    model: string;
    priceMin: string;
    priceMax: string;
    yearFrom: string;
    yearTo: string;
    mileageMax: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    condition: string;
    color: string;
    colorHex: string;
    city: string;
    sellerType: string;
    features: string[];
    sortBy: SearchRequest['sortBy'];
    page: number;
    perPage: number;
}

export const DEFAULT_FILTERS: SearchFiltersState = {
    make: '',
    model: '',
    priceMin: '',
    priceMax: '',
    yearFrom: '',
    yearTo: '',
    mileageMax: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    condition: '',
    color: '',
    colorHex: '',
    city: '',
    sellerType: '',
    features: [],
    sortBy: 'relevance',
    page: 1,
    perPage: 20,
};

export function useSearchData() {
    // ─── State ───
    const [filters, setFilters] = useState<SearchFiltersState>(DEFAULT_FILTERS);
    const [filterOptions, setFilterOptions] = useState<DynamicFilterOptions | null>(null);
    const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [missingFieldReports, setMissingFieldReports] = useState<any[]>([]);
    const { isFavorite, toggleFavorite: toggleFav, favorites: favList } = useFavorites();
    const favorites = new Set(favList.map(f => f.carId));
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const searchAbortRef = useRef<number>(0);

    // ─── Load filter options on mount ───
    useEffect(() => {
        let cancelled = false;
        async function loadOptions() {
            setIsLoadingOptions(true);
            try {
                const opts = await getFilterOptions();
                if (!cancelled) {
                    setFilterOptions(opts);
                    setError(null);
                }
            } catch (e: any) {
                logger.error('[useSearchData] Failed to load filter options', e);
                if (!cancelled) {
                    setError('Failed to load filter options. Please refresh.');
                }
            } finally {
                if (!cancelled) setIsLoadingOptions(false);
            }
        }
        loadOptions();
        return () => { cancelled = true; };
    }, []);

    // ─── Detect missing fields ───
    useEffect(() => {
        async function check() {
            try {
                const reports = await detectMissingFields();
                setMissingFieldReports(reports);
                if (reports.length > 0) {
                    logger.warn('[MISSING_FIELD_REPORTS]', undefined, { reports });
                }
            } catch (e) {
                // Non-blocking
            }
        }
        check();
    }, []);

    // ─── Convert filter state → SearchRequest ───
    const buildSearchRequest = useCallback((f: SearchFiltersState): SearchRequest => {
        return {
            make: f.make || undefined,
            model: f.model || undefined,
            priceMin: f.priceMin ? Number(f.priceMin) : undefined,
            priceMax: f.priceMax ? Number(f.priceMax) : undefined,
            yearFrom: f.yearFrom ? Number(f.yearFrom) : undefined,
            yearTo: f.yearTo ? Number(f.yearTo) : undefined,
            mileageMax: f.mileageMax ? Number(f.mileageMax) : undefined,
            fuelType: f.fuelType || undefined,
            transmission: f.transmission || undefined,
            bodyType: f.bodyType || undefined,
            condition: f.condition || undefined,
            color: f.color || undefined,
            colorHex: f.colorHex || undefined,
            city: f.city || undefined,
            sellerType: f.sellerType || undefined,
            features: f.features.length > 0 ? f.features : undefined,
            sortBy: f.sortBy,
            page: f.page,
            perPage: f.perPage,
        };
    }, []);

    // ─── Execute search ───
    const executeSearch = useCallback(async (f: SearchFiltersState) => {
        const searchId = ++searchAbortRef.current;
        setIsSearching(true);
        try {
            const req = buildSearchRequest(f);
            const res = await searchCarsFromDB(req);
            // Only update if this is the most recent search
            if (searchId === searchAbortRef.current) {
                setSearchResult(res);
                setError(null);

                // Log missing fields if present
                if (res.missingFieldsReport) {
                    logger.warn('[SearchResult] Missing fields detected', undefined, { report: res.missingFieldsReport });
                }
            }
        } catch (e: any) {
            logger.error('[useSearchData] Search failed', e);
            if (searchId === searchAbortRef.current) {
                setError('Search failed. Please try again.');
            }
        } finally {
            if (searchId === searchAbortRef.current) {
                setIsSearching(false);
            }
        }
    }, [buildSearchRequest]);

    // ─── Trigger search on filter change (debounced) ───
    useEffect(() => {
        if (isLoadingOptions) return; // wait for options first

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            executeSearch(filters);
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [filters, isLoadingOptions, executeSearch]);

    // ─── Load models when make changes ───
    useEffect(() => {
        if (!filters.make) {
            setAvailableModels([]);
            return;
        }
        let cancelled = false;
        getModelsForMake(filters.make).then((models) => {
            if (!cancelled) setAvailableModels(models);
        }).catch(() => {
            if (!cancelled) setAvailableModels([]);
        });
        return () => { cancelled = true; };
    }, [filters.make]);

    // ─── Filter update helpers ───
    const updateFilter = useCallback((key: keyof SearchFiltersState, value: any) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value, page: 1 }; // reset page on filter change
            // If make changes, reset model
            if (key === 'make') {
                next.model = '';
            }
            return next;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const setPage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const setSortBy = useCallback((sortBy: SearchRequest['sortBy']) => {
        setFilters(prev => ({ ...prev, sortBy, page: 1 }));
    }, []);

    const toggleFavorite = useCallback((carId: string, carData?: any) => {
        toggleFav(carId, carData);
    }, [toggleFav]);

    const clearFilter = useCallback((key: keyof SearchFiltersState) => {
        updateFilter(key, key === 'features' ? [] : '');
    }, [updateFilter]);

    // ─── Active filter pills ───
    const activeFilters = Object.entries(filters)
        .filter(([key, value]) => {
            if (['page', 'perPage', 'sortBy'].includes(key)) return false;
            if (key === 'features') return (value as string[]).length > 0;
            return !!value;
        })
        .map(([key, value]) => ({
            key: key as keyof SearchFiltersState,
            label: key,
            value: Array.isArray(value) ? value.join(', ') : String(value),
        }));

    return {
        // State
        filters,
        filterOptions,
        searchResult,
        availableModels,
        isLoadingOptions,
        isSearching,
        error,
        missingFieldReports,
        favorites,
        viewMode,
        activeFilters,

        // Actions
        updateFilter,
        resetFilters,
        setPage,
        setSortBy,
        toggleFavorite,
        setViewMode,
        clearFilter,
        setFilters,
    };
}

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveCanonicalBrand } from '@/services/brand-normalization';
import { SearchData } from '@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types';

/**
 * FilterContext
 * Central unified search/filter state with URL syncing.
 * لاستخدام حالة الفلاتر الموحدة مع مزامنة الرابط
 *
 * Scope (initial): make, model, price range, year range, city, fuelType, transmission.
 * Extend later to full AdvancedSearch when migrating all pages.
 */
export interface FilterState {
  make?: string; // canonical brand
  makeRaw?: string; // original user typed brand
  model?: string;
  priceFrom?: string;
  priceTo?: string;
  yearFrom?: string; // maps to firstRegistrationFrom
  yearTo?: string;   // maps to firstRegistrationTo
  city?: string;
  fuelType?: string;
  transmission?: string;
  text?: string; // free text / description search
}

export interface FilterContextValue {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  replaceFilters: (next: FilterState) => void;
  clearFilters: () => void;
  buildSearchParams: () => URLSearchParams;
  asSearchDataPartial: () => Partial<SearchData>;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export const useFilters = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within <FilterProvider />');
  return ctx;
};

// Mapping between filter keys and URL param keys
const URL_KEY_MAP: Record<string, string> = {
  make: 'mk',
  model: 'md',
  priceFrom: 'pf',
  priceTo: 'pt',
  yearFrom: 'yf',
  yearTo: 'yt',
  city: 'city',
  fuelType: 'fuel',
  transmission: 'tr',
  text: 'q'
};

// Reverse map for parsing
const REVERSE_URL_KEY_MAP: Record<string, keyof FilterState> = Object.entries(URL_KEY_MAP)
  .reduce((acc, [k, v]) => { acc[v] = k as keyof FilterState; return acc; }, {} as Record<string, keyof FilterState>);

interface ProviderProps { children: React.ReactNode; autoSync?: boolean; }

export const FilterProvider: React.FC<ProviderProps> = ({ children, autoSync = true }) => {
  const location = useLocation();
  // navigate reserved for future use when triggering route changes on filter update
  useNavigate();
  const [filters, setFilters] = useState<FilterState>({});
  const isFirstLoad = useRef(true);

  // Parse URL on mount / location change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next: FilterState = {};
    params.forEach((value, key) => {
      const mapped = REVERSE_URL_KEY_MAP[key];
      if (mapped) {
        next[mapped] = value;
        if (mapped === 'make') {
          next.makeRaw = value;
          next.make = resolveCanonicalBrand(value);
        }
      }
    });
    setFilters(prev => ({ ...prev, ...next }));
    isFirstLoad.current = false;
  }, [location.search]);

  // Build search params from current filters
  const buildSearchParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || key === 'makeRaw') return;
      const urlKey = URL_KEY_MAP[key];
      if (!urlKey) return;
      params.set(urlKey, value);
    });
    return params;
  }, [filters]);

  // Sync URL when filters change (debounced)
  useEffect(() => {
    if (!autoSync || isFirstLoad.current) return;
    const handle = setTimeout(() => {
      const params = buildSearchParams();
      const newSearch = params.toString();
      const base = location.pathname;
      const nextURL = newSearch ? `${base}?${newSearch}` : base;
      window.history.replaceState(null, '', nextURL);
    }, 300);
    return () => clearTimeout(handle);
  }, [filters, autoSync, buildSearchParams, location.pathname]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'make') {
        next.makeRaw = String(value || '');
        next.make = value ? resolveCanonicalBrand(String(value)) : '';
        // Clear dependent model when make changes
        next.model = '';
      }
      return next;
    });
  };

  const replaceFilters = (next: FilterState) => {
    setFilters(() => {
      if (next.make) {
        next.makeRaw = next.make;
        next.make = resolveCanonicalBrand(next.make);
      }
      return { ...next };
    });
  };

  const clearFilters = () => setFilters({});

  // Provide minimal partial SearchData for legacy services bridging
  const asSearchDataPartial = useCallback((): Partial<SearchData> => ({
    make: filters.make,
    model: filters.model,
    priceFrom: filters.priceFrom,
    priceTo: filters.priceTo,
    firstRegistrationFrom: filters.yearFrom,
    firstRegistrationTo: filters.yearTo,
    city: filters.city,
    fuelType: filters.fuelType,
    transmission: filters.transmission,
    searchDescription: filters.text
  }), [filters]);

  const value: FilterContextValue = useMemo(() => ({
    filters,
    updateFilter,
    replaceFilters,
    clearFilters,
    buildSearchParams,
    asSearchDataPartial
  }), [filters, buildSearchParams, asSearchDataPartial]);

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export default FilterContext;

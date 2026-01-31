/**
 * useHomepageFilters Hook
 * هوك فلاتر الصفحة الرئيسية
 * 
 * React hook for managing homepage section filters
 * 
 * @author Koli.one Team
 * @version 1.0.0
 * @date January 30, 2026
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { CarListing } from '../../types/CarListing';
import {
  homepageFilterService,
  filterUrlStateService,
  filterAnalyticsService,
  FilterCategory,
  FilterConfig,
  FilterState
} from '../../services/filters';
import { logger } from '../../services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

interface UseHomepageFiltersResult {
  // Data
  cars: CarListing[];
  totalCount: number;
  config: FilterConfig | null;
  
  // State
  loading: boolean;
  error: string | null;
  currentCategory: FilterCategory;
  filterState: FilterState;
  
  // Actions
  setCategory: (category: FilterCategory) => void;
  updateFilter: (key: keyof FilterState, value: unknown) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  selectPreset: (presetName: string) => void;
  
  // URL management
  shareableUrl: string;
  activeFilterCount: number;
  
  // Presets
  availablePresets: { name: string; label: { bg: string; en: string }; state: FilterState }[];
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useHomepageFilters(
  initialCategory: FilterCategory = 'all',
  sectionId?: number
): UseHomepageFiltersResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [cars, setCars] = useState<CarListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<FilterCategory>(initialCategory);
  const [filterState, setFilterState] = useState<FilterState>({});

  // Get config for current category
  const config = useMemo(() => {
    return homepageFilterService.getFilterConfig(currentCategory);
  }, [currentCategory]);

  // Parse initial state from URL
  useEffect(() => {
    const urlState = filterUrlStateService.parseFromUrl(searchParams);
    if (Object.keys(urlState).length > 0) {
      setFilterState(urlState);
      const detectedCategory = filterUrlStateService.detectCategoryFromState(urlState);
      setCurrentCategory(detectedCategory);
      
      // Track deep link opened
      filterAnalyticsService.trackDeepLinkOpened(
        window.location.href,
        urlState
      );
    }
  }, []);

  // Fetch cars when category or filters change
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.info('Fetching cars for homepage section', { 
          category: currentCategory, 
          filterState 
        });

        let fetchedCars: CarListing[];
        
        if (sectionId) {
          // Use section-based data fetching
          const sectionData = await homepageFilterService.getHomepageSectionData(sectionId, 20);
          fetchedCars = sectionData.cars;
        } else {
          // Use category-based data fetching
          fetchedCars = await homepageFilterService.fetchCarsByCategory(currentCategory, 50);
        }

        setCars(fetchedCars);
        setTotalCount(fetchedCars.length);

        // Track filters applied
        filterAnalyticsService.trackFiltersApplied(filterState, fetchedCars.length);

        logger.info('Cars fetched successfully', { 
          category: currentCategory, 
          count: fetchedCars.length 
        });

      } catch (err) {
        logger.error('Error fetching cars', err as Error, { currentCategory });
        setError('Error loading cars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [currentCategory, sectionId]);

  // Set category handler
  const setCategory = useCallback((category: FilterCategory) => {
    setCurrentCategory(category);
    
    // Update URL
    const newState = homepageFilterService.getFilterConfig(category).queryParams as unknown as FilterState;
    setFilterState(newState);
    filterUrlStateService.updateBrowserUrl(newState, `/cars/${category}`);
    
    // Track preset selection
    filterAnalyticsService.trackPresetSelected(category, category);
  }, []);

  // Update single filter
  const updateFilter = useCallback((key: keyof FilterState, value: unknown) => {
    const oldValue = filterState[key];
    
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Track filter change
    filterAnalyticsService.trackFilterChange(key, oldValue, value);
  }, [filterState]);

  // Apply filters (update URL and refetch)
  const applyFilters = useCallback(() => {
    filterUrlStateService.updateBrowserUrl(filterState, '/search');
    
    // Detect and set category based on new state
    const detectedCategory = filterUrlStateService.detectCategoryFromState(filterState);
    setCurrentCategory(detectedCategory);
  }, [filterState]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    // Track reset
    filterAnalyticsService.trackFilterReset(filterState);
    
    // Clear state
    const emptyState = filterUrlStateService.clearFilters();
    setFilterState(emptyState);
    setCurrentCategory('all');
    
    // Update URL
    filterUrlStateService.updateBrowserUrl(emptyState, '/search');
  }, [filterState]);

  // Select a preset
  const selectPreset = useCallback((presetName: string) => {
    const presetState = filterUrlStateService.getPreset(presetName);
    setFilterState(presetState);
    
    const category = filterUrlStateService.detectCategoryFromState(presetState);
    setCurrentCategory(category);
    
    // Track preset selection
    filterAnalyticsService.trackPresetSelected(presetName, category);
    
    // Navigate to the category page
    navigate(`/cars/${category === 'all' ? '' : category.replace('_', '-')}`);
  }, [navigate]);

  // Shareable URL
  const shareableUrl = useMemo(() => {
    return filterUrlStateService.createShareableLink(filterState, '/search');
  }, [filterState]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return filterUrlStateService.countActiveFilters(filterState);
  }, [filterState]);

  // Available presets
  const availablePresets = useMemo(() => {
    return filterUrlStateService.getAllPresets();
  }, []);

  return {
    cars,
    totalCount,
    config,
    loading,
    error,
    currentCategory,
    filterState,
    setCategory,
    updateFilter,
    applyFilters,
    resetFilters,
    selectPreset,
    shareableUrl,
    activeFilterCount,
    availablePresets
  };
}

export default useHomepageFilters;

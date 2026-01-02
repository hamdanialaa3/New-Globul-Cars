// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace - Modern & Professional Design
// صفحة عرض السيارات مع بحث بالكلمات المفتاحية والذكاء الاصطناعي
// ⚡ Performance Optimized with Firebase Caching + AI Smart Search
//
// 🔍 SEARCH STRATEGY:
// - /cars → Simple keyword-based search (this page)
// - /advanced-search → Advanced filters with all vehicle specifications
// 
// Note: Mobile filter drawer removed as per project requirement.
// All advanced filtering is handled via /advanced-search page.

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { BULGARIAN_CITIES } from '../../constants/bulgarianCities';
import { unifiedCarService } from '../../services/car';
import { CarIcon } from '../../components/icons/CarIcon';
import { CarListing } from '../../types/CarListing';
import { logger } from '../../services/logger-service';
import { firebaseCache, cacheKeys } from '../../services/firebase/UnifiedFirebaseService';
import CarCardCompact from '../../components/CarCard/CarCardCompact';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';
import { Virtuoso } from 'react-virtuoso';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { smartSearchService } from '../../services/search/smart-search.service';
import { searchHistoryService } from '../../services/search/search-history.service';
import { searchAnalyticsService } from '../../services/analytics/search-analytics.service';
import { SmartAutocomplete } from '../../components/Search/SmartAutocomplete';
import AISearchButton from '../../components/Search/AISearchButton';
import SaveSearchButton from '../../components/Search/SaveSearchButton';
import { SearchCriteria } from '../../services/search/saved-searches-alerts.service';
import { Search, X, Clock, TrendingUp, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// ⚡ NEW PERFORMANCE SERVICES - Phase 2 Optimization
import { queryOptimizationService } from '../../services/search/query-optimization.service';
import { paginationService, PaginationState } from '../../services/search/pagination.service';
import { browserCacheStrategy } from '../../services/search/browser-cache-strategy.service';

// Import modular styles
import {
  CarsContainer,
  PageContainer,
  PageHeader,
  CityBadge,
  SearchSection,
  SearchBarWrapper,
  SearchInputContainer,
  SearchIconWrapper,
  SearchInput,
  SearchActionsGroup,
  ClearButton,
  SearchButton,
  ActionButtonsRow,
  ActionButton,
  SuggestionsDropdown,
  SuggestionSection,
  SuggestionHeader,
  SuggestionItem,
  CarsGridWrapper,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageButton,
  PageNumber,
} from './CarsPage.styles';

import {
  LoadingState,
  EmptyState,
} from './CarsPage.styles';

import { rotateGear } from './CarsPage.styles/animations';

const PALETTE = {
  primary: '#0B5FFF',
  primaryHover: '#0A4FDB',
  accent: '#00C48C',
  text: '#0F172A',
  muted: '#475569',
  surface: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #0B5FFF 0%, #061B4F 100%)',
};

  return (
    <CarsContainer>
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // ⚡ NEW: Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);
  const [searchSessionId, setSearchSessionId] = useState<string | null>(null); // ✅ NEW: Track current search session for analytics

  // ⚡ NEW: Pagination State - Phase 2 Optimization
  const [paginationState, setPaginationState] = useState<PaginationState | null>(null);
  const [totalCars, setTotalCars] = useState(0);

  // Get filters from URL
  const cityId = searchParams.get('city');
  const makeParam = searchParams.get('make');
  const cityData = cityId ? BULGARIAN_CITIES.find(c => c.id === cityId) : null;

  // ⚡ NEW: Load recent searches on mount
  useEffect(() => {
    if (user) {
      searchHistoryService.getRecentSearches(user.uid, 5).then(history => {
        setRecentSearches(history.map(h => h.query));
      });
    }
  }, [user]);

  // ⚡ NEW: Get suggestions with debouncing
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const sugg = await smartSearchService.getSuggestions(searchQuery, user?.uid, 8);
      setSuggestions(sugg);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // ⚡ NEW: Handle AI search filters
  const handleAISearch = async (aiFilters: any) => {
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    setIsSmartSearchActive(true);

    try {
      // Convert AI filters to search query
      const combinedQuery = [
        searchQuery,
        aiFilters.make?.join(' '),
        aiFilters.model?.join(' '),
        aiFilters.fuelType,
        aiFilters.transmission,
        aiFilters.city
      ].filter(Boolean).join(' ');

      const result = await smartSearchService.search(combinedQuery, user?.uid, 1, 100);
      setCars(result.cars as CarListing[]);
      logger.info('AI search completed', { aiFilters, resultsCount: result.cars.length });
    } catch (err) {
      logger.error('AI search failed', err as Error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // ⚡ NEW: Handle smart search with analytics
  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to normal mode if search is empty
      setIsSmartSearchActive(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    setIsSmartSearchActive(true); // Mark that we're in smart search mode

    const startTime = Date.now();

    try {
      const result = await smartSearchService.search(searchQuery, user?.uid, 1, 100);
      const processingTime = Date.now() - startTime;

      // 📊 Log search to analytics (only if user is logged in)
      if (user?.uid) {
        const searchId = await searchAnalyticsService.logSearch({
          query: searchQuery,
          resultsCount: result.cars.length,
          processingTime,
          source: 'direct',
          filters: {},
          userId: user.uid,
          language
        });

        // ✅ FIX: Save searchId for click tracking
        setSearchSessionId(searchId);
      }

      logger.debug('Smart Search Result', {
        context: 'CarsPage',
        action: 'smartSearch',
        data: {
          carsCount: result.cars.length,
          totalCount: result.totalCount,
          isPersonalized: result.isPersonalized,
          processingTime,
          firstCar: result.cars[0] ? {
            make: result.cars[0].make,
            model: result.cars[0].model,
            year: result.cars[0].year
          } : null
        }
      });

      setCars(result.cars as CarListing[]);
      setError(null); // Clear any previous errors

      logger.info('Smart search completed', {
        query: searchQuery,
        results: result.totalCount,
        personalized: result.isPersonalized,
        processingTime
      });
    } catch (err) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Smart search error:', err);
      logger.error('❌ Smart Search FAILED', err as Error, {
        context: 'CarsPage',
        action: 'smartSearch'
      });

      // Log failed search
      await searchAnalyticsService.logSearch({
        query: searchQuery,
        resultsCount: 0,
        processingTime,
        source: 'direct',
        filters: {},
        userId: user?.uid,
        language
      });

      setError('Search failed');
      setCars([]); // Clear cars on error
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Track car click for analytics
  const handleCarClick = async (car: CarListing, position: number) => {
    // ✅ STRICT CHECK: Only track if we have a valid search session
    if (!isSmartSearchActive || !searchQuery || !searchSessionId) {
      // Not a search result click - skip analytics
      return;
    }

    // Track click-through for search analytics
    try {
      await searchAnalyticsService.logClick({
        searchId: searchSessionId, // ✅ Guaranteed to be non-null here
        carId: car.id,
        position,
        userId: user?.uid
      });
    } catch (error) {
      // Silently fail - don't break user experience
      logger.error('Failed to log car click', error as Error);
    }
  };

  // ⚡ NEW: Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Auto-trigger search
    setTimeout(() => {
      handleSmartSearch();
    }, 100);
  };

  // ⚡ OPTIMIZED: Load cars with Query Optimization + Browser Cache + Pagination
  useEffect(() => {
    // Skip loading if smart search is active
    if (isSmartSearchActive) {
      return;
    }

    const loadCarsOptimized = async () => {
      const startTime = performance.now();

      try {
        setLoading(true);
        setError(null);

        // Read filters from URL params
        const regionParam = searchParams.get('city');
        const makeParam = searchParams.get('make');
        const pageParam = parseInt(searchParams.get('page') || '1', 10);

        logger.info('🔍 CarsPage - Loading with filters', { regionParam, makeParam, page: pageParam });

        // Build filters object
        const filters: Record<string, unknown> = {
          isActive: true,
        };

        if (regionParam) filters.region = regionParam;
        if (makeParam) filters.make = makeParam;

        // Add all URL filter params
        const modelParam = searchParams.get('model');
        const fuelTypeParam = searchParams.get('fuelType');
        const transmissionParam = searchParams.get('transmission');
        const priceMinParam = searchParams.get('priceMin');
        const priceMaxParam = searchParams.get('priceMax');
        const yearMinParam = searchParams.get('yearMin');
        const yearMaxParam = searchParams.get('yearMax');

        if (modelParam) filters.model = modelParam;
        if (fuelTypeParam) filters.fuelType = fuelTypeParam;
        if (transmissionParam) filters.transmission = transmissionParam;
        if (priceMinParam) filters.minPrice = parseFloat(priceMinParam);
        if (priceMaxParam) filters.maxPrice = parseFloat(priceMaxParam);
        if (yearMinParam) filters.minYear = parseInt(yearMinParam);
        if (yearMaxParam) filters.maxYear = parseInt(yearMaxParam);

        // ⚡ Generate deterministic cache key
        const cacheKey = browserCacheStrategy.createCacheKey('cars_search', filters, { page: pageParam });

        // ⚡ Use Browser Cache Strategy with 5-minute TTL
        const result = await browserCacheStrategy.getOrFetch(
          cacheKey,
          async () => {
            logger.info('📡 Cache miss - fetching from queryOptimizationService...');
            // ⚡ Use Query Optimization Service for parallel multi-collection search
            return await queryOptimizationService.searchWithClientFilters(
              filters,
              { page: pageParam, limit: 20 } // 20 cars per page
            );
          },
          5 * 60 * 1000 // 5 minutes TTL
        );

        // Convert to CarListing format
        const carListings: CarListing[] = result.cars.map((car: any) => ({
          ...car,
          vehicleType: car.vehicleType || 'car',
          sellerType: car.sellerType || 'private',
          sellerName: car.sellerName || '',
          sellerEmail: car.sellerEmail || '',
          sellerPhone: car.sellerPhone || '',
          city: car.locationData?.cityName || '',
          region: car.region || '',
          status: car.status || 'active',
          currency: car.currency || 'EUR'
        } as CarListing));

        setCars(carListings);
        setTotalCars(result.totalCount);
        setPaginationState(result.pagination);

        const loadTime = performance.now() - startTime;
        logger.info(`⚡ Cars loaded in ${loadTime.toFixed(0)}ms`, {
          count: carListings.length,
          total: result.totalCount,
          page: pageParam,
          cacheStats: browserCacheStrategy.getStats()
        });
      } catch (err) {
        const error = err as Error;
        logger.error('❌ Error loading cars', error, {
          context: 'CarsPage',
          action: 'loadCarsOptimized'
        });
        setError(error.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    loadCarsOptimized();
  }, [searchParams, isSmartSearchActive]);

  // ⚡ Pagination handlers
  const handleNextPage = () => {
    if (!paginationState?.hasNextPage) return;
    const newPage = paginationState.currentPage + 1;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (!paginationState?.hasPreviousPage) return;
    const newPage = paginationState.currentPage - 1;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get city display name with useMemo ⚡
  const cityDisplayName = useMemo(() => {
    if (!cityData) return '';
    return language === 'bg' ? cityData.nameBg : cityData.nameEn;
  }, [cityData, language]);

  // Memoized count text ⚡
  const carsCountText = useMemo(() => {
    const count = cars.length;
    return language === 'bg'
      ? count === 1 ? 'автомобил' : 'автомобила'
      : count === 1 ? 'car' : 'cars';
  }, [cars.length, language]);

  return (
    <CarsContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>
            {cityData
              ? `${t('cars.title')} - ${cityDisplayName}`
              : makeParam
                ? `${t('cars.title')} - ${makeParam}`
                : t('cars.title')}
          </h1>
          <p>{t('cars.subtitle')}</p>

          {/* City Badge */}
          {cityData && (
            <CityBadge>
              {language === 'bg' ? 'Локация' : 'Location'}: {cityDisplayName} · {cars.length} {carsCountText}
            </CityBadge>
          )}

          {/* Brand/Make Badge */}
          {makeParam && !cityData && (
            <CityBadge>
              {language === 'bg' ? 'Марка' : 'Make'}: {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}

          {/* Combined Badge (Region + Brand) */}
          {cityData && makeParam && (
            <CityBadge>
              {language === 'bg' ? 'Локация' : 'Location'}: {cityDisplayName} · {language === 'bg' ? 'Марка' : 'Make'}: {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
        </PageHeader>

        {/* ⚡ MODERN SEARCH SECTION */}
        <SearchSection>
          {/* Action Buttons - Advanced Search & AI Search */}
          <ActionButtonsRow>
            <ActionButton
              variant="primary"
              onClick={() => window.location.href = '/advanced-search'}
              aria-label={language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}
            >
              <SlidersHorizontal />
              {language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}
            </ActionButton>

            {/* ✅ NEW: AI Smart Search Button */}
            <AISearchButton
              query={searchQuery}
              onSearch={handleAISearch}
              disabled={isSearching || !searchQuery.trim()}
              variant="secondary"
            />
          </ActionButtonsRow>

          {/* Main Search Bar - NEW: Smart Autocomplete */}
          <SearchBarWrapper>
            <SmartAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSmartSearch}
              onSelect={(value) => {
                setSearchQuery(value);
                // Auto-trigger search after selection
                setTimeout(() => handleSmartSearch(), 100);
              }}
              placeholder={
                language === 'bg'
                  ? 'Търси марка, модел, град...'
                  : 'Search make, model, city...'
              }
            />
          </SearchBarWrapper>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <SuggestionsDropdown>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <SuggestionSection>
                  <SuggestionHeader>
                    <Clock />
                    {language === 'bg' ? 'Последни търсения' : 'Recent Searches'}
                  </SuggestionHeader>
                  {recentSearches.map((search, index) => (
                    <SuggestionItem
                      key={`recent-${index}`}
                      onClick={() => handleSuggestionClick(search)}
                    >
                      {search}
                    </SuggestionItem>
                  ))}
                </SuggestionSection>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <SuggestionSection>
                  <SuggestionHeader>
                    <TrendingUp />
                    {language === 'bg' ? 'Предложения' : 'Suggestions'}
                  </SuggestionHeader>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionSection>
              )}
            </SuggestionsDropdown>
          )}
        </SearchSection>

        {/* Loading State */}
        {loading && (
          <LoadingState>
            <div className="loading-spinner" />
            <p>{language === 'bg' ? 'Зареждане на автомобили...' : 'Loading cars...'}</p>
          </LoadingState>
        )}

        {/* Error State */}
        {error && !loading && (
          <EmptyState>
            <h3>⚠️ {language === 'bg' ? 'Грешка' : 'Error'}</h3>
            <p>{error}</p>
          </EmptyState>
        )}

        {/* Empty State */}
        {!loading && !error && cars.length === 0 && (
          <EmptyState>
            <CarIcon size={64} color={PALETTE.accent} style={{ marginBottom: '16px', opacity: 0.65 }} />
            <h3>{language === 'bg' ? 'Няма намерени автомобили' : 'No cars found'}</h3>
            <p>
              {cityData && makeParam
                ? (language === 'bg'
                  ? `В момента няма обяви за ${makeParam} в ${cityDisplayName}.`
                  : `Currently no ${makeParam} listings in ${cityDisplayName}.`)
                : cityData
                  ? (language === 'bg'
                    ? `В момента няма обяви за автомобили в ${cityDisplayName}.`
                    : `Currently no car listings in ${cityDisplayName}.`)
                  : makeParam
                    ? (language === 'bg'
                      ? `В момента няма обяви за ${makeParam}.`
                      : `Currently no ${makeParam} listings available.`)
                    : (language === 'bg'
                      ? 'В момента няма налични обяви за автомобили.'
                      : 'Currently no car listings available.')}
            </p>
          </EmptyState>
        )}

        {/* Cars Grid */}
        {!loading && cars.length > 0 && (
          <>
            <CarsGridWrapper>
              {cars.length > 50 ? (
                // Use Virtual Scrolling for large lists (50+ items) for better performance
                <Virtuoso
                  data={cars}
                  itemContent={(index, car) => (
                    <div onClick={() => handleCarClick(car, index)}>
                      <CarCardCompact key={car.id} car={car} />
                    </div>
                  )}
                  style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
                  overscan={10}
                />
              ) : (
                // Use regular grid for smaller lists
                <ResponsiveGrid
                  columns={{
                    xs: 1,    // 1 column on mobile
                    sm: 2,    // 2 columns on small tablets
                    md: 2,    // 2 columns on tablets
                    lg: 3,    // 3 columns on desktop
                    xl: 4     // 4 columns on large desktop
                  }}
                  gap={20}
                >
                  {cars.map((car, index) => (
                    <div key={car.id} onClick={() => handleCarClick(car, index)}>
                      <CarCardCompact car={car} />
                    </div>
                  ))}
                </ResponsiveGrid>
              )}
            </CarsGridWrapper>

            {/* ⚡ NEW: Pagination Controls */}
            {paginationState && (paginationState.totalPages > 1) && (
              <PaginationContainer>
                <PaginationInfo>
                  {language === 'bg' ? 'Показани' : 'Showing'}{' '}
                  <span>{paginationState.offset + 1}</span>-
                  <span>{Math.min(paginationState.offset + paginationState.limit, totalCars)}</span>{' '}
                  {language === 'bg' ? 'от' : 'of'}{' '}
                  <span>{totalCars}</span> {carsCountText}
                </PaginationInfo>

                <PaginationButtons>
                  <PageButton
                    onClick={handlePreviousPage}
                    disabled={!paginationState.hasPreviousPage}
                  >
                    <ChevronLeft />
                    {language === 'bg' ? 'Предишна' : 'Previous'}
                  </PageButton>

                  <PageNumber>
                    {language === 'bg' ? 'Страница' : 'Page'} {paginationState.currentPage} {language === 'bg' ? 'от' : 'of'} {paginationState.totalPages}
                  </PageNumber>

                  <PageButton
                    onClick={handleNextPage}
                    disabled={!paginationState.hasNextPage}
                  >
                    {language === 'bg' ? 'Следваща' : 'Next'}
                    <ChevronRight />
                  </PageButton>
                </PaginationButtons>
              </PaginationContainer>
            )}
          </>
        )}

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;
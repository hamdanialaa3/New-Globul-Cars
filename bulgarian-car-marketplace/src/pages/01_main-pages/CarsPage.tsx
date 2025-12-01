// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace
// صفحة عرض السيارات مع فلترة متقدمة حسب المدن
// ⚡ Performance Optimized with Firebase Caching + useMemo

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { BULGARIAN_CITIES } from '@/constants/bulgarianCities';
import { unifiedCarService } from '@/services/car';
import { CarIcon } from '@/components/icons/CarIcon';
import { CarListing } from '@/types/CarListing';
import { logger } from '@/services/logger-service';
import { firebaseCache, cacheKeys } from '@/services/firebase-cache.service';
import CarCardCompact from '@/components/CarCard/CarCardCompact';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { MobileFilterDrawer, MobileFilterButton, FilterValues } from '@/components/filters';
import { smartSearchService } from '@/services/search/smart-search.service';
import { searchHistoryService } from '@/services/search/search-history.service';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

// Styled Components
const CarsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  
  /* MOBILE - Clean layout (Instagram/Facebook) */
  @media (max-width: 768px) {
    padding: 16px 0 80px;  /* Space for bottom nav */
    background: #f0f2f5;  /* Instagram gray */
  }
  
  @media (max-width: 480px) {
    padding: 12px 0 70px;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  /* MOBILE - Full-width (Instagram pattern) */
  @media (max-width: 768px) {
    padding: 0;  /* Full-width for mobile */
    max-width: 100%;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: white;
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};

    /* MOBILE - Compact header (Airbnb) */
    @media (max-width: 768px) {
      font-size: 1.5rem;  /* 24px */
      font-weight: 700;
      margin-bottom: 8px;
    }

    @media (max-width: 480px) {
      font-size: 1.375rem;  /* 22px */
    }
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    
    @media (max-width: 768px) {
      font-size: 0.875rem;  /* 14px */
      margin-bottom: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
`;

const CityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1rem auto;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
`;

const CarsGridWrapper = styled.div`
  margin-top: 32px;

  /* MOBILE - Instagram-style grid wrapper */
  @media (max-width: 768px) {
    margin-top: 8px;
    margin-bottom: 90px;  /* Space for floating filter button */
    padding: 0;  /* Full-width grid */
  }
  
  @media (max-width: 480px) {
    margin-bottom: 80px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

// ⚡ NEW: Smart Search Bar Styles
const SearchBarContainer = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem;
  position: relative;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:focus-within {
    border-color: #005ca9;
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.15);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const SearchIconButton = styled.button`
  background: linear-gradient(135deg, #005ca9, #0066cc);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 92, 169, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:hover {
    color: #495057;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
`;

const SuggestionSection = styled.div`
  padding: 0.75rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SuggestionItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #212529;
  transition: background 0.15s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:active {
    background: #e9ecef;
  }
`;

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  
  // ⚡ NEW: Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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

  // ⚡ NEW: Handle smart search
  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    
    try {
      const result = await smartSearchService.search(searchQuery, user?.uid, 1, 100);
      setCars(result.cars as CarListing[]);
      logger.info('Smart search completed', { 
        query: searchQuery, 
        results: result.totalCount,
        personalized: result.isPersonalized 
      });
    } catch (err) {
      logger.error('Smart search failed', err as Error);
      setError('Search failed');
    } finally {
      setIsSearching(false);
      setLoading(false);
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

  // Load cars from Firebase with caching ⚡
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Read filters from URL params INSIDE useEffect
        const regionParam = searchParams.get('city'); // 'city' param is actually region!
        const makeParam = searchParams.get('make');
        
        console.log('🔍 URL params:', { regionParam, makeParam });
        logger.info('Loading cars with filters', { region: regionParam, make: makeParam });

        // ✅ FIXED: Build filters object compatible with unifiedCarService.searchCars
        const filters: any = {
          isActive: true,  // Only show active cars
          isSold: false    // Hide sold cars
        };

        // Add region filter if provided (region is the primary location field)
        if (regionParam) {
          filters.region = regionParam;
          console.log('🎯 Filtering by region:', regionParam);
        }

        // Add make (brand) filter if provided
        if (makeParam) {
          filters.make = makeParam;
          console.log('🎯 Filtering by make:', makeParam);
        }

        // ✅ ADDED: Read all filter params from URL and apply them
        const modelParam = searchParams.get('model');
        const fuelTypeParam = searchParams.get('fuelType');
        const transmissionParam = searchParams.get('transmission');
        const priceMinParam = searchParams.get('priceMin');
        const priceMaxParam = searchParams.get('priceMax');
        const yearMinParam = searchParams.get('yearMin');
        const yearMaxParam = searchParams.get('yearMax');
        const mileageMinParam = searchParams.get('mileageMin');
        const mileageMaxParam = searchParams.get('mileageMax');
        const bodyTypeParam = searchParams.get('bodyType');

        if (modelParam) filters.model = modelParam;
        if (fuelTypeParam) filters.fuelType = fuelTypeParam;
        if (transmissionParam) filters.transmission = transmissionParam;
        if (priceMinParam) filters.minPrice = parseFloat(priceMinParam);
        if (priceMaxParam) filters.maxPrice = parseFloat(priceMaxParam);
        if (yearMinParam) filters.minYear = parseInt(yearMinParam);
        if (yearMaxParam) filters.maxYear = parseInt(yearMaxParam);
        // Note: mileage filters would need to be added to CarFilters interface if needed

        if (!regionParam && !makeParam) {
          console.log('📋 No filters - loading all active cars');
        }

        // ⚡ Fetch cars with caching (5 minute cache) using unifiedCarService
        const cacheKey = makeParam && regionParam 
          ? `cars-${regionParam}-${makeParam}`
          : regionParam 
            ? cacheKeys.carsByCity(regionParam)
            : makeParam 
              ? cacheKeys.carsByMake(makeParam)
              : cacheKeys.activeCars();

        console.log('🔥 Using cache key:', cacheKey);
        
        const carsList = await firebaseCache.getOrFetch(
          cacheKey,
          async () => {
            console.log('📡 Fetching from Firebase using unifiedCarService (cache miss)...');
            // ✅ FIXED: Use unifiedCarService.searchCars instead of non-existent carListingService
            return await unifiedCarService.searchCars(filters, 100);
          },
          { duration: 5 * 60 * 1000 } // 5 minutes
        );
        
        console.log('📦 Result:', {
          total: carsList.length,
          filters: { region: regionParam, make: makeParam },
          cacheStats: firebaseCache.getStats()
        });
        
        // Convert UnifiedCar[] to CarListing[] format
        const carListings: CarListing[] = carsList.map(car => ({
          ...car,
          vehicleType: (car as any).vehicleType || 'car',
          sellerType: (car as any).sellerType || 'private',
          sellerName: (car as any).sellerName || '',
          sellerEmail: (car as any).sellerEmail || '',
          sellerPhone: (car as any).sellerPhone || '',
          city: (car as any).city || '',
          region: (car as any).region || '',
          status: car.status || 'active',
          currency: (car as any).currency || 'EUR'
        } as CarListing));
        
        setCars(carListings);
        console.log(`✅ Loaded ${result.listings.length} cars:`, 
          regionParam ? `from region: ${regionParam}` : '',
          makeParam ? `make: ${makeParam}` : '',
          !regionParam && !makeParam ? 'all cars' : ''
        );
      } catch (err: any) {
        console.error('❌ Error loading cars:', err);
        setError(err.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [searchParams]);

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

  // Extract current filters from URL
  const currentFilters = useMemo<FilterValues>(() => {
    const makeParam = searchParams.get('make');
    const regionParam = searchParams.get('city'); // Actually region
    
    return {
      make: makeParam || undefined,
      region: regionParam || undefined,
      // Add more URL params as needed
    };
  }, [searchParams]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(currentFilters).filter(Boolean).length;
  }, [currentFilters]);

  // Handle filter apply
  const handleApplyFilters = (filters: FilterValues) => {
    const newParams = new URLSearchParams();
    
    // Add filters to URL params
    if (filters.make) newParams.set('make', filters.make);
    if (filters.region) newParams.set('city', filters.region); // Keep 'city' param name for compatibility
    if (filters.model) newParams.set('model', filters.model);
    if (filters.priceMin) newParams.set('priceMin', filters.priceMin);
    if (filters.priceMax) newParams.set('priceMax', filters.priceMax);
    if (filters.yearMin) newParams.set('yearMin', filters.yearMin);
    if (filters.yearMax) newParams.set('yearMax', filters.yearMax);
    if (filters.mileageMin) newParams.set('mileageMin', filters.mileageMin);
    if (filters.mileageMax) newParams.set('mileageMax', filters.mileageMax);
    if (filters.fuelType) newParams.set('fuelType', filters.fuelType);
    if (filters.transmission) newParams.set('transmission', filters.transmission);
    if (filters.bodyType) newParams.set('bodyType', filters.bodyType);

    setSearchParams(newParams);
  };

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
              📍 {cityDisplayName} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Brand/Make Badge */}
          {makeParam && !cityData && (
            <CityBadge>
              {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Combined Badge (Region + Brand) */}
          {cityData && makeParam && (
            <CityBadge>
              📍 {cityDisplayName} · {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
        </PageHeader>

        {/* ⚡ NEW: Smart Search Bar */}
        <SearchBarContainer>
          <SearchInputWrapper>
            <Search size={20} color="#6c757d" style={{ marginRight: '0.5rem' }} />
            <SearchInput
              type="text"
              placeholder={language === 'bg' 
                ? 'Търси BMW 2020, Diesel, София...' 
                : 'Search BMW 2020, Diesel, Sofia...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSmartSearch();
                }
              }}
            />
            {searchQuery && (
              <ClearButton onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}>
                <X size={18} />
              </ClearButton>
            )}
            <SearchIconButton
              onClick={handleSmartSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              <Search size={16} />
              {language === 'bg' ? 'Търси' : 'Search'}
            </SearchIconButton>
          </SearchInputWrapper>

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
        </SearchBarContainer>

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
            <CarIcon size={64} color="#FF7900" style={{ marginBottom: '16px', opacity: 0.6 }} />
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
          <CarsGridWrapper>
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
              {cars.map(car => (
                <CarCardCompact key={car.id} car={car} />
              ))}
            </ResponsiveGrid>
          </CarsGridWrapper>
        )}

        {/* Mobile Filter Button */}
        {isMobile && (
          <MobileFilterButton
            onClick={() => setShowFilters(true)}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          initialFilters={currentFilters}
          language={language}
        />

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;
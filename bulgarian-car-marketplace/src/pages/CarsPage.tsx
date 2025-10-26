// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace
// صفحة عرض السيارات مع فلترة متقدمة حسب المدن
// ⚡ Performance Optimized with Firebase Caching + useMemo

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import carListingService from '../services/carListingService';
import { CarIcon } from '../components/icons/CarIcon';
import { CarListing } from '../types/CarListing';
import { logger } from '../services/logger-service';
import { firebaseCache, cacheKeys } from '../services/firebase-cache.service';
import { CarCardMobileOptimized } from '../components/CarCard/CarCardMobileOptimized';
import { ResponsiveGrid } from '../components/layout/ResponsiveGrid';
import { useIsMobile } from '../hooks/useBreakpoint';
import { MobileFilterDrawer, MobileFilterButton, FilterValues } from '../components/filters';

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

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  
  // Get filters from URL
  const cityId = searchParams.get('city');
  const makeParam = searchParams.get('make');
  const cityData = cityId ? BULGARIAN_CITIES.find(c => c.id === cityId) : null;

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

        // Build filters object
        const filters: any = {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };

        // Add region filter if provided
        if (regionParam) {
          filters.cityId = regionParam; // Will be used as region in service
          console.log('🎯 Filtering by region:', regionParam);
        }

        // Add make (brand) filter if provided
        if (makeParam) {
          filters.make = makeParam;
          console.log('🎯 Filtering by make:', makeParam);
        }

        if (!regionParam && !makeParam) {
          console.log('📋 No filters - loading all cars');
        }

        // ⚡ Fetch cars with caching (5 minute cache)
        const cacheKey = makeParam && regionParam 
          ? `cars-${regionParam}-${makeParam}`
          : regionParam 
            ? cacheKeys.carsByCity(regionParam)
            : makeParam 
              ? cacheKeys.carsByMake(makeParam)
              : cacheKeys.activeCars();

        console.log('🔥 Using cache key:', cacheKey);
        
        const result = await firebaseCache.getOrFetch(
          cacheKey,
          async () => {
            console.log('📡 Fetching from Firebase (cache miss)...');
            return await carListingService.getListings(filters);
          },
          { duration: 5 * 60 * 1000 } // 5 minutes
        );
        
        console.log('📦 Result:', {
          total: result.listings.length,
          filters: { region: regionParam, make: makeParam },
          cacheStats: firebaseCache.getStats()
        });
        
        setCars(result.listings);
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
              🚗 {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Combined Badge (Region + Brand) */}
          {cityData && makeParam && (
            <CityBadge>
              📍 {cityDisplayName} · 🚗 {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
        </PageHeader>

        {/* No search or filters - just show cars! */}

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
                <CarCardMobileOptimized key={car.id} car={car} />
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
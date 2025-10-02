// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace
// صفحة عرض السيارات مع فلترة متقدمة حسب المدن

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import carListingService from '../services/carListingService';
import { CarListing } from '../types/CarListing';
import AISearchEngine from '../components/AISearchEngine';
import CarCard from '../components/CarCard';
import AdvancedFilters from '../components/AdvancedFilters';

// Styled Components
const CarsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 480px) {
    padding: 0 ${({ theme }) => theme.spacing.xs};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};

    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
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

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
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

const ResultsCount = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 1rem 0;
  font-weight: 500;
`;

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  
  // Get city filter from URL
  const cityId = searchParams.get('city');
  const cityData = cityId ? BULGARIAN_CITIES.find(c => c.id === cityId) : null;

  // Load cars from Firebase
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading cars from Firebase with filters...', appliedFilters);

        // Prepare filters from URL params and applied filters
        const filters: any = {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };

        // Add city filter
        if (cityId || appliedFilters.city) {
          filters.location = cityId || appliedFilters.city;
        }

        // Add other filters
        if (appliedFilters.make) filters.make = appliedFilters.make;
        if (appliedFilters.yearFrom) filters.yearFrom = appliedFilters.yearFrom;
        if (appliedFilters.yearTo) filters.yearTo = appliedFilters.yearTo;
        if (appliedFilters.priceFrom) filters.priceFrom = appliedFilters.priceFrom;
        if (appliedFilters.priceTo) filters.priceTo = appliedFilters.priceTo;
        if (appliedFilters.fuelType) filters.fuelType = appliedFilters.fuelType;
        if (appliedFilters.transmission) filters.transmission = appliedFilters.transmission;
        if (appliedFilters.sellerType) filters.sellerType = appliedFilters.sellerType;

        // Fetch cars from Firebase
        const result = await carListingService.getListings(filters);
        
        // Additional client-side filtering
        let filteredCars = result.listings;
        
        // Filter by city (support both old and new structure)
        if (cityId || appliedFilters.city) {
          const targetCity = cityId || appliedFilters.city;
          filteredCars = filteredCars.filter(car => 
            car.city === targetCity || 
            car.region === targetCity ||
            (car as any).location?.cityId === targetCity ||
            (car as any).locationData?.cityId === targetCity
          );
        }

        // Filter by mileage range (client-side)
        if (appliedFilters.mileageFrom || appliedFilters.mileageTo) {
          filteredCars = filteredCars.filter(car => {
            const mileage = car.mileage || 0;
            if (appliedFilters.mileageFrom && mileage < appliedFilters.mileageFrom) return false;
            if (appliedFilters.mileageTo && mileage > appliedFilters.mileageTo) return false;
            return true;
          });
        }

        setCars(filteredCars);
        console.log(`✅ Loaded ${filteredCars.length} cars with filters`);
      } catch (err: any) {
        console.error('❌ Error loading cars:', err);
        setError(err.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [cityId, appliedFilters]);

  // AI Search handler
  const handleAISearch = (query: string) => {
    console.log('🔍 AI Search query:', query);
    // TODO: Implement AI-powered search with semantic understanding
  };

  // Filters handlers
  const handleApplyFilters = (filters: any) => {
    console.log('🎯 Applying filters:', filters);
    setAppliedFilters(filters);
    
    // Update URL with new filters
    const newParams = new URLSearchParams();
    if (filters.city) newParams.set('city', filters.city);
    if (filters.make) newParams.set('make', filters.make);
    if (filters.yearFrom) newParams.set('yearFrom', filters.yearFrom.toString());
    if (filters.yearTo) newParams.set('yearTo', filters.yearTo.toString());
    if (filters.priceFrom) newParams.set('priceFrom', filters.priceFrom.toString());
    if (filters.priceTo) newParams.set('priceTo', filters.priceTo.toString());
    
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    console.log('🗑️ Clearing filters');
    setAppliedFilters({});
    setSearchParams({});
  };

  // Get city display name
  const getCityDisplayName = () => {
    if (!cityData) return '';
    return language === 'bg' ? cityData.nameBg : cityData.nameEn;
  };

  return (
    <CarsContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>{cityData ? `${t('cars.title')} - ${getCityDisplayName()}` : t('cars.title')}</h1>
          <p>{t('cars.subtitle')}</p>
          {cityData && (
            <CityBadge>
              📍 {getCityDisplayName()} · {cars.length} {language === 'bg' ? 'автомобила' : 'cars'}
            </CityBadge>
          )}
        </PageHeader>

        {/* AI-Powered Smart Search */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <AISearchEngine onSearch={handleAISearch} />
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          initialFilters={appliedFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Results Count */}
        {!loading && cars.length > 0 && (
          <ResultsCount>
            {language === 'bg' 
              ? `Намерени ${cars.length} автомобила` 
              : `Found ${cars.length} cars`}
          </ResultsCount>
        )}

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
            <h3>🚗 {language === 'bg' ? 'Няма намерени автомобили' : 'No cars found'}</h3>
            <p>
              {cityData 
                ? (language === 'bg' 
                    ? `В момента няма обяви за автомобили в ${getCityDisplayName()}.` 
                    : `Currently no car listings in ${getCityDisplayName()}.`)
                : (language === 'bg' 
                    ? 'В момента няма налични обяви за автомобили.' 
                    : 'Currently no car listings available.')}
            </p>
          </EmptyState>
        )}

        {/* Cars Grid */}
        {!loading && cars.length > 0 && (
          <CarsGrid>
            {cars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </CarsGrid>
        )}

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;
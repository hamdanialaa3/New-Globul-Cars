// Featured Cars Component - Real Firebase Data
// عرض السيارات المميزة من البيانات الحقيقية

import React, { useState, useEffect, memo } from 'react';
import { default as styledComponents } from 'styled-components';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { unifiedCarService, UnifiedCar } from '../services/car';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../hooks/useFavorites';
import { logger } from '../services/logger-service';
import { getCarUrlFromUnifiedCar } from '../utils/routing-utils';
import RealisticPaperclipBadge from './SoldBadge/RealisticPaperclipBadge';
import PremiumHomeCarCard from './CarCard/PremiumHomeCarCard';

import HorizontalScrollContainer from './HorizontalScrollContainer/HorizontalScrollContainer';

const styled = styledComponents;

// Types for filters
type QuickFilter = 'price' | 'type' | 'fuel' | 'condition';

interface FeaturedCarsProps {
  limit?: number;
  showFilters?: boolean;
  enablePagination?: boolean;
  activeFilters?: Set<QuickFilter>;
}

const FeaturedCarsContainer = styled.div`
  margin-top: 2rem;
`;

// Styled components cleaned up

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px dashed var(--border);
  
  h3 {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;


const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  limit = 4,
  activeFilters = new Set()
}) => {
  const { language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, [limit, activeFilters]);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);

      // Use unified service
      const allFeatured = await unifiedCarService.getFeaturedCars(30);

      // --- Apply Filters Client-Side ---
      let filteredCars = allFeatured;

      if (activeFilters.size > 0) {
        filteredCars = allFeatured.filter(car => {
          // 1. Fuel Type
          if (activeFilters.has('fuel') && car.fuelType !== 'electric') return false;

          // 2. Price ("Great Price" < 15,000 EUR)
          if (activeFilters.has('price') && (car.price || 0) > 15000) return false;

          // 3. Type ("Family cars")
          if (activeFilters.has('type')) {
            const familyTypes = ['SUV', 'Wagon', 'MPV', 'Van'];
            if (!familyTypes.includes(car.bodyType || '')) return false;
          }

          // 4. Condition ("Excellent")
          if (activeFilters.has('condition')) {
            const isNewish = (parseInt(car.year?.toString() || '0') >= 2020);
            const isLowMileage = ((car.mileage || 0) < 50000);
            if (!isNewish && !isLowMileage) return false;
          }

          return true;
        });
      }

      setCars(filteredCars.slice(0, limit));
    } catch (error) {
      logger.error('Error loading featured cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (price: number): number => {
    // Simple calculation: price / 24 months (typical leasing period)
    return Math.round(price / 24);
  };

  const isGoodPrice = (price: number): boolean => {
    // Simple logic: if price is below average for the make/year
    // You can enhance this with real market data
    return price < 15000;
  };

  const visibleCars = cars.slice(0, limit);

  if (loading) {
    return (
      <LoadingState>
        {language === 'bg' ? 'Зареждане на автомобили...' : 'Loading cars...'}
      </LoadingState>
    );
  }

  if (cars.length === 0) {
    return (
      <EmptyState>
        <h3>{language === 'bg' ? 'Няма налични автомобили' : 'No cars available'}</h3>
        <p>
          {language === 'bg'
            ? 'В момента няма публикувани обяви за продажба.'
            : 'There are currently no published listings.'}
        </p>
      </EmptyState>
    );
  }

  return (
    <>
      <FeaturedCarsContainer>
        <HorizontalScrollContainer
          gap="1.2rem"
          padding="0"
          itemMinWidth="280px"
          showArrows={true}
        >
          {visibleCars.map((car) => {
            return (
              <div key={car.id} style={{ padding: '20px 10px', perspective: '1000px' }}>
                 <PremiumHomeCarCard car={car} />
              </div>
            );
          })}
        </HorizontalScrollContainer>
      </FeaturedCarsContainer>
    </>
  );
};

// ⚡ OPTIMIZED: Memoized to prevent unnecessary re-renders
export default memo(FeaturedCars);

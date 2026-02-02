// LatestCarsSection.tsx
// Latest cars section with BEST badges - Mobile.bg competitive feature
// Shows newest listings with timestamps and premium badges

import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gauge, TrendingUp, Clock, Heart } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { UnifiedCar, mapDocToCar } from '../../../../services/car';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { logger } from '../../../../services/logger-service';
import { useFavorites } from '../../../../hooks/useFavorites';
import RealisticPaperclipBadge from '../../../../components/SoldBadge/RealisticPaperclipBadge';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';

// Styled Components
const SectionContainer = styled.section`
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 3rem auto; /* mobile.de standard: 48px top margin */
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */
  background: rgba(245, 241, 235, 0.4);
  transition: background-color 0.3s ease;
  
  html[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.4);
  }

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    margin: 2rem auto; /* mobile.de standard: 32px top margin mobile */
    padding: 0 16px; /* mobile.de standard: 16px horizontal padding mobile */
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px; /* mobile.de standard: 24px / 1.5rem for H2 */
  font-weight: 600; /* mobile.de standard: semi-bold */
  line-height: 1.3; /* mobile.de standard */
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-primary);
  }

  @media (max-width: 768px) {
    font-size: 22px; /* mobile.de mobile: 22px */
  }
`;

const ViewAllLink = styled(Link)`
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CarsContainer = styled.div`
  /* Container for horizontal scroll */
`;

// Styled components cleaned up

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
`;

// Types for filters
type QuickFilter = 'price' | 'type' | 'fuel' | 'condition';

interface LatestCarsSectionProps {
  activeFilters?: Set<QuickFilter>;
}

// Component
const LatestCarsSection: React.FC<LatestCarsSectionProps> = ({ activeFilters = new Set() }) => {
  const { language } = useLanguage();
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchLatestCars = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const carsRef = collection(db, 'cars');

        // Base query - still sorting by newest
        let q = query(
          carsRef,
          orderBy('createdAt', 'desc'),
          limit(30) // Increased limit to allow for more effective client-side filtering
        );

        // Apply basic Firestore filters if selected (to minimize data transfer)
        if (activeFilters.has('fuel')) {
          q = query(q, where('fuelType', '==', 'electric'));
        }

        const querySnapshot = await getDocs(q);
        let latestCars: UnifiedCar[] = [];

        querySnapshot.forEach((doc) => {
          try {
            const car = mapDocToCar(doc);
            const status = (car as any).status;
            const isPublished = status === 'published' || status === 'active';
            const isActive = car.isActive !== false;

            // Basic activation check
            if (!(isActive || isPublished)) return;

            // --- Apply Remaining Filters Client-Side (Logical Gaps fix) ---

            // 1. Price Filter ("Great Price" < 15,000 EUR for Bulgaria)
            if (activeFilters.has('price') && (car.price || 0) > 15000) return;

            // 2. Type Filter ("Family cars" = SUV, Wagon, or MPV)
            if (activeFilters.has('type')) {
              const familyTypes = ['SUV', 'Wagon', 'MPV', 'Van'];
              if (!familyTypes.includes(car.bodyType || '')) return;
            }

            // 3. Condition Filter ("Excellent" = Year >= 2020 or low mileage)
            if (activeFilters.has('condition')) {
              const isNewish = (parseInt(car.year?.toString() || '0') >= 2020);
              const isLowMileage = ((car.mileage || 0) < 50000);
              if (!isNewish && !isLowMileage) return;
            }

            latestCars.push(car);
          } catch (e) {
            logger.error('Error mapping car in LatestCarsSection', e as Error);
          }
        });

        setCars(latestCars.slice(0, 20)); // Return top 20 after filtering
      } catch (error) {
        logger.error('Failed to fetch latest cars:', error as Error, {
          context: 'LatestCarsSection',
          action: 'fetchLatestCars',
          filters: Array.from(activeFilters)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCars();
  }, [activeFilters]);

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return '';

    const now = new Date();
    const carDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - carDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return language === 'bg' ? `преди ${diffMins} мин` : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return language === 'bg' ? `преди ${diffHours} ч` : `${diffHours}h ago`;
    } else {
      return language === 'bg' ? `преди ${diffDays} дни` : `${diffDays} days ago`;
    }
  };

  const getLocation = (car: UnifiedCar): string => {
    return car.location?.cityName ||
      car.location?.cityNameBg ||
      car.location?.cityNameEn ||
      car.locationData?.cityName ||
      (language === 'bg' ? 'България' : 'Bulgaria');
  };

  const isBestOffer = (car: UnifiedCar): boolean => {
    // Mark as BEST if featured or created within last 3 hours
    if (car.featured) return true;

    if (car.createdAt) {
      const now = new Date();
      // Handle both Firestore Timestamp and JS Date
      const carDate = (car.createdAt as any).toDate ? (car.createdAt as any).toDate() : new Date(car.createdAt);
      const diffHours = (now.getTime() - carDate.getTime()) / 3600000;
      return diffHours < 3;
    }

    return false;
  };

  const translations = {
    bg: {
      title: 'Най-нови автомобили',
      viewAll: 'Виж всички',
      loading: 'Зареждане...',
      empty: 'Няма налични автомобили',
      emptyDesc: 'Проверете отново по-късно'
    },
    en: {
      title: 'Latest Cars',
      viewAll: 'View All',
      loading: 'Loading...',
      empty: 'No cars available',
      emptyDesc: 'Check again later'
    }
  };

  const text = translations[language];

  if (loading) {
    return (
      <SectionContainer>
        <LoadingState>{text.loading}</LoadingState>
      </SectionContainer>
    );
  }

  if (cars.length === 0) {
    return (
      <SectionContainer>
        <EmptyState>
          <TrendingUp />
          <h3>{text.empty}</h3>
          <p>{text.emptyDesc}</p>
        </EmptyState>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>
          <TrendingUp size={28} />
          {text.title}
        </SectionTitle>
        <ViewAllLink to="/cars?sort=latest">
          {text.viewAll} →
        </ViewAllLink>
      </SectionHeader>

      <CarsContainer>
        <HorizontalScrollContainer
          gap="1.5rem"
          padding="0"
          itemMinWidth="280px"
          showArrows={true}
        >
          {cars.map((car) => (
            <div key={car.id} style={{ padding: '20px 10px', perspective: '1000px' }}>
                <PremiumHomeCarCard car={car} />
            </div>
          ))}
        </HorizontalScrollContainer>
      </CarsContainer>
    </SectionContainer>
  );
};

export default memo(LatestCarsSection);

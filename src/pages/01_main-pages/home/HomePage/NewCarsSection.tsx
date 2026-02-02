// NewCarsSection Component - Latest Added Cars (Last 24 Hours)
// Раздел нови автомобили - Последно добавени коли (последните 24 часа)
// NewCarsSection - Cars added in the last 24 hours

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import ModernCarCard from './ModernCarCard';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';
import { logger } from '../../../../services/logger-service';
import { glassSecondaryButton } from '../../../../styles/glassmorphism-buttons';

const Section = styled.section`
  padding: 3rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(245, 241, 235, 0.4);
  transition: background-color 0.3s ease;
  
  html[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 2rem 0.75rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#374151'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  
  svg {
    width: 14px;
    height: 14px;
    color: #005ca9;
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
`;

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#111827'};
  margin: 0;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #005ca9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #004a87;
  }
  
  &:active {
    background: #003d70;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  /* mobile.de standard: 4 columns desktop, max-width 320px per card */
  grid-template-columns: repeat(4, 1fr);
  gap: 24px; /* mobile.de standard: 24px gap desktop */
  max-width: 1400px; /* mobile.de standard: 1400px max container */
  margin: 0 auto;
  padding: 0 24px;
  
  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr); /* mobile.de standard: 2 columns tablet */
    gap: 16px; /* mobile.de standard: 16px gap tablet */
    padding: 0 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* mobile.de standard: 1 column mobile */
    gap: 16px; /* mobile.de standard: 16px gap mobile */
    padding: 0 16px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#6c757d'};
  font-size: 1.125rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#6c757d'};
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.mode === 'dark' ? '#e8eaed' : '#212529'};
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const TimeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f9fafb'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.75rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  
  svg {
    width: 12px;
    height: 12px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

// Types for filters
type QuickFilter = 'price' | 'type' | 'fuel' | 'condition';

interface NewCarsSectionProps {
  activeFilters?: Set<QuickFilter>;
}

const NewCarsSection: React.FC<NewCarsSectionProps> = ({ activeFilters = new Set() }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [newCars, setNewCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNewCars = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch base data (last 24 hours)
        const cars = await unifiedCarService.getNewCarsLast24Hours(30); // Get more for filtering

        // --- Apply Filters Client-Side ---
        let filteredCars = cars;

        if (activeFilters.size > 0) {
          filteredCars = cars.filter(car => {
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

        setNewCars(filteredCars.slice(0, 12));
      } catch (err) {
        logger.error('Error loading new cars:', err as Error, {
          context: 'NewCarsSection',
          action: 'loadNewCars',
          filters: Array.from(activeFilters)
        });
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadNewCars();

    // Refresh every hour
    const interval = setInterval(loadNewCars, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeFilters]);

  const getTimeAgo = (date: Date | string): string => {
    const carDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - carDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return language === 'bg'
        ? `${diffMinutes} ${diffMinutes === 1 ? 'мин' : 'мин'}`
        : `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'}`;
    } else if (diffHours < 24) {
      return language === 'bg'
        ? `${diffHours} ${diffHours === 1 ? 'ч' : 'ч'}`
        : `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'}`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return language === 'bg'
        ? `${diffDays} ${diffDays === 1 ? 'ден' : 'дни'}`
        : `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    }
  };

  const handleViewAll = () => {
    navigate('/cars?sort=newest');
  };

  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <TitleContainer>
            <Badge>
              <Sparkles />
              {language === 'bg' ? 'Ново' : 'New'}
            </Badge>
            <Title>
              {language === 'bg' ? 'Нови обяви' : 'New Listings'}
            </Title>
          </TitleContainer>
        </SectionHeader>
        <LoadingState>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingState>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionHeader>
          <TitleContainer>
            <Badge>
              <Sparkles />
              {language === 'bg' ? 'Ново' : 'New'}
            </Badge>
            <Title>
              {language === 'bg' ? 'Нови обяви' : 'New Listings'}
            </Title>
          </TitleContainer>
        </SectionHeader>
        <EmptyState>
          <h3>{language === 'bg' ? 'Грешка' : 'Error'}</h3>
          <p>{error}</p>
        </EmptyState>
      </Section>
    );
  }

  if (newCars.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <TitleContainer>
            <Badge>
              <Sparkles />
              {language === 'bg' ? 'Ново' : 'New'}
            </Badge>
            <Title>
              {language === 'bg' ? 'Нови обяви' : 'New Listings'}
            </Title>
          </TitleContainer>
        </SectionHeader>
        <EmptyState>
          <h3>{language === 'bg' ? 'Няма нови обяви' : 'No New Listings'}</h3>
          <p>
            {language === 'bg'
              ? 'В момента няма нови обяви от последните 24 часа.'
              : 'There are no new listings in the last 24 hours.'}
          </p>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <TitleContainer>
          <Badge>
            <Sparkles />
            {language === 'bg' ? 'Ново' : 'New'}
          </Badge>
          <Title>
            {language === 'bg' ? 'Нови обяви' : 'New Listings'}
          </Title>
        </TitleContainer>
        <ViewAllButton onClick={handleViewAll}>
          {language === 'bg' ? 'Виж всички' : 'View All'}
          <ArrowRight />
        </ViewAllButton>
      </SectionHeader>

      <CarsGrid>
        {newCars.map((car) => (
          <div key={car.id} style={{ position: 'relative', perspective: '1000px' }}>
            <PremiumHomeCarCard car={car} />
            <TimeBadge style={{ position: 'absolute', bottom: '-40px', left: '0', width: '100%', justifyContent: 'center', background: 'transparent', border: 'none' }}>
              <Clock />
              {getTimeAgo(car.createdAt)}
            </TimeBadge>
          </div>
        ))}
      </CarsGrid>
    </Section>
  );
};

export default NewCarsSection;

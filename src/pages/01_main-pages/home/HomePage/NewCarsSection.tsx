// NewCarsSection Component - Latest Added Cars (Last 24 Hours)
// قسم السيارات الجديدة - السيارات المضافة حديثاً (آخر 24 ساعة)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import ModernCarCard from './ModernCarCard';
import { logger } from '../../../../services/logger-service';

const Section = styled.section`
  padding: 3rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
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

const NewCarsSection: React.FC = () => {
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
        
        // Get cars from last 24 hours
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        
        // Query all collections for new cars
        const collections = [
          'cars',
          'passenger_cars',
          'suvs',
          'vans',
          'motorcycles',
          'trucks',
          'buses'
        ];
        
        const allNewCars: UnifiedCar[] = [];
        
        // We'll use the unified service to get featured cars and filter by date client-side
        // For better performance, we could create a dedicated service method
        const featuredCars = await unifiedCarService.getFeaturedCars(50);
        
        // Filter cars added in last 24 hours
        const filtered = featuredCars.filter(car => {
          const carDate = car.createdAt instanceof Date 
            ? car.createdAt 
            : new Date(car.createdAt);
          return carDate >= last24Hours && car.isActive !== false && car.isSold !== true;
        });
        
        // Sort by newest first and limit to 12
        const sorted = filtered
          .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 12);
        
        setNewCars(sorted);
      } catch (err) {
        logger.error('Error loading new cars:', err as Error, {
          context: 'NewCarsSection',
          action: 'loadNewCars'
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
  }, []);

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
          <div key={car.id} style={{ position: 'relative' }}>
            <ModernCarCard car={car} showStatus={true} />
            <TimeBadge>
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

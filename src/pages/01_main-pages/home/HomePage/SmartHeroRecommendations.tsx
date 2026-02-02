/**
 * 🚗 Smart Hero Recommendations Component
 * Personalized car recommendations for homepage
 * 
 * @description Displays personalized car recommendations based on user behavior
 * @features
 * - Personalized recommendations based on user behavior
 * - External intent detection (Google, social media, ads)
 * - Brand affinity highlighting
 * - Refresh functionality
 * - Fallback to trending for anonymous users
 * - Responsive grid design (4/3/2/1 columns)
 * - Dark mode support
 * - Uses PremiumHomeCarCard with correct URL routing (/car/{sellerNumericId}/{carNumericId})
 * 
 * @version 2.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  RefreshCw, 
  ChevronRight,
  Star
} from 'lucide-react';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../hooks/useAuth';
import { 
  getRecommendations, 
  refreshRecommendations,
  RecommendationResponse
} from '../../../../services/recommendation';
import { behaviorService } from '../../../../services/recommendation/behavior.service';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  bg: {
    title: 'Подбрани за вас',
    subtitle: 'Базирано на вашите търсения и интереси',
    titleAnonymous: 'Популярни автомобили',
    subtitleAnonymous: 'Най-търсените автомобили в момента',
    refresh: 'Обнови',
    refreshing: 'Обновяване...',
    viewAll: 'Виж всички',
    loading: 'Зареждане...',
    noResults: 'Няма налични автомобили',
    tryAgain: 'Опитайте отново',
    viewDetails: 'Виж детайли',
    bgn: 'лв',
    km: 'км',
    year: 'г.',
    new: 'Ново',
    priceDropped: 'Намалена цена',
    trending: 'Популярен',
    recommended: 'Препоръчано'
  },
  en: {
    title: 'Picked for you',
    subtitle: 'Based on your searches and interests',
    titleAnonymous: 'Popular cars',
    subtitleAnonymous: 'Most searched cars right now',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    viewAll: 'View all',
    loading: 'Loading...',
    noResults: 'No cars available',
    tryAgain: 'Try again',
    viewDetails: 'View details',
    bgn: 'BGN',
    km: 'km',
    year: '',
    new: 'New',
    priceDropped: 'Price dropped',
    trending: 'Trending',
    recommended: 'Recommended'
  }
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const HeroContainer = styled.section`
  width: 100%;
  padding: 32px 0;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  
  svg {
    color: #FF8F10;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
`;

const DominantBrandBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B00 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  margin-left: 8px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RefreshButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: #FF8F10;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
    ${props => props.$loading && `
      animation: spin 1s linear infinite;
    `}
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B00 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  @media (max-width: 540px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }
`;

const CardWrapper = styled.div`
  /* Scale the card to 65% of original size */
  & > a, & > div {
    max-width: 100% !important;
    min-height: auto !important;
    transform: scale(0.85);
    transform-origin: center top;
  }
  
  /* Compensate for the scaled height */
  margin-bottom: -15%;
  
  @media (max-width: 540px) {
    & > a, & > div {
      transform: scale(0.9);
    }
    margin-bottom: -10%;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  gap: 12px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top-color: #FF8F10;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  gap: 16px;
`;

const RetryButton = styled.button`
  padding: 10px 24px;
  background: #FF8F10;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #FF6B00;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const SmartHeroRecommendations: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set user ID in behavior service when logged in
  useEffect(() => {
    if (user?.uid) {
      behaviorService.setUserId(user.uid);
    }
  }, [user?.uid]);
  
  // Load recommendations
  const loadRecommendations = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await (forceRefresh 
        ? refreshRecommendations({
            userId: user?.uid,
            sessionId: behaviorService.getSessionId(),
            limit: 8
          })
        : getRecommendations({
            userId: user?.uid,
            sessionId: behaviorService.getSessionId(),
            limit: 8
          })
      );
      
      setRecommendations(response);
    } catch (err) {
      console.error('[SmartHero] Failed to load recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);
  
  // Initial load
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);
  
  // Handle refresh
  const handleRefresh = () => {
    loadRecommendations(true);
  };
  
  // Handle view all
  const handleViewAll = () => {
    navigate('/cars');
  };
  
  // Determine if showing personalized or anonymous
  const isPersonalized = useMemo(() => {
    return recommendations?.stats?.highMatchCount ? 
           recommendations.stats.highMatchCount > 0 : 
           false;
  }, [recommendations]);
  
  // Render loading
  if (loading) {
    return (
      <HeroContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <span>{t.loading}</span>
        </LoadingContainer>
      </HeroContainer>
    );
  }
  
  // Render error / empty
  if (error || !recommendations || recommendations.cars.length === 0) {
    return (
      <HeroContainer>
        <EmptyState>
          <span>{t.noResults}</span>
          <RetryButton onClick={() => loadRecommendations()}>
            {t.tryAgain}
          </RetryButton>
        </EmptyState>
      </HeroContainer>
    );
  }
  
  return (
    <HeroContainer>
      <Header>
        <TitleSection>
          <Title>
            <Sparkles size={24} />
            {isPersonalized ? t.title : t.titleAnonymous}
            {recommendations.dominantBrand && (
              <DominantBrandBadge>
                <Star size={12} />
                {recommendations.dominantBrand.brand}
              </DominantBrandBadge>
            )}
          </Title>
          <Subtitle>
            {isPersonalized ? t.subtitle : t.subtitleAnonymous}
          </Subtitle>
        </TitleSection>
        
        <Actions>
          <RefreshButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            $loading={refreshing}
          >
            <RefreshCw />
            {refreshing ? t.refreshing : t.refresh}
          </RefreshButton>
          
          <ViewAllButton onClick={handleViewAll}>
            {t.viewAll}
            <ChevronRight />
          </ViewAllButton>
        </Actions>
      </Header>
      
      <CarsGrid>
        {recommendations.cars.map((car) => (
          <CardWrapper key={car.carId}>
             <PremiumHomeCarCard 
                car={{
                    id: car.carId,
                    make: car.metadata.brand,
                    model: car.metadata.model,
                    price: car.metadata.price,
                    year: car.metadata.year,
                    mileage: car.metadata.km,
                    images: [car.metadata.thumbnailUrl || ''],
                    fuelType: car.metadata.fuel,
                    transmission: car.metadata.gearbox,
                    sellerNumericId: car.metadata.sellerNumericId,
                    carNumericId: car.metadata.carNumericId,
                }} 
             />
          </CardWrapper>
        ))}
      </CarsGrid>
    </HeroContainer>
  );
};

export default React.memo(SmartHeroRecommendations);

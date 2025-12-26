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

// Styled Components
const SectionContainer = styled.section`
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1rem;
  background: rgba(245, 241, 235, 0.4);
  transition: background-color 0.3s ease;
  
  html[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.4);
  }

  @media (max-width: 768px) {
    margin: 2rem auto;
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
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-primary);
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
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

const CarCard = styled(Link)`
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 66.67%; // 3:2 aspect ratio
  background: var(--bg-secondary);
  overflow: hidden;
`;

const CarImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${CarCard}:hover & {
    transform: scale(1.05);
  }
`;

const BestBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
  z-index: 2;
`;

const TimeStamp = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
`;

const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: auto;
  height: auto;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 3;

  &:hover {
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 28px;
    height: 28px;
    fill: ${props => props.$isFavorite ? '#ef4444' : 'none'};
    stroke: ${props => props.$isFavorite ? '#ef4444' : '#d1d5db'};
    stroke-width: ${props => props.$isFavorite ? '0' : '2'};
    transition: all 0.2s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  &:hover svg {
    stroke: #ef4444;
    transform: scale(1.05);
  }

  ${props => props.$isFavorite && `
    animation: heartBeat 0.3s ease;
    
    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
  `}
`;

const CardContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CarTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
`;

const CarSpecs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PriceLocation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--accent-primary);
`;

const Location = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

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

// Component
const LatestCarsSection: React.FC = () => {
  const { language } = useLanguage();
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchLatestCars = async () => {
      try {
        const db = getFirestore();
        const carsRef = collection(db, 'cars');

        // ✅ FIX: Query without status filter to support both status='published' and isActive formats
        // Then filter client-side for compatibility
        const q = query(
          carsRef,
          orderBy('createdAt', 'desc'),
          limit(20) // Get more to compensate for client-side filtering
        );

        const querySnapshot = await getDocs(q);
        const latestCars: UnifiedCar[] = [];

        querySnapshot.forEach((doc) => {
          try {
            const car = mapDocToCar(doc);
            const status = (car as any).status;
            const isPublished = status === 'published' || status === 'active';
            const isActive = car.isActive !== false; // Default to true if missing
            const isSold = car.isSold === true; // Default to false if missing
            const isNotSoldStatus = status !== 'sold';
            
            // Include car if: (isActive OR status='published'/'active') AND NOT sold
            if ((isActive || isPublished) && !isSold && isNotSoldStatus) {
              latestCars.push(car);
            }
          } catch (e) {
            console.error('Error mapping car in LatestCarsSection', e);
          }
        });

        setCars(latestCars);
      } catch (error) {
        logger.error('Failed to fetch latest cars:', error as Error, {
          context: 'LatestCarsSection',
          action: 'fetchLatestCars'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCars();
  }, []);

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
          {cars.map((car) => {
            // ✅ CRITICAL FIX: Generate numeric URL if available, fallback to legacy URL
            const getCarUrl = (): string => {
              if ((car as any).sellerNumericId && (car as any).carNumericId) {
                return `/car/${(car as any).sellerNumericId}/${(car as any).carNumericId}`;
              }
              return `/cars/${car.id}`;
            };

            return (
              <CarCard key={car.id} to={getCarUrl()}>
                <ImageWrapper>
                  {car.images && car.images.length > 0 ? (
                    <CarImage
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      loading="lazy"
                    />
                  ) : (
                    <CarImage
                      as="div"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.6 }}
                      >
                        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                        <polygon points="12 15 17 21 7 21 12 15"></polygon>
                        <circle cx="7" cy="17" r="2"></circle>
                        <circle cx="17" cy="17" r="2"></circle>
                      </svg>
                    </CarImage>
                  )}

                  {isBestOffer(car) && (
                    <BestBadge>BEST</BestBadge>
                  )}

                  {car.createdAt && (
                    <TimeStamp>
                      <Clock size={12} />
                      {getTimeAgo(car.createdAt)}
                    </TimeStamp>
                  )}
                  
                  {/* ❤️ Favorite Button */}
                  <FavoriteButton
                    $isFavorite={isFavorite(car.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(car.id, {
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        price: car.price,
                        currency: car.currency || 'EUR',
                        mainImage: car.images?.[0] || '',
                        mileage: car.mileage,
                        fuelType: car.fuelType,
                        transmission: car.transmission,
                        location: getLocation(car)
                      });
                    }}
                    title={isFavorite(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart />
                  </FavoriteButton>
                </ImageWrapper>

                <CardContent>
                  <CarTitle>{car.make} {car.model}</CarTitle>

                  <CarSpecs>
                    {car.year && (
                      <SpecItem>
                        <Calendar />
                        {car.year}
                      </SpecItem>
                    )}
                    {car.mileage && (
                      <SpecItem>
                        <Gauge />
                        {car.mileage.toLocaleString()} km
                      </SpecItem>
                    )}
                  </CarSpecs>

                  <PriceLocation>
                    <Price>{car.price?.toLocaleString() || '—'} €</Price>
                    <Location>
                      <MapPin />
                      {getLocation(car)}
                    </Location>
                  </PriceLocation>
                </CardContent>
              </CarCard>
            );
          })}
        </HorizontalScrollContainer>
      </CarsContainer>
    </SectionContainer>
  );
};

export default memo(LatestCarsSection);

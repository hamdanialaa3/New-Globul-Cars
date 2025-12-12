// Car Suggestions List Component - Horizontal Carousel (Like PDF)
// قائمة اقتراحات السيارات - قائمة أفقية (مثل ملف PDF)

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { unifiedCarService } from '../../../services/car';
import { CarListing } from '../../../types/CarListing';
import { UnifiedCar } from '../../../services/car/unified-car.service';
import { ChevronRight, Heart } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CarSuggestionsListProps {
  currentCar: CarListing;
  language: 'bg' | 'en';
  limit?: number;
}

const SuggestionsSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1a1a1a' : '#f5f5f8'};
  border-radius: 0;
  padding: 2rem 0;
  margin-top: 2rem;
  width: 100%;
  position: relative;
  /* ✅ FIX: Prevent layout shift during async data load */
  min-height: 400px;
  /* ✅ Ensure this section doesn't affect parent grid layout */
  contain: layout style;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  margin-bottom: 1.5rem;
`;

const SuggestionsTitle = styled.h2<{ $isDark: boolean }>`
  margin: 0;
  font-size: 1.75rem;
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};
  font-weight: 700;
`;

const ShowAllButton = styled.button<{ $isDark: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const CarouselTrack = styled.div<{ $translateX: number }>`
  display: flex;
  gap: 1rem;
  transform: translateX(${props => props.$translateX}px);
  transition: transform 0.3s ease;
  padding: 0 2rem;
`;

const SuggestionCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const SuggestionImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${SuggestionCard}:hover & img {
    transform: scale(1.05);
  }
`;

const FavoriteIcon = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  svg {
    width: 18px;
    height: 18px;
    color: #a855f7;
    fill: #a855f7;
  }
`;

const SuggestionContent = styled.div<{ $isDark: boolean }>`
  padding: 1rem;
  background: ${props => props.$isDark ? '#2a2a2a' : '#ffffff'};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SuggestionTitle = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};
  line-height: 1.3;
`;

const SuggestionSubtitle = styled.div<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark ? '#b0b0b0' : '#6b7280'};
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const SuggestionPrice = styled.div<{ $isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};
`;

const PriceIndicator = styled.div<{ $type: 'good' | 'fair' | 'high' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => 
    props.$type === 'good' ? '#22c55e' : 
    props.$type === 'fair' ? '#f59e0b' : 
    '#ef4444'};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: ${props => 
      props.$type === 'good' ? '#22c55e' : 
      props.$type === 'fair' ? '#f59e0b' : 
      '#ef4444'};
    border-radius: 2px;
  }
`;

const SpecsTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const SpecTag = styled.span<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#3a3a3a' : '#f3f4f6'};
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ConsumptionInfo = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#b0b0b0' : '#6b7280'};
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const LocationRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.$isDark ? '#b0b0b0' : '#6b7280'};
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid ${props => props.$isDark ? '#3a3a3a' : '#e5e7eb'};
`;

const NavigationButton = styled.button<{ $position: 'left' | 'right'; $isDark: boolean }>`
  position: absolute;
  ${props => props.$position}: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  color: ${props => props.$isDark ? '#ffffff' : '#111827'};

  &:hover {
    background: ${props => props.$isDark 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.$isDark 
      ? 'rgba(255, 255, 255, 0.3)' 
      : 'rgba(0, 0, 0, 0.2)'};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const NavigationDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0 2rem;
`;

const Dot = styled.button<{ $active: boolean; $isDark: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => {
    if (props.$active) {
      return props.$isDark ? '#ffffff' : '#111827';
    }
    return props.$isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
  }};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      if (props.$active) {
        return props.$isDark ? '#ffffff' : '#111827';
      }
      return props.$isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    }};
  }
`;

const LoadingState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.$isDark ? '#b0b0b0' : '#6b7280'};
  font-size: 0.95rem;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.$isDark ? '#b0b0b0' : '#6b7280'};
  font-size: 0.95rem;
`;

const CarSuggestionsList: React.FC<CarSuggestionsListProps> = ({
  currentCar,
  language,
  limit = 6,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [suggestions, setSuggestions] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardWidth = 336; // Card width (320px) + gap (16px)
  const cardsPerView = 4;

  useEffect(() => {
    const loadSuggestions = async () => {
      // Get car ID from currentCar (could be id, carId, or documentId)
      const carId = (currentCar as any).id || (currentCar as any).carId || (currentCar as any).documentId;
      
      console.log('🔍 CarSuggestionsList - Loading suggestions for car:', {
        carId,
        make: currentCar.make,
        model: currentCar.model,
        currentCarKeys: Object.keys(currentCar)
      });
      
      if (!carId) {
        console.warn('⚠️ CarSuggestionsList - No car ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 CarSuggestionsList - Calling getSimilarCars...');
        const similarCars = await unifiedCarService.getSimilarCars(carId, limit);
        console.log('✅ CarSuggestionsList - Got similar cars:', similarCars.length);
        
        // Filter out the current car
        const filtered = similarCars.filter(car => car.id !== carId);
        console.log('✅ CarSuggestionsList - Filtered cars:', filtered.length);
        
        // If no similar cars, try to get featured cars as fallback
        if (filtered.length === 0) {
          console.log('⚠️ No similar cars found, trying featured cars...');
          try {
            const featuredCars = await unifiedCarService.getFeaturedCars(limit);
            const fallbackCars = featuredCars.filter(car => car.id !== carId);
            console.log('✅ CarSuggestionsList - Got featured cars as fallback:', fallbackCars.length);
            setSuggestions(fallbackCars.slice(0, limit));
          } catch (fallbackError) {
            console.error('❌ CarSuggestionsList - Error loading featured cars:', fallbackError);
            setSuggestions([]);
          }
        } else {
          setSuggestions(filtered.slice(0, limit));
        }
      } catch (error) {
        console.error('❌ CarSuggestionsList - Error loading car suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [currentCar, limit]);

  const handleCardClick = (carId: string) => {
    navigate(`/car/${carId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAll = () => {
    // Navigate to cars page with filters
    const make = currentCar.make;
    navigate(`/cars?make=${encodeURIComponent(make)}`);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, Math.ceil(suggestions.length / cardsPerView) - 1);
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceIndicator = (car: UnifiedCar): 'good' | 'fair' | 'high' => {
    // Simple logic - can be improved with market data
    if (!currentCar.price || !car.price) return 'fair';
    const priceDiff = Math.abs(car.price - currentCar.price) / currentCar.price;
    if (priceDiff < 0.1) return 'good';
    if (priceDiff < 0.2) return 'fair';
    return 'high';
  };

  const totalPages = Math.max(1, Math.ceil(suggestions.length / cardsPerView));
  const translateX = -currentIndex * cardWidth * cardsPerView;

  if (loading) {
    return (
      <SuggestionsSection $isDark={isDark}>
        <SectionHeader>
          <SuggestionsTitle $isDark={isDark}>
            {language === 'bg' ? 'Подобни автомобили' : 'Similar Vehicles'}
          </SuggestionsTitle>
        </SectionHeader>
        <LoadingState $isDark={isDark}>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingState>
      </SuggestionsSection>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const priceLabel = language === 'bg' 
    ? { good: 'Добра цена', fair: 'Справедлива цена', high: 'Повишена цена' }
    : { good: 'Good price', fair: 'Fair price', high: 'Higher price' };

  return (
    <SuggestionsSection $isDark={isDark}>
      <SectionHeader>
        <SuggestionsTitle $isDark={isDark}>
          {language === 'bg' ? 'Подобни автомобили' : 'Similar Vehicles'}
        </SuggestionsTitle>
        <ShowAllButton $isDark={isDark} onClick={handleShowAll}>
          {language === 'bg' ? 'Покажи всички' : 'Show all vehicles'}
        </ShowAllButton>
      </SectionHeader>

      <CarouselContainer>
        {currentIndex > 0 && (
          <NavigationButton $position="left" $isDark={isDark} onClick={handlePrev}>
            <ChevronRight style={{ transform: 'rotate(180deg)' }} />
          </NavigationButton>
        )}

        <CarouselTrack ref={carouselRef} $translateX={translateX}>
          {suggestions.map((car) => {
            const priceType = getPriceIndicator(car);
            const condition = (car as any).condition || (car.year && car.year >= new Date().getFullYear() - 1 ? 'New car' : 'Used');
            
            return (
              <SuggestionCard
                key={car.id}
                $isDark={isDark}
                onClick={() => handleCardClick(car.id)}
              >
                <SuggestionImage $isDark={isDark}>
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDark ? '#b0b0b0' : '#6b7280',
                      fontSize: '0.875rem',
                    }}>
                      {language === 'bg' ? 'Няма снимка' : 'No image'}
                    </div>
                  )}
                  <FavoriteIcon onClick={(e) => { e.stopPropagation(); }}>
                    <Heart size={18} />
                  </FavoriteIcon>
                </SuggestionImage>
                <SuggestionContent $isDark={isDark}>
                  <SuggestionTitle $isDark={isDark}>
                    {car.make} {car.model}
                  </SuggestionTitle>
                  <SuggestionSubtitle $isDark={isDark}>
                    {car.model} {car.year ? `· ${car.year}` : ''}
                  </SuggestionSubtitle>
                  
                  <PriceRow>
                    <SuggestionPrice $isDark={isDark}>
                      {formatPrice(car.price, car.currency)}
                    </SuggestionPrice>
                    <PriceIndicator $type={priceType}>
                      {priceLabel[priceType]}
                    </PriceIndicator>
                  </PriceRow>

                  <SpecsTags>
                    <SpecTag $isDark={isDark}>{condition}</SpecTag>
                    {car.year && <SpecTag $isDark={isDark}>{car.year}</SpecTag>}
                    {car.mileage && (
                      <SpecTag $isDark={isDark}>
                        {car.mileage.toLocaleString()} {language === 'bg' ? 'км' : 'km'}
                      </SpecTag>
                    )}
                    {car.power && (
                      <SpecTag $isDark={isDark}>
                        {car.power} {language === 'bg' ? 'к.с.' : 'PS'}
                      </SpecTag>
                    )}
                    {car.fuelType && <SpecTag $isDark={isDark}>{car.fuelType}</SpecTag>}
                  </SpecsTags>

                  {(car as any).consumption && (
                    <ConsumptionInfo $isDark={isDark}>
                      {(car as any).consumption} {language === 'bg' ? 'л/100км' : 'l/100km'} (comb.) • 
                      {(car as any).co2 ? ` ${(car as any).co2} g CO₂/km (comb.)` : ''}
                    </ConsumptionInfo>
                  )}

                  <LocationRow $isDark={isDark}>
                    <span>📍</span>
                    <span>
                      {(car as any).city || 'Bulgaria'}
                      {(car as any).region ? `, ${(car as any).region}` : ''}
                    </span>
                  </LocationRow>
                </SuggestionContent>
              </SuggestionCard>
            );
          })}
        </CarouselTrack>

        {currentIndex < totalPages - 1 && (
          <NavigationButton $position="right" $isDark={isDark} onClick={handleNext}>
            <ChevronRight />
          </NavigationButton>
        )}
      </CarouselContainer>

      {totalPages > 1 && (
        <NavigationDots>
          {Array.from({ length: totalPages }).map((_, index) => (
            <Dot
              key={index}
              $active={index === currentIndex}
              $isDark={isDark}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </NavigationDots>
      )}
    </SuggestionsSection>
  );
};

export default CarSuggestionsList;

// Featured Cars Component - Real Firebase Data
// عرض السيارات المميزة من البيانات الحقيقية

import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { bulgarianCarService, BulgarianCar } from '@/firebase/car-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { MapPin, Fuel, Gauge, Calendar, MessageCircle, User } from 'lucide-react';
import { homePageCache, CACHE_KEYS } from '@/services/homepage-cache.service';

interface FeaturedCarsProps {
  limit?: number;
  showFilters?: boolean;
  enablePagination?: boolean;
}

const FeaturedCarsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CarCard = styled(Link)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.15);
    border-color: #FF8F10;
  }
`;

const CarImageWrapper = styled.div`
  height: 140px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${CarCard}:hover & {
    transform: scale(1.05);
  }
`;

const PriceTag = styled.div`
  padding: 8px 10px 6px 10px;
  background: white;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-bottom: 1px;
`;

const PriceAmount = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
`;

const PriceCurrency = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000;
`;

const MonthlyLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 400;
  line-height: 1.2;
`;

const VatLabel = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
  font-weight: 400;
  margin-top: 1px;
  line-height: 1.2;
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.875rem;
  margin-right: 6px;
`;

const GoodPriceBadge = styled.div`
  display: inline-block;
  background: #00a651;
  color: white;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 0.6875rem;
  font-weight: 600;
  margin-top: 3px;
`;

const CarInfo = styled.div`
  padding: 8px 10px;
`;

const CarTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CarSpecs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: #333;
  line-height: 1.3;
`;

const SpecLine = styled.div`
  color: #666;
  font-size: 0.75rem;
  
  &:first-child {
    color: #333;
    font-weight: 500;
  }
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 10px;
  font-size: 0.75rem;
  color: #666;
`;

const SpecItem = styled.div`
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeasingInfo = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.3;
`;

const CarLocation = styled.div`
  font-size: 0.75rem;
  color: #666;
  padding-top: 6px;
  border-top: 1px solid #e9ecef;
  margin-top: 6px;
  line-height: 1.3;
`;

const SellerInfo = styled.div`
  display: none;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
  
  h3 {
    font-size: 1.5rem;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #adb5bd;
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  margin: 2rem auto 0;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #FF8F10, #FFDF00);
  color: #000;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
  }
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  limit = 4, // ⚡ OPTIMIZED: Changed default from 8 to 4
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<BulgarianCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(limit); // ⚡ OPTIMIZED: Use limit as initial display count

  useEffect(() => {
    loadFeaturedCars();
  }, [limit]);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);
      
      // ⚡ OPTIMIZED: Use cache for 5 minutes
      const result = await homePageCache.getOrFetch(
        CACHE_KEYS.FEATURED_CARS(limit),
        async () => {
          return await bulgarianCarService.searchCars(
            {}, // No filters, get all cars
            'createdAt',
            'desc',
            limit
          );
        }
      );
      
      setCars(result.cars);
    } catch (error) {
      console.error('Error loading featured cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (e: React.MouseEvent, sellerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    navigate(`/messages?userId=${sellerId}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  const visibleCars = cars.slice(0, displayCount);

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
        {visibleCars.map((car) => (
          <CarCard key={car.id} to={`/cars/${car.id}`}>
            <CarImageWrapper>
              {car.images && car.images.length > 0 ? (
              <CarImage 
                src={car.images[0]} 
                alt={`${car.make} ${car.model}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                }}
              />
              ) : (
                <CarImage 
                  as="div" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: '#ccc'
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
            </CarImage>
              )}
            </CarImageWrapper>
            
            <PriceTag>
              {car.price < 20000 ? (
                <>
                  <PriceRow>
                    <PriceAmount>{calculateMonthlyPayment(car.price)}</PriceAmount>
                    <PriceCurrency>€</PriceCurrency>
                  </PriceRow>
                  <MonthlyLabel>{language === 'bg' ? 'мес.' : 'mtl.'}</MonthlyLabel>
                  <VatLabel>{language === 'bg' ? 'с ДДС' : 'incl. VAT.'}</VatLabel>
                </>
              ) : (
                <>
                  <PriceRow>
                    {car.price > 25000 && (
                      <OldPrice>€{(car.price + 1000).toLocaleString()}</OldPrice>
                    )}
                    <PriceAmount>€{car.price.toLocaleString()}</PriceAmount>
                  </PriceRow>
                  {isGoodPrice(car.price) && (
                    <GoodPriceBadge>
                      {language === 'bg' ? 'Много добра цена' : 'Very good price'}
                    </GoodPriceBadge>
                  )}
                </>
              )}
            </PriceTag>
            
            <CarInfo>
              <CarTitle>{car.make} {car.model}</CarTitle>
              
              {car.price < 20000 && (
                <LeasingInfo>
                  {language === 'bg' ? '24 месеца, 5.000 км годишно' : '24 months, 5.000 km per year'}
                </LeasingInfo>
              )}
              
              <CarSpecs>
                {car.year && (
                  <SpecLine>
                    {new Date(car.year, 0).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { month: '2-digit', year: 'numeric' })}
                  </SpecLine>
                )}
                
                <SpecGrid>
                  <SpecItem>{car.fuelType}</SpecItem>
                  <SpecItem>{car.horsepower ? `${car.horsepower} hp` : '-'}</SpecItem>
                  <SpecItem>{car.transmission}</SpecItem>
                  {car.mileage && <SpecItem>{car.mileage.toLocaleString()} km</SpecItem>}
                </SpecGrid>
                
                {car.fuelConsumption && car.co2Emissions && car.price < 20000 && (
                  <SpecLine>
                    {car.fuelConsumption} l/100km (comb.) • {car.co2Emissions} g CO₂/km (comb.)
                  </SpecLine>
                )}
              </CarSpecs>
              
              <CarLocation>
                {car.location?.cityNameEn || 
                 car.location?.cityNameBg || 
                 car.location?.city || 
                 (typeof car.location === 'string' ? car.location : '') ||
                 (language === 'bg' ? 'България' : 'Bulgaria')}
              </CarLocation>
            </CarInfo>
          </CarCard>
        ))}
      </FeaturedCarsContainer>

      {displayCount < cars.length && (
        <ButtonWrapper>
          <ViewAllButton 
            as="button" 
            onClick={handleLoadMore}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {language === 'bg' ? 'Покажи още автомобили' : 'Load More Cars'} →
          </ViewAllButton>
        </ButtonWrapper>
      )}
      
      {displayCount >= cars.length && cars.length > 0 && (
        <ButtonWrapper>
          <ViewAllButton to="/cars">
            {language === 'bg' ? 'Виж всички автомобили' : 'View All Cars'} →
          </ViewAllButton>
        </ButtonWrapper>
      )}
    </>
  );
};

// ⚡ OPTIMIZED: Memoized to prevent unnecessary re-renders
export default memo(FeaturedCars);

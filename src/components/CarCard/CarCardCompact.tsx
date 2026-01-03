// Compact Car Card Component - mobile.de Style
// بطاقة سيارة مضغوطة - نمط mobile.de
// Applied across all car listing pages

import React, { memo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Gauge, Fuel, Calendar, MessageCircle, User, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useFavorites } from '../../hooks/useFavorites';
import { CarListing } from '../../types/CarListing';
import { logger } from '../../services/logger-service';
import PriceBadge from '../car/PriceBadge';
import RealisticPaperclipBadge from '../SoldBadge/RealisticPaperclipBadge';

interface CarCardCompactProps {
  car: CarListing | any; // Support both CarListing and BulgarianCar types
}

// Styled Components (Same as FeaturedCars)
const CarCard = styled(Link)`
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);
  }
`;

const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  position: absolute;
  top: 12px;
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
  z-index: 10;

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
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  &:hover svg {
    stroke: #ef4444;
    transform: scale(1.05);
  }
`;

const CarCardContent = styled.div`
  pointer-events: none;
`;

const CarImageWrapper = styled.div`
  height: 140px;
  position: relative;
  overflow: hidden;
  background: var(--bg-secondary);
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
  background: var(--bg-card);
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-bottom: 1px;
`;

const PriceAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const PriceCurrency = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const MonthlyLabel = styled.div`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 600;
  line-height: 1.2;
`;

const VatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 1px;
  line-height: 1.2;
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-right: 6px;
`;

const GoodPriceBadge = styled.div`
  display: inline-block;
  background: var(--success);
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
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
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
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.3;
`;

const SpecLine = styled.div`
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  
  &:first-child {
    color: var(--text-primary);
    font-weight: 700;
  }
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 10px;
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 600;
`;

const SpecItem = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeasingInfo = styled.div`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.3;
`;

const CarLocation = styled.div`
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 600;
  padding-top: 6px;
  border-top: 1px solid var(--border);
  margin-top: 6px;
  line-height: 1.3;
`;


const CarCardCompact: React.FC<CarCardCompactProps> = ({ car }) => {
  const { language } = useLanguage();
  const t = {
    bg: { sold: 'ПРОДАДЕНО' },
    en: { sold: 'SOLD' }
  }[language as 'bg' | 'en'];

  const isSold = car.isSold || car.status === 'sold';
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHearted, setIsHearted] = useState(false);

  // Check if car is favorited on mount and when favorites change
  useEffect(() => {
    setIsHearted(isFavorite(car.id));
  }, [car.id, isFavorite]);

  const calculateMonthlyPayment = (price: number): number => {
    return Math.round(price / 24);
  };

  const isGoodPrice = (price: number): boolean => {
    return price < 15000;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getMainImage = (): string | null => {
    if (car.images && car.images.length > 0) {
      const firstImage = car.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage instanceof File) {
        return URL.createObjectURL(firstImage);
      }
    }
    return null;
  };

  const getLocationName = (): string => {
    // Handle location as string
    if (car.location && typeof car.location === 'string') {
      return car.location;
    }

    // Handle location as object
    if (car.location && typeof car.location === 'object') {
      if (car.location.cityNameEn) return car.location.cityNameEn;
      if (car.location.cityNameBg) return car.location.cityNameBg;
      if (car.location.city) return car.location.city;
      if (car.location.cityName) {
        if (typeof car.location.cityName === 'string') {
          return car.location.cityName;
        }
        if (typeof car.location.cityName === 'object') {
          return car.location.cityName[language] || car.location.cityName.en || car.location.cityName.bg || '';
        }
      }
    }

    // Handle locationData
    if (car.locationData) {
      if (typeof car.locationData.cityName === 'string') {
        return car.locationData.cityName;
      }
      if (car.locationData.cityName && typeof car.locationData.cityName === 'object') {
        return car.locationData.cityName[language] || car.locationData.cityName.en || car.locationData.cityName.bg || '';
      }
      if (car.locationData.city) return car.locationData.city;
    }

    // Fallback
    if (car.region && typeof car.region === 'string') {
      return car.region;
    }

    return language === 'bg' ? 'България' : 'Bulgaria';
  };

  const price = car.price || 0;

  // ✅ CRITICAL FIX: Generate numeric URL if available, fallback to legacy URL
  const getCarUrl = (): string => {
    // Use numeric IDs if available (strict numeric ID system)
    if (car.sellerNumericId && car.carNumericId) {
      return `/car/${car.sellerNumericId}/${car.carNumericId}`;
    }
    // Fallback to legacy URL format
    return `/cars/${car.id}`;
  };

  // Handle favorite toggle
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Please login to add favorites');
      return;
    }

    try {
      const carMake = car.make || car.makeOther || 'N/A';
      const carModel = car.model || car.modelOther || 'N/A';
      const carData = {
        title: `${carMake} ${carModel}`,
        make: carMake,
        model: carModel,
        year: car.year,
        price: car.price,
        image: getMainImage() || '/placeholder-car.jpg',
        mileage: car.mileage || 0,
        location: getLocationName(),
        fuelType: car.fuelType || car.fuelTypeOther || '',
        transmission: car.transmission
      };

      const result = await toggleFavorite(car.id, carData);
      setIsHearted(result);
      logger.info('Favorite toggled', { carId: car.id, isFavorited: result });
    } catch (error) {
      logger.error('Error toggling favorite', error as Error, { carId: car.id });
      alert('Failed to update favorites');
    }
  };

  return (
    <CarCard to={getCarUrl()}>
      <FavoriteButton
        $isFavorite={isHearted}
        onClick={handleFavoriteClick}
        title={isHearted ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart />
      </FavoriteButton>

      <CarImageWrapper>
        {isSold && <RealisticPaperclipBadge text={t.sold} language={language as 'bg' | 'en'} />}
        {getMainImage() ? (
          <CarImage
            src={getMainImage()!}
            alt={`${car.make || car.makeOther || 'N/A'} ${car.model || car.modelOther || 'N/A'}`}
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
              <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </CarImage>
        )}
      </CarImageWrapper>

      <PriceTag>
        {price < 20000 ? (
          <>
            <PriceRow>
              <PriceAmount>{calculateMonthlyPayment(price)}</PriceAmount>
              <PriceCurrency>€</PriceCurrency>
            </PriceRow>
            <MonthlyLabel>{language === 'bg' ? 'мес.' : 'mtl.'}</MonthlyLabel>
            <VatLabel>{language === 'bg' ? 'с ДДС' : 'incl. VAT.'}</VatLabel>
          </>
        ) : (
          <>
            <PriceRow>
              {price > 25000 && (
                <OldPrice>€{(price + 1000).toLocaleString()}</OldPrice>
              )}
              <PriceAmount>€{price.toLocaleString()}</PriceAmount>
            </PriceRow>
            {isGoodPrice(price) && (
              <GoodPriceBadge>
                {language === 'bg' ? 'Много добра цена' : 'Very good price'}
              </GoodPriceBadge>
            )}
          </>
        )}

        {/* ✅ NEW: Price Rating Badge */}
        <PriceBadge
          price={price}
          mileage={car.mileage || 0}
          marketStats={{
            averagePrice: 15000,
            avgMileage: 120000,
            sampleSize: 50
          }}
          size="small"
        />
      </PriceTag>

      <CarInfo>
        <CarTitle>{car.make || car.makeOther || 'N/A'} {car.model || car.modelOther || 'N/A'}</CarTitle>

        {price < 20000 && (
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
            <SpecItem>{car.fuelType || '-'}</SpecItem>
            <SpecItem>{car.horsepower ? `${car.horsepower} hp` : (car.enginePower ? `${car.enginePower} hp` : '-')}</SpecItem>
            <SpecItem>{car.transmission || '-'}</SpecItem>
            {car.mileage && <SpecItem>{car.mileage.toLocaleString()} km</SpecItem>}
          </SpecGrid>

          {car.fuelConsumption && car.co2Emissions && price < 20000 && (
            <SpecLine>
              {car.fuelConsumption} l/100km (comb.) • {car.co2Emissions} g CO₂/km (comb.)
            </SpecLine>
          )}
        </CarSpecs>

        <CarLocation>
          {getLocationName()}
        </CarLocation>
      </CarInfo>
    </CarCard>
  );
};

export default memo(CarCardCompact);


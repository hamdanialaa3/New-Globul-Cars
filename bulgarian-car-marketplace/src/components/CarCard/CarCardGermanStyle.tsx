// src/components/CarCard/CarCardGermanStyle.tsx
// German-style car card component - BMW/Mobile.de style
// مكون بطاقة السيارة بالتصميم الألماني

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';
import { useLanguage } from '../../contexts/LanguageContext';

interface CarCardProps {
  car: CarListing;
}

const CardWrapper = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${CardWrapper}:hover & {
    transform: scale(1.05);
  }
`;

const NewBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  margin-bottom: 12px;
`;

const MonthlyPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const PriceDetails = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const SpecsSection = styled.div`
  margin-bottom: 12px;
`;

const SpecsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

const SpecItem = styled.span`
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
`;

const LocationSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
`;

const LocationIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '📍';
    font-size: 10px;
  }
`;

const CarCardGermanStyle: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleClick = () => {
    navigate(`/car-details/${car.id}`);
  };

  const formatPrice = (price: number, currency: string) => {
    const formattedPrice = new Intl.NumberFormat('de-DE').format(price);
    return `${formattedPrice} ${currency}`;
  };

  const formatMonthlyPrice = (price: number, currency: string) => {
    // Calculate monthly price (simplified - you can adjust the calculation)
    const monthlyPrice = Math.round(price / 36); // Assuming 36 months
    const formattedPrice = new Intl.NumberFormat('de-DE').format(monthlyPrice);
    return `${formattedPrice} ${currency} mtl.`;
  };

  const getSpecs = () => {
    const specs = [];
    
    if (car.power) specs.push(`${car.power} kW`);
    if (car.engineSize) specs.push(`${car.engineSize}L`);
    if (car.fuelType) {
      const fuelMap: { [key: string]: string } = {
        'Petrol': 'Benzin',
        'Diesel': 'Diesel',
        'Electric': 'Elektro',
        'Hybrid': 'Hybrid'
      };
      specs.push(fuelMap[car.fuelType] || car.fuelType);
    }
    if (car.transmission) {
      const transMap: { [key: string]: string } = {
        'Manual': 'Schaltgetriebe',
        'Automatic': 'Automatik',
        'Semi-Automatic': 'Halbautomatik'
      };
      specs.push(transMap[car.transmission] || car.transmission);
    }
    if (car.mileage) {
      const mileage = new Intl.NumberFormat('de-DE').format(car.mileage);
      specs.push(`${mileage} km`);
    }
    if (car.year) specs.push(`${car.year}`);
    
    return specs;
  };

  const getLocation = () => {
    if (car.city && car.region) {
      return `${car.city}, ${car.region}`;
    } else if (car.city) {
      return car.city;
    } else if (car.region) {
      return car.region;
    }
    return language === 'bg' ? 'Не е посочена' : 'Not specified';
  };

  return (
    <CardWrapper onClick={handleClick}>
      <ImageContainer>
        {car.images && car.images.length > 0 ? (
          <CarImage 
            src={car.images[0]} 
            alt={car.make + ' ' + car.model}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg';
            }}
          />
        ) : (
          <CarImage src="/images/placeholder-car.jpg" alt="No image" />
        )}
        <NewBadge>
          {language === 'bg' ? 'Ново' : 'Neues Angebot'}
        </NewBadge>
      </ImageContainer>

      <CardContent>
        <CarTitle>
          {car.make} {car.model}
        </CarTitle>

        <PriceSection>
          <MonthlyPrice>
            {formatMonthlyPrice(car.price, car.currency || 'EUR')}
          </MonthlyPrice>
          <PriceDetails>
            {language === 'bg' 
              ? 'вкл. ДДС. 36 месеца срок. 5,000 км годишно.'
              : 'inkl. MwSt. 36 Monate Laufzeit. 5.000 KM pro Jahr.'
            }
          </PriceDetails>
        </PriceSection>

        <SpecsSection>
          <SpecsRow>
            {getSpecs().map((spec, index) => (
              <SpecItem key={index}>{spec}</SpecItem>
            ))}
          </SpecsRow>
        </SpecsSection>

        <LocationSection>
          <LocationIcon />
          <span>{getLocation()}</span>
        </LocationSection>
      </CardContent>
    </CardWrapper>
  );
};

export default CarCardGermanStyle;

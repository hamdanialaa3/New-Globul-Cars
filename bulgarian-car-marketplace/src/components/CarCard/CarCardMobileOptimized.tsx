// src/components/CarCard/CarCardMobileOptimized.tsx
// Mobile-optimized car card component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ResponsiveCard } from '../ui';
import { CarListing } from '../../types/CarListing';

interface CarCardProps {
  car: CarListing;
}

const CardWrapper = styled(ResponsiveCard)`
  overflow: hidden;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  @media (max-width: 640px) {
    height: 180px;
  }
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

const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  z-index: 2;
  
  svg {
    width: 22px;
    height: 22px;
    fill: ${props => props.$isFavorite ? props.theme.colors.error?.main || '#dc3545' : 'none'};
    stroke: ${props => props.$isFavorite ? props.theme.colors.error?.main || '#dc3545' : '#666'};
    stroke-width: 2;
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const CardContent = styled.div`
  padding: 16px;
  
  @media (max-width: 640px) {
    padding: 14px;
  }
`;

const CarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-family: 'Martica', 'Arial', sans-serif;
  color: ${props => props.theme.colors.text?.primary || '#333'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  
  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const PriceTag = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary?.main || '#007bff'};
  margin-bottom: 12px;
  
  @media (max-width: 640px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  
  @media (max-width: 640px) {
    gap: 6px;
  }
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${props => props.theme.colors.text?.secondary || '#666'};
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const LocationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${props => props.theme.colors.text?.secondary || '#666'};
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.colors.grey?.[200] || '#e5e7eb'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat('bg-BG').format(mileage);
};

export const CarCardMobileOptimized: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/cars/${car.id}`);
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality
  };
  
  // Extract location text - handle both string and object formats
  const getLocationText = () => {
    // If car.city is a string, use it directly
    if (typeof car.city === 'string' && car.city) {
      return car.city;
    }
    
    // If car.region is a string, use it
    if (typeof car.region === 'string' && car.region) {
      return car.region;
    }
    
    // If car.location is a string, use it
    if (typeof car.location === 'string' && car.location) {
      return car.location;
    }
    
    // If car.location is an object with city or region
    if (car.location && typeof car.location === 'object') {
      const loc = car.location as any;
      if (loc.city) return loc.city;
      if (loc.region) return loc.region;
      if (loc.address) return loc.address;
    }
    
    // Fallback
    return 'موقع غير محدد';
  };
  
  // Get first image URL (handle File type)
  const getImageUrl = () => {
    if (!car.images || car.images.length === 0) {
      return '/placeholder-car.jpg';
    }
    
    const firstImage = car.images[0];
    if (firstImage instanceof File) {
      return URL.createObjectURL(firstImage);
    }
    return firstImage as string || '/placeholder-car.jpg';
  };
  
  return (
    <CardWrapper
      padding="none"
      hoverable
      onClick={handleCardClick}
    >
      <ImageContainer>
        <CarImage 
          src={getImageUrl()} 
          alt={`${car.make} ${car.model}`}
          loading="lazy"
        />
        <FavoriteButton
          $isFavorite={false}
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </FavoriteButton>
      </ImageContainer>
      
      <CardContent>
        <CarTitle>{car.make} {car.model}</CarTitle>
        <PriceTag>{formatPrice(car.price)}</PriceTag>
        
        <SpecsGrid>
          <SpecItem>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {car.year}
          </SpecItem>
          <SpecItem>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {formatMileage(car.mileage)} km
          </SpecItem>
          <SpecItem>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            {car.fuelType}
          </SpecItem>
          <SpecItem>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {car.transmission}
          </SpecItem>
        </SpecsGrid>
        
        <LocationTag>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {getLocationText()}
        </LocationTag>
      </CardContent>
    </CardWrapper>
  );
};

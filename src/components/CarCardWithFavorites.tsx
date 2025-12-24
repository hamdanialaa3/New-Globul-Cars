/**
 * CarCard with Favorites - Reusable Car Card Component
 * 
 * Features:
 * - Heart button for favorites
 * - Optimistic UI updates
 * - Beautiful animations
 * - Responsive design
 * - Integration with FavoritesService
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Fuel, Gauge, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { favoritesService } from '@/services/favorites.service';
import { logger } from '@/services/logger-service';
import { UnifiedCar } from '@/services/car';

interface CarCardWithFavoritesProps {
  car: UnifiedCar;
  onFavoriteChange?: (carId: string, isFavorite: boolean) => void;
}

// Animations
const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  10% { transform: scale(1.2); }
  20% { transform: scale(1.1); }
`;

const heartFill = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulseRing = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
`;

const CardContainer = styled(Link)`
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);
  }
`;

const ImageWrapper = styled.div`
  height: 180px;
  position: relative;
  overflow: hidden;
  background: var(--bg-secondary);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
`;

const FavoriteButton = styled.button<{ $isFavorite: boolean; $isLoading: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$isFavorite 
    ? 'rgba(255, 59, 92, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(8px);
  cursor: ${props => props.$isLoading ? 'wait' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: ${props => props.$isLoading ? 'none' : 'scale(1.1)'};
    background: ${props => props.$isFavorite 
      ? 'rgba(255, 59, 92, 1)' 
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: ${props => props.$isLoading ? 'none' : 'scale(0.95)'};
  }

  ${props => props.$isFavorite && `
    animation: ${heartBeat} 0.5s ease;
  `}

  svg {
    width: 20px;
    height: 20px;
    fill: ${props => props.$isFavorite ? '#fff' : 'none'};
    stroke: ${props => props.$isFavorite ? '#fff' : '#ff3b5c'};
    stroke-width: 2;
    transition: all 0.2s ease;
    
    ${props => props.$isFavorite && `
      animation: ${heartFill} 0.3s ease;
    `}
  }

  /* Pulse ring effect when favorited */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    border: 2px solid #ff3b5c;
    opacity: 0;
    
    ${props => props.$isFavorite && `
      animation: ${pulseRing} 0.6s ease;
    `}
  }
`;

const InfoSection = styled.div`
  padding: 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-secondary);

  svg {
    width: 14px;
    height: 14px;
    color: var(--accent-primary);
  }
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 12px;

  svg {
    width: 14px;
    height: 14px;
    color: var(--accent-primary);
  }
`;

const PriceSection = styled.div`
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.div`
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--accent-primary);
`;

const PriceCurrency = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  margin-left: 4px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  backdrop-filter: blur(2px);
`;

export const CarCardWithFavorites: React.FC<CarCardWithFavoritesProps> = ({ 
  car,
  onFavoriteChange 
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInitial, setIsCheckingInitial] = useState(true);

  // Check initial favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) {
        setIsCheckingInitial(false);
        return;
      }

      try {
        const status = await favoritesService.isFavorite(user.uid, car.id);
        setIsFavorite(status);
      } catch (error) {
        logger.error('[CarCard] Failed to check favorite status', error as Error);
      } finally {
        setIsCheckingInitial(false);
      }
    };

    checkFavoriteStatus();
  }, [user, car.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      // Optimistic UI update
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      // Get user numeric ID from AuthContext
      const userDoc = await favoritesService['db']
        .collection('users')
        .doc(user.uid)
        .get();
      const userNumericId = userDoc.data()?.numericId || 0;

      await favoritesService.toggleFavorite(
        user.uid,
        userNumericId,
        car.id,
        car.carNumericId || 0,
        car.sellerNumericId || 0,
        {
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          currency: car.currency || 'EUR',
          primaryImage: car.images?.[0],
          isActive: car.isActive !== false
        }
      );

      if (onFavoriteChange) {
        onFavoriteChange(car.id, newFavoriteStatus);
      }

      logger.info('[CarCard] Favorite toggled', {
        carId: car.id,
        isFavorite: newFavoriteStatus
      });
    } catch (error) {
      // Revert on error
      setIsFavorite(!isFavorite);
      logger.error('[CarCard] Failed to toggle favorite', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const carUrl = car.carNumericId && car.sellerNumericId 
    ? `/car/${car.sellerNumericId}/${car.carNumericId}`
    : `/car-details/${car.id}`;

  return (
    <CardContainer to={carUrl}>
      {isCheckingInitial && (
        <LoadingOverlay>
          <div style={{ color: 'white' }}>...</div>
        </LoadingOverlay>
      )}
      
      <ImageWrapper>
        <CarImage 
          src={car.images?.[0] || '/media/car-placeholder.png'} 
          alt={`${car.make} ${car.model}`}
          loading="lazy"
        />
        <FavoriteButton
          $isFavorite={isFavorite}
          $isLoading={isLoading}
          onClick={handleFavoriteClick}
          disabled={isLoading}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart />
        </FavoriteButton>
      </ImageWrapper>

      <InfoSection>
        <CarTitle>
          {car.make} {car.model} {car.year}
        </CarTitle>

        <SpecsGrid>
          <SpecItem>
            <Calendar />
            <span>{car.year}</span>
          </SpecItem>
          <SpecItem>
            <Gauge />
            <span>{car.mileage?.toLocaleString()} km</span>
          </SpecItem>
          <SpecItem>
            <Fuel />
            <span>{car.fuelType}</span>
          </SpecItem>
          <SpecItem>
            <span>{car.transmission}</span>
          </SpecItem>
        </SpecsGrid>

        <LocationRow>
          <MapPin />
          <span>{car.location || 'Bulgaria'}</span>
        </LocationRow>

        <PriceSection>
          <Price>
            {car.price?.toLocaleString()}
            <PriceCurrency>{car.currency || 'EUR'}</PriceCurrency>
          </Price>
        </PriceSection>
      </InfoSection>
    </CardContainer>
  );
};

export default CarCardWithFavorites;

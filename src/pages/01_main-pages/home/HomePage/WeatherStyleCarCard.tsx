/**
 * WeatherStyleCarCard.tsx
 * Карта за кола със стил на времето - Weather Style Car Card
 * Car Card with Weather-Inspired Design
 * 
 * Inspired by weather card glassmorphism design
 * Adapted for car listings with:
 * - Glassmorphism background
 * - Circular gradient accents
 * - Two action buttons (View/Save)
 * - Car info display (price, year, fuel, city)
 * 
 * @design Premium glassmorphism with floating elements
 * @responsive Mobile-first responsive design
 * @performance Optimized animations
 */

import React, { useMemo, useState } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, Calendar, MapPin } from 'lucide-react';

import { UnifiedCar } from '@/services/car';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/hooks/useFavorites';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Card = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  height: 200px;
  min-width: 320px;
  max-width: 320px;
  border-radius: 25px;
  background: ${props => props.$isDark 
    ? 'rgba(30, 41, 59, 0.7)'
    : 'rgba(248, 250, 252, 0.85)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
    : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${props => props.$isDark
      ? '0 12px 40px rgba(0, 243, 255, 0.3)'
      : '0 12px 32px rgba(0, 150, 255, 0.2)'};
  }
`;

// ============================================================================
// INFO SECTION (Top 75%)
// ============================================================================

const InfoSection = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 75%;
  color: white;
  overflow: hidden;
`;

// Background design with circles
const BackgroundDesign = styled.div<{ $primaryColor: string; $secondaryColor: string }>`
  position: absolute;
  height: 100%;
  width: 100%;
  background: var(--btn-primary-bg);
  overflow: hidden;
  z-index: 0;
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 1;
`;

const ImageFrame = styled.div`
  position: relative;
  width: 58%;
  height: 100%;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.3) 18%, rgba(0, 0, 0, 0.85) 70%, #000 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.3) 18%, rgba(0, 0, 0, 0.85) 70%, #000 100%);
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
  transform: translateX(12px);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  transition: transform 0.4s ease, opacity 0.3s ease;
  opacity: 0.92;

  ${Card}:hover & {
    transform: scale(1.08);
    opacity: 1;
  }
`;

const ImageFallback = styled.div<{ $accentColor: string }>`
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12), transparent 55%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 60%),
    linear-gradient(135deg, ${props => props.$accentColor}, rgba(0, 0, 0, 0.5));
`;

const ImageOverlay = styled.div<{ $primaryColor: string }>`
  position: absolute;
  inset: 0;
  background: var(--btn-primary-bg);
  pointer-events: none;
`;

const Circle = styled.div<{ $index: number; $accentColor: string }>`
  position: absolute;
  background-color: ${props => props.$accentColor};
  border-radius: 50%;
  opacity: ${props => props.$index === 3 ? 1 : 0.4};
  
  ${props => {
    if (props.$index === 1) {
      return `
        top: -80%;
        right: -50%;
        width: 300px;
        height: 300px;
      `;
    }
    if (props.$index === 2) {
      return `
        top: -70%;
        right: -30%;
        width: 210px;
        height: 210px;
      `;
    }
    return `
      top: -35%;
      right: -8%;
      width: 100px;
      height: 100px;
    `;
  }}
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding-left: 18px;
  position: relative;
  z-index: 2;
`;

const CarBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.95;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CarPrice = styled.div`
  font-size: 34pt;
  font-weight: 600;
  line-height: 0.8;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const CarYear = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding-right: 18px;
  position: relative;
  z-index: 2;
`;

const CarModel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const ModelName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  text-align: right;
`;

const ModelVariant = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  text-align: right;
`;

const CarLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// ============================================================================
// ACTIONS SECTION (Bottom 25%)
// ============================================================================

const ActionsSection = styled.section<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 25%;
  background: ${props => props.$isDark
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(226, 232, 240, 0.9)'};
  gap: 2px;
  box-shadow: inset 0px 2px 5px ${props => props.$isDark 
    ? 'rgba(0, 0, 0, 0.5)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const ActionButton = styled.button<{ $isDark: boolean; $isSaved?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(248, 250, 252, 0.9)'};
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  gap: 6px;
  color: ${props => {
    if (props.$isSaved) return '#ef4444'; // Red for saved
    return props.$isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.8)';
  }};
  box-shadow: inset 0px 2px 5px ${props => props.$isDark
    ? 'rgba(0, 0, 0, 0.4)'
    : 'rgba(0, 0, 0, 0.08)'};
  
  &:hover {
    transform: scale(0.95);
    border-radius: 10px;
    background: ${props => {
      if (props.$isSaved) return 'rgba(239, 68, 68, 0.1)';
      return props.$isDark
        ? 'rgba(0, 243, 255, 0.15)'
        : 'rgba(0, 150, 255, 0.12)';
    }};
    color: ${props => {
      if (props.$isSaved) return '#ef4444';
      return props.$isDark ? '#00f3ff' : '#0066ff';
    }};
  }
  
  &:active {
    transform: scale(0.92);
  }
  
  svg {
    width: 18px;
    height: 18px;
    transition: all 200ms ease;
  }
  
  &:hover svg {
    ${props => props.$isSaved 
      ? 'animation: heartBeat 0.5s ease;'
      : 'filter: drop-shadow(0 0 4px currentColor);'}
  }
  
  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1); }
    75% { transform: scale(1.15); }
  }
`;

const ButtonLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface WeatherStyleCarCardProps {
  car: UnifiedCar;
}

const WeatherStyleCarCard: React.FC<WeatherStyleCarCardProps> = ({ car }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  // Color scheme based on car price
  const getColorScheme = (price: number) => {
    if (price >= 50000) {
      return {
        primary: '#6366f1', // Indigo for luxury
        secondary: '#8b5cf6', // Purple
        accent: '#a78bfa' // Light purple
      };
    } else if (price >= 30000) {
      return {
        primary: '#3b82f6', // Blue for mid-range
        secondary: '#2563eb',
        accent: '#60a5fa'
      };
    } else {
      return {
        primary: '#10b981', // Green for affordable
        secondary: '#059669',
        accent: '#34d399'
      };
    }
  };

  const colors = getColorScheme(car.price || 0);

  const imageUrl = useMemo(() => {
    if (imageError) return '';
    if (car.mainImage) return car.mainImage;
    if (Array.isArray(car.images) && car.images.length > 0) {
      // Use featuredImageIndex if available, fallback to first image
      const featuredIdx = car.featuredImageIndex || 0;
      return car.images[featuredIdx] || car.images[0];
    }
    return '';
  }, [car.images, car.mainImage, car.featuredImageIndex, imageError]);

  const handleViewDetails = () => {
    // ✅ CONSTITUTION: Use numeric URL pattern
    const sellerNumericId = car.sellerNumericId || (car as any).ownerNumericId;
    const carNumericId = car.carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
    
    if (sellerNumericId && carNumericId) {
      navigate(`/car/${sellerNumericId}/${carNumericId}`);
    } else {
      // Car missing numeric IDs - show in list view
      navigate('/cars');
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(car.id, {
      make: car.make || '',
      model: car.model || '',
      year: car.year || 0,
      price: car.price || 0,
      currency: 'EUR',
      sellerNumericId: car.sellerNumericId || (car as any).ownerNumericId || 0,
      carNumericId: car.carNumericId || (car as any).userCarSequenceId || 0,
      primaryImage: imageUrl || undefined,
    });
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(car.price || 0);

  // Extract numeric part only (remove currency symbol)
  const priceNumber = formattedPrice.replace(/[^\d]/g, '');

  return (
    <Card $isDark={isDark}>
      {/* Info Section */}
      <InfoSection>
        <BackgroundDesign 
          $primaryColor={colors.primary}
          $secondaryColor={colors.secondary}
        >
          <Circle $index={1} $accentColor={colors.accent} />
          <Circle $index={2} $accentColor={colors.accent} />
          <Circle $index={3} $accentColor={colors.accent} />
        </BackgroundDesign>

        <ImageWrapper>
          <ImageFrame>
            {imageUrl ? (
              <CarImage 
                src={imageUrl} 
                alt={`${car.make || 'Car'} ${car.model || ''}`.trim()}
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageFallback $accentColor={colors.accent} />
            )}
            <ImageOverlay $primaryColor={colors.primary} />
          </ImageFrame>
        </ImageWrapper>
        
        <LeftSide>
          <CarBrand>
            <Calendar size={16} />
            <span>{car.year || 'N/A'}</span>
          </CarBrand>
          <CarPrice>{priceNumber}€</CarPrice>
          <CarYear>
            {car.mileage ? `${car.mileage.toLocaleString()} km` : isBg ? 'Не е посочен' : 'Not specified'}
          </CarYear>
        </LeftSide>
        
        <RightSide>
          <CarModel>
            <ModelName>{car.make || 'Unknown'}</ModelName>
            <ModelVariant>{car.model || 'Model'}</ModelVariant>
          </CarModel>
          <CarLocation>
            <MapPin size={14} />
            <span>{car.city || (isBg ? 'София' : 'Sofia')}</span>
          </CarLocation>
        </RightSide>
      </InfoSection>

      {/* Actions Section */}
      <ActionsSection $isDark={isDark}>
        <ActionButton 
          $isDark={isDark}
          onClick={handleViewDetails}
          title={isBg ? 'Виж детайли' : 'View details'}
        >
          <Eye size={18} />
          <ButtonLabel>{isBg ? 'Виж' : 'View'}</ButtonLabel>
        </ActionButton>
        
        <ActionButton 
          $isDark={isDark}
          $isSaved={isFavorite(car.id)}
          onClick={handleToggleSave}
          title={isFavorite(car.id) ? (isBg ? 'Премахни' : 'Remove') : (isBg ? 'Запази' : 'Save')}
        >
          <Heart size={18} fill={isFavorite(car.id) ? '#ef4444' : 'none'} />
          <ButtonLabel>{isFavorite(car.id) ? (isBg ? 'Запазено' : 'Saved') : (isBg ? 'Запази' : 'Save')}</ButtonLabel>
        </ActionButton>
      </ActionsSection>
    </Card>
  );
};

export default WeatherStyleCarCard;

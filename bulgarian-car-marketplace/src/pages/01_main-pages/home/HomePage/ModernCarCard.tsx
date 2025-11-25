// Modern Car Card Component - Inspired by Premium Design

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { UnifiedCar } from '@/services/car';
import { Ruler, Fuel, Settings, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import GlobulCarLogo from '@/components/icons/GlobulCarLogo';

// Styled Components
const CardContainer = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 12px rgba(0, 0, 0, 0.3)' 
    : '0 2px 12px rgba(0, 0, 0, 0.08)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.$isDark 
      ? '0 12px 32px rgba(0, 0, 0, 0.5)' 
      : '0 12px 32px rgba(0, 0, 0, 0.15)'};
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* 3:2 Aspect Ratio */
  background: linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%);
  overflow: hidden;
`;

const CarImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;

  ${CardContainer}:hover & {
    transform: scale(1.1);
  }
`;

const ImagePlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StatusBadge = styled.div<{ type: 'new' | 'used' | 'featured' }>`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${props => {
    if (props.type === 'new') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.type === 'featured') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  }};
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 2;

  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    padding: 5px 12px;
    font-size: 0.6875rem;
  }
`;

const FavoriteButton = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};

  &:hover {
    transform: scale(1.1);
    background: ${props => props.$isDark ? '#334155' : '#ffffff'};
    color: #ef4444;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    top: 12px;
    right: 12px;
  }
`;

const CardContent = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CarTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.375rem;
  font-weight: 800;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const CarSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 0.9375rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0 0 16px 0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-bottom: 12px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const SpecItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : 'transparent'};

  &:hover {
    background: ${props => props.$isDark ? '#1e293b' : '#f1f5f9'};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 8px 6px;
    border-radius: 8px;
  }
`;

const SpecIcon = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  color: ${props => props.$isDark ? '#60a5fa' : '#3b82f6'};

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const SpecValue = styled.div<{ $isDark: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const SpecLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.6875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.625rem;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 16px 0;

  @media (max-width: 768px) {
    margin: 12px 0;
  }
`;

const PriceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Price = styled.div`
  font-size: 1.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PriceLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.6875rem;
  }
`;

const ViewButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
    border-radius: 10px;
  }
`;

const LocationBadge = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(102, 126, 234, 0.1)'};
  border-radius: 20px;
  font-size: 0.8125rem;
  color: ${props => props.$isDark ? '#60a5fa' : '#667eea'};
  font-weight: 600;
  margin-bottom: 12px;
  width: fit-content;

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 5px 10px;
  }
`;

// Component Props
interface ModernCarCardProps {
  car: UnifiedCar;
  showStatus?: boolean;
  onFavorite?: (carId: string) => void;
}

const ModernCarCard: React.FC<ModernCarCardProps> = ({
  car,
  showStatus = true,
  onFavorite
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCardClick = () => {
    navigate(`/car/${car.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(car.id);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage: number): string => {
    return `${(mileage / 1000).toFixed(0)}k`;
  };

  const getStatusType = (): 'new' | 'used' | 'featured' => {
    if (car.condition === 'new') return 'new';
    if (car.isFeatured) return 'featured';
    return 'used';
  };

  const getStatusLabel = (): string => {
    if (car.condition === 'new') return language === 'bg' ? 'Нов' : 'New';
    if (car.isFeatured) return language === 'bg' ? 'Препоръчан' : 'Featured';
    return language === 'bg' ? 'Използван' : 'Used';
  };

  // Helper to get location string
  const getLocation = () => {
    if (typeof car.location === 'string') return car.location;
    if (language === 'bg' && car.location?.cityNameBg) return car.location.cityNameBg;
    if (car.location?.cityNameEn) return car.location.cityNameEn;
    if (car.location?.city) return car.location.city;
    return language === 'bg' ? 'България' : 'Bulgaria';
  };

  const getTransmissionLabel = (): string => {
    if (!car.transmission) return language === 'bg' ? 'Автоматична' : 'Automatic';
    const trans = car.transmission.toLowerCase();
    if (trans.includes('auto') || trans.includes('авто')) {
      return language === 'bg' ? 'Автоматична' : 'Automatic';
    }
    return language === 'bg' ? 'Ръчна' : 'Manual';
  };

  const getFuelTypeLabel = (): string => {
    if (!car.fuelType) return language === 'bg' ? 'Бензин' : 'Petrol';
    const fuel = car.fuelType.toLowerCase();
    const fuelMap: Record<string, { bg: string; en: string }> = {
      'petrol': { bg: 'Бензин', en: 'Petrol' },
      'diesel': { bg: 'Дизел', en: 'Diesel' },
      'electric': { bg: 'Електрически', en: 'Electric' },
      'hybrid': { bg: 'Хибриден', en: 'Hybrid' },
      'lpg': { bg: 'LPG', en: 'LPG' },
      'cng': { bg: 'CNG', en: 'CNG' }
    };
    for (const [key, value] of Object.entries(fuelMap)) {
      if (fuel.includes(key)) {
        return language === 'bg' ? value.bg : value.en;
      }
    }
    return car.fuelType;
  };

  return (
    <CardContainer onClick={handleCardClick} $isDark={isDark}>
      <ImageContainer>
        {car.images && car.images.length > 0 ? (
          <CarImage
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder>
            <GlobulCarLogo size={64} />
          </ImagePlaceholder>
        )}

        {showStatus && (
          <StatusBadge type={getStatusType()}>
            {getStatusLabel()}
          </StatusBadge>
        )}

        <FavoriteButton onClick={handleFavoriteClick} $isDark={isDark}>
          <Heart size={18} />
        </FavoriteButton>
      </ImageContainer>

      <CardContent>
        <LocationBadge $isDark={isDark}>
          <MapPin size={14} />
          {getLocation()}
        </LocationBadge>

        <CarTitle $isDark={isDark}>{car.make} {car.model}</CarTitle>
        <CarSubtitle $isDark={isDark}>{car.year} • {getTransmissionLabel()}</CarSubtitle>

        <SpecsGrid>
          <SpecItem $isDark={isDark}>
            <SpecIcon $isDark={isDark}>
              <Ruler size={18} />
            </SpecIcon>
            <SpecValue $isDark={isDark}>{formatMileage(car.mileage || 0)}</SpecValue>
            <SpecLabel $isDark={isDark}>{language === 'bg' ? 'км' : 'km'}</SpecLabel>
          </SpecItem>
          <SpecItem $isDark={isDark}>
            <SpecIcon $isDark={isDark}>
              <Fuel size={18} />
            </SpecIcon>
            <SpecValue $isDark={isDark}>{getFuelTypeLabel()}</SpecValue>
            <SpecLabel $isDark={isDark}>{language === 'bg' ? 'Гориво' : 'Fuel'}</SpecLabel>
          </SpecItem>
          <SpecItem $isDark={isDark}>
            <SpecIcon $isDark={isDark}>
              <Settings size={18} />
            </SpecIcon>
            <SpecValue $isDark={isDark}>{car.horsepower ? `${car.horsepower} hp` : '2.0L'}</SpecValue>
            <SpecLabel $isDark={isDark}>{language === 'bg' ? 'Мощност' : 'Power'}</SpecLabel>
          </SpecItem>
        </SpecsGrid>

        <Divider />

        <PriceSection>
          <PriceContainer>
            <Price>{formatPrice(car.price || 0)}</Price>
            <PriceLabel>{language === 'bg' ? 'Крайна цена' : 'Final Price'}</PriceLabel>
          </PriceContainer>
          <ViewButton>{language === 'bg' ? 'Виж детайли' : 'View Details'}</ViewButton>
        </PriceSection>
      </CardContent>
    </CardContainer>
  );
};

export default ModernCarCard;

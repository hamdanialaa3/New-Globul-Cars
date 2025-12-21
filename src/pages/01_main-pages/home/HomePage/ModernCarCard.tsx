// Modern Car Card Component - Inspired by Premium Design

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { UnifiedCar } from '../../../../services/car';
import { Ruler, Fuel, Settings, MapPin } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import GlobulCarLogo from '../../../../components/icons/GlobulCarLogo';

// Styled Components
const CardContainer = styled.div<{ $isDark: boolean }>`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-primary);

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-accent);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* 3:2 Aspect Ratio */
  background: var(--bg-hover);
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
  background: var(--bg-secondary);
`;

const StatusBadge = styled.div<{ type: 'new' | 'used' | 'featured' }>`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${props => {
    if (props.type === 'new') return 'var(--success)';
    if (props.type === 'featured') return 'var(--warning)';
    return 'var(--info)';
  }};
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-sm);
  z-index: 2;

  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    padding: 5px 12px;
    font-size: 0.6875rem;
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
  color: var(--text-primary);
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
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);

  &:hover {
    background: var(--bg-hover);
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
  color: var(--accent-primary);

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
  color: var(--text-primary);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const SpecLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.6875rem;
  color: var(--text-tertiary);
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
  background: var(--border-primary);
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
  color: var(--accent-primary);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PriceLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.6875rem;
  }
`;


const LocationBadge = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-accent);
  border-radius: 20px;
  font-size: 0.8125rem;
  color: var(--accent-primary);
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
    import('../../../../utils/routing-utils').then(({ getCarUrlFromUnifiedCar }) => {
      navigate(getCarUrlFromUnifiedCar(car));
    });
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
    if (language === 'bg' && car.location?.cityNameBg) return car.locationData?.cityNameNameBg;
    if (car.location?.cityNameEn) return car.locationData?.cityNameNameEn;
    if (car.location?.city) return car.locationData?.cityName;
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
            <Price>{formatPrice((car as any).netPrice || (car as any).finalPrice || car.price || 0)}</Price>
            <PriceLabel>{language === 'bg' ? 'Нето цена' : 'Net Price'}</PriceLabel>
          </PriceContainer>
        </PriceSection>
      </CardContent>
    </CardContainer>
  );
};

export default ModernCarCard;

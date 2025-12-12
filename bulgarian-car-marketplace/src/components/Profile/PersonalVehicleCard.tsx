// Personal Vehicle Card Component
// بطاقة عرض المركبة الشخصية

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PersonalVehicle } from '../../types/personal-vehicle.types';
import { getCarLogoUrl } from '../../services/car-logo-service';

interface PersonalVehicleCardProps {
  vehicle: PersonalVehicle;
  onEdit?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
}

// Animations
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shine = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Styled Components
const Card = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${slideUp} 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-primary);
    
    &::before {
      left: 100%;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const VehicleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const VehicleYear = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const VehicleImage = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LogoPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const VehicleDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const Icon = styled.span`
  font-size: 1.2rem;
`;

const Text = styled.span`
  flex: 1;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
`;

const MarketValue = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 2px solid #f59e0b;
  margin-bottom: 1rem;
`;

const MarketLabel = styled.div`
  font-size: 0.875rem;
  color: #78350f;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const MarketValueAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400e;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
`;

const Currency = styled.span`
  font-size: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  border: 2px solid ${props => 
    props.$variant === 'delete' ? '#ef4444' : 'var(--border)'};
  background: ${props => 
    props.$variant === 'delete' 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'var(--bg-card)'};
  color: ${props => 
    props.$variant === 'delete' ? '#ef4444' : 'var(--text-primary)'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      props.$variant === 'delete' 
        ? 'rgba(239, 68, 68, 0.3)' 
        : 'rgba(0, 0, 0, 0.1)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const getColorLabel = (color: string, language: string): string => {
  const colorMap: Record<string, { bg: string; en: string }> = {
    beige: { bg: 'Бежов', en: 'Beige' },
    brown: { bg: 'Кафяв', en: 'Brown' },
    gold: { bg: 'Златист', en: 'Gold' },
    green: { bg: 'Зелен', en: 'Green' },
    red: { bg: 'Червен', en: 'Red' },
    silver: { bg: 'Сребрист', en: 'Silver' },
    blue: { bg: 'Син', en: 'Blue' },
    black: { bg: 'Черен', en: 'Black' },
    gray: { bg: 'Сив', en: 'Gray' },
    orange: { bg: 'Оранжев', en: 'Orange' },
    yellow: { bg: 'Жълт', en: 'Yellow' },
    violet: { bg: 'Виолетов', en: 'Violet' },
    white: { bg: 'Бял', en: 'White' },
  };
  
  const colorData = colorMap[color.toLowerCase()];
  return colorData ? (language === 'bg' ? colorData.bg : colorData.en) : color;
};

const getFuelTypeLabel = (fuelType: string, language: string): string => {
  const fuelMap: Record<string, { bg: string; en: string }> = {
    petrol: { bg: 'Бензин', en: 'Petrol' },
    diesel: { bg: 'Дизел', en: 'Diesel' },
    electric: { bg: 'Електрически', en: 'Electric' },
    hybrid: { bg: 'Хибриден', en: 'Hybrid' },
    lpg: { bg: 'LPG', en: 'LPG' },
  };
  
  const fuelData = fuelMap[fuelType];
  return fuelData ? (language === 'bg' ? fuelData.bg : fuelData.en) : fuelType;
};

export const PersonalVehicleCard: React.FC<PersonalVehicleCardProps> = ({
  vehicle,
  onEdit,
  onDelete,
}) => {
  const { language } = useLanguage();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US').format(num);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <VehicleTitle>
            {vehicle.make} {vehicle.model}
          </VehicleTitle>
          <VehicleYear>{vehicle.firstRegistration.year}</VehicleYear>
        </div>
      </CardHeader>

      <VehicleImage>
        <LogoPlaceholder>
          <img 
            src={getCarLogoUrl(vehicle.make)} 
            alt={vehicle.make}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/car-placeholder.jpg';
            }}
          />
        </LogoPlaceholder>
      </VehicleImage>

      <VehicleDetails>
        <Detail>
          <Icon>🎨</Icon>
          <Text>
            {getColorLabel(vehicle.exteriorColor.name, language)}
            {vehicle.exteriorColor.isMetallic && (
              <Badge style={{ marginLeft: '0.5rem' }}>
                {language === 'bg' ? 'Металик' : 'Metallic'}
              </Badge>
            )}
          </Text>
        </Detail>
        <Detail>
          <Icon>📏</Icon>
          <Text>{formatNumber(vehicle.currentMileage)} km</Text>
        </Detail>
        <Detail>
          <Icon>⛽</Icon>
          <Text>{getFuelTypeLabel(vehicle.fuelType, language)}</Text>
        </Detail>
        <Detail>
          <Icon>⚙️</Icon>
          <Text>
            {vehicle.transmission === 'manual'
              ? (language === 'bg' ? 'Ръчна' : 'Manual')
              : (language === 'bg' ? 'Автоматична' : 'Automatic')}
          </Text>
        </Detail>
        <Detail>
          <Icon>💪</Icon>
          <Text>
            {vehicle.power.hp} PS ({vehicle.power.kw} KW)
          </Text>
        </Detail>
      </VehicleDetails>

      {vehicle.marketValue && (
        <MarketValue>
          <MarketLabel>
            {language === 'bg' ? 'Пазарна стойност' : 'Market Value'}
          </MarketLabel>
          <MarketValueAmount>
            {formatNumber(vehicle.marketValue)}
            <Currency>€</Currency>
          </MarketValueAmount>
        </MarketValue>
      )}

      <Actions>
        {onEdit && (
          <ActionButton $variant="edit" onClick={() => onEdit(vehicle.id)}>
            <Edit2 size={18} />
            {language === 'bg' ? 'Редактирай' : 'Edit'}
          </ActionButton>
        )}
        {onDelete && (
          <ActionButton $variant="delete" onClick={() => onDelete(vehicle.id)}>
            <Trash2 size={18} />
            {language === 'bg' ? 'Изтрий' : 'Delete'}
          </ActionButton>
        )}
      </Actions>
    </Card>
  );
};

export default PersonalVehicleCard;

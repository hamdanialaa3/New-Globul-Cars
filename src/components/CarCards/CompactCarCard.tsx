/**
 * Compact Car Card Component
 * Modern, elegant small card design for My Ads page
 * 
 * Features:
 * - Compact size with elegant design
 * - Modern glassmorphism effects
 * - Smooth animations
 * - Dark mode support
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar, Gauge, Fuel, MapPin, Eye, Edit2, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { UnifiedCar } from '../../services/car';

interface CompactCarCardProps {
  car: UnifiedCar | any;
  isOwnProfile?: boolean;
  onEdit?: (carId: string) => void;
  onClone?: (carId: string) => void;
  onView?: (carId: string) => void;
  showStatus?: boolean;
}

const getCarDetailsUrl = (car: any) => {
  const sellerNumericId = car.sellerNumericId || car.ownerNumericId;
  const carNumericId = car.carNumericId || car.userCarSequenceId || car.numericId;

  if (sellerNumericId && carNumericId) {
    return `/car/${sellerNumericId}/${carNumericId}`;
  }
  return `/car-details/${car.id}`;
};

const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('bg-BG', { 
    style: 'currency', 
    currency: 'EUR', 
    maximumFractionDigits: 0 
  }).format(price);
};

const CompactCarCard: React.FC<CompactCarCardProps> = ({
  car,
  isOwnProfile = false,
  onEdit,
  onClone,
  onView,
  showStatus = false
}) => {
  const detailsUrl = getCarDetailsUrl(car);
  const mainImage = car.images?.[0] || car.mainImage?.url || '/images/placeholder-car.jpg';
  
  // Status determination
  const isActive = car.isActive !== false && car.isSold !== true;
  const isSold = car.isSold === true;
  const isPending = car.status === 'pending' || car.isActive === false;

  const getStatusBadge = () => {
    if (isSold) {
      return { icon: CheckCircle, text: 'Продаден', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
    }
    if (isPending) {
      return { icon: Clock, text: 'В изчакване', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    if (isActive) {
      return { icon: CheckCircle, text: 'Активен', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    }
    return null;
  };

  const statusBadge = showStatus ? getStatusBadge() : null;
  const StatusIcon = statusBadge?.icon;

  return (
    <CardContainer>
      {/* Image Section */}
      <ImageWrapper>
        <CardImage 
          src={mainImage} 
          alt={`${car.make} ${car.model}`}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg'; }}
        />
        <ImageOverlay />
        
        {/* Status Badge */}
        {statusBadge && StatusIcon && (
          <StatusBadge $color={statusBadge.color} $bg={statusBadge.bg}>
            <StatusIcon size={12} />
            <span>{statusBadge.text}</span>
          </StatusBadge>
        )}

        {/* Action Buttons Overlay */}
        {isOwnProfile && (
          <ActionButtons>
            {onView && (
              <ActionButton 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onView(car.id);
                }}
                $variant="view"
              >
                <Eye size={14} />
              </ActionButton>
            )}
            {onEdit && (
              <ActionButton 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(car.id!);
                }}
                $variant="edit"
              >
                <Edit2 size={14} />
              </ActionButton>
            )}
            {onClone && (
              <ActionButton 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClone(car.id!);
                }}
                $variant="clone"
              >
                <Copy size={14} />
              </ActionButton>
            )}
          </ActionButtons>
        )}
      </ImageWrapper>

      {/* Content Section */}
      <CardContent>
        <CardHeader>
          <CardTitle to={detailsUrl}>
            {car.make} {car.model}
          </CardTitle>
          <CardYear>{car.year}</CardYear>
        </CardHeader>

        {/* Specs Grid */}
        <SpecsGrid>
          <SpecItem>
            <Gauge size={12} />
            <span>{car.mileage ? `${(car.mileage / 1000).toFixed(0)}k` : 'N/A'} км</span>
          </SpecItem>
          <SpecItem>
            <Fuel size={12} />
            <span>{car.fuelType || 'N/A'}</span>
          </SpecItem>
          <SpecItem>
            <MapPin size={12} />
            <span className="truncate">{car.location?.city || car.city || 'N/A'}</span>
          </SpecItem>
        </SpecsGrid>

        {/* Price Section */}
        <PriceSection>
          <Price>{formatCurrency(car.price || 0)}</Price>
          <ViewLink to={detailsUrl}>
            Преглед
          </ViewLink>
        </PriceSection>
      </CardContent>
    </CardContainer>
  );
};

// Styled Components
const CardContainer = styled.div`
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--accent-primary);
  }

  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 143, 16, 0.5);
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  ${CardContainer}:hover & {
    transform: scale(1.08);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;

  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

const StatusBadge = styled.div<{ $color: string; $bg: string }>`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.3s ease;
  z-index: 3;

  ${CardContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button<{ $variant: 'view' | 'edit' | 'clone' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `
          background: rgba(59, 130, 246, 0.9);
          color: white;
          &:hover {
            background: rgba(59, 130, 246, 1);
            transform: scale(1.1);
          }
        `;
      case 'edit':
        return `
          background: rgba(255, 255, 255, 0.9);
          color: #1e293b;
          &:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.1);
          }
        `;
      case 'clone':
        return `
          background: rgba(34, 197, 94, 0.9);
          color: white;
          &:hover {
            background: rgba(34, 197, 94, 1);
            transform: scale(1.1);
          }
        `;
    }
  }}
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`;

const CardTitle = styled(Link)`
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  flex: 1;
  line-height: 1.3;
  transition: color 0.2s ease;

  &:hover {
    color: var(--accent-primary);
  }

  html[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const CardYear = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 6px;

  html[data-theme="dark"] & {
    background: #0f172a;
    color: #94a3b8;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;

  svg {
    flex-shrink: 0;
    opacity: 0.6;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  html[data-theme="dark"] & {
    color: #94a3b8;
  }
`;

const PriceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  margin-top: auto;
  border-top: 1px solid var(--border);
`;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--accent-primary);
  letter-spacing: -0.5px;

  html[data-theme="dark"] & {
    color: #ff8f10;
  }
`;

const ViewLink = styled(Link)`
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-primary);
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;

  &:hover {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }

  html[data-theme="dark"] & {
    color: #ff8f10;
    &:hover {
      background: #ff8f10;
      color: #0f172a;
    }
  }
`;

export default CompactCarCard;


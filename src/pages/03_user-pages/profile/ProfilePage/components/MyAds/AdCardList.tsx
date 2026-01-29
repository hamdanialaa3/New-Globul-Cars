// AdCardList.tsx
// Fixed List View with CSS Grid layout

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, Edit2, Copy, Calendar, Gauge, Fuel, MapPin } from 'lucide-react';
import { UnifiedCar } from '../../../../../../services/car';
import { useLanguage } from '../../../../../../contexts/LanguageContext';

interface AdCardListProps {
  cars: UnifiedCar[];
  isOwnProfile: boolean;
  onView: (car: UnifiedCar) => void;
  onEdit: (car: UnifiedCar) => void;
  onClone?: (carId: string) => void;
  isDark?: boolean;
}

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListCard = styled(motion.div)<{ $isDark?: boolean }>`
  display: grid;
  grid-template-columns: 140px minmax(200px, 2fr) minmax(100px, 1fr) minmax(120px, 1fr) auto;
  gap: 1.25rem;
  padding: 1.25rem;
  background: ${({ $isDark }) => $isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #ff8f10;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 120px minmax(180px, 2fr) minmax(100px, 1fr) auto;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
    padding: 1rem;
    align-items: flex-start;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 120px;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Placeholder when image fails to load */
  &::after {
    content: '🚗';
    position: absolute;
    font-size: 2rem;
    opacity: 0.3;
    display: none;
  }

  img[src=""],
  img:not([src]) {
    opacity: 0;
  }

  img[src=""] ~ &::after,
  img:not([src]) ~ &::after {
    display: block;
  }
`;

const CarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

const CarTitle = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const CarSpecs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    font-size: 0.8125rem;
  }
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  min-width: 120px;
  text-align: right;
  justify-self: flex-end;

  @media (max-width: 1200px) {
    grid-column: 3;
    grid-row: 1;
    justify-self: flex-end;
  }

  @media (max-width: 768px) {
    grid-column: 2;
    grid-row: 2;
    align-items: flex-start;
    text-align: left;
    justify-self: flex-start;
    margin-top: 0.5rem;
  }
`;

const Price = styled.div<{ $isDark?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#22c55e' : '#15803d'};
`;

const Year = styled.div<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
`;

const StatusBadge = styled.div<{ $status: 'active' | 'sold' | 'pending'; $isDark?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $status, $isDark }) => {
    switch ($status) {
      case 'active':
        return `
          background: ${$isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'};
          color: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
        `;
      case 'sold':
        return `
          background: ${$isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'};
          color: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
        `;
      case 'pending':
        return `
          background: ${$isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)'};
          color: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
        `;
      default:
        return '';
    }
  }}
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  min-width: fit-content;

  @media (max-width: 1024px) {
    grid-column: 4;
    grid-row: 1;
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    grid-row: 3;
    justify-content: flex-start;
    margin-top: 0.75rem;
    width: 100%;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary'; $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: ${({ $variant, $isDark }) => 
    $variant === 'primary' 
      ? '#ff8f10'
      : ($isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  color: ${({ $variant, $isDark }) => 
    $variant === 'primary' 
      ? '#ffffff'
      : ($isDark ? '#e2e8f0' : '#1e293b')};
  border: ${({ $variant }) => 
    $variant === 'primary' 
      ? 'none'
      : '1px solid rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $variant }) => 
      $variant === 'primary' 
        ? '#ff7900'
        : 'rgba(255, 143, 16, 0.1)'};
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }
`;

const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

const formatMileage = (mileage: number): string => {
  if (mileage >= 1000) {
    return `${(mileage / 1000).toFixed(1)}k km`;
  }
  return `${mileage} km`;
};

// Placeholder SVG for missing images
const PLACEHOLDER_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5KvPC90ZXh0Pjwvc3ZnPg==';

export const AdCardList: React.FC<AdCardListProps> = ({
  cars,
  isOwnProfile,
  onView,
  onEdit,
  onClone,
  isDark = false
}) => {
  const { language } = useLanguage();

  const getCarStatus = (car: UnifiedCar): 'active' | 'sold' | 'pending' => {
    if (car.isSold) return 'sold';
    if (!car.isActive || car.status === 'pending') return 'pending';
    return 'active';
  };

  const getStatusLabel = (status: 'active' | 'sold' | 'pending'): string => {
    const labels = {
      active: language === 'bg' ? 'Активна' : 'Active',
      sold: language === 'bg' ? 'Продадена' : 'Sold',
      pending: language === 'bg' ? 'В изчакване' : 'Pending'
    };
    return labels[status];
  };

  return (
    <ListContainer>
      {cars.map((car, index) => {
        const status = getCarStatus(car);
        
        // Enhanced image URL handling - try multiple sources
        let imageUrl = '';
        
        // Try mainImage first
        if (car.mainImage) {
          if (typeof car.mainImage === 'string') {
            imageUrl = car.mainImage;
          } else if (car.mainImage && typeof car.mainImage === 'object') {
            imageUrl = (car.mainImage as any).url || (car.mainImage as any).src || '';
          }
        }
        
        // Try images array if mainImage failed
        if (!imageUrl && car.images && car.images.length > 0) {
          const firstImage = car.images[0];
          if (typeof firstImage === 'string') {
            imageUrl = firstImage;
          } else if (firstImage && typeof firstImage === 'object') {
            imageUrl = (firstImage as any).url || (firstImage as any).src || '';
          }
        }
        
        // Try direct image property
        if (!imageUrl && (car as any).image) {
          imageUrl = typeof (car as any).image === 'string' 
            ? (car as any).image 
            : ((car as any).image?.url || (car as any).image?.src || '');
        }
        
        // Fallback placeholder SVG
        if (!imageUrl || imageUrl.trim() === '') {
          imageUrl = PLACEHOLDER_SVG;
        }
        
        const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
        const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId;

        return (
          <ListCard
            key={car.id || index}
            $isDark={isDark}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onView(car)}
          >
            <ImageContainer>
              <img 
                src={imageUrl} 
                alt={`${car.make || ''} ${car.model || ''}`}
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder on error
                  const target = e.target as HTMLImageElement;
                  if (target.src !== PLACEHOLDER_SVG) {
                    target.src = PLACEHOLDER_SVG;
                    target.onerror = null; // Prevent infinite loop
                  }
                }}
                onLoad={(e) => {
                  // Ensure image is visible
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
              />
            </ImageContainer>

            <CarInfo>
              <CarTitle $isDark={isDark}>
                {car.make || ''} {car.model || ''}
              </CarTitle>
              <CarSpecs>
                {car.year && (
                  <SpecItem>
                    <Calendar size={14} />
                    <span>{car.year}</span>
                  </SpecItem>
                )}
                {car.mileage && car.mileage > 0 && (
                  <SpecItem>
                    <Gauge size={14} />
                    <span>{formatMileage(car.mileage)}</span>
                  </SpecItem>
                )}
                {car.fuelType && (
                  <SpecItem>
                    <Fuel size={14} />
                    <span>{car.fuelType}</span>
                  </SpecItem>
                )}
                {car.location?.city && (
                  <SpecItem>
                    <MapPin size={14} />
                    <span>{car.location.city}</span>
                  </SpecItem>
                )}
              </CarSpecs>
              <StatusBadge $status={status} $isDark={isDark}>
                {getStatusLabel(status)}
              </StatusBadge>
            </CarInfo>

            <PriceContainer>
              <Price $isDark={isDark}>
                {car.price ? formatCurrency(car.price) : language === 'bg' ? 'Цена по запитване' : 'Price on request'}
              </Price>
              {car.year && <Year $isDark={isDark}>{car.year}</Year>}
            </PriceContainer>

            <ActionsContainer>
              <ActionButton
                $variant="secondary"
                $isDark={isDark}
                onClick={(e) => {
                  e.stopPropagation();
                  if (sellerNumericId && carNumericId) {
                    window.open(`/car/${sellerNumericId}/${carNumericId}`, '_blank');
                  } else {
                    onView(car);
                  }
                }}
                title={language === 'bg' ? 'Преглед' : 'View'}
              >
                <Eye size={14} />
                {language === 'bg' ? 'Преглед' : 'View'}
              </ActionButton>
              {isOwnProfile && (
                <>
                  <ActionButton
                    $variant="secondary"
                    $isDark={isDark}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(car);
                    }}
                    title={language === 'bg' ? 'Редактирай' : 'Edit'}
                  >
                    <Edit2 size={14} />
                    {language === 'bg' ? 'Редактирай' : 'Edit'}
                  </ActionButton>
                  {onClone && (
                    <ActionButton
                      $variant="primary"
                      $isDark={isDark}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClone(car.id!);
                      }}
                      title={language === 'bg' ? 'Клонирай' : 'Clone'}
                    >
                      <Copy size={14} />
                    </ActionButton>
                  )}
                </>
              )}
            </ActionsContainer>
          </ListCard>
        );
      })}
    </ListContainer>
  );
};


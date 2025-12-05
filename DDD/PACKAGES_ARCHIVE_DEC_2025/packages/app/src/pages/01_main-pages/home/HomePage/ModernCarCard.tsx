// Modern Car Card Component - Inspired by Premium Design
// بطاقة سيارة حديثة - مستوحاة من التصميم المميز

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CarListing } from '@globul-cars/core/typesCarListing';

// Styled Components
const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
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

const FavoriteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: scale(1.1);
    background: white;
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

const CarTitle = styled.h3`
  font-size: 1.375rem;
  font-weight: 800;
  color: #1e293b;
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

const CarSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #64748b;
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

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 8px 6px;
    border-radius: 8px;
  }
`;

const SpecIcon = styled.div`
  font-size: 1.25rem;
  margin-bottom: 4px;
  filter: grayscale(0.3);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SpecValue = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const SpecLabel = styled.div`
  font-size: 0.6875rem;
  color: #64748b;
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

const LocationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 0.8125rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 12px;
  width: fit-content;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 5px 10px;
  }
`;

// Component Props
interface ModernCarCardProps {
    car: CarListing;
    showStatus?: boolean;
    onFavorite?: (carId: string) => void;
}

const ModernCarCard: React.FC<ModernCarCardProps> = ({
    car,
    showStatus = true,
    onFavorite
}) => {
    const navigate = useNavigate();

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
        if (car.featured) return 'featured';
        return 'used';
    };

    const getStatusLabel = (): string => {
        if (car.condition === 'new') return 'جديد';
        if (car.featured) return 'مميز';
        return 'مستعمل';
    };

    return (
        <CardContainer onClick={handleCardClick}>
            <ImageContainer>
                {car.images && car.images.length > 0 ? (
                    <CarImage
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        loading="lazy"
                    />
                ) : (
                    <ImagePlaceholder>🚗</ImagePlaceholder>
                )}

                {showStatus && (
                    <StatusBadge type={getStatusType()}>
                        {getStatusLabel()}
                    </StatusBadge>
                )}

                <FavoriteButton onClick={handleFavoriteClick}>
                    ❤️
                </FavoriteButton>
            </ImageContainer>

            <CardContent>
                {car.city && (
                    <LocationBadge>
                        📍 {car.city}
                    </LocationBadge>
                )}

                <CarTitle>{car.make} {car.model}</CarTitle>
                <CarSubtitle>{car.year} • {car.transmission || 'أوتوماتيك'}</CarSubtitle>

                <SpecsGrid>
                    <SpecItem>
                        <SpecIcon>📏</SpecIcon>
                        <SpecValue>{formatMileage(car.mileage || 0)}</SpecValue>
                        <SpecLabel>كم</SpecLabel>
                    </SpecItem>
                    <SpecItem>
                        <SpecIcon>⛽</SpecIcon>
                        <SpecValue>{car.fuelType || 'بنزين'}</SpecValue>
                        <SpecLabel>وقود</SpecLabel>
                    </SpecItem>
                    <SpecItem>
                        <SpecIcon>⚙️</SpecIcon>
                        <SpecValue>{car.engineSize || '2.0'}L</SpecValue>
                        <SpecLabel>محرك</SpecLabel>
                    </SpecItem>
                </SpecsGrid>

                <Divider />

                <PriceSection>
                    <PriceContainer>
                        <Price>{formatPrice(car.price || 0)}</Price>
                        <PriceLabel>السعر النهائي</PriceLabel>
                    </PriceContainer>
                    <ViewButton>عرض التفاصيل</ViewButton>
                </PriceSection>
            </CardContent>
        </CardContainer>
    );
};

export default ModernCarCard;

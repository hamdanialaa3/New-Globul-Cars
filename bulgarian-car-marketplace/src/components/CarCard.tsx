// Car Card Component - Modern Design
// كارد عرض السيارة - تصميم حديث

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CarListing } from '../types/CarListing';
import { CarIcon } from './icons/CarIcon';

interface CarCardProps {
  car: CarListing;
}

const Card = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  svg {
    color: #e74c3c;
  }
`;

const StatusBadge = styled.div<{ status?: string }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => {
    switch (props.status) {
      case 'sold': return '#e74c3c';
      case 'active': return '#27ae60';
      case 'draft': return '#f39c12';
      default: return '#3498db';
    }
  }};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 2;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CarTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Price = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;

  svg {
    width: 16px;
    height: 16px;
    color: #667eea;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #34495e;
  font-weight: 500;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
  font-size: 0.95rem;

  svg {
    color: #e74c3c;
    width: 18px;
    height: 18px;
  }
`;

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleCardClick = () => {
    navigate(`/car/${car.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for car:', car.id);
  };

  // Get first image or placeholder
  const getMainImage = (): string | null => {
    if (car.images && car.images.length > 0) {
      const firstImage = car.images[0];
      // Handle both string URLs and File objects
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage instanceof File) {
        return URL.createObjectURL(firstImage);
      }
    }
    return null;
  };

  // Format price
  const formatPrice = () => {
    const price = car.price || 0;
    const currency = car.currency || 'EUR';
    return `${price.toLocaleString('bg-BG')} ${currency}`;
  };

  // Get location name
  const getLocationName = () => {
    // Support both old and new location structure
    if ((car as any).location?.cityName) {
      const cityName = (car as any).location.cityName;
      return language === 'bg' ? cityName.bg : cityName.en;
    }
    return car.city || car.region || language === 'bg' ? 'Неизвестно' : 'Unknown';
  };

  // Get status text
  const getStatusText = () => {
    const status = car.status || 'active';
    const statusMap: Record<string, { bg: string; en: string }> = {
      active: { bg: 'Активна', en: 'Active' },
      sold: { bg: 'Продадена', en: 'Sold' },
      draft: { bg: 'Чернова', en: 'Draft' },
      expired: { bg: 'Изтекла', en: 'Expired' }
    };
    return language === 'bg' ? statusMap[status]?.bg : statusMap[status]?.en;
  };

  return (
    <Card onClick={handleCardClick}>
      {/* Image */}
      <ImageContainer>
        {getMainImage() ? (
          <CarImage src={getMainImage()!} alt={`${car.make} ${car.model}`} />
        ) : (
          <ImagePlaceholder>
            <CarIcon size={60} color="#FF7900" />
          </ImagePlaceholder>
        )}
        <FavoriteButton onClick={handleFavoriteClick}>
          <Heart size={20} />
        </FavoriteButton>
        {car.status && car.status !== 'active' && (
          <StatusBadge status={car.status}>
            {getStatusText()}
          </StatusBadge>
        )}
      </ImageContainer>

      {/* Content */}
      <CardContent>
        <CarTitle>{car.make} {car.model}</CarTitle>
        <Price>{formatPrice()}</Price>

        <DetailsGrid>
          <DetailItem>
            <Calendar size={16} />
            <span>{car.year}</span>
          </DetailItem>
          <DetailItem>
            <Gauge size={16} />
            <span>{car.mileage?.toLocaleString('bg-BG')} км</span>
          </DetailItem>
          <DetailItem>
            <Fuel size={16} />
            <span>{car.fuelType || (language === 'bg' ? 'Н/П' : 'N/A')}</span>
          </DetailItem>
          <DetailItem>
            <Settings size={16} />
            <span>{car.transmission || (language === 'bg' ? 'Н/П' : 'N/A')}</span>
          </DetailItem>
        </DetailsGrid>

        <Location>
          <MapPin size={18} />
          <span>{getLocationName()}</span>
        </Location>
      </CardContent>
    </Card>
  );
};

// ⚡ OPTIMIZED: Memoized to prevent unnecessary re-renders
export default memo(CarCard);


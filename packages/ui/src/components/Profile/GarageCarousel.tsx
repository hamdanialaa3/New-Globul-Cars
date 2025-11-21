// src/components/Profile/GarageCarousel.tsx
// Garage Carousel - شريط كراج دائري مصغر
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useRef } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronLeft, ChevronRight, Eye, Plus } from 'lucide-react';

// ==================== TYPES ====================

export interface CarouselCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mainImage?: string;
  imageUrl?: string;
  status?: 'active' | 'sold' | 'draft' | 'pending';
  views?: number;
}

interface GarageCarouselProps {
  cars: CarouselCar[];
  userId?: string;
  isOwnProfile?: boolean;
  onAddNew?: () => void;
}

// ==================== STYLED COMPONENTS ====================

const CarouselContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 2px solid rgba(255, 143, 16, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const CarouselHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 143, 16, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GarageIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #FF7900 0%, #FF8F10 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 121, 0, 0.25);
  
  svg {
    color: white;
  }
`;

const HeaderTitle = styled.div`
  h3 {
    margin: 0 0 4px 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #212529;
    
    span {
      color: #FF7900;
      margin-left: 8px;
    }
  }
  
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #6c757d;
  }
`;

const ViewAllButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF7900 0%, #FF8F10 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 121, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 8px 0;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FF7900;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #e66d00;
  }
`;

const CircularCarCard = styled.div<{ $status?: string }>`
  min-width: 140px;
  max-width: 140px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    
    .car-circle {
      box-shadow: 0 8px 24px rgba(255, 121, 0, 0.3);
      border-color: #FF7900;
    }
  }
`;

const CarCircle = styled.div<{ $imageUrl?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  };
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 143, 16, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${CircularCarCard}:hover &::before {
    opacity: 1;
  }
  
  .placeholder-icon {
    color: #dee2e6;
    font-size: 3rem;
  }
`;

const StatusDot = styled.div<{ $status: string }>`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  z-index: 3;
  
  ${props => {
    switch (props.$status) {
      case 'active':
        return 'background: #31a24c;';
      case 'sold':
        return 'background: #1877f2;';
      case 'draft':
        return 'background: #9e9e9e;';
      case 'pending':
        return 'background: #ff9800;';
      default:
        return 'background: #6c757d;';
    }
  }}
`;

const ViewCount = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const CarInfo = styled.div`
  text-align: center;
`;

const CarName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarPrice = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #FF7900;
  margin-bottom: 4px;
`;

const CarYear = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
`;

const EmptyGarage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  
  svg {
    color: #dee2e6;
    margin-bottom: 16px;
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    color: #495057;
  }
  
  p {
    margin: 0 0 20px 0;
    font-size: 0.9rem;
  }
`;

const AddCarButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #FF7900 0%, #FF8F10 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 121, 0, 0.25);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 121, 0, 0.35);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ScrollButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction === 'left' ? 'left: 8px;' : 'right: 8px;'}
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #FF7900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
  
  svg {
    color: #FF7900;
    width: 28px;
    height: 28px;
    transition: all 0.3s ease;
  }
  
  &:hover {
    background: #FF7900;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 121, 0, 0.4);
    
    svg {
      color: white;
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

// ==================== COMPONENT ====================

export const GarageCarousel: React.FC<GarageCarouselProps> = ({ 
  cars = [],
  userId,
  isOwnProfile = false,
  onAddNew
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 300;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCarClick = (carId: string) => {
    navigate(`/car/${carId}`);
  };

  const handleViewAll = () => {
    if (isOwnProfile) {
      navigate('/profile/my-ads');
    } else if (userId) {
      navigate(`/profile/${userId}/my-ads`);
    }
  };

  if (cars.length === 0) {
    return isOwnProfile ? (
      <CarouselContainer>
        <CarouselHeader>
          <HeaderLeft>
            <GarageIconWrapper>
              <Car size={24} />
            </GarageIconWrapper>
            <HeaderTitle>
              <h3>
                {language === 'bg' ? 'Моят кра' : 'My Garage'}
                <span>(0)</span>
              </h3>
              <p>{language === 'bg' ? 'Добавете първия си автомобил' : 'Add your first car'}</p>
            </HeaderTitle>
          </HeaderLeft>
        </CarouselHeader>
        
        <EmptyGarage>
          <Car size={64} />
          <h4>{language === 'bg' ? 'Празен кра' : 'Empty Garage'}</h4>
          <p>{language === 'bg' ? 'Нямате добавени автомобили' : 'You have no cars added'}</p>
          {onAddNew && (
            <AddCarButton onClick={onAddNew}>
              <Plus size={18} />
              {language === 'bg' ? 'Добави кола' : 'Add Car'}
            </AddCarButton>
          )}
        </EmptyGarage>
      </CarouselContainer>
    ) : null;
  }

  return (
    <CarouselContainer>
      <CarouselHeader>
        <HeaderLeft>
          <GarageIconWrapper>
            <Car size={24} />
          </GarageIconWrapper>
          <HeaderTitle>
            <h3>
              {isOwnProfile 
                ? (language === 'bg' ? 'Моят кра' : 'My Garage')
                : (language === 'bg' ? 'Автомобили' : 'Vehicles')
              }
              <span>({cars.length})</span>
            </h3>
            <p>
              {isOwnProfile
                ? (language === 'bg' ? 'Вашите активни обяви' : 'Your active listings')
                : (language === 'bg' ? 'Качени автомобили' : 'Uploaded vehicles')
              }
            </p>
          </HeaderTitle>
        </HeaderLeft>
        
        {cars.length > 3 && (
          <ViewAllButton onClick={handleViewAll}>
            {language === 'bg' ? 'Виж всички' : 'View All'}
          </ViewAllButton>
        )}
      </CarouselHeader>
      
      <CarouselWrapper>
        {cars.length > 0 && (
          <>
            <ScrollButton $direction="left" onClick={() => scroll('left')}>
              <ChevronLeft size={28} />
            </ScrollButton>
            <ScrollButton $direction="right" onClick={() => scroll('right')}>
              <ChevronRight size={28} />
            </ScrollButton>
          </>
        )}
        
        <CarouselTrack ref={trackRef}>
          {cars.slice(0, 12).map((car) => (
            <CircularCarCard 
              key={car.id} 
              $status={car.status}
              onClick={() => handleCarClick(car.id)}
            >
              <CarCircle 
                className="car-circle"
                $imageUrl={car.mainImage || car.imageUrl}
              >
                {(!car.mainImage && !car.imageUrl) && (
                  <Car size={48} className="placeholder-icon" />
                )}
                
                {car.status && (
                  <StatusDot $status={car.status} />
                )}
                
                {car.views !== undefined && car.views > 0 && (
                  <ViewCount>
                    <Eye size={12} />
                    {car.views}
                  </ViewCount>
                )}
              </CarCircle>
              
              <CarInfo>
                <CarName>{car.make} {car.model}</CarName>
                <CarPrice>€{car.price.toLocaleString()}</CarPrice>
                <CarYear>{car.year}</CarYear>
              </CarInfo>
            </CircularCarCard>
          ))}
          
          {isOwnProfile && onAddNew && (
            <CircularCarCard onClick={onAddNew}>
              <CarCircle style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '4px dashed rgba(255, 143, 16, 0.4)'
              }}>
                <Plus size={48} style={{ color: '#FF7900' }} />
              </CarCircle>
              
              <CarInfo>
                <CarName style={{ color: '#FF7900' }}>
                  {language === 'bg' ? 'Добави кола' : 'Add Car'}
                </CarName>
              </CarInfo>
            </CircularCarCard>
          )}
        </CarouselTrack>
      </CarouselWrapper>
    </CarouselContainer>
  );
};

export default GarageCarousel;


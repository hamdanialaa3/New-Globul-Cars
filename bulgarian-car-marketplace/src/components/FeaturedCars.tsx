// Featured Cars Component - Real Firebase Data
// عرض السيارات المميزة من البيانات الحقيقية

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { bulgarianCarService, BulgarianCar } from '../firebase/car-service';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../context/AuthProvider';
import { MapPin, Fuel, Gauge, Calendar, MessageCircle, User } from 'lucide-react';

interface FeaturedCarsProps {
  limit?: number;
  showFilters?: boolean;
  enablePagination?: boolean;
}

const FeaturedCarsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CarCard = styled(Link)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.15);
    border-color: #FF8F10;
  }
`;

const CarImageWrapper = styled.div`
  height: 220px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${CarCard}:hover & {
    transform: scale(1.05);
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FF8F10, #FFDF00);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.4);
`;

const CarInfo = styled.div`
  padding: 1.25rem;
`;

const CarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
`;

const CarSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #6c757d;
  
  svg {
    color: #FF8F10;
    flex-shrink: 0;
  }
`;

const CarLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
  margin-bottom: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
  
  svg {
    color: #FF8F10;
  }
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
`;

const SellerName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #6c757d;
  
  svg {
    color: #adb5bd;
  }
`;

const MessageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #FF8F10;
  border-radius: 6px;
  color: #FF8F10;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: #FF8F10;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
  
  h3 {
    font-size: 1.5rem;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #adb5bd;
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  margin: 2rem auto 0;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #FF8F10, #FFDF00);
  color: #000;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
  }
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  limit = 6,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<BulgarianCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, [limit]);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);
      
      // Fetch real cars from Firebase
      const result = await bulgarianCarService.searchCars(
        {}, // No filters, get all cars
        'createdAt',
        'desc',
        limit
      );
      
      setCars(result.cars);
    } catch (error) {
      console.error('Error loading featured cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (e: React.MouseEvent, sellerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    navigate(`/messages?userId=${sellerId}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <LoadingState>
        {language === 'bg' ? 'Зареждане на автомобили...' : 'Loading cars...'}
      </LoadingState>
    );
  }

  if (cars.length === 0) {
    return (
      <EmptyState>
        <h3>{language === 'bg' ? 'Няма налични автомобили' : 'No cars available'}</h3>
        <p>
          {language === 'bg' 
            ? 'В момента няма публикувани обяви за продажба.' 
            : 'There are currently no published listings.'}
        </p>
      </EmptyState>
    );
  }

  return (
    <>
      <FeaturedCarsContainer>
        {cars.map((car) => (
          <CarCard key={car.id} to={`/cars/${car.id}`}>
            <CarImageWrapper>
              {car.images && car.images.length > 0 ? (
                <CarImage 
                  src={car.images[0]} 
                  alt={`${car.make} ${car.model}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                  }}
                />
              ) : (
                <CarImage 
                  as="div" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: '#ccc'
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
            </CarImage>
              )}
              <PriceTag>{formatPrice(car.price)}</PriceTag>
            </CarImageWrapper>
            
            <CarInfo>
              <CarTitle>{car.make} {car.model}</CarTitle>
              
              <CarSpecs>
                <SpecItem>
                  <Calendar size={14} />
                  <span>{car.year}</span>
                </SpecItem>
                <SpecItem>
                  <Gauge size={14} />
                  <span>{car.mileage?.toLocaleString()} km</span>
                </SpecItem>
                <SpecItem>
                  <Fuel size={14} />
                  <span>{car.fuelType}</span>
                </SpecItem>
                <SpecItem>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                  </svg>
                  <span>{car.transmission}</span>
                </SpecItem>
              </CarSpecs>
              
              <CarLocation>
                <MapPin size={16} />
                <span>{car.location?.city || car.location || language === 'bg' ? 'България' : 'Bulgaria'}</span>
              </CarLocation>
              
              <SellerInfo>
                <SellerName>
                  <User size={14} />
                  <span>{car.sellerName || (language === 'bg' ? 'Продавач' : 'Seller')}</span>
                </SellerName>
                
                {user && (
                  <MessageButton
                    onClick={(e) => handleMessageClick(e, car.userId || '')}
                    disabled={!car.userId || car.userId === user.uid}
                  >
                    <MessageCircle size={14} />
                    {language === 'bg' ? 'Съобщение' : 'Message'}
                  </MessageButton>
                )}
              </SellerInfo>
            </CarInfo>
          </CarCard>
        ))}
      </FeaturedCarsContainer>

      {cars.length > 0 && (
        <ButtonWrapper>
          <ViewAllButton to="/cars">
            {language === 'bg' ? 'Виж всички автомобили' : 'View All Cars'} →
          </ViewAllButton>
        </ButtonWrapper>
      )}
    </>
  );
};

export default FeaturedCars;

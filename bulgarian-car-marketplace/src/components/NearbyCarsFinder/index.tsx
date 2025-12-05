import { logger } from '../../services/logger-service';
// Nearby Cars Finder Component
// مكون البحث عن السيارات القريبة من المستخدم

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Navigation, Sliders, Car, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import googleMapsService from '../../services/google-maps-enhanced.service';
import { unifiedCarService } from '../../services/car';

const Container = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 1.5rem 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  svg {
    width: 28px;
    height: 28px;
    color: #667eea;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const DistanceSelector = styled.select`
  padding: 0.75rem 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const CarsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const CarCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
  }
`;

const CarImage = styled.div<{ $url?: string }>`
  width: 100%;
  height: 180px;
  background: ${props => props.$url 
    ? `url(${props.$url}) center/cover`
    : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)'
  };
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 3rem;
`;

const CarTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
`;

const Price = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #667eea;
`;

const Distance = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #667eea;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
`;

const ErrorState = styled.div`
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #e74c3c;
  margin: 1rem 0;
`;

const NearbyCarsFinder: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [nearbyCars, setNearbyCars] = useState<any[]>([]);
  const [totalCars, setTotalCars] = useState(0);

  useEffect(() => {
    loadNearbyCars();
  }, [maxDistance]);

  const loadNearbyCars = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Google Maps
      googleMapsService.initialize();

      // Get user location
      const userLoc = await googleMapsService.getUserLocation();
      if (!userLoc) {
        setError(language === 'bg'
          ? 'Моля, разрешете достъп до вашето местоположение'
          : 'Please allow access to your location');
        setLoading(false);
        return;
      }

      setUserLocation(userLoc);

      // Get all cars
      const allCars = await unifiedCarService.searchCars({}, 1000);
      setTotalCars(allCars.length);

      // Filter cars by distance
      const carsWithDistance = await Promise.all(
        allCars.map(async (car: any) => {
          try {
            // Geocode car location if needed
            let carCoords = car.coordinates;
            if (!carCoords && car.city) {
              const address = `${car.city}, ${car.region || ''}, Bulgaria`;
              const geocoded = await googleMapsService.geocodeAddress(address);
              carCoords = geocoded || undefined;
            }

            if (!carCoords) return null;

            // Calculate distance
            const distResult = await googleMapsService.calculateDistance(
              userLoc,
              carCoords
            );

            if (!distResult) return null;

            const distanceKm = distResult.distance.value / 1000;

            if (distanceKm <= maxDistance) {
              return {
                ...car,
                distance: distResult.distance,
                duration: distResult.duration,
                distanceKm,
                coordinates: carCoords
              };
            }

            return null;
          } catch (error) {
            logger.error('Error processing car:', error);
            return null;
          }
        })
      );

      // Filter out nulls and sort by distance
      const validCars = carsWithDistance
        .filter((car: any) => car !== null)
        .sort((a: any, b: any) => a!.distanceKm - b!.distanceKm);

      setNearbyCars(validCars as any[]);
      setLoading(false);
    } catch (err) {
      logger.error('Error loading nearby cars:', err);
      setError(language === 'bg'
        ? 'Грешка при зареждане на близките превозни средства'
        : 'Error loading nearby vehicles');
      setLoading(false);
    }
  };

  const handleCarClick = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          {language === 'bg' ? '🔄 Търсене на близки превозни средства...' : '🔄 Finding nearby vehicles...'}
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>
            <MapPin />
            {language === 'bg' ? 'Близки превозни средства' : 'Nearby Vehicles'}
          </Title>
        </Header>
        <ErrorState>{error}</ErrorState>
        <FilterButton onClick={loadNearbyCars}>
          <Navigation />
          {language === 'bg' ? 'Опитайте отново' : 'Try Again'}
        </FilterButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <MapPin />
          {language === 'bg' ? 'Близки превозни средства' : 'Nearby Vehicles'}
        </Title>
        <Controls>
          <DistanceSelector
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
          >
            <option value={10}>{language === 'bg' ? 'до 10 км' : 'within 10 km'}</option>
            <option value={25}>{language === 'bg' ? 'до 25 км' : 'within 25 km'}</option>
            <option value={50}>{language === 'bg' ? 'до 50 км' : 'within 50 km'}</option>
            <option value={100}>{language === 'bg' ? 'до 100 км' : 'within 100 km'}</option>
            <option value={200}>{language === 'bg' ? 'до 200 км' : 'within 200 km'}</option>
          </DistanceSelector>
          <FilterButton onClick={loadNearbyCars} disabled={loading}>
            <Sliders />
            {language === 'bg' ? 'Актуализация' : 'Refresh'}
          </FilterButton>
        </Controls>
      </Header>

      <StatsBar>
        <StatCard>
          <StatValue>{nearbyCars.length}</StatValue>
          <StatLabel>
            {language === 'bg' ? 'Близки превозни средства' : 'Nearby Vehicles'}
          </StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{maxDistance} км</StatValue>
          <StatLabel>
            {language === 'bg' ? 'Радиус на търсене' : 'Search Radius'}
          </StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {nearbyCars.length > 0 
              ? googleMapsService.formatDistance(nearbyCars[0].distance.value, language)
              : '-'}
          </StatValue>
          <StatLabel>
            {language === 'bg' ? 'Най-близка' : 'Closest'}
          </StatLabel>
        </StatCard>
      </StatsBar>

      {nearbyCars.length > 0 ? (
        <CarsList>
          {nearbyCars.map((car) => (
            <CarCard key={car.id} onClick={() => handleCarClick(car.id)}>
              <CarImage $url={car.images?.[0]}>
                {!car.images?.[0] && <Car />}
              </CarImage>
              <CarTitle>
                {car.make} {car.model} {car.year}
              </CarTitle>
              <CarDetails>
                <Price>
                  {car.price?.toLocaleString()} {car.currency || 'EUR'}
                </Price>
                <Distance>
                  <TrendingUp />
                  {googleMapsService.formatDistance(car.distance.value, language)}
                </Distance>
              </CarDetails>
            </CarCard>
          ))}
        </CarsList>
      ) : (
        <EmptyState>
          {language === 'bg'
            ? `Няма намерени превозни средства в радиус от ${maxDistance} км`
            : `No vehicles found within ${maxDistance} km`}
        </EmptyState>
      )}
    </Container>
  );
};

export default NearbyCarsFinder;


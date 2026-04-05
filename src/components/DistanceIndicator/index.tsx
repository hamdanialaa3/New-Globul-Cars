import { logger } from '../../services/logger-service';
// Distance Indicator Component
// مكون عرض المسافة من موقع المستخدم

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapPin, Navigation, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import googleMapsService from '../../services/google-maps-enhanced.service';

const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  margin: 1.5rem 0;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.8;
`;

const ErrorState = styled.div`
  background: rgba(255, 107, 107, 0.2);
  border: 2px solid rgba(255, 107, 107, 0.5);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const TimeInfo = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;

  strong {
    font-weight: 700;
  }
`;

interface DistanceIndicatorProps {
  carLocation: {
    city: string;
    region?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  onLocationRequest?: () => void;
}

const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({ 
  carLocation,
  onLocationRequest 
}) => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<any>(null);
  const [localTime, setLocalTime] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadDistanceInfo();
  }, [carLocation]);

  const loadDistanceInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Google Maps service
      googleMapsService.initialize();

      // Get user's location
      const userLoc = await googleMapsService.getUserLocation();
      
      if (!userLoc) {
        setError(language === 'bg' 
          ? 'Не можем да определим вашето местоположение' 
          : 'Cannot determine your location');
        setLoading(false);
        if (onLocationRequest) onLocationRequest();
        return;
      }

      setUserLocation(userLoc);

      // Get car coordinates
      let carCoords = carLocation.coordinates;
      if (!carCoords) {
        // Geocode the city name
        const address = `${carLocation.city}, ${carLocation.region || ''}, Bulgaria`;
        const geocoded = await googleMapsService.geocodeAddress(address);
        carCoords = geocoded || undefined;
      }

      if (!carCoords) {
        setError(language === 'bg' 
          ? 'Не можем да намерим местоположението на превозното средство' 
          : 'Cannot find vehicle location');
        setLoading(false);
        return;
      }

      // Calculate distance
      const distResult = await googleMapsService.calculateDistance(userLoc, carCoords);
      setDistance(distResult);

      // Get local time
      const timeResult = await googleMapsService.getTimeZone(carCoords.lat, carCoords.lng);
      if (timeResult) {
        setLocalTime(timeResult.localTime);
      }

      setLoading(false);
    } catch (err) {
      logger.error('Error loading distance info:', err);
      setError(language === 'bg' 
        ? 'Грешка при зареждане на информацията' 
        : 'Error loading information');
      setLoading(false);
    }
  };

  const getDirectionsUrl = () => {
    if (!userLocation || !carLocation.coordinates) return '#';
    return googleMapsService.getGoogleMapsDirectionsUrl(
      carLocation.coordinates,
      userLocation
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          {language === 'bg' ? '🔄 Зареждане...' : '🔄 Loading...'}
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>
          <MapPin />
          {language === 'bg' ? 'Местоположение' : 'Location'}
        </Title>
        <ErrorState>
          {error}
        </ErrorState>
        <ActionButtons style={{ marginTop: '1rem' }}>
          <ActionButton onClick={loadDistanceInfo}>
            <Navigation />
            {language === 'bg' ? 'Опитайте отново' : 'Try Again'}
          </ActionButton>
        </ActionButtons>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <MapPin />
        {language === 'bg' ? 'Местоположение и разстояние' : 'Location & Distance'}
      </Title>

      <InfoGrid>
        <InfoCard>
          <Navigation />
          <InfoContent>
            <InfoLabel>{language === 'bg' ? 'Разстояние' : 'Distance'}</InfoLabel>
            <InfoValue>
              {distance 
                ? googleMapsService.formatDistance(distance.distance.value, language)
                : 'N/A'}
            </InfoValue>
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <Clock />
          <InfoContent>
            <InfoLabel>{language === 'bg' ? 'Време на пътуване' : 'Travel Time'}</InfoLabel>
            <InfoValue>
              {distance 
                ? googleMapsService.formatDuration(distance.duration.value, language)
                : 'N/A'}
            </InfoValue>
          </InfoContent>
        </InfoCard>
      </InfoGrid>

      <ActionButtons>
        <ActionButton 
          href={getDirectionsUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <ExternalLink />
          {language === 'bg' ? 'Вземете указания' : 'Get Directions'}
        </ActionButton>
      </ActionButtons>

      {localTime && (
        <TimeInfo>
          <span>
            {language === 'bg' ? 'Местно време:' : 'Local time:'}
          </span>
          <strong>{localTime}</strong>
        </TimeInfo>
      )}
    </Container>
  );
};

export default DistanceIndicator;


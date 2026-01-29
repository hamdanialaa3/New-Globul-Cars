// Google Maps Interactive Section for Bulgarian Cities
// خريطة Google Maps التفاعلية للمدن البلغارية
// Note: Using @react-google-maps/api Marker component which wraps google.maps.Marker
// TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api adds support

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Car } from 'lucide-react';
import { BulgarianCity, getCityName } from '@/constants/bulgarianCities';
import { useLanguage } from '@/contexts/LanguageContext';
import styled from 'styled-components';
import { logger } from '../../services/logger-service';

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px; /* ارتفاع أقل - عرضاني */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 92, 169, 0.15);
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  font-size: 1.1rem;
  color: #005ca9;
`;

const InfoContent = styled.div`
  padding: 0.5rem;
  min-width: 180px;
`;

const InfoTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #005ca9;
  font-weight: 600;
`;

const InfoDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const InfoButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.3);
  }
`;

interface GoogleMapSectionProps {
  cities: BulgarianCity[];
  selectedCity: string | null;
  onCityClick: (cityId: string) => void;
  cityCarCounts: Record<string, number>;
}

// Bulgaria center coordinates
const BULGARIA_CENTER = {
  lat: 42.7339,
  lng: 25.4858
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({
  cities,
  selectedCity,
  onCityClick,
  cityCarCounts
}) => {
  const { language, t } = useLanguage();
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '***REMOVED_FIREBASE_KEY***';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry'] as any,
    version: 'weekly',
    language: language === 'bg' ? 'bg' : 'en',
    region: 'BG'
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (cityId: string) => {
    setActiveMarker(cityId);
  };

  const handleViewCars = (cityId: string) => {
    onCityClick(cityId);
    setActiveMarker(null);
  };

  // Get marker icon URL based on state
  const getMarkerIcon = (cityId: string) => {
    const isSelected = cityId === selectedCity;
    const isActive = cityCarCounts[cityId] > 0;
    
    // Use default Google Maps marker with custom color
    if (isSelected) {
      return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    } else if (isActive) {
      return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    } else {
      return 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png';
    }
  };

  if (loadError) {
    logger.error('Google Maps loading error', loadError as Error);
    return (
      <MapContainer>
        <LoadingOverlay style={{ flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🗺️</div>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h3 style={{ color: '#005ca9', marginBottom: '0.5rem' }}>
              {language === 'bg' ? 'Картата временно недостъпна' : 'Map temporarily unavailable'}
            </h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {language === 'bg' 
                ? 'Google Maps се зарежда... Можете да разгледате градовете по-долу.'
                : 'Google Maps is loading... You can browse cities below.'}
            </p>
            <small style={{ color: '#999', fontSize: '0.8rem' }}>
              API Key: {apiKey.substring(0, 20)}...
            </small>
          </div>
        </LoadingOverlay>
      </MapContainer>
    );
  }

  if (!isLoaded) {
    return (
      <MapContainer>
        <LoadingOverlay>
          {language === 'bg' ? 'Зареждане на картата...' : 'Loading map...'}
        </LoadingOverlay>
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={BULGARIA_CENTER}
        zoom={7}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {cities.map((city) => {
          const carCount = cityCarCounts[city.id] || 0;
          const cityName = getCityName(city.id, language);

          return (
            <Marker
              key={city.id}
              position={{
                lat: city.coordinates.lat,
                lng: city.coordinates.lng
              }}
              onClick={() => handleMarkerClick(city.id)}
              icon={getMarkerIcon(city.id)}
              title={cityName}
            >
              {activeMarker === city.id && (
                <InfoWindow
                  position={{
                    lat: city.coordinates.lat,
                    lng: city.coordinates.lng
                  }}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <InfoContent>
                    <InfoTitle>
                      {city.isCapital && '⭐ '}
                      {cityName}
                    </InfoTitle>
                    <InfoDetails>
                      <Car size={16} />
                      <strong>{carCount}</strong> {t('home.cityCars.carsAvailable')}
                    </InfoDetails>
                    <InfoButton onClick={() => handleViewCars(city.id)}>
                      {t('home.cityCars.viewCars')}
                    </InfoButton>
                  </InfoContent>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
    </MapContainer>
  );
};

export default GoogleMapSection;


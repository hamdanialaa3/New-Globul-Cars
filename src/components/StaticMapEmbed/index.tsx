import { logger } from '../../services/logger-service';
// Static Map Embed Component
// مكون الخريطة الثابتة المدمجة باستخدام Maps Embed API

import React from 'react';
import styled from 'styled-components';
import { MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import googleMapsService from '../../services/google-maps-enhanced.service';
import { GOOGLE_MAPS_API_KEY } from '../../services/maps-config';

const Container = styled.div`
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  background: #f8f9fa;
  margin: 1.5rem 0;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.875rem;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
    width: 100%;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    gap: 0.375rem;
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const LocationText = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-top: 0.25rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const OpenMapButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    gap: 0.375rem;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 400px;
  border: none;
  display: block;
`;

const LoadingState = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.1rem;
  background: #f8f9fa;
`;

interface StaticMapEmbedProps {
  location: {
    city: string;
    region?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  zoom?: number;
  showHeader?: boolean;
}

const StaticMapEmbed: React.FC<StaticMapEmbedProps> = ({
  location,
  zoom = 13,
  showHeader = true
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [mapUrl, setMapUrl] = React.useState<string>('');

  React.useEffect(() => {
    loadMap();
  }, [location]);

  const loadMap = async () => {
    setLoading(true);

    try {
      let coords = location.coordinates;

      if (!coords) {
        // Geocode the location
        googleMapsService.initialize();
        const address = `${location.locationData?.cityName || location.city}, ${location.region || ''}, Bulgaria`;
        const geocoded = await googleMapsService.geocodeAddress(address);
        coords = geocoded || undefined;
      }

      if (coords) {
        const url = googleMapsService.getStaticMapUrl(coords.lat, coords.lng, zoom);
        setMapUrl(url);
      } else {
        // Fallback: Use Maps Embed API with query string instead of coordinates
        const query = location.locationData?.cityName || location.city || 'Bulgaria';
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(query + ', Bulgaria')}&zoom=${zoom}`;
        setMapUrl(embedUrl);
      }
    } catch (error) {
      logger.error('Error loading map:', error);
      // Fallback to basic embed URL
      const query = location.locationData?.cityName || location.city || 'Bulgaria';
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(query + ', Bulgaria')}&zoom=${zoom}`;
      setMapUrl(embedUrl);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = () => {
    if (location.coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.locationData?.cityName + ', Bulgaria')}`;
  };

  return (
    <Container>
      {showHeader && (
        <Header>
          <div>
            <Title>
              <MapPin />
              {language === 'bg' ? 'Местоположение на картата' : 'Location on Map'}
            </Title>
            <LocationText>
              {location.locationData?.cityName}
              {location.region && `, ${location.region}`}
            </LocationText>
          </div>
          <OpenMapButton
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink />
            {language === 'bg' ? 'Отвори в Google Maps' : 'Open in Google Maps'}
          </OpenMapButton>
        </Header>
      )}

      {loading ? (
        <LoadingState>
          {language === 'bg' ? '🔄 Зареждане на картата...' : '🔄 Loading map...'}
        </LoadingState>
      ) : mapUrl ? (
        <MapFrame
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${location.locationData?.cityName || location.city}`}
          onError={(e) => {
            logger.error('Google Maps iframe failed to load', { 
              error: e, 
              url: mapUrl,
              apiKeyConfigured: !!(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_BROWSER_KEY)
            });
            setLoading(false);
            // Show error message
            setMapUrl('');
          }}
        />
      ) : (
        <LoadingState>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <div>{language === 'bg' ? 'Грешка при зареждане на картата' : 'Error loading map'}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
              {language === 'bg' 
                ? 'Google Maps API ключът е невалиден или липсва. Моля, проверете настройките.' 
                : 'Google Maps API key is invalid or missing. Please check your settings.'}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
              {language === 'bg' 
                ? 'Добавете REACT_APP_GOOGLE_MAPS_API_KEY в .env файла' 
                : 'Add REACT_APP_GOOGLE_MAPS_API_KEY to .env file'}
            </div>
          </div>
        </LoadingState>
      )}
    </Container>
  );
};

export default StaticMapEmbed;


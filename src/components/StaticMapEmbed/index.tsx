// Static Map Embed Component
// مكون الخريطة الثابتة المدمجة باستخدام OpenStreetMap (مجاني - لا يحتاج API key)

import React from 'react';
import styled from 'styled-components';
import { MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';

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

/** Use Nominatim (OpenStreetMap) to geocode a city name — no API key required */
async function nominatimGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bg`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'KoliOne/1.0 (koli.one)' }
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    logger.error('Nominatim geocoding failed', err);
  }
  return null;
}

/** Build the OSM embed iframe URL from coordinates */
function buildOsmEmbedUrl(lat: number, lng: number, zoom: number): string {
  const offset = zoom <= 7 ? 2 : zoom <= 10 ? 0.5 : 0.025;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;
}

const StaticMapEmbed: React.FC<StaticMapEmbedProps> = ({
  location,
  zoom = 13,
  showHeader = true
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [mapUrl, setMapUrl] = React.useState<string>('');
  const [resolvedCoords, setResolvedCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    loadMap();
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMap = async () => {
    setLoading(true);
    try {
      let coords = location.coordinates;

      if (!coords) {
        const query = location.locationData?.cityName || location.city || 'Bulgaria';
        coords = await nominatimGeocode(`${query}, Bulgaria`) ?? undefined;
      }

      if (coords) {
        setResolvedCoords(coords);
        setMapUrl(buildOsmEmbedUrl(coords.lat, coords.lng, zoom));
      } else {
        // Full-country view of Bulgaria as fallback
        setResolvedCoords({ lat: 42.7339, lng: 25.4858 });
        setMapUrl(buildOsmEmbedUrl(42.7339, 25.4858, 7));
      }
    } catch (error) {
      logger.error('Error loading OSM map:', error);
      setResolvedCoords({ lat: 42.7339, lng: 25.4858 });
      setMapUrl(buildOsmEmbedUrl(42.7339, 25.4858, 7));
    } finally {
      setLoading(false);
    }
  };

  const getOpenStreetMapUrl = () => {
    if (resolvedCoords) {
      return `https://www.openstreetmap.org/?mlat=${resolvedCoords.lat}&mlon=${resolvedCoords.lng}&zoom=${zoom}`;
    }
    const query = location.locationData?.cityName || location.city || 'Bulgaria';
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query + ', Bulgaria')}`;
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
            href={getOpenStreetMapUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink />
            {language === 'bg' ? 'Отвори в OpenStreetMap' : 'Open in OpenStreetMap'}
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
            logger.error('OSM iframe failed to load', { error: e, url: mapUrl });
            setLoading(false);
            setMapUrl('');
          }}
        />
      ) : (
        <LoadingState>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <div>{language === 'bg' ? 'Грешка при зареждане на картата' : 'Error loading map'}</div>
          </div>
        </LoadingState>
      )}
    </Container>
  );
};

export default StaticMapEmbed;


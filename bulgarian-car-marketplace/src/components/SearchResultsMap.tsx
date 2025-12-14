// Note: Using @react-google-maps/api Marker component which wraps google.maps.Marker
// TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api adds support

import React, { useState , memo} from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import styled from 'styled-components';
import { UnifiedCar } from '../services/car/unified-car.service';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme?.shadows?.md || '0 4px 16px rgba(0,0,0,0.1)'};
  margin-bottom: ${({ theme }) => theme?.spacing?.xl || '24px'};
`;

const InfoContent = styled.div`
  padding: 12px;
  min-width: 250px;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: bold;
    color: #005ca9;
  }

  .price {
    margin: 4px 0;
    font-size: 18px;
    font-weight: bold;
    color: #28a745;
  }

  .details {
    display: flex;
    gap: 12px;
    margin: 8px 0;
    font-size: 13px;
    color: #666;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .location {
    margin-top: 8px;
    font-size: 12px;
    color: #888;
  }

  .view-button {
    margin-top: 12px;
    padding: 8px 16px;
    background: #005ca9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;

    &:hover {
      background: #004d8a;
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  text-align: center;
`;

const ResultsCount = styled.div`
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 600;
  color: #333;
  text-align: center;
`;

interface SearchResultsMapProps {
  cars: UnifiedCar[];
  onCarClick?: (carId: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const SearchResultsMap: React.FC<SearchResultsMapProps> = ({
  cars,
  onCarClick,
  center,
  zoom = 7
}) => {
  const [selectedCar, setSelectedCar] = useState<UnifiedCar | null>(null);

  // Default center (Sofia, Bulgaria)
  const defaultCenter = center || { lat: 42.6977, lng: 23.3219 };

  // Filter cars that have coordinates
  const carsWithLocations = cars.filter(
    car => car.location?.coordinates?.latitude && car.location?.coordinates?.longitude
  );

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  // Get API key from environment
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <ErrorMessage>
              <strong>Google Maps API Key غير مكوّن</strong>
        <p>يرجى إضافة REACT_APP_GOOGLE_MAPS_API_KEY في ملف .env</p>
      </ErrorMessage>
    );
  }

  if (carsWithLocations.length === 0) {
    return (
      <ErrorMessage>
              <strong>لا توجد سيارات بمواقع محددة</strong>
        <p>لا يمكن عرض الخريطة لأن السيارات لا تحتوي على إحداثيات</p>
      </ErrorMessage>
    );
  }

  // Calculate center from cars if not provided
  let mapCenter = defaultCenter;
  if (!center && carsWithLocations.length > 0) {
    const avgLat =
      carsWithLocations.reduce((sum, car) => sum + (car.location?.coordinates?.latitude || 0), 0) /
      carsWithLocations.length;
    const avgLng =
      carsWithLocations.reduce((sum, car) => sum + (car.location?.coordinates?.longitude || 0), 0) /
      carsWithLocations.length;
    mapCenter = { lat: avgLat, lng: avgLng };
  }

  return (
    <>
      <ResultsCount>
         {carsWithLocations.length} سيارة معروضة على الخريطة
      </ResultsCount>
      
      <MapContainer>
        <LoadScript googleMapsApiKey={apiKey} language="bg">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={zoom}
            options={mapOptions}
          >
            {carsWithLocations.map((car) => {
              const position = {
                      lat: car.location.coordinates?.latitude || 0,
                      lng: car.location.coordinates?.longitude || 0
              };

              return (
                <Marker
                  key={car.id}
                  position={position}
                  onClick={() => setSelectedCar(car)}
                  title={car.title}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              );
            })}

            {selectedCar && selectedCar.location?.coordinates && (
              <InfoWindow
                position={{
                  lat: selectedCar.location.coordinates.latitude,
                  lng: selectedCar.location.coordinates.longitude
                }}
                onCloseClick={() => setSelectedCar(null)}
              >
                <InfoContent onClick={() => onCarClick?.(selectedCar.id)}>
                  <h3>{selectedCar.title}</h3>
                  <div className="price">€{selectedCar.price.toLocaleString()}</div>
                  <div className="details">
                     <span>{selectedCar.year}</span>
                     <span>{selectedCar.mileage.toLocaleString()} km</span>
                     <span>{selectedCar.power} HP</span>
                  </div>
                  <div className="location">
                     {selectedCar.locationData?.cityName}, {selectedCar.location.region}
                  </div>
                  <button className="view-button">
                    عرض التفاصيل
                  </button>
                </InfoContent>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </MapContainer>
    </>
  );
};

export default memo(SearchResultsMap);






















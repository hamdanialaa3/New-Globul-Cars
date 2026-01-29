// Note: Using @react-google-maps/api Marker component which wraps google.maps.Marker
// TODO: Migrate to AdvancedMarkerElement when @react-google-maps/api adds support

import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme?.shadows?.base || '0 2px 8px rgba(0,0,0,0.1)'};
`;

const InfoContent = styled.div`
  padding: 8px;
  min-width: 200px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
    color: #666;
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

interface MapComponentProps {
  lat: number;
  lng: number;
  carTitle?: string;
  carPrice?: number;
  carLocation?: string;
  zoom?: number;
  height?: string;
  showInfo?: boolean;
  showMarker?: boolean; // New prop to control marker visibility
}

const MapComponent: React.FC<MapComponentProps> = ({
  lat,
  lng,
  carTitle,
  carPrice,
  carLocation,
  zoom = 14,
  height = '400px',
  showInfo = true,
  showMarker = true
}) => {
  const [showInfoWindow, setShowInfoWindow] = React.useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: height
  };

  const center = {
    lat: lat,
    lng: lng
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
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
        <strong>⚠️ Google Maps API Key غير مكوّن</strong>
        <p>يرجى إضافة REACT_APP_GOOGLE_MAPS_API_KEY في ملف .env</p>
      </ErrorMessage>
    );
  }

  return (
    <MapContainer>
      <LoadScript googleMapsApiKey={apiKey} language="bg">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
        >
          {showMarker && (
            <>
              <Marker
                position={center}
                onClick={() => setShowInfoWindow(true)}
                title={carTitle || 'موقع السيارة'}
              />
              
              {showInfo && showInfoWindow && (
                <InfoWindow
                  position={center}
                  onCloseClick={() => setShowInfoWindow(false)}
                >
                  <InfoContent>
                    {carTitle && <h3>{carTitle}</h3>}
                    {carPrice && <p><strong>السعر:</strong> €{carPrice.toLocaleString()}</p>}
                    {carLocation && <p><strong>الموقع:</strong> {carLocation}</p>}
                  </InfoContent>
                </InfoWindow>
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>
    </MapContainer>
  );
};

export default MapComponent;





















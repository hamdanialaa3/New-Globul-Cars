// src/components/CarMap/CarMap.tsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

interface CarMapProps {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const CarMap: React.FC<CarMapProps> = ({ lat, lng }) => {
  const center = { lat, lng };

  // It's crucial to load the Google Maps API key from environment variables
  // and not hardcode it.
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return <div>Error: Google Maps API key is missing.</div>;
  }

  return (
    <MapContainer>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </MapContainer>
  );
};

export default CarMap;

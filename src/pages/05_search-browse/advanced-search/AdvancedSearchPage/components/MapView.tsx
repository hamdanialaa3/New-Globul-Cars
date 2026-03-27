// src/pages/AdvancedSearchPage/components/MapView.tsx
// Map view for search results using Leaflet

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CarListing } from '../../../../../types/CarListing';

interface MapViewProps {
  cars: CarListing[];
  onCarClick: (carId: string) => void;
  t: (key: string) => string;
}

export const MapView: React.FC<MapViewProps> = ({ cars, onCarClick, t }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Bulgaria
    const map = L.map(mapRef.current, {
      center: [42.7339, 25.4858],
      zoom: 7,
      scrollWheelZoom: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || cars.length === 0) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Custom marker icon
    const carIcon = L.divIcon({
      className: 'custom-car-marker',
      html: `
        <div style="
          background: #3B82F6;
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          🚗
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const bounds = L.latLngBounds([]);

    // Add markers for each car with location data
    cars.forEach((car) => {
      const lat = (car as any).locationData?.coordinates?.lat;
      const lng = (car as any).locationData?.coordinates?.lng;

      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: carIcon }).addTo(mapInstanceRef.current!);

        const popupContent = `
          <div style="min-width: 200px;">
            <strong style="font-size: 14px; color: #1a1a1a;">
              ${car.make} ${car.model}
            </strong>
            <div style="margin-top: 6px; color: #666; font-size: 13px;">
              ${car.year} • ${car.mileage?.toLocaleString('bg-BG')} km
            </div>
            <div style="margin-top: 6px; font-size: 15px; font-weight: 600; color: #3B82F6;">
              €${car.price.toLocaleString('bg-BG')}
            </div>
            ${car.images && car.images.length > 0 ? `
              <img 
                src="${car.images[0]}" 
                alt="${car.make} ${car.model}"
                style="width: 100%; height: 120px; object-fit: cover; margin-top: 8px; border-radius: 4px;"
              />
            ` : ''}
            <button 
              onclick="window.dispatchEvent(new CustomEvent('carMarkerClick', { detail: '${car.id}' }))"
              style="
                width: 100%;
                margin-top: 8px;
                padding: 8px;
                background: #3B82F6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
              "
            >
              ${t('advancedSearch.viewDetails')}
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 250 });
        bounds.extend([lat, lng]);
      }
    });

    // Fit map to show all markers
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Listen for marker click events
    const handleMarkerClick = (e: CustomEvent) => {
      onCarClick(e.detail);
    };

    window.addEventListener('carMarkerClick', handleMarkerClick as EventListener);

    return () => {
      window.removeEventListener('carMarkerClick', handleMarkerClick as EventListener);
    };
  }, [cars, onCarClick, t]);

  if (cars.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>🗺️</EmptyIcon>
        <EmptyText>{t('advancedSearch.noResultsOnMap')}</EmptyText>
      </EmptyState>
    );
  }

  return <MapContainer ref={mapRef} />;
};

const MapContainer = styled.div`
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    padding: 0;
  }

  .leaflet-popup-content {
    margin: 12px;
  }

  @media (max-width: 768px) {
    height: 500px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #666;
`;


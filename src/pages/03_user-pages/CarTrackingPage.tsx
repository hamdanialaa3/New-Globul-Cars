import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
  background: #f7f7f7;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 32px 0;
`;

const MapContainer = styled.div`
  background: white;
  border-radius: 12px;
  height: 400px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 12px;
  }
`;

const TrackingInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${p => p.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${p => p.$color};
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

const InfoContent = styled.div`
  color: #666;
  line-height: 1.5;
`;

const LocationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const LocationName = styled.div`
  font-weight: 600;
  color: #000;
`;

const LocationTime = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const CarTrackingPage: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCar] = useState('BMW X5 2023');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const locations = [
    { name: language === 'bg' ? 'София, България' : 'Sofia, Bulgaria', lat: 42.6977, lng: 23.3219, time: language === 'bg' ? 'Сега' : 'Now' },
    { name: language === 'bg' ? 'Пловдив, България' : 'Plovdiv, Bulgaria', lat: 42.1354, lng: 24.7453, time: language === 'bg' ? 'Преди 2 часа' : '2 hours ago' },
    { name: language === 'bg' ? 'Варна, България' : 'Varna, Bulgaria', lat: 43.2141, lng: 27.9147, time: language === 'bg' ? 'Вчера' : 'Yesterday' },
  ];

  const text = language === 'bg' ? {
    pageTitle: 'Проследяване на автомобили',
    currentLocation: 'Текущо местоположение',
    recentLocations: 'Последни местоположения',
    alerts: 'Предупреждения',
    noAlerts: 'Няма активни предупреждения',
    lastUpdate: 'Последно обновяване: преди 5 минути',
  } : {
    pageTitle: 'Car Tracking',
    currentLocation: 'Current Location',
    recentLocations: 'Recent Locations',
    alerts: 'Alerts',
    noAlerts: 'No active alerts',
    lastUpdate: 'Last update: 5 minutes ago',
  };

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Fix Leaflet default marker icon issue with bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([42.7, 25.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add markers for each tracked location
    locations.forEach((loc, i) => {
      const marker = L.marker([loc.lat, loc.lng]).addTo(map);
      marker.bindPopup(`<strong>${loc.name}</strong><br/>${loc.time}`);
      if (i === 0) marker.openPopup();
    });

    // Draw route line between locations
    const routeCoords: L.LatLngExpression[] = locations.map(l => [l.lat, l.lng]);
    L.polyline(routeCoords, { color: '#007bff', weight: 3, dashArray: '8 4' }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer>
      <PageTitle>{text.pageTitle} - {selectedCar}</PageTitle>

      <MapContainer>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </MapContainer>

      <TrackingInfo>
        <InfoCard>
          <InfoHeader>
            <InfoIcon $color="#007bff">
              <Navigation size={20} />
            </InfoIcon>
            <InfoTitle>{text.currentLocation}</InfoTitle>
          </InfoHeader>
          <InfoContent>
            {locations[0].name}<br />
            {locations[0].lat.toFixed(4)}° N, {locations[0].lng.toFixed(4)}° E<br />
            {text.lastUpdate}
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <InfoHeader>
            <InfoIcon $color="#28a745">
              <Clock size={20} />
            </InfoIcon>
            <InfoTitle>{text.recentLocations}</InfoTitle>
          </InfoHeader>
          <InfoContent>
            {locations.map((loc, i) => (
              <LocationItem key={i}>
                <LocationName>{loc.name}</LocationName>
                <LocationTime>{loc.time}</LocationTime>
              </LocationItem>
            ))}
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <InfoHeader>
            <InfoIcon $color="#ffc107">
              <AlertTriangle size={20} />
            </InfoIcon>
            <InfoTitle>{text.alerts}</InfoTitle>
          </InfoHeader>
          <InfoContent>
            {text.noAlerts}
          </InfoContent>
        </InfoCard>
      </TrackingInfo>
    </PageContainer>
  );
};

export default CarTrackingPage;

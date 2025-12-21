import React, { useState } from 'react';
import styled from 'styled-components';
import { MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
`;

const MapPlaceholder = styled.div`
  text-align: center;
  color: #666;
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

  const getText = () => {
    if (language === 'bg') {
      return {
        pageTitle: 'Проследяване на автомобили',
        currentLocation: 'Текущо местоположение',
        recentLocations: 'Последни местоположения',
        alerts: 'Предупреждения',
        mapPlaceholder: 'Картата ще се зареди тук',
        sofia: 'София, България',
        plovdiv: 'Пловдив, България',
        varna: 'Варна, България',
        noAlerts: 'Няма активни предупреждения'
      };
    } else {
      return {
        pageTitle: 'Car Tracking',
        currentLocation: 'Current Location',
        recentLocations: 'Recent Locations',
        alerts: 'Alerts',
        mapPlaceholder: 'Map will load here',
        sofia: 'Sofia, Bulgaria',
        plovdiv: 'Plovdiv, Bulgaria',
        varna: 'Varna, Bulgaria',
        noAlerts: 'No active alerts'
      };
    }
  };

  const text = getText();

  return (
    <PageContainer>
      <PageTitle>{text.pageTitle} - {selectedCar}</PageTitle>

      <MapContainer>
        <MapPlaceholder>
          <MapPin size={48} color="#ccc" />
          <div>{text.mapPlaceholder}</div>
        </MapPlaceholder>
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
            {text.sofia}<br />
            42.6977° N, 23.3219° E<br />
            آخر تحديث: منذ 5 دقائق
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
            <LocationItem>
              <LocationName>{text.sofia}</LocationName>
              <LocationTime>الآن</LocationTime>
            </LocationItem>
            <LocationItem>
              <LocationName>{text.plovdiv}</LocationName>
              <LocationTime>منذ ساعتين</LocationTime>
            </LocationItem>
            <LocationItem>
              <LocationName>{text.varna}</LocationName>
              <LocationTime>أمس</LocationTime>
            </LocationItem>
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
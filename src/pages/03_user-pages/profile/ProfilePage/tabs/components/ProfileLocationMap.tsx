/**
 * ProfileLocationMap Component
 * خريطة موقع المستخدم في البروفايل العام
 * تعرض الموقع التقريبي إذا كان متوفراً، أو بلغاريا كاملة إذا لم يكن
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import { logger } from '../../../../../../services/logger-service';
import MapComponent from '../../../../../../components/MapComponent';
import { GeocodingService } from '../../../../../../services/geocoding-service';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface ProfileLocationMapProps {
  user: BulgarianUser;
}

export const ProfileLocationMap: React.FC<ProfileLocationMapProps> = ({ user }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);
  const geocodingService = new GeocodingService();

  useEffect(() => {
    loadLocation();
  }, [user]);

  const loadLocation = async () => {
    setLoading(true);
    try {
      // Check if user has coordinates directly
      if (user.location?.coordinates?.latitude && user.location?.coordinates?.longitude) {
        setCoordinates({
          lat: user.location.coordinates.latitude,
          lng: user.location.coordinates.longitude
        });
        setHasLocation(true);
        setLoading(false);
        return;
      }

      // Check for address in dealer/company snapshot
      const profileType = user.profileType || 'private';
      const address = profileType === 'dealer'
        ? user.dealerSnapshot?.address
        : profileType === 'company'
          ? user.companySnapshot?.address
          : null;

      // If we have an address, try to geocode it
      if (address) {
        const geocoded = await geocodingService.geocodeAddress(`${address}, Bulgaria`);
        if (geocoded) {
          setCoordinates({
            lat: geocoded.latitude,
            lng: geocoded.longitude
          });
          setHasLocation(true);
          setLoading(false);
          return;
        }
      }

      // Check if user has city information
      if (user.location?.city) {
        const cityAddress = `${user.location.city}, ${user.location.region || ''}, Bulgaria`;
        const geocoded = await geocodingService.geocodeAddress(cityAddress);
        if (geocoded) {
          setCoordinates({
            lat: geocoded.latitude,
            lng: geocoded.longitude
          });
          setHasLocation(true);
          setLoading(false);
          return;
        }
      }

      // No location found - show Bulgaria overview
      setCoordinates({
        lat: 42.7339, // Center of Bulgaria
        lng: 25.4858
      });
      setHasLocation(false);
    } catch (error) {
      logger.error('Error loading location for map', error as Error);
      // Fallback to Bulgaria center
      setCoordinates({
        lat: 42.7339,
        lng: 25.4858
      });
      setHasLocation(false);
    } finally {
      setLoading(false);
    }
  };

  const getLocationText = () => {
    const profileType = user.profileType || 'private';
    const address = profileType === 'dealer'
      ? user.dealerSnapshot?.address
      : profileType === 'company'
        ? user.companySnapshot?.address
        : null;

    if (address) {
      return address;
    }

    if (user.location?.city) {
      return `${user.location.city}${user.location.region ? `, ${user.location.region}` : ''}`;
    }

    return language === 'bg' ? 'България' : 'Bulgaria';
  };

  if (loading || !coordinates) {
    return (
      <MapCard $isDark={isDark}>
        <MapHeader $isDark={isDark}>
          <MapPin size={18} />
          <MapTitle $isDark={isDark}>
            {language === 'bg' ? 'Местоположение' : 'Location'}
          </MapTitle>
        </MapHeader>
        <MapLoading $isDark={isDark}>
          {language === 'bg' ? 'Зареждане на картата...' : 'Loading map...'}
        </MapLoading>
      </MapCard>
    );
  }

  return (
    <MapCard $isDark={isDark}>
      <MapHeader $isDark={isDark}>
        <MapPin size={18} />
        <div>
          <MapTitle $isDark={isDark}>
            {language === 'bg' ? 'Местоположение' : 'Location'}
          </MapTitle>
          <LocationText $isDark={isDark}>{getLocationText()}</LocationText>
        </div>
      </MapHeader>
      <MapContainer>
        {hasLocation ? (
          <MapComponent
            lat={coordinates.lat}
            lng={coordinates.lng}
            zoom={hasLocation ? 13 : 7}
            height="300px"
            showInfo={false}
          />
        ) : (
          <MapComponent
            lat={coordinates.lat}
            lng={coordinates.lng}
            zoom={7}
            height="300px"
            showInfo={false}
          />
        )}
      </MapContainer>
      {!hasLocation && (
        <MapFooter $isDark={isDark}>
          {language === 'bg' 
            ? 'Потребителят не е добавил конкретен адрес' 
            : 'User has not added a specific address'}
        </MapFooter>
      )}
    </MapCard>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const MapCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.$isDark 
    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;
  margin-top: 24px;

  @media (max-width: 1024px) {
    margin-top: 24px;
  }
`;

const MapHeader = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};

  svg {
    color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const MapTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
`;

const LocationText = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  line-height: 1.4;
  transition: color 0.3s ease;
`;

const MapContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const MapLoading = styled.div<{ $isDark: boolean }>`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  font-size: 14px;
`;

const MapFooter = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark ? '#64748B' : '#94A3B8'};
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  font-style: italic;
`;

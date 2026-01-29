/**
 * ProfileLocationMap Component
 * خريطة موقع المستخدم في البروفايل العام
 * تعرض الموقع التقريبي إذا كان متوفراً، أو بلغاريا كاملة إذا لم يكن
 * يستخدم StaticMapEmbed مثل صفحة الإعلان
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import { logger } from '../../../../../../services/logger-service';
import StaticMapEmbed from '../../../../../../components/StaticMapEmbed';
import { GeocodingService } from '../../../../../../services/geocoding-service';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface ProfileLocationMapProps {
  user: BulgarianUser;
}

export const ProfileLocationMap: React.FC<ProfileLocationMapProps> = ({ user }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [locationData, setLocationData] = useState<{
    city: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const geocodingService = new GeocodingService();

  useEffect(() => {
    loadLocation();
  }, [user]);

  const loadLocation = async () => {
    setLoading(true);
    try {
      // Check if user has coordinates directly
      if (user.location?.coordinates?.latitude && user.location?.coordinates?.longitude) {
        setLocationData({
          city: user.location.city || user.locationData?.cityName || 'Bulgaria',
          region: user.location.region,
          coordinates: {
            lat: user.location.coordinates.latitude,
            lng: user.location.coordinates.longitude
          }
        });
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
        if (geocoded && geocoded.latitude && geocoded.longitude) {
          setLocationData({
            city: geocoded.city || address,
            region: geocoded.region,
            coordinates: {
              lat: geocoded.latitude,
              lng: geocoded.longitude
            }
          });
          setLoading(false);
          return;
        }
      }

      // Check if user has city information
      if (user.location?.city || user.locationData?.cityName) {
        const cityName = user.location?.city || user.locationData?.cityName || '';
        const cityAddress = `${cityName}, ${user.location?.region || ''}, Bulgaria`;
        const geocoded = await geocodingService.geocodeAddress(cityAddress);
        if (geocoded && geocoded.latitude && geocoded.longitude) {
          setLocationData({
            city: cityName,
            region: user.location?.region || geocoded.region,
            coordinates: {
              lat: geocoded.latitude,
              lng: geocoded.longitude
            }
          });
          setLoading(false);
          return;
        }
        
        // Even if geocoding fails, use city name
        setLocationData({
          city: cityName,
          region: user.location?.region
        });
        setLoading(false);
        return;
      }

      // No location found - show Bulgaria overview (no coordinates = full country view)
      setLocationData({
        city: language === 'bg' ? 'България' : 'Bulgaria',
        coordinates: {
          lat: 42.7339, // Center of Bulgaria
          lng: 25.4858
        }
      });
    } catch (error) {
      logger.error('Error loading location for map', error as Error);
      // Fallback to Bulgaria center
      setLocationData({
        city: language === 'bg' ? 'България' : 'Bulgaria',
        coordinates: {
          lat: 42.7339,
          lng: 25.4858
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !locationData) {
    return null; // Don't show anything while loading
  }

  return (
    <MapContainerWrapper $isDark={isDark}>
      <StaticMapEmbed
        location={{
          city: locationData.city,
          region: locationData.region,
          coordinates: locationData.coordinates,
          locationData: {
            cityName: locationData.city
          }
        } as any}
        zoom={locationData.coordinates ? 13 : 7}
        showHeader={true}
      />
    </MapContainerWrapper>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const MapContainerWrapper = styled.div<{ $isDark: boolean }>`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  margin-top: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
`;

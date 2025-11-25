import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { GarageSection } from '@/components/Profile';
import { useProfile } from './hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';
import * as S from './styles';

/**
 * My Ads Tab - Full garage with all user's cars
 * Professional Garage/Showroom display
 */
const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const params = useParams<{ userId?: string }>();
  const { userCars, isOwnProfile, loadUserCars, user } = useProfile(params.userId);

  // Get user name for title
  const userName = user?.displayName || (language === 'bg' ? 'Потребител' : 'User');

  return (
    <Container $isDark={isDark}>
      <S.ContentSection style={{ padding: 0, marginTop: 0 }}>
        {/* Full-width Garage Section */}
        <GarageSection 
          cars={((userCars || []) as any[]).map(car => ({
            ...car,
            currency: 'EUR' as const,
            createdAt: car.createdAt || new Date(),
            title: car.title || `${car.make} ${car.model}`,
            status: car.status || 'active',
            // ⚡ NEW: Mobile.de style data
            horsepower: car.horsepower || car.power,
            transmission: car.transmission || car.gearbox,
            fuelConsumption: car.fuelConsumption || car.consumption,
            co2Emissions: car.co2Emissions || car.emissions
          }))}
          userStats={user?.stats ? {
            activeListings: user.stats.activeListings,
            soldCars: (user.stats as any).soldCars || (user.stats as any).soldListings || 0,
            followers: (user.stats as any).followers || 0,
            totalListings: (user.stats as any).totalListings || user.stats.activeListings || 0,
            totalViews: user.stats.totalViews,
            totalMessages: user.stats.totalMessages
          } : undefined}
          onEdit={isOwnProfile ? (carId) => navigate(`/car/${carId}?edit=true`) : undefined}
          onDelete={isOwnProfile ? async (carId) => {
            if (window.confirm(language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure?')) {
              // Delete logic here
              loadUserCars?.();
            }
          } : undefined}
          onAddNew={isOwnProfile ? () => navigate('/sell') : undefined}
        />
      </S.ContentSection>
    </Container>
  );
};

const Container = styled.div<{ $isDark: boolean }>`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  background: var(--bg-primary);
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export default ProfileMyAds;


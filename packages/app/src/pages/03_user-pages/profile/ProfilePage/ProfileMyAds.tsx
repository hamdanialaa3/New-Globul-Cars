import React from 'react';
import { useLanguage } from '@globul-cars/coreLanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { GarageSection } from '@globul-cars/uiProfile';
import { useProfile } from './hooks/useProfile';
import * as S from './styles';

/**
 * My Ads Tab - Full garage with all user's cars
 */
const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params = useParams<{ userId?: string }>();
  const { userCars, isOwnProfile, loadUserCars } = useProfile(params.userId);

  return (
    <S.ContentSection style={{ padding: 0 }}>
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
  );
};

export default ProfileMyAds;


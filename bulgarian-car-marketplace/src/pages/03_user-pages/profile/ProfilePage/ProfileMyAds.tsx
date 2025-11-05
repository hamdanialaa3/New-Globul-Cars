import React from 'react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { GarageSection } from '../../../../components/Profile';
import { useProfile } from './hooks/useProfile';
import * as S from './styles';

/**
 * My Ads Tab - Full garage with all user's cars
 */
const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { userCars, isOwnProfile, loadUserCars } = useProfile();

  return (
    <S.ContentSection style={{ padding: 0 }}>
      {/* Full-width Garage Section */}
      <GarageSection 
        cars={((userCars || []) as any[]).map(car => ({
          ...car,
          currency: 'EUR' as const,
          createdAt: car.createdAt || new Date(),
          title: car.title || `${car.make} ${car.model}`,
          status: car.status || 'active'
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


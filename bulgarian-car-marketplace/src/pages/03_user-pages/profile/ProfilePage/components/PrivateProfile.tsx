// src/pages/ProfilePage/components/PrivateProfile.tsx
// Private Person Profile Component - Orange Theme

import React from 'react';
import styled from 'styled-components';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import { ProfileCar } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from 'lucide-react';

// Props
interface PrivateProfileProps {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

// ❌ REMOVED: ProfileHeader, AvatarSection, InfoSection, UserName, UserBio, ContactInfo, ContactItem, ActionButtons, Button
// These are now in ProfileDashboard component

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: #FF8F10;
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CarCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(255, 143, 16, 0.3);
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const CarInfo = styled.div`
  padding: 1rem;
`;

const CarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const CarPrice = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #FF8F10;
  margin: 0.5rem 0;
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
  font-size: 0.95rem;
`;

// ❌ REMOVED: TrustScoreDisplay - Now in ProfileDashboard

/**
 * Private Profile Component
 * For individual/private sellers
 * Theme: Orange (#FF8F10)
 * Features: Basic listing, contact info, trust score
 */
export const PrivateProfile: React.FC<PrivateProfileProps> = ({
  user,
  userCars,
  isOwnProfile,
  onEdit,
  onSendMessage
}) => {
  const { language } = useLanguage();
  
  if (!user) return null;

  const displayName = user.displayName || 
                      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User');
  
  const trustScore = user.trust?.score || user.verification?.trustScore || 50;

  return (
    <Container>
      {/* ❌ REMOVED: Header with Avatar - Now in ProfileDashboard */}
      
      {/* Active Listings */}
      <Section>
        <SectionTitle>
          <User />
          {language === 'bg' ? 'Активни обяви' : 'Active Listings'}
          {' '}({userCars.length})
        </SectionTitle>
        
        {userCars.length > 0 ? (
          <CarGrid>
            {userCars.map(car => (
              <CarCard key={car.id}>
                <CarImage 
                  src={car.imageUrl || car.mainImage || '/assets/images/car-placeholder.jpg'} 
                  alt={`${car.make} ${car.model}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/car-placeholder.jpg';
                  }}
                />
                <CarInfo>
                  <CarTitle>{car.make} {car.model}</CarTitle>
                  <CarPrice>€{car.price.toLocaleString()}</CarPrice>
                  <CarDetails>
                    <span>{car.year}</span>
                    <span>{car.mileage?.toLocaleString()} km</span>
                    <span>{car.fuelType || 'Petrol'}</span>
                  </CarDetails>
                </CarInfo>
              </CarCard>
            ))}
          </CarGrid>
        ) : (
          <EmptyMessage>
            {language === 'bg' 
              ? 'Няма активни обяви в момента'
              : 'No active listings at the moment'}
          </EmptyMessage>
        )}
      </Section>
    </Container>
  );
};

export default PrivateProfile;


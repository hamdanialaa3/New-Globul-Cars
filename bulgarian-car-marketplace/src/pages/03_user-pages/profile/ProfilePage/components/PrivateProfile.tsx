// src/pages/ProfilePage/components/PrivateProfile.tsx
// Private Person Profile Component - Orange Theme

import React from 'react';
import styled from 'styled-components';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';
import SimpleProfileAvatar from '../../../components/Profile/SimpleProfileAvatar';
import { ProfileCar } from '../types';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { User, Mail, Phone, MapPin, MessageCircle, Star } from 'lucide-react';

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

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AvatarSection = styled.div`
  flex-shrink: 0;
`;

const InfoSection = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserBio = styled.p`
  color: #6c757d;
  line-height: 1.6;
  margin: 1rem 0;
  font-size: 0.95rem;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 1rem 0;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: #FF8F10;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${p => p.variant === 'primary' ? `
    background: linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 143, 16, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #FF8F10;
    color: #FF8F10;
    
    &:hover {
      background: #FFF5F0;
    }
  `}
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

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

const TrustScoreDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

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
      {/* Header with Avatar */}
      <ProfileHeader>
        <AvatarSection>
          <SimpleProfileAvatar
            user={user}
            size={120}
            onClick={isOwnProfile ? onEdit : undefined}
          />
        </AvatarSection>
        
        <InfoSection>
          <UserName>
            <User size={28} />
            {displayName}
          </UserName>
          
          {user.bio && (
            <UserBio>{user.bio}</UserBio>
          )}
          
          <ContactInfo>
            {user.email && (
              <ContactItem>
                <Mail />
                {isOwnProfile ? user.email : 'Contact via message'}
              </ContactItem>
            )}
            
            {user.phoneNumber && (
              <ContactItem>
                <Phone />
                {isOwnProfile ? user.phoneNumber : 'Contact via message'}
              </ContactItem>
            )}
            
            {(user.location?.city || user.address) && (
              <ContactItem>
                <MapPin />
                {user.location?.city || user.address}
              </ContactItem>
            )}
          </ContactInfo>
          
          {/* Trust Score */}
          <TrustScoreDisplay>
            <Star fill="white" />
            {language === 'bg' ? 'Доверие' : 'Trust'}: {trustScore}/100
          </TrustScoreDisplay>
          
          {/* Action Buttons */}
          <ActionButtons>
            {isOwnProfile && (
              <Button variant="primary" onClick={onEdit}>
                Edit Profile
              </Button>
            )}
            
            {!isOwnProfile && (
              <Button variant="primary" onClick={onSendMessage}>
                <MessageCircle />
                {language === 'bg' ? 'Изпрати съобщение' : 'Send Message'}
              </Button>
            )}
          </ActionButtons>
        </InfoSection>
      </ProfileHeader>
      
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

